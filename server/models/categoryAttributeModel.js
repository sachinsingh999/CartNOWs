import mongoose from "mongoose";

const categoryAttributeSchema = new mongoose.Schema(
  {
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "category", required: true },
    fieldName: { type: String, required: true },
    label: { type: String, required: true },
    placeholder: { type: String, default: "" },
    description: { type: String, default: "" },
    helpText: { type: String, default: "" },
    fieldType: {
      type: String,
      required: true,
      enum: [
        "Text",
        "Text Area",
        "Number",
        "Decimal",
        "Dropdown",
        "Multi Select",
        "Checkbox",
        "Radio Button",
        "Date",
        "Time",
        "Datetime",
        "Email",
        "URL",
        "Phone",
        "Pincode",
        "Rich Text Editor",
        "Image Upload",
        "Multiple Image Upload",
        "Video Upload",
        "File Upload",
        "Location Picker",
        "Color Picker",
        "Tags Input"
      ]
    },
    isRequired: { type: Boolean, default: false },
    isSearchable: { type: Boolean, default: false },
    isFilterable: { type: Boolean, default: false },
    isSortable: { type: Boolean, default: false },
    visibleOnListing: { type: Boolean, default: true },
    visibleOnSearch: { type: Boolean, default: true },
    visibleOnSellerForm: { type: Boolean, default: true },
    visibleOnAdminForm: { type: Boolean, default: true },
    defaultValue: { type: String, default: "" },
    validationRules: {
      minLength: { type: Number },
      maxLength: { type: Number },
      regexPattern: { type: String },
      minVal: { type: Number },
      maxVal: { type: Number },
      minDate: { type: Date },
      maxDate: { type: Date },
      maxFileSizeMB: { type: Number },
      allowedFileTypes: { type: [String], default: [] },
      maxImagesCount: { type: Number },
      customErrorMessage: { type: String }
    },
    conditionalRules: {
      dependsOn: { type: String, default: "" }, // Field name it depends on
      expectedValue: { type: String, default: "" }, // Expected value to trigger visibility
      action: { type: String, enum: ["show", "hide", "disable", "require"], default: "show" }
    },
    displayOrder: { type: Number, default: 0 }
  },
  { timestamps: true, collection: "category_attributes" }
);

// Compound index to ensure fieldName is unique per category
categoryAttributeSchema.index({ categoryId: 1, fieldName: 1 }, { unique: true });

const categoryAttributeModel =
  mongoose.models.categoryAttribute ||
  mongoose.model("categoryAttribute", categoryAttributeSchema);

export default categoryAttributeModel;
