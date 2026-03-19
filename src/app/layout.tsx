import './globals.css'
import PageTransition from '../components/PageTransition'
import LiveBackground from '../components/LiveBackground'
import AuthSync from '../components/AuthSync'

export const metadata = {
  title: 'Smart Campus — Lost & Found'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="relative min-h-screen bg-transparent">
        <div className="relative">
          <LiveBackground />
          <div className="relative z-10" suppressHydrationWarning>
            <AuthSync />
            <PageTransition>{children}</PageTransition>
          </div>
        </div>
      </body>
    </html>
  );
}
