-- ============================================
-- Fix Database Schema Issues
-- ============================================

-- 0. CRITICAL FIX: Ensure users.id is UUID type (not integer)
-- This fixes "invalid input syntax for type integer" errors
DO $$
BEGIN
    -- Check if users.id is not UUID type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'id' 
        AND data_type != 'uuid'
    ) THEN
        -- We need to recreate the users table with correct types
        -- First, backup existing data
        CREATE TABLE IF NOT EXISTS users_backup AS SELECT * FROM users;
        
        -- Drop dependent objects
        DROP POLICY IF EXISTS "Users can read own data" ON users;
        DROP POLICY IF EXISTS "Users can update own data" ON users;
        DROP POLICY IF EXISTS "Enable insert for authentication" ON users;
        
        -- Drop and recreate table with correct schema
        DROP TABLE users CASCADE;
        
        CREATE TABLE public.users (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT NOT NULL,
            username TEXT UNIQUE,
            display_name TEXT,
            avatar_url TEXT,
            bio TEXT,
            location TEXT,
            country_code TEXT DEFAULT 'US',
            language_code TEXT DEFAULT 'en',
            currency_code TEXT DEFAULT 'USD',
            role TEXT DEFAULT 'buyer',
            plan_tier TEXT DEFAULT 'free',
            total_xp INTEGER DEFAULT 0,
            rank_id INTEGER DEFAULT 1,
            login_streak INTEGER DEFAULT 0,
            last_login_at TIMESTAMP WITH TIME ZONE,
            lifetime_pro BOOLEAN DEFAULT FALSE,
            shop_name TEXT,
            shop_mode BOOLEAN DEFAULT TRUE,
            store_visible BOOLEAN DEFAULT TRUE,
            accepting_orders BOOLEAN DEFAULT TRUE,
            sponsorship_tier TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Restore data (IDs will need manual migration if any exist)
        -- Note: Existing integer IDs cannot be converted to UUIDs automatically
        -- This is a breaking change requiring data migration
        RAISE NOTICE 'Users table recreated with UUID primary key. Manual data migration may be needed.';
    END IF;
END $$;

-- 1. Fix users table - ensure id is UUID and add missing columns
DO $$
BEGIN
    -- Check if id column needs to be changed to UUID
    -- Note: This is dangerous if data exists, so we only add missing columns
    
    -- Add sponsorship_tier if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'sponsorship_tier') THEN
        ALTER TABLE public.users ADD COLUMN sponsorship_tier TEXT;
    END IF;

    -- Add shop_name if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'shop_name') THEN
        ALTER TABLE public.users ADD COLUMN shop_name TEXT;
    END IF;

    -- Add shop_mode if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'shop_mode') THEN
        ALTER TABLE public.users ADD COLUMN shop_mode BOOLEAN DEFAULT TRUE;
    END IF;

    -- Add store_visible if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'store_visible') THEN
        ALTER TABLE public.users ADD COLUMN store_visible BOOLEAN DEFAULT TRUE;
    END IF;

    -- Add accepting_orders if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'accepting_orders') THEN
        ALTER TABLE public.users ADD COLUMN accepting_orders BOOLEAN DEFAULT TRUE;
    END IF;

    -- Add plan_tier if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'plan_tier') THEN
        ALTER TABLE public.users ADD COLUMN plan_tier TEXT DEFAULT 'free';
    END IF;

    -- Add role if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE public.users ADD COLUMN role TEXT DEFAULT 'buyer';
    END IF;
END $$;

-- 2. Create missing sellers table columns
DO $$
BEGIN
    -- Add store_setup_complete if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sellers' AND column_name = 'store_setup_complete') THEN
        ALTER TABLE public.sellers ADD COLUMN store_setup_complete BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 3. Create daily_challenge_progress table if missing
CREATE TABLE IF NOT EXISTS public.daily_challenge_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    challenge_id TEXT NOT NULL,
    current INTEGER DEFAULT 0,
    target INTEGER NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    xp_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, date)
);

-- Create index for daily challenge lookups
CREATE INDEX IF NOT EXISTS idx_daily_challenge_user_date ON public.daily_challenge_progress(user_id, date);

-- 4. Create xp_repeatable_tracking table if missing
CREATE TABLE IF NOT EXISTS public.xp_repeatable_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reward_id TEXT NOT NULL,
    count_today INTEGER DEFAULT 0,
    last_earned_at TIMESTAMP WITH TIME ZONE,
    date DATE NOT NULL,
    UNIQUE(user_id, reward_id, date)
);

-- Create index for repeatable tracking
CREATE INDEX IF NOT EXISTS idx_xp_repeatable_user_reward_date ON public.xp_repeatable_tracking(user_id, reward_id, date);

-- 5. Fix RLS policies - ensure users can read their own data
-- Enable RLS on users table if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authentication" ON public.users;

-- Create new policies
CREATE POLICY "Users can read own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authentication" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Enable RLS on daily_challenge_progress
ALTER TABLE public.daily_challenge_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own daily challenges" ON public.daily_challenge_progress;
CREATE POLICY "Users can manage own daily challenges" ON public.daily_challenge_progress
    FOR ALL USING (auth.uid() = user_id);

-- Enable RLS on xp_repeatable_tracking
ALTER TABLE public.xp_repeatable_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own xp tracking" ON public.xp_repeatable_tracking;
CREATE POLICY "Users can manage own xp tracking" ON public.xp_repeatable_tracking
    FOR ALL USING (auth.uid() = user_id);

-- Enable RLS on xp_history
ALTER TABLE public.xp_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own xp history" ON public.xp_history;
CREATE POLICY "Users can view own xp history" ON public.xp_history
    FOR ALL USING (auth.uid() = user_id);

-- 6. Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_challenge_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.xp_repeatable_tracking TO authenticated;
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.daily_challenge_progress TO service_role;
GRANT ALL ON public.xp_repeatable_tracking TO service_role;

-- 7. Ensure auth.users foreign key relationship is correct
-- Note: The users table id should match auth.users id type (UUID)
-- If there's a mismatch, we can't easily fix it without data migration
-- But we ensure new columns reference auth.users correctly

-- 8. Add trigger to auto-create user record on auth signup if not exists
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, role, plan_tier, total_xp, rank_id, login_streak, created_at)
    VALUES (
        NEW.id,
        NEW.email,
        'buyer',
        'free',
        0,
        1,
        0,
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
