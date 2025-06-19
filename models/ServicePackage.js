import mongoose from "mongoose";

const servicePackageSchema = new mongoose.Schema(
  {
    recordNumber: { type: String, required: true, unique: true },
    serviceDate: { type: Date, default: Date.now },

    car: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // receptionist
  },
  { timestamps: true }
);

export default mongoose.model("ServicePackage", servicePackageSchema);
