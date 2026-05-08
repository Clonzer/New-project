-- Ensure Listings Table Exists
-- ===========================

-- Create listings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    images TEXT[],
    listing_type VARCHAR(20) DEFAULT 'product' CHECK (listing_type IN ('product', 'service')),
    is_active BOOLEAN DEFAULT true,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on listings
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Sellers can read own listings" ON public.listings;
DROP POLICY IF EXISTS "Sellers can create listings" ON public.listings;
DROP POLICY IF EXISTS "Sellers can update own listings" ON public.listings;
DROP POLICY IF EXISTS "Sellers can delete own listings" ON public.listings;
DROP POLICY IF EXISTS "Everyone can read active listings" ON public.listings;

-- Create RLS policies for listings
CREATE POLICY "Sellers can read own listings"
    ON public.listings FOR SELECT
    TO authenticated
    USING (seller_id::uuid = auth.uid());

CREATE POLICY "Everyone can read active listings"
    ON public.listings FOR SELECT
    TO authenticated
    USING (is_active = true);

CREATE POLICY "Sellers can create listings"
    ON public.listings FOR INSERT
    TO authenticated
    WITH CHECK (seller_id::uuid = auth.uid());

CREATE POLICY "Sellers can update own listings"
    ON public.listings FOR UPDATE
    TO authenticated
    USING (seller_id::uuid = auth.uid())
    WITH CHECK (seller_id::uuid = auth.uid());

CREATE POLICY "Sellers can delete own listings"
    ON public.listings FOR DELETE
    TO authenticated
    USING (seller_id::uuid = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON public.listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_is_active ON public.listings(is_active);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.listings TO authenticated;
GRANT ALL ON public.listings TO service_role;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
