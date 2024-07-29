export const errorMiddleware = (err, req, res, next) => {
  let message;
  if (err.name === "CastError") err.message = "Invalid ID";
  message = err.message || "Internal server error";
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message,
  });
};
