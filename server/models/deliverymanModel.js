import mongoose from "mongoose";

const deliverymanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    status: { type: String, default: "pending" }, // pending, active, inactive, suspended
    isOnline: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.deliveryman || mongoose.model("deliveryman", deliverymanSchema);
