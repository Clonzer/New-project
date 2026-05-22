import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

if (!hasSupabaseConfig) {
  console.warn('Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
}

export const supabase = createClient(
  hasSupabaseConfig ? supabaseUrl : 'https://placeholder.supabase.co',
  hasSupabaseConfig ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: hasSupabaseConfig,
      detectSessionInUrl: true,
    },
  },
);

export type User = {
  id: string;
  email: string;
  role: 'buyer' | 'seller' | 'both' | 'admin';
  name?: string;
  avatar?: string;
  username?: string;
  displayName?: string;
  bio?: string | null;
  location?: string | null;
  avatarUrl?: string | null;
  countryCode?: string;
  languageCode?: string;
  currencyCode?: string;
  sellerTags?: string[];
  shopName?: string | null;
  bannerUrl?: string | null;
  shopAnnouncement?: string | null;
  brandStory?: string | null;
  websiteUrl?: string | null;
  instagramHandle?: string | null;
  supportEmail?: string | null;
  shopMode?: 'catalog' | 'open' | 'both' | null;
  defaultShippingCost?: number | null;
  shippingRegions?: string[];
  sellingRegions?: string[];
  shippingPolicy?: string | null;
  domesticShippingCost?: number | null;
  europeShippingCost?: number | null;
  northAmericaShippingCost?: number | null;
  internationalShippingCost?: number | null;
  freeShippingThreshold?: number | null;
  localPickupEnabled?: boolean;
  taxRate?: number | null;
  processingDaysMin?: number | null;
  processingDaysMax?: number | null;
  returnPolicy?: string | null;
  customOrderPolicy?: string | null;
  emailVerifiedAt?: string | null;
  isVerified: boolean;
  stripeConnectAccountId?: string;
  stripeConnectEnabled?: boolean;
  isSponsored?: boolean;
  isOwner?: boolean;
  planTier?: 'starter' | 'pro' | 'elite' | 'enterprise';
  sponsorshipTier?: 'free' | 'featured' | 'vip' | 'partner';
  totalXp?: number;
  rankId?: number;
  // Enterprise team fields
  isTeamOwner?: boolean;
  seatCount?: number;
  teamOwnerId?: number | null;
  organizationName?: string | null;
  billingEmail?: string | null;
  // Store visibility and order acceptance toggles
  storeVisible?: boolean;
  acceptingOrders?: boolean;
};
