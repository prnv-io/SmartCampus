import ItemCard from './ItemCard'

const sampleItems = [
  {
    id: '1',
    title: 'Black Backpack',
    category: 'Bags',
    location: 'Library - 2nd floor',
    date: '2026-03-10',
    status: 'lost'
  },
  {
    id: '2',
    title: 'Silver Water Bottle',
    category: 'Accessories',
    location: 'Gym',
    date: '2026-03-09',
    status: 'found'
  }
]

export default function ItemCardExample() {
  return (
    <section className="py-8">
      <h2 className="text-xl font-semibold mb-4">Example Items</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sampleItems.map((it) => (
          <ItemCard
            key={it.id}
            item={{
              id: it.id,
              title: it.title,
              category: it.category,
              location: it.location,
              date: it.date,
              status: it.status
            }}
          />
        ))}
      </div>
    </section>
  )
}
