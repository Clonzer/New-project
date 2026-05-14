// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
});

Deno.serve(async (req) => {
  try {
    const { items, shippingAddress, successPath, cancelPath } = await req.json();
    
    // Calculate total amount
    let subtotal = 0;
    items.forEach((item: any) => {
      subtotal += (item.unitPrice || 0) * item.quantity;
    });
    
    const platformFee = subtotal * 0.10; // 10% platform fee
    const fixedFee = 1.00; // £1 fixed fee
    const shippingTotal = items.reduce((sum: number, item: any) => {
      return sum + ((item.shippingCost || 0) * item.quantity);
    }, 0);
    
    const total = subtotal + platformFee + fixedFee + shippingTotal;
    
    // Convert to cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(total * 100);
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: item.title || 'Product',
          },
          unit_amount: Math.round(((item.unitPrice || 0) * 1.10 + fixedFee) * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${Deno.env.get('SITE_URL')}${successPath}`,
      cancel_url: `${Deno.env.get('SITE_URL')}${cancelPath}`,
      metadata: {
        shippingAddress,
        items: JSON.stringify(items),
      },
    });
    
    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
