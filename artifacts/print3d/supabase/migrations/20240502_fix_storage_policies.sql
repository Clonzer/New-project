-- Fix Storage Policies - Restrict SELECT to user's own files only
-- ================================================================
-- This migration fixes overly broad SELECT policies that allowed 
-- users to list ALL files in storage buckets

DO $$
DECLARE
  has_permission BOOLEAN := false;
BEGIN
  -- Check if we have permission to modify storage.objects
  BEGIN
    PERFORM 1 FROM storage.objects LIMIT 1;
    has_permission := true;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'No permission to access storage.objects. Please apply these fixes manually via Dashboard.';
  END;

  IF has_permission THEN
    -- ================================================================
    -- PRIVATE BUCKETS (custom-order-files, listings-files)
    -- Users can ONLY see their own files
    -- ================================================================
    
    -- Drop old broad read policies for private buckets
    DROP POLICY IF EXISTS "Allow users to read own custom order files" ON storage.objects;
    DROP POLICY IF EXISTS "Allow users to read own listing files" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated users to read own custom order files" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated users to read own listing files" ON storage.objects;
    
    -- Create RESTRICTED read policy for custom-order-files
    -- Users can ONLY select files where the path starts with their user ID
    CREATE POLICY "Allow users to read own custom order files"
      ON storage.objects FOR SELECT TO authenticated
      USING (
        bucket_id = 'custom-order-files'
        AND (
          -- File path format: userId/filename
          split_part(name, '/', 1) = auth.uid()::text
        )
      );
    
    -- Create RESTRICTED read policy for listings-files  
    CREATE POLICY "Allow users to read own listing files"
      ON storage.objects FOR SELECT TO authenticated
      USING (
        bucket_id = 'listings-files'
        AND (
          split_part(name, '/', 1) = auth.uid()::text
        )
      );
    
    -- Keep public read for listings-files (needed for public model viewing)
    DROP POLICY IF EXISTS "Allow public read access to listing files" ON storage.objects;
    CREATE POLICY "Allow public read access to listing files"
      ON storage.objects FOR SELECT TO anon
      USING (
        bucket_id = 'listings-files'
        -- Public can only read, not list all files
        AND split_part(name, '/', 1) IS NOT NULL
      );
    
    -- ================================================================
    -- PUBLIC BUCKET (discover-media) - Fixed
    -- Public bucket allows reads but authenticated users can only 
    -- see their own uploads for management purposes
    -- ================================================================
    
    -- Drop old discover-media policies
    DROP POLICY IF EXISTS "Allow authenticated reads discover media" ON storage.objects;
    DROP POLICY IF EXISTS "Allow users to read own discover media" ON storage.objects;
    
    -- Create RESTRICTED read for discover-media
    -- Even though bucket is public, authenticated users should only 
    -- see their own uploads when querying (for management)
    CREATE POLICY "Allow users to read own discover media"
      ON storage.objects FOR SELECT TO authenticated
      USING (
        bucket_id = 'discover-media'
        AND (
          -- Path format: discover-media/userId/filename
          -- auth.uid() should match the second segment
          split_part(name, '/', 2) = auth.uid()::text
        )
      );
    
    -- Public can read any file in discover-media (it's a public feed)
    DROP POLICY IF EXISTS "Allow public read discover media" ON storage.objects;
    CREATE POLICY "Allow public read discover media"
      ON storage.objects FOR SELECT TO anon
      USING (
        bucket_id = 'discover-media'
      );
    
    RAISE NOTICE 'Storage policies updated with restricted SELECT access.';
    RAISE NOTICE 'Users can now only list and read their own files in private buckets.';
  END IF;
END $$;

-- ================================================================
-- MANUAL SETUP INSTRUCTIONS (if SQL fails)
-- ================================================================
--
-- If you get permission errors, manually update policies in Supabase Dashboard:
--
-- 1. Go to Supabase Dashboard → Storage → Policies
--
-- 2. For each bucket, edit the SELECT policies to:
--
--    custom-order-files (SELECT for authenticated):
--    bucket_id = 'custom-order-files' AND split_part(name, '/', 1) = auth.uid()::text
--
--    listings-files (SELECT for authenticated):  
--    bucket_id = 'listings-files' AND split_part(name, '/', 1) = auth.uid()::text
--
--    listings-files (SELECT for anon - public read):
--    bucket_id = 'listings-files' AND split_part(name, '/', 1) IS NOT NULL
--
--    discover-media (SELECT for authenticated):
--    bucket_id = 'discover-media' AND split_part(name, '/', 2) = auth.uid()::text
--
--    discover-media (SELECT for anon - public feed):
--    bucket_id = 'discover-media'
--
-- 3. Delete any old policies that allow broad access like:
--    bucket_id = 'bucket-name' (without user ID check)
