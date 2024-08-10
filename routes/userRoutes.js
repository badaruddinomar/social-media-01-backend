import express from "express";
import {
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

export default router;
