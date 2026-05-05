-- Fix custom_order_requests DELETE RLS policy
-- This fixes the 406 error when trying to delete quote requests

-- Ensure custom_order_requests table exists with proper columns
CREATE TABLE IF NOT EXISTS public.custom_order_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    budget_min DECIMAL(10, 2),
    budget_max DECIMAL(10, 2),
    deadline TIMESTAMP WITH TIME ZONE,
    file_url TEXT,
    file_name TEXT,
    file_type TEXT,
    notes TEXT,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.custom_order_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Buyers can view own requests" ON public.custom_order_requests;
DROP POLICY IF EXISTS "Buyers can create requests" ON public.custom_order_requests;
DROP POLICY IF EXISTS "Buyers can update own requests" ON public.custom_order_requests;
DROP POLICY IF EXISTS "Buyers can delete own requests" ON public.custom_order_requests;
DROP POLICY IF EXISTS "Sellers can view all requests" ON public.custom_order_requests;

-- Create SELECT policy for buyers (own requests)
CREATE POLICY "Buyers can view own requests"
    ON public.custom_order_requests FOR SELECT
    TO authenticated
    USING (buyer_id = auth.uid());

-- Create SELECT policy for sellers (all requests)
CREATE POLICY "Sellers can view all requests"
    ON public.custom_order_requests FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.sellers
            WHERE user_id = auth.uid()
        )
    );

-- Create INSERT policy
CREATE POLICY "Buyers can create requests"
    ON public.custom_order_requests FOR INSERT
    TO authenticated
    WITH CHECK (buyer_id = auth.uid());

-- Create UPDATE policy
CREATE POLICY "Buyers can update own requests"
    ON public.custom_order_requests FOR UPDATE
    TO authenticated
    USING (buyer_id = auth.uid())
    WITH CHECK (buyer_id = auth.uid());

-- Create DELETE policy - THIS IS THE KEY FIX
CREATE POLICY "Buyers can delete own requests"
    ON public.custom_order_requests FOR DELETE
    TO authenticated
    USING (buyer_id = auth.uid());

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_order_requests TO authenticated;

-- Also ensure storage file_url files can be deleted by the owner
-- (in case files need cleanup when deleting requests)
