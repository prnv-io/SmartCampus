/** @type {import('next').NextConfig} */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

let remoteImageDomains = []
try {
  if (supabaseUrl) {
    // extract host like <project>.supabase.co
    const host = new URL(supabaseUrl).host
    remoteImageDomains.push(host)
  }
} catch (e) {
  // ignore invalid/absent env
}

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true
  },
  images: {
    domains: remoteImageDomains,
  },
}

module.exports = nextConfig
