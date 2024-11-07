"use client";
import { useEffect, useRef, useState } from "react";
import mapImage from "@/public/map1.png";
import playerImage from "@/public/playerDown.png";
import { collisions } from "@/data/Collisions";

const collisionsMap=[];


for (let i = 0; i < collisions.length; i+=70) {
  collisionsMap.push(collisions.slice(i, i+70));
  
}
console.log(collisionsMap)

const Map = () => {
  let x = -1185,
    y = -1140;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  let keys = {
    ArrowUp: {
      pressed: false,
    },
    ArrowDown: {
      pressed: false,
    },
    ArrowLeft: {
      pressed: false,
    },
    ArrowRight: {
      pressed: false,
    },
  };

  let lastKey = "";

  const speed = 1.5;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key as keyof typeof keys] && (keys[e.key as keyof typeof keys].pressed = true);
      lastKey = e.key;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key as keyof typeof keys] && (keys[e.key as keyof typeof keys].pressed = false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // console.log(collisions)
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const draw = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const img = new window.Image();
    const playerImg = new window.Image();

    img.src = mapImage.src;
    playerImg.src = playerImage.src;

    img.onload = () => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(img, x, y, 3500, 2500);
      ctx.drawImage(
        playerImg,
        0,
        0,
        playerImage.width / 4,
        playerImage.height,
        ctx.canvas.width / 2 - playerImage.width / 1.6,
        ctx.canvas.height / 2 - playerImage.height,
        playerImage.width / 4,
        playerImage.height
      );
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    function animate() {
      window.requestAnimationFrame(animate);

      if (lastKey === "ArrowUp" && keys.ArrowUp.pressed) {
        y += speed;
      } else if (lastKey === "ArrowDown" && keys.ArrowDown.pressed) {
        y -= speed;
      } else if (lastKey === "ArrowLeft" && keys.ArrowLeft.pressed) {
        x += speed;
      } else if (lastKey === "ArrowRight" && keys.ArrowRight.pressed) {
        x -= speed;
      }
      
      if (context) {
        draw(context, x, y);
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
