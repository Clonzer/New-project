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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const { name, description, priceInCents, currency = 'gbp', stripeAccountId } = await req.json();

    // Get user's connected account if stripeAccountId is provided
    let connectedAccountId = null;
    if (stripeAccountId) {
      const { data: accountData } = await supabase
        .from('stripe_connected_accounts')
        .select('stripe_account_id')
        .eq('user_id', user.id)
        .eq('stripe_account_id', stripeAccountId)
        .single();
      
      if (accountData) {
        connectedAccountId = accountData.stripe_account_id;
      }
    }

    // Create Stripe product at the platform level (not on connected account)
    const product = await stripeClient.products.create({
      name: name,
      description: description,
      default_price_data: {
        unit_amount: priceInCents,
        currency: currency,
      },
      metadata: {
        user_id: user.id,
        stripe_account_id: connectedAccountId || '',
      },
    });

    // Store product mapping in database
    const { error: dbError } = await supabase
      .from('stripe_products')
      .insert({
        stripe_product_id: product.id,
        stripe_price_id: product.default_price as string,
        user_id: user.id,
        stripe_account_id: connectedAccountId,
        name: name,
        description: description,
        default_price_amount: priceInCents,
        currency: currency,
        active: true,
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(JSON.stringify({ error: 'Failed to store product' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    return new Response(
      JSON.stringify({
        productId: product.id,
        priceId: product.default_price,
        name: product.name,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
