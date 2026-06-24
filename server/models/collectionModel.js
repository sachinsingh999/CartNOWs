import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, sparse: true, trim: true },
    banner: { type: String, default: "" },
    description: { type: String, default: "" },
    status: { type: String, enum: ["active", "pending", "disabled"], default: "active" },
    totalViews: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    totalClicks: { type: Number, default: 0 }
  },
  { timestamps: true, collection: "collections" }
);

const collectionModel = mongoose.models.collection || mongoose.model("collection", collectionSchema);
export default collectionModel;
