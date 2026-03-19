# Claim System Implementation - Complete Guide

## Status: ✅ Frontend Complete | ⏳ Database Schema Pending

The claim system is fully implemented in the frontend and backend. You now need to ensure the Supabase database schema is correct.

---

## Quick Start

### 1. Fix Database Schema (5 minutes)

1. Go to [Supabase Dashboard](https://supabase.com)
2. Select your "Smart Campus" project
3. Click **SQL Editor** in the left sidebar
4. Copy the entire contents of `SUPABASE_SCHEMA_CHECK.sql` from the workspace root
5. Paste it into the SQL Editor
6. Click **Run**

This will:
- Create the claims table if it doesn't exist
- Add the `status` column if missing
- Add all necessary constraints and indexes
- Verify RLS policies

### 2. Restart the App

```bash
npm run dev
```

The app will restart on port 3004 (or the next available port).

### 3. Test the Claim System

1. Open http://localhost:3004 (or your running port)
2. Navigate to **Browse Items**
3. Find an item card
4. Click **Claim Item** button
5. Enter a message describing why you want to claim the item
6. Click **Submit Claim**
7. You should see a success message

---

## What Was Implemented

### Frontend Components

#### 1. **ClaimButton** (`src/components/ClaimButton.tsx`)
- Displays "Claim Item" button on item cards
- Checks if user already claimed the item
- Disables button if already claimed
- Opens claim modal on click

#### 2. **ClaimModal** (`src/components/ClaimModal.tsx`)
- Modal form for submitting a claim
- Textarea for users to describe why they want the item
- Shows success message after submission
- Displays error messages if submission fails

#### 3. **ItemCard Integration** (`src/components/ItemCard.tsx`)
- Includes ClaimButton and ClaimModal
- Tracks claim status per item
- Updates button state after successful claim

### Backend Services

#### 1. **claimService** (`src/services/claimService.ts`)
- `submitClaim(itemId, message)` - Submit a new claim
- `getItemClaims(itemId)` - Get all claims for an item
- `hasUserClaimedItem(itemId)` - Check if current user claimed item
- `updateClaimStatus(claimId, status)` - Update claim to approved/rejected

#### 2. **API Route** (`src/app/api/claims/route.ts`)
- `POST /api/claims` - Submit a claim
- `GET /api/claims?itemId=...` - Get claims for an item

### Database Schema

**Table: `claims`**

```sql
CREATE TABLE public.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  claimer_id UUID NOT NULL REFERENCES public.auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Indexes:**
- `claims_item_id_idx` - For finding claims by item
- `claims_claimer_id_idx` - For finding claims by user
- `claims_status_idx` - For filtering by status

**RLS Policies:**
- Users can insert their own claims
- Users can view claims they made or that are on items they own
- Item owners can update claim status

---

## File Locations

```
src/
├── components/
│   ├── ClaimButton.tsx      ← Claim button for item cards
│   ├── ClaimModal.tsx       ← Modal form for claiming items
│   ├── ItemCard.tsx         ← Updated with claim integration
│   └── ...
├── services/
│   ├── claimService.ts      ← Claim API functions
│   ├── supabaseClient.ts    ← Supabase client
│   └── ...
├── types/
│   ├── claim.ts             ← Claim type definitions
│   └── ...
├── app/
│   └── api/
│       └── claims/
│           └── route.ts     ← API endpoint for claims
└── ...

supabase/
└── migrations/
    ├── 20240314000000_storage_items_images_policies.sql
    ├── 20240314001000_users_items_storage_rls.sql
    ├── 20240318000000_create_claims_table.sql          ← Claims schema
    └── 20240318001000_ensure_claims_status_column.sql ← Safety migration

SUPABASE_SCHEMA_CHECK.sql                              ← Run this in Supabase SQL Editor
CLAIMS_SCHEMA_FIX.md                                   ← This guide
```

---

## Common Issues & Solutions

### "Column 'status' does not exist"
**Problem:** Status column not in database
**Solution:** Run `SUPABASE_SCHEMA_CHECK.sql` in Supabase SQL Editor

### "Not authenticated" error
**Problem:** User not logged in
**Solution:** Log in first, then try to claim an item

### "You have already claimed this item"
**Problem:** User already has a claim on this item
**Solution:** This is by design - users can only claim each item once

### Button says "Already Claimed" but I didn't claim it
**Problem:** Another logged-in session claimed it
**Solution:** The app correctly prevents duplicate claims

### Modal doesn't close after claiming
**Problem:** Network error or database issue
**Solution:** Check browser console (F12) for error messages

### Claim doesn't appear in Supabase
**Problem:** RLS policy may be blocking the query
**Solution:** 
1. Go to Supabase Dashboard
2. Table Editor → claims
3. Check if rows appear (they might be hidden by RLS)
4. Verify you're running as the right user

---

## Testing Checklist

- [ ] Database schema is correct (run SUPABASE_SCHEMA_CHECK.sql)
- [ ] App starts without errors (npm run dev)
- [ ] Can navigate to Browse Items page
- [ ] Claim buttons appear on item cards
- [ ] Can click "Claim Item" button
- [ ] Modal opens and displays
- [ ] Can enter a message in textarea
- [ ] Can click Submit button
- [ ] Success message appears
- [ ] Button changes to "Already Claimed"
- [ ] Claim appears in Supabase Dashboard

---

## Next Steps

### For Admins/Item Owners
- View claims on items they own
- Approve or reject claims
- (This requires additional UI components - not yet implemented)

### For Users
- View their submitted claims
- See claim status (pending/approved/rejected)
- (This requires a "My Claims" page - not yet implemented)

---

## API Documentation

### Submit Claim
```bash
POST /api/claims
Content-Type: application/json

{
  "itemId": "uuid-of-item",
  "message": "I lost this backpack!"
}

Response:
{
  "id": "uuid",
  "item_id": "uuid",
  "claimer_id": "uuid",
  "message": "I lost this backpack!",
  "status": "pending",
  "created_at": "2024-03-18T...",
  "updated_at": "2024-03-18T..."
}
```

### Get Item Claims
```bash
GET /api/claims?itemId=uuid-of-item

Response:
[
  {
    "id": "uuid",
    "item_id": "uuid",
    "claimer_id": "uuid",
    "message": "...",
    "status": "pending",
    "created_at": "2024-03-18T..."
  },
  ...
]
```

---

## Support

If you encounter issues:
1. Check the browser console (F12) for error messages
2. Check the terminal for server-side errors
3. Verify the SQL schema was run successfully in Supabase
4. Make sure you're authenticated before claiming items
5. Check that auth.users table exists in Supabase (it should be created during setup)
