import mongoose from "mongoose";

const returnRequestSchema = new mongoose.Schema(
  {
    requestNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
      required: true,
      index: true,
    },
    orderItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "orderItem",
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "seller",
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    itemImage: {
      type: String,
      default: "",
      trim: true,
    },
    variant: {
      size: { type: String, default: "Standard" },
      sku: { type: String, default: "" },
      attributes: { type: Object, default: {} },
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    returnType: {
      type: String,
      enum: ["Refund", "Replacement", "Exchange"],
      required: true,
      default: "Refund",
    },
    exchangeDetails: {
      requestedSize: { type: String, default: "" },
      requestedSku: { type: String, default: "" },
      requestedVariant: { type: Object, default: {} },
    },
    returnReason: {
      type: String,
      enum: [
        "Defective/Damaged",
        "Wrong Item Delivered",
        "Size Mismatch",
        "Item Not As Described",
        "Quality Not Expected",
        "Changed Mind",
        "Other",
      ],
      required: true,
    },
    customerDescription: {
      type: String,
      default: "",
      trim: true,
    },
    evidenceImages: [{ type: String }],
    evidenceVideos: [{ type: String }],
    status: {
      type: String,
      enum: ["Pending Approval", "Under Review", "Approved", "Rejected", "Cancelled"],
      default: "Pending Approval",
      index: true,
    },
    sellerNotes: {
      type: String,
      default: "",
      trim: true,
    },
    adminNotes: {
      type: String,
      default: "",
      trim: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const returnRequestModel =
  mongoose.models.returnRequest ||
  mongoose.model("returnRequest", returnRequestSchema);

export default returnRequestModel;
