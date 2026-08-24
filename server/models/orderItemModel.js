import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
      index: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productImage: {
      type: String,
      default: "",
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "seller",
      default: null,
      index: true,
    },
    sellerName: {
      type: String,
      default: "Direct Store",
    },
    shopName: {
      type: String,
      default: "Platform Store",
    },
    sellerEmail: {
      type: String,
      default: "",
    },
    sellerPhone: {
      type: String,
      default: "",
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
    unitPrice: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    finalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Processing",
        "Packed",
        "Ready to Ship",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancel Requested",
        "Cancelled",
        "Return Requested",
        "Return Pending",
        "Return Approved",
        "Returned",
        "Refund Initiated",
        "Refunded",
        "Failed",
      ],
      default: "Pending",
      index: true,
    },
    courierName: {
      type: String,
      default: "Express Shipping",
    },
    trackingId: {
      type: String,
      default: "",
    },
    deliverymanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "deliveryman",
      default: null,
    },
    shippedAt: {
      type: Date,
      default: null,
    },
    outForDeliveryAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    expectedDeliveryDate: {
      type: Date,
      default: null,
    },
    cancelReason: {
      type: String,
      default: "",
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    returnReason: {
      type: String,
      default: "",
    },
    returnedAt: {
      type: Date,
      default: null,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundStatus: {
      type: String,
      enum: ["none", "pending", "processed", "failed"],
      default: "none",
    },
    stockRestored: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

orderItemSchema.index({ orderId: 1, sellerId: 1 });
orderItemSchema.index({ userId: 1, status: 1 });

export default mongoose.model("orderItem", orderItemSchema);
