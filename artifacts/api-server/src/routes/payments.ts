import { Router, type IRouter } from "express";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@workspace/db";
import { checkoutSessionsTable, listingsTable, notificationsTable, ordersTable, usersTable } from "@workspace/db/schema";
import { type AuthedRequest, requireAuth } from "../lib/auth";
import {
  createStripeCheckoutSession,
  getAppUrl,
  isStripeConfigured,
  verifyStripeWebhookSignature,
} from "../lib/stripe";
import { createNotification } from "./notifications";
import { canSellerShipToCountry, getShippingEstimate } from "../lib/shipping";

const PLATFORM_FEE_PERCENT = 0.1;
const router: IRouter = Router();

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
      successUrl: `${appUrl}${successPath.startsWith("/") ? successPath : `/${successPath}`}`,
      cancelUrl: `${appUrl}${cancelPath.startsWith("/") ? cancelPath : `/${cancelPath}`}`,
      lineItems: drafts.map((draft) => ({
        name: draft.title,
        description: draft.listingId ? "Catalog order" : "Custom fabrication order",
        quantity: draft.quantity,
        unitAmountCents: Math.round((draft.totalPrice / draft.quantity) * 100),
      })),
      metadata: {
        buyerId: String(req.auth!.userId),
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

router.post("/payments/stripe/webhook", async (req, res) => {
  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from([]);
  const signature = req.headers["stripe-signature"];

  if (!verifyStripeWebhookSignature(rawBody, typeof signature === "string" ? signature : undefined)) {
    res.status(400).json({ error: "invalid_signature", message: "Stripe webhook signature verification failed." });
    return;
  }

  const event = JSON.parse(rawBody.toString("utf8")) as {
    type?: string;
    data?: { object?: { id?: string } };
  };

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
    const drafts = JSON.parse(checkoutSession.payloadJson) as NormalizedOrderDraft[];
    const [buyer] = await db
      .select({ displayName: usersTable.displayName })
      .from(usersTable)
      .where(eq(usersTable.id, checkoutSession.buyerId));

    const orderValues = drafts.map((draft) => ({
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
