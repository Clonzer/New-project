-- Migration: Fix missing seller_tags column in profiles table
-- Created: 2024-05-04

-- Add seller_tags column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'seller_tags'
    ) THEN
        ALTER TABLE profiles ADD COLUMN seller_tags TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Add other potentially missing columns
DO $$
BEGIN
    -- shop_mode
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'shop_mode'
    ) THEN
        ALTER TABLE profiles ADD COLUMN shop_mode TEXT DEFAULT 'both';
    END IF;

    -- banner_url
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'banner_url'
    ) THEN
        ALTER TABLE profiles ADD COLUMN banner_url TEXT;
    END IF;

    -- bio
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'bio'
    ) THEN
        ALTER TABLE profiles ADD COLUMN bio TEXT;
    END IF;

    -- rating
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'rating'
    ) THEN
        ALTER TABLE profiles ADD COLUMN rating DECIMAL(3,2) DEFAULT 0;
    END IF;

    -- total_orders
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'total_orders'
    ) THEN
        ALTER TABLE profiles ADD COLUMN total_orders INTEGER DEFAULT 0;
    END IF;

    -- shop_name
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'shop_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN shop_name TEXT;
    END IF;
END $$;

-- Create index on seller_tags for faster filtering
CREATE INDEX IF NOT EXISTS idx_profiles_seller_tags ON profiles USING GIN(seller_tags);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
