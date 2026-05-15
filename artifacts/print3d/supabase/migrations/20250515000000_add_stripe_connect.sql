-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Stripe Connected Accounts table
-- Maps users to their Stripe Connect accounts
CREATE TABLE IF NOT EXISTS stripe_connected_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_account_id TEXT NOT NULL UNIQUE, -- Stripe Account ID from V2 API
  display_name TEXT,
  contact_email TEXT,
  country TEXT DEFAULT 'us',
  dashboard_type TEXT DEFAULT 'express', -- 'express', 'standard', 'custom'
  status TEXT DEFAULT 'pending', -- 'pending', 'active', 'restricted', 'disabled'
  onboarding_complete BOOLEAN DEFAULT false,
  capabilities JSONB DEFAULT '{}', -- Store capabilities status
  requirements JSONB DEFAULT '{}', -- Store requirements status
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Stripe Products table
-- Products created at the platform level
CREATE TABLE IF NOT EXISTS stripe_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_product_id TEXT NOT NULL UNIQUE, -- Stripe Product ID
  stripe_price_id TEXT, -- Default Stripe Price ID
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_account_id TEXT REFERENCES stripe_connected_accounts(stripe_account_id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  default_price_amount INTEGER, -- Price in cents
  currency TEXT DEFAULT 'gbp',
  active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stripe Checkout Sessions table
-- Track checkout sessions for orders
CREATE TABLE IF NOT EXISTS stripe_checkout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_session_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_account_id TEXT REFERENCES stripe_connected_accounts(stripe_account_id),
  product_id UUID REFERENCES stripe_products(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL, -- Total amount in cents
  application_fee_amount INTEGER NOT NULL, -- Platform fee in cents
  currency TEXT DEFAULT 'gbp',
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'expired', 'cancelled'
  payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_stripe_connected_accounts_user_id ON stripe_connected_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_connected_accounts_stripe_account_id ON stripe_connected_accounts(stripe_account_id);
CREATE INDEX IF NOT EXISTS idx_stripe_products_user_id ON stripe_products(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_products_stripe_product_id ON stripe_products(stripe_product_id);
CREATE INDEX IF NOT EXISTS idx_stripe_products_stripe_account_id ON stripe_products(stripe_account_id);
CREATE INDEX IF NOT EXISTS idx_stripe_checkout_sessions_user_id ON stripe_checkout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_checkout_sessions_stripe_session_id ON stripe_checkout_sessions(stripe_session_id);

-- Enable Row Level Security
ALTER TABLE stripe_connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_checkout_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stripe_connected_accounts
-- Users can only see their own connected accounts
CREATE POLICY "Users can view own connected accounts"
  ON stripe_connected_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connected accounts"
  ON stripe_connected_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connected accounts"
  ON stripe_connected_accounts FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for stripe_products
-- Users can view all products (for storefront)
CREATE POLICY "Users can view all products"
  ON stripe_products FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own products"
  ON stripe_products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON stripe_products FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
  ON stripe_products FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for stripe_checkout_sessions
-- Users can view own checkout sessions
CREATE POLICY "Users can view own checkout sessions"
  ON stripe_checkout_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkout sessions"
  ON stripe_checkout_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkout sessions"
  ON stripe_checkout_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_stripe_connected_accounts_updated_at
  BEFORE UPDATE ON stripe_connected_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_products_updated_at
  BEFORE UPDATE ON stripe_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_checkout_sessions_updated_at
  BEFORE UPDATE ON stripe_checkout_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
