-- Comprehensive Schema Setup
-- This migration ensures all required tables and columns exist for the site
-- Includes user settings, listings, orders, favorites, etc.

-- =============================================
-- USERS TABLE - Complete user profile and settings
-- =============================================

-- Add missing user profile columns
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'display_name'
    ) THEN
        ALTER TABLE users ADD COLUMN display_name TEXT;
        RAISE NOTICE 'Added display_name column to users table';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE users ADD COLUMN avatar_url TEXT;
        RAISE NOTICE 'Added avatar_url column to users table';
    END IF;
END $$;

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

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'location'
    ) THEN
        ALTER TABLE users ADD COLUMN location TEXT;
        RAISE NOTICE 'Added location column to users table';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'shop_mode'
    ) THEN
        ALTER TABLE users ADD COLUMN shop_mode TEXT DEFAULT 'both';
        RAISE NOTICE 'Added shop_mode column to users table';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'seller_tags'
    ) THEN
        ALTER TABLE users ADD COLUMN seller_tags TEXT[] DEFAULT ARRAY['3D Printing', 'Fast Turnaround'];
        RAISE NOTICE 'Added seller_tags column to users table';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'shop_announcement'
    ) THEN
        ALTER TABLE users ADD COLUMN shop_announcement TEXT;
        RAISE NOTICE 'Added shop_announcement column to users table';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'is_verified'
    ) THEN
        ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added is_verified column to users table';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'plan_tier'
    ) THEN
        ALTER TABLE users ADD COLUMN plan_tier TEXT DEFAULT 'starter';
        RAISE NOTICE 'Added plan_tier column to users table';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'total_xp'
    ) THEN
        ALTER TABLE users ADD COLUMN total_xp INTEGER DEFAULT 0;
        RAISE NOTICE 'Added total_xp column to users table';
    END IF;
END $$;

-- =============================================
-- LISTINGS TABLE - Product listings
-- =============================================

-- Create listings table if it doesn't exist
CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT ARRAY[],
    base_price DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) DEFAULT 0.00,
    images TEXT[] DEFAULT ARRAY[],
    stock_quantity INTEGER DEFAULT 1,
    track_stock BOOLEAN DEFAULT TRUE,
    estimated_days_min INTEGER DEFAULT 3,
    estimated_days_max INTEGER DEFAULT 7,
    listing_type TEXT DEFAULT 'product',
    service_category TEXT,
    service_type TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    order_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing listing columns only if table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'listings'
    ) THEN
        -- Add rating column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'listings' 
            AND column_name = 'rating'
        ) THEN
            ALTER TABLE listings ADD COLUMN rating DECIMAL(3,2) DEFAULT 0.00;
            RAISE NOTICE 'Added rating column to listings table';
        END IF;
        
        -- Add review_count column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'listings' 
            AND column_name = 'review_count'
        ) THEN
            ALTER TABLE listings ADD COLUMN review_count INTEGER DEFAULT 0;
            RAISE NOTICE 'Added review_count column to listings table';
        END IF;
        
        -- Add base_price column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'listings' 
            AND column_name = 'base_price'
        ) THEN
            ALTER TABLE listings ADD COLUMN base_price DECIMAL(10,2) DEFAULT 0.00;
            RAISE NOTICE 'Added base_price column to listings table';
        END IF;
    END IF;
END $$;

-- =============================================
-- ORDERS TABLE - Order management
-- =============================================

-- Create orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address JSONB,
    tracking_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- FAVORITES TABLE - User favorites
-- =============================================

-- Create favorites table if it doesn't exist
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL,
    item_type TEXT DEFAULT 'listing',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, item_id, item_type)
);

-- Add missing columns to favorites table only if table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'favorites'
    ) THEN
        -- Add user_id column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'favorites' 
            AND column_name = 'user_id'
        ) THEN
            ALTER TABLE favorites ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added user_id column to favorites table';
        END IF;
        
        -- Add item_id column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'favorites' 
            AND column_name = 'item_id'
        ) THEN
            ALTER TABLE favorites ADD COLUMN item_id UUID NOT NULL;
            RAISE NOTICE 'Added item_id column to favorites table';
        END IF;
        
        -- Add item_type column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'favorites' 
            AND column_name = 'item_type'
        ) THEN
            ALTER TABLE favorites ADD COLUMN item_type TEXT DEFAULT 'listing';
            RAISE NOTICE 'Added item_type column to favorites table';
        END IF;
    END IF;
END $$;

-- =============================================
-- CARTS TABLE - Shopping cart
-- =============================================

-- Create carts table if it doesn't exist
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CART_ITEMS TABLE - Shopping cart items
-- =============================================

-- Create cart_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to cart_items table only if table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'cart_items'
    ) THEN
        -- Add cart_id column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'cart_items' 
            AND column_name = 'cart_id'
        ) THEN
            ALTER TABLE cart_items ADD COLUMN cart_id UUID REFERENCES carts(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added cart_id column to cart_items table';
        END IF;
        
        -- Add listing_id column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'cart_items' 
            AND column_name = 'listing_id'
        ) THEN
            ALTER TABLE cart_items ADD COLUMN listing_id UUID REFERENCES listings(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added listing_id column to cart_items table';
        END IF;
    END IF;
END $$;

-- =============================================
-- REVIEWS TABLE - Product reviews
-- =============================================

-- Create reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(listing_id, reviewer_id)
);

-- Add missing columns to reviews table only if table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'reviews'
    ) THEN
        -- Add listing_id column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'reviews' 
            AND column_name = 'listing_id'
        ) THEN
            ALTER TABLE reviews ADD COLUMN listing_id UUID REFERENCES listings(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added listing_id column to reviews table';
        END IF;
        
        -- Add reviewer_id column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'reviews' 
            AND column_name = 'reviewer_id'
        ) THEN
            ALTER TABLE reviews ADD COLUMN reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added reviewer_id column to reviews table';
        END IF;
        
        -- Add rating column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'reviews' 
            AND column_name = 'rating'
        ) THEN
            ALTER TABLE reviews ADD COLUMN rating INTEGER CHECK (rating >= 1 AND rating <= 5);
            RAISE NOTICE 'Added rating column to reviews table';
        END IF;
    END IF;
END $$;

-- =============================================
-- MESSAGES TABLE - Direct messaging
-- =============================================

-- Create message_threads table if it doesn't exist
CREATE TABLE IF NOT EXISTS message_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_1_id UUID REFERENCES users(id) ON DELETE CASCADE,
    participant_2_id UUID REFERENCES users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to messages table only if table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'messages'
    ) THEN
        -- Add thread_id column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'messages' 
            AND column_name = 'thread_id'
        ) THEN
            ALTER TABLE messages ADD COLUMN thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added thread_id column to messages table';
        END IF;
        
        -- Add sender_id column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'messages' 
            AND column_name = 'sender_id'
        ) THEN
            ALTER TABLE messages ADD COLUMN sender_id UUID REFERENCES users(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added sender_id column to messages table';
        END IF;
    END IF;
END $$;

-- =============================================
-- INDEXES - Performance optimization
-- =============================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_plan_tier ON users(plan_tier);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location);

-- Listings table indexes (only create if table and columns exist)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'listings'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON listings(seller_id);
        
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'listings' 
            AND column_name = 'category'
        ) THEN
            CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
        END IF;
        
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'listings' 
            AND column_name = 'base_price'
        ) THEN
            CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(base_price);
        END IF;
        
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'listings' 
            AND column_name = 'rating'
        ) THEN
            CREATE INDEX IF NOT EXISTS idx_listings_rating ON listings(rating);
        END IF;
        
        CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at);
        CREATE INDEX IF NOT EXISTS idx_listings_is_active ON listings(is_active);
    END IF;
END $$;

-- Orders table indexes (only create if table exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'orders'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
        CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
        CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
        CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
    END IF;
END $$;

-- Favorites table indexes (only create if table exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'favorites'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
        CREATE INDEX IF NOT EXISTS idx_favorites_item_id ON favorites(item_id);
    END IF;
END $$;

-- Cart items indexes (only create if table exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'cart_items'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
        CREATE INDEX IF NOT EXISTS idx_cart_items_listing_id ON cart_items(listing_id);
    END IF;
END $$;

-- Reviews table indexes (only create if table exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'reviews'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_reviews_listing_id ON reviews(listing_id);
        CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
        CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
    END IF;
END $$;

-- Messages table indexes (only create if table exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'messages'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
        CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
        CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
    END IF;
END $$;

RAISE NOTICE 'Comprehensive schema setup completed successfully';
