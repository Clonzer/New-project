-- Add Stripe Connect fields to users table
DO $$
BEGIN
  -- Create enum for stripe_account_status
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stripe_account_status') THEN
    CREATE TYPE stripe_account_status AS ENUM ('not_started', 'pending', 'active', 'restricted', 'disabled');
  END IF;
END $$;

-- Add stripe_connect_id column to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_connect_id TEXT UNIQUE;

-- Add stripe_account_status column to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_account_status stripe_account_status NOT NULL DEFAULT 'not_started';

-- Add Stripe Connect fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT UNIQUE;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_charge_id TEXT UNIQUE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_stripe_connect_id ON users(stripe_connect_id) WHERE stripe_connect_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_stripe_account_status ON users(stripe_account_status);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent_id ON orders(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_stripe_charge_id ON orders(stripe_charge_id) WHERE stripe_charge_id IS NOT NULL;
