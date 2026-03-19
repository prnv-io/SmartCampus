-- Quick schema verification and fix script for claims table
-- Copy and paste this into Supabase SQL Editor

-- 1. Check if claims table exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'claims'
) as claims_table_exists;

-- 2. Show current claims table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'claims'
ORDER BY ordinal_position;

-- 3. Add status column if missing (safe to run - will fail silently if exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'claims' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.claims
    ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
    
    -- Add constraint
    ALTER TABLE public.claims
    ADD CONSTRAINT claims_status_check
    CHECK (status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

-- 4. Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'claims';

-- 5. Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual as policy_definition
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'claims'
ORDER BY policyname;

-- 6. Create any missing indexes
CREATE INDEX IF NOT EXISTS claims_item_id_idx ON public.claims(item_id);
CREATE INDEX IF NOT EXISTS claims_claimer_id_idx ON public.claims(claimer_id);
CREATE INDEX IF NOT EXISTS claims_status_idx ON public.claims(status);

-- 7. Test insert (will fail if user not authenticated, which is expected)
-- This is just to verify the schema accepts the insert format
-- SELECT * FROM public.claims LIMIT 0;
