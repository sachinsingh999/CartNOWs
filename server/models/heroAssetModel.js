import mongoose from "mongoose";

const heroAssetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  tagline: {
    type: String,
    default: "",
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  publicId: {
    type: String,
    default: ""
  },
  folder: {
    type: String,
    default: "cartnow/banners"
  },
  expiresAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const heroAssetModel = mongoose.models.heroAsset || mongoose.model("heroAsset", heroAssetSchema);
export default heroAssetModel;
