-- Storage Buckets Setup
-- ====================
-- NOTE: This migration requires elevated permissions for storage.objects policies.
-- If you get "must be owner of table objects" error, use MANUAL SETUP below.

-- =====================================================
-- PART 1: Create Buckets (Usually works via SQL)
-- =====================================================

-- Create custom-order-files bucket (10MB limit, private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'custom-order-files',
  'custom-order-files',
  false,
  10485760,
  ARRAY['application/octet-stream', 'model/stl', 'model/obj', 'model/3mf', 'image/png', 'image/jpeg', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Create listings-files bucket (100MB limit, private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listings-files',
  'listings-files',
  false,
  104857600,
  ARRAY['application/octet-stream', 'model/stl', 'model/obj', 'model/3mf', 'model/ply', 'application/gcode', 'image/png', 'image/jpeg', 'application/pdf', 'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed']
)
ON CONFLICT (id) DO NOTHING;

-- Create discover-media bucket (50MB limit, public) for discover page posts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'discover-media',
  'discover-media',
  true,
  52428800,
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PART 2: RLS Policies (Requires elevated permissions)
-- =====================================================
-- 
-- MANUAL SETUP INSTRUCTIONS (if SQL fails):
-- ==========================================
--
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "New bucket" and create:
--    - Name: custom-order-files
--    - Public: OFF (private)
--    - File size limit: 10MB
--    - Allowed MIME types: (leave empty for all)
--
-- 3. Click "New bucket" and create:
--    - Name: listings-files  
--    - Public: OFF (private)
--    - File size limit: 100MB
--    - Allowed MIME types: (leave empty for all)
--
-- 4. For EACH bucket, go to "Policies" tab and add:
--
--    POLICY 1: Allow authenticated uploads
--    - Name: "Allow authenticated uploads"
--    - Allowed operation: INSERT
--    - Target roles: authenticated
--    - Policy definition:
--      (auth.uid()::text = split_part(name, '/', 1) OR name LIKE auth.uid()::text || '/%')
--
--    POLICY 2: Allow authenticated reads
--    - Name: "Allow authenticated reads"
--    - Allowed operation: SELECT  
--    - Target roles: authenticated
--    - Policy definition:
--      (auth.uid()::text = split_part(name, '/', 1) OR name LIKE auth.uid()::text || '/%')
--
--    POLICY 3: Allow authenticated deletes
--    - Name: "Allow authenticated deletes"
--    - Allowed operation: DELETE
--    - Target roles: authenticated  
--    - Policy definition:
--      (auth.uid()::text = split_part(name, '/', 1) OR name LIKE auth.uid()::text || '/%')
--
-- 5. For listings-files bucket ONLY, also add:
--
--    POLICY 4: Allow public reads
--    - Name: "Allow public reads"
--    - Allowed operation: SELECT
--    - Target roles: anon
--    - Policy definition: (bucket_id = 'listings-files')
--
-- =====================================================
-- AUTOMATED POLICY CREATION (attempts via SQL)
-- =====================================================

DO $$
DECLARE
  has_permission BOOLEAN := false;
BEGIN
  -- Check if we have permission to modify storage.objects
  BEGIN
    PERFORM 1 FROM storage.objects LIMIT 1;
    has_permission := true;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'No permission to access storage.objects. Skipping policy creation.';
    RAISE NOTICE 'Please create policies manually via Dashboard (see instructions above).';
  END;

  IF has_permission THEN
    -- Enable RLS
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies
    DROP POLICY IF EXISTS "Allow authenticated users to upload custom order files" ON storage.objects;
    DROP POLICY IF EXISTS "Allow users to read own custom order files" ON storage.objects;
    DROP POLICY IF EXISTS "Allow users to delete own custom order files" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated users to upload listing files" ON storage.objects;
    DROP POLICY IF EXISTS "Allow users to read own listing files" ON storage.objects;
    DROP POLICY IF EXISTS "Allow users to delete own listing files" ON storage.objects;
    DROP POLICY IF EXISTS "Allow public read access to listing files" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated users to upload discover media" ON storage.objects;
    DROP POLICY IF EXISTS "Allow users to delete own discover media" ON storage.objects;
    
    -- Create custom-order-files policies
    CREATE POLICY "Allow authenticated users to upload custom order files"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'custom-order-files' 
        AND (auth.uid()::text = split_part(name, '/', 1) OR name LIKE auth.uid()::text || '/%'));
    
    CREATE POLICY "Allow users to read own custom order files"
      ON storage.objects FOR SELECT TO authenticated
      USING (bucket_id = 'custom-order-files'
        AND (auth.uid()::text = split_part(name, '/', 1) OR name LIKE auth.uid()::text || '/%'));
    
    CREATE POLICY "Allow users to delete own custom order files"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'custom-order-files'
        AND (auth.uid()::text = split_part(name, '/', 1) OR name LIKE auth.uid()::text || '/%'));
    
    -- Create listings-files policies
    CREATE POLICY "Allow authenticated users to upload listing files"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'listings-files'
        AND (auth.uid()::text = split_part(name, '/', 1) OR name LIKE auth.uid()::text || '/%'));
    
    CREATE POLICY "Allow users to read own listing files"
      ON storage.objects FOR SELECT TO authenticated
      USING (bucket_id = 'listings-files'
        AND (auth.uid()::text = split_part(name, '/', 1) OR name LIKE auth.uid()::text || '/%'));
    
    CREATE POLICY "Allow users to delete own listing files"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'listings-files'
        AND (auth.uid()::text = split_part(name, '/', 1) OR name LIKE auth.uid()::text || '/%'));
    
    CREATE POLICY "Allow public read access to listing files"
      ON storage.objects FOR SELECT TO anon
      USING (bucket_id = 'listings-files');
    
    -- Create discover-media policies (bucket is public, so only need upload/delete)
    CREATE POLICY "Allow authenticated users to upload discover media"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'discover-media'
        AND (auth.uid()::text = split_part(name, '/', 2)));
    
    CREATE POLICY "Allow users to delete own discover media"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'discover-media'
        AND (auth.uid()::text = split_part(name, '/', 2)));
    
    RAISE NOTICE 'Storage policies created successfully via SQL.';
  END IF;
END $$;
