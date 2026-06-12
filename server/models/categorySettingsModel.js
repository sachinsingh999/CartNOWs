import mongoose from "mongoose";

const categorySettingsSchema = new mongoose.Schema(
  {
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "category", required: true, unique: true },
    minImages: { type: Number, default: 3 },
    maxImages: { type: Number, default: 10 },
    requiresApproval: { type: Boolean, default: true },
    inventoryTrackingEnabled: { type: Boolean, default: true },
    skuRequired: { type: Boolean, default: false },
    barcodeRequired: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const categorySettingsModel =
  mongoose.models.categorySettings ||
  mongoose.model("categorySettings", categorySettingsSchema);

export default categorySettingsModel;
