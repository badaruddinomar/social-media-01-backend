import express from "express";
import {
  createPost,
  deletePost,
  getPost,
} from "../controller/postController.js";

const router = express.Router();

router.post("/create", createPost);
router.get("/:id", getPost);
router.delete("/:id", deletePost);

export default router;
