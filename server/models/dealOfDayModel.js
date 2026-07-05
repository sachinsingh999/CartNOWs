import mongoose from "mongoose";

const dealOfDaySchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
    modelImage: { type: String, required: false }, // Professional model image URL
    title: { type: String, required: true, trim: true }, // Promotional Heading
    subtitle: { type: String, default: "", trim: true }, // Promotional Description
    discountLabel: { type: String, default: "", trim: true }, // Discount Badge (e.g. "40% OFF")
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    publicId: { type: String, default: "" },
    folder: { type: String, default: "cartnow/deals" },
    expiresAt: { type: Date, default: null },
    createdBy: { type: String, default: "Admin" }
  },
  { timestamps: true, collection: "deals_of_day" }
);

const dealOfDayModel = mongoose.models.dealOfDay || mongoose.model("dealOfDay", dealOfDaySchema);
export default dealOfDayModel;
