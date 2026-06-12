import mongoose from "mongoose";

const categorySeoSchema = new mongoose.Schema(
  {
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "category", required: true, unique: true },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    keywords: { type: [String], default: [] }
  },
  { timestamps: true, collection: "category_seo" }
);

const categorySeoModel =
  mongoose.models.categorySeo ||
  mongoose.model("categorySeo", categorySeoSchema);

export default categorySeoModel;
