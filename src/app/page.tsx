import Navbar from '../components/Navbar'
import Link from 'next/link'

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-white via-amber-50 to-white">
      <Navbar />
      <section className="flex-grow flex items-center justify-center px-6">
        <div className="max-w-4xl text-center py-20">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">Lost something on campus? Let the community help you find it.</h1>
          <p className="text-gray-600 mb-8">Quickly report lost or found items and connect with their owners.</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/report-lost" className="inline-block px-6 py-3 rounded-md bg-terracotta text-white text-lg font-medium hover:bg-terracotta-700">Report Lost Item</Link>
            <Link href="/report-found" className="inline-block px-6 py-3 rounded-md border border-terracotta text-terracotta text-lg font-medium hover:bg-terracotta-100">Report Found Item</Link>
          </div>
        </div>
      </section>
      <footer className="py-6 text-center text-sm text-gray-500">© {new Date().getFullYear()} Campus Lost & Found</footer>
    </main>
  )
}
