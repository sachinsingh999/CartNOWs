import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null },
    actorRole: { type: String, default: "" }, // 'seller', 'user', 'moderator', etc.
    action: { type: String, required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, default: null },
    targetType: { type: String, default: "" }, // 'product', 'category', etc.
    details: { type: String, default: "" }
  },
  { timestamps: true, collection: "activity_logs" }
);

const activityLogModel =
  mongoose.models.activityLog ||
  mongoose.model("activityLog", activityLogSchema);

export default activityLogModel;
