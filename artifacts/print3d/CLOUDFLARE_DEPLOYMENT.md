# Cloudflare + Supabase deployment guide

This app is designed to run as a **static frontend on Cloudflare** with **Stripe Connect and payments on Supabase Edge Functions** (no Render required).

---

## Architecture

| Piece | Where it runs |
|--------|----------------|
| React UI | Cloudflare Pages or Worker (static `dist/`) |
| Stripe Connect onboarding | Supabase functions: `create-connected-account`, `create-account-link`, `get-account-status` |
| Checkout / webhooks | Supabase functions + Stripe dashboard |
| Database | Supabase Postgres |

The frontend uses `VITE_STRIPE_CONNECT_PROVIDER=supabase` (default) so it does **not** call `/api/stripe-connect/*` on Cloudflare.

---

## Part 1 — Supabase (do this first)

### 1.1 Run the Stripe Connect migration

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**.
2. Paste and run the file:  
   `artifacts/print3d/supabase/migrations/20250515000000_add_stripe_connect.sql`
3. Confirm table `stripe_connected_accounts` exists under **Table Editor**.

### 1.2 Set Supabase secrets (Edge Functions)

Go to **Project Settings → Edge Functions → Secrets** and add:

| Secret | Value |
|--------|--------|
| `STRIPE_SECRET_KEY` | `sk_live_...` or `sk_test_...` from Stripe Dashboard |
| `SITE_URL` | `https://synthixgroup.co.uk` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (Settings → API) |

`SUPABASE_URL` is injected automatically for functions.

### 1.3 Deploy Edge Functions

Install [Supabase CLI](https://supabase.com/docs/guides/cli) if needed, then from repo root:

```bash
cd artifacts/print3d
supabase login
supabase link --project-ref hegixxfxymvwlcenuewx
supabase functions deploy create-connected-account
supabase functions deploy create-account-link
supabase functions deploy get-account-status
supabase functions deploy create-stripe-product
supabase functions deploy stripe-webhook
```

Or deploy each function from the Dashboard: **Edge Functions → Deploy**.

### 1.4 Allow browser calls (CORS)

Functions already send `Access-Control-Allow-Origin: *`. Ensure each function is deployed with **JWT verification enabled** (default) so only logged-in users can call them with `Authorization: Bearer <access_token>`.

### 1.5 Rotate exposed secrets

If you pasted `SUPABASE_JWT_SECRET` or service keys in chat or Cloudflare build logs:

1. Supabase → Settings → API → rotate JWT secret (if applicable).
2. Regenerate Stripe keys if concerned.
3. Never put service role or JWT secrets in Cloudflare **build** variables.

---

## Part 2 — Cloudflare (frontend)

### 2.1 Build settings

| Setting | Value |
|---------|--------|
| Framework | Vite (or None) |
| Build command | `cd artifacts/print3d && pnpm install && pnpm run build:cloudflare` |
| Build output directory | `artifacts/print3d/dist` |
| Root directory | repository root (or `artifacts/print3d` if the project is only the frontend) |

### 2.2 Environment variables (Production)

Add these under **Workers & Pages → your project → Settings → Environment variables**:

```env
VITE_SUPABASE_URL=https://hegixxfxymvwlcenuewx.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key from Supabase API settings>
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_APP_URL=https://synthixgroup.co.uk
VITE_STRIPE_CONNECT_PROVIDER=supabase
```

**Remove from Cloudflare (not needed for static hosting):**

- `APP_URL` → use `VITE_APP_URL` instead
- `SUPABASE_JWT_SECRET` → Supabase only, never in the browser
- `VITE_API_URL` → optional; not required for Stripe Connect when using `supabase` provider

### 2.3 Custom domain

1. **Workers & Pages → Custom domains** → add `synthixgroup.co.uk`.
2. DNS at your registrar: point to Cloudflare as instructed (orange cloud on).

### 2.4 Deploy

1. **Save** environment variables.
2. **Deployments → Retry deployment** (or push to Git connected branch).
3. Wait for build to finish.

---

## Part 3 — Stripe Dashboard

### 3.1 Connect

1. [Stripe Dashboard → Connect](https://dashboard.stripe.com/connect/accounts/overview) — enable Connect if prompted.
2. Use **Express** accounts (matches edge functions).

### 3.2 Webhook (payments)

1. **Developers → Webhooks → Add endpoint**
2. URL: `https://hegixxfxymvwlcenuewx.supabase.co/functions/v1/stripe-webhook`
3. Events: at minimum `checkout.session.completed`, `account.updated` (add others your `stripe-webhook` function handles).
4. Copy **Signing secret** → Supabase secret `STRIPE_WEBHOOK_SECRET`.

---

## Part 4 — Test end-to-end

1. Open `https://synthixgroup.co.uk` (hard refresh: Ctrl+Shift+R).
2. Sign in with Supabase auth.
3. Go to **Dashboard → Stripe Connect**.
4. Click **Start Stripe Onboarding**.
5. In **DevTools → Network**, you should see:
   - `POST .../functions/v1/create-connected-account` (first time only)
   - `POST .../functions/v1/create-account-link`
   - Redirect to `connect.stripe.com`
6. After Stripe, you return to `/dashboard?section=payment&stripe=return`.

**If you still see 405 on `/api/stripe-connect/...`:** the old build is cached or `VITE_STRIPE_CONNECT_PROVIDER` is not `supabase`. Redeploy with the variables above.

---

## Local development

**Frontend only (matches Cloudflare):**

```bash
# artifacts/print3d/.env.local
VITE_SUPABASE_URL=https://hegixxfxymvwlcenuewx.supabase.co
VITE_SUPABASE_ANON_KEY=...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_APP_URL=http://localhost:4173
VITE_STRIPE_CONNECT_PROVIDER=supabase
```

```bash
pnpm --filter @workspace/print3d dev
```

**With Express API (legacy):**

```env
VITE_STRIPE_CONNECT_PROVIDER=express
VITE_API_URL=http://localhost:3000/api
```

Run `pnpm run dev` from repo root (api-server + print3d).

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| 405 on `/api/stripe-connect/*` | Set `VITE_STRIPE_CONNECT_PROVIDER=supabase` and redeploy Cloudflare |
| 401 on Supabase functions | User not signed in, or wrong anon key |
| 404 on `get-account-status` | Normal before onboarding; click **Start Stripe Onboarding** |
| 500 from `create-connected-account` | Redeploy function (latest uses Stripe v1 Express); set `STRIPE_SECRET_KEY`; run SQL migration |
| CORS `Allow-Origin *` + credentials | Remove `VITE_API_URL` from Cloudflare (or redeploy latest frontend) |
| Errors on `*.pages.dev` calling `synthixgroup.co.uk/api` | Preview host ≠ API host; test on production domain or unset `VITE_API_URL` for preview |
| Table missing | Re-run SQL migration in Supabase |

---

## Checklist

- [ ] SQL migration applied in Supabase
- [ ] Edge functions deployed (`create-connected-account`, `create-account-link`, `get-account-status`)
- [ ] Supabase secrets: `STRIPE_SECRET_KEY`, `SITE_URL`, service role
- [ ] Cloudflare env: `VITE_*` only (no JWT secret)
- [ ] `VITE_STRIPE_CONNECT_PROVIDER=supabase`
- [ ] Cloudflare redeployed after env changes
- [ ] Stripe webhook pointed at Supabase `stripe-webhook`
- [ ] Tested onboarding from live site
