# Synthix

Production-oriented marketplace rebuild for the existing Synthix design, now structured for single-service Render deployment.

## What changed

- Kept the current frontend routes and visual design foundation.
- Replaced demo checkout behavior with Stripe Checkout session creation.
- Added a Stripe webhook flow so orders are created only after payment completes.
- Replaced the mock-only messaging screen with a real database-backed conversation system.
- Locked down API mutations so users can only edit their own accounts, listings, printers, and orders.
- Removed non-functional signup controls so the account flow only exposes working features.
- Added password change support for signed-in users.
- Added a one-service Render blueprint and automatic SQL migration runner.

## Required environment variables

Use `./.env.example` as the source of truth. For Render, `APP_URL` can be left blank if you want the app to fall back to Render's `RENDER_EXTERNAL_URL`.

Minimum production values:

- `DATABASE_URL`
- `JWT_SECRET`
- `APP_URL`
- `CORS_ORIGINS`
- `VITE_API_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Render deployment

1. Create the Postgres database.
2. Deploy the single web service from `./render.yaml`.
3. Set `JWT_SECRET`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET`.
4. Optionally set `APP_URL` if you do not want to rely on Render's generated external URL.
5. Point a Stripe webhook at `https://YOUR_RENDER_DOMAIN/api/payments/stripe/webhook`.

## Database note

The app now applies all SQL files in `./lib/db/migrations` automatically during Render startup, so checkout and messaging tables are created without a separate manual migration step.
