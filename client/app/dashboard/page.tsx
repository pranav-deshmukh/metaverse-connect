"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapIcon, Users, Plus, Home, Calendar } from "lucide-react";
import FloatingPixels from "@/components/FloatingPixels";
import MapTry from "@/public/MapTry.png";
import Image from "next/image";
import axios from "axios";
import { set } from "zod";

const Dashboard = () => {
  const [selectedMap, setSelectedMap] = useState(null);
  const [username, setUsername] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [spaceType, setSpaceType] = useState("");
  const [modalNo, setModalNo] = useState(0);
  const [mapName, setMapName] = useState("");
  const [mapType, setMapType] = useState(0);
  const [userId, setUserId] = useState("");
  const [fetchedMaps, setFetchedMaps] = useState([]);
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

  const createMapReq = async () => {
    try {
      const players = new Map([[userId, { userId, role: "player" }]]);
      const admin = new Map([[userId, { userId, role: "admin" }]]);
      console.log("players", userId);
      const response = await axios.post(
        "http://localhost:8000/api/v1/maps/create",
        {
          mapName,
          mapType,
          spaceType,
          players: Object.fromEntries(players),
          admin: Object.fromEntries(admin),
        }
      );
      console.log(response);

      if (response.status === 201) {
        console.log("Map created successfully:", response.data);
        setModalNo(0);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error creating map:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("jwt");
        const response = await axios.post(
          "http://localhost:8000/api/v1/users/getUser",
          { token }
        );
        console.log(response.data.userId);
        setUsername(response.data.name);
        setUserId(response.data.userId);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);
  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const maps = await axios.post(
          "http://localhost:8000/api/v1/maps/getmaps"
        );
        console.log(maps.data.data.maps);
        console.log(maps.data.message);
        setFetchedMaps(maps.data.data.maps);
      } catch (error) {
        console.log(error);
      }
    };
    fetchMaps();
  }, []);

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
                spaceType === "public"
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
          <h2 className="text-2xl font-bold mb-4">Create a New Space</h2>
          <p className="text-gray-300 mb-6">Enter map name.</p>
          <input
            type="text"
            placeholder="Map Name"
            className="px-4 py-2 rounded-lg bg-white/20 text-white w-full mb-2"
            onChange={(e) => setMapName(e.target.value)}
          />
        </>
      );
    } else if (modalNo === 4) {
      return (
        <>
          <h2 className="text-2xl font-bold mb-4">Create a New Space</h2>
          <p className="text-gray-300 mb-6">Confirm your map details:</p>
          <div className="space-y-2 mb-4">
            <p>Map Name: {mapName}</p>
            <p>Space Type: {spaceType}</p>
            <p>Map Type: {mapType}</p>
          </div>
        </>
      );
    } else if (modalNo === 5) {
      setModalNo(0);
      setIsModalOpen(false);
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
              setModalNo((prev) => prev + 1);
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
          {fetchedMaps.map((map) => (
            <motion.div
              key={map.mapID}
              className="bg-white/10 shadow-lg rounded-xl overflow-hidden backdrop-blur-md hover:bg-white/20 cursor-pointer transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedMap(map.mapID)}
            >
              <Image
                src={MapTry}
                alt="Map"
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-2xl font-semibold text-white mb-2">
                  {map.mapName}
                </h3>
                <p className="text-gray-300 mb-4">{map.spaceType}</p>
                <div className="flex items-center text-gray-400">
                  <Users className="w-5 h-5 mr-2" />
                  {/* <span>{map.visitors} visitors</span> */}
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
          // onClick={() => setIsModalOpen(false)}
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
              {modalNo === 4 ? (
                <button
                  className="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                  onClick={createMapReq}
                >
                  Create Map
                </button>
              ) : (
                <button
                  className={`px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors ${
                    modalNo === 4
                      ? "disabled:opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={modalNo === 4}
                  onClick={() => {
                    setModalNo((modalNo) => modalNo + 1);
                  }}
                >
                  Next
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
