"use client";
import React from "react";
import { useRef, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

let moving = false;

const MapsPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [roomData, setRoomData] = useState<{
    [roomId: string]: {
      [socketId: string]: { x: number; y: number };
    };
  }>({});
  const socketRef = useRef<Socket | null>(null);
  const [otherPlayers, setOtherPlayers] = useState<{
    [key: string]: { x: number; y: number };
  }>({});

  const positionRef = useRef({ x: -1185, y: -1140 });

  let keys = {
    ArrowUp: { pressed: false },
    ArrowDown: { pressed: false },
    ArrowLeft: { pressed: false },
    ArrowRight: { pressed: false },
  };

  let lastKey = "";
  const speed = 3;

  useEffect(() => {
    const sc = io("http://localhost:8000");
    socketRef.current = sc;

    sc.on("connect", () => {
      setSocketId(sc.id);
      console.log("Connected with socket ID:", sc.id);
      sc.emit("join", 1234);
    });

    sc.on("rooms", (data) => {
      console.log("Room data received directly:", data);

      const formattedData = Object.keys(data).reduce((acc, roomId) => {
        acc[roomId] = data[roomId].reduce(
          (socketsAcc: any, socketId: string) => {
            socketsAcc[socketId] = { x: 0, y: 0 }; // Default values for x and y
            return socketsAcc;
          },
          {}
        );
        return acc;
      }, {});

      console.log("Formatted room data:", formattedData);

      setRoomData((prevData) => ({
        ...prevData,
        ...formattedData,
      }));
    });

    sc.on("movement data", (data) => {
      // console.log("Received movement data:", data);
      if (data.socketId !== sc.id) {
        // console.log("Received movement data:", data);
        // console.log("roomData", roomData);
        setOtherPlayers((prev) => ({
          ...prev,
          [data.socketId]: { x: data.x, y: data.y },
        }));
      }
      // console.log('other',otherPlayers);
    });

    return () => {
      console.log("Removing socket:", sc.id);
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

      // Calculate grid lines based on offset
      const startX = offsetX % gridSize;
      const startY = offsetY % gridSize;

      // Draw vertical lines
      for (let i = startX; i <= canvas.width; i += gridSize) {
        context.beginPath();
        context.moveTo(i, 0);
        context.lineTo(i, canvas.height);
        context.stroke();
      }

      // Draw horizontal lines
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
      const { x, y } = positionRef.current;

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

      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw grid with current offset
      drawGrid(context, positionRef.current.x, positionRef.current.y, 50);

      // Draw current player (blue) in center
      context.beginPath();
      context.arc(canvas.width / 2, canvas.height / 2, 10, 0, Math.PI * 2);
      context.fillStyle = "blue";
      context.fill();

      Object.values(otherPlayers).forEach((player) => {
        if (roomData[1234] && roomData[1234][socketId]) {
          roomData[1234][socketId].x = player.x;
          roomData[1234][socketId].y = player.y;
        }
        console.log("player", roomData);
        // const relativeX = canvas.width / 2 + (player.x - positionRef.current.x);
        // const relativeY =
        //   canvas.height / 2 + (player.y - positionRef.current.y);

        // context.beginPath();
        // context.arc(relativeX, relativeY, 10, 0, Math.PI * 2);
        // context.fillStyle = "red";
        // context.fill();
      });
      if(roomData[1234] && roomData[1234][socketId]){
      Object.values(roomData[1234]).forEach((player) => {
        const relativeX = canvas.width / 2 + (player.x - positionRef.current.x);
        const relativeY =
          canvas.height / 2 + (player.y - positionRef.current.y);

        context.beginPath();
        context.arc(relativeX, relativeY, 10, 0, Math.PI * 2);
        context.fillStyle = "green";
        context.fill();
      });
    }
  }

    animate();
  }, [otherPlayers, roomData]);

  useEffect(() => {}, [otherPlayers]);

  return (
    <div className="w-screen h-screen">
      <canvas ref={canvasRef} width={1024} height={576} className="border" />
    </div>
  );
};

export default MapsPage;