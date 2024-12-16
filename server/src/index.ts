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
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
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
  console.log("New connection:", socket.id);

  socket.on("join", (room) => {
    // Remove any previous socket for this user before adding the new one
    // RoomManager.getInstance().removeUser(socket.id, room);
    RoomManager.getInstance().addUser(socket.id, room);
    
    const roomsObject = Object.fromEntries(
      Array.from(RoomManager.getInstance().rooms.entries()).map(([key, value]) => [key.toString(), value])
    );
    
    io.emit("rooms", roomsObject);
    console.log("Updated Rooms:", roomsObject);
  });

  socket.on("movement", (data) => {
    console.log(data);
    io.emit("movement data", data);
  });

  socket.on("remove", () => {
    RoomManager.getInstance().removeUser(socket.id, 1234);
    console.log("remove user: ", socket.id);
    
    const roomsObject = Object.fromEntries(
      Array.from(RoomManager.getInstance().rooms.entries()).map(([key, value]) => [key.toString(), value])
    );
    
    io.emit("rooms", roomsObject);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected", socket.id);
    RoomManager.getInstance().removeUser(socket.id, 1234);
    
    const roomsObject = Object.fromEntries(
      Array.from(RoomManager.getInstance().rooms.entries()).map(([key, value]) => [key.toString(), value])
    );
    
    io.emit("rooms", roomsObject);
  });
});

// console.log(DB)
mongoose
  .connect(DB ?? "")
  .then(() => {
    console.log("DB connected successfully");
    httpServer.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });
