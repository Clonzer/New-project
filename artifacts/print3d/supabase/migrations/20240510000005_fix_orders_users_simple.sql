-- Fix foreign key relationship between orders and users tables - Simplified Version
-- This migration fixes the buyer_id relationship with minimal SQL

-- Drop existing foreign key constraints if they exist
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_buyer_id_fkey;

-- Add UUID columns if they don't exist or have wrong type
DO $$
BEGIN
    -- Check and fix buyer_id column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'buyer_id'
    ) THEN
        -- If column exists but is wrong type, drop it
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'orders' 
            AND column_name = 'buyer_id'
            AND data_type = 'integer'
        ) THEN
            ALTER TABLE orders DROP COLUMN buyer_id CASCADE;
            RAISE NOTICE 'Dropped integer buyer_id column with CASCADE';
        END IF;
        
        -- Add UUID column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'orders' 
            AND column_name = 'buyer_id'
            AND data_type = 'uuid'
        ) THEN
            ALTER TABLE orders ADD COLUMN buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
            RAISE NOTICE 'Added UUID buyer_id column to orders table';
        END IF;
    END IF;

    -- Check and fix seller_id column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'seller_id'
    ) THEN
        -- If column exists but is wrong type, drop it
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'orders' 
            AND column_name = 'seller_id'
            AND data_type = 'integer'
        ) THEN
            ALTER TABLE orders DROP COLUMN seller_id CASCADE;
            RAISE NOTICE 'Dropped integer seller_id column with CASCADE';
        END IF;
        
        -- Add UUID column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'orders' 
            AND column_name = 'seller_id'
            AND data_type = 'uuid'
        ) THEN
            ALTER TABLE orders ADD COLUMN seller_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
            RAISE NOTICE 'Added UUID seller_id column to orders table';
        END IF;
    END IF;
END $$;

-- Create foreign key constraints
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'buyer_id'
        AND data_type = 'uuid'
    ) THEN
        -- Drop existing constraint if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'orders' 
            AND constraint_name = 'orders_buyer_id_fkey'
            AND constraint_type = 'FOREIGN KEY'
        ) THEN
            ALTER TABLE orders DROP CONSTRAINT orders_buyer_id_fkey;
            RAISE NOTICE 'Dropped existing buyer_id foreign key constraint';
        END IF;
        
        -- Create new constraint
        ALTER TABLE orders ADD CONSTRAINT orders_buyer_id_fkey 
            FOREIGN KEY (buyer_id) REFERENCES auth.users(id) ON DELETE SET NULL;
        RAISE NOTICE 'Created buyer_id foreign key to auth.users';
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);

RAISE NOTICE 'Orders-users relationship migration completed successfully';
