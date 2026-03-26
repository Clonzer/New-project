DO $$
BEGIN
  CREATE TYPE checkout_session_status AS ENUM ('created', 'completed', 'expired', 'failed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS checkout_sessions (
  id SERIAL PRIMARY KEY,
  buyer_id INTEGER NOT NULL,
  provider TEXT NOT NULL DEFAULT 'stripe',
  provider_session_id TEXT NOT NULL UNIQUE,
  status checkout_session_status NOT NULL DEFAULT 'created',
  currency TEXT NOT NULL DEFAULT 'usd',
  amount_total REAL NOT NULL,
  shipping_address TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
