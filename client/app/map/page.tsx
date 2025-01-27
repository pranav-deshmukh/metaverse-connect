"use client";

import { useEffect, useRef, useState } from "react";
import mapImage from "@/public/map1.png";
import playerImage from "@/public/playerDown.png";
import { io, Socket } from "socket.io-client";

import { drawCharacter, drawMap } from "@/utils/draw";

let moving = false;

const Map = () => {
  let x = -1185,
    y = -1140;

  const [socketId, setSocketId] = useState<string | null>(null);
  const [roomData, setRoomData] = useState<Record<string, string[]>>({});
  const socketRef = useRef<Socket | null>(null);

  const [movement, setMovement] = useState([x, y]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  let backgroundImage: HTMLImageElement;
  let playerSprite: HTMLImageElement;

  // Handle Socket Connection
  useEffect(() => {
    const sc = io("http://localhost:8000");
    socketRef.current = sc;

    sc.on("connect", () => {
      setSocketId(sc.id);
      console.log("Connected with socket ID:", sc.id);
      sc.emit("join", 1234);

      sc.on("rooms", (data) => {
        console.log("Room data received directly:", data); // Log received data directly
        setRoomData((prevData) => ({ ...prevData, ...data }));
        // Update state with received data
      });
    });

    return () => {
      console.log("Removing socket:", sc.id);
      sc.emit("remove");
      sc.close();
    };
  }, []);

  // Log updated roomData whenever it changes
  useEffect(() => {
    console.log("Updated roomData:", roomData);
  }, [roomData]);

  // Handle Keyboard Input
  useEffect(() => {
    backgroundImage = new window.Image();
    playerSprite = new window.Image();

    backgroundImage.src = mapImage.src;
    playerSprite.src = playerImage.src;

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key as keyof typeof keys] &&
        (keys[e.key as keyof typeof keys].pressed = true);
      lastKey = e.key;
      moving = true;
      setMovement([x, y]);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key as keyof typeof keys] &&
        (keys[e.key as keyof typeof keys].pressed = false);
      moving = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Handle Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    function animate() {
      window.requestAnimationFrame(animate);

      let updated = false;

      if (keys.ArrowUp.pressed && lastKey === "ArrowUp") {
        y += speed;
        updated = true;
      } else if (keys.ArrowDown.pressed && lastKey === "ArrowDown") {
        y -= speed;
        updated = true;
      } else if (keys.ArrowLeft.pressed && lastKey === "ArrowLeft") {
        x += speed;
        updated = true;
      } else if (keys.ArrowRight.pressed && lastKey === "ArrowRight") {
        x -= speed;
        updated = true;
      }

      if (updated) {
        setMovement([x, y]);
        socketRef.current?.emit("movement", {
          x,
          y,
          socketId: socketRef.current?.id,
        });
      }

      animationCounter++;

      if (context && canvas) {
        context.clearRect(0, 0, canvas.width, canvas.height);

        if (backgroundImage.complete) {
          drawMap(context, backgroundImage, x, y);
        }

        if (playerSprite.complete) {
          drawCharacter(context, playerSprite, frame);
        }
      }

      if (!moving) return;
      if (animationCounter % 40 === 0) {
        frame = (frame + 1) % 4;
      }
    }

    animate();
  }, []);

  // Handle Movement Data from Server
  useEffect(() => {
    if (!socketRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    socketRef.current.on("movement data", (data) => {
      if (!context) return; // Safeguard against null or undefined context
      console.log("Current movement:", data);

      if (roomData[1234]) {
        for (let index = 0; index < roomData[1234].length; index++) {
          const user = data;
          // Assuming roomData contains objects with x and y properties
          if (user.x !== undefined && user.y !== undefined) {
            context.beginPath();
            context.arc(user.x, user.y, 10, 0, Math.PI * 2);
            context.fillStyle = "red";
            context.fill();
            context.closePath();
          }
        }
      }
    });

    return () => {
      socketRef.current?.off("movement data");
    };
  }, [roomData]);

  return (
    <div className="w-screen h-screen">
      <canvas ref={canvasRef} width={1024} height={576} className="border" />
      <div>Socket ID: {socketId || "Connecting..."}</div>
      <ul className="list-disc pl-5">
        {Object.entries(roomData).map(([roomName, users]) => (
          <li key={roomName} className="mb-2">
            <strong className="text-blue-500">{roomName}</strong>:{" "}
            {users.join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Map;
