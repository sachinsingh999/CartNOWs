import mongoose from "mongoose";

const idempotencySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
    },
    response: {
      type: Object,
      default: null,
    },
    statusCode: {
      type: Number,
      default: 200,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400, // 24-hour TTL
    },
  },
  { timestamps: true }
);

export default mongoose.model("idempotencyKey", idempotencySchema);
