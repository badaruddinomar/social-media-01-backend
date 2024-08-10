import express from "express";
import {
  followUnfollowUser,
  getFollowers,
  getFollowingUser,
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
router.get("/followers", protectRoute, getFollowers);
router.get("/following", protectRoute, getFollowingUser);
router.get("/follow-unfollow", protectRoute, followUnfollowUser);

export default router;
