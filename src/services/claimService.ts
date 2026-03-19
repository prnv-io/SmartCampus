import supabase from './supabaseClient'
import { Claim, ClaimRequest } from '../types/claim'

/**
 * Submit a claim for an item
 */
export async function submitClaim(itemId: string, message: string) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Not authenticated')
  }

  // Verify item exists and is a "found" item
  const { data: item, error: itemError } = await supabase
    .from('items')
    .select('status')
    .eq('id', itemId)
    .single()

  if (itemError || !item) {
    throw new Error('Item not found')
  }

  if (item.status !== 'found') {
    throw new Error('You can only claim found items')
  }

  // Check if user already claimed this item
  const { data: existingClaim } = await supabase
    .from('claims')
    .select('id')
    .eq('item_id', itemId)
    .eq('claimer_id', user.id)
    .single()

  if (existingClaim) {
    throw new Error('You have already claimed this item')
  }

  // Insert new claim
  const { data, error } = await supabase
    .from('claims')
    .insert({
      item_id: itemId,
      claimer_id: user.id,
      message,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as Claim
}

/**
 * Get claims for an item
 */
export async function getItemClaims(itemId: string) {
  const { data, error } = await supabase
    .from('claims')
    .select('*')
    .eq('item_id', itemId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data as Claim[]
}

/**
 * Check if current user already claimed an item
 */
export async function hasUserClaimedItem(itemId: string) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return false
  }

  const { data, error } = await supabase
    .from('claims')
    .select('id')
    .eq('item_id', itemId)
    .eq('claimer_id', user.id)
    .single()

  if (error) {
    return false
  }

  return !!data
}

/**
 * Update claim status (admin/owner only)
 */
export async function updateClaimStatus(claimId: string, status: 'approved' | 'rejected') {
  const { data, error } = await supabase
    .from('claims')
    .update({ status })
    .eq('id', claimId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as Claim
}

const claimService = {
  submitClaim,
  getItemClaims,
  hasUserClaimedItem,
  updateClaimStatus,
}

export default claimService
