"use client"

import { useState, type FormEvent } from 'react'
import { supabase } from '@/services/supabaseClient'
import { sendItemUpdateEmail } from '@/services/notificationService'

interface ClaimButtonProps {
  itemId: string
}

export default function ClaimButton({ itemId }: ClaimButtonProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const openModal = () => {
    setFeedback(null)
    setMessage('')
    setOpen(true)
  }

  const closeModal = () => {
    setOpen(false)
    setLoading(false)
    setFeedback(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!message.trim()) {
      setFeedback('Please enter a message for your claim.')
      return
    }

    setLoading(true)
    setFeedback(null)

    const { data, error } = await supabase.from('claims').insert([
      {
        item_id: itemId,
        claimer_id: 'anonymous_user',
        message: message.trim(),
        claim_status: 'pending',
      },
    ])

    setLoading(false)

    if (error) {
      console.error('Claim insert error:', error)
      setFeedback(error.message || 'Failed to submit claim.')
      return
    }

    try {
      await sendItemUpdateEmail(itemId)
    } catch (notifyErr) {
      console.warn('Failed to send claim notification email', notifyErr)
    }

    setFeedback('Claim submitted successfully.')
    // close after short delay so user can read success
    setTimeout(() => {
      closeModal()
    }, 900)
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center px-3 py-2 bg-terracotta text-white rounded-md text-sm font-medium hover:bg-terracotta-700"
      >
        Claim Item
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />

          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold mb-3">Claim Item</h3>

            <form onSubmit={handleSubmit}>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Message</span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-terracotta"
                  placeholder="Describe why you're claiming this item or how you can be contacted"
                  required
                />
              </label>

              {feedback && (
                <p className={`mt-3 text-sm ${feedback.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{feedback}</p>
              )}

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex items-center px-3 py-2 bg-white border border-gray-200 rounded-md text-sm hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 bg-terracotta text-white rounded-md text-sm font-medium hover:bg-terracotta-700 disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
// (end of file)
