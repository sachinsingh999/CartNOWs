import mongoose from "mongoose";

const deliveryAssignmentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
      required: true
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "deliveryman",
      required: true
    },
    status: {
      type: String,
      enum: ["Assigned", "Accepted", "Rejected", "Picked Up", "Out for Delivery", "Delivered", "Failed Delivery", "Cancelled"],
      default: "Assigned"
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    acceptedAt: {
      type: Date,
      default: null
    },
    deliveredAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.models.deliveryAssignment || mongoose.model("deliveryAssignment", deliveryAssignmentSchema);
