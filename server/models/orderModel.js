import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // 🔥 FIX
      ref: "user",
      required: true,
    },

    items: {                               // 🔥 FIX (not products)
      type: Array,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    address: {
      type: Object,
      required: true,
    },

    orderStatus: {
      type: String,
      default: "Order Placed",
    },

    deliverymanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "deliveryman",
      default: null,
    },

    paymentMethod: {
      type: String,
      required: true,
    },

    paymentStatus: {
      type: String,
      default: "pending",
    },

    couponCode: {
      type: String,
      default: null,
    },

    discount: {
      type: Number,
      default: 0,
    },

    verificationCode: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, paymentStatus: 1 });

export default mongoose.model("order", orderSchema);
