'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed w-full z-50 px-6 py-4 bg-gray-900/80 backdrop-blur-lg"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
          2D Metaverse
        </Link>
        
        <div className="flex items-center gap-8">
          <Link href="https://linkedin.com" target="_blank" className="hover:text-emerald-400 transition-colors">
            LinkedIn
          </Link>
          <Link href="https://github.com" target="_blank" className="hover:text-emerald-400 transition-colors">
            GitHub
          </Link>
          <Link href="https://twitter.com" target="_blank" className="hover:text-emerald-400 transition-colors">
            Twitter
          </Link>
          <button className="bg-emerald-500 hover:bg-emerald-400 text-gray-900 px-6 py-2 rounded-full font-semibold transition-all hover:scale-105">
            <Link href='/signup'>Sign up</Link>
          </button>
        </div>
      </div>
    </motion.nav>
  )
}