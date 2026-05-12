-- Add shop_announcement column to users table
-- This migration adds the missing shop_announcement column that the application expects

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
