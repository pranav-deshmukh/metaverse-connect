"use client";
import { useEffect, useRef, useState } from "react";
import mapImage from "@/public/map1.png";
import playerImage from "@/public/playerDown.png";
import {io, Socket} from 'socket.io-client'

import { drawCharacter, drawMap } from "@/utils/draw";

let moving = false;


const Map = () => {
  let x = -1185, y = -1140;
  const [socket, setSocket] = useState<Socket>()
  useEffect(()=>{
    const sc = io('http://localhost:8000');
    setSocket(sc);
    // sc.on('connection')
    return ()=>sc.close();
  },[])
  const [movement, setMovement] = useState([x,y])

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

  let backgroundImage:HTMLImageElement;
  let playerSprite:HTMLImageElement;
  
  useEffect(() => {
    backgroundImage = new window.Image();
    playerSprite = new window.Image();
  
    backgroundImage.src = mapImage.src;
    playerSprite.src = playerImage.src;
    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key as keyof typeof keys] && (keys[e.key as keyof typeof keys].pressed = true);
      lastKey = e.key;
      moving=true
      setMovement([x,y])
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key as keyof typeof keys] && (keys[e.key as keyof typeof keys].pressed = false);
      moving=false
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

      if (keys.ArrowUp.pressed && lastKey === "ArrowUp") {
        y += speed;
        
      } else if (keys.ArrowDown.pressed && lastKey === "ArrowDown") {
        y -= speed;
        moving=true
      } else if (keys.ArrowLeft.pressed && lastKey === "ArrowLeft") {
        x += speed;
      } else if (keys.ArrowRight.pressed && lastKey === "ArrowRight") {
        x -= speed;
      }

      animationCounter++;
      
      if (context) {
        drawMap(context,backgroundImage,x,y);
        drawCharacter(context, playerSprite, frame)
      }
      if(!moving)return;
      if (animationCounter % 40 === 0) {
        frame = (frame + 1) % 4; 
      }
    }

    animate();
  }, []);


  return (
    <div className="w-screen h-screen">
      <canvas ref={canvasRef} width={1024} height={576} className="border" />
    </div>
  );
};

export default Map;
