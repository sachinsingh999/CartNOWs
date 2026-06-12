import mongoose from "mongoose";

const categoryTemplateSchema = new mongoose.Schema(
  {
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "category", required: true },
    fieldName: { type: String, required: true },
    fieldType: {
      type: String,
      required: true,
      enum: [
        "Text",
        "Number",
        "Decimal",
        "Dropdown",
        "Multi Select",
        "Radio Button",
        "Checkbox",
        "Date",
        "Color",
        "Size",
        "File Upload",
        "Image Upload"
      ]
    },
    isRequired: { type: Boolean, default: false },
    validationRules: {
      min: { type: Number },
      max: { type: Number },
      pattern: { type: String },
      customErrorMessage: { type: String }
    },
    selectOptions: { type: [String], default: [] },
    defaultValue: { type: String, default: "" },
    displayOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const categoryTemplateModel =
  mongoose.models.categoryTemplate ||
  mongoose.model("categoryTemplate", categoryTemplateSchema);

export default categoryTemplateModel;
