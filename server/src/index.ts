import express, { Request, Response } from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import { RoomManager } from "./RoomManager";
import mongoose from "mongoose";
import cors from "cors";
import { router as AuthRouter } from "./routes/AuthRouter";
require("dotenv").config();

const DB = process.env.DATABASE;

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const port = process.env.PORT || 8000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript with Express!");
});

app.use(
  cors({
    origin: "*",
    methods: "GET, POST, PUT, DELETE",
    credentials: true,
    allowedHeaders: "Content-Type, Authorization",
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/api/v1/users", AuthRouter);

io.on("connection", (socket) => {
  console.log(socket.id);
  socket.on("join", () => {
    RoomManager.getInstance().addUser("user", 12345);
    io.emit("rooms", RoomManager.getInstance().rooms);
    console.log(RoomManager.getInstance().rooms);
  });
  socket.on("movement", (data) => {
    // const parsedData = JSON.parse(data.toString());
    console.log(data);
    io.emit("movement data", data);
  });
  socket.on("remove", () => {
    RoomManager.getInstance().removeUser("user", 12345);
    console.log("Disconnected", RoomManager.getInstance().rooms);
    io.emit("rooms", RoomManager.getInstance().rooms);
  });
  socket.on("disconnect", () => {
    io.emit(RoomManager.getInstance().rooms.toString());
  });
});
// console.log(DB)
mongoose
  .connect(DB)
  .then(() => {
    console.log("DB connected successfully");
    httpServer.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  }).catch((error)=>{
    console.error("Error connecting to the database:", error);
  })
