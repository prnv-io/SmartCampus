import './globals.css'
import PageTransition from '../components/PageTransition'

export const metadata = {
  title: 'Smart Campus — Lost & Found'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  )
}
