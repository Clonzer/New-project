import { supabase } from "@/lib/supabase";

// Stripe publishable key - should be in env
// @ts-ignore - Vite handles this
const STRIPE_PUBLISHABLE_KEY = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY) ? (import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY : '';
// @ts-ignore
const rawApiBase = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) ? (import.meta as any).env.VITE_API_URL : '/api';
const API_BASE_URL = (() => {
  if (typeof window === 'undefined') return rawApiBase;
  const normalized = String(rawApiBase).replace(/\/+$/, "");
  if (window.location.host !== new URL(normalized, window.location.origin).host) {
    if (normalized.startsWith('http://localhost') || normalized.startsWith('http://127.0.0.1') || normalized.startsWith('https://localhost') || normalized.startsWith('https://127.0.0.1')) {
      return window.location.origin.replace(/\/+$/, "");
    }
  }
  return normalized;
})();

// Payment Method Types
export interface PaymentMethod {
  id: string;
  type: 'card';
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  billingDetails?: {
    name?: string;
    email?: string;
    address?: {
      city?: string;
      country?: string;
      line1?: string;
      line2?: string;
      postal_code?: string;
      state?: string;
    };
  };
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountType: 'checking' | 'savings';
  last4: string;
  routingLast4: string;
  isDefault: boolean;
  status: 'new' | 'verified' | 'errored';
}

export interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'in_transit' | 'paid' | 'failed';
  createdAt: string;
  arrivalDate?: string;
  bankAccountLast4?: string;
  description?: string;
}

export interface WalletBalance {
  available: number;
  pending: number;
  currency: string;
}

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Load Stripe
let stripe: any = null;
export const loadStripe = async () => {
  if (stripe) return stripe;
  
  if (!STRIPE_PUBLISHABLE_KEY) {
    console.warn('Stripe publishable key not configured');
    return null;
  }

  // Dynamically load Stripe.js if not already loaded
  if (!(window as any).Stripe) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  stripe = (window as any).Stripe(STRIPE_PUBLISHABLE_KEY);
  return stripe;
};

// Get payment methods for user
export const getPaymentMethods = async (userId: string): Promise<ApiResponse<{ methods: PaymentMethod[] }>> => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'card')
      .order('is_default', { ascending: false });

    if (error) throw error;

    const methods: PaymentMethod[] = (data || []).map(item => ({
      id: item.id,
      type: 'card',
      brand: item.brand || 'unknown',
      last4: item.last4,
      expMonth: item.exp_month,
      expYear: item.exp_year,
      isDefault: item.is_default,
      billingDetails: item.billing_details
    }));

    return { success: true, data: { methods } };
  } catch (error: any) {
    console.error('Error fetching payment methods:', error);
    return { success: false, error: error.message };
  }
};

// Add payment method
export const addPaymentMethod = async (
  userId: string, 
  cardData: { number: string; exp_month: number; exp_year: number; cvc: string; name: string }
): Promise<ApiResponse<{ method: PaymentMethod }>> => {
  try {
    const stripeInstance = await loadStripe();
    if (!stripeInstance) {
      // Fallback to mock for development
      const mockMethod: PaymentMethod = {
        id: `card_${Date.now()}`,
        type: 'card',
        brand: 'visa',
        last4: cardData.number.slice(-4),
        expMonth: cardData.exp_month,
        expYear: cardData.exp_year,
        isDefault: false,
        billingDetails: { name: cardData.name }
      };

      // Save to Supabase
      const { data, error } = await supabase
        .from('payment_methods')
        .insert({
          user_id: userId,
          type: 'card',
          stripe_payment_method_id: mockMethod.id,
          brand: mockMethod.brand,
          last4: mockMethod.last4,
          exp_month: mockMethod.expMonth,
          exp_year: mockMethod.expYear,
          is_default: false,
          billing_details: mockMethod.billingDetails
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: { method: mockMethod } };
    }

    // Create payment method with Stripe
    const { paymentMethod, error: stripeError } = await stripeInstance.createPaymentMethod({
      type: 'card',
      card: {
        number: cardData.number,
        exp_month: cardData.exp_month,
        exp_year: cardData.exp_year,
        cvc: cardData.cvc,
      },
      billing_details: {
        name: cardData.name,
      },
    });

    if (stripeError) {
      return { success: false, error: stripeError.message };
    }

    // Save to Supabase
    const { data, error } = await supabase
      .from('payment_methods')
      .insert({
        user_id: userId,
        type: 'card',
        stripe_payment_method_id: paymentMethod.id,
        brand: paymentMethod.card.brand,
        last4: paymentMethod.card.last4,
        exp_month: paymentMethod.card.exp_month,
        exp_year: paymentMethod.card.exp_year,
        is_default: false,
        billing_details: paymentMethod.billing_details
      })
      .select()
      .single();

    if (error) throw error;

    const newMethod: PaymentMethod = {
      id: data.id,
      type: 'card',
      brand: paymentMethod.card.brand,
      last4: paymentMethod.card.last4,
      expMonth: paymentMethod.card.exp_month,
      expYear: paymentMethod.card.exp_year,
      isDefault: false,
      billingDetails: paymentMethod.billing_details
    };

    return { success: true, data: { method: newMethod } };
  } catch (error: any) {
    console.error('Error adding payment method:', error);
    return { success: false, error: error.message };
  }
};

// Delete payment method
export const deletePaymentMethod = async (userId: string, paymentMethodId: string): Promise<ApiResponse<void>> => {
  try {
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', paymentMethodId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting payment method:', error);
    return { success: false, error: error.message };
  }
};

// Set default payment method
export const setDefaultPaymentMethod = async (userId: string, paymentMethodId: string): Promise<ApiResponse<void>> => {
  try {
    // First, unset all defaults
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('user_id', userId);

    // Set the new default
    const { error } = await supabase
      .from('payment_methods')
      .update({ is_default: true })
      .eq('id', paymentMethodId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error setting default payment method:', error);
    return { success: false, error: error.message };
  }
};

// Get bank accounts for payouts
export const getBankAccounts = async (userId: string): Promise<ApiResponse<{ accounts: BankAccount[] }>> => {
  try {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });

    if (error) throw error;

    const accounts: BankAccount[] = (data || []).map(item => ({
      id: item.id,
      bankName: item.bank_name,
      accountType: item.account_type,
      last4: item.last4,
      routingLast4: item.routing_last4,
      isDefault: item.is_default,
      status: item.status
    }));

    return { success: true, data: { accounts } };
  } catch (error: any) {
    console.error('Error fetching bank accounts:', error);
    return { success: false, error: error.message };
  }
};

// Add bank account for payouts
export const addBankAccount = async (
  userId: string,
  bankData: { 
    bank_name: string; 
    account_number: string; 
    routing_number: string; 
    account_type: 'checking' | 'savings';
    account_holder_name: string;
  }
): Promise<ApiResponse<{ account: BankAccount }>> => {
  try {
    // Create bank account via API (Stripe Connect)
    // In production, this would create a Stripe Connect account
    const mockAccount: BankAccount = {
      id: `ba_${Date.now()}`,
      bankName: bankData.bank_name,
      accountType: bankData.account_type,
      last4: bankData.account_number.slice(-4),
      routingLast4: bankData.routing_number.slice(-4),
      isDefault: false,
      status: 'new'
    };

    // Save to Supabase
    const { data, error } = await supabase
      .from('bank_accounts')
      .insert({
        user_id: userId,
        bank_name: bankData.bank_name,
        account_type: bankData.account_type,
        last4: mockAccount.last4,
        routing_last4: mockAccount.routingLast4,
        account_holder_name: bankData.account_holder_name,
        is_default: false,
        status: 'new',
        // In production, store encrypted account info or Stripe bank account ID
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: { account: { ...mockAccount, id: data.id } } };
  } catch (error: any) {
    console.error('Error adding bank account:', error);
    return { success: false, error: error.message };
  }
};

// Delete bank account
export const deleteBankAccount = async (userId: string, bankId: string): Promise<ApiResponse<void>> => {
  try {
    const { error } = await supabase
      .from('bank_accounts')
      .delete()
      .eq('id', bankId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting bank account:', error);
    return { success: false, error: error.message };
  }
};

// Set default bank account
export const setDefaultBankAccount = async (userId: string, bankId: string): Promise<ApiResponse<void>> => {
  try {
    // First, unset all defaults
    await supabase
      .from('bank_accounts')
      .update({ is_default: false })
      .eq('user_id', userId);

    // Set the new default
    const { error } = await supabase
      .from('bank_accounts')
      .update({ is_default: true })
      .eq('id', bankId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error setting default bank account:', error);
    return { success: false, error: error.message };
  }
};

// Get wallet balance
export const getWalletBalance = async (userId: string): Promise<ApiResponse<WalletBalance>> => {
  try {
    const { data, error } = await supabase
      .from('seller_balances')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    const balance: WalletBalance = {
      available: data?.available_balance || 0,
      pending: data?.pending_balance || 0,
      currency: data?.currency || 'usd'
    };

    return { success: true, data: balance };
  } catch (error: any) {
    console.error('Error fetching wallet balance:', error);
    return { success: false, error: error.message };
  }
};

// Request payout/withdrawal
export const requestPayout = async (
  userId: string, 
  amount: number, 
  bankAccountId: string
): Promise<ApiResponse<{ payout: Payout }>> => {
  try {
    // Check available balance
    const { data: balanceData } = await getWalletBalance(userId);
    if (!balanceData || balanceData.available < amount) {
      return { success: false, error: 'Insufficient balance' };
    }

    // Get bank account
    const { data: bankData } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('id', bankAccountId)
      .eq('user_id', userId)
      .single();

    if (!bankData) {
      return { success: false, error: 'Bank account not found' };
    }

    // Create payout record
    const { data: payout, error } = await supabase
      .from('payouts')
      .insert({
        user_id: userId,
        amount: amount,
        currency: 'usd',
        status: 'pending',
        bank_account_id: bankAccountId,
        bank_account_last4: bankData.last4,
        description: `Payout to ${bankData.bank_name} ending in ${bankData.last4}`
      })
      .select()
      .single();

    if (error) throw error;

    // Deduct from available balance, add to pending
    await supabase
      .from('seller_balances')
      .upsert({
        user_id: userId,
        available_balance: balanceData.available - amount,
        pending_balance: balanceData.pending + amount,
        currency: 'usd',
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    const newPayout: Payout = {
      id: payout.id,
      amount: payout.amount,
      currency: payout.currency,
      status: payout.status,
      createdAt: payout.created_at,
      bankAccountLast4: payout.bank_account_last4,
      description: payout.description
    };

    return { success: true, data: { payout: newPayout } };
  } catch (error: any) {
    console.error('Error requesting payout:', error);
    return { success: false, error: error.message };
  }
};

// Get payout history
export const getPayoutHistory = async (userId: string): Promise<ApiResponse<{ payouts: Payout[] }>> => {
  try {
    const { data, error } = await supabase
      .from('payouts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const payouts: Payout[] = (data || []).map(item => ({
      id: item.id,
      amount: item.amount,
      currency: item.currency,
      status: item.status,
      createdAt: item.created_at,
      arrivalDate: item.arrival_date,
      bankAccountLast4: item.bank_account_last4,
      description: item.description
    }));

    return { success: true, data: { payouts } };
  } catch (error: any) {
    console.error('Error fetching payout history:', error);
    return { success: false, error: error.message };
  }
};

// Process automatic payout (for scheduled payouts)
export const processAutomaticPayout = async (userId: string): Promise<ApiResponse<{ payout: Payout }>> => {
  try {
    // Get user's payout settings
    const { data: settings, error: settingsError } = await supabase
      .from('payout_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (settingsError || !settings?.automatic_payouts_enabled) {
      return { success: false, error: 'Automatic payouts not enabled' };
    }

    // Get default bank account
    const { data: bankData } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();

    if (!bankData) {
      return { success: false, error: 'No default bank account set' };
    }

    // Get available balance
    const { data: balanceData } = await getWalletBalance(userId);
    if (!balanceData || balanceData.available < settings.minimum_payout_amount) {
      return { success: false, error: 'Balance below minimum payout amount' };
    }

    // Request payout
    const result = await requestPayout(userId, balanceData.available, bankData.id);
    return result;
  } catch (error: any) {
    console.error('Error processing automatic payout:', error);
    return { success: false, error: error.message };
  }
};

// Get payout settings
export const getPayoutSettings = async (userId: string): Promise<ApiResponse<any>> => {
  try {
    const { data, error } = await supabase
      .from('payout_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return { 
      success: true, 
      data: data || {
        automatic_payouts_enabled: false,
        payout_schedule: 'weekly',
        minimum_payout_amount: 25.00
      }
    };
  } catch (error: any) {
    console.error('Error fetching payout settings:', error);
    return { success: false, error: error.message };
  }
};

// Update payout settings
export const updatePayoutSettings = async (
  userId: string, 
  settings: {
    automatic_payouts_enabled?: boolean;
    payout_schedule?: 'daily' | 'weekly' | 'monthly';
    minimum_payout_amount?: number;
  }
): Promise<ApiResponse<void>> => {
  try {
    const { error } = await supabase
      .from('payout_settings')
      .upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error updating payout settings:', error);
    return { success: false, error: error.message };
  }
};
