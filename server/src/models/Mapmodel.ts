import mongoose from "mongoose";

const mapSchema = new mongoose.Schema({
    mapId:{
        type: String,
        required: true,
        unique: true,
    },
    mapType:{
        type: Number,
        required: true,
    },
    mapName:{
        type: String,
        required: true,
    },
    players:{}
});

export const Map = mongoose.model("Map", mapSchema);