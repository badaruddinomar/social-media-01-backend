import ErrorHandler from "../utils/error.js";
import User from "../models/user.js";
import cloudinary from "../utils/cloudinary.js";
import Post from "../models/post.js";

// create post api handler--
export const createPost = async (req, res, next) => {
  try {
    // get the data from the body--
    const { text, image } = req.body;
    const userId = req.user._id;
    // check text exists or not--
    if (!text || !userId) {
      return next(new ErrorHandler("Please provide text and author", 400));
    }
    // find user--
    const user = await User.findById(userId);
    // check if user exists or not--
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    // check text length--
    if (text.length > 300) {
      return next(new ErrorHandler("Text too long", 400));
    }
    // check image exsits or not if exists then upload it--
    let cloudImage;
    if (image) {
      cloudImage = await cloudinary.uploader.upload(avatar, {
        resource_type: "image",
        folder: "posts",
      });
    }
    // create a new post--
    const newPost = await Post.create({
      text,
      userId,
      image: image ? cloudImage.secure_url : "",
    });
    // send response to the user--
    res.status(201).json({ post: newPost });
  } catch (err) {
    return next(new ErrorHandler("Internal server error", 500));
  }
};
// get single post--
export const getPost = async (req, res, next) => {
  try {
    const id = req.params.id;
    // find the post--
    const post = await Post.findById(id);
    // check post exists or not--
    if (!post) {
      return next(new ErrorHandler("Post not found", 404));
    }
    // send response to the user--
    res.status(200).json({ post });
  } catch (err) {
    return next(new ErrorHandler("Internal server error", 500));
  }
};
// delete post api--
export const deletePost = async (req, res, next) => {
  try {
    const id = req.params.id;
    const userId = req.user._id;
    const post = await Post.findById(id);
    // check post exists or not--
    if (!post) {
      return next(new ErrorHandler("Post not found", 400));
    }
    // check if user is the author of the post--
    if (userId.toString() !== post.userId.toString()) {
      return next(new ErrorHandler("You are not permitted", 403));
    }
    // if image exists then delete that image--
    if (post.image) {
      const imgId = post.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }
    // finally delete the post--
    await Post.findByIdAndDelete(id);
    // send response to the user--
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
    // check posts exists or not--
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
// find user posts--
export const userPosts = async (req, res, next) => {
  try {
    const userId = req.user._id;
    // find the user--
    const user = await User.findById(userId);
    // check user exists or not--
    if (!user) {
      return next(new ErrorHandler("user not found", 404));
    }
    // find users posts--
    const posts = await Post.find({ userId })
      .populate("userId", "name avatar text")
      .sort({ createdAt: -1 });
    // send the response to the user--
    return res.status(200).json({ posts, success: true });
  } catch (err) {
    return next(new ErrorHandler("Internal server error", 500));
  }
};
// edit user post--
export const editPost = async (req, res, next) => {
  try {
    const id = req.user._id;
    const postId = req.params.id;
    const { text } = req.body;
    const post = await Post.findById(postId);
    if (!post) {
      return next(new ErrorHandler("Post not found", 404));
    }
    // check if the post belongs to the user or not--
    if (post.userId.toString() !== id.toString()) {
      return next(new ErrorHandler("You are permited", 404));
    }
    let cloudImage;
    if (req.body.image) {
      // first delete the previous image--
      const imgId = post.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
      // upload the new image--
      cloudImage = await cloudinary.uploader.upload(req.body.image, {
        resource_type: "image",
        folder: "posts",
      });
    }
    // update the post--
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        text: req.body.text ? text : post.text,
        image: cloudImage ? cloudImage.secure_url : post.image,
      },
      {
        new: true,
      }
    );
    // send response to the user--
    res.status(201).json({
      message: "Post updated successfully",
      success: true,
      post: updatedPost,
    });
  } catch (err) {
    return next(new ErrorHandler("Internal server error", 500));
  }
};
// reply to post--
export const commentToPost = async (req, res, next) => {
  try {
    // get body data--
    const { comment, commentAuthorId, postId } = req.body;
    // comment is required--
    if (!comment) {
      return next(new ErrorHandler("Comment field is required", 404));
    }
    // find post--
    const post = await Post.findById(postId);
    // check post is exists or not--
    if (!post) {
      return next(new ErrorHandler("Post not found!", 404));
    }
    // comment object--
    const commentInfo = { user: commentAuthorId, comment };
    // add comment to post comments array--
    post.comments.push(commentInfo);
    await post.save();
    // send response to the user--
    res.status(201).json({
      message: "Comment added successfully",
      success: true,
      post,
    });
  } catch (err) {
    return next(new ErrorHandler("Internal server error", 500));
  }
};

export const feedPost = async (req, res, next) => {
  try {
    let page = req.query.page || 1;
    let limit = page * 20;
    // get user id--
    const userId = req.user._id;
    // find user--
    const user = await User.findById(userId);
    // check user exists or not--
    if (!user) {
      return next(new ErrorHandler("Post not found", 404));
    }
    // get following users id--
    const following = user.following;
    // get feed posts--
    const feedPosts = await Post.find({ authorId: { $in: following } })
      .sort({
        createdAt: -1,
      })
      .limit(limit);
    // send response to the user--
    return res.status(200).json({
      message: "Feed posts fetched successfully",
      success: true,
      posts: feedPosts,
    });
  } catch (err) {
    return next(new ErrorHandler("Internal server error", 500));
  }
};
