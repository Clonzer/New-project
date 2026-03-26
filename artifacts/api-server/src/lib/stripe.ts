import { createHmac, timingSafeEqual } from "node:crypto";

const STRIPE_API_BASE = "https://api.stripe.com/v1";

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
