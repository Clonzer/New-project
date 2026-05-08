-- Fix Database Extensions and Functions
-- ===================================

-- Ensure required extensions are enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure gen_random_uuid function exists
CREATE OR REPLACE FUNCTION gen_random_uuid() 
RETURNS UUID 
LANGUAGE sql 
SECURITY DEFINER 
AS $$SELECT gen_random_uuid()$$;

-- Create or replace update_updated_at_column function (standardized)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
