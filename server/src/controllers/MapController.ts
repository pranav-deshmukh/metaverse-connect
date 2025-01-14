import { MapM } from "../models/Mapmodel";
import { User } from "../models/Usermodel";
import { Request, Response } from "express";
import { MongooseError } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export const createMap = async (req: Request, res: Response) => {
  try {
    const { mapType, mapName, players, spaceType, admin } = req.body;
    console.log(req.body);

    // Validate required fields
    if (!mapType || !mapName || !spaceType || !players || !admin) {
      return res.status(400).json({
        status: "fail",
        message: "Missing or invalid required fields",
      });
    }

    // Ensure players map has at least one entry
    const firstPlayerEntry = Object.entries(players)[0];
    if (!firstPlayerEntry) {
      return res.status(400).json({
        status: "fail",
        message: "Players map must have at least one entry",
      });
    }

    const [userId, playerData] = firstPlayerEntry;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "Player (user) not found",
      });
    }

    // Create new map
    const newMap = await MapM.create({
      mapType,
      mapName,
      players,
      spaceType,
      admin: admin || {},
      mapID: uuidv4(),
    });

    await newMap.save();

    // Add map to user's maps object
    user.maps[newMap.mapID] = { mapName: newMap.mapName, mapId: newMap.mapID };
    await user.save();

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
    const { username } = req.body;
    console.log(username);

    // Find user by username
    const foundUser = await User.findOne({ username });
    if (!foundUser) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    console.log(foundUser);
    const maps = foundUser.maps;

    // Check if user has any maps
    if (Object.keys(maps).length === 0) {
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
};
