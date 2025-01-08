import Hero from '@/components/Hero'
import Navbar from '@/components/Navbar'
import Features from '@/components/Features'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
    </main>
  )
}