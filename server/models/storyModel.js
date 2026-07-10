import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  mediaUrl: {
    type: String,
    required: true,
  },
  mediaType: {
    type: String,
    default: "image", // "image" or "video"
  },
  caption: {
    type: String,
    default: "",
  },
  location: {
    type: String,
    default: "",
  },
  overlayText: {
    type: String,
    default: "",
  },
  overlayColor: {
    type: String,
    default: "#ffffff",
  },
  privacy: {
    type: String,
    enum: ["Public", "Friends", "Only Me"],
    default: "Public",
  },
  canvasLayers: {
    type: Array,
    default: [],
  },
  bgAdjustmentFilters: {
    type: Object,
    default: {},
  },
  taggedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // Automatically expire and delete story from MongoDB after 24 hours
  },
});

const storyModel = mongoose.models.story 
  || mongoose.model("story", storySchema);

export default storyModel;
