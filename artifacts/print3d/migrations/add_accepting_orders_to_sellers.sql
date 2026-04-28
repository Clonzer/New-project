-- Add accepting_orders column to sellers table
-- This allows sellers to toggle whether they're accepting new orders

-- Add column with default true (accepting orders by default)
ALTER TABLE sellers 
ADD COLUMN IF NOT EXISTS accepting_orders BOOLEAN DEFAULT TRUE;

-- Create index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_sellers_accepting_orders 
ON sellers(accepting_orders) 
WHERE accepting_orders = TRUE;

-- Add comment explaining the column
COMMENT ON COLUMN sellers.accepting_orders IS 'Whether the seller is currently accepting new orders. FALSE hides their products from browse/search.';

-- Update all existing sellers to accept orders by default
UPDATE sellers 
SET accepting_orders = TRUE 
WHERE accepting_orders IS NULL;
