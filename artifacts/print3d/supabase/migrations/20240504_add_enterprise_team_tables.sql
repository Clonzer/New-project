-- Migration: Add Enterprise Team/Per-Seat Plan Support
-- Created: 2024-05-04

-- ============================================
-- Add Enterprise fields to users table
-- ============================================
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS seat_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS team_owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_team_owner BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS organization_name TEXT,
ADD COLUMN IF NOT EXISTS billing_email TEXT;

-- Create indexes for team lookups
CREATE INDEX IF NOT EXISTS idx_users_team_owner_id ON public.users(team_owner_id);
CREATE INDEX IF NOT EXISTS idx_users_is_team_owner ON public.users(is_team_owner) WHERE is_team_owner = TRUE;

-- Add comments for documentation
COMMENT ON COLUMN public.users.seat_count IS 'Number of purchased seats for Enterprise plan (default 1)';
COMMENT ON COLUMN public.users.team_owner_id IS 'If user is a team member, references the team owner';
COMMENT ON COLUMN public.users.is_team_owner IS 'True if user owns an Enterprise team';
COMMENT ON COLUMN public.users.organization_name IS 'Company/organization name for Enterprise accounts';
COMMENT ON COLUMN public.users.billing_email IS 'Separate billing contact email for Enterprise accounts';

-- ============================================
-- Create team_members table
-- ============================================
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    joined_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create indexes for team member lookups
CREATE INDEX IF NOT EXISTS idx_team_members_owner_id ON public.team_members(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON public.team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON public.team_members(status);

-- Create unique constraint to prevent duplicate invitations
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_members_unique_invite 
ON public.team_members(owner_id, email) 
WHERE email IS NOT NULL AND status = 'pending';

-- Create unique constraint to prevent duplicate active memberships
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_members_unique_active 
ON public.team_members(owner_id, user_id) 
WHERE user_id IS NOT NULL AND status = 'active';

-- Add table comment
COMMENT ON TABLE public.team_members IS 'Stores team member invitations and active memberships for Enterprise plan teams';

-- ============================================
-- Create trigger function for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at on team_members
DROP TRIGGER IF EXISTS update_team_members_updated_at ON public.team_members;
CREATE TRIGGER update_team_members_updated_at
    BEFORE UPDATE ON public.team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS Policies for team_members
-- ============================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Team owners can view own team" ON public.team_members;
DROP POLICY IF EXISTS "Users can view own memberships" ON public.team_members;
DROP POLICY IF EXISTS "Team owners can invite members" ON public.team_members;
DROP POLICY IF EXISTS "Team owners can update members" ON public.team_members;
DROP POLICY IF EXISTS "Team owners can delete non-owner members" ON public.team_members;

-- Policy: Team owners can see all their team members
CREATE POLICY "Team owners can view own team"
    ON public.team_members FOR SELECT
    TO authenticated
    USING (owner_id = auth.uid());

-- Policy: Users can see their own team memberships
CREATE POLICY "Users can view own memberships"
    ON public.team_members FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Policy: Team owners can insert new members
CREATE POLICY "Team owners can invite members"
    ON public.team_members FOR INSERT
    TO authenticated
    WITH CHECK (owner_id = auth.uid());

-- Policy: Team owners can update their team members
CREATE POLICY "Team owners can update members"
    ON public.team_members FOR UPDATE
    TO authenticated
    USING (owner_id = auth.uid());

-- Policy: Team owners can delete non-owner members
CREATE POLICY "Team owners can delete non-owner members"
    ON public.team_members FOR DELETE
    TO authenticated
    USING (owner_id = auth.uid() AND role != 'owner');

-- ============================================
-- Grant permissions
-- ============================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT ALL ON public.team_members TO service_role;
