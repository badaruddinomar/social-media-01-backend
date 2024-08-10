import express from "express";
import {
  logOutController,
  signInController,
  signUpController,
} from "../controller/userController.js";

const router = express.Router();

router.post("/sign-up", signUpController);
router.post("/sign-in", signInController);
router.get("/logout", logOutController);

export default router;
