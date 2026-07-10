import mongoose from "mongoose";

const postLikeSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure a user can only like a post once
postLikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

export default mongoose.models.postLike || mongoose.model("postLike", postLikeSchema);
