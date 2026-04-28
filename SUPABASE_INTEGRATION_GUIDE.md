# Supabase Integration Guide for Synthix

## Overview
This guide walks you through integrating Supabase authentication and database into the Synthix 3D printing marketplace.

## Step 1: Install Dependencies

```bash
cd artifacts/print3d
npm install @supabase/supabase-js
```

## Step 2: Create Supabase Account & Project

1. Go to [https://supabase.com](https://supabase.com) and sign up
2. Create a new project (name it "synthix" or similar)
3. Wait for the project to be created (takes 1-2 minutes)
4. Note down your **Project URL** and **anon/public key** from the API settings

## Step 3: Configure Environment Variables

Create a `.env` file in `artifacts/print3d/`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Replace with your actual credentials from Supabase dashboard**

## Step 4: Set Up Database Schema

In your Supabase dashboard, go to the **SQL Editor** and run:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'both', 'admin')),
  name TEXT,
  avatar TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  stripe_connect_account_id TEXT,
  stripe_connect_enabled BOOLEAN DEFAULT FALSE,
  is_sponsored BOOLEAN DEFAULT FALSE,
  plan_tier TEXT DEFAULT 'none' CHECK (plan_tier IN ('none', 'basic', 'pro', 'enterprise')),
  shop_name TEXT,
  bio TEXT,
  shop_mode TEXT DEFAULT 'both' CHECK (shop_mode IN ('catalog', 'open', 'both')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow insert during signup" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Printers/Equipment table
CREATE TABLE printers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

ALTER TABLE printers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view printers" ON printers
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own printers" ON printers
  FOR ALL USING (auth.uid() = user_id);

-- Listings table
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price DECIMAL(10,2),
  images TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  stock_quantity INTEGER DEFAULT 0,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active listings" ON listings
  FOR SELECT USING (is_active = true);

CREATE POLICY "Sellers can manage their listings" ON listings
  FOR ALL USING (auth.uid() = user_id);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES users(id),
  seller_id UUID NOT NULL REFERENCES users(id),
  listing_id UUID REFERENCES listings(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view their orders" ON orders
  FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can view orders for their listings" ON orders
  FOR SELECT USING (auth.uid() = seller_id);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  reviewer_id UUID NOT NULL REFERENCES users(id),
  reviewee_id UUID NOT NULL REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for their completed orders" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = order_id 
      AND status = 'completed' 
      AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, is_verified)
  VALUES (NEW.id, NEW.email, NEW.email_confirmed_at IS NOT NULL);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## Step 5: Enable Email Auth Provider

1. In Supabase Dashboard, go to **Authentication → Providers**
2. Enable **Email** provider
3. Configure email confirmation settings as needed
4. (Optional) Enable **Google** OAuth if you want social login

## Step 6: Verify Integration

Test the following flows:

1. **Registration**: Visit `/register` and create a new account
2. **Login**: Visit `/login` and sign in
3. **Protected Routes**: Try accessing `/dashboard` while logged out (should redirect)
4. **Logout**: Click logout button

## Troubleshooting

### Issue: "Cannot find module '@supabase/supabase-js'"
**Solution**: Run `npm install` to install dependencies

### Issue: Blank screen after integration
**Solution**: 
- Check browser console for errors
- Verify `.env` variables are set correctly
- Ensure Supabase project is not in "Paused" state

### Issue: "Invalid login credentials"
**Solution**:
- Check that email confirmation is enabled/disabled as expected
- Verify user exists in Supabase Auth dashboard
- Check that `users` table row was created

### Issue: RLS errors
**Solution**:
- Verify policies are created correctly
- Check that user is authenticated (check `auth.uid()`)

## API Usage Examples

### Using Supabase Client Directly

```typescript
import { supabase } from '@/lib/supabase';

// Fetch listings
const { data: listings } = await supabase
  .from('listings')
  .select('*')
  .eq('is_active', true);

// Create listing (authenticated)
const { data, error } = await supabase
  .from('listings')
  .insert({
    user_id: user.id,
    title: '3D Print Service',
    price: 50.00
  });
```

### Using Auth Hooks

```typescript
import { useAuth } from '@/contexts/supabase-auth-context';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  // Use auth methods...
}
```

## Security Checklist

- [ ] Row Level Security (RLS) enabled on all tables
- [ ] Policies created for each table
- [ ] Environment variables not committed to git
- [ ] `.env` file added to `.gitignore`
- [ ] Email confirmation configured
- [ ] Strong password policy enabled in Supabase

## Next Steps

1. Set up Stripe integration for payments
2. Configure email templates in Supabase
3. Add image upload storage bucket
4. Set up webhooks for order notifications
5. Configure Google OAuth provider

## Files Modified/Created

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Supabase client |
| `src/contexts/supabase-auth-context.tsx` | Auth provider |
| `src/pages/login.tsx` | Login page |
| `src/pages/register.tsx` | Registration page |
| `src/components/auth/ProtectedRoute.tsx` | Route protection |
| `src/App.tsx` | Updated auth provider |
| `.env.example` | Environment template |
| `src/vite-env.d.ts` | Type declarations |
