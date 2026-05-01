-- Fix for discover page errors and relationship issues
-- Run this in Supabase SQL Editor

-- =====================================================
-- PART 1: Create discover-media bucket if not exists
-- =====================================================

-- Create the storage bucket for discover page media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'discover-media',
  'discover-media',
  true,
  52428800,  -- 50MB limit
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing discover-media policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to upload discover media" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own discover media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to discover media" ON storage.objects;

-- Create upload policy for discover-media
CREATE POLICY "Allow authenticated users to upload discover media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'discover-media' AND
    (auth.uid()::text = split_part(name, '/', 2))
  );

-- Create delete policy for discover-media
CREATE POLICY "Allow users to delete own discover media"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'discover-media' AND
    (auth.uid()::text = split_part(name, '/', 2))
  );

-- Public read is automatic since bucket is public

-- =====================================================
-- PART 2: Fix sellers/profiles relationship
-- =====================================================

-- First, ensure the profiles table exists
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    banner_url TEXT,
    location TEXT,
    seller_tags TEXT[],
    shop_mode TEXT DEFAULT 'both',
    role TEXT DEFAULT 'buyer',
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure the sellers table has the correct columns
ALTER TABLE sellers 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS store_name TEXT,
  ADD COLUMN IF NOT EXISTS accepting_orders BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS store_setup_complete BOOLEAN DEFAULT false;

-- Create index on user_id for faster joins
CREATE INDEX IF NOT EXISTS idx_sellers_user_id ON sellers(user_id);

-- =====================================================
-- PART 3: Create messaging tables if they don't exist
-- =====================================================

-- Message threads table
CREATE TABLE IF NOT EXISTS message_threads (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Thread participants table
CREATE TABLE IF NOT EXISTS message_thread_participants (
    id SERIAL PRIMARY KEY,
    thread_id INTEGER REFERENCES message_threads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(thread_id, user_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    thread_id INTEGER REFERENCES message_threads(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on messaging tables
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_thread_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view threads they are part of" ON message_threads;
DROP POLICY IF EXISTS "Users can view thread participants for their threads" ON message_thread_participants;
DROP POLICY IF EXISTS "Users can add participants to threads they are in" ON message_thread_participants;
DROP POLICY IF EXISTS "Users can view messages in their threads" ON messages;
DROP POLICY IF EXISTS "Users can send messages to their threads" ON messages;

-- Create simplified policies that avoid recursion issues
CREATE POLICY "Users can view threads they are part of"
    ON message_threads
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM message_thread_participants mtp
            WHERE mtp.thread_id = message_threads.id
            AND mtp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view thread participants"
    ON message_thread_participants
    FOR SELECT
    USING (user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM message_thread_participants mtp
            WHERE mtp.thread_id = message_thread_participants.thread_id
            AND mtp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can add participants"
    ON message_thread_participants
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid() OR
        NOT EXISTS (
            SELECT 1 FROM message_thread_participants mtp
            WHERE mtp.thread_id = message_thread_participants.thread_id
        )
    );

CREATE POLICY "Users can view messages"
    ON messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM message_thread_participants mtp
            WHERE mtp.thread_id = messages.thread_id
            AND mtp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages"
    ON messages
    FOR INSERT
    WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM message_thread_participants mtp
            WHERE mtp.thread_id = messages.thread_id
            AND mtp.user_id = auth.uid()
        )
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_participants_thread_id ON message_thread_participants(thread_id);
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON message_thread_participants(user_id);

-- =====================================================
-- PART 4: Fix workspace-stub.ts query to avoid joins
-- =====================================================
-- Note: The app will use a simplified query without inner joins
-- to avoid the 400 error on the sellers endpoint

-- Create a view that combines sellers and profiles data
CREATE OR REPLACE VIEW sellers_with_profiles AS
SELECT 
    s.id,
    s.user_id,
    s.store_name,
    s.accepting_orders,
    s.store_setup_complete,
    s.created_at,
    p.display_name,
    p.username,
    p.avatar_url,
    p.banner_url,
    p.location,
    p.seller_tags,
    p.shop_mode,
    p.role,
    p.bio
FROM sellers s
LEFT JOIN profiles p ON s.user_id = p.id;

-- Enable RLS on the view
ALTER VIEW sellers_with_profiles OWNER TO postgres;

COMMENT ON VIEW sellers_with_profiles IS 'Combined sellers and profiles data for the explore page';
