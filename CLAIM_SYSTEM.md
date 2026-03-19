# Claim Item System Implementation Guide

## Overview
This document outlines the complete "Claim Item" system implemented in the Smart Campus Lost & Found app.

## Components & Files

### 1. **Database Schema** (`supabase/migrations/`)
- **Migration**: `20240318000000_create_claims_table.sql`
- **Table**: `claims`
- **Columns**:
  - `id` - UUID primary key
  - `item_id` - Foreign key to items table
  - `claimer_id` - Foreign key to auth.users
  - `message` - Claim description
  - `status` - pending | approved | rejected
  - `created_at` - Timestamp
  - `updated_at` - Timestamp

**RLS Policies**:
- Users can insert their own claims
- Users can view their claims or claims on items they own
- Item owners can approve/reject claims

### 2. **Service Layer** (`src/services/claimService.ts`)
Main functions:
- `submitClaim(itemId, message)` - Submit a new claim
- `getItemClaims(itemId)` - Fetch all claims for an item
- `hasUserClaimedItem(itemId)` - Check if user already claimed
- `updateClaimStatus(claimId, status)` - Approve/reject claim

### 3. **UI Components**

#### **ClaimModal** (`src/components/ClaimModal.tsx`)
- Modal overlay for claim submission
- Fields: description textarea
- Success state with confirmation
- Error handling

#### **ClaimButton** (`src/components/ClaimButton.tsx`)
- Standalone button component
- Shows "Already Claimed" if user has claimed
- Disables button on duplicate claims

#### **ItemCard** (`src/components/ItemCard.tsx`)
- Updated with Claim button
- Checks claim status on mount
- Integrates with ClaimModal

### 4. **Types** (`src/types/claim.ts`)
```typescript
interface Claim {
  id: string
  item_id: string
  claimer_id: string
  message: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

interface ClaimRequest {
  item_id: string
  message: string
}
```

### 5. **API Route** (`src/app/api/claims/route.ts`)
- **POST** `/api/claims` - Submit claim (with auth)
- **GET** `/api/claims?itemId=XXX` - Fetch claims (item owner only)

## Setup Instructions

### Step 1: Run Database Migration
```bash
supabase migration up
```
Or manually create the claims table in Supabase dashboard.

### Step 2: Install Dependencies
```bash
npm install
```
(framer-motion should already be installed)

### Step 3: Environment Variables
Ensure these are set in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### Step 4: Test the Feature
1. Navigate to `/items` (Browse Items)
2. Click "Claim Item" on any item card
3. Enter a description
4. Submit the claim
5. Should see "Already Claimed" on subsequent attempts

## User Flow

### For Item Seekers (Claimers):
1. Browse items on `/items`
2. Click "Claim Item" button
3. Fill in description (why they claim it / contact info)
4. Submit
5. Receive notification when owner responds

### For Item Owners:
1. Posted items appear on their dashboard (`/my-items`)
2. View incoming claims
3. Approve/reject claims
4. Notified claimer of decision

## Features

✅ **Duplicate Claim Prevention** - Users can only claim once per item
✅ **Authentication Required** - Only logged-in users can claim
✅ **Real-time UI Updates** - Button state changes immediately
✅ **Modal Experience** - Clean, focused UI
✅ **Error Handling** - User-friendly error messages
✅ **Row-Level Security** - Database-level permissions
✅ **Timestamps** - Track when claims are made

## Future Enhancements

- [ ] Email notifications on new claims
- [ ] Admin dashboard to view all claims
- [ ] Claim history/archiving
- [ ] Rating system for claims
- [ ] Bulk claim management
- [ ] Claim timeline/status updates

## Debugging

### Claim Button Shows "Already Claimed" but I Haven't?
- Check browser console for errors
- Verify Supabase auth is working

### Modal Not Submitting?
- Check network tab for API response
- Ensure user is authenticated
- Check browser console for errors

### Claims Not Saving?
- Verify RLS policies in Supabase
- Check if `auth.users` table has user data
- Ensure `claimer_id` matches authenticated user

## Notes

- Claims are stored with `status: 'pending'` by default
- Owners must be authenticated to view/manage claims
- System prevents timestamp conflicts with `DEFAULT NOW()`
- Optional: Add email notifications via `notificationService`
