"use client"

import type { User } from "@supabase/supabase-js"
import { supabase } from "@/services/supabaseClient"

type UsersRowInsert = {
  id: string
  email: string | null
  name: string
  created_at: string
}

function buildUserInsert(user: User): UsersRowInsert {
  const email = user.email ?? null
  const name =
    (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()) ||
    (typeof user.user_metadata?.name === "string" && user.user_metadata.name.trim()) ||
    (email ? email.split("@")[0] : null) ||
    "User"

  return {
    id: user.id,
    email,
    name,
    created_at: new Date().toISOString(),
  }
}

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw error
  return user ?? null
}

/**
 * Ensures the currently authenticated Supabase user exists in the custom `users` table.
 * Safe to call repeatedly. Designed to work with RLS policies:
 * - insert allowed only when `id = auth.uid()`
 */
export async function syncUser(): Promise<void> {
  const user = await getCurrentUser()
  if (!user) return

  const { data: existing, error: selectError } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle()

  if (selectError) throw selectError
  if (existing?.id) return

  const payload = buildUserInsert(user)
  const { error: insertError } = await supabase.from("users").insert([payload])
  if (insertError) throw insertError
}

