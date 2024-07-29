import jwt from "jsonwebtoken";

export const sendJwtToken = (user, res, message, statusCode) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_TOKEN_EXPIRATION,
  });
  // option for cookie--
  const options = {
    httpOnly: true,
    expiresIn: process.env.JWT_COOKIE_EXPIRATION,
    secure: true,
    sameSite: "None",
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    token,
    message,
  });
};
