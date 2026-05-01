-- Add notes column to custom_order_requests table
-- This fixes the error: "Could not find the 'notes' column of 'custom_order_requests' in the schema cache"

ALTER TABLE custom_order_requests
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN custom_order_requests.notes IS 'Additional notes or special instructions for the custom order request';
