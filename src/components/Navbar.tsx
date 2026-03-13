"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/services/supabaseClient'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<any | null>(null)
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!mounted) return
      setUser(data?.user ?? null)
    }

    fetchUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      listener?.subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="text-lg font-semibold text-terracotta">Campus Lost & Found</Link>
          </div>

          <nav className="hidden md:flex space-x-6 items-center">
            <Link href="/" className="text-gray-700 hover:text-terracotta">Home</Link>
            <Link href="/items" className="text-gray-700 hover:text-terracotta">Browse Items</Link>
            <Link href="/report-lost" className="text-gray-700 hover:text-terracotta">Report Lost</Link>
            <Link href="/report-found" className="text-gray-700 hover:text-terracotta">Report Found</Link>

            {user ? (
              <>
                <Link href="/my-items" className="text-gray-700 hover:text-terracotta">My Items</Link>
                <button onClick={handleSignOut} className="px-3 py-1 bg-white border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-3 py-1 bg-white border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50">Login</Link>
                <Link href="/signup" className="px-3 py-1 bg-terracotta text-white rounded-md text-sm hover:bg-terracotta-700">Signup</Link>
              </>
            )}
          </nav>

          <div className="md:hidden">
            <button
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-label="Toggle navigation"
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Home</Link>
            <Link href="/items" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Browse Items</Link>
            <Link href="/report-lost" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Report Lost</Link>
            <Link href="/report-found" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Report Found</Link>
            {user ? (
              <>
                <Link href="/my-items" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">My Items</Link>
                <button onClick={handleSignOut} className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Login</Link>
                <Link href="/signup" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Signup</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
