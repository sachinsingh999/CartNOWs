import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    type: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },
    mediaUrl: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      default: "",
    },
    hashtags: {
      type: [String],
      default: [],
    },
    taggedProducts: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },
        x: {
          type: Number, // Percentage coordinate from left (0 - 100)
          required: true,
        },
        y: {
          type: Number, // Percentage coordinate from top (0 - 100)
          required: true,
        },
        isVerified: {
          type: Boolean,
          default: false,
        },
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });

export default mongoose.models.post || mongoose.model("post", postSchema);
