import express from "express";
import {
  createPost,
  deletePost,
  getPost,
  likeUnlikePost,
} from "../controller/postController.js";

const router = express.Router();

router.post("/create", createPost);
router.get("/:id", getPost);
router.delete("/:id", deletePost);
router.put("/like-unlike/:id", likeUnlikePost);

export default router;
