// backend/src/models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    // You can store email, username etc. Adjust as needed.
    userId: { type: String, required: true, unique: true }, // e.g. email or auth provider id
    name: { type: String },
  },
  {
    collection: "users",
    timestamps: true,
  }
);

const User = mongoose.model("User", UserSchema);
export default User;
