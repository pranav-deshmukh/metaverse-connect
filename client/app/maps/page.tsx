"use client";
import React from "react";
import { useRef, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import mapImage from "@/public/map1.png";
import playerImage from "@/public/playerDown.png";
import { drawCharacter, drawMap } from "@/utils/draw";
import {backgroundImage, playerSprite} from "@/utils/draw";

let moving = false;

const MapsPage: React.FC = () => {
  let x = -1185,
    y = -1140;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [roomData, setRoomData] = useState<{
    [roomId: string]: {
      [socketId: string]: { x: number; y: number };
    };
  }>({});
  const socketRef = useRef<Socket | null>(null);
  const positionRef = useRef({ x: -1185, y: -1140 });

  let keys = {
    ArrowUp: { pressed: false },
    ArrowDown: { pressed: false },
    ArrowLeft: { pressed: false },
    ArrowRight: { pressed: false },
  };

  let lastKey = "";
  const speed = 0.5;
  let frame = 0;
  let animationCounter = 0;

  

  useEffect(() => {
    // Initialize the socket connection
    const sc = io("http://localhost:8000");
    socketRef.current = sc;

    sc.on("connect", () => {
      setSocketId(sc.id);
      console.log("Connected with socket ID:", sc.id);

      // Join a room
      sc.emit("join", 1234);
    });

    // Handle room updates
    sc.on("rooms", (data) => {
      console.log("Room data received directly:", data);

      const formattedData = Object.keys(data).reduce((acc, roomId) => {
        acc[roomId] = data[roomId].reduce(
          (socketsAcc: any, socketId: string) => {
            socketsAcc[socketId] = { x: 0, y: 0 };
            return socketsAcc;
          },
          {}
        );
        return acc;
      }, {});

      setRoomData((prevData) => ({
        ...prevData,
        ...formattedData,
      }));
    });

    sc.on("movement data", (data) => {
      setRoomData((prevRoomData) => {
        const room = prevRoomData[1234] || {};
        room[data.socketId] = { x: data.x, y: data.y };
        return {
          ...prevRoomData,
          1234: room,
        };
      });
    });

    sc.on("playerDisconnected", (disconnectedSocketId) => {
      console.log("Player disconnected:", disconnectedSocketId);
      setRoomData((prevRoomData) => {
        const updatedRoomData = { ...prevRoomData };
        if (updatedRoomData[1234]) {
          delete updatedRoomData[1234][disconnectedSocketId];
        }
        return updatedRoomData;
      });
    });

    return () => {
      sc.emit("remove");
      sc.close();
    };
  }, []);

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
        positionRef.current.y += speed;
        updated = true;
      }
      if (keys.ArrowDown.pressed && lastKey === "ArrowDown") {
        positionRef.current.y -= speed;
        updated = true;
      }
      if (keys.ArrowLeft.pressed && lastKey === "ArrowLeft") {
        positionRef.current.x += speed;
        updated = true;
      }
      if (keys.ArrowRight.pressed && lastKey === "ArrowRight") {
        positionRef.current.x -= speed;
        updated = true;
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
        drawMap(context, backgroundImage, positionRef.current.x, positionRef.current.y);
      }
      if (playerSprite.complete) {
          drawCharacter(context, playerSprite, frame);
        }

      context.beginPath();
      context.arc(canvas.width / 2, canvas.height / 2, 10, 0, Math.PI * 2);
      context.fillStyle = "blue";
      context.fill();

      if (roomData[1234]) {
        Object.entries(roomData[1234]).forEach(([id, player]) => {
          if (id === socketId) return;

          const relativeX =
            canvas.width / 2 + (player.x - positionRef.current.x);
          const relativeY =
            canvas.height / 2 + (player.y - positionRef.current.y);

          context.beginPath();
          context.arc(relativeX, relativeY, 10, 0, Math.PI * 2);
          context.fillStyle = "red";
          context.fill();
        });
      }
      if (!moving) return;
      if (animationCounter % 40 === 0) {
        frame = (frame + 1) % 4;
      }

      console.log("Room Data:", roomData);
    }

    animate();
  }, [roomData, socketId]);

  return (
    <div className="w-screen h-screen">
      <canvas ref={canvasRef} width={1024} height={576} className="border" />
      {Object.entries(roomData[1234] || {}).map(([id, player]) => (
        <div key={id}>
          <p>Socket ID: {id}</p>
          <p>X: {player.x}</p>
          <p>Y: {player.y}</p>
        </div>
      ))}
    </div>
  );
};

export default MapsPage;
