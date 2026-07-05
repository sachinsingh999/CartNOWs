import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
    modelImage: { type: String, required: false }, // Banner model image URL (Cloudinary or local)
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "", trim: true },
    badge: { type: String, default: "", trim: true }, // Campaign badge (e.g. "🔥 DEAL OF THE DAY")
    ctaText: { type: String, default: "Shop Now", trim: true },
    backgroundTheme: { type: String, default: "bg-gradient-to-r from-slate-900 to-indigo-955", trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    publicId: { type: String, default: "" },
    folder: { type: String, default: "cartnow/banners" },
    expiresAt: { type: Date, default: null },
    createdBy: { type: String, default: "Admin" }
  },
  { timestamps: true, collection: "banners" }
);

const bannerModel = mongoose.models.banner || mongoose.model("banner", bannerSchema);
export default bannerModel;
