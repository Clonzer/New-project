-- Add stock tracking to listings
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS stock_reserved INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS track_stock BOOLEAN NOT NULL DEFAULT FALSE;

-- Add sponsorship tier to seller shops
ALTER TABLE users
ADD COLUMN IF NOT EXISTS sponsorship_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS sponsorship_expires_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS sponsored_until TIMESTAMP,
ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;

-- Create sponsorship tiers table for reference
CREATE TABLE IF NOT EXISTS sponsorship_tiers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_usd REAL NOT NULL,
  billing_period TEXT NOT NULL DEFAULT 'monthly',
  features TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create sponsorship transactions table for audit trail
CREATE TABLE IF NOT EXISTS sponsorship_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  tier_id INTEGER NOT NULL REFERENCES sponsorship_tiers(id),
  amount_usd REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_charge_id TEXT,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert default sponsorship tiers
INSERT INTO sponsorship_tiers (name, slug, description, price_usd, billing_period, features, display_order)
VALUES 
  ('Free', 'free', 'Basic marketplace access', 0, 'free', ARRAY['Basic shop profile', 'List up to 5 products', 'Standard support'], 1),
  ('Featured', 'featured', 'Premium visibility and features', 49.99, 'monthly', ARRAY['Featured on homepage', 'List unlimited products', 'Priority support', 'Shop analytics'], 2),
  ('VIP Partner', 'vip', 'Maximum visibility and priority support', 99.99, 'monthly', ARRAY['VIP featured placement', 'Sponsored sections', 'Dedicated account manager', 'Advanced analytics', 'Custom branding'], 3),
  ('Partner', 'partner', 'Strategic partnership tier', 199.99, 'monthly', ARRAY['Partner program', 'Co-marketing ops', 'Revenue share opportunities', 'Premium support'], 4)
ON CONFLICT (slug) DO NOTHING;

-- Add stock alert table for low inventory notifications
CREATE TABLE IF NOT EXISTS stock_alerts (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER NOT NULL REFERENCES listings(id),
  threshold_quantity INTEGER NOT NULL,
  alert_sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index for sponsorship lookups
CREATE INDEX IF NOT EXISTS idx_users_sponsorship_tier ON users(sponsorship_tier);
CREATE INDEX IF NOT EXISTS idx_users_featured ON users(featured);
CREATE INDEX IF NOT EXISTS idx_listings_track_stock ON listings(track_stock);
CREATE INDEX IF NOT EXISTS idx_sponsorship_transactions_user ON sponsorship_transactions(user_id);
