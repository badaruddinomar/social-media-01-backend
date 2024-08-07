import ErrorHandler from "../utils/error.js";
import User from "../models/user.js";
import cloudinary from "../utils/cloudinary.js";
import Post from "../models/post.js";

// create post api handler--
export const createPost = async (req, res, next) => {
  try {
    // get the data from the body--
    const { text, userId, image } = req.body;
    // check text exists or not--
    if (!text || !userId) {
      return next(new ErrorHandler("Please provide text and author", 400));
    }
    // find user--
    const user = await User.findById(userId);
    // check if user exists--
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    // check text length--
    if (text.length > 300) {
      return next(new ErrorHandler("Text too long", 400));
    }
    // check image exsits or not--
    let cloudImage;
    if (image) {
      cloudImage = await cloudinary.uploader.upload(avatar, {
        resource_type: "image",
        folder: "posts",
        width: 150,
        crop: "scale",
      });
    }
    // create a new post--
    const newPost = await Post.create({
      text,
      userId,
      image: image ? cloudImage.secure_url : "",
    });
    // return the new post--
    res.status(201).json({ post: newPost });
  } catch (err) {
    return next(new ErrorHandler("Internal server error", 500));
  }
};
// get single post--
export const getPost = async (req, res, next) => {
  try {
    const id = req.params.id;
    const post = await Post.findById(id);
    if (!post) {
      return next(new ErrorHandler("Post not found", 404));
    }
    res.status(200).json({ post });
  } catch (err) {
    return next(new ErrorHandler("Internal server error", 500));
  }
};
// delete post api--
export const deletePost = async (req, res, next) => {
  try {
    const id = req.params.id;
    const post = await Post.findById(id);
    if (!post) {
      return next(new ErrorHandler("Post not found", 400));
    }
    if (post.image) {
      const imgId = post.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }
    await Post.findByIdAndDelete(id);
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    return next(new ErrorHandler("Internal server error", 500));
  }
};

// like unlike post--
export const likeUnlikePost = async (req, res, next) => {
  try {
    const { id: postId } = req.body;
    const userId = req.user._id;
    // Find post--
    const post = await Post.findById(postId);
    if (!post) {
      return next(new ErrorHandler("Post doest not exists", 404));
    }
    // Check if the user already liked or disliked the post--
    const userLikedPost = post.likes.includes(userId);
    if (userLikedPost) {
      // unlike post--
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      return res.status(200).json({
        message: "Post unliked",
        success: true,
      });
    } else {
      // like post--
      await Post.updateOne({ _id: postId }, { $push: { likes: userId } });
      return res.status(200).json({
        message: "Post liked",
        success: true,
      });
    }
  } catch (err) {
    return next(new ErrorHandler("Internal server error", 500));
  }
};
