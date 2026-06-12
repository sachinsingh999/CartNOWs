import mongoose from "mongoose";

const tryOnSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
    uploadedImage: { type: String, required: true }, // Cloudinary URL
    generatedImage: { type: String, default: null }, // Cloudinary URL
    selectedSize: { type: String, enum: ["S", "M", "L", "XL", "XXL"], required: true },
    status: {
      type: String,
      enum: ["pending", "validating", "processing", "completed", "failed"],
      default: "pending"
    },
    generationTime: { type: Number, default: null }, // in seconds
    error: { type: String, default: null }
  },
  { timestamps: true }
);

const tryOnSessionModel = mongoose.models.tryOnSession || mongoose.model("tryOnSession", tryOnSessionSchema);
export default tryOnSessionModel;
