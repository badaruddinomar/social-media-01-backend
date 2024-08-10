import User from "../models/user.js";
import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/error.js";
import config from "../utils/config.js";

export const protectRoute = async (req, res, next) => {
  try {
    // get the token--
    const token = req.cookies.token;
    // check token exists or not--
    if (!token) {
      return next(new ErrorHandler("Unauthorized", 401));
    }
    // decode or get data from token--
    const decoded = jwt.verify(token, config.JWT_SECRET_KEY);
    // find the user--
    const user = await User.findById(decoded.id).select("-password");
    // save the user to request object--
    req.user = user;
    // call the next middleware--
    next();
  } catch (err) {
    return next(new ErrorHandler("Unauthorized", 500));
  }
};
