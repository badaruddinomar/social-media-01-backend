import express from "express";
import config from "./utils/config.js";
import mongoose from "mongoose";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middleware/errorMw.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

// Middleware--
app.use(express.json());
app.use(cookieParser());
const corsOptions = {
  origin: config.CLIENT_URL,
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  // optionsSuccessStatus: 204,
  optionsSuccessStatus: 200,
  allowedHeaders: "Content-Type,Authorization",
};
app.use(cors(corsOptions));
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
  .connect(config.MONGO_URI)
  .then(() => {
    console.log("DB connected successfully");
  })
  .catch(() => {
    console.log("DB connection error");
  });
// routes--
app.use("/api/v1/user", userRoutes);
// error middleware--
app.use(errorMiddleware);
// routes--
const port = config.PORT || 4000;
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
