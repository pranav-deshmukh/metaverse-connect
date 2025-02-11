"use client";
import React from "react";
import { useRef, useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { drawCharacter, drawMap } from "@/utils/draw";
import { SendHorizonal, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { backgroundImage, playerSprite } from "@/utils/draw";
import { useParams } from "next/navigation";
import { boundries, Rooms } from "@/utils/collisions";

// Constants
const FRAME_RATE = 60;
const MOVEMENT_SPEED = 3;
const ANIMATION_FRAME_RATE = 4;
const INITIAL_POSITION = { x: 400, y: 400 };

// Types
interface Message {
  socketId: string;
  msg: string;
}

interface RoomData {
  [roomId: string]: {
    [socketId: string]: { x: number; y: number };
  };
}

const MapsPage: React.FC = () => {
  const { mapid } = useParams<{ mapid: string }>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState("");
  const [roomData, setRoomData] = useState<RoomData>({});
  const [recvMsgs, setRecvMsgs] = useState<Message[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const positionRef = useRef(INITIAL_POSITION);
  const lastUpdateRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();
  const isMovingRef = useRef(false);
  const keysRef = useRef({
    ArrowUp: { pressed: false },
    ArrowDown: { pressed: false },
    ArrowLeft: { pressed: false },
    ArrowRight: { pressed: false },
  });
  const lastKeyRef = useRef("");
  const frameRef = useRef(0);
  const animationCounterRef = useRef(0);
  const offsetRef = useRef({ x: 0, y: 0 });

  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [recvMsgs]);

  // Socket connection setup
  useEffect(() => {
    const sc = io("https://metaverse-connect-production-48d4.up.railway.app/");
    socketRef.current = sc;

    sc.on("connect", () => {
      if (sc.id) {
        setSocketId(sc.id);
      }
      sc.emit("join", mapid);
    });

    sc.on("rooms", (data) => {
      const formattedData: RoomData = Object.keys(data).reduce((acc, roomId) => {
        acc[roomId] = data[roomId].reduce((socketsAcc: any, socketId: string) => {
          socketsAcc[socketId] = { x: 0, y: 0 };
          return socketsAcc;
        }, {});
        return acc;
      }, {} as RoomData);

      setRoomData(prevData => ({
        ...prevData,
        ...formattedData,
      }));
    });

    sc.on("movement data", (data) => {
      setRoomData(prevRoomData => ({
        ...prevRoomData,
        [mapid]: {
          ...prevRoomData[mapid],
          [data.socketId]: { x: data.x, y: data.y }
        }
      }));
    });

    return () => {
      sc.close();
    };
  }, [mapid]);

  // Chat functionality
  const sendMessage = useCallback(() => {
    if (!message.trim()) return;
    
    const messageData = {
      roomId: mapid,
      privateRoomNo: 1,
      message: message,
    };
    
    socketRef.current?.emit("message", messageData);
    setMessage("");
  }, [message, mapid]);

  useEffect(() => {
    socketRef.current?.on("receiveMessage", (data) => {
      setRecvMsgs(data.msg);
    });
  }, []);

  // Collision detection
  const rectangularCollision = useCallback((xloc: number, yloc: number, rectangle2: any) => {
    return (
      xloc + playerSprite.width / 8 >= rectangle2.position.x &&
      xloc <= rectangle2.position.x + rectangle2.width &&
      yloc <= rectangle2.position.y + rectangle2.height &&
      yloc + playerSprite.height / 2 >= rectangle2.position.y
    );
  }, []);

  // Chat room detection
  const inChatRoom = useCallback((xloc: number, yloc: number) => {
    let isInRoom = false;
    let roomNumber = -1;
    let roomPosition = { x: 0, y: 0 };

    Rooms.forEach((room, index) => {
      if (rectangularCollision(xloc, yloc, {
        position: room.position,
        width: room.width,
        height: room.height,
      })) {
        isInRoom = true;
        roomNumber = index + 1;
        roomPosition = { x: room.position.x, y: room.position.y };
      }
    });

    setShowChat(isInRoom);
    return {
      inRoom: isInRoom,
      roomNumber,
      roomX: roomPosition.x,
      roomY: roomPosition.y,
    };
  }, [rectangularCollision]);

  // Grid drawing
  const drawGrid = useCallback((
    context: CanvasRenderingContext2D,
    offsetX: number,
    offsetY: number,
    gridSize: number
  ) => {
    const canvas = canvasRef.current;
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
  }, []);

  // Position update throttling
  const updatePosition = useCallback(() => {
    const now = Date.now();
    if (now - lastUpdateRef.current >= 1000 / FRAME_RATE) {
      socketRef.current?.emit("movement", {
        x: positionRef.current.x,
        y: positionRef.current.y,
        socketId: socketRef.current?.id,
      });
      lastUpdateRef.current = now;
    }
  }, []);

  // Main game loop
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!context || !canvas) return;

    let updated = false;
    const keys = keysRef.current;
    const lastKey = lastKeyRef.current;

    isMovingRef.current = false;

    // Movement handling
    if (keys.ArrowUp.pressed && lastKey === "ArrowUp") {
      if (!boundries.some(boundry => rectangularCollision(
        canvas.width / 2,
        canvas.height / 2 - MOVEMENT_SPEED,
        boundry
      ))) {
        positionRef.current.y -= MOVEMENT_SPEED;
        offsetRef.current.y += MOVEMENT_SPEED;
        boundries.forEach(b => b.position.y += MOVEMENT_SPEED);
        Rooms.forEach(r => r.position.y += MOVEMENT_SPEED);
        updated = true;
        isMovingRef.current = true;
      }
    }

    if (keys.ArrowDown.pressed && lastKey === "ArrowDown") {
      if (!boundries.some(boundry => rectangularCollision(
        canvas.width / 2,
        canvas.height / 2 + MOVEMENT_SPEED,
        boundry
      ))) {
        positionRef.current.y += MOVEMENT_SPEED;
        offsetRef.current.y -= MOVEMENT_SPEED;
        boundries.forEach(b => b.position.y -= MOVEMENT_SPEED);
        Rooms.forEach(r => r.position.y -= MOVEMENT_SPEED);
        updated = true;
        isMovingRef.current = true;
      }
    }

    if (keys.ArrowLeft.pressed && lastKey === "ArrowLeft") {
      if (!boundries.some(boundry => rectangularCollision(
        canvas.width / 2 - MOVEMENT_SPEED,
        canvas.height / 2,
        boundry
      ))) {
        positionRef.current.x -= MOVEMENT_SPEED;
        offsetRef.current.x += MOVEMENT_SPEED;
        boundries.forEach(b => b.position.x += MOVEMENT_SPEED);
        Rooms.forEach(r => r.position.x += MOVEMENT_SPEED);
        updated = true;
        isMovingRef.current = true;
      }
    }

    if (keys.ArrowRight.pressed && lastKey === "ArrowRight") {
      if (!boundries.some(boundry => rectangularCollision(
        canvas.width / 2 + MOVEMENT_SPEED,
        canvas.height / 2,
        boundry
      ))) {
        positionRef.current.x += MOVEMENT_SPEED;
        offsetRef.current.x -= MOVEMENT_SPEED;
        boundries.forEach(b => b.position.x -= MOVEMENT_SPEED);
        Rooms.forEach(r => r.position.x -= MOVEMENT_SPEED);
        updated = true;
        isMovingRef.current = true;
      }
    }

    if (updated) {
      updatePosition();
    }

    // Clear and redraw
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(context, positionRef.current.x, positionRef.current.y, 50);

    if (backgroundImage.complete) {
      drawMap(context, backgroundImage, offsetRef.current.x, offsetRef.current.y);
    }

    animationCounterRef.current++;
    if (isMovingRef.current && animationCounterRef.current % ANIMATION_FRAME_RATE === 0) {
      frameRef.current = (frameRef.current + 1) % 4;
    } else if (!isMovingRef.current) {
      frameRef.current = 0;  // Reset to standing frame when not moving
    }

    // Draw players
    if (playerSprite.complete) {
      drawCharacter(
        context,
        playerSprite,
        frameRef.current,
        canvas.width / 2,
        canvas.height / 2
      );

      // Player name
      context.font = "10px Arial";
      context.fillStyle = "purple";
      context.fillText("You", canvas.width / 2, canvas.height / 2 - 20);

      // Draw other players
      if (roomData[mapid]) {
        Object.entries(roomData[mapid]).forEach(([id, player]) => {
          if (id === socketId) return;
          const relativeX = player.x - positionRef.current.x + canvas.width / 2;
          const relativeY = player.y - positionRef.current.y + canvas.height / 2;
          drawCharacter(context, playerSprite, frameRef.current, relativeX, relativeY);
          context.fillText(id, relativeX, relativeY - 20);
        });
      }
    }

    // Update animation frame
    // animationCounterRef.current++;
    // if (animationCounterRef.current % ANIMATION_FRAME_RATE === 0) {
    //   frameRef.current = (frameRef.current + 1) % 4;
    // }

    inChatRoom(canvas.width / 2, canvas.height / 2);
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [drawGrid, inChatRoom, mapid, rectangularCollision, roomData, socketId, updatePosition]);

  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (keysRef.current[e.key as keyof typeof keysRef.current]) {
        keysRef.current[e.key as keyof typeof keysRef.current].pressed = true;
        lastKeyRef.current = e.key;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (keysRef.current[e.key as keyof typeof keysRef.current]) {
        keysRef.current[e.key as keyof typeof keysRef.current].pressed = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Start game loop
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameLoop]);

  return (
    <div className="w-full h-screen bg-[#080A0F] text-white flex items-center justify-center p-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-small opacity-20"></div>

      <div className="relative flex w-full max-w-7xl justify-between items-start gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="border-[3px] border-cyan-500 shadow-[0_0_30px_rgba(0,255,255,0.3)] rounded-lg overflow-hidden"
        >
          <canvas ref={canvasRef} width={1024} height={576} />
        </motion.div>

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
            {Object.keys(roomData[mapid] || {}).length > 1 
              ? `${Object.keys(roomData[mapid] || {}).length} players in room`
              : "No one in the room"}
          </div>

          {showChat && (
            <div className="w-full bg-[#0c0c1d] border border-[#2a2a4e] shadow-xl rounded-lg p-4 relative mt-4">
              <div className="flex items-center justify-between px-3 py-2 bg-[#14142a] rounded-t-lg border-b border-cyan-400">
                <h3 className="text-lg font-semibold text-white">Game Chat</h3>
                <MessageCircle className="text-green-400 animate-pulse" />
              </div>

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

              <div className="w-full flex items-center bg-[#14142a] rounded-b-lg p-3 border-t border-cyan-400">
                <input
                  className="w-[85%] bg-[#252542] text-white border-none focus:ring-0 rounded-md text-sm p-2"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      sendMessage();
                    }
                  }}
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