import User from "../models/user";
import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/error";
import config from "../utils/config.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return next(new ErrorHandler("Unauthorized", 401));
    }
    const decoded = jwt.verify(token, config.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id).select("-password");
    req.user = user;
    next();
  } catch (err) {
    return next(new ErrorHandler("Unauthorized", 500));
  }
};
