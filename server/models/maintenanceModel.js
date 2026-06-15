import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    title: { type: String, default: "CartNOW is Under Maintenance" },
    message: { type: String, default: "We are improving our services. Please check back shortly." },
    estimatedReturn: { type: Date, default: null },
    bannerImage: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    whitelistIps: { type: [String], default: [] },
    updatedBy: { type: String, default: "" }
  },
  { timestamps: true }
);

const maintenanceModel = mongoose.models.maintenance || mongoose.model("maintenance", maintenanceSchema);
export default maintenanceModel;
