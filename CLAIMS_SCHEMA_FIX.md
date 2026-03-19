# Fixing Supabase Claims Table Schema

## Problem
The frontend is inserting a "status" column but the database may not have it, causing insert errors.

## Solution

### Step 1: Access Supabase Dashboard
1. Go to https://supabase.com and sign in
2. Select your "Smart Campus" project
3. Go to **SQL Editor** (left sidebar)

### Step 2: Run Schema Check
Copy the entire contents of `SUPABASE_SCHEMA_CHECK.sql` and paste it into the SQL Editor, then click **Run**.

This will:
- Verify the claims table exists
- Show the current schema
- Add the status column if missing
- Add constraints if missing
- Create necessary indexes
- Display RLS policies

### Step 3: Verify Results
Look for these columns in the output:
- `id` (uuid, primary key)
- `item_id` (uuid, foreign key)
- `claimer_id` (uuid, foreign key)
- `message` (text)
- `status` (text, default: 'pending')
- `created_at` (timestamp)
- `updated_at` (timestamp)

The `status` column should have a check constraint ensuring values are one of: `pending`, `approved`, `rejected`

### Step 4: Verify RLS Policies
Look for these policies:
- "Users can insert own claims"
- "Users can view relevant claims"
- "Item owners can update claim status"

If any are missing, they will be created automatically.

### Step 5: Check Indexes
Verify these indexes exist:
- `claims_item_id_idx`
- `claims_claimer_id_idx`
- `claims_status_idx`

### Step 6: Restart App
```bash
npm run dev
```

## Quick SQL Commands (if you need to fix things manually)

### Add status column
```sql
ALTER TABLE public.claims
ADD COLUMN status TEXT NOT NULL DEFAULT 'pending'
CHECK (status IN ('pending', 'approved', 'rejected'));
```

### Add status index
```sql
CREATE INDEX IF NOT EXISTS claims_status_idx ON public.claims(status);
```

### Enable RLS
```sql
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
```

### Create RLS Policy for insert
```sql
CREATE POLICY "Users can insert own claims"
  ON public.claims FOR INSERT
  WITH CHECK (auth.uid() = claimer_id);
```

## Testing the Claim System

### 1. Verify in DevTools
When you submit a claim:
- Open DevTools → Network tab
- Look for POST request to `/api/claims`
- Response should include `status: "pending"`

### 2. Check Database
In Supabase → Table Editor:
1. Go to `claims` table
2. You should see new claims with `status = 'pending'`

### 3. Debug Logs
Check browser console for any errors when submitting claims.

## Files Created/Modified

- **Migration:** `supabase/migrations/20240318001000_ensure_claims_status_column.sql`
- **Schema Check:** `SUPABASE_SCHEMA_CHECK.sql`
- **Frontend Services:**
  - `src/services/claimService.ts` (submits status: 'pending')
  - `src/app/api/claims/route.ts` (API endpoint)
  - `src/types/claim.ts` (type definitions)

## Troubleshooting

### Error: "Column 'status' does not exist"
→ Run the schema check script to add the column

### Error: "Not authenticated"
→ Make sure you're logged in when submitting a claim

### Error: "You have already claimed this item"
→ This is by design - users can only claim each item once

### Claims not appearing in database
→ Check Browser DevTools → Network for API errors
→ Check Supabase realtime subscriptions and RLS policies
