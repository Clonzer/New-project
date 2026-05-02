-- Fix Messages 500 Error - Complete Schema Fix
-- =============================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- 1. Drop and recreate message_threads with proper structure
-- ================================================================

-- Drop existing tables (cascade to remove dependencies)
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.message_thread_participants CASCADE;
DROP TABLE IF EXISTS public.message_threads CASCADE;

-- Create message_threads table
CREATE TABLE public.message_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT ON public.message_threads TO authenticated;
GRANT ALL ON public.message_threads TO service_role;

-- ================================================================
-- 2. Create message_thread_participants table
-- ================================================================

CREATE TABLE public.message_thread_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_read_at TIMESTAMPTZ,
    UNIQUE(thread_id, user_id)
);

-- Enable RLS
ALTER TABLE public.message_thread_participants ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, DELETE ON public.message_thread_participants TO authenticated;
GRANT ALL ON public.message_thread_participants TO service_role;

-- ================================================================
-- 3. Create messages table
-- ================================================================

CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;

-- ================================================================
-- 4. Create RLS Policies for message_threads
-- ================================================================

-- Users can view threads they participate in
CREATE POLICY "Users can view their threads"
    ON public.message_threads FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.message_thread_participants
            WHERE thread_id = message_threads.id
            AND user_id = auth.uid()
        )
    );

-- Users can create threads
CREATE POLICY "Users can create threads"
    ON public.message_threads FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ================================================================
-- 5. Create RLS Policies for message_thread_participants
-- ================================================================

-- Users can view their own participations
CREATE POLICY "Users can view own participations"
    ON public.message_thread_participants FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Users can join threads
CREATE POLICY "Users can join threads"
    ON public.message_thread_participants FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Users can leave threads
CREATE POLICY "Users can leave threads"
    ON public.message_thread_participants FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- ================================================================
-- 6. Create RLS Policies for messages
-- ================================================================

-- Users can view messages in threads they participate in
CREATE POLICY "Users can view thread messages"
    ON public.messages FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.message_thread_participants
            WHERE thread_id = messages.thread_id
            AND user_id = auth.uid()
        )
    );

-- Users can send messages to threads they participate in
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

-- ================================================================
-- 7. Create helper function for creating message threads
-- ================================================================

CREATE OR REPLACE FUNCTION public.create_message_thread(participant_ids UUID[])
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_thread_id UUID;
    participant_id UUID;
BEGIN
    -- Create the thread
    INSERT INTO public.message_threads DEFAULT VALUES
    RETURNING id INTO new_thread_id;
    
    -- Add all participants
    FOREACH participant_id IN ARRAY participant_ids
    LOOP
        INSERT INTO public.message_thread_participants (thread_id, user_id)
        VALUES (new_thread_id, participant_id);
    END LOOP;
    
    RETURN new_thread_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_message_thread(UUID[]) TO authenticated;

-- ================================================================
-- 8. Create indexes for performance
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_message_thread_participants_thread_id 
    ON public.message_thread_participants(thread_id);
    
CREATE INDEX IF NOT EXISTS idx_message_thread_participants_user_id 
    ON public.message_thread_participants(user_id);
    
CREATE INDEX IF NOT EXISTS idx_messages_thread_id 
    ON public.messages(thread_id);
    
CREATE INDEX IF NOT EXISTS idx_messages_sender_id 
    ON public.messages(sender_id);
    
CREATE INDEX IF NOT EXISTS idx_messages_created_at 
    ON public.messages(created_at);

-- ================================================================
-- 9. Refresh schema cache
-- ================================================================

NOTIFY pgrst, 'reload schema';

-- ================================================================
-- 10. Verify tables were created
-- ================================================================

SELECT 'message_threads created' as status WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'message_threads'
);

SELECT 'message_thread_participants created' as status WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'message_thread_participants'
);

SELECT 'messages created' as status WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'messages'
);
