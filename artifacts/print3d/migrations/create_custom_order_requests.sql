-- Create custom_order_requests table for quote-based custom orders
CREATE TABLE IF NOT EXISTS custom_order_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  material TEXT NOT NULL,
  color TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  file_url TEXT,
  shipping_address TEXT NOT NULL,
  proposed_price DECIMAL(10, 2),
  quoted_price DECIMAL(10, 2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'accepted', 'rejected', 'cancelled', 'paid')),
  quote_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  quoted_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_custom_order_requests_buyer_id ON custom_order_requests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_custom_order_requests_seller_id ON custom_order_requests(seller_id);
CREATE INDEX IF NOT EXISTS idx_custom_order_requests_status ON custom_order_requests(status);
CREATE INDEX IF NOT EXISTS idx_custom_order_requests_created_at ON custom_order_requests(created_at DESC);

-- Enable Row Level Security
ALTER TABLE custom_order_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Buyers can view their own requests
CREATE POLICY "Buyers can view own requests"
  ON custom_order_requests FOR SELECT
  USING (auth.uid() = buyer_id);

-- Policy: Sellers can view requests sent to them
CREATE POLICY "Sellers can view incoming requests"
  ON custom_order_requests FOR SELECT
  USING (auth.uid() = seller_id);

-- Policy: Buyers can insert their own requests
CREATE POLICY "Buyers can insert requests"
  ON custom_order_requests FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Policy: Sellers can update requests (quote, accept, reject)
CREATE POLICY "Sellers can update requests"
  ON custom_order_requests FOR UPDATE
  USING (auth.uid() = seller_id);

-- Policy: Buyers can accept quotes
CREATE POLICY "Buyers can accept quotes"
  ON custom_order_requests FOR UPDATE
  USING (auth.uid() = buyer_id AND status = 'quoted');

-- Policy: Service role can manage all requests
CREATE POLICY "Service role can manage all requests"
  ON custom_order_requests FOR ALL
  USING (auth.role() = 'service_role');

-- Trigger to automatically update updated_at
CREATE TRIGGER update_custom_order_requests_updated_at
  BEFORE UPDATE ON custom_order_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
