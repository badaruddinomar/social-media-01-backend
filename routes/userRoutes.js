import express from "express";
import { signUpController } from "../controller/userController.js";

const router = express.Router();

router.post("/sign-up", signUpController);

export default router;
