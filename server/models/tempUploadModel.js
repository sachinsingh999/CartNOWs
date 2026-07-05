import mongoose from "mongoose";

const tempUploadSchema = new mongoose.Schema(
  {
    publicId: { type: String, required: true },
    imageUrl: { type: String, required: true },
    folder: { type: String, default: "cartnow/temp" },
    uploadedAt: { type: Date, default: Date.now },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from upload
    },
    isActive: { type: Boolean, default: false }
  },
  { collection: "temp_uploads" }
);

const tempUploadModel =
  mongoose.models.tempUpload ||
  mongoose.model("tempUpload", tempUploadSchema);

export default tempUploadModel;
