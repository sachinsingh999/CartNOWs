import mongoose from "mongoose";

const promoBannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      default: "Upgrade Your Digital Life"
    },
    subtitle: {
      type: String,
      default: "Top brands. Latest gadgets. Great prices.",
      trim: true
    },
    tagline: {
      type: String,
      default: "TECH FOR A BETTER TOMORROW",
      trim: true
    },
    discountTag: {
      type: String,
      default: "UP TO 50% OFF",
      trim: true
    },
    ctaText: {
      type: String,
      default: "Shop Electronics",
      trim: true
    },
    linkUrl: {
      type: String,
      default: "/catalog/collection/festival-offers",
      trim: true
    },
    imageUrl: {
      type: String,
      default: "",
      required: false
    },
    images: {
      type: [String],
      default: []
    },
    publicId: {
      type: String,
      default: ""
    },
    folder: {
      type: String,
      default: "cartnow/banners"
    },
    placement: {
      type: String,
      enum: [
        "homepage",
        "categories_hero",
        "trending_hero",
        "new_arrivals_hero",
        "best_sellers_hero",
        "festival_offers_hero",
        "brands_hero",
        "collections_hero"
      ],
      default: "homepage"
    },
    displayMode: {
      type: String,
      enum: ["overlay", "full_image"],
      default: "overlay"
    },
    theme: {
      type: String,
      enum: ["dark", "light"],
      default: "dark"
    },
    bgColor: {
      type: String,
      default: "#F6F4FF"
    },
    showPerks: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 0
    },
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    collection: "promo_banners"
  }
);

const promoBannerModel =
  mongoose.models.promoBanner || mongoose.model("promoBanner", promoBannerSchema);

export default promoBannerModel;
