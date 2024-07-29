import express from "express";
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middleware/errorMw.js";

const app = express();

// Middleware--
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(fileUpload());
app.use(helmet());
app.use(compression());
// Handling uncaught exceptions--
process.on("uncaughtException", (err) => {
  console.log(`error: ${err.message}`);
  console.log(`Uncaught exception: ${err.stack}`);
  process.exit(1);
});

// Connect to MongoDB--
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("DB connected successfully");
  })
  .catch(() => {
    console.log("DB connection error");
  });
// routes--
// error middleware--
app.use(errorMiddleware);
// routes--
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on port:${port}`);
});

// unhandled promise rejection--
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err}`);
  console.log(`Shuting down the server due to unhandled promise rejection!`);

  server.close(() => {
    process.exit(1);
  });
});
