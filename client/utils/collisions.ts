import { collisions } from "@/data/Collisions";
import { RoomObj } from "@/data/Roomobj";

export const collisionsMap: number[][] = [];
export const RoomsMap: number[][] = [];
for (let i = 0; i < collisions.length; i += 85) {
  collisionsMap.push(collisions.slice(i, i + 85));
  RoomsMap.push(RoomObj.slice(i, i + 85));
}

class Boundry {
  static width = 36;
  static height = 36;
  position: { x: number; y: number };
  width: number;
  height: number;
  
  constructor({ position }: { position: { x: number; y: number } }) {
    this.position = position;
    this.width = Boundry.width;
    this.height = Boundry.height;
  }
  draw(context: CanvasRenderingContext2D) {
    // console.log(context)
    // context.fillStyle = "red";
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}
type Rooms = {
  position: { x: number; y: number };
  width: number;
  height: number;
};

class Room{
  static width = 36;
  static height = 36;
  position: { x: number; y: number };
  width: number;
  height: number;
  constructor({ position }: { position: { x: number; y: number } }) {
    this.position = position;
    this.width = 36;
    this.height = 36;
  }
  draw(context: CanvasRenderingContext2D) {
    // console.log(context)
    context.fillStyle = "red";
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

export const testBoundry = new Boundry({ position: { x: 400, y: 400 } });
export const boundries:Rooms[] = [];
export const Rooms:Rooms[] = [];


collisionsMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025) {
      boundries.push(
        new Boundry({
          position: { x: j * Boundry.width, y: i * Boundry.height },
        })
      );
    }
  });
});
export const testRoom = new Room({ position: { x: 400, y: 400 } });

RoomsMap.forEach((row, i)=>{
  row.forEach((symbol, j)=>{
    if(symbol===1025){
      Rooms.push(
        new Room({
          position:{ x: j * Boundry.width, y: i * Boundry.height },
        })
      )
    }
  })
})