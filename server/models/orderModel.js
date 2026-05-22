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

    paymentMethod: {
      type: String,
      required: true,
    },

    paymentStatus: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("order", orderSchema);
