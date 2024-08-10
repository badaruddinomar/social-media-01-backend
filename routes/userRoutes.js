import express from "express";
import {
  getUser,
  logOutController,
  signInController,
  signUpController,
  updateUserProfile,
} from "../controller/userController.js";

import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/sign-up", signUpController);
router.post("/sign-in", signInController);
router.get("/logout", logOutController);
router.patch("/update", protectRoute, updateUserProfile);
router.get("/profile", protectRoute, getUser);

export default router;
