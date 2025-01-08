'use client'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Pixel {
  x: number
  y: number
  size: number
  duration: number
  color: string
}

export default function FloatingPixels() {
  const [pixels, setPixels] = useState<Pixel[]>([])

  useEffect(() => {
    // Generate random pixels with varied properties
    const colors = [
      'bg-emerald-400',
      'bg-blue-400',
      'bg-cyan-400',
      'bg-teal-400'
    ]
    
    const newPixels = Array.from({ length: 30 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 20 + 10, // Random size between 10-30px
      duration: Math.random() * 5 + 3, // Random duration between 3-8s
      color: colors[Math.floor(Math.random() * colors.length)]
    }))
    setPixels(newPixels)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none">
      {pixels.map((pixel, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-lg ${pixel.color} opacity-30`}
          style={{
            width: pixel.size,
            height: pixel.size,
          }}
          initial={{ 
            x: pixel.x,
            y: pixel.y,
            scale: 0,
            rotate: 0
          }}
          animate={{
            x: [pixel.x, pixel.x + 100, pixel.x - 100, pixel.x],
            y: [pixel.y, pixel.y - 100, pixel.y + 100, pixel.y],
            scale: [1, 1.2, 0.8, 1],
            rotate: [0, 180, -180, 0],
          }}
          transition={{
            duration: pixel.duration,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  )
}