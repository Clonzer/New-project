import { customFetch } from "@/lib/workspace-api-mock";

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
  shippingCost?: number | null;
};

export async function getPaymentConfig() {
  return customFetch<{ provider: string; checkoutEnabled: boolean }>("/api/payments/config", {
    credentials: "include",
  });
}

export type SponsorshipOption = {
  code: "profile" | "listing" | "profile_monthly" | "listing_monthly" | "homepage_featured" | "search_priority" | "featured" | "premium";
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
  // Use mock API for now (calculates correct amount with fees)
  return customFetch<{ url: string; sessionId: string }>("/api/payments/checkout-session", {
    method: "POST",
    body: JSON.stringify(input),
    credentials: "include",
  });
}

export async function createSponsorshipCheckoutSession(input: {
  sponsorshipType: "profile" | "listing" | "profile_monthly" | "listing_monthly" | "homepage_featured" | "search_priority" | "featured" | "premium";
  listingId?: number;
  quantity?: number;
  duration?: number; // Duration in days (7, 14, 30)
  successPath?: string;
  cancelPath?: string;
  metadata?: Record<string, any>;
}) {
  return customFetch<{ url: string; sessionId: string }>("/api/payments/sponsorship/checkout-session", {
    method: "POST",
    body: JSON.stringify(input),
    credentials: "include",
  });
}
