import express from "express";
import {
  signInController,
  signUpController,
} from "../controller/userController.js";

const router = express.Router();

router.post("/sign-up", signUpController);
router.post("/sign-in", signInController);

export default router;
