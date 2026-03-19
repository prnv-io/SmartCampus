"use client"

import { supabase } from "@/services/supabaseClient"
import { getCurrentUser, syncUser } from "@/services/auth"
import { uploadImage } from "@/services/storage"

export type CreateItemInput = {
  title: string
  description: string
  category: string
  location: string
  status: "lost" | "found" | "returned"
  date?: Date
  imageFile?: File | null
  map_x?: number | null // normalized 0–1
  map_y?: number | null // normalized 0–1
  map_zone?: string | null
}

export async function createItem(input: CreateItemInput): Promise<void> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("You must be logged in to report an item.")
  }

  // Ensure the custom `users` table has this user.
  await syncUser()

  let imageUrl: string | null = null
  if (input.imageFile) {
    const uploaded = await uploadImage(input.imageFile, user.id)
    imageUrl = uploaded.publicUrl
  }

  const payload = {
    title: input.title,
    description: input.description,
    category: input.category,
    location: input.location,
    status: input.status,
    image_url: imageUrl,
    user_id: user.id,
    date: input.date ?? new Date(),
    map_x: input.map_x ?? null,
    map_y: input.map_y ?? null,
    map_zone: input.map_zone ?? null,
  }

  const { error } = await supabase.from("items").insert([payload])
  if (error) throw error
}

