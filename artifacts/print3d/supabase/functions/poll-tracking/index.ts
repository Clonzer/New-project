/**
 * Supabase Edge Function: Poll Tracking Status
 * 
 * This function runs every hour via Supabase Cron
 * It polls carrier APIs for tracking updates on shipped orders
 * When delivery is confirmed, it releases payment to seller
 * 
 * Environment Variables Required:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - SHIPPO_API_KEY (or carrier-specific API keys)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get all shipped orders that haven't been delivered yet
    const { data: pendingOrders, error: ordersError } = await supabaseClient
      .from('orders')
      .select(`
        id,
        tracking_number,
        carrier,
        status,
        seller_id,
        buyer_id,
        total_price,
        seller_earnings,
        platform_fee,
        payment_intent_id
      `)
      .eq('status', 'shipped')
      .is('delivered_at', null)
      .not('tracking_number', 'is', null)
      .order('shipped_at', { ascending: true });

    if (ordersError) {
      throw new Error(`Failed to fetch orders: ${ordersError.message}`);
    }

    console.log(`Found ${pendingOrders?.length || 0} orders to poll`);

    const results = {
      polled: 0,
      delivered: 0,
      errors: [] as string[],
    };

    // Poll each order's tracking status
    for (const order of pendingOrders || []) {
      try {
        const tracking = await pollCarrierTracking(
          order.tracking_number,
          order.carrier
        );

        // Update order with latest tracking info
        const { error: updateError } = await supabaseClient
          .from('orders')
          .update({
            tracking_status: tracking.status,
            tracking_events: tracking.events,
            estimated_delivery: tracking.estimatedDelivery,
            updated_at: new Date().toISOString(),
          })
          .eq('id', order.id);

        if (updateError) {
          throw new Error(`Failed to update order: ${updateError.message}`);
        }

        results.polled++;

        // If delivered, handle payment release
        if (tracking.status === 'delivered' && !order.delivered_at) {
          await handleDeliveryConfirmation(supabaseClient, order);
          results.delivered++;
        }
      } catch (error) {
        const errorMsg = `Order ${order.id}: ${error.message}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

/**
 * Poll carrier tracking API
 */
async function pollCarrierTracking(
  trackingNumber: string,
  carrier: string
): Promise<{
  status: string;
  events: any[];
  estimatedDelivery?: string;
}> {
  const shippoKey = Deno.env.get('SHIPPO_API_KEY');
  
  if (!shippoKey) {
    throw new Error('SHIPPO_API_KEY not configured');
  }

  // Using Shippo for unified tracking
  const response = await fetch(
    `https://api.goshippo.com/tracks/${carrier.toLowerCase()}/${trackingNumber}/`,
    {
      headers: {
        'Authorization': `ShippoToken ${shippoKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Tracking API error: ${response.status}`);
  }

  const data = await response.json();

  return {
    status: mapTrackingStatus(data.status),
    events: data.tracking_history?.map((event: any) => ({
      timestamp: event.status_date,
      status: event.status,
      location: event.location?.city,
      description: event.status_description,
    })) || [],
    estimatedDelivery: data.eta,
  };
}

/**
 * Handle delivery confirmation - release payment to seller
 */
async function handleDeliveryConfirmation(supabaseClient: any, order: any): Promise<void> {
  // Update order as delivered
  const { error: deliverError } = await supabaseClient
    .from('orders')
    .update({
      status: 'delivered',
      delivered_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id);

  if (deliverError) {
    throw new Error(`Failed to mark delivered: ${deliverError.message}`);
  }

  // Release payment to seller (Stripe integration)
  if (order.payment_intent_id) {
    try {
      await releaseStripePayment(order);
    } catch (error) {
      console.error(`Payment release failed for order ${order.id}:`, error);
      // Don't throw - order is already marked delivered, payment can be released manually
    }
  }

  // Create notification for seller
  await supabaseClient.from('notifications').insert({
    user_id: order.seller_id,
    type: 'payment_released',
    title: 'Payment Released! 💰',
    message: `Order #${order.id} was delivered. $${order.seller_earnings} has been released to your account.`,
    data: {
      order_id: order.id,
      amount: order.seller_earnings,
    },
    read: false,
    created_at: new Date().toISOString(),
  });

  // Create notification for buyer
  await supabaseClient.from('notifications').insert({
    user_id: order.buyer_id,
    type: 'order_delivered',
    title: 'Order Delivered! 📦',
    message: `Order #${order.id} has been delivered. Enjoy your purchase!`,
    data: {
      order_id: order.id,
    },
    read: false,
    created_at: new Date().toISOString(),
  });

  console.log(`Order ${order.id} marked delivered and payment released`);
}

/**
 * Release held Stripe payment to seller
 */
async function releaseStripePayment(order: any): Promise<void> {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  
  if (!stripeKey) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }

  // Capture the payment intent
  const captureResponse = await fetch(
    `https://api.stripe.com/v1/payment_intents/${order.payment_intent_id}/capture`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'amount_to_capture': Math.round(order.seller_earnings * 100).toString(), // Convert to cents
      }),
    }
  );

  if (!captureResponse.ok) {
    const error = await captureResponse.json();
    throw new Error(`Stripe capture failed: ${error.message}`);
  }

  // Create transfer to seller's connected account
  // Note: This requires the seller to have a Stripe Connect account
  const transferResponse = await fetch('https://api.stripe.com/v1/transfers', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'amount': Math.round(order.seller_earnings * 100).toString(),
      'currency': 'usd',
      'destination': order.seller_stripe_account_id, // Seller's connected account ID
      'transfer_group': `order_${order.id}`,
    }),
  });

  if (!transferResponse.ok) {
    const error = await transferResponse.json();
    throw new Error(`Stripe transfer failed: ${error.message}`);
  }

  console.log(`Payment released for order ${order.id}: $${order.seller_earnings}`);
}

/**
 * Map carrier status to our internal status
 */
function mapTrackingStatus(carrierStatus: string): string {
  const statusMap: Record<string, string> = {
    'PRE_TRANSIT': 'pre_transit',
    'TRANSIT': 'in_transit',
    'IN_TRANSIT': 'in_transit',
    'OUT_FOR_DELIVERY': 'out_for_delivery',
    'DELIVERED': 'delivered',
    'FAILURE': 'exception',
    'EXCEPTION': 'exception',
  };

  return statusMap[carrierStatus?.toUpperCase()] || 'in_transit';
}
