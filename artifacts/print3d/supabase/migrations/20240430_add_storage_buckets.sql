-- Create storage buckets for file uploads
-- This migration sets up the necessary storage buckets and RLS policies
-- Note: Supabase storage is built-in, no extension needed

-- Create custom-order-files bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'custom-order-files',
  'custom-order-files',
  false,
  10485760, -- 10MB limit
  ARRAY['application/octet-stream', 'model/stl', 'model/obj', 'model/3mf', 'image/png', 'image/jpeg', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Create listings-files bucket for listing uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listings-files',
  'listings-files',
  false,
  104857600, -- 100MB limit
  ARRAY['application/octet-stream', 'model/stl', 'model/obj', 'model/3mf', 'model/ply', 'application/gcode', 'image/png', 'image/jpeg', 'application/pdf', 'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for custom-order-files
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migration)
DROP POLICY IF EXISTS "Allow authenticated users to upload custom order files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to read own custom order files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own custom order files" ON storage.objects;

-- Allow authenticated users to upload to custom-order-files
CREATE POLICY "Allow authenticated users to upload custom order files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'custom-order-files'
  AND (auth.uid()::text = split_part(name, '/', 1) OR name LIKE auth.uid()::text || '/%')
);

-- Allow users to read their own files
CREATE POLICY "Allow users to read own custom order files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'custom-order-files'
  AND (auth.uid()::text = split_part(name, '/', 1) OR name LIKE auth.uid()::text || '/%')
);

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete own custom order files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'custom-order-files'
  AND (auth.uid()::text = split_part(name, '/', 1) OR name LIKE auth.uid()::text || '/%')
);

-- RLS Policies for listings-files
-- Drop existing policies if they exist (for idempotent migration)
DROP POLICY IF EXISTS "Allow authenticated users to upload listing files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to read own listing files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own listing files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to listing files" ON storage.objects;

-- Allow authenticated users to upload to listings-files
CREATE POLICY "Allow authenticated users to upload listing files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'listings-files'
  AND (auth.uid()::text = split_part(name, '/', 1) OR name LIKE auth.uid()::text || '/%')
);

-- Allow users to read their own files
CREATE POLICY "Allow users to read own listing files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'listings-files'
  AND (auth.uid()::text = split_part(name, '/', 1) OR name LIKE auth.uid()::text || '/%')
);

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete own listing files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'listings-files'
  AND (auth.uid()::text = split_part(name, '/', 1) OR name LIKE auth.uid()::text || '/%')
);

-- Grant public read access for listing files (if needed for public downloads)
CREATE POLICY "Allow public read access to listing files"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'listings-files');
