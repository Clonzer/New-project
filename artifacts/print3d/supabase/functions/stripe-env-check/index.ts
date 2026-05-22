import "@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const raw = Deno.env.get("STRIPE_SECRET_KEY")?.trim() ?? "";
  const hasSiteUrl = Boolean(Deno.env.get("SITE_URL")?.trim() || Deno.env.get("APP_URL")?.trim());
  const hasServiceRole = Boolean(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim());

  const looksPlaceholder = !raw || raw.includes("your_key") || raw.includes("replace");
  const validShape = raw.startsWith("sk_test_") || raw.startsWith("sk_live_");

  const body = {
    ok: validShape && !looksPlaceholder,
    stripeSecretConfigured: Boolean(raw),
    stripeSecretPrefix: raw ? raw.slice(0, 8) : null,
    stripeSecretLength: raw.length,
    looksPlaceholder,
    validShape,
    hasSiteUrl,
    hasServiceRole,
    hint: !raw
      ? "Add STRIPE_SECRET_KEY under Project Settings → Edge Functions → Secrets (not Cloudflare)."
      : looksPlaceholder
        ? "STRIPE_SECRET_KEY is still a placeholder. Delete the secret and paste a real sk_test_ or sk_live_ key."
        : !validShape
          ? "STRIPE_SECRET_KEY must start with sk_test_ or sk_live_ (not pk_ publishable key)."
          : "Stripe secret shape looks OK. Redeploy create-connected-account if onboarding still fails.",
  };

  return new Response(JSON.stringify(body), {
    status: body.ok ? 200 : 503,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
