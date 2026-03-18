 "use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/services/supabaseClient'
import { sendItemUpdateEmail } from '@/services/notificationService'

type AdminItem = {
  id: string
  title: string
  status: string
}

export default function AdminPage() {
  const [items, setItems] = useState<AdminItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data, error } = await supabase.from('items').select('id, title, status').order('created_at', { ascending: false })
      if (!mounted) return
      if (error) {
        console.error('Failed to load items for admin', error)
        setItems([])
      } else {
        setItems((data as AdminItem[]) || [])
      }
      setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [])

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('items').update({ status }).eq('id', id)
    if (error) {
      console.error('Failed to update status', error)
      return
    }
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status } : it)))
    try {
      await sendItemUpdateEmail(id)
    } catch (e) {
      console.warn('Failed to send status-change email', e)
    }
  }

  if (loading) return null

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Admin — Items</h1>
      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.id} className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
            <div>
              <div className="font-medium">{it.title}</div>
              <div className="text-xs text-gray-500">Status: {it.status}</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => updateStatus(it.id, 'lost')}
                className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
              >
                Mark lost
              </button>
              <button
                onClick={() => updateStatus(it.id, 'found')}
                className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
              >
                Mark found
              </button>
              <button
                onClick={() => updateStatus(it.id, 'returned')}
                className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
              >
                Mark returned
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
