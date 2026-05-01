# Storage Setup Guide

## Quick Steps (Choose One)

### Option A: Try SQL First (30 seconds)
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/20240430_add_storage_buckets.sql`
3. Click **Run**
4. If it works, you're done! ✓
5. If you see "must be owner of table objects", use Option B

---

### Option B: Manual Setup (2 minutes)

#### Step 1: Create Buckets via SQL (or Dashboard)
Run this in SQL Editor (usually works):
```sql
-- Create custom-order-files bucket (10MB, private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('custom-order-files', 'custom-order-files', false, 10485760, 
  ARRAY['application/octet-stream', 'model/stl', 'model/obj', 'model/3mf', 'image/png', 'image/jpeg', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Create listings-files bucket (100MB, private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('listings-files', 'listings-files', false, 104857600,
  ARRAY['application/octet-stream', 'model/stl', 'model/obj', 'model/3mf', 'model/ply', 'application/gcode', 'image/png', 'image/jpeg', 'application/pdf', 'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'])
ON CONFLICT (id) DO NOTHING;

-- Create discover-media bucket (50MB, public) for discover page posts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('discover-media', 'discover-media', true, 52428800,
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'])
ON CONFLICT (id) DO NOTHING;
```

**Or manually:**
1. Go to Dashboard → **Storage**
2. Click **New bucket**
3. Name: `custom-order-files` | Public: **OFF** | Size limit: **10MB**
4. Click **New bucket** again
5. Name: `listings-files` | Public: **OFF** | Size limit: **100MB**
6. Click **New bucket** again
7. Name: `discover-media` | Public: **ON** | Size limit: **50MB**

---

#### Step 2: Add Policies (Dashboard Only)

**For bucket: `custom-order-files`**

1. Click on `custom-order-files` bucket
2. Click **Policies** tab
3. Click **New policy**

**Policy 1 - Upload:**
- Name: `Allow authenticated uploads`
- Allowed operation: **INSERT**
- Target roles: **authenticated**
- Policy definition: Paste this exact code:
```
(auth.uid()::text = split_part(name, '/', 1) OR name LIKE auth.uid()::text || '/%')
```
- Click **Review** → **Save policy**

**Policy 2 - Read:**
- Click **New policy**
- Name: `Allow authenticated reads`
- Allowed operation: **SELECT**
- Target roles: **authenticated**
- Policy definition: Same as above
- Click **Save policy**

**Policy 3 - Delete:**
- Click **New policy**
- Name: `Allow authenticated deletes`
- Allowed operation: **DELETE**
- Target roles: **authenticated**
- Policy definition: Same as above
- Click **Save policy**

---

**For bucket: `listings-files`**

Repeat the same 3 policies as above, PLUS:

---

**For bucket: `discover-media`**

Since this bucket is public, you only need upload/delete policies:

**Policy 1 - Upload:**
- Name: `Allow authenticated uploads`
- Allowed operation: **INSERT**
- Target roles: **authenticated**
- Policy definition:
```
(auth.uid()::text = split_part(name, '/', 2))
```
- Click **Save policy**

**Policy 2 - Delete:**
- Name: `Allow authenticated deletes`
- Allowed operation: **DELETE**
- Target roles: **authenticated**
- Policy definition: Same as above
- Click **Save policy**

Note: Public read access is automatic since the bucket is public.

**Policy 4 - Public Read:**
- Click **New policy**
- Name: `Allow public reads`
- Allowed operation: **SELECT**
- Target roles: **anon** (this means public/unauthenticated)
- Policy definition: Paste this:
```
(bucket_id = 'listings-files')
```
- Click **Save policy**

---

## Verify Setup

1. Both buckets appear in Storage list
2. `custom-order-files` has 3 policies (INSERT, SELECT, DELETE)
3. `listings-files` has 4 policies (INSERT, SELECT, DELETE, + public SELECT)

## What These Policies Do

- **Upload (INSERT)**: Users can only upload files to their own folder (e.g., `user-id/filename.stl`)
- **Read (SELECT)**: Users can only see their own files
- **Delete**: Users can only delete their own files
- **Public Read**: Anyone can download listing files (for public marketplace)

## Troubleshooting

**"Bucket already exists"**
- That's fine, skip to policies

**"Policy already exists"**
- Delete the old policy first, or edit it

**"Invalid policy syntax"**
- Make sure you copied the exact text including parentheses

## Need Help?

If stuck, you can also create these via Supabase CLI with service_role key, or contact Supabase support with your project ID: `hegixxfxymvwlcenuewx`
