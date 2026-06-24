import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "", trim: true },
    image: { type: String, required: true }, // Banner image URL (Cloudinary or local)
    categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "category", default: [] }],
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true, collection: "banners" }
);

const bannerModel = mongoose.models.banner || mongoose.model("banner", bannerSchema);
export default bannerModel;
