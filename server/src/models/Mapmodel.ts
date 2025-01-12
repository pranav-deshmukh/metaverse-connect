import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid"; 

const mapSchema = new mongoose.Schema({
    mapID:{
        type: String,
        required: true,
        unique: true,
        default:uuidv4
    },
    mapType:{
        type: Number,
        required: true,
    },
    mapName:{
        type: String,
        required: true,
    },
    spaceType:{
        type:String,
        required: true,
    },
    players:{
        type:Map,
        of:Object,
        default: new Map(),
    },
    admin:{
        type:Map,
        of:Object,
        default: new Map(),
    },

},{
    timestamps: true,
});


export const MapM = mongoose.model("Map", mapSchema);