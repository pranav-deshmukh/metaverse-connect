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

  const socketRef = useRef<Socket | null>(null); // Use a ref for socket

  useEffect(() => {
    const sc = io("http://localhost:8000");
    socketRef.current = sc; // Assign the socket to the ref
    return () => sc.close();
  }, []);

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

    // Update state and emit movement when there's a change
    if (updated) {
      setMovement([x, y]); // Update state to trigger reactivity
      socketRef.current?.emit("movement", { x, y }); // Emit new coordinates
    }

    animationCounter++;

    if (context) {
      drawMap(context, backgroundImage, x, y);
      drawCharacter(context, playerSprite, frame);
    }
    if (!moving) return;
    if (animationCounter % 40 === 0) {
      frame = (frame + 1) % 4;
    }
  }

  animate();
}, []); // Dependencies are empty since `x, y` are globals



  return (
    <div className="w-screen h-screen">
      <canvas ref={canvasRef} width={1024} height={576} className="border" />
    </div>
  );
};

export default Map;
