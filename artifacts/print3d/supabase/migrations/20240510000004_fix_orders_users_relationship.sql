-- Fix foreign key relationship between orders and users tables
-- This migration fixes the buyer_id relationship that's causing API errors

-- First, check if orders table exists and has correct structure
DO $$
BEGIN
    -- Add buyer_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'buyer_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added buyer_id column to orders table';
    END IF;

    -- Add seller_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'seller_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN seller_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added seller_id column to orders table';
    END IF;

    -- Drop old foreign key if it exists with wrong reference
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'orders' 
        AND constraint_name = 'orders_buyer_id_fkey'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        ALTER TABLE orders DROP CONSTRAINT orders_buyer_id_fkey;
        RAISE NOTICE 'Dropped old buyer_id foreign key constraint';
    END IF;

    -- Recreate foreign key with correct reference to auth.users
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'orders' 
        AND constraint_name = 'orders_buyer_id_fkey'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        ALTER TABLE orders ADD CONSTRAINT orders_buyer_id_fkey 
            FOREIGN KEY (buyer_id) REFERENCES auth.users(id) ON DELETE SET NULL;
        RAISE NOTICE 'Created buyer_id foreign key to auth.users';
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);

RAISE NOTICE 'Orders-users relationship migration completed successfully';
