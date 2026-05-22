-- Stripe Connect columns on public.users (used by edge functions + dashboard)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_connect_id TEXT UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_account_status TEXT NOT NULL DEFAULT 'not_started';

CREATE INDEX IF NOT EXISTS idx_users_stripe_connect_id ON public.users(stripe_connect_id)
  WHERE stripe_connect_id IS NOT NULL;
