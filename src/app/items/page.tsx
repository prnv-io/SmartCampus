"use client"

import { useEffect, useMemo, useState } from 'react'
import Navbar from '../../components/Navbar'
import ItemCard from '../../components/ItemCard'
import { supabase } from '@/services/supabaseClient'

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

export default function ItemsPage() {
  const [items, setItems] = useState<DbItem[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [locationFilter, setLocationFilter] = useState('All')

  useEffect(() => {
    let mounted = true

    const fetchItems = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to fetch items:', error)
        if (mounted) setItems([])
      } else {
        if (mounted) {
          const rows = (data as DbItem[]) || []

          // For items that have an `image_url` which is not an absolute URL,
          // attempt to create a short-lived signed URL (useful when bucket is private).
          const resolved = await Promise.all(
            rows.map(async (it) => {
              try {
                if (!it.image_url) return it

                // if image_url already looks like a full URL, keep as-is
                if (typeof it.image_url === 'string' && it.image_url.startsWith('http')) {
                  return it
                }

                // Otherwise treat image_url as a storage path (file name/path) and request signed URL
                const { data: signed, error: signError } = await supabase
                  .storage
                  .from('items-images')
                  .createSignedUrl(it.image_url as string, 60)

                if (signError) {
                  console.error('Failed to create signed URL for', it.image_url, signError)
                  return it
                }

                return { ...it, image_url: signed?.signedUrl ?? it.image_url }
              } catch (e) {
                console.error('Error resolving image URL', e)
                return it
              }
            })
          )

          setItems(resolved)
        }
      }

      if (mounted) setLoading(false)
    }

    fetchItems()

    return () => {
      mounted = false
    }
  }, [])

  const categories = useMemo(() => ['All', ...Array.from(new Set(items.map((m) => m.category).filter(Boolean) as string[]))], [items])
  const locations = useMemo(() => ['All', ...Array.from(new Set(items.map((m) => m.location).filter(Boolean) as string[]))], [items])

  const filtered = useMemo(() => {
    return items.filter((m) => {
      if (categoryFilter !== 'All' && m.category !== categoryFilter) return false
      if (locationFilter !== 'All' && m.location !== locationFilter) return false
      if (query && !(`${m.title} ${m.category ?? ''} ${m.location ?? ''}`.toLowerCase().includes(query.toLowerCase()))) return false
      return true
    })
  }, [items, query, categoryFilter, locationFilter])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold mb-4">Browse Items</h1>

        <section className="mb-6 flex flex-col md:flex-row md:items-center md:gap-4 gap-3">
          <div className="flex-1">
            <label className="sr-only">Search</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search items, categories, locations..."
              className="w-full rounded-md border border-gray-200 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
            />
          </div>

          <div className="flex items-center gap-2">
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-md border border-gray-200 px-3 py-2 bg-white">
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="rounded-md border border-gray-200 px-3 py-2 bg-white">
              {locations.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </section>

        <section>
          {loading ? (
            <p className="text-gray-600">Loading items...</p>
          ) : filtered.length === 0 ? (
            <p className="text-gray-600">No items reported yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((it) => {
                const mapped = {
                  id: it.id,
                  title: it.title,
                  category: it.category,
                  location: it.location,
                  status: it.status,
                  date: it.date ?? it.created_at ?? null,
                  imageUrl: it.image_url ?? null,
                  image_url: it.image_url ?? null,
                }

                return <ItemCard key={it.id} item={mapped as any} />
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
