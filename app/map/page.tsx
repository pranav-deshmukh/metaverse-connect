"use client";
import { useEffect, useRef } from "react";
import mapImage from "@/public/map1.png";
import playerImage from "@/public/playerDown.png";
import { collisions } from "@/data/Collisions";

const collisionsMap = [];
for (let i = 0; i < collisions.length; i += 70) {
  collisionsMap.push(collisions.slice(i, i + 70));
}

const Map = () => {
  let x = -1185,
    y = -1140;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  let keys = {
    ArrowUp: { pressed: false },
    ArrowDown: { pressed: false },
    ArrowLeft: { pressed: false },
    ArrowRight: { pressed: false },
  };

  let lastKey = "";
  const speed = 1.5;
  let frame = 0; // To control sprite animation
  let animationCounter = 0; // Control frame update speed

  // Preload images
  
  const backgroundImage = new window.Image();
  const playerSprite = new window.Image();

  backgroundImage.src = mapImage.src;
  playerSprite.src = playerImage.src;

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

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const draw = (ctx: CanvasRenderingContext2D) => {
    // Clear canvas before drawing
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw map
    ctx.drawImage(backgroundImage, x, y, 3500, 2500);

    // Draw player sprite at the center of the screen, updating the frame for animation
    ctx.drawImage(
      playerSprite,
      frame * 48, // X position for current frame in sprite sheet
      0, // Y position (assuming single row of frames)
      playerImage.width / 4, // Width of a single frame
      playerImage.height, // Full height of the sprite
      ctx.canvas.width / 2 - playerImage.width / 4, // X position on canvas (centered)
      ctx.canvas.height / 2 - playerImage.height, // Y position on canvas (centered)
      playerImage.width / 4, // Scaled width
      playerImage.height // Scaled height
    );
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    function animate() {
      window.requestAnimationFrame(animate);

      // Move player based on pressed keys
      if (keys.ArrowUp.pressed && lastKey === "ArrowUp") {
        y += speed;
      } else if (keys.ArrowDown.pressed && lastKey === "ArrowDown") {
        y -= speed;
      } else if (keys.ArrowLeft.pressed && lastKey === "ArrowLeft") {
        x += speed;
      } else if (keys.ArrowRight.pressed && lastKey === "ArrowRight") {
        x -= speed;
      }

      // Update animation frame every 10 frames to slow down the animation
      animationCounter++;
      if (animationCounter % 40 === 0) {
        frame = (frame + 1) % 4; // Loop through the 4 frames
      }

      if (context) {
        draw(context);
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
