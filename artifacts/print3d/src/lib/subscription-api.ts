import { supabase } from './supabase';

export type Plan = {
  id: string;
  name: string;
  type: 'buyer' | 'seller';
  price: number;
  interval: 'monthly' | 'yearly';
  currency: string;
  features: string[];
  maxListings?: number;
  maxOrders?: number;
  feeDiscount?: number;
  featuredPlacement?: boolean;
  prioritySupport?: boolean;
  analytics?: boolean;
  customDomain?: boolean;
  apiAccess?: boolean;
};

export type Subscription = {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
};

export async function listPlans() {
  // Return mock plans for now
  const plans: Plan[] = [
    // Buyer plans
    {
      id: 'buyer-free',
      name: 'Free',
      type: 'buyer',
      price: 0,
      interval: 'monthly',
      currency: 'USD',
      features: [
        'Browse all listings',
        'Contact sellers',
        'Basic search filters',
        'Order tracking',
      ],
    },
    {
      id: 'buyer-pro',
      name: 'Pro Buyer',
      type: 'buyer',
      price: 9.99,
      interval: 'monthly',
      currency: 'USD',
      features: [
        'Everything in Free',
        'Priority support',
        'Advanced search filters',
        'Price drop alerts',
        'Exclusive discounts',
        'Early access to new listings',
      ],
    },
    // Seller plans
    {
      id: 'seller-starter',
      name: 'Starter',
      type: 'seller',
      price: 0,
      interval: 'monthly',
      currency: 'USD',
      features: [
        'Up to 10 listings',
        'Basic analytics',
        'Standard support',
        '10% platform fee',
      ],
      maxListings: 10,
      feeDiscount: 0,
    },
    {
      id: 'seller-pro',
      name: 'Professional',
      type: 'seller',
      price: 29.99,
      interval: 'monthly',
      currency: 'USD',
      features: [
        'Unlimited listings',
        'Advanced analytics',
        'Priority support',
        '5% platform fee',
        'Featured placement (1/month)',
        'Custom shop banner',
      ],
      maxListings: -1,
      feeDiscount: 5,
      featuredPlacement: true,
      analytics: true,
    },
    {
      id: 'seller-business',
      name: 'Business',
      type: 'seller',
      price: 79.99,
      interval: 'monthly',
      currency: 'USD',
      features: [
        'Everything in Professional',
        '3% platform fee',
        'Featured placement (unlimited)',
        'Custom domain',
        'API access',
        'Dedicated account manager',
      ],
      maxListings: -1,
      feeDiscount: 7,
      featuredPlacement: true,
      analytics: true,
      customDomain: true,
      apiAccess: true,
    },
  ];

  return { plans };
}

export async function getPlan(id: string) {
  const { plans } = await listPlans();
  const plan = plans.find(p => p.id === id);
  return { plan };
}

export async function getUserSubscription(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, plans(*)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return { subscription: data };
}

export async function createSubscription(subscription: {
  userId: string;
  planId: string;
  paymentMethodId: string;
}) {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: subscription.userId,
      plan_id: subscription.planId,
      status: 'active',
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancel_at_period_end: false,
    })
    .select()
    .single();

  if (error) throw error;

  return { subscription: data };
}

export async function cancelSubscription(subscriptionId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({ cancel_at_period_end: true })
    .eq('id', subscriptionId)
    .select()
    .single();

  if (error) throw error;

  return { subscription: data };
}

export async function updateSubscriptionPlan(subscriptionId: string, newPlanId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({ plan_id: newPlanId })
    .eq('id', subscriptionId)
    .select()
    .single();

  if (error) throw error;

  return { subscription: data };
}
