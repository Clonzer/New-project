-- Migration: Add service quotes table for marketplace-style custom orders
-- This allows multiple sellers to quote on a single buyer request

-- Create service_quotes table
CREATE TABLE IF NOT EXISTS service_quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id UUID NOT NULL REFERENCES custom_order_requests(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    price DECIMAL(10, 2) NOT NULL,
    message TEXT,
    delivery_days INTEGER DEFAULT 7,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(request_id, seller_id) -- One quote per seller per request
);

-- Add index for faster lookups
CREATE INDEX idx_service_quotes_request_id ON service_quotes(request_id);
CREATE INDEX idx_service_quotes_seller_id ON service_quotes(seller_id);
CREATE INDEX idx_service_quotes_status ON service_quotes(status);

-- Enable RLS on service_quotes
ALTER TABLE service_quotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service_quotes

-- Sellers can view their own quotes
CREATE POLICY "Sellers can view their own quotes" ON service_quotes
    FOR SELECT USING (auth.uid() = seller_id);

-- Buyers can view quotes on their requests
CREATE POLICY "Buyers can view quotes on their requests" ON service_quotes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM custom_order_requests 
            WHERE custom_order_requests.id = service_quotes.request_id 
            AND custom_order_requests.buyer_id = auth.uid()
        )
    );

-- Sellers can create quotes
CREATE POLICY "Sellers can create quotes" ON service_quotes
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Sellers can update their own quotes
CREATE POLICY "Sellers can update their own quotes" ON service_quotes
    FOR UPDATE USING (auth.uid() = seller_id);

-- Sellers can delete their own quotes
CREATE POLICY "Sellers can delete their own quotes" ON service_quotes
    FOR DELETE USING (auth.uid() = seller_id);

-- Modify custom_order_requests to support marketplace (seller_id becomes nullable)
-- This allows public requests that any seller can quote on
ALTER TABLE custom_order_requests ALTER COLUMN seller_id DROP NOT NULL;

-- Add index for marketplace queries (requests without a specific seller)
CREATE INDEX IF NOT EXISTS idx_custom_order_requests_seller_id ON custom_order_requests(seller_id);

-- Update RLS policy on custom_order_requests to allow public viewing of marketplace requests
DROP POLICY IF EXISTS "Sellers can view requests sent to them" ON custom_order_requests;

-- Allow sellers to see all marketplace requests (where seller_id is null)
CREATE POLICY "Sellers can view marketplace requests" ON custom_order_requests
    FOR SELECT USING (
        seller_id IS NULL 
        OR seller_id = auth.uid()
        OR buyer_id = auth.uid()
    );

-- Add comment explaining the marketplace feature
COMMENT ON TABLE service_quotes IS 'Stores quotes from sellers on buyer service requests. Enables marketplace-style bidding where multiple sellers can quote on a single request.';
COMMENT ON COLUMN custom_order_requests.seller_id IS 'NULL for marketplace requests (open to all sellers), or specific seller ID for direct requests';
