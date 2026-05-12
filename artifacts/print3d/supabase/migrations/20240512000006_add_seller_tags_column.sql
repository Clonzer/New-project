-- Add seller_tags column to users table
-- This migration adds the missing seller_tags column that the application expects

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
