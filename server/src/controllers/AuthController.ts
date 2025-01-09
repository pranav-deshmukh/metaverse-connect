import { User, userI } from "../models/Usermodel"; 
import * as jwt from "jsonwebtoken"
import { Request, Response } from "express";
import { MongooseError } from "mongoose";

const createSendToken = (user:userI, statuscode:number, res:Response)=>{
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.status(201).json({
    status: statuscode,
    token,
    data: {
      user,
    },
  });
}

export const signUp = async(req:Request,res:Response)=>{
    try {
        const {username, email, password} = req.body;
        const newUser = await User.create({
            username,email,password
        })
        createSendToken(newUser, 200, res);
    } catch (error:MongooseError|any) {
        return res.status(400).json({ status: "fail", message: error.message });
    }
}

export const login = async(req:Request,res:Response)=>{
    try {
        const {username, password} = req.body;
        const user = await User.findOne({username}).select("+password");
        if(!user||!(await user.correctPassword(password, user.password))){
            return res
        .status(401)
        .json({ status: "fail", message: "Incorrect email or password" })
        }
        createSendToken(user, 200, res);
    } catch (error) {
        return res.status(401).json({
            status:"fail",
            message:"An error occured"
        })
    }
}