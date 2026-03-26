CREATE TABLE IF NOT EXISTS message_threads (
  id SERIAL PRIMARY KEY,
  participant_a_id INTEGER NOT NULL,
  participant_b_id INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS message_threads_participant_pair_idx
  ON message_threads (participant_a_id, participant_b_id);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  read_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS messages_thread_id_created_at_idx
  ON messages (thread_id, created_at);
