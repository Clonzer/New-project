# Discover Page Storage Setup Guide

The 405 errors on upload indicate the `discover-media` storage bucket doesn't exist. You need to create it manually in the Supabase dashboard.

## Manual Setup Steps

### 1. Create the Storage Bucket

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `hegixxfxymvwlcenuewx`
3. Click **Storage** in the left sidebar
4. Click **New bucket**
5. Enter the following:
   - **Name**: `discover-media`
   - **Public bucket**: ✅ **ON** (checked)
   - **File size limit**: `52428800` (50MB)
   - **Allowed MIME types**:
     ```
     image/png
     image/jpeg
     image/gif
     image/webp
     video/mp4
     video/webm
     video/quicktime
     ```
6. Click **Save**

### 2. Set Up RLS Policies

After creating the bucket, you need to add RLS (Row Level Security) policies:

1. Click on the `discover-media` bucket
2. Click **Policies** tab
3. Click **New policy**

#### Policy 1: Allow Authenticated Uploads
- **Policy name**: `Allow authenticated uploads`
- **Allowed operation**: `INSERT` (upload)
- **Target roles**: `authenticated`
- **Policy definition**:
  ```
  (auth.uid()::text = split_part(name, '/', 2))
  ```
- Click **Save policy**

#### Policy 2: Allow Authenticated Deletes
- **Policy name**: `Allow authenticated deletes`
- **Allowed operation**: `DELETE`
- **Target roles**: `authenticated`
- **Policy definition**:
  ```
  (auth.uid()::text = split_part(name, '/', 2))
  ```
- Click **Save policy**

**Note**: Public read access is automatic since the bucket is public.

### 3. Run the SQL Migration

Run the SQL file `supabase/migrations/20240501_fix_discover_and_relationships.sql` in the Supabase SQL Editor to:
- Create the `discover-media` bucket via SQL
- Create the `profiles` table if missing
- Create the `message_threads`, `message_thread_participants`, and `messages` tables
- Set up proper RLS policies

### 4. Alternative: Use Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase login
supabase link --project-ref hegixxfxymvwlcenuewx
supabase db push
```

## Testing the Upload

After setup, test the discover page:
1. Go to `/discover`
2. Click "Add Image" or "Add Video"
3. Select a file
4. You should see a preview
5. Type some text and click "Post"
6. The upload should succeed (check browser Network tab)

## Troubleshooting

### 405 Method Not Allowed
- The bucket doesn't exist - follow steps above to create it

### 400 Bad Request on sellers query
- The `profiles` table relationship isn't set up
- Run the SQL migration to fix it
- The code now fetches sellers and profiles separately to avoid this

### 500 Internal Server Error on message_thread_participants
- The messaging tables don't exist
- Run the SQL migration to create them
- Check that RLS policies don't have recursion issues

## SQL Quick Fix

If you want to quickly run just the storage fix:

```sql
-- Create discover-media bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'discover-media',
  'discover-media',
  true,
  52428800,
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Add upload policy
CREATE POLICY "Allow authenticated uploads"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'discover-media' AND auth.uid()::text = split_part(name, '/', 2));

-- Add delete policy
CREATE POLICY "Allow authenticated deletes"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'discover-media' AND auth.uid()::text = split_part(name, '/', 2));
```
