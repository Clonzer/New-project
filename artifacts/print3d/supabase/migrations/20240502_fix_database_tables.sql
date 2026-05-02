-- Fix Database Tables - user_xp and message_thread_participants
-- ================================================================

-- ================================================================
-- 1. Fix user_xp table (406 error fix)
-- ================================================================

-- Create user_xp table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_xp (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_xp INTEGER NOT NULL DEFAULT 0,
    current_rank INTEGER NOT NULL DEFAULT 1,
    weekly_xp INTEGER NOT NULL DEFAULT 0,
    monthly_xp INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS on user_xp
ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own XP" ON public.user_xp;
DROP POLICY IF EXISTS "Users can update own XP" ON public.user_xp;
DROP POLICY IF EXISTS "Users can insert own XP" ON public.user_xp;

-- Create RLS policies for user_xp
CREATE POLICY "Users can read own XP"
    ON public.user_xp FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can update own XP"
    ON public.user_xp FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert own XP"
    ON public.user_xp FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_xp_updated_at ON public.user_xp;
CREATE TRIGGER update_user_xp_updated_at
    BEFORE UPDATE ON public.user_xp
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (no sequence needed for UUID)
GRANT SELECT, INSERT, UPDATE ON public.user_xp TO authenticated;

-- ================================================================
-- 2. Fix message_thread_participants table (500 error fix)
-- ================================================================

-- First ensure message_threads exists
CREATE TABLE IF NOT EXISTS public.message_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;

-- Create message_thread_participants table
CREATE TABLE IF NOT EXISTS public.message_thread_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(thread_id, user_id)
);

-- Enable RLS
ALTER TABLE public.message_thread_participants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own participations" ON public.message_thread_participants;
DROP POLICY IF EXISTS "Users can join threads" ON public.message_thread_participants;
DROP POLICY IF EXISTS "Users can leave threads" ON public.message_thread_participants;

-- Create policies
CREATE POLICY "Users can read own participations"
    ON public.message_thread_participants FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can join threads"
    ON public.message_thread_participants FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave threads"
    ON public.message_thread_participants FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- Grant permissions (no sequence needed for UUID)
GRANT SELECT, INSERT, DELETE ON public.message_thread_participants TO authenticated;

-- ================================================================
-- 3. Ensure messages table exists
-- ================================================================

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read thread messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;

CREATE POLICY "Users can read thread messages"
    ON public.messages FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.message_thread_participants
            WHERE thread_id = messages.thread_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages"
    ON public.messages FOR INSERT
    TO authenticated
    WITH CHECK (
        sender_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.message_thread_participants
            WHERE thread_id = messages.thread_id
            AND user_id = auth.uid()
        )
    );

GRANT SELECT, INSERT ON public.messages TO authenticated;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_xp_user_id ON public.user_xp(user_id);
CREATE INDEX IF NOT EXISTS idx_message_thread_participants_thread_id ON public.message_thread_participants(thread_id);
CREATE INDEX IF NOT EXISTS idx_message_thread_participants_user_id ON public.message_thread_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
