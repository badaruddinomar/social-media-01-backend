import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      trim: true,
      select: false,
    },
    avatar: {
      type: String,
      default: "https://i.stack.imgur.com/l60Hf.png", // Default avatar image
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
