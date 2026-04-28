-- SAFE MIGRATION: Adds missing columns/policies without dropping existing tables
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================

-- Add columns to users table if missing
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'buyer',
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS avatar TEXT,
ADD COLUMN IF NOT EXISTS stripe_connect_account_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_connect_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS shop_name TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS shop_mode TEXT DEFAULT 'both',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to listings table
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS images TEXT[],
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add unique constraint on auth_id for conflict handling
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_auth_id_key'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_auth_id_key UNIQUE (auth_id);
    END IF;
END $$;

-- Add constraint to role column (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_role_check'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_role_check 
        CHECK (role IN ('buyer', 'seller', 'both', 'admin'));
    END IF;
END $$;

-- ============================================
-- 2. CREATE MISSING TABLES
-- ============================================

-- Printers/Equipment table (if not exists) - uses INTEGER to match existing users table
CREATE TABLE IF NOT EXISTS printers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  technology TEXT,
  materials TEXT[],
  build_volume TEXT,
  price_per_hour DECIMAL(10,2),
  price_per_gram DECIMAL(10,2),
  description TEXT,
  equipment_category TEXT,
  tool_or_service_type TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table (if not exists) - uses INTEGER for users, UUID for listings
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id INTEGER NOT NULL REFERENCES users(id),
  seller_id INTEGER NOT NULL REFERENCES users(id),
  listing_id UUID REFERENCES listings(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table (if not exists) - uses INTEGER to match existing users table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  reviewer_id INTEGER NOT NULL REFERENCES users(id),
  reviewee_id INTEGER NOT NULL REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS printers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reviews ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE RLS POLICIES
-- ============================================

-- Users policies (using auth_id which is UUID to match auth.uid())
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view their own data') THEN
        CREATE POLICY "Users can view their own data" ON users
          FOR SELECT USING (auth.uid() = auth_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update their own data') THEN
        CREATE POLICY "Users can update their own data" ON users
          FOR UPDATE USING (auth.uid() = auth_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow insert during signup') THEN
        CREATE POLICY "Allow insert during signup" ON users
          FOR INSERT WITH CHECK (auth.uid() = auth_id);
    END IF;
END $$;

-- Listings policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'listings' AND policyname = 'Anyone can view active listings') THEN
        CREATE POLICY "Anyone can view active listings" ON listings
          FOR SELECT USING (is_active = true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'listings' AND policyname = 'Sellers can manage their listings') THEN
        CREATE POLICY "Sellers can manage their listings" ON listings
          FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
    END IF;
END $$;

-- Printers policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'printers' AND policyname = 'Anyone can view printers') THEN
        CREATE POLICY "Anyone can view printers" ON printers
          FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'printers' AND policyname = 'Users can manage their own printers') THEN
        CREATE POLICY "Users can manage their own printers" ON printers
          FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
    END IF;
END $$;

-- Orders policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Buyers can view their orders') THEN
        CREATE POLICY "Buyers can view their orders" ON orders
          FOR SELECT USING (buyer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Sellers can view orders for their listings') THEN
        CREATE POLICY "Sellers can view orders for their listings" ON orders
          FOR SELECT USING (seller_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
    END IF;
END $$;

-- Reviews policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Anyone can view reviews') THEN
        CREATE POLICY "Anyone can view reviews" ON reviews
          FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Users can create reviews for their completed orders') THEN
        CREATE POLICY "Users can create reviews for their completed orders" ON reviews
          FOR INSERT WITH CHECK (
            reviewer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) AND
            EXISTS (
              SELECT 1 FROM orders 
              WHERE id = order_id 
              AND status = 'completed' 
              AND (buyer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) OR seller_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))
            )
          );
    END IF;
END $$;

-- ============================================
-- 5. CREATE TRIGGER FOR NEW USER SIGNUP
-- ============================================

-- Function to handle new user signup (populates auth_id with Supabase Auth UUID)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (auth_id, email, is_verified)
  VALUES (NEW.id, NEW.email, NEW.email_confirmed_at IS NOT NULL)
  ON CONFLICT (auth_id) DO UPDATE SET
    email = EXCLUDED.email,
    is_verified = EXCLUDED.is_verified;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on signup
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION handle_new_user();
    END IF;
END $$;

-- ============================================
-- 6. ADD updated_at TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_listings_updated_at') THEN
        CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_printers_updated_at') THEN
        CREATE TRIGGER update_printers_updated_at BEFORE UPDATE ON printers
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_orders_updated_at') THEN
        CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ============================================
-- 7. VERIFY SETUP
-- ============================================

-- Check users table structure
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
