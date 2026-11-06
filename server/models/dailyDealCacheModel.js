import mongoose from "mongoose";

const dailyDealCacheSchema = new mongoose.Schema(
  {
    dateKey: { type: String, required: true, unique: true, index: true }, // Format: YYYY-MM-DD
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "product", default: null },
    productName: { type: String, required: true },
    aiImageUrl: { type: String, required: true },
    status: { type: String, enum: ["ready", "failed"], default: "ready" },
    generatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true, collection: "daily_deal_ai_cache" }
);

const dailyDealCacheModel =
  mongoose.models.dailyDealCache || mongoose.model("dailyDealCache", dailyDealCacheSchema);

export default dailyDealCacheModel;

