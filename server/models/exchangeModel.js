import mongoose from "mongoose";

const exchangeSchema = new mongoose.Schema(
  {
    exchangeNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    rmaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "returnOrder",
      required: true,
      index: true,
    },
    originalOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    replacementVariant: {
      size: { type: String, default: "" },
      sku: { type: String, default: "" },
      attributes: { type: Object, default: {} },
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    courierName: {
      type: String,
      default: "Express Shipping",
    },
    trackingNumber: {
      type: String,
      default: "",
    },
    deliveryStatus: {
      type: String,
      enum: ["Reserved", "Packing", "Shipped", "Out for Delivery", "Delivered", "Failed"],
      default: "Reserved",
      index: true,
    },
    shippedAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const exchangeModel =
  mongoose.models.exchange || mongoose.model("exchange", exchangeSchema);

export default exchangeModel;
