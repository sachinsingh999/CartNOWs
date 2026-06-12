import mongoose from "mongoose";

const listingMediaSchema = new mongoose.Schema(
  {
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ["image", "video", "file"], default: "image" },
    isCover: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 }
  },
  { timestamps: true, collection: "listing_media" }
);

listingMediaSchema.index({ listingId: 1, displayOrder: 1 });

const listingMediaModel =
  mongoose.models.listingMedia ||
  mongoose.model("listingMedia", listingMediaSchema);

export default listingMediaModel;
