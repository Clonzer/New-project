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

    const { data: accountData, error: dbError } = await supabase
      .from("stripe_connected_accounts")
      .select("stripe_account_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (dbError || !accountData?.stripe_account_id) {
      return jsonResponse({ error: "No connected account found" }, 404);
    }

    const siteUrl = (Deno.env.get("SITE_URL") || Deno.env.get("APP_URL") || "https://synthixgroup.co.uk")
      .replace(/\/$/, "");

    const accountLink = await stripeClient.accountLinks.create({
      account: accountData.stripe_account_id,
      type: "account_onboarding",
      refresh_url: `${siteUrl}/dashboard?section=payment&stripe=refresh`,
      return_url: `${siteUrl}/dashboard?section=payment&stripe=return`,
    });

    return jsonResponse({ url: accountLink.url });
  } catch (error) {
    console.error("Error creating account link:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse({ error: message }, 500);
  }
});
