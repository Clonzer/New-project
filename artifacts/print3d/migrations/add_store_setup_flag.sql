-- Add store_setup_complete flag to sellers table
-- This flag indicates whether the seller has completed the store setup process

-- Add the column to sellers table
ALTER TABLE sellers 
ADD COLUMN IF NOT EXISTS store_setup_complete BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN sellers.store_setup_complete IS 'Whether the seller has completed the store setup wizard. Only completed stores appear on the site.';

-- Create index for filtering
CREATE INDEX IF NOT EXISTS idx_sellers_store_setup_complete ON sellers(store_setup_complete);

-- Update RLS policy to ensure users can only see completed stores in public queries
-- (Note: existing sellers can see their own incomplete store)

-- Function to check if a store should be publicly visible
CREATE OR REPLACE FUNCTION is_store_publicly_visible(seller_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_complete BOOLEAN;
  accepting_orders BOOLEAN;
BEGIN
  SELECT store_setup_complete, COALESCE(accepting_orders, true)
  INTO is_complete, accepting_orders
  FROM sellers
  WHERE user_id = seller_id;
  
  RETURN is_complete = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Create a view for publicly visible sellers
CREATE OR REPLACE VIEW public_sellers AS
SELECT s.*
FROM sellers s
WHERE s.store_setup_complete = true;

COMMENT ON VIEW public_sellers IS 'View of sellers that have completed store setup and are publicly visible';
