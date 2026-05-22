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

    const body = await req.json().catch(() => ({}));
    const displayName = body.displayName || user.user_metadata?.full_name || user.email;
    const contactEmail = body.contactEmail || user.email;
    if (!contactEmail) {
      return jsonResponse({ error: "User email is required for Stripe Connect" }, 400);
    }

    const countryRaw = String(body.country || "GB").toUpperCase();
    const country = countryRaw === "UK" ? "GB" : countryRaw;

    const siteUrl = (Deno.env.get("SITE_URL") || Deno.env.get("APP_URL") || "https://synthixgroup.co.uk")
      .replace(/\/$/, "");

    const baseUsername =
      user.user_metadata?.username ||
      user.email?.split("@")[0] ||
      `user_${user.id.slice(0, 8)}`;

    const { error: profileError } = await supabase.from("users").upsert(
      {
        id: user.id,
        email: contactEmail,
        username: baseUsername,
        display_name: displayName,
      },
      { onConflict: "id" },
    );

    if (profileError) {
      console.warn("Profile upsert warning:", profileError.message);
    }

    const { data: profile, error: profileReadError } = await supabase
      .from("users")
      .select("stripe_connect_id, stripe_account_status")
      .eq("id", user.id)
      .maybeSingle();

    if (profileReadError) {
      return jsonResponse({
        error: "Users table is missing Stripe columns",
        details: profileReadError.message,
        hint: "Run supabase/migrations/20250622000001_users_stripe_connect_columns.sql in the SQL editor",
      }, 500);
    }

    if (profile?.stripe_connect_id) {
      return jsonResponse({
        accountId: profile.stripe_connect_id,
        status: profile.stripe_account_status || "pending",
      });
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

    const { error: updateError } = await supabase
      .from("users")
      .update({
        stripe_connect_id: account.id,
        stripe_account_status: "pending",
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to save stripe_connect_id on users:", updateError);
      return jsonResponse({
        error: "Failed to save Stripe account on user profile",
        details: updateError.message,
        hint: "Run supabase/migrations/20250622000001_users_stripe_connect_columns.sql",
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
