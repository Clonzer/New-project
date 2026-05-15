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

    const { displayName, contactEmail, country = 'us' } = await req.json();

    // Create Stripe Connect account using V2 API
    const account = await stripeClient.v2.core.accounts.create({
      display_name: displayName || user.email,
      contact_email: contactEmail || user.email,
      identity: {
        country: country,
      },
      dashboard: 'express',
      defaults: {
        responsibilities: {
          fees_collector: 'application',
          losses_collector: 'application',
        },
      },
      configuration: {
        recipient: {
          capabilities: {
            stripe_balance: {
              stripe_transfers: {
                requested: true,
              },
            },
          },
        },
      },
    });

    // Store account mapping in database
    const { error: dbError } = await supabase
      .from('stripe_connected_accounts')
      .insert({
        user_id: user.id,
        stripe_account_id: account.id,
        display_name: displayName || user.email,
        contact_email: contactEmail || user.email,
        country: country,
        dashboard_type: 'express',
        status: 'pending',
        onboarding_complete: false,
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(JSON.stringify({ error: 'Failed to store account' }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    return new Response(
      JSON.stringify({ 
        accountId: account.id,
        status: account.status,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating connected account:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
