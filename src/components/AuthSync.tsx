"use client"

import { useEffect } from "react"
import { supabase } from "@/services/supabaseClient"
import { syncUser } from "@/services/auth"

/**
 * Keeps the custom `users` table in sync with Supabase Auth.
 * Required for OAuth redirects where you don't control the post-login flow.
 */
export default function AuthSync() {
  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        await syncUser()
      } catch (e) {
        if (!cancelled) {
          // eslint-disable-next-line no-console
          console.warn("[AuthSync] Failed to sync user", e)
        }
      }
    }

    run()

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        run()
      }
    })

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [])

  return null
}

