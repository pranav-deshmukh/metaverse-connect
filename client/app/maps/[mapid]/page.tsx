"use client";
import React from "react";
import { useRef, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import mapImage from "@/public/map1.png";
import playerImage from "@/public/playerDown.png";
import { drawCharacter, drawMap } from "@/utils/draw";
import { backgroundImage, playerSprite } from "@/utils/draw";
import { useParams } from "next/navigation";
import { collisionsMap, boundries, testBoundry } from "@/utils/collisions";

let moving = false;

const MapsPage: React.FC = () => {
  const { mapid } = useParams<{ mapid: string }>();
  console.log(mapid);
  let x = 0,
    y = 0;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [roomData, setRoomData] = useState<{
    [roomId: string]: {
      [socketId: string]: { x: number; y: number };
    };
  }>({});
  const socketRef = useRef<Socket | null>(null);
  const positionRef = useRef({ x: 400, y: 400 });

  let keys = {
    ArrowUp: { pressed: false },
    ArrowDown: { pressed: false },
    ArrowLeft: { pressed: false },
    ArrowRight: { pressed: false },
  };

  let lastKey = "";
  const speed = 1;
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
      sc.emit("join", mapid);
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

  function rectangularCollision(xloc,yloc,rectangle2) {
    return (
      xloc + playerImage.width / 8 >= rectangle2.position.x &&
      xloc <= rectangle2.position.x + rectangle2.width &&
      yloc <= rectangle2.position.y + rectangle2.height &&
      yloc + playerImage.height / 2 >= rectangle2.position.y
    );
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
          if (rectangularCollision(positionRef.current.x, positionRef.current.y+1,boundry)) {
            console.log("Collided with boundary (ArrowUp)");
            collisionDetected = true;
          }
        });
        if (!collisionDetected) {
          positionRef.current.y += speed; // Move up
          updated = true;
        }
      }

      if (keys.ArrowDown.pressed && lastKey === "ArrowDown") {
        let collisionDetected = false;
        boundries.forEach((boundry) => {
          if (rectangularCollision(positionRef.current.x, positionRef.current.y-1,boundry)) {
            console.log("Collided with boundary (ArrowDown)");
            collisionDetected = true;
          }
        });
        if (!collisionDetected) {
          positionRef.current.y -= speed; // Move down
          updated = true;
        }
      }

      if (keys.ArrowLeft.pressed && lastKey === "ArrowLeft") {
        let collisionDetected = false;
        boundries.forEach((boundry) => {
          if (rectangularCollision(positionRef.current.x+1, positionRef.current.y,boundry)) {
            console.log("Collided with boundary (ArrowLeft)");
            collisionDetected = true;
          }
        });
        if (!collisionDetected) {
          positionRef.current.x += speed; // Move left
          updated = true;
        }
      }

      if (keys.ArrowRight.pressed && lastKey === "ArrowRight") {
        let collisionDetected = false;
        boundries.forEach((boundry) => {
          if (rectangularCollision(positionRef.current.x-1, positionRef.current.y,boundry)) {
            console.log("Collided with boundary (ArrowRight)");
            collisionDetected = true;
          }
        });
        if (!collisionDetected) {
          positionRef.current.x -= speed; // Move right
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
        drawMap(context, backgroundImage, x, y);
        boundries.forEach((boundry) => {
          // boundry.draw(context);
          // if (rectangularCollision(boundry)) {
          //   console.log("Collided");
          // }
        });
        // testBoundry.draw(context);
        // console.log(boundries);
      }
      if (playerSprite.complete) {
        drawCharacter(
          context,
          playerSprite,
          frame,
          positionRef.current.x,
          positionRef.current.y
        );
        context.font = "10px Arial";
        context.fillStyle = "purple";
        context.fillText(
          "Hello World",
          positionRef.current.x,
          positionRef.current.y
        );
      }

      // context.beginPath();
      // context.arc(canvas.width / 2, canvas.height / 2, 10, 0, Math.PI * 2);
      // context.fillStyle = "blue";
      // context.fill();

      if (roomData[mapid]) {
        Object.entries(roomData[mapid]).forEach(([id, player]) => {
          if (id === socketId) return;
          drawCharacter(context, playerSprite, frame, player.x, player.y);
          context.font = "10px Arial";
          context.fillStyle = "purple";
          context.fillText(id, player.x, player.y);

          // const relativeX =
          //   canvas.width / 2 + (player.x +505);
          // const relativeY =
          //   canvas.height / 2 + (player.y +310);

          // context.beginPath();
          // context.arc(relativeX, relativeY, 10, 0, Math.PI * 2);
          // context.fillStyle = "red";
          // context.fill();
        });
      }
      if (!moving) return;
      if (animationCounter % 40 === 0) {
        frame = (frame + 1) % 4;
      }

      // console.log("Room Data:", roomData);
    }
    console.log("Position:", positionRef.current.x);
    console.log("Test Boundry:", testBoundry.position.x);
    console.log("Player Width:", playerImage.width / 4);
    console.log("Boundry Width:", testBoundry.width);

    animate();
  }, [roomData, socketId]);
  // console.log(collisionsMap.length)
  // console.log(boundries)

  return (
    <div className="w-full h-screen">
      <canvas ref={canvasRef} width={1024} height={576} className="border" />
      {Object.entries(roomData[mapid] || {}).map(([id, player]) => (
        <div key={id} className="w-[80%]">
          <p>Socket ID: {id}</p>
          <p>X: {player.x}</p>
          <p>Y: {player.y}</p>
        </div>
      ))}
    </div>
  );
};

export default MapsPage;
