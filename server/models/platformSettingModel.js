import mongoose from "mongoose";

const platformSettingSchema = new mongoose.Schema(
  {
    commissionPercentage: { type: Number, default: 10 },
    totalPlatformEarnings: { type: Number, default: 0 },
    minImages: { type: Number, default: 3 },
    maxImages: { type: Number, default: 10 },
    allowedFormats: { type: [String], default: ["jpg", "jpeg", "png", "webp"] },
    maxImageSizeMB: { type: Number, default: 5 },
    moderationEnabled: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const platformSettingModel = mongoose.models.platformSetting || mongoose.model("platformSetting", platformSettingSchema);
export default platformSettingModel;
