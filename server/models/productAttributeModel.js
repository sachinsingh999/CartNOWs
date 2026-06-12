import mongoose from "mongoose";

const productAttributeSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
    templateFieldId: { type: mongoose.Schema.Types.ObjectId, ref: "categoryTemplate", required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true }
  },
  { timestamps: true }
);

const productAttributeModel =
  mongoose.models.productAttribute ||
  mongoose.model("productAttribute", productAttributeSchema);

export default productAttributeModel;
