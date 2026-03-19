// Claim type definitions

export interface Claim {
  claim_id: string
  item_id: string
  claimer_id: string
  message: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export interface ClaimRequest {
  item_id: string
  message: string
}
