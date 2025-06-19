import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  packageNumber: { type: String, required: true, unique: true },
  packageName: { type: String, required: true },
  packageDescription: { type: String, required: true },
  packagePrice: { type: Number, required: true },
  createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
}, { timestamps: true });

export default mongoose.model('Package', packageSchema);
