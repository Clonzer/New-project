import { supabase } from "@/lib/supabase";
import { buildApiUrl } from "@/lib/api-url";

export type StripeConnectAccountView = {
  hasAccount: boolean;
  accountId?: string;
  status?: string;
  detailsSubmitted?: boolean;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
};

const provider = String(import.meta.env.VITE_STRIPE_CONNECT_PROVIDER || "supabase").trim().toLowerCase();

function getSupabaseFunctionsBase(): string {
  const base = String(import.meta.env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
  if (!base) {
    throw new Error("VITE_SUPABASE_URL is not configured.");
  }
  return `${base}/functions/v1`;
}

async function getAccessToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) {
    throw new Error("Not authenticated.");
  }
  return token;
}

async function invokeSupabaseFunction<T>(name: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const response = await fetch(`${getSupabaseFunctionsBase()}/${name}`, {
    method: "POST",
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string> | undefined),
    },
    body: init?.body ?? "{}",
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : { error: await response.text() };

  if (!response.ok) {
    const message = payload?.message || payload?.error || `Request failed (${response.status}).`;
    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return payload as T;
}

async function readExpressJson<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    const message = text.trim().startsWith("<!DOCTYPE")
      ? "The API returned the site shell instead of JSON. Cloudflare is not routing /api to a backend — use VITE_STRIPE_CONNECT_PROVIDER=supabase or proxy /api."
      : text || `Unexpected response (${response.status}).`;
    throw new Error(message);
  }

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || result.error || `Request failed (${response.status}).`);
  }

  return result as T;
}

function mapSupabaseStatus(result: {
  accountId?: string;
  status?: string;
  onboardingComplete?: boolean;
  readyToReceivePayments?: boolean;
}): StripeConnectAccountView {
  const active = result.status === "active" || Boolean(result.readyToReceivePayments);
  return {
    hasAccount: true,
    accountId: result.accountId,
    status: result.status || (active ? "active" : "pending"),
    detailsSubmitted: Boolean(result.onboardingComplete),
    chargesEnabled: active,
    payoutsEnabled: active,
  };
}

export function isSupabaseStripeConnectProvider(): boolean {
  return provider !== "express";
}

export async function fetchStripeConnectAccountStatus(): Promise<StripeConnectAccountView> {
  if (isSupabaseStripeConnectProvider()) {
    try {
      const result = await invokeSupabaseFunction<{
        accountId: string;
        status: string;
        onboardingComplete?: boolean;
        readyToReceivePayments?: boolean;
      }>("get-account-status");

      return mapSupabaseStatus(result);
    } catch (error: any) {
      if (error?.status === 404) {
        return { hasAccount: false };
      }
      throw error;
    }
  }

  const token = await getAccessToken();
  const response = await fetch(buildApiUrl("/api/stripe-connect/account-status"), {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });

  const result = await readExpressJson<{
    hasAccount: boolean;
    accountId?: string;
    status?: string;
    detailsSubmitted?: boolean;
    chargesEnabled?: boolean;
    payoutsEnabled?: boolean;
  }>(response);

  return {
    hasAccount: result.hasAccount,
    accountId: result.accountId,
    status: result.status,
    detailsSubmitted: result.detailsSubmitted,
    chargesEnabled: result.chargesEnabled,
    payoutsEnabled: result.payoutsEnabled,
  };
}

export async function startStripeConnectOnboarding(input?: {
  displayName?: string;
  contactEmail?: string;
  country?: string;
}): Promise<{ url: string; accountId?: string }> {
  if (isSupabaseStripeConnectProvider()) {
    let hasAccount = false;

    try {
      await invokeSupabaseFunction("get-account-status");
      hasAccount = true;
    } catch (error: any) {
      if (error?.status !== 404) {
        throw error;
      }
    }

    if (!hasAccount) {
      const { data: { user } } = await supabase.auth.getUser();
      await invokeSupabaseFunction<{ accountId: string }>("create-connected-account", {
        body: JSON.stringify({
          displayName: input?.displayName || user?.user_metadata?.full_name || user?.email,
          contactEmail: input?.contactEmail || user?.email,
          country: (input?.country || "gb").toLowerCase(),
        }),
      });
    }

    const link = await invokeSupabaseFunction<{ url: string }>("create-account-link");
    return { url: link.url };
  }

  const token = await getAccessToken();
  const response = await fetch(buildApiUrl("/api/stripe-connect/onboarding/start"), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });

  return readExpressJson(response);
}

export async function refreshStripeConnectOnboarding(): Promise<{ url: string }> {
  if (isSupabaseStripeConnectProvider()) {
    const link = await invokeSupabaseFunction<{ url: string }>("create-account-link");
    return { url: link.url };
  }

  const token = await getAccessToken();
  const response = await fetch(buildApiUrl("/api/stripe-connect/onboarding/refresh"), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });

  return readExpressJson(response);
}

export async function autoCreateStripeConnectAccount(): Promise<void> {
  if (isSupabaseStripeConnectProvider()) {
    try {
      await invokeSupabaseFunction("get-account-status");
      return;
    } catch (error: any) {
      if (error?.status !== 404) {
        throw error;
      }
    }

    const { data: { user } } = await supabase.auth.getUser();
    await invokeSupabaseFunction("create-connected-account", {
      body: JSON.stringify({
        displayName: user?.user_metadata?.full_name || user?.email,
        contactEmail: user?.email,
        country: "gb",
      }),
    });
    return;
  }

  const token = await getAccessToken();
  const response = await fetch(buildApiUrl("/api/stripe-connect/auto-create"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || result.error || `Auto-create failed (${response.status}).`);
  }
}
