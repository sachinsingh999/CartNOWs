import mongoose from "mongoose";

const productImageSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
    imageUrl: { type: String, required: true },
    isCover: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const productImageModel = mongoose.models.productImage || mongoose.model("productImage", productImageSchema);
export default productImageModel;
