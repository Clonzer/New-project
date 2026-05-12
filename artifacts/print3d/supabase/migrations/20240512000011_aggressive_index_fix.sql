-- Aggressive PostgreSQL index size fix
-- This migration drops all potentially problematic indexes and recreates them safely

-- Drop ALL indexes that might exceed size limit
DO $$
BEGIN
    -- Users table indexes
    DROP INDEX IF EXISTS idx_users_email CASCADE;
    DROP INDEX IF EXISTS idx_users_email_pattern CASCADE;
    DROP INDEX IF EXISTS idx_users_email_hash CASCADE;
    DROP INDEX IF EXISTS idx_users_display_name CASCADE;
    DROP INDEX IF EXISTS idx_users_display_name_hash CASCADE;
    DROP INDEX IF EXISTS idx_users_shop_name CASCADE;
    DROP INDEX IF EXISTS idx_users_shop_name_hash CASCADE;
    DROP INDEX IF EXISTS idx_users_banner_url CASCADE;
    DROP INDEX IF EXISTS idx_users_avatar_url CASCADE;
    DROP INDEX IF EXISTS idx_users_location CASCADE;
    DROP INDEX IF EXISTS idx_users_bio CASCADE;
    DROP INDEX IF EXISTS idx_users_brand_story CASCADE;
    DROP INDEX IF EXISTS idx_users_shop_announcement CASCADE;
    
    -- Listings table indexes
    DROP INDEX IF EXISTS idx_listings_title CASCADE;
    DROP INDEX IF EXISTS idx_listings_description CASCADE;
    DROP INDEX IF EXISTS idx_listings_category CASCADE;
    DROP INDEX IF EXISTS idx_listings_seller_id CASCADE;
    DROP INDEX IF EXISTS idx_listings_price CASCADE;
    DROP INDEX IF EXISTS idx_listings_base_price CASCADE;
    DROP INDEX IF EXISTS idx_listings_rating CASCADE;
    DROP INDEX IF EXISTS idx_listings_created_at CASCADE;
    DROP INDEX IF EXISTS idx_listings_updated_at CASCADE;
    DROP INDEX IF EXISTS idx_listings_is_active CASCADE;
    DROP INDEX IF EXISTS idx_listings_is_featured CASCADE;
    
    -- Orders table indexes
    DROP INDEX IF EXISTS idx_orders_buyer_id CASCADE;
    DROP INDEX IF EXISTS idx_orders_seller_id CASCADE;
    DROP INDEX IF EXISTS idx_orders_listing_id CASCADE;
    DROP INDEX IF EXISTS idx_orders_status CASCADE;
    DROP INDEX IF EXISTS idx_orders_created_at CASCADE;
    DROP INDEX IF EXISTS idx_orders_updated_at CASCADE;
    DROP INDEX IF EXISTS idx_orders_total_amount CASCADE;
    
    -- Favorites table indexes
    DROP INDEX IF EXISTS idx_favorites_user_id CASCADE;
    DROP INDEX IF EXISTS idx_favorites_item_id CASCADE;
    DROP INDEX IF EXISTS idx_favorites_item_type CASCADE;
    DROP INDEX IF EXISTS idx_favorites_created_at CASCADE;
    
    -- Cart items table indexes
    DROP INDEX IF EXISTS idx_cart_items_cart_id CASCADE;
    DROP INDEX IF EXISTS idx_cart_items_listing_id CASCADE;
    DROP INDEX IF EXISTS idx_cart_items_quantity CASCADE;
    DROP INDEX IF EXISTS idx_cart_items_created_at CASCADE;
    
    -- Reviews table indexes
    DROP INDEX IF EXISTS idx_reviews_listing_id CASCADE;
    DROP INDEX IF EXISTS idx_reviews_reviewer_id CASCADE;
    DROP INDEX IF EXISTS idx_reviews_rating CASCADE;
    DROP INDEX IF EXISTS idx_reviews_created_at CASCADE;
    DROP INDEX IF EXISTS idx_reviews_comment CASCADE;
    
    -- Messages table indexes
    DROP INDEX IF EXISTS idx_messages_thread_id CASCADE;
    DROP INDEX IF EXISTS idx_messages_sender_id CASCADE;
    DROP INDEX IF EXISTS idx_messages_content CASCADE;
    DROP INDEX IF EXISTS idx_messages_created_at CASCADE;
    DROP INDEX IF EXISTS idx_messages_is_read CASCADE;
    
    -- Message threads table indexes
    DROP INDEX IF EXISTS idx_message_threads_participant_1_id CASCADE;
    DROP INDEX IF EXISTS idx_message_threads_participant_2_id CASCADE;
    DROP INDEX IF EXISTS idx_message_threads_last_message_at CASCADE;
    DROP INDEX IF EXISTS idx_message_threads_created_at CASCADE;
    
    RAISE NOTICE 'Dropped all potentially problematic indexes';
END $$;

-- Recreate only essential indexes with safe approaches
DO $$
BEGIN
    -- Users table - only essential indexes
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_id ON users(id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users USING btree (email) WHERE length(email) <= 255;
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_plan_tier ON users(plan_tier);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_is_verified ON users(is_verified);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users(created_at);
    
    -- Listings table - only essential indexes
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_id ON listings(id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_seller_id ON listings(seller_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_category ON listings(category) WHERE length(category) <= 50;
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_base_price ON listings(base_price);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_rating ON listings(rating);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_created_at ON listings(created_at);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_is_active ON listings(is_active);
    
    -- Orders table - only essential indexes
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_id ON orders(id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created_at ON orders(created_at);
    
    -- Favorites table - only essential indexes
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_id ON favorites(id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_item_id ON favorites(item_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_created_at ON favorites(created_at);
    
    -- Cart items table - only essential indexes
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cart_items_id ON cart_items(id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cart_items_listing_id ON cart_items(listing_id);
    
    -- Reviews table - only essential indexes
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_id ON reviews(id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_listing_id ON reviews(listing_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_rating ON reviews(rating);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);
    
    -- Messages table - only essential indexes
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_id ON messages(id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_created_at ON messages(created_at);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_is_read ON messages(is_read);
    
    -- Message threads table - only essential indexes
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_message_threads_id ON message_threads(id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_message_threads_participant_1_id ON message_threads(participant_1_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_message_threads_participant_2_id ON message_threads(participant_2_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_message_threads_last_message_at ON message_threads(last_message_at);
    
    RAISE NOTICE 'Recreated essential indexes safely';
END $$;

-- Analyze tables to update statistics
DO $$
BEGIN
    ANALYZE users;
    ANALYZE listings;
    ANALYZE orders;
    ANALYZE favorites;
    ANALYZE cart_items;
    ANALYZE reviews;
    ANALYZE messages;
    ANALYZE message_threads;
    
    RAISE NOTICE 'Updated table statistics';
END $$;
