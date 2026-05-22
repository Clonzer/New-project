import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey",
};

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")?.trim();
if (!stripeSecretKey || stripeSecretKey.includes("your_key") || !stripeSecretKey.startsWith("sk_")) {
  throw new Error(
    "STRIPE_SECRET_KEY is missing or still a placeholder. Set a real sk_test_ or sk_live_ key in Supabase → Edge Functions → Secrets.",
  );
}

const stripeClient = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16",
});

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return jsonResponse({ error: "Invalid token" }, 401);
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("stripe_connect_id, stripe_account_status, display_name, email")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return jsonResponse({
        error: "Could not read user profile",
        details: profileError.message,
      }, 500);
    }

    if (!profile?.stripe_connect_id) {
      return jsonResponse({ error: "No connected account found" }, 404);
    }

    const account = await stripeClient.accounts.retrieve(profile.stripe_connect_id);

    const readyToReceivePayments = Boolean(account.charges_enabled && account.payouts_enabled);
    const onboardingComplete = Boolean(account.details_submitted);
    const status = readyToReceivePayments
      ? "active"
      : account.requirements?.disabled_reason
        ? "disabled"
        : onboardingComplete
          ? "restricted"
          : "pending";

    await supabase
      .from("users")
      .update({ stripe_account_status: status })
      .eq("id", user.id);

    return jsonResponse({
      accountId: account.id,
      status,
      readyToReceivePayments,
      onboardingComplete,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      displayName: profile.display_name || account.business_profile?.name || profile.email,
    });
  } catch (error) {
    console.error("Error getting account status:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse({ error: message }, 500);
  }
});
