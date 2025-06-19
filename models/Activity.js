import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true }, // e.g., "create", "update", "delete"
    resourceType: { type: String, required: true }, // e.g., "car", "package"
    resourceId: { type: mongoose.Schema.Types.ObjectId },
    message: { type: String },
    metadata: { type: Object },
  },
  { timestamps: true }
);

export default mongoose.model("Activity", activitySchema);
