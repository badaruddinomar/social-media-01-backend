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
    sendJwtToken(newUser, res, "User registered successfully", 201);
  } catch (err) {
    return next(new ErrorHandler("Internal server error", 500));
  }
};
