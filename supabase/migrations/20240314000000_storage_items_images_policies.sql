-- Fix: "Image upload failed: new row violates row-level security policy"
-- Run this in Supabase Dashboard: SQL Editor → New query → paste and run.
--
-- These policies allow authenticated users to upload and read images
-- in the "items-images" storage bucket used by Report Lost / Report Found.

-- 1. Allow authenticated users to upload (INSERT) into items-images bucket
CREATE POLICY "Allow authenticated uploads to items-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'items-images');

-- 2. Allow authenticated users to read (SELECT) from items-images bucket
--    (so item images can be displayed in the app)
CREATE POLICY "Allow authenticated read from items-images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'items-images');

-- Optional: allow users to update/delete their own uploads
-- (uncomment if you want users to replace or remove item images)
-- CREATE POLICY "Allow users to update own items-images"
-- ON storage.objects
-- FOR UPDATE
-- TO authenticated
-- USING (bucket_id = 'items-images' AND (auth.jwt()->>'sub')::text = owner_id::text)
-- WITH CHECK (bucket_id = 'items-images');
--
-- CREATE POLICY "Allow users to delete own items-images"
-- ON storage.objects
-- FOR DELETE
-- TO authenticated
-- USING (bucket_id = 'items-images' AND (auth.jwt()->>'sub')::text = owner_id::text);
