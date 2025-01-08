'use client'
import { motion } from 'framer-motion'

const features = [
  {
    title: "Create & Build",
    description: "Design your own virtual space and bring your imagination to life."
  },
  {
    title: "Connect & Play",
    description: "Join a vibrant community of creators and players from around the world."
  },
  {
    title: "Earn & Trade",
    description: "Transform your creativity into valuable assets within the metaverse."
  }
]

export default function Features() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl hover:transform hover:-translate-y-2 transition-all"
            >
              <h3 className="text-xl font-semibold mb-4 text-emerald-400">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}