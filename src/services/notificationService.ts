"use client"

import { supabase } from "@/services/supabaseClient"

// For a real app, prefer calling a Next.js route that uses a secret API key.
// For this demo, we use EmailJS from the client side.

type ItemOwnerRow = {
  title: string | null
  users?: {
    email: string | null
  } | null
}

async function getItemOwner(itemId: string): Promise<{ email: string; title: string }> {
  const { data, error } = await supabase
    .from("items")
    .select("title, users ( email )")
    .eq("id", itemId)
    .single<ItemOwnerRow>()

  if (error || !data || !data.users?.email) {
    throw new Error("Owner email not found for item " + itemId)
  }

  return {
    email: data.users.email as string,
    title: data.title ?? "your item",
  }
}

/**
 * Sends a simple email notification to the owner of an item
 * saying that there is a new update.
 *
 * For demo purposes, this uses EmailJS environment variables.
 */
export async function sendItemUpdateEmail(itemId: string): Promise<void> {
  const { email, title } = await getItemOwner(itemId)

  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

  if (!serviceId || !templateId || !publicKey) {
    // eslint-disable-next-line no-console
    console.warn("[notificationService] EmailJS env vars not set, skipping email send.")
    return
  }

  const subject = "Update on your lost item"
  const message = `Your item (${title}) has a new update. Please check your dashboard.`

  // Lazy-load emailjs to keep bundle small.
  const emailjs = await import("emailjs-com")

  await emailjs.send(
    serviceId,
    templateId,
    {
      to_email: email,
      subject,
      message,
    },
    publicKey
  )
}

