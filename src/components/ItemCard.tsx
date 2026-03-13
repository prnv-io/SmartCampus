import Image from 'next/image'
import { motion } from 'framer-motion'
import { Item } from '../types/item'
import { fadeInUp, hoverLift } from '../lib/animations'

interface ItemCardProps {
  item: Item & {
    imageUrl?: string
    category?: string
    location?: string
    date?: string
    status?: string
  }
}

export default function ItemCard({ item }: ItemCardProps) {
  return (
    <motion.article
      className="bg-white rounded-xl shadow-sm transition-shadow duration-200 overflow-hidden"
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      whileHover="hover"
    >
      <div className="w-full h-48 relative bg-gray-50">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">No image</div>
        )}
      </div>

      <motion.div className="p-4" variants={hoverLift}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{item.category ?? 'Uncategorized'}</p>
          </div>
          {item.status && (
            <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              item.status === 'lost'
                ? 'bg-terracotta-100 text-terracotta-700'
                : item.status === 'found'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {item.status}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 2.761-2.239 5-5 5s-5-2.239-5-5 2.239-5 5-5 5 2.239 5 5z" />
              </svg>
              <span>{item.location ?? 'Unknown location'}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7H3v12a2 2 0 002 2z" />
              </svg>
              <span>{item.date ?? 'Unknown date'}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.article>
  )
}
