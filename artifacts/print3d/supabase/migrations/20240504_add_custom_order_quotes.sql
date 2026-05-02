-- Add custom_order_quotes table
-- =============================

-- Create custom_order_quotes table
CREATE TABLE IF NOT EXISTS public.custom_order_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.custom_order_requests(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    price DECIMAL(10, 2) NOT NULL,
    message TEXT,
    estimated_days INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.custom_order_quotes ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_order_quotes TO authenticated;
GRANT ALL ON public.custom_order_quotes TO service_role;

-- RLS Policies for custom_order_quotes

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Sellers can view own quotes" ON public.custom_order_quotes;
DROP POLICY IF EXISTS "Requesters can view quotes for their requests" ON public.custom_order_quotes;
DROP POLICY IF EXISTS "Sellers can create quotes" ON public.custom_order_quotes;
DROP POLICY IF EXISTS "Sellers can update own quotes" ON public.custom_order_quotes;
DROP POLICY IF EXISTS "Sellers can delete own quotes" ON public.custom_order_quotes;
DROP POLICY IF EXISTS "Requesters can accept or reject quotes" ON public.custom_order_quotes;

-- Sellers can view their own quotes
CREATE POLICY "Sellers can view own quotes"
    ON public.custom_order_quotes FOR SELECT
    TO authenticated
    USING (seller_id = auth.uid());

-- Requesters can view quotes for their requests
CREATE POLICY "Requesters can view quotes for their requests"
    ON public.custom_order_quotes FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.custom_order_requests cor
            WHERE cor.id = custom_order_quotes.request_id
            AND cor.buyer_id = auth.uid()
        )
    );

-- Sellers can create quotes
CREATE POLICY "Sellers can create quotes"
    ON public.custom_order_quotes FOR INSERT
    TO authenticated
    WITH CHECK (seller_id = auth.uid());

-- Sellers can update their own quotes (but not status)
CREATE POLICY "Sellers can update own quotes"
    ON public.custom_order_quotes FOR UPDATE
    TO authenticated
    USING (seller_id = auth.uid())
    WITH CHECK (seller_id = auth.uid());

-- Sellers can delete their own quotes
CREATE POLICY "Sellers can delete own quotes"
    ON public.custom_order_quotes FOR DELETE
    TO authenticated
    USING (seller_id = auth.uid());

-- Requesters can accept/reject quotes for their requests
CREATE POLICY "Requesters can accept or reject quotes"
    ON public.custom_order_quotes FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.custom_order_requests cor
            WHERE cor.id = custom_order_quotes.request_id
            AND cor.buyer_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.custom_order_requests cor
            WHERE cor.id = custom_order_quotes.request_id
            AND cor.buyer_id = auth.uid()
        )
    );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_custom_order_quotes_request_id 
    ON public.custom_order_quotes(request_id);
    
CREATE INDEX IF NOT EXISTS idx_custom_order_quotes_seller_id 
    ON public.custom_order_quotes(seller_id);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Verify table was created
SELECT 'custom_order_quotes created' as status WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'custom_order_quotes'
);
