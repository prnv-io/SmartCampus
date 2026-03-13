// API route placeholder: /api/find-similar-items

import { NextResponse } from 'next/server'

export async function POST() {
  const items = [
    {
      id: 's1',
      title: 'Black Backpack with Logo',
      category: 'Bags',
      location: 'Library - 2nd floor',
      image: '/images/mock/backpack.jpg',
      similarity: 0.93
    },
    {
      id: 's2',
      title: 'Navy Hoodie',
      category: 'Clothing',
      location: 'Cafeteria',
      image: '/images/mock/hoodie.jpg',
      similarity: 0.86
    },
    {
      id: 's3',
      title: 'Silver Insulated Bottle',
      category: 'Accessories',
      location: 'Gym',
      image: '/images/mock/bottle.jpg',
      similarity: 0.82
    },
    {
      id: 's4',
      title: 'Set of Keys with Red Keychain',
      category: 'Keys',
      location: 'Pool',
      image: '/images/mock/keys.jpg',
      similarity: 0.78
    },
    {
      id: 's5',
      title: 'USB Drive (16GB)',
      category: 'Electronics',
      location: 'Lecture Hall A',
      image: '/images/mock/usb.jpg',
      similarity: 0.71
    }
  ]

  return NextResponse.json({ items })
}
