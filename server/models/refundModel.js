import mongoose from "mongoose";

const refundSchema = new mongoose.Schema(
  {
    refundNumber: {
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
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    gatewayTransactionId: {
      type: String,
      default: "",
    },
    gatewayRefundId: {
      type: String,
      default: "",
    },
    refundStatus: {
      type: String,
      enum: ["Pending", "Processing", "Bank Processing", "Successful", "Failed"],
      default: "Pending",
      index: true,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    failureReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const refundModel =
  mongoose.models.refund || mongoose.model("refund", refundSchema);

export default refundModel;
