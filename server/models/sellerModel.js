import mongoose from "mongoose";
import { validateEmail, validatePhone } from "../utils/validation.js";

const payoutRequestSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  date: { type: Date, default: Date.now }
});

const sellerSchema = new mongoose.Schema(
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
    shopName: { type: String, required: true },
    status: { type: String, enum: ["pending", "active", "suspended"], default: "pending" },
    commissionRate: { type: Number, default: 10 }, // platform commission percentage
    revenue: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    payoutRequests: { type: [payoutRequestSchema], default: [] },
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },
    emailVerificationToken: { type: String, default: null },
    isEmailVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const sellerModel = mongoose.models.seller || mongoose.model("seller", sellerSchema);
export default sellerModel;
