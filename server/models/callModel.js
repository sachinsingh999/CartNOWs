import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
      required: true,
    },
    callerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    callerRole: {
      type: String,
      enum: ["customer", "deliveryman"],
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    receiverRole: {
      type: String,
      enum: ["customer", "deliveryman"],
      required: true,
    },
    status: {
      type: String,
      enum: ["initiated", "connected", "rejected", "missed", "no-answer", "completed", "busy", "failed"],
      default: "initiated",
    },
    type: {
      type: String,
      enum: ["audio", "video"],
      default: "audio",
    },
    duration: {
      type: Number,
      default: 0, // In seconds
    },
  },
  { timestamps: true }
);

export default mongoose.models.call || mongoose.model("call", callSchema);
