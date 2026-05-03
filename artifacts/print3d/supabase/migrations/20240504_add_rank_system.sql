-- ============================================
-- Rank System Tables
-- ============================================

-- Add rank-related columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rank_id INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS login_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS lifetime_pro BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS lifetime_pro_granted_at TIMESTAMP WITH TIME ZONE;

-- Create index for XP leaderboard
CREATE INDEX IF NOT EXISTS idx_users_total_xp ON public.users(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_users_rank_id ON public.users(rank_id);

-- XP History Table - Tracks all XP awards
CREATE TABLE IF NOT EXISTS public.xp_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reward_id TEXT NOT NULL,
    xp_amount INTEGER NOT NULL,
    base_xp INTEGER NOT NULL,
    bonus_xp INTEGER DEFAULT 0,
    streak_multiplier DECIMAL(3,2) DEFAULT 1.00,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for fast user XP lookups
CREATE INDEX IF NOT EXISTS idx_xp_history_user_id ON public.xp_history(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_history_created_at ON public.xp_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_history_reward_id ON public.xp_history(user_id, reward_id);

-- Daily Challenge Progress Table
CREATE TABLE IF NOT EXISTS public.daily_challenge_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    challenge_id TEXT NOT NULL,
    target INTEGER NOT NULL,
    current INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    xp_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_challenge_user_date ON public.daily_challenge_progress(user_id, date);

-- Repeatable Task Tracking (for cooldowns)
CREATE TABLE IF NOT EXISTS public.xp_repeatable_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reward_id TEXT NOT NULL,
    last_earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    count_today INTEGER DEFAULT 1,
    date DATE DEFAULT CURRENT_DATE,
    UNIQUE(user_id, reward_id, date)
);

CREATE INDEX IF NOT EXISTS idx_xp_repeatable_user_reward ON public.xp_repeatable_tracking(user_id, reward_id);

-- RLS Policies
ALTER TABLE public.xp_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_repeatable_tracking ENABLE ROW LEVEL SECURITY;

-- Users can view their own XP history
CREATE POLICY "Users can view own XP history"
    ON public.xp_history FOR SELECT
    USING (auth.uid() = user_id);

-- Users can view their own daily challenge progress
CREATE POLICY "Users can view own challenge progress"
    ON public.daily_challenge_progress FOR SELECT
    USING (auth.uid() = user_id);

-- Users can view their own repeatable tracking
CREATE POLICY "Users can view own repeatable tracking"
    ON public.xp_repeatable_tracking FOR SELECT
    USING (auth.uid() = user_id);

-- Service role can manage all XP data
CREATE POLICY "Service role can manage XP history"
    ON public.xp_history FOR ALL
    TO service_role
    USING (true);

CREATE POLICY "Service role can manage challenge progress"
    ON public.daily_challenge_progress FOR ALL
    TO service_role
    USING (true);

CREATE POLICY "Service role can manage repeatable tracking"
    ON public.xp_repeatable_tracking FOR ALL
    TO service_role
    USING (true);

-- Function to update user rank when XP changes
CREATE OR REPLACE FUNCTION public.update_user_rank()
RETURNS TRIGGER AS $$
DECLARE
    new_rank_id INTEGER;
BEGIN
    -- Calculate new rank based on XP thresholds
    SELECT CASE
        WHEN NEW.total_xp >= 1600000 THEN 15  -- Legend
        WHEN NEW.total_xp >= 800000 THEN 14   -- Titan
        WHEN NEW.total_xp >= 400000 THEN 13   -- Champion
        WHEN NEW.total_xp >= 200000 THEN 12   -- Elite
        WHEN NEW.total_xp >= 100000 THEN 11   -- Grandmaster
        WHEN NEW.total_xp >= 50000 THEN 10    -- Master
        WHEN NEW.total_xp >= 25000 THEN 9     -- Professional
        WHEN NEW.total_xp >= 12000 THEN 8     -- Expert
        WHEN NEW.total_xp >= 6000 THEN 7      -- Specialist
        WHEN NEW.total_xp >= 3000 THEN 6      -- Trader
        WHEN NEW.total_xp >= 1500 THEN 5      -- Merchant
        WHEN NEW.total_xp >= 700 THEN 4       -- Craftsman
        WHEN NEW.total_xp >= 300 THEN 3      -- Artisan
        WHEN NEW.total_xp >= 100 THEN 2       -- Explorer
        ELSE 1                                  -- Newcomer
    END INTO new_rank_id;

    -- Update rank if changed
    IF NEW.rank_id IS NULL OR new_rank_id > NEW.rank_id THEN
        NEW.rank_id := new_rank_id;
        
        -- Grant lifetime pro if Legend rank
        IF new_rank_id = 15 AND NOT COALESCE(NEW.lifetime_pro, FALSE) THEN
            NEW.lifetime_pro := TRUE;
            NEW.lifetime_pro_granted_at := now();
            NEW.plan_tier := 'elite';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update rank when XP changes
DROP TRIGGER IF EXISTS trigger_update_user_rank ON public.users;
CREATE TRIGGER trigger_update_user_rank
    BEFORE UPDATE OF total_xp ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_rank();

-- Function to get leaderboard
CREATE OR REPLACE FUNCTION public.get_leaderboard(limit_count INTEGER DEFAULT 100)
RETURNS TABLE (
    user_id UUID,
    display_name TEXT,
    avatar_url TEXT,
    total_xp INTEGER,
    rank_id INTEGER,
    rank_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        COALESCE(u.display_name, u.username, 'Anonymous') as display_name,
        u.avatar_url,
        u.total_xp,
        u.rank_id,
        CASE u.rank_id
            WHEN 1 THEN 'Newcomer'
            WHEN 2 THEN 'Explorer'
            WHEN 3 THEN 'Artisan'
            WHEN 4 THEN 'Craftsman'
            WHEN 5 THEN 'Merchant'
            WHEN 6 THEN 'Trader'
            WHEN 7 THEN 'Specialist'
            WHEN 8 THEN 'Expert'
            WHEN 9 THEN 'Professional'
            WHEN 10 THEN 'Master'
            WHEN 11 THEN 'Grandmaster'
            WHEN 12 THEN 'Elite'
            WHEN 13 THEN 'Champion'
            WHEN 14 THEN 'Titan'
            WHEN 15 THEN 'Legend'
        END as rank_name
    FROM public.users u
    WHERE u.total_xp > 0
    ORDER BY u.total_xp DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, INSERT ON public.xp_history TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.daily_challenge_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.xp_repeatable_tracking TO authenticated;
GRANT ALL ON public.xp_history TO service_role;
GRANT ALL ON public.daily_challenge_progress TO service_role;
GRANT ALL ON public.xp_repeatable_tracking TO service_role;

-- Grant execute permission on function
GRANT EXECUTE ON FUNCTION public.get_leaderboard TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_leaderboard TO service_role;
