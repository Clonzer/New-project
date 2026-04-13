# Database Setup for Synthix

This document describes the Supabase database tables and their schemas for the Synthix application.

## Existing Tables

### 1. equipment_groups
Equipment groups for organizing printers/equipment.

```sql
CREATE TABLE IF NOT EXISTS equipment_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE equipment_groups ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own equipment groups" ON equipment_groups FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own equipment groups" ON equipment_groups FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own equipment groups" ON equipment_groups FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own equipment groups" ON equipment_groups FOR DELETE USING (auth.uid() = user_id);
```

### 2. profiles
User profile table linked to Supabase auth users.

```sql
-- If profiles table doesn't exist, create it:
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  username TEXT UNIQUE,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'both', 'admin')),
  location TEXT,
  shop_name TEXT,
  bio TEXT,
  shop_mode TEXT CHECK (shop_mode IN ('catalog', 'open', 'both')),
  is_verified BOOLEAN DEFAULT false,
  stripe_connect_account_id TEXT,
  stripe_connect_enabled BOOLEAN DEFAULT false,
  is_sponsored BOOLEAN DEFAULT false,
  plan_tier TEXT DEFAULT 'none' CHECK (plan_tier IN ('none', 'basic', 'pro', 'enterprise')),
  avatar_url TEXT,
  banner_url TEXT,
  shop_announcement TEXT,
  brand_story TEXT,
  website_url TEXT,
  instagram_handle TEXT,
  support_email TEXT,
  default_shipping_cost DECIMAL(10,2),
  shipping_regions TEXT,
  selling_regions TEXT[],
  shipping_policy TEXT,
  domestic_shipping_cost DECIMAL(10,2),
  europe_shipping_cost DECIMAL(10,2),
  north_america_shipping_cost DECIMAL(10,2),
  international_shipping_cost DECIMAL(10,2),
  free_shipping_threshold DECIMAL(10,2),
  local_pickup_enabled BOOLEAN DEFAULT false,
  tax_rate DECIMAL(5,2),
  processing_days_min INTEGER,
  processing_days_max INTEGER,
  return_policy TEXT,
  custom_order_policy TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Public can view profiles" ON profiles;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Public can view profiles" ON profiles FOR SELECT USING (true);
```

### 2. printers
Equipment/machinery table for sellers to list their capabilities (code uses "equipment" table, needs to be updated to "printers").

```sql
-- Columns needed:
-- id (UUID, primary key)
-- user_id (UUID, references profiles)
-- equipment_category (TEXT)
-- tool_or_service_type (TEXT)
-- name (TEXT)
-- brand (TEXT)
-- model (TEXT)
-- technology (TEXT)
-- materials (TEXT[])
-- build_volume (TEXT)
-- price_per_hour (DECIMAL)
-- price_per_gram (DECIMAL)
-- description (TEXT)
-- is_active (BOOLEAN)
-- created_at (TIMESTAMP)
-- updated_at (TIMESTAMP)
```

### 3. sellers
Seller-specific information.

```sql
-- Columns needed:
-- id (UUID, primary key)
-- user_id (UUID, references profiles)
-- store_name (TEXT)
-- specialty (TEXT)
-- bio (TEXT)
-- location (TEXT)
-- avatar_url (TEXT)
-- hero_image_url (TEXT)
-- rating (DECIMAL)
-- total_orders (INTEGER)
-- is_verified (BOOLEAN)
-- created_at (TIMESTAMP)
-- updated_at (TIMESTAMP)
```

### 4. listings
Product listings for sellers.

```sql
-- Columns needed:
-- id (UUID, primary key)
-- seller_id (UUID, references sellers)
-- title (TEXT)
-- description (TEXT)
-- price (DECIMAL)
-- images (TEXT[])
-- category (TEXT)
-- stock (INTEGER)
-- is_active (BOOLEAN)
-- views (INTEGER)
-- created_at (TIMESTAMP)
-- updated_at (TIMESTAMP)
```

### 5. orders
Order information.

```sql
-- Columns needed:
-- id (UUID, primary key)
-- buyer_id (UUID, references profiles)
-- seller_id (UUID, references sellers)
-- listing_id (UUID, references listings)
-- status (TEXT: pending, processing, shipped, delivered, cancelled)
-- total_amount (DECIMAL)
-- shipping_address (TEXT/JSON)
-- created_at (TIMESTAMP)
-- updated_at (TIMESTAMP)
```

### 6. reviews
Product/service reviews.

```sql
-- Columns needed:
-- id (UUID, primary key)
-- user_id (UUID, references profiles)
-- seller_id (UUID, references sellers)
-- listing_id (UUID, references listings)
-- rating (INTEGER, 1-5)
-- comment (TEXT)
-- created_at (TIMESTAMP)
-- updated_at (TIMESTAMP)
```

### 7. users
Custom users table (if separate from auth.users).

```sql
-- If this is a custom table, it may reference auth.users
-- Check if this is needed or if profiles table covers this
```

### 8. portfolio
Portfolio items for sellers to showcase their work.

```sql
CREATE TABLE portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  project_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own portfolio" ON portfolio FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own portfolio items" ON portfolio FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own portfolio items" ON portfolio FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own portfolio items" ON portfolio FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Public can view portfolio" ON portfolio FOR SELECT USING (true);
```

### 9. contests
Contests for makers to compete and showcase their work.

```sql
CREATE TABLE contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  theme TEXT NOT NULL,
  category TEXT NOT NULL,
  prize_pool DECIMAL(10,2) NOT NULL DEFAULT 0,
  entry_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_entries INTEGER DEFAULT 100,
  voting_starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  voting_ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  winner_announced_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view contests" ON contests FOR SELECT USING (true);
CREATE POLICY "Admins can create contests" ON contests FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update contests" ON contests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete contests" ON contests FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
```

### 10. contest_entries
Entries for contests submitted by makers.

```sql
CREATE TABLE contest_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  project_url TEXT,
  votes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contest_id, user_id)
);

-- Enable RLS
ALTER TABLE contest_entries ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view contest entries" ON contest_entries FOR SELECT USING (true);
CREATE POLICY "Users can create own contest entries" ON contest_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contest entries" ON contest_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own contest entries" ON contest_entries FOR DELETE USING (auth.uid() = user_id);
```

### 11. contest_votes
Votes for contest entries.

```sql
CREATE TABLE contest_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_entry_id UUID NOT NULL REFERENCES contest_entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contest_entry_id, user_id)
);

-- Enable RLS
ALTER TABLE contest_votes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can vote" ON contest_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own votes" ON contest_votes FOR DELETE USING (auth.uid() = user_id);
```

### 12. contest_winners
Records of contest winners.

```sql
CREATE TABLE contest_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  contest_entry_id UUID NOT NULL REFERENCES contest_entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  prize_amount DECIMAL(10,2),
  announced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contest_id, contest_entry_id)
);

-- Enable RLS
ALTER TABLE contest_winners ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view contest winners" ON contest_winners FOR SELECT USING (true);
CREATE POLICY "Admins can create contest winners" ON contest_winners FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
```

### Enable pg_cron Extension

```sql
-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

### Schedule Contest Sync with pg_cron

```sql
-- Schedule contest sync to run every hour
SELECT cron.schedule(
  'contest-sync-hourly',
  '0 * * * *',
  $$SELECT net.http_post(
    url := 'YOUR_RENDER_URL/api/sync-contests',
    headers := '{"Content-Type": "application/json"}'::jsonb
  )$$
);
```

### SQL Functions for Contest Voting

```sql
-- Function to increment vote count
CREATE OR REPLACE FUNCTION increment_votes_count(entry_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE contest_entries
  SET votes_count = votes_count + 1,
      updated_at = NOW()
  WHERE id = entry_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement vote count
CREATE OR REPLACE FUNCTION decrement_votes_count(entry_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE contest_entries
  SET votes_count = GREATEST(votes_count - 1, 0),
      updated_at = NOW()
  WHERE id = entry_id;
END;
$$ LANGUAGE plpgsql;
```

## SQL to Add Columns to Existing Tables

Run these ALTER TABLE statements in your Supabase SQL editor to add the required columns:

```sql
-- Fix printers table user_id column type (drop policy, column, then recreate)
DROP POLICY IF EXISTS "Users can manage their own printers" ON printers;
ALTER TABLE printers DROP COLUMN IF EXISTS user_id;
ALTER TABLE printers ADD COLUMN user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE printers ADD COLUMN IF NOT EXISTS equipment_group_id UUID REFERENCES equipment_groups(id) ON DELETE SET NULL;
CREATE POLICY "Users can manage their own printers" ON printers FOR ALL USING (auth.uid() = user_id);

-- Add columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS id UUID;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'both', 'admin'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shop_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shop_mode TEXT CHECK (shop_mode IN ('catalog', 'open', 'both'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_connect_account_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_connect_enabled BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'none' CHECK (plan_tier IN ('none', 'basic', 'pro', 'enterprise'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add columns to printers table
ALTER TABLE printers ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid();
ALTER TABLE printers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE printers ADD COLUMN IF NOT EXISTS equipment_category TEXT;
ALTER TABLE printers ADD COLUMN IF NOT EXISTS tool_or_service_type TEXT;
ALTER TABLE printers ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE printers ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE printers ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE printers ADD COLUMN IF NOT EXISTS technology TEXT;
ALTER TABLE printers ADD COLUMN IF NOT EXISTS materials TEXT[];
ALTER TABLE printers ADD COLUMN IF NOT EXISTS build_volume TEXT;
ALTER TABLE printers ADD COLUMN IF NOT EXISTS price_per_hour DECIMAL(10,2);
ALTER TABLE printers ADD COLUMN IF NOT EXISTS price_per_gram DECIMAL(10,4);
ALTER TABLE printers ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE printers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE printers ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE printers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add columns to sellers table
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid();
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS store_name TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS specialty TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add columns to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid();
ALTER TABLE listings ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS images TEXT[];
ALTER TABLE listings ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE listings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid();
ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES profiles(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES sellers(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS listing_id UUID REFERENCES listings(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add columns to reviews table
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid();
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES sellers(id);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS listing_id UUID REFERENCES listings(id);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS comment TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
```

## Code Updates Needed

### 1. Update workspace-stub.ts
Change "equipment" to "printers" in useCreatePrinter function:

```typescript
// Change this line:
.from('equipment')

// To this:
.from('printers')
```

### 2. Check column names
Verify that the column names in your existing tables match what the code expects:
- profiles: shop_name, bio, shop_mode
- printers: equipment_category, tool_or_service_type, materials (as array), build_volume, price_per_hour, price_per_gram
- sellers: store_name, specialty, avatar_url, hero_image_url
- listings: seller_id, title, description, price, images (as array), category, stock

## Integration Status

### Completed
- ✅ Auth context integrated with Supabase
- ✅ Registration flow creates profiles
- ✅ useUpdateUser updates profiles table
- ✅ Contest API functions created
- ✅ Subscription API functions created

### In Progress
- 🔄 Update code to use "printers" table instead of "equipment"
- 🔄 Verify column names match existing tables
- 🔄 Test account registration flow

### Required Actions
1. Update workspace-stub.ts to use "printers" table
2. Verify column names in existing tables match code expectations
3. Test account registration flow
4. Test seller shop creation with printer listing
