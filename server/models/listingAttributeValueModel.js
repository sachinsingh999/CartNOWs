import mongoose from "mongoose";

const listingAttributeValueSchema = new mongoose.Schema(
  {
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
    attributeId: { type: mongoose.Schema.Types.ObjectId, ref: "categoryAttribute", required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true }
  },
  { timestamps: true, collection: "listing_attribute_values" }
);

listingAttributeValueSchema.index({ listingId: 1, attributeId: 1 }, { unique: true });
listingAttributeValueSchema.index({ attributeId: 1, value: 1 }); // for fast filtering

const listingAttributeValueModel =
  mongoose.models.listingAttributeValue ||
  mongoose.model("listingAttributeValue", listingAttributeValueSchema);

export default listingAttributeValueModel;
