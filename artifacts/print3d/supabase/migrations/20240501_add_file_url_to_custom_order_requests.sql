-- Add file_url column to custom_order_requests table
-- This fixes the error: "Could not find the 'file_url' column of 'custom_order_requests' in the schema cache"

ALTER TABLE custom_order_requests
ADD COLUMN IF NOT EXISTS file_url TEXT;

-- Also add file_name and file_type columns for better file tracking
ALTER TABLE custom_order_requests
ADD COLUMN IF NOT EXISTS file_name TEXT;

ALTER TABLE custom_order_requests
ADD COLUMN IF NOT EXISTS file_type TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN custom_order_requests.file_url IS 'URL to uploaded file in storage bucket';
COMMENT ON COLUMN custom_order_requests.file_name IS 'Original filename of uploaded file';
COMMENT ON COLUMN custom_order_requests.file_type IS 'MIME type of uploaded file';
