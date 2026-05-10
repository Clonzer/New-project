-- Add missing columns to users table
-- This migration ensures all necessary columns exist for profile functionality

-- Add banner_url column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'banner_url'
    ) THEN
        ALTER TABLE users ADD COLUMN banner_url TEXT;
        RAISE NOTICE 'Added banner_url column to users table';
    END IF;
END $$;

-- Add instagram_handle column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'instagram_handle'
    ) THEN
        ALTER TABLE users ADD COLUMN instagram_handle TEXT;
        RAISE NOTICE 'Added instagram_handle column to users table';
    END IF;
END $$;

-- Add tiktok_handle column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'tiktok_handle'
    ) THEN
        ALTER TABLE users ADD COLUMN tiktok_handle TEXT;
        RAISE NOTICE 'Added tiktok_handle column to users table';
    END IF;
END $$;

-- Add x_handle column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'x_handle'
    ) THEN
        ALTER TABLE users ADD COLUMN x_handle TEXT;
        RAISE NOTICE 'Added x_handle column to users table';
    END IF;
END $$;

-- Add brand_story column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'brand_story'
    ) THEN
        ALTER TABLE users ADD COLUMN brand_story TEXT;
        RAISE NOTICE 'Added brand_story column to users table';
    END IF;
END $$;

-- Add website_url column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'website_url'
    ) THEN
        ALTER TABLE users ADD COLUMN website_url TEXT;
        RAISE NOTICE 'Added website_url column to users table';
    END IF;
END $$;

-- Add local_pickup_enabled column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'local_pickup_enabled'
    ) THEN
        ALTER TABLE users ADD COLUMN local_pickup_enabled BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added local_pickup_enabled column to users table';
    END IF;
END $$;

-- Add tax_rate column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'tax_rate'
    ) THEN
        ALTER TABLE users ADD COLUMN tax_rate DECIMAL(5,4) DEFAULT 0.0000;
        RAISE NOTICE 'Added tax_rate column to users table';
    END IF;
END $$;

-- Add processing_days_min column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'processing_days_min'
    ) THEN
        ALTER TABLE users ADD COLUMN processing_days_min INTEGER DEFAULT 1;
        RAISE NOTICE 'Added processing_days_min column to users table';
    END IF;
END $$;

-- Add processing_days_max column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'processing_days_max'
    ) THEN
        ALTER TABLE users ADD COLUMN processing_days_max INTEGER DEFAULT 7;
        RAISE NOTICE 'Added processing_days_max column to users table';
    END IF;
END $$;

-- Add shipping_policy column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'shipping_policy'
    ) THEN
        ALTER TABLE users ADD COLUMN shipping_policy TEXT;
        RAISE NOTICE 'Added shipping_policy column to users table';
    END IF;
END $$;

-- Add custom_order_policy column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'custom_order_policy'
    ) THEN
        ALTER TABLE users ADD COLUMN custom_order_policy TEXT;
        RAISE NOTICE 'Added custom_order_policy column to users table';
    END IF;
END $$;

-- Add primary_color column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'primary_color'
    ) THEN
        ALTER TABLE users ADD COLUMN primary_color TEXT DEFAULT '#8b5cf6';
        RAISE NOTICE 'Added primary_color column to users table';
    END IF;
END $$;

-- Add accent_color column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'accent_color'
    ) THEN
        ALTER TABLE users ADD COLUMN accent_color TEXT DEFAULT '#06b6d4';
        RAISE NOTICE 'Added accent_color column to users table';
    END IF;
END $$;

-- Add background_color column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'background_color'
    ) THEN
        ALTER TABLE users ADD COLUMN background_color TEXT DEFAULT '#09090b';
        RAISE NOTICE 'Added background_color column to users table';
    END IF;
END $$;

-- Add text_color column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'text_color'
    ) THEN
        ALTER TABLE users ADD COLUMN text_color TEXT DEFAULT '#ffffff';
        RAISE NOTICE 'Added text_color column to users table';
    END IF;
END $$;

-- Add default_shipping_cost column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'default_shipping_cost'
    ) THEN
        ALTER TABLE users ADD COLUMN default_shipping_cost DECIMAL(10,2) DEFAULT 5.00;
        RAISE NOTICE 'Added default_shipping_cost column to users table';
    END IF;
END $$;

-- Add shipping_regions column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'shipping_regions'
    ) THEN
        ALTER TABLE users ADD COLUMN shipping_regions TEXT DEFAULT 'UK';
        RAISE NOTICE 'Added shipping_regions column to users table';
    END IF;
END $$;

-- Add selling_regions column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'selling_regions'
    ) THEN
        ALTER TABLE users ADD COLUMN selling_regions TEXT[] DEFAULT ARRAY['UK'];
        RAISE NOTICE 'Added selling_regions column to users table';
    END IF;
END $$;

-- Add domestic_shipping_cost column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'domestic_shipping_cost'
    ) THEN
        ALTER TABLE users ADD COLUMN domestic_shipping_cost DECIMAL(10,2) DEFAULT 3.50;
        RAISE NOTICE 'Added domestic_shipping_cost column to users table';
    END IF;
END $$;

-- Add europe_shipping_cost column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'europe_shipping_cost'
    ) THEN
        ALTER TABLE users ADD COLUMN europe_shipping_cost DECIMAL(10,2) DEFAULT 8.00;
        RAISE NOTICE 'Added europe_shipping_cost column to users table';
    END IF;
END $$;

-- Add north_america_shipping_cost column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'north_america_shipping_cost'
    ) THEN
        ALTER TABLE users ADD COLUMN north_america_shipping_cost DECIMAL(10,2) DEFAULT 12.00;
        RAISE NOTICE 'Added north_america_shipping_cost column to users table';
    END IF;
END $$;

-- Add international_shipping_cost column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'international_shipping_cost'
    ) THEN
        ALTER TABLE users ADD COLUMN international_shipping_cost DECIMAL(10,2) DEFAULT 25.00;
        RAISE NOTICE 'Added international_shipping_cost column to users table';
    END IF;
END $$;

-- Add free_shipping_threshold column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'free_shipping_threshold'
    ) THEN
        ALTER TABLE users ADD COLUMN free_shipping_threshold DECIMAL(10,2) DEFAULT 50.00;
        RAISE NOTICE 'Added free_shipping_threshold column to users table';
    END IF;
END $$;

-- Add theme column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'theme'
    ) THEN
        ALTER TABLE users ADD COLUMN theme TEXT DEFAULT 'dark';
        RAISE NOTICE 'Added theme column to users table';
    END IF;
END $$;

-- Add layout_style column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'layout_style'
    ) THEN
        ALTER TABLE users ADD COLUMN layout_style TEXT DEFAULT 'grid';
        RAISE NOTICE 'Added layout_style column to users table';
    END IF;
END $$;

-- Add font_style column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'font_style'
    ) THEN
        ALTER TABLE users ADD COLUMN font_style TEXT DEFAULT 'modern';
        RAISE NOTICE 'Added font_style column to users table';
    END IF;
END $$;

-- Add show_ratings column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'show_ratings'
    ) THEN
        ALTER TABLE users ADD COLUMN show_ratings BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Added show_ratings column to users table';
    END IF;
END $$;

-- Add show_sales column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'show_sales'
    ) THEN
        ALTER TABLE users ADD COLUMN show_sales BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Added show_sales column to users table';
    END IF;
END $$;

-- Add show_banner column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'show_banner'
    ) THEN
        ALTER TABLE users ADD COLUMN show_banner BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Added show_banner column to users table';
    END IF;
END $$;

-- Add compact_view column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'compact_view'
    ) THEN
        ALTER TABLE users ADD COLUMN compact_view BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added compact_view column to users table';
    END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_banner_url ON users(banner_url);
CREATE INDEX IF NOT EXISTS idx_users_shop_name ON users(shop_name);
CREATE INDEX IF NOT EXISTS idx_users_display_name ON users(display_name);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

RAISE NOTICE 'Database migration completed successfully';
