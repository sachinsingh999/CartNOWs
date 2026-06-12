import mongoose from "mongoose";

const categoryAttributeOptionSchema = new mongoose.Schema(
  {
    attributeId: { type: mongoose.Schema.Types.ObjectId, ref: "categoryAttribute", required: true },
    label: { type: String, required: true },
    value: { type: String, required: true },
    displayOrder: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "disabled"], default: "active" }
  },
  { timestamps: true, collection: "category_attribute_options" }
);

categoryAttributeOptionSchema.index({ attributeId: 1, value: 1 }, { unique: true });

const categoryAttributeOptionModel =
  mongoose.models.categoryAttributeOption ||
  mongoose.model("categoryAttributeOption", categoryAttributeOptionSchema);

export default categoryAttributeOptionModel;
