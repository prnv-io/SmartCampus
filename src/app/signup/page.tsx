"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/services/supabaseClient'
import Navbar from '@/components/Navbar'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      router.push('/items')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-md mx-auto px-4 py-10">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-xl font-semibold mb-4">Create account</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Email</span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 rounded-md border border-gray-200 px-3 py-2" />
            </label>

            <label className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Password</span>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 rounded-md border border-gray-200 px-3 py-2" />
            </label>

            <label className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Confirm password</span>
              <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1 rounded-md border border-gray-200 px-3 py-2" />
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div>
              <button type="submit" disabled={loading} className="w-full inline-flex justify-center items-center px-4 py-2 bg-terracotta text-white rounded-md font-medium hover:bg-terracotta-700 disabled:opacity-60">{loading ? 'Creating...' : 'Create Account'}</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
