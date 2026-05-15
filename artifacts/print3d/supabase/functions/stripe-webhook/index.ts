// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

// Initialize Stripe client with secret key from environment
// TODO: Set STRIPE_SECRET_KEY in Supabase secrets
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

const stripeClient = new Stripe(stripeSecretKey, {
  apiVersion: '2026-04-22.dahlia',
});

// TODO: Set STRIPE_WEBHOOK_SECRET in Supabase secrets
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the raw body as text for signature verification
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response(JSON.stringify({ error: 'No signature' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Verify webhook signature
    let event;
    try {
      event = stripeClient.webhooks.constructEvent(
        body,
        signature,
        webhookSecret || ''
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Handle thin events for V2 accounts
    if (event.type.startsWith('v2.')) {
      // Fetch the full event data for thin events
      const fullEvent = await stripeClient.v2.core.events.retrieve(event.id);
      
      console.log('Processing V2 event:', fullEvent.type);

      // Handle account requirements updated
      if (fullEvent.type === 'v2.core.account[requirements].updated') {
        const accountId = fullEvent.data.object.id;
        
        // Update account requirements in database
        await supabase
          .from('stripe_connected_accounts')
          .update({
            requirements: fullEvent.data.object.requirements,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_account_id', accountId);
      }

      // Handle capability status updated
      if (fullEvent.type === 'v2.core.account[.recipient].capability_status_updated') {
        const accountId = fullEvent.data.object.id;
        
        // Update account capabilities in database
        await supabase
          .from('stripe_connected_accounts')
          .update({
            capabilities: fullEvent.data.object.configuration,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_account_id', accountId);
      }
    }

    // Handle checkout session completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Update checkout session status in database
      await supabase
        .from('stripe_checkout_sessions')
        .update({
          status: 'completed',
          payment_intent_id: session.payment_intent as string,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_session_id', session.id);
    }

    return new Response(JSON.stringify({ received: true }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
