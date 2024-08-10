import express from "express";
import {
  commentToPost,
  createPost,
  deletePost,
  editPost,
  feedPost,
  getPost,
  likeUnlikePost,
  userPosts,
} from "../controller/postController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/create", protectRoute, createPost);
router.get("/:id", protectRoute, getPost);
router.delete("/:id", protectRoute, deletePost);
router.patch("/:id", protectRoute, editPost);
router.put("/like-unlike/:id", protectRoute, likeUnlikePost);
router.get("/all", protectRoute, userPosts);
router.post("/comment/:id", protectRoute, commentToPost);
router.get("/feed", protectRoute, feedPost);

export default router;
