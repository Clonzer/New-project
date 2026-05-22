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

    const { priceId, quantity = 1, stripeAccountId, applicationFeeAmount } = await req.json();

    // Get product details from database
    const { data: productData, error: productError } = await supabase
      .from('stripe_products')
      .select('*')
      .eq('stripe_price_id', priceId)
      .single();

    if (productError || !productData) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Get site URL from environment or use default
    const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:3000';

    // Calculate platform fee (10% of product price)
    const platformFee = applicationFeeAmount || Math.round(productData.default_price_amount * 0.10);

    // Create checkout session with destination charge and application fee
    const session = await stripeClient.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: stripeAccountId,
        },
      },
      mode: 'payment',
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/storefront`,
      metadata: {
        user_id: user.id,
        product_id: productData.id,
        stripe_account_id: stripeAccountId,
      },
    });

    // Store checkout session in database
    const { error: dbError } = await supabase
      .from('stripe_checkout_sessions')
      .insert({
        stripe_session_id: session.id,
        user_id: user.id,
        stripe_account_id: stripeAccountId,
        product_id: productData.id,
        amount: productData.default_price_amount * quantity,
        application_fee_amount: platformFee,
        currency: productData.currency,
        status: 'pending',
      });

    if (dbError) {
      console.error('Database error:', dbError);
    }

    return new Response(
      JSON.stringify({
        url: session.url,
        sessionId: session.id,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
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
