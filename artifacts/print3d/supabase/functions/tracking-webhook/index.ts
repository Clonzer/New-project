/**
 * Supabase Edge Function: Handle Carrier Tracking Webhooks
 * 
 * Carriers send webhooks when tracking status changes
 * This provides real-time updates instead of waiting for polling
 * Most important: Instant notification on delivery
 * 
 * Supported carriers: Shippo, EasyPost, direct USPS/UPS/FedEx
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    // Get webhook signature from headers for verification
    const signature = req.headers.get('x-shippo-signature') || 
                     req.headers.get('x-webhook-signature') ||
                     req.headers.get('stripe-signature');
    
    const webhookSecret = Deno.env.get('WEBHOOK_SECRET');
    
    // Parse webhook payload
    const payload = await req.json();
    
    console.log('Received tracking webhook:', payload);
    
    // Verify signature (implementation varies by carrier)
    // if (signature && webhookSecret) {
    //   const isValid = verifyWebhookSignature(payload, signature, webhookSecret);
    //   if (!isValid) {
    //     return new Response('Invalid signature', { status: 401 });
    //   }
    // }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Extract tracking info from webhook payload
    // Format varies by carrier - this is Shippo format
    const trackingNumber = payload.tracking_number || payload.data?.tracking_number;
    const carrier = payload.carrier || payload.data?.carrier;
    const status = payload.status || payload.data?.status;
    const trackingHistory = payload.tracking_history || payload.data?.tracking_history;

    if (!trackingNumber) {
      return new Response('Missing tracking number', { status: 400 });
    }

    // Find order by tracking number
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select(`
        id,
        seller_id,
        buyer_id,
        seller_earnings,
        total_price,
        platform_fee,
        payment_intent_id,
        seller_stripe_account_id
      `)
      .eq('tracking_number', trackingNumber)
      .single();

    if (orderError || !order) {
      console.error('Order not found for tracking:', trackingNumber);
      return new Response('Order not found', { status: 404 });
    }

    // Update tracking info
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({
        tracking_status: mapTrackingStatus(status),
        tracking_events: trackingHistory?.map((event: any) => ({
          timestamp: event.status_date,
          status: event.status,
          location: event.location?.city,
          description: event.status_description,
        })),
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('Failed to update tracking:', updateError);
      return new Response('Update failed', { status: 500 });
    }

    // If delivered, trigger payment release
    if (status?.toUpperCase() === 'DELIVERED') {
      // Check if already processed to avoid duplicates
      const { data: existingOrder } = await supabaseClient
        .from('orders')
        .select('delivered_at')
        .eq('id', order.id)
        .single();

      if (!existingOrder?.delivered_at) {
        await handleDelivery(supabaseClient, order);
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: true }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});

async function handleDelivery(supabaseClient: any, order: any): Promise<void> {
  // Mark as delivered
  await supabaseClient
    .from('orders')
    .update({
      status: 'delivered',
      delivered_at: new Date().toISOString(),
      tracking_status: 'delivered',
    })
    .eq('id', order.id);

  // Release payment
  if (order.payment_intent_id) {
    try {
      const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
      
      if (stripeKey) {
        // Capture payment
        await fetch(
          `https://api.stripe.com/v1/payment_intents/${order.payment_intent_id}/capture`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${stripeKey}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              'amount_to_capture': Math.round(order.seller_earnings * 100).toString(),
            }),
          }
        );

        // Transfer to seller
        if (order.seller_stripe_account_id) {
          await fetch('https://api.stripe.com/v1/transfers', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${stripeKey}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              'amount': Math.round(order.seller_earnings * 100).toString(),
              'currency': 'usd',
              'destination': order.seller_stripe_account_id,
              'transfer_group': `order_${order.id}`,
            }),
          });
        }
      }
    } catch (error) {
      console.error('Payment release failed:', error);
    }
  }

  // Send notifications
  await supabaseClient.from('notifications').insert([
    {
      user_id: order.seller_id,
      type: 'payment_released',
      title: 'Payment Released! 💰',
      message: `Order #${order.id} delivered. $${order.seller_earnings} released to your account.`,
      read: false,
      created_at: new Date().toISOString(),
    },
    {
      user_id: order.buyer_id,
      type: 'order_delivered',
      title: 'Order Delivered! 📦',
      message: `Order #${order.id} has been delivered. Enjoy your purchase!`,
      read: false,
      created_at: new Date().toISOString(),
    },
  ]);

  console.log(`Order ${order.id} delivery processed via webhook`);
}

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
