"use client"

import { supabase } from "@/services/supabaseClient"

export type UploadImageResult = {
  filePath: string
  publicUrl: string
}

const ITEMS_BUCKET = "items"

/**
 * Uploads an image to Supabase Storage and returns a public URL.
 * Assumes the bucket is configured to allow public reads or you are ok with public URLs for demo.
 */
export async function uploadImage(file: File, userId: string): Promise<UploadImageResult> {
  const safeName = file.name.replace(/[^\w.\-]+/g, "_")
  const filePath = `items/${userId}/${Date.now()}-${safeName}`

  const { error: uploadError } = await supabase.storage.from(ITEMS_BUCKET).upload(filePath, file)
  if (uploadError) {
    // Improve the common "Bucket not found" error with an actionable message.
    const msg = String((uploadError as any)?.message ?? uploadError)
    if (msg.toLowerCase().includes("bucket") && msg.toLowerCase().includes("not found")) {
      throw new Error(
        `Bucket "${ITEMS_BUCKET}" not found. Create a Storage bucket named "${ITEMS_BUCKET}" in Supabase (Storage → New bucket), then retry.`
      )
    }
    throw uploadError
  }

  const { data } = supabase.storage.from(ITEMS_BUCKET).getPublicUrl(filePath)
  const publicUrl = data?.publicUrl
  if (!publicUrl) throw new Error("Failed to create public URL for uploaded file")

  return { filePath, publicUrl }
}

/**
 * Backward-compatible resolver:
 * - If `imageUrlOrPath` is already a URL, return it.
 * - Otherwise treat it as a storage path in the `items` bucket and return a public URL.
 */
export function resolvePublicImageUrl(imageUrlOrPath: string | null | undefined): string | null {
  if (!imageUrlOrPath) return null
  if (imageUrlOrPath.startsWith("http")) return imageUrlOrPath
  const { data } = supabase.storage.from(ITEMS_BUCKET).getPublicUrl(imageUrlOrPath)
  return data?.publicUrl ?? null
}

