import { Router, type IRouter } from "express";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@workspace/db";
import { checkoutSessionsTable, listingsTable, ordersTable, usersTable, teamMembersTable } from "@workspace/db/schema";
import { type AuthedRequest, requireAuth } from "../lib/auth";
import {
  createStripeCheckoutSession,
  createStripeConnectCheckoutSession,
  getAppUrl,
  isStripeConfigured,
  verifyStripeWebhookSignature,
} from "../lib/stripe";
import { createNotification } from "./notifications";
import { canSellerShipToCountry, getShippingEstimate } from "../lib/shipping";

const PLATFORM_FEE_PERCENT = 0.1;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const router: IRouter = Router();

const PLAN_PRICING: Record<string, { monthly: number; yearly: number; name: string; description: string; perSeat?: boolean; basePrice?: number; seatPrice?: number }> = {
  starter: { monthly: 0, yearly: 0, name: "Starter", description: "Free seller onboarding and a basic shop listing." },
  pro: { monthly: 19, yearly: 15, name: "Pro", description: "Lower fees and better seller tools for growing makers." },
  elite: { monthly: 49, yearly: 39, name: "Elite", description: "Premium shop access with top-tier seller performance benefits." },
  enterprise: {
    monthly: 0,
    yearly: 0,
    name: "Enterprise",
    description: "Team-based plan with per-seat billing for studios and organizations.",
    perSeat: true,
    basePrice: 199,
    seatPrice: 49,
  },
};

const SPONSORSHIP_OPTIONS = {
  profile: {
    code: "profile",
    name: "Profile Sponsorship",
    description: "Boost your shop placement across featured seller surfaces for 14 days.",
    unitAmountUsd: 39,
    durationDays: 14,
  },
  listing: {
    code: "listing",
    name: "Product Sponsorship",
    description: "Push one listing into sponsored marketplace placements for 14 days.",
    unitAmountUsd: 24,
    durationDays: 14,
  },
  profile_monthly: {
    code: "profile_monthly",
    name: "Profile Sponsorship - Monthly",
    description: "Boost your shop placement across featured seller surfaces for 30 days.",
    unitAmountUsd: 79,
    durationDays: 30,
  },
  listing_monthly: {
    code: "listing_monthly",
    name: "Product Sponsorship - Monthly",
    description: "Push one listing into sponsored marketplace placements for 30 days.",
    unitAmountUsd: 49,
    durationDays: 30,
  },
  homepage_featured: {
    code: "homepage_featured",
    name: "Homepage Featured",
    description: "Featured placement on homepage carousel for 7 days with premium visibility.",
    unitAmountUsd: 99,
    durationDays: 7,
  },
  search_priority: {
    code: "search_priority",
    name: "Search Priority Boost",
    description: "Priority ranking in search results for 14 days.",
    unitAmountUsd: 29,
    durationDays: 14,
  },
} as const;

type CheckoutItemInput = {
  listingId?: number | null;
  sellerId?: number | null;
  title?: string | null;
  fileUrl?: string | null;
  notes?: string | null;
  material?: string | null;
  color?: string | null;
  quantity?: number;
  unitPrice?: number | null;
};

type NormalizedOrderDraft = {
  sellerId: number;
  listingId: number | null;
  title: string;
  fileUrl: string | null;
  notes: string | null;
  material: string | null;
  color: string | null;
  quantity: number;
  unitPrice: number;
  shippingCost: number;
  totalPrice: number;
  platformFee: number;
};

type SponsorshipOptionCode = keyof typeof SPONSORSHIP_OPTIONS;

type SponsorshipPayload = {
  kind: "sponsorship";
  sponsorshipType: SponsorshipOptionCode;
  targetUserId?: number;
  targetListingId?: number;
  quantity: number;
  durationDays: number;
};

type PlanPayload = {
  kind: "plan";
  planId: "pro" | "elite" | "enterprise";
  billing: "monthly" | "yearly";
  userId: number;
  seatCount?: number; // For Enterprise plan
  organizationName?: string; // For Enterprise plan
};

function badRequest(res: any, message: string) {
  res.status(400).json({ error: "validation_error", message });
}

function normalizeQuantity(value: unknown): number {
  const quantity = Number(value ?? 1);
  return Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 0;
}

async function buildDrafts(items: CheckoutItemInput[], shippingAddress: string, buyerCountryCode?: string | null) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("At least one checkout item is required.");
  }

  const listingIds = items
    .map((item) => Number(item.listingId))
    .filter((id) => Number.isFinite(id) && id > 0);
  const listings = listingIds.length
    ? await db.select().from(listingsTable).where(inArray(listingsTable.id, listingIds))
    : [];
  const listingsById = new Map(listings.map((listing) => [listing.id, listing]));

  const drafts: NormalizedOrderDraft[] = [];

  for (const item of items) {
    const quantity = normalizeQuantity(item.quantity);
    if (!quantity) {
      throw new Error("Each checkout item must have a valid quantity.");
    }

    if (item.listingId != null) {
      const listing = listingsById.get(Number(item.listingId));
      if (!listing || !listing.isActive) {
        throw new Error(`Listing ${item.listingId} is no longer available.`);
      }
      const [seller] = await db.select().from(usersTable).where(eq(usersTable.id, listing.sellerId));
      if (!seller) {
        throw new Error("The seller for this listing no longer exists.");
      }
      if (!seller.emailVerifiedAt) {
        throw new Error("This seller has not verified their email yet, so checkout is temporarily unavailable.");
      }
      if (!canSellerShipToCountry(seller, buyerCountryCode)) {
        throw new Error("This seller does not currently ship to your selected country.");
      }
      const subtotal = listing.basePrice * quantity;
      const shippingEstimate = getShippingEstimate(seller, buyerCountryCode, subtotal, listing.shippingCost ?? 0);
      const shippingCost =
        listing.shippingCost && listing.shippingCost > 0
          ? Number((listing.shippingCost * quantity).toFixed(2))
          : shippingEstimate.cost;
      const platformFee = Number((subtotal * PLATFORM_FEE_PERCENT).toFixed(2));
      drafts.push({
        sellerId: listing.sellerId,
        listingId: listing.id,
        title: listing.title,
        fileUrl: null,
        notes: item.notes?.trim() || null,
        material: listing.material ?? (item.material?.trim() || null),
        color: listing.color ?? (item.color?.trim() || null),
        quantity,
        unitPrice: listing.basePrice,
        shippingCost,
        platformFee,
        totalPrice: Number((subtotal + shippingCost + platformFee).toFixed(2)),
      });
      continue;
    }

    const sellerId = Number(item.sellerId);
    const unitPrice = Number(item.unitPrice);
    const title = String(item.title ?? "").trim();
    if (!Number.isFinite(sellerId) || sellerId <= 0) {
      throw new Error("Custom orders require a seller.");
    }
    if (!title) {
      throw new Error("Custom orders require a project title.");
    }
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      throw new Error("Custom orders require a valid offered price.");
    }
    if (!item.fileUrl || String(item.fileUrl).trim() === "") {
      throw new Error("Custom orders require an uploaded project file.");
    }

    const [seller] = await db.select().from(usersTable).where(eq(usersTable.id, sellerId));
    if (!seller) {
      throw new Error("The selected seller no longer exists.");
    }
    if (!seller.emailVerifiedAt) {
      throw new Error("This seller has not verified their email yet, so checkout is temporarily unavailable.");
    }
    if (!canSellerShipToCountry(seller, buyerCountryCode)) {
      throw new Error("This seller does not currently ship to your selected country.");
    }

    const subtotal = unitPrice * quantity;
    const shippingEstimate = getShippingEstimate(seller, buyerCountryCode, subtotal);
    const shippingCost = shippingEstimate.cost;
    const platformFee = Number((subtotal * PLATFORM_FEE_PERCENT).toFixed(2));
    drafts.push({
      sellerId,
      listingId: null,
      title,
      fileUrl: String(item.fileUrl),
      notes: item.notes?.trim() || null,
      material: item.material?.trim() || null,
      color: item.color?.trim() || null,
      quantity,
      unitPrice,
      shippingCost,
      platformFee,
      totalPrice: Number((subtotal + shippingCost + platformFee).toFixed(2)),
    });
  }

  if (!shippingAddress.trim()) {
    throw new Error("A shipping address is required.");
  }

  return drafts;
}

router.get("/payments/config", (_req, res) => {
  res.json({ provider: "stripe", checkoutEnabled: isStripeConfigured() });
});

router.get("/payments/sponsorship-options", (_req, res) => {
  res.json({ options: Object.values(SPONSORSHIP_OPTIONS) });
});

router.get("/payments/stripe/checkout", requireAuth, async (req: AuthedRequest, res) => {
  if (!isStripeConfigured()) {
    res.status(503).json({ error: "payments_unavailable", message: "Stripe is not configured yet. Set STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, and APP_URL." });
    return;
  }

  const planId = String(req.query.plan ?? "starter");
  const billing = String(req.query.billing ?? "monthly") === "yearly" ? "yearly" : "monthly";
  const plan = PLAN_PRICING[planId];
  if (!plan) {
    res.status(400).json({ error: "invalid_plan", message: "Unknown plan selected." });
    return;
  }
  if (planId === "starter") {
    res.redirect(303, "/settings?section=payment");
    return;
  }

  const [buyer] = await db.select().from(usersTable).where(eq(usersTable.id, req.auth!.userId));
  if (!buyer) {
    res.status(404).json({ error: "not_found", message: "Buyer account not found." });
    return;
  }

  const appUrl = getAppUrl();
  if (!appUrl) {
    res.status(503).json({ error: "payments_unavailable", message: "APP_URL or RENDER_EXTERNAL_URL must be available before checkout can start." });
    return;
  }

  try {
    let priceUsd: number;
    let lineItems: { name: string; description: string; quantity: number; unitAmountCents: number }[] = [];
    let seatCount = 1;
    let organizationName: string | undefined;

    // Handle Enterprise seat-based pricing
    if (planId === "enterprise" && plan.perSeat) {
      seatCount = Math.max(1, Math.min(100, parseInt(String(req.query.seats ?? "5"), 10) || 5));
      organizationName = String(req.query.organization ?? "").trim() || undefined;
      const basePrice = plan.basePrice || 199;
      const seatPrice = plan.seatPrice || 49;
      priceUsd = basePrice + (seatPrice * seatCount);

      lineItems = [
        {
          name: `${plan.name} Plan - Base`,
          description: `Base platform fee for ${organizationName || "Organization"}`,
          quantity: 1,
          unitAmountCents: Math.round(basePrice * 100),
        },
        {
          name: `${plan.name} Plan - Seats`,
          description: `${seatCount} team member seats`,
          quantity: 1,
          unitAmountCents: Math.round(seatPrice * seatCount * 100),
        },
      ];
    } else {
      priceUsd = billing === "yearly" ? plan.yearly : plan.monthly;
      lineItems = [
        {
          name: `${plan.name} Plan`,
          description: plan.description,
          quantity: 1,
          unitAmountCents: Math.round(priceUsd * 100),
        },
      ];
    }

    const stripeSession = await createStripeCheckoutSession({
      customerEmail: buyer.email,
      successUrl: `${appUrl}/dashboard?checkout=success&plan=${planId}`,
      cancelUrl: `${appUrl}/pricing`,
      lineItems,
      metadata: {
        userId: String(req.auth!.userId),
        planId,
        billing,
        seatCount: String(seatCount),
        organizationName: organizationName || "",
      },
    });

    const payload: PlanPayload = {
      kind: "plan",
      planId: planId as "pro" | "elite" | "enterprise",
      billing,
      userId: req.auth!.userId,
      seatCount,
      organizationName,
    };

    await db.insert(checkoutSessionsTable).values({
      buyerId: req.auth!.userId,
      provider: "stripe",
      providerSessionId: stripeSession.id,
      status: "created",
      currency: "usd",
      amountTotal: priceUsd,
      shippingAddress: "plan upgrade",
      payloadJson: JSON.stringify(payload),
    });

    res.redirect(303, stripeSession.url);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start plan checkout.";
    res.status(400).json({ error: "checkout_error", message });
  }
});

router.post("/payments/checkout-session", requireAuth, async (req: AuthedRequest, res) => {
  const shippingAddress = String(req.body?.shippingAddress ?? "").trim();
  const successPath = String(req.body?.successPath ?? "/dashboard?checkout=success");
  const cancelPath = String(req.body?.cancelPath ?? "/cart?checkout=cancelled");

  if (!isStripeConfigured()) {
    res.status(503).json({
      error: "payments_unavailable",
      message: "Stripe is not configured yet. Set STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, and APP_URL.",
    });
    return;
  }

  try {
    const [buyer] = await db.select().from(usersTable).where(eq(usersTable.id, req.auth!.userId));
    if (!buyer) {
      res.status(404).json({ error: "not_found", message: "Buyer account not found." });
      return;
    }
    const drafts = await buildDrafts(req.body?.items as CheckoutItemInput[], shippingAddress, buyer.countryCode);
    const amountTotal = Number(drafts.reduce((sum, draft) => sum + draft.totalPrice, 0).toFixed(2));
    const totalPlatformFee = Number(drafts.reduce((sum, draft) => sum + draft.platformFee, 0).toFixed(2));

    const appUrl = getAppUrl();
    if (!appUrl) {
      res.status(503).json({
        error: "payments_unavailable",
        message: "APP_URL or RENDER_EXTERNAL_URL must be available before checkout can start.",
      });
      return;
    }

    // Group drafts by seller to handle multi-vendor checkout
    const draftsBySeller = new Map<number, NormalizedOrderDraft[]>();
    for (const draft of drafts) {
      if (!draftsBySeller.has(draft.sellerId)) {
        draftsBySeller.set(draft.sellerId, []);
      }
      draftsBySeller.get(draft.sellerId)!.push(draft);
    }

    // For now, we'll handle single-vendor checkout with Stripe Connect
    // Multi-vendor checkout would require separate payment intents per seller
    if (draftsBySeller.size > 1) {
      res.status(400).json({
        error: "multi_vendor_not_supported",
        message: "Multi-vendor checkout is not yet supported. Please checkout with one seller at a time.",
      });
      return;
    }

    const [sellerId, sellerDrafts] = draftsBySeller.entries().next().value;
    const [seller] = await db.select().from(usersTable).where(eq(usersTable.id, sellerId));

    // Check if seller has active Stripe Connect account
    if (!seller?.stripeConnectId || seller.stripeAccountStatus !== "active") {
      res.status(400).json({
        error: "seller_not_ready",
        message: "This seller does not have a payment method configured. Please contact the seller.",
      });
      return;
    }

    // Calculate platform fee in cents
    const applicationFeeAmount = Math.round(totalPlatformFee * 100);

    // Create Stripe Connect checkout session with destination charges
    const stripeSession = await createStripeConnectCheckoutSession({
      accountId: seller.stripeConnectId,
      customerEmail: buyer.email,
      successUrl: `${appUrl}${successPath.startsWith("/") ? successPath : `/${successPath}`}`,
      cancelUrl: `${appUrl}${cancelPath.startsWith("/") ? cancelPath : `/${cancelPath}`}`,
      lineItems: sellerDrafts.map((draft) => ({
        name: draft.title,
        description: draft.listingId ? "Catalog order" : "Custom fabrication order",
        unitAmountCents: Math.round((draft.totalPrice / draft.quantity) * 100),
        quantity: draft.quantity,
      })),
      applicationFeeAmount,
      metadata: {
        buyerId: String(req.auth!.userId),
        sellerId: String(sellerId),
      },
    });

    await db.insert(checkoutSessionsTable).values({
      buyerId: req.auth!.userId,
      provider: "stripe",
      providerSessionId: stripeSession.id,
      status: "created",
      currency: "usd",
      amountTotal,
      shippingAddress,
      payloadJson: JSON.stringify(drafts),
    });

    res.status(201).json({ url: stripeSession.url, sessionId: stripeSession.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start checkout.";
    badRequest(res, message);
  }
});

router.post("/payments/sponsorship/checkout-session", requireAuth, async (req: AuthedRequest, res) => {
  if (!isStripeConfigured()) {
    res.status(503).json({
      error: "payments_unavailable",
      message: "Stripe is not configured yet. Set STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, and APP_URL.",
    });
    return;
  }

  const sponsorshipType = String(req.body?.sponsorshipType ?? "").trim().toLowerCase() as SponsorshipOptionCode;
  const option = SPONSORSHIP_OPTIONS[sponsorshipType];
  if (!option) {
    badRequest(res, "Choose a valid sponsorship type.");
    return;
  }

  const quantity = Math.max(1, Math.floor(Number(req.body?.quantity ?? 1) || 1));
  const successPath = String(req.body?.successPath ?? "/pricing?sponsorship=success");
  const cancelPath = String(req.body?.cancelPath ?? "/pricing?sponsorship=cancelled");

  try {
    const [buyer] = await db.select().from(usersTable).where(eq(usersTable.id, req.auth!.userId));
    if (!buyer) {
      res.status(404).json({ error: "not_found", message: "Account not found." });
      return;
    }

    let targetListingId: number | undefined;
    let targetUserId: number | undefined;

    if (sponsorshipType === "profile") {
      if (buyer.role !== "seller" && buyer.role !== "both") {
        res.status(403).json({ error: "seller_account_required", message: "Only seller accounts can sponsor a shop profile." });
        return;
      }
      targetUserId = buyer.id;
    } else {
      const listingId = Number(req.body?.listingId);
      if (!Number.isFinite(listingId) || listingId <= 0) {
        badRequest(res, "Choose a listing to sponsor.");
        return;
      }
      const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, listingId));
      if (!listing || listing.sellerId !== buyer.id) {
        res.status(404).json({ error: "not_found", message: "That listing does not belong to this account." });
        return;
      }
      targetListingId = listing.id;
    }

    const appUrl = getAppUrl();
    if (!appUrl) {
      res.status(503).json({
        error: "payments_unavailable",
        message: "APP_URL or RENDER_EXTERNAL_URL must be available before checkout can start.",
      });
      return;
    }

    const stripeSession = await createStripeCheckoutSession({
      customerEmail: buyer.email,
      successUrl: `${appUrl}/pricing?checkout=success&sponsorship=${sponsorshipType}`,
      cancelUrl: `${appUrl}/pricing?sponsorship=cancelled`,
      lineItems: [
        {
          name: option.name,
          description: option.description,
          quantity,
          unitAmountCents: Math.round(option.unitAmountUsd * 100),
        },
      ],
      metadata: {
        buyerId: String(req.auth!.userId),
        sponsorshipType,
      },
    });

    const amountTotal = Number((option.unitAmountUsd * quantity).toFixed(2));
    const payload: SponsorshipPayload = {
      kind: "sponsorship",
      sponsorshipType,
      targetUserId,
      targetListingId,
      quantity,
      durationDays: option.durationDays,
    };

    await db.insert(checkoutSessionsTable).values({
      buyerId: req.auth!.userId,
      provider: "stripe",
      providerSessionId: stripeSession.id,
      status: "created",
      currency: "usd",
      amountTotal,
      shippingAddress: "digital sponsorship",
      payloadJson: JSON.stringify(payload),
    });

    res.status(201).json({ url: stripeSession.url, sessionId: stripeSession.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start sponsorship checkout.";
    badRequest(res, message);
  }
});

router.post("/payments/stripe/webhook", async (req, res) => {
  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from([]);
  const signature = req.headers["stripe-signature"];

  if (!verifyStripeWebhookSignature(rawBody, typeof signature === "string" ? signature : undefined)) {
    res.status(400).json({ error: "invalid_signature", message: "Stripe webhook signature verification failed." });
    return;
  }

  const event = JSON.parse(rawBody.toString("utf8")) as {
    type?: string;
    data?: { object?: { id?: string; account?: string } };
  };

  // Handle Stripe Connect account events
  if (event.type === "account.updated") {
    const accountId = event.data?.object?.id;
    if (!accountId) {
      res.status(400).json({ error: "invalid_payload", message: "Webhook payload missing account id." });
      return;
    }

    // Update user's Stripe Connect status
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.stripeConnectId, accountId));

    if (user) {
      const accountData = event.data.object as any;
      let newStatus: "not_started" | "pending" | "active" | "restricted" | "disabled" = "pending";

      if (accountData.details_submitted && accountData.charges_enabled && accountData.payouts_enabled) {
        newStatus = "active";
      } else if (accountData.details_submitted) {
        newStatus = "restricted";
      } else if (accountData.requirements?.disabled_reason) {
        newStatus = "disabled";
      }

      await db
        .update(usersTable)
        .set({ stripeAccountStatus: newStatus })
        .where(eq(usersTable.id, user.id));
    }

    res.status(200).json({ ok: true });
    return;
  }

  // Handle payment intent events for Connect
  if (event.type === "payment_intent.succeeded" || event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data?.object as any;
    const paymentIntentId = paymentIntent?.id;
    
    if (paymentIntentId) {
      // Update order status based on payment intent
      const [order] = await db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.stripePaymentIntentId, paymentIntentId));

      if (order) {
        if (event.type === "payment_intent.succeeded") {
          await db
            .update(ordersTable)
            .set({ 
              stripeChargeId: paymentIntent.latest_charge || paymentIntent.charges?.data?.[0]?.id || null,
            })
            .where(eq(ordersTable.id, order.id));
        } else if (event.type === "payment_intent.payment_failed") {
          // Handle failed payment - could update order status or notify seller
          await createNotification({
            userId: order.buyerId,
            type: "system",
            title: "Payment failed",
            body: `Your payment for order #${order.id} failed. Please try again.`,
            url: `/dashboard?order=${order.id}`,
          });
        }
      }
    }

    res.status(200).json({ ok: true });
    return;
  }

  // Handle charge refunded events
  if (event.type === "charge.refunded") {
    const charge = event.data?.object as any;
    const chargeId = charge?.id;
    
    if (chargeId) {
      const [order] = await db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.stripeChargeId, chargeId));

      if (order) {
        // Notify seller about refund
        await createNotification({
          userId: order.sellerId,
          type: "system",
          title: "Order refunded",
          body: `Order #${order.id} has been refunded.`,
          url: `/dashboard?order=${order.id}`,
        });

        // Could also update order status to 'refunded' if you add that status
      }
    }

    res.status(200).json({ ok: true });
    return;
  }

  // Handle checkout session events (existing logic)
  const sessionId = event.data?.object?.id;
  if (!sessionId) {
    res.status(400).json({ error: "invalid_payload", message: "Webhook payload missing session id." });
    return;
  }

  const [checkoutSession] = await db
    .select()
    .from(checkoutSessionsTable)
    .where(eq(checkoutSessionsTable.providerSessionId, sessionId));

  if (!checkoutSession) {
    res.status(200).json({ ok: true });
    return;
  }

  if (event.type === "checkout.session.completed" && checkoutSession.status !== "completed") {
    const payload = JSON.parse(checkoutSession.payloadJson) as NormalizedOrderDraft[] | SponsorshipPayload | PlanPayload;

    if (Array.isArray(payload)) {
      const [buyer] = await db
        .select({ displayName: usersTable.displayName })
        .from(usersTable)
        .where(eq(usersTable.id, checkoutSession.buyerId));

      // Extract Stripe payment intent ID from the checkout session event
      const paymentIntentId = (event.data as any)?.object?.payment_intent;
      const chargeId = (event.data as any)?.object?.payment_intent?.latest_charge || (event.data as any)?.object?.payment_intent;

      const orderValues = payload.map((draft) => ({
        buyerId: checkoutSession.buyerId,
        sellerId: draft.sellerId,
        listingId: draft.listingId,
        title: draft.title,
        fileUrl: draft.fileUrl,
        notes: draft.notes,
        material: draft.material,
        color: draft.color,
        quantity: draft.quantity,
        unitPrice: draft.unitPrice,
        platformFee: draft.platformFee,
        shippingCost: draft.shippingCost,
        totalPrice: draft.totalPrice,
        status: "pending" as const,
        shippingAddress: checkoutSession.shippingAddress,
        stripePaymentIntentId: paymentIntentId || null,
        stripeChargeId: chargeId || null,
      }));
      const insertedOrders = await db.insert(ordersTable).values(orderValues).returning();

      const buyerName = buyer?.displayName ?? "Customer";
      for (const order of insertedOrders) {
        await createNotification({
          userId: order.sellerId,
          actorId: checkoutSession.buyerId,
          type: "order",
          title: "New order received",
          body: `${buyerName} placed an order for ${order.title}.`,
          url: `/dashboard?order=${order.id}`,
        });

        await createNotification({
          userId: order.buyerId,
          actorId: order.sellerId,
          type: "order_update",
          title: "Order confirmed",
          body: `Your order for ${order.title} is confirmed and waiting on seller processing.`,
          url: `/dashboard?order=${order.id}`,
        });
      }
    } else if (payload.kind === "sponsorship") {
      const extensionMs = payload.durationDays * payload.quantity * DAY_IN_MS;
      let notificationTitle = "";
      let notificationBody = "";
      let notificationUrl = "";

      // Handle profile sponsorships (both 14-day and 30-day)
      if ((payload.sponsorshipType === "profile" || payload.sponsorshipType === "profile_monthly") && payload.targetUserId) {
        const [currentUser] = await db.select().from(usersTable).where(eq(usersTable.id, payload.targetUserId));
        const base = currentUser?.profileSponsoredUntil && currentUser.profileSponsoredUntil > new Date()
          ? currentUser.profileSponsoredUntil.getTime()
          : Date.now();
        await db
          .update(usersTable)
          .set({ profileSponsoredUntil: new Date(base + extensionMs) })
          .where(eq(usersTable.id, payload.targetUserId));
        
        notificationTitle = "Profile sponsorship activated";
        notificationBody = `Your shop profile is now sponsored for ${payload.durationDays} days.`;
        notificationUrl = "/shop";
      }
      
      // Handle listing sponsorships (both 14-day and 30-day)
      if ((payload.sponsorshipType === "listing" || payload.sponsorshipType === "listing_monthly") && payload.targetListingId) {
        const [currentListing] = await db.select().from(listingsTable).where(eq(listingsTable.id, payload.targetListingId));
        const base = currentListing?.sponsoredUntil && currentListing.sponsoredUntil > new Date()
          ? currentListing.sponsoredUntil.getTime()
          : Date.now();
        await db
          .update(listingsTable)
          .set({ sponsoredUntil: new Date(base + extensionMs) })
          .where(eq(listingsTable.id, payload.targetListingId));
        
        notificationTitle = "Product sponsorship activated";
        notificationBody = `Your listing is now sponsored for ${payload.durationDays} days.`;
        notificationUrl = `/listings/${payload.targetListingId}`;
      }

      // Handle homepage featured sponsorship
      if (payload.sponsorshipType === "homepage_featured" && payload.targetUserId) {
        const [currentUser] = await db.select().from(usersTable).where(eq(usersTable.id, payload.targetUserId));
        const base = currentUser?.sponsoredUntil && currentUser.sponsoredUntil > new Date()
          ? currentUser.sponsoredUntil.getTime()
          : Date.now();
        await db
          .update(usersTable)
          .set({ sponsoredUntil: new Date(base + extensionMs), featured: true })
          .where(eq(usersTable.id, payload.targetUserId));
        
        notificationTitle = "Homepage feature activated";
        notificationBody = `Your shop is now featured on the homepage for ${payload.durationDays} days.`;
        notificationUrl = "/shop";
      }

      // Handle search priority sponsorship
      if (payload.sponsorshipType === "search_priority" && payload.targetUserId) {
        const [currentUser] = await db.select().from(usersTable).where(eq(usersTable.id, payload.targetUserId));
        // Store search priority until date (could add a new column if needed)
        const base = currentUser?.sponsoredUntil && currentUser.sponsoredUntil > new Date()
          ? currentUser.sponsoredUntil.getTime()
          : Date.now();
        await db
          .update(usersTable)
          .set({ sponsoredUntil: new Date(base + extensionMs) })
          .where(eq(usersTable.id, payload.targetUserId));
        
        notificationTitle = "Search priority activated";
        notificationBody = `Your listings now have priority in search results for ${payload.durationDays} days.`;
        notificationUrl = "/shop";
      }

      // Send automatic notification for sponsorship
      if (payload.targetUserId && notificationTitle) {
        await createNotification({
          userId: payload.targetUserId,
          type: "system",
          title: notificationTitle,
          body: notificationBody,
          url: notificationUrl,
        });
      }
    } else if (payload.kind === "plan") {
      // Base update for all plans
      const updateData: Partial<typeof usersTable.$inferInsert> = {
        planTier: payload.planId,
      };

      // Enterprise-specific: Set up team owner and seat count
      if (payload.planId === "enterprise") {
        updateData.isTeamOwner = true;
        updateData.seatCount = payload.seatCount || 1;
        if (payload.organizationName) {
          updateData.organizationName = payload.organizationName;
        }

        // Create owner as first team member
        await db.insert(teamMembersTable).values({
          ownerId: payload.userId,
          userId: payload.userId,
          role: "owner",
          status: "active",
          joinedAt: new Date(),
        });

        // Send enterprise-specific notification
        await createNotification({
          userId: payload.userId,
          type: "system",
          title: "Enterprise plan activated",
          body: `Your Enterprise plan is active with ${payload.seatCount || 1} seats. Invite your team from settings.`,
          url: "/settings?section=team",
        });
      } else {
        // Standard plan notification
        await createNotification({
          userId: payload.userId,
          type: "system",
          title: "Plan upgraded",
          body: `Your account is now on the ${payload.planId} plan.`,
          url: "/settings?section=payment",
        });
      }

      await db
        .update(usersTable)
        .set(updateData)
        .where(eq(usersTable.id, payload.userId));
    }

    await db
      .update(checkoutSessionsTable)
      .set({ status: "completed", completedAt: new Date(), updatedAt: new Date() })
      .where(eq(checkoutSessionsTable.id, checkoutSession.id));

    res.status(200).json({ ok: true });
    return;
  }

  if (event.type === "checkout.session.expired") {
    await db
      .update(checkoutSessionsTable)
      .set({ status: "expired", updatedAt: new Date() })
      .where(and(eq(checkoutSessionsTable.id, checkoutSession.id), eq(checkoutSessionsTable.status, "created")));
  }

  res.status(200).json({ ok: true });
});

export default router;
