import './globals.css'
import PageTransition from '../components/PageTransition'
import AnimatedBackground from '../components/AnimatedBackground'
import InteractiveBackground from '../components/InteractiveBackground'
import AuthSync from '../components/AuthSync'

export const metadata = {
  title: 'Smart Campus — Lost & Found'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="relative min-h-screen">
        <AnimatedBackground />
        <InteractiveBackground />
        <AuthSync />
        <div className="relative z-20">
          <PageTransition>{children}</PageTransition>
        </div>
      </body>
    </html>
  )
}
