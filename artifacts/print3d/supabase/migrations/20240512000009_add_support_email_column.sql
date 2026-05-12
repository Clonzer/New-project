-- Add support_email column to users table
-- This migration adds the missing support_email column that the application expects

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'support_email'
    ) THEN
        ALTER TABLE users ADD COLUMN support_email TEXT;
        RAISE NOTICE 'Added support_email column to users table';
    END IF;
END $$;
