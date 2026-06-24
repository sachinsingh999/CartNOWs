import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, sparse: true, trim: true },
    subcategories: { type: [String], default: [] },
    description: { type: String, default: "" },
    icon: { type: String, default: "" },
    bannerImage: { type: String, default: "" },
    parentCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "category", default: null },
    displayOrder: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "pending", "disabled", "archived"], default: "active" },
    isFeatured: { type: Boolean, default: false },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    seoKeywords: { type: [String], default: [] },
    visibilityRules: { type: mongoose.Schema.Types.Mixed, default: {} }, // e.g. role-based visibility rules
    totalViews: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    totalSearches: { type: Number, default: 0 }
  },
  { timestamps: true, collection: "categories" }
);

const categoryModel = mongoose.models.category || mongoose.model("category", categorySchema);
export default categoryModel;
