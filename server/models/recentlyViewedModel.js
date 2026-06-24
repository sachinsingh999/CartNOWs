import mongoose from "mongoose";

const recentlyViewedSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true
    },
    lastViewed: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true, collection: "recently_viewed" }
);

// Compound index to ensure uniqueness per user-product view pair
recentlyViewedSchema.index({ userId: 1, productId: 1 }, { unique: true });

const recentlyViewedModel =
  mongoose.models.recentlyViewed ||
  mongoose.model("recentlyViewed", recentlyViewedSchema);

export default recentlyViewedModel;
