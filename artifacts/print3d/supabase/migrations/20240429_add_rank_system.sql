-- Rank System Database Migration
-- Run this in your Supabase SQL Editor

-- Table to store user XP and rank data
CREATE TABLE IF NOT EXISTS user_xp (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    total_xp INTEGER DEFAULT 0 NOT NULL,
    current_rank INTEGER DEFAULT 1 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Table to log XP awards (history)
CREATE TABLE IF NOT EXISTS xp_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    xp_amount INTEGER NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to track sponsorship rewards from rank ups
CREATE TABLE IF NOT EXISTS sponsorships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tier TEXT NOT NULL CHECK (tier IN ('silver', 'gold', 'premium')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    source TEXT DEFAULT 'purchase', -- 'purchase', 'rank_reward', 'admin'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_xp_user_id ON user_xp(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_log_user_id ON xp_log(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_log_created_at ON xp_log(created_at);
CREATE INDEX IF NOT EXISTS idx_sponsorships_user_id ON sponsorships(user_id);
CREATE INDEX IF NOT EXISTS idx_sponsorships_active ON sponsorships(is_active) WHERE is_active = true;

-- Enable RLS (Row Level Security)
ALTER TABLE user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_xp
CREATE POLICY "Users can view own XP data" 
    ON user_xp FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own XP data" 
    ON user_xp FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own XP data" 
    ON user_xp FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for xp_log
CREATE POLICY "Users can view own XP history" 
    ON xp_log FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own XP log entries" 
    ON xp_log FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for sponsorships
CREATE POLICY "Users can view own sponsorships" 
    ON sponsorships FOR SELECT 
    USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_xp_updated_at 
    BEFORE UPDATE ON user_xp 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to check if sponsorship is still active
CREATE OR REPLACE FUNCTION check_sponsorship_active()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_date < NOW() THEN
        NEW.is_active = false;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to auto-deactivate expired sponsorships
CREATE TRIGGER check_sponsorship_active_trigger
    BEFORE INSERT OR UPDATE ON sponsorships
    FOR EACH ROW
    EXECUTE FUNCTION check_sponsorship_active();

-- Function to add columns to profiles for rank display
DO $$
BEGIN
    -- Add rank_id and total_xp columns to profiles if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'rank_id') THEN
        ALTER TABLE profiles ADD COLUMN rank_id INTEGER DEFAULT 1;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'total_xp') THEN
        ALTER TABLE profiles ADD COLUMN total_xp INTEGER DEFAULT 0;
    END IF;
    
    -- Add pro membership columns for lifetime pro members (Rank 7)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'is_pro_member') THEN
        ALTER TABLE profiles ADD COLUMN is_pro_member BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'pro_member_since') THEN
        ALTER TABLE profiles ADD COLUMN pro_member_since TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'pro_member_type') THEN
        ALTER TABLE profiles ADD COLUMN pro_member_type TEXT DEFAULT 'none' CHECK (pro_member_type IN ('none', 'monthly', 'yearly', 'lifetime'));
    END IF;
END $$;

-- Create a function to sync rank to profiles (for public display)
CREATE OR REPLACE FUNCTION sync_user_rank_to_profile()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles 
    SET rank_id = NEW.current_rank, 
        total_xp = NEW.total_xp,
        updated_at = NOW()
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to sync rank changes to profiles
CREATE TRIGGER sync_rank_to_profile
    AFTER INSERT OR UPDATE ON user_xp
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_rank_to_profile();

-- Create a view for public rank info (excluding sensitive data)
CREATE OR REPLACE VIEW public_user_ranks AS
SELECT 
    p.id as user_id,
    p.rank_id,
    p.total_xp,
    p.username,
    p.shop_name,
    p.display_name,
    p.avatar_url
FROM profiles p
WHERE p.rank_id IS NOT NULL;

-- Grant access to the view
GRANT SELECT ON public_user_ranks TO anon;
GRANT SELECT ON public_user_ranks TO authenticated;

-- Create function to get top ranked users
CREATE OR REPLACE FUNCTION get_top_ranked_users(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    user_id UUID,
    username TEXT,
    display_name TEXT,
    shop_name TEXT,
    avatar_url TEXT,
    rank_id INTEGER,
    total_xp INTEGER,
    rank_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.username,
        p.display_name,
        p.shop_name,
        p.avatar_url,
        p.rank_id,
        p.total_xp,
        CASE p.rank_id
            WHEN 1 THEN 'Novice Maker'
            WHEN 2 THEN 'Apprentice'
            WHEN 3 THEN 'Craftsman'
            WHEN 4 THEN 'Artisan'
            WHEN 5 THEN 'Master Maker'
            WHEN 6 THEN 'Legend'
            WHEN 7 THEN 'Synthix Icon'
            ELSE 'Novice Maker'
        END as rank_name
    FROM profiles p
    WHERE p.rank_id IS NOT NULL AND p.total_xp > 0
    ORDER BY p.total_xp DESC
    LIMIT limit_count;
END;
$$ language 'plpgsql';

-- Insert initial data for existing users (optional - run if you want to initialize)
-- Uncomment the following to initialize existing users as Novice Makers:
-- INSERT INTO user_xp (user_id, total_xp, current_rank)
-- SELECT id, 0, 1 FROM auth.users
-- WHERE id NOT IN (SELECT user_id FROM user_xp)
-- ON CONFLICT (user_id) DO NOTHING;

COMMENT ON TABLE user_xp IS 'Stores user XP totals and current rank';
COMMENT ON TABLE xp_log IS 'Audit log of all XP awards';
COMMENT ON TABLE sponsorships IS 'Active and historical sponsorships including rank rewards';
