"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { MapIcon, Users, Plus, Home, Calendar } from "lucide-react";
import FloatingPixels from "@/components/FloatingPixels";
import MapTry from '@/public/MapTry.png'
import Image from "next/image";

const Dashboard = () => {
  const [selectedMap, setSelectedMap] = useState(null);

  const maps = [
    {
      id: 1,
      title: "Office Campus",
      thumbnail: MapTry,
      visitors: 120,
      description: "A modern office space with meeting rooms and gardens",
    },
    {
      id: 2,
      title: "Park Plaza",
      thumbnail: MapTry,
      visitors: 85,
      description: "Open area with fountains and recreational zones",
    },
  ];

  return (
    <div className="min-h-screen w-screen bg-gradient-to-b from-[#1e293b] to-[#0f172a] ">
      <FloatingPixels />
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center mb-8 bg-[#171f2b] p-3 rounded-xl shadow-lg">
        <div className="flex items-center space-x-6">
          <Home className="w-8 h-8 text-white hover:text-emerald-400 cursor-pointer transition-colors" />
          <Calendar className="w-8 h-8 text-white hover:text-emerald-400 cursor-pointer transition-colors" />
          <MapIcon className="w-8 h-8 text-white hover:text-emerald-400 cursor-pointer transition-colors" />
        </div>
        <button className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-5 py-2 rounded-lg flex items-center space-x-2 shadow-lg hover:shadow-xl transition-transform transform hover:scale-105">
          <Plus className="w-5 h-5" />
          <span>Create Space</span>
        </button>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Explore Your Spaces</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {maps.map((map) => (
            <motion.div
              key={map.id}
              className="bg-white/10 shadow-lg rounded-xl overflow-hidden backdrop-blur-md hover:bg-white/20 cursor-pointer transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedMap(map.id)}
            >
              <Image
                src={map.thumbnail}
                alt={map.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-2xl font-semibold text-white mb-2">{map.title}</h3>
                <p className="text-gray-300 mb-4">{map.description}</p>
                <div className="flex items-center text-gray-400">
                  <Users className="w-5 h-5 mr-2" />
                  <span>{map.visitors} visitors</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedMap && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setSelectedMap(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-gradient-to-r from-[#1f2937] to-[#334155] p-6 rounded-xl shadow-xl max-w-md w-full mx-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">
              Welcome to {maps.find((m) => m.id === selectedMap)?.title}
            </h2>
            <p className="text-gray-300 mb-6">
              Loading your virtual space. Get ready to connect and explore!
            </p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
                onClick={() => setSelectedMap(null)}
              >
                Cancel
              </button>
              <button className="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">
                Enter Space
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
