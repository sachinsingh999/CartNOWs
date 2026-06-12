import mongoose from "mongoose";
import { validateEmail, validatePhone } from "../utils/validation.js";

const deliverymanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (v) => validateEmail(v).isValid,
        message: "Invalid email format"
      }
    },
    password: { type: String, required: true },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: (v) => validatePhone(v).isValid,
        message: "Phone number must be exactly 10 digits"
      }
    },
    status: { type: String, enum: ["pending", "active", "inactive", "suspended"], default: "pending" },
    availabilityStatus: { type: String, enum: ["Available", "Busy", "Offline", "Suspended"], default: "Available" },
    isOnline: { type: Boolean, default: true },
    profilePhoto: { type: String, default: "" },
    vehicleType: { type: String, default: "Bike" },
    assignedAreas: { type: [String], default: [] },
    deliveryLat: { type: Number, default: 22.3072 },
    deliveryLng: { type: Number, default: 73.1812 },
    deliveryRadius: { type: Number, default: 10 }, // in km
    activeDeliveries: { type: Number, default: 0 },
    totalDeliveries: { type: Number, default: 0 },
    rating: { type: Number, default: 5 },
    earnings: { type: Number, default: 0 },
    completedDeliveries: { type: Number, default: 0 },
    failedDeliveries: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.deliveryman || mongoose.model("deliveryman", deliverymanSchema);
