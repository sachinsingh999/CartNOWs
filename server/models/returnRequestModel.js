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
    returnType: {
      type: String,
      enum: ["Refund", "Replacement", "Exchange"],
      default: "Refund",
    },
    exchangeSize: {
      type: String,
      default: "",
      trim: true,
    },
    deliverymanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "deliveryman",
      default: null,
    },
    status: {
      type: String,
      enum: ["Requested", "Approved", "Rejected", "Out for Pickup", "Picked Up", "Completed"],
      default: "Requested",
    },
    adminNote: {
      type: String,
      default: "",
      trim: true,
    },
    verificationCode: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate return verification code if not present
returnRequestSchema.pre("save", function (next) {
  if (!this.verificationCode) {
    this.verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

const returnRequestModel =
  mongoose.models.returnRequest ||
  mongoose.model("returnRequest", returnRequestSchema);

export default returnRequestModel;
