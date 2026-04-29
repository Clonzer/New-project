-- Messaging system tables for real-time messaging
-- Run this in Supabase SQL Editor

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

-- Notifications table (if not already created by earlier migration)
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    actor_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_thread_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message_threads
CREATE POLICY "Users can view threads they are part of"
    ON message_threads
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM message_thread_participants
            WHERE thread_id = message_threads.id
            AND user_id = auth.uid()
        )
    );

-- RLS Policies for message_thread_participants
CREATE POLICY "Users can view thread participants for their threads"
    ON message_thread_participants
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM message_thread_participants mtp
            WHERE mtp.thread_id = message_thread_participants.thread_id
            AND mtp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can add participants to threads they are in"
    ON message_thread_participants
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM message_thread_participants mtp
            WHERE mtp.thread_id = message_thread_participants.thread_id
            AND mtp.user_id = auth.uid()
        ) OR
        -- Allow creating new threads (no existing participants yet)
        NOT EXISTS (
            SELECT 1 FROM message_thread_participants mtp
            WHERE mtp.thread_id = message_thread_participants.thread_id
        )
    );

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their threads"
    ON messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM message_thread_participants
            WHERE thread_id = messages.thread_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages to their threads"
    ON messages
    FOR INSERT
    WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM message_thread_participants
            WHERE thread_id = messages.thread_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update read status of messages in their threads"
    ON messages
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM message_thread_participants
            WHERE thread_id = messages.thread_id
            AND user_id = auth.uid()
        )
    );

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
    ON notifications
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can mark their notifications as read"
    ON notifications
    FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their notifications"
    ON notifications
    FOR DELETE
    USING (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_participants_thread_id ON message_thread_participants(thread_id);
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON message_thread_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- Function to update thread updated_at when new message is added
CREATE OR REPLACE FUNCTION update_thread_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE message_threads
    SET updated_at = NOW()
    WHERE id = NEW.thread_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update thread timestamp
DROP TRIGGER IF EXISTS trigger_update_thread_timestamp ON messages;
CREATE TRIGGER trigger_update_thread_timestamp
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_thread_timestamp();
