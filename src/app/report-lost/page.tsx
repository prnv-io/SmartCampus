"use client"

import { useState } from 'react'; 
import { supabase } from "@/services/supabaseClient";     
import Navbar from '../../components/Navbar'
import CampusMapPicker from '../../components/CampusMapPicker'
import { motion } from 'framer-motion'
import { fadeInUp } from '../../lib/animations'
import { useRouter } from 'next/navigation'

export default function ReportLostPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Other')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [dateLost, setDateLost] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [mapX, setMapX] = useState<number | null>(null)
  const [mapY, setMapY] = useState<number | null>(null)
  const [mapZone, setMapZone] = useState<string | null>(null)
  

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setImageFile(f)
    if (f) setPreview(URL.createObjectURL(f))
    else setPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  // Ensure user is authenticated
  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user ?? null
  if (!user) {
    alert('You must be logged in to report an item.')
    router.push('/login')
    return
  }

  let imageUrl = null

  if (imageFile) {
    const fileName = `${Date.now()}-${imageFile.name}`

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("items-images")
        .upload(fileName, imageFile)

      if (uploadError) {
        console.error('Supabase upload error:', uploadError)
        alert(`Image upload failed: ${uploadError.message || JSON.stringify(uploadError)}`)
        return
      }

      if (!uploadData) {
        console.error('Supabase returned no upload data for', fileName)
        alert('Image upload failed: no upload data')
        return
      }

      // Save the storage path so the frontend can create signed URLs when needed
      imageUrl = fileName
    } catch (err) {
      console.error('Unexpected error during image upload', err)
      const msg = err instanceof Error ? err.message : String(err)
      alert(`Image upload failed: ${msg}`)
      return
    }
  }

  const { error } = await supabase.from("items").insert([
    {
      title,
      description,
      category,
      location,
      status: "lost",
      image_url: imageUrl,
      user_id: user.id,
      date: dateLost ? new Date(dateLost) : new Date(),
      // optional map coordinates / zone
      map_x: mapX ?? null,
      map_y: mapY ?? null,
      map_zone: mapZone ?? null,
    },
  ])

  if (error) {
    console.error(error)
    alert(error.message)
  } else {
    alert("Lost item reported successfully!")

    setTitle("")
    setCategory("Other")
    setDescription("")
    setLocation("")
    setDateLost("")
    setImageFile(null)
    setPreview(null)
    setMapX(null)
    setMapY(null)
    setMapZone(null)
  }
}

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <motion.main
        className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <h1 className="text-2xl font-semibold mb-6">Report Lost Item</h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 gap-4">
            <label className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Title</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 rounded-md border border-gray-200 px-3 py-2" />
            </label>

            <label className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Category</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 rounded-md border border-gray-200 px-3 py-2 bg-white">
                <option>Bags</option>
                <option>Clothing</option>
                <option>Electronics</option>
                <option>Keys</option>
                <option>Accessories</option>
                <option>Other</option>
              </select>
            </label>

            <label className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Description</span>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-1 rounded-md border border-gray-200 px-3 py-2" />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Last seen location</span>
                <input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 rounded-md border border-gray-200 px-3 py-2" />
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Date lost</span>
                <input type="date" value={dateLost} onChange={(e) => setDateLost(e.target.value)} className="mt-1 rounded-md border border-gray-200 px-3 py-2" />
              </label>
            </div>

            <label className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Image upload</span>
              <input type="file" accept="image/*" onChange={handleImage} className="mt-2" />
              {preview && (
                <img src={preview} alt="preview" className="mt-3 w-48 h-48 object-cover rounded-md border" />
              )}
            </label>

            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Select on campus map (optional)</span>
              <div className="mt-2">
                <CampusMapPicker
                  onLocationSelect={(x, y) => {
                    setMapX(x)
                    setMapY(y)
                  }}
                  onZoneSelect={(zone) => setMapZone(zone)}
                  // make the map taller for easier selection
                  heightClass="h-[60vh] sm:h-[70vh]"
                />
              </div>
              {(mapX !== null && mapY !== null) && (
                <p className="text-xs text-gray-600 mt-2">
                  Selected coordinates: {mapX.toFixed(1)}, {mapY.toFixed(1)}
                  {mapZone && ` • Zone: ${mapZone}`}
                </p>
              )}
            </div>

            <div className="pt-2">
              <button type="submit" className="w-full inline-flex justify-center items-center px-4 py-2 bg-terracotta text-white rounded-md font-medium hover:bg-terracotta-700">Submit Report</button>
            </div>
          </div>
        </form>
      </motion.main>
    </div>
  )
}
