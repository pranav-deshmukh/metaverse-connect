'use client'
import { motion } from 'framer-motion'
import FloatingPixels from './FloatingPixels'
import Link from 'next/link'

export default function Hero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-blue-900/50 z-0" />
      <FloatingPixels />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-3xl mx-auto"
      >
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
          Welcome to 2D Metaverse
        </h1>
        <p className="text-lg md:text-xl mb-8 text-gray-200">
          Explore a unique virtual world where creativity meets community. Build, play, and connect in ways you never imagined possible.
        </p>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-emerald-500/25"
        >
          <Link href='/signup'>Start Your Adventure</Link>
        </motion.button>
      </motion.div>
    </div>
  )
}