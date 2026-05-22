-- Allow Stripe Connect rows for auth users even if public.users upsert fails
ALTER TABLE IF EXISTS public.stripe_connected_accounts
  DROP CONSTRAINT IF EXISTS stripe_connected_accounts_user_id_fkey;

ALTER TABLE IF EXISTS public.stripe_connected_accounts
  ADD CONSTRAINT stripe_connected_accounts_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
