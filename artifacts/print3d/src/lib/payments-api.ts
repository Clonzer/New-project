import { customFetch } from "@workspace/api-client-react";

export type CheckoutItemPayload = {
  listingId?: number | null;
  sellerId?: number | null;
  title?: string | null;
  fileUrl?: string | null;
  notes?: string | null;
  material?: string | null;
  color?: string | null;
  quantity: number;
  unitPrice?: number | null;
};

export async function getPaymentConfig() {
  return customFetch<{ provider: string; checkoutEnabled: boolean }>("/api/payments/config", {
    credentials: "include",
  });
}

export async function createCheckoutSession(input: {
  shippingAddress: string;
  items: CheckoutItemPayload[];
  successPath?: string;
  cancelPath?: string;
}) {
  return customFetch<{ url: string; sessionId: string }>("/api/payments/checkout-session", {
    method: "POST",
    body: JSON.stringify(input),
    credentials: "include",
  });
}
