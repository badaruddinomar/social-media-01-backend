import User from "../models/user.js";
import ErrorHandler from "../utils/error.js";
import bcrypt from "bcryptjs";
import cloudinary from "../utils/cloudinary.js";
import { sendJwtToken } from "../utils/sendToken.js";

export const signUpController = async (req, res, next) => {
  try {
    // get data from the body
    const { username, email, password, avatar } = req.body;
    // check body data exists or not--
    if (!username || !email || !password) {
      return next(new ErrorHandler("All fields are required", 400));
    }
    // check user already exists or not--
    const user = await User.findOne({ email });
    if (user) {
      return next(new ErrorHandler("User already exists", 400));
    }
    // Check password length--
    if (password.trim().length < 6) {
      return next(
        new ErrorHandler("Password must be at least 6 characters long!", 400)
      );
    }
    // Hash password--
    var salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Check avatar exists or not--
    let cloudImage;
    if (avatar) {
      cloudImage = await cloudinary.uploader.upload(avatar, {
        resource_type: "image",
        folder: "avatars",
        width: 150,
        crop: "scale",
      });
    }
    // Create new user--
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      avatar: avatar
        ? cloudImage?.secure_url
        : "https://i.stack.imgur.com/l60Hf.png",
    });
    await newUser.save();
    const { password: exceptPassword, ...userData } = newUser._doc;
    // return the new user--
    sendJwtToken(userData, res, "User registered successfully", 201);
  } catch (err) {
    return next(new ErrorHandler("Internal server error", 500));
  }
};

export const signInController = async (req, res, next) => {
  try {
    // get data from the body
    const { email, password } = req.body;
    // check body data exists or not--
    if (!email || !password) {
      return next(new ErrorHandler("All fields are required", 400));
    }
    // check user exists or not--
    let user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    // check password--
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new ErrorHandler("Invalid credentials", 401));
    }
    // send response to the user--
    const { password: exceptPassword, ...userData } = user._doc;
    sendJwtToken(userData, res, "User logged in successfully", 200);
  } catch (err) {
    return next(new ErrorHandler("Internal server error", 500));
  }
};

export const logOutController = async (req, res, next) => {
  try {
    // clear the cookie--
    res.clearCookie("token");
    // send response to the user--
    res.status(200).json({ success: true, message: "User logged out" });
  } catch (err) {
    return next(new ErrorHandler("Internal server error!", 500));
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    // get user id--
    const userId = req.user._id;
    // find the user--
    const user = await User.findById(userId);
    // check user exists or not--
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    // update user data--
    const { username, avatar, bio, prevPassword, newPassword } = req.body;
    user.username = username ? username : user.username;
    user.bio = bio ? bio : user.bio;
    // compare previous password--
    if (prevPassword) {
      const isMatch = await bcrypt.compare(prevPassword, user.password);
      if (!isMatch) {
        return next(new ErrorHandler("Invalid previous password", 401));
      }
    }
    // check new password length--
    if (newPassword && newPassword.trim().length < 6) {
      return next(
        new ErrorHandler(
          "New password must be at least 6 characters long!",
          400
        )
      );
    }
    // Hash new password--
    if (newPassword) {
      var salt = bcrypt.genSaltSync(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
    }

    if (avatar) {
      // first delete the previous image--
      const imgId = user?.avatar?.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
      // upload the new image--
      const cloudImage = await cloudinary.uploader.upload(avatar, {
        resource_type: "image",
        folder: "avatars",
        width: 150,
        crop: "scale",
      });
      user.avatar = cloudImage?.secure_url;
    }
    // save user data--
    await user.save();
    // send response to the user--
    res.status(200).json({ success: true, user });
  } catch (err) {
    return next(new ErrorHandler("Internal server error", 500));
  }
};

export const getUser = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    // check user exists or not--
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    // send response to the user--
    res.status(200).json({ success: true, user });
  } catch (err) {
    return next(new ErrorHandler("Internal server error", 500));
  }
};

export const getFollowers = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("followers");
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    const followers = user.followers;
    res.status(200).json({
      success: true,
      followers: followers,
    });
  } catch (err) {
    return next(new ErrorHandler("Internal server error", 500));
  }
};

export const getFollowingUser = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("following");
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    const following = user.following;
    res.status(200).json({
      success: true,
      following: following,
    });
  } catch (err) {
    return next(new ErrorHandler("Internal server error", 500));
  }
};

export const followUnfollowUser = async (req, res, next) => {
  try {
    // get user id--
    const userId = req.user._id;
    const { followId } = req.body;
    // find user--
    const user = await User.findById(userId);
    // check the user exists or not--
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    // check user followed or not--
    const isFollowing = user.following.includes(followId);
    if (isFollowing) {
      // unfollow the user
      user.following = user.following.filter(
        (id) => id.toString() !== followId
      );
    } else {
      // follow the user
      user.following.push(followId);
    }
    await user.save();
    // send the response to the user--
    res.status(200).json({ success: true, user });
  } catch (err) {
    return next(new ErrorHandler("Internal server error", 500));
  }
};
