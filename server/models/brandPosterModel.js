import mongoose from "mongoose";

const brandPosterSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: true,
      trim: true
    },
    brandDomain: {
      type: String,
      default: "",
      trim: true
    },
    slug: {
      type: String,
      default: "",
      trim: true
    },
    headline: {
      type: String,
      required: true,
      trim: true
    },
    subheadline: {
      type: String,
      default: "",
      trim: true
    },
    offerBadge: {
      type: String,
      default: "EXCLUSIVE OFFER",
      trim: true
    },
    offerSub: {
      type: String,
      default: "Direct Brand Warranty & Express Delivery",
      trim: true
    },
    couponCode: {
      type: String,
      default: "BRANDPRO",
      trim: true
    },
    dealTag: {
      type: String,
      default: "Official Flagship",
      trim: true
    },
    rating: {
      type: String,
      default: "4.9★",
      trim: true
    },
    warrantyText: {
      type: String,
      default: "Official Brand Assurance",
      trim: true
    },
    perks: {
      type: [String],
      default: ["100% Genuine", "Instant Dispatch", "Free Returns", "Manufacturer Warranty"]
    },
    imageUrl: {
      type: String,
      required: true
    },
    imageAlt: {
      type: String,
      default: ""
    },
    publicId: {
      type: String,
      default: ""
    },
    folder: {
      type: String,
      default: "cartnow/brand_posters"
    },
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: "brand_posters"
  }
);

const brandPosterModel =
  mongoose.models.brandPoster || mongoose.model("brandPoster", brandPosterSchema);

export default brandPosterModel;
