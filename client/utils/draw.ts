import mapImage from "@/public/finalmap.png";
import playerImage from "@/public/playerDown.png";

export const drawMap = (
  ctx: CanvasRenderingContext2D,
  backgroundImage: HTMLImageElement,
  x: number,
  y: number
) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(backgroundImage, x, y);
};

export const drawCharacter = (
  ctx: CanvasRenderingContext2D,
  playerSprite: HTMLImageElement,
  frame: number,
  x: number,
  y: number
) => {
  ctx.drawImage(
    playerSprite,
    frame * 48,
    0,
    playerSprite.width / 4,
    playerSprite.height,
   x,
    y,
    playerSprite.width / 8,
    playerSprite.height/2
  );
};

export const drawPlayer = (
  ctx: CanvasRenderingContext2D,
  playerSprite: HTMLImageElement,
  x: number,
  y: number,
  frame: number
) => {
  ctx.drawImage(
    playerSprite,
    frame * 48,
    0,
    playerSprite.width / 4,
    playerSprite.height,
    x,
    y,
    playerSprite.width / 4,
    playerSprite.height
  );
};

let backgroundImage: HTMLImageElement;
let playerSprite: HTMLImageElement;

backgroundImage = new window.Image();
playerSprite = new window.Image();

backgroundImage.src = mapImage.src;
playerSprite.src = playerImage.src;


export {backgroundImage, playerSprite};