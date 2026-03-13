"use client"

import Navbar from '../../../components/Navbar'
import ClaimButton from '../../../components/ClaimButton'

type MockItem = {
  id: string
  title: string
  description?: string
  category: string
  location: string
  date: string
  status: string
  imageUrl?: string
  map_x?: number | null
  map_y?: number | null
}

const MOCK: MockItem[] = [
  { id: '1', title: 'Black Backpack', description: 'Large backpack with laptop sleeve.', category: 'Bags', location: 'Library', date: '2026-03-10', status: 'lost', map_x: 300, map_y: 200 },
  { id: '2', title: 'Silver Water Bottle', description: 'Insulated bottle with sticker.', category: 'Accessories', location: 'Gym', date: '2026-03-09', status: 'found' },
  { id: '3', title: 'Blue Hoodie', description: 'Medium size, navy blue.', category: 'Clothing', location: 'Cafeteria', date: '2026-03-08', status: 'lost' }
]

export default function ItemPage({ params }: { params: { id: string } }) {
  const { id } = params
  const item = MOCK.find((m) => m.id === id)

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-10">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">Item not found.</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="w-full h-96 relative bg-gray-100">
            {item.imageUrl ? (
              // use a plain img for simplicity in this mock
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No image</div>
            )}
          </div>

          <div className="p-6">
            <h1 className="text-2xl font-bold mb-2">{item.title}</h1>
            <p className="text-gray-600 mb-4">{item.description ?? 'No description provided.'}</p>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-700 space-y-2">
                <div><span className="font-medium">Category:</span> {item.category}</div>
                <div><span className="font-medium">Location:</span> {item.location}</div>
                <div><span className="font-medium">Date:</span> {item.date}</div>
                <div>
                  <span className={`inline-block px-2 py-1 rounded ${
                    item.status === 'found' ? 'bg-green-100 text-green-800' : item.status === 'lost' ? 'bg-terracotta-100 text-terracotta-700' : 'bg-gray-100 text-gray-700'
                  }`}>{item.status}</span>
                </div>
              </div>

              <div>
                {item.status === 'found' ? <ClaimButton itemId={id} /> : null}
              </div>
            </div>

            {/* Map preview section (optional) */}
            {typeof item.map_x === 'number' && typeof item.map_y === 'number' && (
              <div className="mt-6">
                <h2 className="text-lg font-medium mb-2">Location on campus map</h2>
                <div className="relative border rounded-lg overflow-hidden" style={{ width: '100%', maxWidth: 800 }}>
                  <MapWithPin mapX={item.map_x} mapY={item.map_y} />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function MapWithPin({ mapX, mapY }: { mapX: number; mapY: number }) {
  // mapX and mapY are stored as percentages (0-100)
  // of the image width and height respectively.
  return (
    <div className="w-full relative">
      <img
        src="/campus-map.jpg"
        alt="Campus map"
        className="w-full h-auto block select-none"
        draggable={false}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: `${mapX}%`,
          top: `${mapY}%`,
          transform: 'translate(-50%, -100%)',
          pointerEvents: 'none',
        }}
      >
        <div className="w-6 h-6 bg-red-600 rounded-full border-2 border-white shadow-md" />
      </div>
    </div>
  )
}
