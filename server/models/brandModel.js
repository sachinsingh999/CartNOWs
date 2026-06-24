import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, sparse: true, trim: true },
    logo: { type: String, default: "" },
    banner: { type: String, default: "" },
    status: { type: String, enum: ["active", "pending", "disabled"], default: "active" },
    totalViews: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 }
  },
  { timestamps: true, collection: "brands" }
);

const brandModel = mongoose.models.brand || mongoose.model("brand", brandSchema);
export default brandModel;
