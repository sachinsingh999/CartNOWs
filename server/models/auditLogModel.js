import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    adminEmail: { type: String, required: true },
    action: { type: String, required: true },
    target: { type: String, default: "" },
    details: { type: String, default: "" }
  },
  { timestamps: true }
);

const auditLogModel = mongoose.models.auditLog || mongoose.model("auditLog", auditLogSchema);
export default auditLogModel;
