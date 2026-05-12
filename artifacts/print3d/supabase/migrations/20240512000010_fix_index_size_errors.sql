-- Fix PostgreSQL index size errors
-- This migration fixes indexes that exceed the 8191 byte limit

-- Drop problematic indexes on large text fields and recreate with proper operators
DO $$
BEGIN
    -- Drop indexes on potentially large text fields that might exceed size limit
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'users' 
        AND indexname = 'idx_users_email'
    ) THEN
        DROP INDEX idx_users_email;
        RAISE NOTICE 'Dropped idx_users_email index';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'users' 
        AND indexname = 'idx_users_display_name'
    ) THEN
        DROP INDEX idx_users_display_name;
        RAISE NOTICE 'Dropped idx_users_display_name index';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'users' 
        AND indexname = 'idx_users_shop_name'
    ) THEN
        DROP INDEX idx_users_shop_name;
        RAISE NOTICE 'Dropped idx_users_shop_name index';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'listings' 
        AND indexname = 'idx_listings_title'
    ) THEN
        DROP INDEX idx_listings_title;
        RAISE NOTICE 'Dropped idx_listings_title index';
    END IF;
END $$;

-- Recreate indexes with text pattern ops or hash indexes for large text fields
DO $$
BEGIN
    -- Create email index with text pattern ops (safer for large text)
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_pattern ON users USING btree (email text_pattern_ops);
    
    -- Create hash indexes for other text fields that might be large
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_display_name_hash ON users USING hash (display_name);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_shop_name_hash ON users USING hash (shop_name);
    
    -- Keep existing indexes on smaller fields
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_plan_tier ON users(plan_tier);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_location ON users(location);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_is_verified ON users(is_verified);
    
    -- Listings indexes - avoid indexing large text fields
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_seller_id ON listings(seller_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_category ON listings(category);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_price ON listings(base_price);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_rating ON listings(rating);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_created_at ON listings(created_at);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_is_active ON listings(is_active);
    
    -- Orders indexes
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created_at ON orders(created_at);
    
    -- Favorites indexes
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_item_id ON favorites(item_id);
    
    -- Cart items indexes
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cart_items_listing_id ON cart_items(listing_id);
    
    -- Reviews indexes
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_listing_id ON reviews(listing_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_rating ON reviews(rating);
    
    -- Messages indexes
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_created_at ON messages(created_at);
    
    RAISE NOTICE 'Fixed index size errors by using appropriate index types';
END $$;
