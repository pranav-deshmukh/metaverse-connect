"use client";
import { useEffect, useRef, useState } from "react";
import mapImage from "@/public/map1.png";
import playerImage from "@/public/playerDown.png";
import io from "socket.io-client";

import { drawCharacter, drawMap } from "@/utils/draw";
import { Socket } from "dgram";

let moving = false;


const Map = () => {
  const [socket, setSocket] = useState(null)
  const [rooms,setRooms] = useState([])
  let x = -1185, y = -1140;
  const [movement, setMovement] = useState([x,y])
  useEffect(()=>{
    const socketInstance = io("http://localhost:8000");
    setSocket(socketInstance)
    socketInstance.on('rooms',(updatedRooms)=>{
      setRooms(updatedRooms)
    })
    socketInstance.emit('movement',x)
    return ()=>socketInstance.close();
  },[x,y])
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
      console.log(movement)
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

  const joinRoom=(roomId)=>{
    if(socket){
      socket.emit('join',(roomId));
      setRooms(roomId)
    }
  }

  return (
    <div className="w-screen h-screen">
      <canvas ref={canvasRef} width={1024} height={576} className="border" />
    </div>
  );
};

export default Map;
