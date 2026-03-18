"use client"

import { useState } from 'react';    
import Navbar from '../../components/Navbar'
import CampusMapPicker from '../../components/CampusMapPicker'
import { motion } from 'framer-motion'
import { fadeInUp } from '../../lib/animations'
import { useRouter } from 'next/navigation'
import { createItem } from '@/services/items'

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

    try {
      await createItem({
        title,
        description,
        category,
        location,
        status: "lost",
        date: dateLost ? new Date(dateLost) : new Date(),
        imageFile,
        map_x: mapX ?? null,
        map_y: mapY ?? null,
        map_zone: mapZone ?? null,
      })

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
    } catch (error: any) {
      console.error(error)
      alert(error?.message || "Failed to report lost item")
      if (String(error?.message || "").includes("logged in")) {
        router.push("/login")
      }
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
