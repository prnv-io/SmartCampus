"use client"

import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import { supabase } from '@/services/supabaseClient'
import ItemCard from '../../components/ItemCard'
import { useRouter } from 'next/navigation'

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

      const { data, error } = await supabase.from('items').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      if (error) {
        console.error('Failed to fetch user items:', error)
        if (mounted) setItems([])
      } else {
        if (mounted) setItems((data as DbItem[]) || [])
      }
      if (mounted) setLoading(false)
    })()

    return () => { mounted = false }
  }, [router])

  const lost = items.filter((i) => i.status === 'lost')
  const found = items.filter((i) => i.status === 'found')

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
                    <ItemCard key={it.id} item={{ id: it.id, title: it.title, category: it.category, location: it.location, status: it.status, date: it.date ?? it.created_at ?? null, imageUrl: it.image_url ?? null } as any} />
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
