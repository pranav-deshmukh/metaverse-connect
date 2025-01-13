import { MapM } from "../models/Mapmodel";
import { Request, Response } from "express";
import { MongooseError } from "mongoose";
import { v4 as uuidv4 } from "uuid"; 

export const createMap = async (req: Request, res: Response) => {
  try {
    const { mapType, mapName, players, spaceType, admin } = req.body;
    console.log(req.body);
    if (!mapType || !mapName || !spaceType) {
      return res.status(400).json({
        status: "fail",
        message: "Missing required fields",
      });
    }
    const newMap = await MapM.create({
      mapType,
      mapName,
      players: players || new Map(),
      spaceType,
      admin: admin || new Map(),
      mapID: uuidv4(),
    });

    await newMap.save();

    res.status(201).json({
      status: "success",
      data: {
        map: newMap,
      },
      message: "Map created successfully",
    });
  } catch (error: MongooseError | any) {
    console.error("Error creating map:", error);
    return res.status(400).json({
      status: "fail",
      message: error instanceof Error ? error.message : "Error creating map",
    });
  }
};


export const getMaps = async (req: Request, res: Response) => {
  try {
    const {username} = req.body;
    const maps = await MapM.find();
    if (maps.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No maps found",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        maps,
      },
      message: "Maps retrieved successfully",
    });
  } catch (error: MongooseError | any) {
    console.error("Error getting maps:", error);
    return res.status(400).json({
      status: "fail",
      message: error instanceof Error ? error.message : "Error getting maps",
    });
  }
}