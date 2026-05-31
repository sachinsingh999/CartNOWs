import mongoose from "mongoose";

const deliverymanComplaintSchema = new mongoose.Schema(
  {
    deliverymanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "deliveryman",
      required: true,
    },
    deliverymanName: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved"],
      default: "Open",
    },
    adminRemarks: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

const deliverymanComplaintModel =
  mongoose.models.deliverymanComplaint || mongoose.model("deliverymanComplaint", deliverymanComplaintSchema);

export default deliverymanComplaintModel;
