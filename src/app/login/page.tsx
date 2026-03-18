"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/services/supabaseClient'
import Navbar from '@/components/Navbar'
import { syncUser } from '@/services/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else {
      try {
        await syncUser()
      } catch (e: any) {
        console.warn('[Login] syncUser failed', e)
      }
      router.push('/items')
    }
  }

  const signInWithGoogle = async () => {
    setError(null)
    setLoading(true)
    try {
      const redirectTo = typeof window !== 'undefined' ? window.location.origin + '/items' : undefined
      const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })

      if (error) {
        setError(error.message)
      } else if (data?.url) {
        // If Supabase returns a redirect URL, navigate there.
        window.location.assign(data.url)
      }
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-md mx-auto px-4 py-10">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-xl font-semibold mb-4">Login</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Email</span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 rounded-md border border-gray-200 px-3 py-2" />
            </label>

            <label className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Password</span>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 rounded-md border border-gray-200 px-3 py-2" />
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div>
              <button type="submit" disabled={loading} className="w-full inline-flex justify-center items-center px-4 py-2 bg-terracotta text-white rounded-md font-medium hover:bg-terracotta-700 disabled:opacity-60">{loading ? 'Logging in...' : 'Login'}</button>
            </div>
          </form>

          <div className="my-4 flex items-center">
            <div className="flex-1 h-px bg-gray-200" />
            <div className="px-3 text-sm text-gray-500">OR</div>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div>
            <button onClick={signInWithGoogle} disabled={loading} className="w-full inline-flex items-center justify-center gap-3 px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50">
              <svg className="h-5 w-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M44.5 20H24v8.5h11.9C34.3 32.7 30 36 24 36c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.3 0 6.2 1.2 8.4 3.1l6-6C34.9 3.8 29.8 1.5 24 1.5 12.6 1.5 3.5 10.6 3.5 22s9.1 20.5 20.5 20.5c11.8 0 20.5-8.3 20.5-20.5 0-1.4-.1-2.6-.5-3.5z" fill="#FFC107"/>
                <path d="M6.3 14.6l6.6 4.8C14.9 16 19 13.5 24 13.5c3.3 0 6.2 1.2 8.4 3.1l6-6C34.9 3.8 29.8 1.5 24 1.5 16.1 1.5 9.2 5.9 6.3 14.6z" fill="#FF3D00"/>
                <path d="M24 46.5c5.5 0 10.4-1.8 14.1-4.9l-6.5-5.3C29.7 37.9 27 38.9 24 38.9c-6 0-10.9-4.1-12.7-9.6l-6.6 5.1C6.6 41.9 14.6 46.5 24 46.5z" fill="#4CAF50"/>
                <path d="M44.5 20H24v8.5h11.9c-1 2.7-3 5-6.4 6.8-1.8.9-3.9 1.5-6.5 1.5-6 0-10.9-4.1-12.7-9.6l-6.6 5.1C6.6 41.9 14.6 46.5 24 46.5c11.4 0 20.5-9.1 20.5-20.5 0-1.4-.1-2.6-.5-3.5z" fill="#1976D2"/>
              </svg>
              <span className="text-sm text-gray-700">Continue with Google</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
