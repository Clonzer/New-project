import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey",
};

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
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

    const body = await req.json().catch(() => ({}));
    const displayName = body.displayName || user.user_metadata?.full_name || user.email;
    const contactEmail = body.contactEmail || user.email;
    const countryRaw = String(body.country || "GB").toUpperCase();
    const country = countryRaw === "UK" ? "GB" : countryRaw;

    const siteUrl = (Deno.env.get("SITE_URL") || Deno.env.get("APP_URL") || "https://synthixgroup.co.uk")
      .replace(/\/$/, "");

    const { data: existing } = await supabase
      .from("stripe_connected_accounts")
      .select("stripe_account_id, status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing?.stripe_account_id) {
      return jsonResponse({
        accountId: existing.stripe_account_id,
        status: existing.status || "pending",
      });
    }

    const { error: profileError } = await supabase.from("users").upsert(
      {
        id: user.id,
        email: user.email || contactEmail,
        username: user.user_metadata?.username || user.email?.split("@")[0] || `user_${user.id.slice(0, 8)}`,
        display_name: displayName,
      },
      { onConflict: "id" },
    );

    if (profileError) {
      console.warn("Profile upsert skipped (continuing):", profileError.message);
    }

    let account;
    try {
      account = await stripeClient.accounts.create({
      type: "express",
      country,
      email: contactEmail,
      business_type: "individual",
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
      business_profile: {
        url: `${siteUrl}/dashboard`,
      },
      });
    } catch (stripeError) {
      const message = stripeError instanceof Error ? stripeError.message : "Stripe account creation failed";
      console.error("Stripe accounts.create failed:", stripeError);
      return jsonResponse({ error: message }, 500);
    }

    const { error: dbError } = await supabase.from("stripe_connected_accounts").insert({
      user_id: user.id,
      stripe_account_id: account.id,
      display_name: displayName,
      contact_email: contactEmail,
      country: country.toLowerCase(),
      dashboard_type: "express",
      status: "pending",
      onboarding_complete: false,
    });

    if (dbError) {
      console.error("Database error:", dbError);
      return jsonResponse({
        error: "Failed to store account",
        details: dbError.message,
      }, 500);
    }

    return jsonResponse({
      accountId: account.id,
      status: "pending",
    });
  } catch (error) {
    console.error("Error creating connected account:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse({ error: message }, 500);
  }
});
