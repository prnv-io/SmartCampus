-- Smart Campus Claims System - Database Setup
-- Copy and paste this entire script into Supabase SQL Editor and click Run
-- This script is idempotent and safe to run multiple times

-- ============================================================================
-- STEP 1: Create claims table (if it doesn't exist)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  claimer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- STEP 2: Create indexes for better query performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS claims_item_id_idx ON public.claims(item_id);
CREATE INDEX IF NOT EXISTS claims_claimer_id_idx ON public.claims(claimer_id);
CREATE INDEX IF NOT EXISTS claims_status_idx ON public.claims(status);
CREATE INDEX IF NOT EXISTS claims_created_at_idx ON public.claims(created_at DESC);

-- ============================================================================
-- STEP 3: Enable Row Level Security (RLS)
-- ============================================================================

ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 4: Create RLS Policies
-- ============================================================================

-- Policy 1: Users can insert their own claims
CREATE POLICY IF NOT EXISTS "Users can insert own claims"
  ON public.claims
  FOR INSERT
  WITH CHECK (auth.uid() = claimer_id);

-- Policy 2: Users can view claims they made or claims on items they own
CREATE POLICY IF NOT EXISTS "Users can view relevant claims"
  ON public.claims
  FOR SELECT
  USING (
    auth.uid() = claimer_id
    OR
    auth.uid() IN (
      SELECT owner_id FROM public.items WHERE id = claims.item_id
    )
  );

-- Policy 3: Item owners can update claim status
CREATE POLICY IF NOT EXISTS "Item owners can update claim status"
  ON public.claims
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT owner_id FROM public.items WHERE id = claims.item_id
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT owner_id FROM public.items WHERE id = claims.item_id
    )
  );

-- ============================================================================
-- STEP 5: Verification (these queries help debug if needed)
-- ============================================================================

-- Verify table exists and has correct columns
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'claims'
ORDER BY ordinal_position;

-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'claims';

-- Verify policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'claims'
ORDER BY policyname;

-- ============================================================================
-- STEP 6: Create helper view (optional but useful)
-- ============================================================================

CREATE OR REPLACE VIEW public.vw_claims_summary AS
SELECT 
  c.id as claim_id,
  c.item_id,
  i.title as item_title,
  i.owner_id,
  c.claimer_id,
  c.status,
  c.message,
  c.created_at,
  c.updated_at
FROM public.claims c
LEFT JOIN public.items i ON c.item_id = i.id
ORDER BY c.created_at DESC;

-- ============================================================================
-- SUCCESS! 
-- Your claims table is now ready to accept claim submissions
-- ============================================================================
