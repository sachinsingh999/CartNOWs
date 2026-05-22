import mongoose from "mongoose";

const returnRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      default: null,
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
    itemSize: {
      type: String,
      default: "",
      trim: true,
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
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    feedback: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Requested", "Approved", "Rejected", "Received", "Refunded"],
      default: "Requested",
    },
    adminNote: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

const returnRequestModel =
  mongoose.models.returnRequest ||
  mongoose.model("returnRequest", returnRequestSchema);

export default returnRequestModel;
