import Navbar from '../../components/Navbar'
import AuthForm from '../../components/AuthForm'

export const metadata = {
  title: 'Auth',
}

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <AuthForm />
      </main>
    </div>
  )
}
