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
    email ||
    "User"

  return {
    id: user.id,
    email,
    name,
    created_at: new Date().toISOString(),
  }
}

/**
 * Ensures the currently authenticated Supabase user exists in the custom `users` table.
 * Safe to call repeatedly.
 */
export async function syncUser(): Promise<void> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) throw authError
  if (!user) return

  const { data: existing, error: selectError } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle()

  if (selectError) throw selectError
  if (existing?.id) return

  const insertPayload = buildUserInsert(user)

  const { error: insertError } = await supabase.from("users").insert([insertPayload])
  if (insertError) throw insertError
}

