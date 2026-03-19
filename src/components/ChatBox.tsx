"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "@/services/supabaseClient"

interface Message {
  id: string
  claim_id: string
  sender_id: string
  message: string
  created_at: string
}

interface ChatBoxProps {
  claimId: string
  userId: string
}

export default function ChatBox({ claimId, userId }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()

    const channel = supabase
      .channel('chat-' + claimId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `claim_id=eq.${claimId}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [claimId])

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('claim_id', claimId)
      .order('created_at', { ascending: true })

    setMessages((data as Message[]) || [])
  }

  const sendMessage = async () => {
    if (!text.trim()) return

    try {
      setSending(true)
      const { error } = await supabase.from('messages').insert({
        claim_id: claimId,
        sender_id: userId,
        message: text
      })

      if (error) {
        console.error('FULL ERROR:', error)
        alert(error.message)
        return
      }

      setText("")
    } catch (err) {
      console.error('Failed to send message:', err)
      alert((err as any).message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="mt-4 border rounded-xl p-4 bg-white shadow-sm">
      <h3 className="font-semibold text-sm mb-3">Chat with Claimer</h3>

      <div className="h-64 overflow-y-auto space-y-2 bg-gray-50 rounded-lg p-3 mb-3">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">No messages yet</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg max-w-xs text-sm ${
                msg.sender_id === userId
                  ? 'bg-terracotta text-white ml-auto'
                  : 'bg-gray-300 text-gray-900'
              }`}
            >
              {msg.message}
              <div className={`text-xs mt-1 ${msg.sender_id === userId ? 'text-orange-100' : 'text-gray-500'}`}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type message..."
          disabled={sending}
        />
        <button
          onClick={sendMessage}
          disabled={sending || !text.trim()}
          className="bg-terracotta hover:bg-terracotta-700 disabled:bg-terracotta-400 text-white px-4 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
        >
          {sending ? '...' : 'Send'}
        </button>
      </div>
    </div>
  )
}
