import express, { Request, Response } from 'express';
import {Server} from 'socket.io'
import {createServer} from 'http'
import { RoomManager } from './RoomManager';

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer,{
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})
const port = process.env.PORT || 8000;

app.use(express.json());



app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript with Express!');
});


io.on('connection',(socket)=>{
  console.log(socket.id)
  socket.on('join',()=>{
    RoomManager.getInstance().addUser("user",12345);
    io.emit("rooms", RoomManager.getInstance().rooms);
    console.log(RoomManager.getInstance().rooms)
  })
  socket.on('movement',(data)=>{
    const parsedData = JSON.parse(data.toString());
    io.emit("movement data",data);
  })
  socket.on("remove",()=>{
    RoomManager.getInstance().removeUser("user",12345)
    console.log("Disconnected", RoomManager.getInstance().rooms)
    io.emit("rooms", RoomManager.getInstance().rooms);
  })
  socket.on("disconnect",()=>{
    io.emit(RoomManager.getInstance().rooms.toString())
  })

})

httpServer.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
