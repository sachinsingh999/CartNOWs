import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: false,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    recipientRole: {
      type: String,
      enum: ["user", "seller", "deliveryman"],
      default: "user",
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.notification || mongoose.model("notification", notificationSchema);
