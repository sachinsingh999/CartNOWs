import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: false,
      default: function () {
        return "ORD-" + Date.now() + "-" + Math.floor(1000 + Math.random() * 9000);
      },
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    items: {
      type: Array,
      default: [],
    },
    shippingAddress: {
      type: Object,
      required: false,
      default: {},
    },
    billingAddress: {
      type: Object,
      default: null,
    },
    address: {
      type: Object,
      default: null,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "Pending", "paid", "Paid", "partially_refunded", "Partially_Refunded", "refunded", "Refunded", "failed", "Failed"],
      default: "pending",
      index: true,
      set: (v) => (v ? v.toLowerCase() : v)
    },
    paymentId: {
      type: String,
      default: null,
    },
    subtotal: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    shippingFee: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    amount: {
      type: Number,
      required: true,
    },
    couponCode: {
      type: String,
      default: null,
    },
    orderStatus: {
      type: String,
      default: "Processing",
      index: true,
    },
    verificationCode: {
      type: String,
      default: null,
    },
    deliverymanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "deliveryman",
      default: null,
    },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, paymentStatus: 1, createdAt: -1 });

export default mongoose.model("order", orderSchema);
