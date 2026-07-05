import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
      required: true,
      unique: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    deliverymanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "deliveryman",
      default: null,
    },
    sellerIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "seller",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.chatRoom || mongoose.model("chatRoom", chatRoomSchema);
