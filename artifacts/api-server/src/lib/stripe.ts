import { createHmac, timingSafeEqual } from "node:crypto";
import Stripe from "stripe";

const STRIPE_API_BASE = "https://api.stripe.com/v1";

// Initialize Stripe SDK
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env["STRIPE_SECRET_KEY"]?.trim();
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY must be configured.");
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: "2025-01-27.acacia",
    });
  }
  return stripeInstance;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} must be configured.`);
  }
  return value;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env["STRIPE_SECRET_KEY"] && process.env["STRIPE_WEBHOOK_SECRET"] && getAppUrl());
}

export function getAppUrl(): string | null {
  const explicit = process.env["APP_URL"]?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const renderUrl = process.env["RENDER_EXTERNAL_URL"]?.trim();
  if (renderUrl) {
    return renderUrl.replace(/\/$/, "");
  }

  return null;
}

export type StripeCheckoutLineItem = {
  name: string;
  description?: string | null;
  unitAmountCents: number;
  quantity: number;
};

export async function createStripeCheckoutSession(params: {
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  lineItems: StripeCheckoutLineItem[];
  metadata?: Record<string, string>;
}) {
  const secretKey = getRequiredEnv("STRIPE_SECRET_KEY");
  const body = new URLSearchParams();
  body.set("mode", "payment");
  body.set("success_url", params.successUrl);
  body.set("cancel_url", params.cancelUrl);
  body.set("customer_email", params.customerEmail);
  body.set("billing_address_collection", "required");
  body.set("shipping_address_collection[allowed_countries][0]", "US");
  body.set("shipping_address_collection[allowed_countries][1]", "GB");
  body.set("shipping_address_collection[allowed_countries][2]", "CA");
  body.set("shipping_address_collection[allowed_countries][3]", "AU");

  params.lineItems.forEach((item, index) => {
    body.set(`line_items[${index}][price_data][currency]`, "usd");
    body.set(`line_items[${index}][price_data][unit_amount]`, String(item.unitAmountCents));
    body.set(`line_items[${index}][price_data][product_data][name]`, item.name);
    if (item.description) {
      body.set(`line_items[${index}][price_data][product_data][description]`, item.description);
    }
    body.set(`line_items[${index}][quantity]`, String(item.quantity));
  });

  Object.entries(params.metadata ?? {}).forEach(([key, value]) => {
    body.set(`metadata[${key}]`, value);
  });

  const response = await fetch(`${STRIPE_API_BASE}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = (await response.json()) as {
    id?: string;
    url?: string;
    error?: { message?: string };
  };

  if (!response.ok || !data.id || !data.url) {
    throw new Error(data.error?.message || `Stripe session creation failed with ${response.status}.`);
  }

  return {
    id: data.id,
    url: data.url,
  };
}

function secureCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export function verifyStripeWebhookSignature(rawBody: Buffer, signatureHeader?: string): boolean {
  const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"]?.trim();
  if (!webhookSecret || !signatureHeader) return false;

  const timestamp = signatureHeader
    .split(",")
    .find((part) => part.startsWith("t="))
    ?.slice(2);
  const signatures = signatureHeader
    .split(",")
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3));

  if (!timestamp || signatures.length === 0) {
    return false;
  }

  const expected = createHmac("sha256", webhookSecret)
    .update(`${timestamp}.${rawBody.toString("utf8")}`, "utf8")
    .digest("hex");

  return signatures.some((candidate) => secureCompare(candidate, expected));
}

// Stripe Connect Functions

export async function createStripeConnectAccount(params: {
  email: string;
  countryCode?: string;
  businessType?: "individual" | "company";
}): Promise<{ accountId: string }> {
  const stripe = getStripe();
  const account = await stripe.accounts.create({
    type: "express",
    country: params.countryCode || "US",
    email: params.email,
    business_type: params.businessType || "individual",
    capabilities: {
      transfers: { requested: true },
      card_payments: { requested: true },
    },
    settings: {
      payouts: {
        schedule: {
          interval: "manual",
        },
      },
    },
    business_profile: {
      url: `${getAppUrl()}/shop`,
    },
  });

  return { accountId: account.id };
}

export async function createStripeAccountLink(params: {
  accountId: string;
  refreshUrl: string;
  returnUrl: string;
}): Promise<{ url: string }> {
  const stripe = getStripe();
  const accountLink = await stripe.accountLinks.create({
    account: params.accountId,
    refresh_url: params.refreshUrl,
    return_url: params.returnUrl,
    type: "account_onboarding",
  });

  return { url: accountLink.url };
}

export async function getStripeAccountStatus(accountId: string): Promise<{
  status: "not_started" | "pending" | "active" | "restricted" | "disabled";
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  requirements?: any;
}> {
  const stripe = getStripe();
  const account = await stripe.accounts.retrieve(accountId);

  let status: "not_started" | "pending" | "active" | "restricted" | "disabled" = "pending";

  if (account.details_submitted && account.charges_enabled && account.payouts_enabled) {
    status = "active";
  } else if (account.details_submitted) {
    status = "restricted";
  } else if (account.requirements?.disabled_reason) {
    status = "disabled";
  } else {
    status = "pending";
  }

  return {
    status,
    detailsSubmitted: account.details_submitted || false,
    chargesEnabled: account.charges_enabled || false,
    payoutsEnabled: account.payouts_enabled || false,
    requirements: account.requirements,
  };
}

export async function createStripeConnectCheckoutSession(params: {
  accountId: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  lineItems: StripeCheckoutLineItem[];
  applicationFeeAmount: number; // in cents
  metadata?: Record<string, string>;
}): Promise<{ id: string; url: string }> {
  const stripe = getStripe();
  
  const lineItemsParams = params.lineItems.map((item) => ({
    price_data: {
      currency: "usd",
      unit_amount: item.unitAmountCents,
      product_data: {
        name: item.name,
        description: item.description || undefined,
      },
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_intent_data: {
      application_fee_amount: params.applicationFeeAmount,
      transfer_data: {
        destination: params.accountId,
      },
      metadata: params.metadata,
    },
    mode: "payment",
    customer_email: params.customerEmail,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    line_items: lineItemsParams,
  });

  return {
    id: session.id,
    url: session.url!,
  };
}

export async function constructWebhookEvent(payload: Buffer, signature: string): Promise<Stripe.Event> {
  const stripe = getStripe();
  const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"]?.trim();
  
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET must be configured.");
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
