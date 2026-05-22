import { buildApiUrl, getApiBaseUrl } from "@/lib/api-url";
import { withApiFetchOptions } from "@/lib/api-fetch";

const API_BASE_URL = getApiBaseUrl();

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
  try {
    return await fetchApi<{ provider: string; checkoutEnabled: boolean }>("/api/payments/config");
  } catch (error) {
    console.warn("Payments config API unavailable:", error);
    return {
      provider: "stripe",
      checkoutEnabled: Boolean(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY),
    };
  }
}

export type SponsorshipOption = {
  code: "profile" | "listing" | "profile_monthly" | "listing_monthly" | "homepage_featured" | "search_priority" | "featured" | "premium";
  name: string;
  description: string;
  unitAmountUsd: number;
  durationDays: number;
};

export async function getSponsorshipOptions() {
  return fetchApi<{ options: SponsorshipOption[] }>("/api/payments/sponsorship-options");
}

async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  const url = API_BASE_URL ? buildApiUrl(path) : path;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };

  const response = await fetch(url, withApiFetchOptions(url, {
    ...init,
    headers,
  }));

  const text = await response.text();
  let data: any = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      data = { text };
    }
  }

  if (!response.ok) {
    const errorMessage = data?.message || data?.error || response.statusText || "Request failed.";
    const error = new Error(errorMessage);
    (error as any).status = response.status;
    (error as any).response = data;
    throw error;
  }

  return data as T;
}

export async function createCheckoutSession(input: {
  shippingAddress: string;
  items: CheckoutItemPayload[];
  successPath?: string;
  cancelPath?: string;
}) {
  return fetchApi<{ url: string; sessionId: string }>("/api/payments/checkout-session", {
    method: "POST",
    body: JSON.stringify(input),
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
  return fetchApi<{ url: string; sessionId: string }>("/api/payments/sponsorship/checkout-session", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
