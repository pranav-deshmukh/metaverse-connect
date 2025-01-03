export const drawMap = (ctx: CanvasRenderingContext2D, backgroundImage:HTMLImageElement, x:number,y:number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(backgroundImage, x, y, 3500, 2500);
  };

export const drawCharacter = (ctx: CanvasRenderingContext2D, playerSprite:HTMLImageElement, frame:number)=>{
    ctx.drawImage(
      playerSprite,
      frame * 48, 
      0,
      playerSprite.width / 4, 
      playerSprite.height, 
      ctx.canvas.width / 2 - playerSprite.width / 4, 
      ctx.canvas.height / 2 - playerSprite.height, 
      playerSprite.width / 4,
      playerSprite.height 
    );
}

export const drawPlayer = (ctx: CanvasRenderingContext2D, playerSprite:HTMLImageElement, x:number, y:number, frame:number)=>{
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
}