import mongoose from "mongoose";

const cloudinaryCleanupLogSchema = new mongoose.Schema(
  {
    assetId: { type: String, required: true },
    publicId: { type: String, required: true },
    folder: { type: String, required: true },
    deletedAt: { type: Date, default: Date.now },
    reason: {
      type: String,
      enum: ["Deal Expired", "Banner Expired", "Ad Campaign Ended", "Temp Upload Cleanup"],
      required: true
    }
  },
  { collection: "cloudinary_cleanup_logs" }
);

const cloudinaryCleanupLogModel =
  mongoose.models.cloudinaryCleanupLog ||
  mongoose.model("cloudinaryCleanupLog", cloudinaryCleanupLogSchema);

export default cloudinaryCleanupLogModel;
