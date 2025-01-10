import { Map } from "../models/Mapmodel";
import { Request, Response } from "express";
import { MongooseError } from "mongoose";

export const createMap = async (req: Request, res: Response) => {
  try {
    const { mapId, mapType, mapName, players } = req.body;
    console.log(req.body);
    const newMap = await Map.create({
      mapId,
      mapType,
      mapName,
      players,
    });
    res.status(201).json({
      status: 201,
      data: {
        newMap,
      },
    message: "Map created successfully",
    });
  } catch (error:MongooseError | any) {
    return res.status(400).json({ status: "fail", message: error.message });
  }
}