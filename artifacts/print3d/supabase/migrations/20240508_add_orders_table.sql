-- Add Orders Table
-- ===================

-- Create orders table for regular product orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'printing', 'shipped', 'delivered', 'cancelled')),
    shipping_address JSONB,
    tracking_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Buyers can read own orders" ON public.orders;
DROP POLICY IF EXISTS "Sellers can read own orders" ON public.orders;
DROP POLICY IF EXISTS "Buyers can create orders" ON public.orders;
DROP POLICY IF EXISTS "Sellers can update orders" ON public.orders;

-- Create RLS policies for orders
CREATE POLICY "Buyers can read own orders"
    ON public.orders FOR SELECT
    TO authenticated
    USING (buyer_id::uuid = auth.uid());

CREATE POLICY "Sellers can read own orders"
    ON public.orders FOR SELECT
    TO authenticated
    USING (seller_id::uuid = auth.uid());

CREATE POLICY "Buyers can create orders"
    ON public.orders FOR INSERT
    TO authenticated
    WITH CHECK (buyer_id::uuid = auth.uid());

CREATE POLICY "Sellers can update orders"
    ON public.orders FOR UPDATE
    TO authenticated
    USING (seller_id::uuid = auth.uid())
    WITH CHECK (seller_id::uuid = auth.uid());

-- Create trigger to update updated_at
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_listing_id ON public.orders(listing_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
