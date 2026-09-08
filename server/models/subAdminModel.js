import mongoose from "mongoose";

const subAdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    plainPassword: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["subadmin", "admin"],
      default: "subadmin",
    },
    permissions: {
      type: [String],
      default: ["orders", "products"],
      enum: [
        "orders",
        "products",
        "returns",
        "deliverymen",
        "sellers",
        "customers",
        "support",
        "promos",
        "finance",
        "subadmins",
      ],
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
    createdBy: {
      type: String,
      default: "Superadmin",
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const subAdminModel = mongoose.models.subAdmin || mongoose.model("subAdmin", subAdminSchema);

export default subAdminModel;
