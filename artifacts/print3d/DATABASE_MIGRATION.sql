-- Database Migration for New Features
-- Run these commands in Supabase SQL Editor

-- Add social media fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tiktok_handle TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS x_handle TEXT;

-- Add plan expiration tracking to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sponsorship_expires_at TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sponsorship_type TEXT;

-- Add service listing fields to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS listing_type VARCHAR(20) DEFAULT 'product';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS service_category VARCHAR(100);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS service_type VARCHAR(100);

-- Add missing fields for listing display
ALTER TABLE listings ADD COLUMN IF NOT EXISTS estimated_days_min INTEGER;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS estimated_days_max INTEGER;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE listings ADD COLUMN IF NOT EXISTS track_stock BOOLEAN DEFAULT false;

-- Update existing seller records to use user's actual name from profiles
UPDATE sellers
SET store_name = COALESCE(
  (SELECT display_name FROM profiles WHERE profiles.id = sellers.id),
  (SELECT username FROM profiles WHERE profiles.id = sellers.id),
  'My Shop'
)
WHERE store_name = 'My Shop';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_plan_expires_at ON profiles(plan_expires_at);
CREATE INDEX IF NOT EXISTS idx_profiles_sponsorship_expires_at ON profiles(sponsorship_expires_at);
CREATE INDEX IF NOT EXISTS idx_listings_listing_type ON listings(listing_type);
CREATE INDEX IF NOT EXISTS idx_listings_service_category ON listings(service_category);
