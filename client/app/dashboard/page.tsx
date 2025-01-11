"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapIcon, Users, Plus, Home, Calendar } from "lucide-react";
import FloatingPixels from "@/components/FloatingPixels";
import MapTry from "@/public/MapTry.png";
import Image from "next/image";
import axios from "axios";

const Dashboard = () => {
  const [selectedMap, setSelectedMap] = useState(null);
  const [username, setUsername] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [spaceType, setSpaceType] = useState("");
  const [modalNo, setModalNo] = useState(0);
  const [mapType, setMapType] = useState(0);
  const [mapName, setMapName] = useState("");

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("jwt");
        const response = await axios.post(
          "http://localhost:8000/api/v1/users/getUser",
          { token }
        );
        setUsername(response.data.name);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const handleCreateMap = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const mapData = {
        mapType,
        mapName,
        players: { [username]: { x: 0, y: 0 } }, // Initial position for the user
        admin: username,
      };

      await axios.post("http://localhost:8000/api/v1/maps/create", {
        token,
        ...mapData
      });

      // Reset form and close modal
      setModalNo(0);
      setIsModalOpen(false);
      setMapName("");
      setMapType(0);
      setSpaceType("");
      
      // Optionally refresh the maps list
      // You might want to add a function to fetch and update the maps list
    } catch (error) {
      console.error("Error creating map:", error);
      // Add error handling as needed
    }
  };

  const renderModalNo = (modalNo: number) => {
    if (modalNo === 0) {
      setModalNo(0);
      setIsModalOpen(false);
    } else if (modalNo === 1) {
      return (
        <>
          <h2 className="text-2xl font-bold mb-4">Create a New Space</h2>
          <p className="text-gray-300 mb-6">
            Choose whether this space is public or private.
          </p>
          <div className="flex flex-col justify-between mb-6 gap-4">
            <button
              className={`px-4 py-2 rounded-lg ${
                spaceType === "public"
                  ? "bg-emerald-500 text-white"
                  : "bg-white/20 text-gray-300"
              } hover:bg-emerald-500 hover:text-white transition-colors`}
              onClick={() => setSpaceType("public")}
            >
              Public
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                spaceType === "private"
                  ? "bg-emerald-500 text-white"
                  : "bg-white/20 text-gray-300"
              } hover:bg-emerald-500 hover:text-white transition-colors`}
              onClick={() => setSpaceType("private")}
            >
              Private
            </button>
          </div>
        </>
      );
    } else if (modalNo === 2) {
      return (
        <>
          <h2 className="text-2xl font-bold mb-4">Create a New Space</h2>
          <p className="text-gray-300 mb-6">Choose map.</p>
          <div className="flex flex-col justify-between mb-6 gap-4">
            <button
              className={`px-4 py-2 rounded-lg ${
                mapType === 1
                  ? "bg-emerald-500 text-white"
                  : "bg-white/20 text-gray-300"
              } hover:bg-emerald-500 hover:text-white transition-colors`}
              onClick={() => setMapType(1)}
            >
              Map1
            </button>
          </div>
        </>
      );
    } else if (modalNo === 3) {
      return (
        <>
          <h2 className="text-2xl font-bold mb-4">Name Your Space</h2>
          <p className="text-gray-300 mb-6">Give your new space a name.</p>
          <div className="flex flex-col justify-between mb-6 gap-4">
            <input
              type="text"
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
              placeholder="Enter space name"
              className="px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </>
      );
    } else if (modalNo === 4) {
      handleCreateMap();
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-b from-[#1e293b] to-[#0f172a]">
      <FloatingPixels />
      <nav className="flex justify-between items-center mb-8 bg-[#171f2b] p-3 rounded-xl shadow-lg">
        <div className="flex items-center space-x-6">
          <Home className="w-8 h-8 text-white hover:text-emerald-400 cursor-pointer transition-colors" />
          <Calendar className="w-8 h-8 text-white hover:text-emerald-400 cursor-pointer transition-colors" />
          <MapIcon className="w-8 h-8 text-white hover:text-emerald-400 cursor-pointer transition-colors" />
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <motion.div
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-transform transform hover:scale-105"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              whileHover={{ scale: 1.05 }}
            >
              <span className="font-semibold">{username || "Loading..."}</span>
            </motion.div>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute mt-2 right-0 bg-[#1e293b] text-white rounded-lg shadow-lg w-48 p-3"
                >
                  <div
                    className="hover:bg-gray-700 px-4 py-2 rounded-lg cursor-pointer transition-colors"
                    onClick={() => alert("Viewing Profile")}
                  >
                    View Profile
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-5 py-2 rounded-lg flex items-center space-x-2 shadow-lg hover:shadow-xl transition-transform transform hover:scale-105"
            onClick={() => {
              setModalNo(1);
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-5 h-5" />
            <span>Create Space</span>
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          Explore Your Spaces
        </h1>

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
                <h3 className="text-2xl font-semibold text-white mb-2">
                  {map.title}
                </h3>
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

      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-gradient-to-r from-[#1f2937] to-[#334155] p-6 rounded-xl shadow-xl max-w-md w-full mx-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {renderModalNo(modalNo)}
            <div className="flex justify-between">
              <button
                className="px-4 py-2 rounded-lg bg-white/20 text-gray-300 hover:bg-white/30 transition-colors"
                onClick={() => {
                  setModalNo((modalNo) => modalNo - 1);
                }}
              >
                Back
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                onClick={() => {
                  setModalNo((modalNo) => modalNo + 1);
                }}
              >
                Next
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;