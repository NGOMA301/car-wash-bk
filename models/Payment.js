import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    paymentNumber: { type: String, required: true, unique: true },
    amountPaid: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    paymentMethod:String,
    status:String,
    servicePackage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServicePackage",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
