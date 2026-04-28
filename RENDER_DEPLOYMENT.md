# Render Deployment Guide for Synthix

This guide will walk you through deploying the Synthix 3D printing marketplace to Render.

## Prerequisites

1. A [Render](https://render.com) account (free tier available)
2. Your Supabase project credentials
3. This codebase pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Prepare Your Repository

1. Push your code to a Git repository:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/synthix.git
git push -u origin main
```

## Step 2: Set Up Environment Variables

You'll need to set these environment variables in Render:

### Required Variables:
- `VITE_SUPABASE_URL` - Your Supabase project URL (e.g., `https://hegixxfxymvwlcenuewx.supabase.co`)
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key

### Optional Variables (for future features):
- `VITE_STRIPE_PUBLIC_KEY` - For payments (optional, can add later)

## Step 3: Deploy to Render

### Option A: Using Render Dashboard (Manual)

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" and select "Static Site"
3. Connect your Git repository
4. Configure the site:
   - **Name**: `synthix` (or your preferred name)
   - **Root Directory**: `artifacts/print3d` (or leave blank if repo root is print3d)
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. Click "Advanced" and add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click "Create Static Site"

### Option B: Using render.yaml (Infrastructure as Code)

1. The `render.yaml` file in this repository defines the deployment
2. In Render dashboard, click "Blueprint" and connect your repo
3. Render will automatically detect the `render.yaml` and configure everything

## Step 4: Verify Deployment

1. Once deployment completes, Render will provide a URL like `https://synthix.onrender.com`
2. Visit the URL to verify the site loads
3. Test registration and login functionality

## Step 5: Set Up Supabase Database

### Run the Migration Script

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the contents of `SUPABASE_MIGRATION.sql`
4. This will:
   - Create necessary tables
   - Set up Row Level Security (RLS)
   - Create triggers for new user registration

### Configure Supabase Authentication

1. In Supabase dashboard, go to Authentication > Settings
2. Under "Site URL", add your Render URL (e.g., `https://synthix.onrender.com`)
3. Under "Redirect URLs", add:
   - `https://synthix.onrender.com/**`
   - `http://localhost:4173/**` (for local dev)

## Step 6: Configure Custom Domain (Optional)

1. In Render dashboard, go to your static site settings
2. Click "Custom Domains"
3. Add your domain (e.g., `synthix.com`)
4. Follow Render's DNS configuration instructions

## Step 7: Enable Analytics (Optional)

1. Add Google Analytics or Plausible
2. Set `VITE_GA_ID` environment variable if using Google Analytics
3. Update the code to load analytics

## Troubleshooting

### Build Fails

1. Check build logs in Render dashboard
2. Ensure all dependencies are in `package.json`
3. Verify Node.js version (Render uses Node 18+ by default)

### Supabase Connection Issues

1. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
2. Check Supabase dashboard for any IP restrictions
3. Ensure your Supabase project is active

### 404 Errors on Routes

This is a single-page application (SPA). Render should automatically handle SPA routing, but if not:
1. Add a `_redirects` file in `public/` folder with: `/* /index.html 200`
2. Or configure Render to serve `index.html` for all 404s

## Updating the Site

Simply push changes to your Git repository:
```bash
git add .
git commit -m "Your changes"
git push
```

Render will automatically rebuild and redeploy.

## Production Checklist

- [ ] Environment variables set correctly
- [ ] Supabase migration script run
- [ ] Authentication redirect URLs configured
- [ ] Site loads without errors
- [ ] Registration works
- [ ] Login works
- [ ] Logout works
- [ ] Protected routes require auth
- [ ] Database RLS policies active
- [ ] (Optional) Custom domain configured
- [ ] (Optional) SSL certificate active

## Cost Estimation (Render)

**Free Tier:**
- Static Sites: Unlimited, 100 GB bandwidth/month
- Suitable for development and small production sites

**Paid Tiers (if needed):**
- Starter: $7/month (more bandwidth, faster builds)
- Pro: $25/month (custom domains, team features)

## Support

- Render Docs: https://render.com/docs
- Supabase Docs: https://supabase.com/docs
- React Docs: https://react.dev
