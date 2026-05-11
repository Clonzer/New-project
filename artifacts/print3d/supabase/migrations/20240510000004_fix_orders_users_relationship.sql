-- Fix foreign key relationship between orders and users tables
-- This migration fixes the buyer_id relationship that's causing API errors

-- First, check if orders table exists and has correct structure
DO $$
BEGIN
    -- Check if buyer_id column exists and get its data type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'buyer_id'
    ) THEN
        -- Drop existing buyer_id column if it's the wrong type (integer)
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'orders' 
            AND column_name = 'buyer_id'
            AND data_type = 'integer'
        ) THEN
            ALTER TABLE orders DROP COLUMN buyer_id CASCADE;
            RAISE NOTICE 'Dropped integer buyer_id column with CASCADE';
        END IF;
        
        -- Add buyer_id column as UUID if it doesn't exist
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
        -- Drop existing seller_id column if it's the wrong type
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'orders' 
            AND column_name = 'seller_id'
            AND data_type = 'integer'
        ) THEN
            ALTER TABLE orders DROP COLUMN seller_id CASCADE;
            RAISE NOTICE 'Dropped integer seller_id column with CASCADE';
        END IF;
        
        -- Add seller_id column as UUID if it doesn't exist
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

    -- Drop any existing foreign key constraints
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'orders' 
        AND constraint_name = 'orders_buyer_id_fkey'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        ALTER TABLE orders DROP CONSTRAINT orders_buyer_id_fkey;
        RAISE NOTICE 'Dropped existing buyer_id foreign key constraint';
    END IF;

    -- Create proper foreign key constraint
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'buyer_id'
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE orders ADD CONSTRAINT orders_buyer_id_fkey 
            FOREIGN KEY (buyer_id) REFERENCES auth.users(id) ON DELETE SET NULL;
        RAISE NOTICE 'Created buyer_id foreign key to auth.users';
    END IF;
END $$;

-- Drop existing shipping_labels policy if it exists
DROP POLICY IF EXISTS "Sellers can view their shipping labels" ON shipping_labels;

-- Recreate shipping_labels policy that depends on seller_id
CREATE POLICY "Sellers can view their shipping labels" ON shipping_labels
    FOR SELECT 
        (auth.uid()) = sellers.user_id 
    FROM sellers;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);

RAISE NOTICE 'Orders-users relationship migration completed successfully';
