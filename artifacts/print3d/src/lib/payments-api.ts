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

export type SponsorshipOption = {
  code: "profile" | "listing";
  name: string;
  description: string;
  unitAmountUsd: number;
  durationDays: number;
};

export async function getSponsorshipOptions() {
  return customFetch<{ options: SponsorshipOption[] }>("/api/payments/sponsorship-options", {
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

export async function createSponsorshipCheckoutSession(input: {
  sponsorshipType: "profile" | "listing";
  listingId?: number;
  quantity?: number;
  successPath?: string;
  cancelPath?: string;
}) {
  return customFetch<{ url: string; sessionId: string }>("/api/payments/sponsorship/checkout-session", {
    method: "POST",
    body: JSON.stringify(input),
    credentials: "include",
  });
}
