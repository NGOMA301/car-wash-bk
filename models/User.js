import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: String,
  profileImage: String,
  fullName: String,
  password: { type: String, required: true },
  provider: { type: String, default: "local" },
  role: { type: String, enum: ["user", "admin"], default: "user" },
});

export default mongoose.model("User", userSchema);
