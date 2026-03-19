-- Ensure claims table has status column with proper constraints
-- This migration is idempotent and safe to run multiple times

-- Check if status column exists, if not add it
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
  END IF;
END $$;

-- Ensure the check constraint exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_schema = 'public'
    AND table_name = 'claims'
    AND constraint_name LIKE '%status_check%'
  ) THEN
    -- Note: If constraint exists with different name, this will fail silently
    -- You may need to manually ensure the constraint exists
    ALTER TABLE public.claims
    ADD CONSTRAINT claims_status_check
    CHECK (status IN ('pending', 'approved', 'rejected'));
  END IF;
EXCEPTION WHEN duplicate_object THEN
  -- Constraint already exists, silently ignore
  NULL;
END $$;

-- Create index on status if it doesn't exist
CREATE INDEX IF NOT EXISTS claims_status_idx ON public.claims(status);

-- View to help with debugging
CREATE OR REPLACE VIEW public.claims_summary AS
SELECT 
  c.id,
  c.item_id,
  c.claimer_id,
  c.status,
  c.created_at,
  i.title as item_title,
  i.owner_id
FROM public.claims c
LEFT JOIN public.items i ON c.item_id = i.id
ORDER BY c.created_at DESC;
