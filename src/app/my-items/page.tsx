"use client"

import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import { supabase } from '@/services/supabaseClient'
import ItemCard from '../../components/ItemCard'
import ChatBox from '../../components/ChatBox'
import { useRouter } from 'next/navigation'
import { Claim } from '@/types/claim'

type DbItem = {
  id: string
  title: string
  category?: string
  location?: string
  date?: string | null
  status?: string
  image_url?: string | null
  created_at?: string | null
}

export default function MyItemsPage() {
  const [items, setItems] = useState<DbItem[]>([])
  const [loading, setLoading] = useState(true)
  const [claimsMap, setClaimsMap] = useState<Record<string, Claim[]>>({})
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user ?? null
      if (!user) {
        router.push('/login')
        return
      }

      setUserId(user.id)

      const { data, error } = await supabase.from('items').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      if (error) {
        console.error('Failed to fetch user items:', error)
        if (mounted) setItems([])
      } else {
        if (mounted) setItems((data as DbItem[]) || [])

        // Fetch claims for found and claimed items
        if (mounted && data) {
          const claimableItems = (data as DbItem[]).filter(item => ['found', 'claimed'].includes(item.status || ''))
          const newClaimsMap: Record<string, Claim[]> = {}

          for (const item of claimableItems) {
            const { data: claims, error: claimsError } = await supabase
              .from('claims')
              .select('*')
              .eq('item_id', item.id)

            if (!claimsError) {
              newClaimsMap[item.id] = (claims as Claim[]) || []
            }
          }

          if (mounted) setClaimsMap(newClaimsMap)
        }
      }
      if (mounted) setLoading(false)
    })()

    return () => { mounted = false }
  }, [router])

  const lost = items.filter((i) => i.status === 'lost')
  const found = items.filter((i) => ['found', 'claimed'].includes(i.status || ''))

  const approveClaim = async (claimId: string, itemId: string) => {
    try {
      const { error } = await supabase
        .from('claims')
        .update({ status: 'approved' })
        .eq('claim_id', claimId)

      if (error) throw error

      // Reject others
      await supabase
        .from('claims')
        .update({ status: 'rejected' })
        .eq('item_id', itemId)
        .neq('claim_id', claimId)

      // Mark item as claimed
      await supabase
        .from('items')
        .update({ status: 'claimed' })
        .eq('id', itemId)

      alert('Claim approved successfully')
      window.location.reload()
    } catch (err) {
      console.error(err)
      alert((err as any).message)
    }
  }

  const rejectClaim = async (claimId: string) => {
    try {
      const { error } = await supabase
        .from('claims')
        .update({ status: 'rejected' })
        .eq('claim_id', claimId)

      if (error) throw error

      alert('Claim rejected')
      window.location.reload()
    } catch (err) {
      console.error(err)
      alert((err as any).message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold mb-6">My Items</h1>

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-gray-600">You have not reported any items yet.</p>
        ) : (
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">Lost Items Reported</h2>
              {lost.length === 0 ? <p className="text-gray-600">No lost items reported.</p> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lost.map((it) => (
                    <ItemCard key={it.id} item={{ id: it.id, title: it.title, category: it.category, location: it.location, status: it.status, date: it.date ?? it.created_at ?? null, imageUrl: it.image_url ?? null } as any} />
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Found Items Reported</h2>
              {found.length === 0 ? <p className="text-gray-600">No found items reported.</p> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {found.map((it) => (
                    <div key={it.id} className="space-y-3">
                      <ItemCard item={{ id: it.id, title: it.title, category: it.category, location: it.location, status: it.status, date: it.date ?? it.created_at ?? null, imageUrl: it.image_url ?? null } as any} />
                      
                      {/* Claims Section */}
                      {['found', 'claimed'].includes(it.status || '') && (
                        <div className="bg-white rounded-xl shadow-sm p-4">
                          <p className="font-semibold text-sm mb-3">Claims ({claimsMap[it.id]?.length || 0})</p>
                          
                          {claimsMap[it.id] && claimsMap[it.id].length === 0 ? (
                            <p className="text-gray-500 text-sm">No claims yet</p>
                          ) : (
                            <div className="space-y-2">
                              {claimsMap[it.id]?.map((claim) => (
                                <div key={claim.claim_id} className="p-3 border border-gray-200 rounded-lg">
                                  <p className="text-sm text-gray-700">{claim.message}</p>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-gray-500">
                                      {new Date(claim.created_at).toLocaleDateString()}
                                    </span>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                      claim.status === 'approved' ? 'bg-green-100 text-green-800' :
                                      claim.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                      'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {claim.status}
                                    </span>
                                  </div>

                                  {/* Action Buttons - Only show for pending claims */}
                                  {claim.status === 'pending' ? (
                                    <div className="flex gap-3 mt-3">
                                      <button
                                        onClick={() => approveClaim(claim.claim_id, it.id)}
                                        disabled={loadingId === claim.claim_id}
                                        className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 font-medium disabled:cursor-not-allowed disabled:shadow-none"
                                      >
                                        {loadingId === claim.claim_id ? '...' : '✓ Approve'}
                                      </button>
                                      <button
                                        onClick={() => rejectClaim(claim.claim_id)}
                                        disabled={loadingId === claim.claim_id}
                                        className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 font-medium disabled:cursor-not-allowed disabled:shadow-none"
                                      >
                                        {loadingId === claim.claim_id ? '...' : '✕ Reject'}
                                      </button>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500 mt-3 italic">Already reviewed</p>
                                  )}

                                  {/* Chat Box - Show for approved claims */}
                                  {claim.status === 'approved' && userId && (
                                    <ChatBox claimId={claim.claim_id} userId={userId} />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
