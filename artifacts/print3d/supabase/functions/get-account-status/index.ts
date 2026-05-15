// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

// Initialize Stripe client with secret key from environment
// TODO: Set STRIPE_SECRET_KEY in Supabase secrets
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

const stripeClient = new Stripe(stripeSecretKey, {
  apiVersion: '2026-04-22.dahlia',
});

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Get user's connected account from database
    const { data: accountData, error: dbError } = await supabase
      .from('stripe_connected_accounts')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (dbError || !accountData) {
      return new Response(JSON.stringify({ error: 'No connected account found' }), { 
        status: 404, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Fetch account status from Stripe API
    const account = await stripeClient.v2.core.accounts.retrieve(accountData.stripe_account_id, {
      include: ["configuration.recipient", "requirements"],
    });

    // Determine if account is ready to receive payments
    const readyToReceivePayments = account?.configuration
      ?.recipient?.capabilities?.stripe_balance?.stripe_transfers?.status === "active";
    
    const requirementsStatus = account.requirements?.summary?.minimum_deadline?.status;
    const onboardingComplete = requirementsStatus !== "currently_due" && requirementsStatus !== "past_due";

    // Update database with latest status
    await supabase
      .from('stripe_connected_accounts')
      .update({
        status: account.status,
        onboarding_complete: onboardingComplete,
        capabilities: account.configuration,
        requirements: account.requirements,
      })
      .eq('user_id', user.id);

    return new Response(
      JSON.stringify({ 
        accountId: account.id,
        status: account.status,
        readyToReceivePayments,
        onboardingComplete,
        requirementsStatus,
        displayName: account.display_name,
        capabilities: account.configuration,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error getting account status:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
