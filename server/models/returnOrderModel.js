import mongoose from "mongoose";

const rmaTimelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  description: { type: String, required: true },
  actorRole: {
    type: String,
    enum: ["customer", "seller", "admin", "deliveryman", "system"],
    required: true,
  },
  actorId: { type: mongoose.Schema.Types.ObjectId, default: null },
  timestamp: { type: Date, default: Date.now },
});

const returnOrderSchema = new mongoose.Schema(
  {
    rmaNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "returnRequest",
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
      default: "",
    },
    itemImage: {
      type: String,
      default: "",
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
      enum: ["Refund", "Exchange"],
      required: true,
    },

    // Reverse Logistics Details
    pickupAddress: {
      type: Object,
      required: true,
    },
    pickupCourier: {
      type: String,
      default: "Express Reverse Logistics",
    },
    pickupTrackingNumber: {
      type: String,
      default: "",
    },
    pickupScheduledDate: {
      type: Date,
      default: null,
    },
    pickupCompletedDate: {
      type: Date,
      default: null,
    },
    deliverymanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "deliveryman",
      default: null,
      index: true,
    },
    pickupVerificationCode: {
      type: String,
      required: true,
    },

    // Warehouse Quality Control (QC)
    warehouseId: {
      type: String,
      default: "WH-MAIN-01",
    },
    inspectionStatus: {
      type: String,
      enum: [
        "Pending Arrival",
        "Inspection Started",
        "Passed",
        "Failed",
        "Partially Passed",
      ],
      default: "Pending Arrival",
      index: true,
    },
    inspectionNotes: {
      type: String,
      default: "",
    },
    restockInventory: {
      type: Boolean,
      default: false,
    },

    // Sub-Entity References
    refundId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "refund",
      default: null,
    },
    exchangeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "exchange",
      default: null,
    },

    // Master RMA Lifecycle Status
    status: {
      type: String,
      enum: [
        "RMA Created",
        "Pickup Scheduled",
        "Out for Pickup",
        "Picked Up",
        "In Transit to Warehouse",
        "Arrived at Warehouse",
        "Inspection In Progress",
        "Inspection Passed",
        "Inspection Failed",
        "Refund Initiated",
        "Refund Completed",
        "Replacement Shipped",
        "Completed",
        "Closed",
      ],
      default: "RMA Created",
      index: true,
    },
    timeline: [rmaTimelineSchema],
  },
  { timestamps: true }
);

const returnOrderModel =
  mongoose.models.returnOrder ||
  mongoose.model("returnOrder", returnOrderSchema);

export default returnOrderModel;
