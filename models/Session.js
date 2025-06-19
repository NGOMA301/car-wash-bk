import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sessionId: { type: String, required: true, unique: true },
    ip: String,
    location: String,
    userAgent: String,
    device: String,
    platform: String,
    browser: String,
    createdAt: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Session", sessionSchema);
