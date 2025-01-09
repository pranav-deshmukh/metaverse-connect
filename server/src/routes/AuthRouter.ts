import express from "express";
import * as AuthController from "./../controllers/AuthController";

const router = express.Router();

router.post("/signup", AuthController.signUp);
router.post("/login", AuthController.login);
router.post("/getuser", AuthController.getUser);

export { router }