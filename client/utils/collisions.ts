import { collisions } from "@/data/Collisions";

export const collisionsMap = [];
for (let i = 0; i < collisions.length; i += 85) {
  collisionsMap.push(collisions.slice(i, i + 85));
}



class Boundry {
  static width = 12;
  static height = 12;
  constructor({ position }) {
    this.position = position;
    this.width = 12;
    this.height = 12;
  }
  draw(context) {
    // console.log(context)
    // context.fillStyle = "red";
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

export const testBoundry= new Boundry({position: {x: 400, y: 400}})
export const boundries = [];
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
