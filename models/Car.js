import mongoose, { Types } from "mongoose";

const carSchema = new mongoose.Schema({
  plateNumber: { type: String, required: true, unique: true },
  carType: String,
  carSize: String,
  driverName: String,
  phoneNumber: String,
  image: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export default mongoose.model("Car", carSchema);
