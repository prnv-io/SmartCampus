"use client"

import { useState } from 'react'
import { supabase } from '@/services/supabaseClient'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    try {
      if (mode === 'sign-up') {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('Check your email for a confirmation link (if email confirmations are enabled).')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        setMessage('Signed in successfully.')
      }
    } catch (err: any) {
      setMessage(err?.message || 'Authentication error')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setMessage('Signed out.')
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{mode === 'sign-up' ? 'Create account' : 'Sign in'}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="flex flex-col">
          <span className="text-sm font-medium text-gray-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 rounded-md border border-gray-200 px-3 py-2"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-medium text-gray-700">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 rounded-md border border-gray-200 px-3 py-2"
          />
        </label>

        {message && <p className="text-sm text-gray-700">{message}</p>}

        <div className="flex items-center justify-between gap-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-terracotta text-white rounded-md hover:bg-terracotta-700 disabled:opacity-60"
          >
            {loading ? 'Working...' : mode === 'sign-up' ? 'Create account' : 'Sign in'}
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')}
            className="text-sm text-gray-600 underline"
          >
            {mode === 'sign-in' ? 'Create an account' : 'Have an account? Sign in'}
          </button>
        </div>

        <div className="pt-2">
          <button type="button" onClick={handleSignOut} className="text-sm text-gray-500">Sign out</button>
        </div>
      </form>
    </div>
  )
}
