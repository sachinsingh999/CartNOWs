import mongoose from "mongoose";

const saleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
  badge: { type: String, default: "SALE" },          // e.g. "FLASH DEAL", "50% OFF"
  discountPercent: { type: Number, default: 0 },      // 0-100
  discountLabel: { type: String, default: "" },       // e.g. "Up to 50% off"
  bgColor: { type: String, default: "#6366f1" },      // hex or gradient string
  textColor: { type: String, default: "#ffffff" },
  buttonText: { type: String, default: "Shop Now" },
  buttonLink: { type: String, default: "/product" },  // internal path
  image: { type: String, default: "" },               // optional banner image URL
  category: { type: String, default: "" },            // optional filter
  validFrom: { type: Date, default: Date.now },
  validTo: { type: Date, required: true },
  active: { type: Boolean, default: true },
  publicId: { type: String, default: "" },
  folder: { type: String, default: "cartnow/ads" },
  expiresAt: { type: Date, default: null },
  priority: { type: Number, default: 0 },             // higher = shows first
}, { timestamps: true });

const saleModel = mongoose.models.sale || mongoose.model("sale", saleSchema);
export default saleModel;
