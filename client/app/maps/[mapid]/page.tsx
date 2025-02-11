"use client";
import React from "react";
import { useRef, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import mapImage from "@/public/map1.png";
import playerImage from "@/public/playerDown.png";
import { drawCharacter, drawMap } from "@/utils/draw";
import { SendHorizonal, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { backgroundImage, playerSprite } from "@/utils/draw";
import { useParams } from "next/navigation";
import {
  collisionsMap,
  boundries,
  Rooms,
  testRoom,
  testBoundry,
} from "@/utils/collisions";
import { Input } from "@/components/ui/input";
import { SendHorizonalIcon } from "lucide-react";
import test from "node:test";

let moving = false;

const MapsPage: React.FC = () => {
  const { mapid } = useParams<{ mapid: string }>();
  // console.log(mapid);
  let x = 0,
    y = 0;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState("");
  const [roomData, setRoomData] = useState<{
    [roomId: string]: {
      [socketId: string]: { x: number; y: number };
    };
  }>({});
  const [recvMsgs, setRecvMsgs] = useState([]);
  const socketRef = useRef<Socket | null>(null);
  const positionRef = useRef({ x: 400, y: 400 });

  let keys = {
    ArrowUp: { pressed: false },
    ArrowDown: { pressed: false },
    ArrowLeft: { pressed: false },
    ArrowRight: { pressed: false },
  };

  let lastKey = "";
  const speed = 3;
  let frame = 0;
  let animationCounter = 0;
  const offsetRef = useRef({ x: 0, y: 0 });
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [recvMsgs]);

  useEffect(() => {
    // Initialize the socket connection
    const sc = io("https://metaverse-connect-production-48d4.up.railway.app/");
    socketRef.current = sc;

    sc.on("connect", () => {
      if (sc.id) {
        setSocketId(sc.id);
      }
      // console.log("Connected with socket ID:", sc.id);

      // Join a room
      sc.emit("join", mapid);
    });

    // Handle room updates
    sc.on("rooms", (data) => {
      // console.log("Room data received directly:", data);

      interface SocketData {
        [socketId: string]: { x: number; y: number };
      }

      interface RoomData {
        [roomId: string]: SocketData;
      }

      const formattedData: RoomData = Object.keys(data).reduce(
        (acc, roomId) => {
          acc[roomId] = data[roomId].reduce(
            (socketsAcc: SocketData, socketId: string) => {
              socketsAcc[socketId] = { x: 0, y: 0 };
              return socketsAcc;
            },
            {} as SocketData
          );
          return acc;
        },
        {} as RoomData
      );

      setRoomData((prevData) => ({
        ...prevData,
        ...formattedData,
      }));
    });

    sc.on("movement data", (data) => {
      setRoomData((prevRoomData) => {
        const room = prevRoomData[mapid] || {};
        room[data.socketId] = { x: data.x, y: data.y };
        return {
          ...prevRoomData,
          mapid: room,
        };
      });
    });

    return () => {
      // sc.emit("remove");
      sc.close();
    };
  }, [mapid]);

  const sendMessage = () => {
    // console.log(message);
    const tosenddata = {
      roomId: mapid,
      privateRoomNo: 1,
      message: message,
    };
    socketRef.current?.emit("message", tosenddata);
    socketRef.current?.on("receiveMessage", (data) => {
      console.log("receivedmsg", data);
      setRecvMsgs(data.msg);
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (keys[e.key as keyof typeof keys]) {
        keys[e.key as keyof typeof keys].pressed = true;
        lastKey = e.key;
        moving = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (keys[e.key as keyof typeof keys]) {
        keys[e.key as keyof typeof keys].pressed = false;
        moving = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  function rectangularCollision(xloc: number, yloc: number, rectangle2: any) {
    return (
      xloc + playerImage.width / 8 >= rectangle2.position.x &&
      xloc <= rectangle2.position.x + rectangle2.width &&
      yloc <= rectangle2.position.y + rectangle2.height &&
      yloc + playerImage.height / 2 >= rectangle2.position.y
    );
  }

  function inChatRoom(xloc: number, yloc: number) {
    let isInRoom = false;
    let roomNumber = -1;
    let roomPosition = { x: 0, y: 0 };

    // Check each room in the Rooms array
    Rooms.forEach((room, index) => {
      if (
        rectangularCollision(xloc, yloc, {
          position: room.position,
          width: room.width,
          height: room.height,
        })
      ) {
        isInRoom = true;
        roomNumber = index + 1; // Making room numbers start from 1
        roomPosition = { x: room.position.x, y: room.position.y };
      }
    });

    if (isInRoom) {
      setShowChat(true);
      return {
        inRoom: true,
        roomNumber: roomNumber,
        roomX: roomPosition.x,
        roomY: roomPosition.y,
      };
    }

    setShowChat(false);
    return {
      inRoom: false,
      roomNumber: -1,
      roomX: null,
      roomY: null,
    };
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    function drawGrid(
      context: CanvasRenderingContext2D,
      offsetX: number,
      offsetY: number,
      gridSize: number
    ) {
      if (!context || !canvas) return;

      context.strokeStyle = "#000";
      context.lineWidth = 0.5;

      const startX = offsetX % gridSize;
      const startY = offsetY % gridSize;

      for (let i = startX; i <= canvas.width; i += gridSize) {
        context.beginPath();
        context.moveTo(i, 0);
        context.lineTo(i, canvas.height);
        context.stroke();
      }

      for (let i = startY; i <= canvas.height; i += gridSize) {
        context.beginPath();
        context.moveTo(0, i);
        context.lineTo(canvas.width, i);
        context.stroke();
      }
    }

    function animate() {
      if (!context || !canvas) return;
      window.requestAnimationFrame(animate);

      let updated = false;

      if (keys.ArrowUp.pressed && lastKey === "ArrowUp") {
        let collisionDetected = false;
        boundries.forEach((boundry) => {
          if (
            rectangularCollision(
              canvasRef.current!.width / 2,
              canvasRef.current!.height / 2 - 5,
              boundry
            )
          ) {
            // console.log("Collided with boundary (ArrowUp)");
            collisionDetected = true;
          }
        });

        if (!collisionDetected) {
          positionRef.current.y -= speed; // Move up
          offsetRef.current.y += speed;
          // testBoundry.position.y += speed;
          boundries.forEach((boundry) => {
            boundry.position.y += speed;
          });
          Rooms.forEach((room) => {
            room.position.y += speed;
          });
          updated = true;
        }
      }

      if (keys.ArrowDown.pressed && lastKey === "ArrowDown") {
        let collisionDetected = false;
        boundries.forEach((boundry) => {
          if (
            rectangularCollision(
              canvasRef.current!.width / 2,
              canvasRef.current!.height / 2 + 5,
              boundry
            )
          ) {
            // console.log("Collided with boundary (ArrowDown)");
            collisionDetected = true;
          }
        });
        if (!collisionDetected) {
          positionRef.current.y += speed; // Move down
          offsetRef.current.y -= speed;
          // testBoundry.position.y -= speed;
          boundries.forEach((boundry) => {
            boundry.position.y -= speed;
          });
          Rooms.forEach((room) => {
            room.position.y -= speed;
          });
          updated = true;
        }
      }

      if (keys.ArrowLeft.pressed && lastKey === "ArrowLeft") {
        let collisionDetected = false;
        // console.log(canvasRef.current.width/2 + 1)
        boundries.forEach((boundry) => {
          if (
            rectangularCollision(
              canvasRef.current!.width / 2 - 5,
              canvasRef.current!.height / 2,
              boundry
            )
          ) {
            // console.log("Collided with boundary (ArrowLeft)");
            collisionDetected = true;
          }
        });
        if (!collisionDetected) {
          positionRef.current.x -= speed; // Move left
          offsetRef.current.x += speed;
          // testBoundry.position.x += speed;
          boundries.forEach((boundry) => {
            boundry.position.x += speed;
          });
          Rooms.forEach((room) => {
            room.position.x += speed;
          });
          updated = true;
        }
      }

      if (keys.ArrowRight.pressed && lastKey === "ArrowRight") {
        let collisionDetected = false;
        boundries.forEach((boundry) => {
          if (
            rectangularCollision(
              canvasRef.current!.width / 2 + 5,
              canvasRef.current!.height / 2,
              boundry
            )
          ) {
            // console.log("Collided with boundary (ArrowRight)");
            collisionDetected = true;
          }
        });
        if (!collisionDetected) {
          positionRef.current.x += speed; // Move right
          offsetRef.current.x -= speed;
          // testBoundry.position.x -= speed;
          boundries.forEach((boundry) => {
            boundry.position.x -= speed;
          });
          Rooms.forEach((room) => {
            room.position.x -= speed;
          });
          updated = true;
        }
      }

      if (updated) {
        socketRef.current?.emit("movement", {
          x: positionRef.current.x,
          y: positionRef.current.y,
          socketId: socketRef.current?.id,
        });
      }

      animationCounter++;
      context.clearRect(0, 0, canvas.width, canvas.height);

      drawGrid(context, positionRef.current.x, positionRef.current.y, 50);
      if (backgroundImage.complete) {
        drawMap(
          context,
          backgroundImage,
          offsetRef.current.x,
          offsetRef.current.y
        );
        // Rooms.forEach((room) => {
        //   room.draw(context);
        // });
        // boundries.forEach((boundry) => {
        //   boundry.draw(context);
        // });
        // testBoundry.draw(context);

        if (inChatRoom(positionRef.current.x, positionRef.current.y)) {
          // Add additional logic for what happens when the player enters the room
        }

        // console.log(boundries);
      }
      if (playerSprite.complete) {
        if (!canvasRef.current) return;

        drawCharacter(
          context,
          playerSprite,
          frame,
          canvasRef.current.width / 2,
          canvasRef.current.height / 2
        );
        // console.log(canvasRef.current.width / 2, canvasRef.current.height / 2);
        context.font = "10px Arial";
        context.fillStyle = "purple";
        context.fillText(
          "Hello World",
          canvasRef.current.width / 2,
          canvasRef.current.height / 2
        );
      }

      // context.beginPath();
      // context.arc(canvas.width / 2, canvas.height / 2, 10, 0, Math.PI * 2);
      // context.fillStyle = "blue";
      // context.fill();
      const roomStatus = inChatRoom(
        canvasRef.current.width / 2,
        canvasRef.current.height / 2
      );
      if (roomStatus.inRoom) {
        // console.log("Player is in room:", roomStatus.roomX, roomStatus.roomY);
      }
      // console.log(roomStatus);

      if (roomData[mapid]) {
        Object.entries(roomData[mapid]).forEach(([id, player]) => {
          if (id === socketId) return;

          // Calculate relative position based on map offset
          const relativeX = player.x - positionRef.current.x + canvas.width / 2;
          const relativeY =
            player.y - positionRef.current.y + canvas.height / 2;

          drawCharacter(context, playerSprite, frame, relativeX, relativeY);
          context.font = "10px Arial";
          context.fillStyle = "purple";
          context.fillText(id, relativeX, relativeY - 20); // Offset the text above player
        });
      }
      if (!moving) return;
      if (animationCounter % 4 === 0) {
        frame = (frame + 1) % 4;
      }

      // console.log("Room Data:", roomData);
      // console.log("Position:", positionRef.current, "testBoundry:", testBoundry.position);
      // if(canvasRef.current.width / 2>testBoundry.position.x){
      //   console.log('collided')
      // }
    }
    // console.log("Player Width:", playerImage.width / 4);

    animate();
  }, [roomData, socketId]);
  // console.log(collisionsMap.length)
  // console.log(boundries)
  // console.log(Rooms);
  type Message = {
    socketId: string;
    msg: string;
  };
  return (
    <div className="w-full h-screen bg-[#080A0F] text-white flex items-center justify-center p-10 relative overflow-hidden">
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 bg-grid-small opacity-20"></div>

      {/* Game Layout */}
      <div className="relative flex w-full max-w-7xl justify-between items-start gap-6">
        {/* Game Canvas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="border-[3px] border-cyan-500 shadow-[0_0_30px_rgba(0,255,255,0.3)] rounded-lg overflow-hidden"
        >
          <canvas ref={canvasRef} width={1024} height={576} className="" />
        </motion.div>

        {/* Side Panel */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="border-[1px] border-gray-600 bg-[#14142a] shadow-lg rounded-lg w-[450px] p-4"
        >
          <div className="w-full h-[60px] text-center flex items-center justify-center text-2xl font-bold text-cyan-400">
            🔥 Waiting Room 1
          </div>
          <div className="w-full h-[30px] text-center flex items-center justify-center bg-[#373B53] text-sm text-gray-300">
            No one in the room
          </div>

          {showChat && (
            <div className="w-full bg-[#0c0c1d] border border-[#2a2a4e] shadow-xl rounded-lg p-4 relative mt-4">
              {/* Chat Header */}
              <div className="flex items-center justify-between px-3 py-2 bg-[#14142a] rounded-t-lg border-b border-cyan-400">
                <h3 className="text-lg font-semibold text-white">Game Chat</h3>
                <MessageCircle className="text-green-400 animate-pulse" />
              </div>

              {/* Chat Messages */}
              <div className="w-full h-[280px] overflow-y-auto p-2 bg-[#1a1a2e] rounded-lg custom-scrollbar">
                {recvMsgs.map((message: Message, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="mb-2 flex flex-col bg-[#202040] text-white p-3 rounded-lg shadow-lg border-l-4 border-cyan-500"
                  >
                    <p className="text-xs text-gray-400">
                      ID: {message.socketId}
                    </p>
                    <p className="text-base font-semibold text-green-300">
                      {message.msg}
                    </p>
                  </motion.div>
                ))}
                <div ref={chatEndRef}></div>
              </div>

              {/* Chat Input */}
              <div className="w-full flex items-center bg-[#14142a] rounded-b-lg p-3 border-t border-cyan-400">
                <input
                  className="w-[85%] bg-[#252542] text-white border-none focus:ring-0 rounded-md text-sm p-2"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={sendMessage}
                  className="p-2 ml-2 bg-cyan-500 text-white rounded-full hover:bg-cyan-600 transition"
                >
                  <SendHorizonal className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MapsPage;
