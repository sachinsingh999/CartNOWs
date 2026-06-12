import mongoose from "mongoose";
import dotenv from "dotenv";
import categoryModel from "../models/categoryModel.js";
import categoryTemplateModel from "../models/categoryTemplateModel.js";
import categoryAttributeModel from "../models/categoryAttributeModel.js";
import categoryAttributeOptionModel from "../models/categoryAttributeOptionModel.js";

dotenv.config();

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
};

const runMigration = async () => {
  try {
    const dbUri = `${process.env.MONGODB_URI}/cartNOW`;
    console.log("Connecting to database:", dbUri);
    await mongoose.connect(dbUri);
    console.log("DB Connected for migration");

    // 1. Slugify categories
    console.log("Slugifying existing categories...");
    const categories = await categoryModel.find({});
    for (const cat of categories) {
      if (!cat.slug) {
        cat.slug = slugify(cat.name);
        await cat.save();
        console.log(`Updated category: ${cat.name} -> slug: ${cat.slug}`);
      }
    }

    // 2. Migrate categoryTemplate to categoryAttribute & options
    console.log("Migrating categoryTemplate fields...");
    const templates = await categoryTemplateModel.find({});
    console.log(`Found ${templates.length} old template fields.`);

    for (const tmpl of templates) {
      // Check if already migrated
      const existingAttr = await categoryAttributeModel.findOne({
        categoryId: tmpl.categoryId,
        fieldName: tmpl.fieldName
      });

      if (existingAttr) {
        console.log(`Attribute "${tmpl.fieldName}" already exists for category ID ${tmpl.categoryId}, skipping.`);
        continue;
      }

      // Create new attribute
      const newAttr = await categoryAttributeModel.create({
        categoryId: tmpl.categoryId,
        fieldName: tmpl.fieldName,
        label: tmpl.fieldName, // Default label to fieldName
        placeholder: `Enter ${tmpl.fieldName}...`,
        description: "",
        helpText: "",
        fieldType: tmpl.fieldType,
        isRequired: tmpl.isRequired || false,
        isSearchable: true,
        isFilterable: true,
        isSortable: false,
        visibleOnListing: true,
        visibleOnSearch: true,
        visibleOnSellerForm: true,
        visibleOnAdminForm: true,
        defaultValue: tmpl.defaultValue || "",
        validationRules: {
          minVal: tmpl.validationRules?.min,
          maxVal: tmpl.validationRules?.max,
          regexPattern: tmpl.validationRules?.pattern,
          customErrorMessage: tmpl.validationRules?.customErrorMessage
        },
        displayOrder: tmpl.displayOrder || 0
      });

      console.log(`Migrated attribute: ${tmpl.fieldName} for category ID ${tmpl.categoryId}`);

      // Create options if dropdown/multi-select etc.
      if (
        ["Dropdown", "Multi Select", "Radio Button", "Checkbox", "Size"].includes(tmpl.fieldType) &&
        tmpl.selectOptions &&
        tmpl.selectOptions.length > 0
      ) {
        console.log(`Creating ${tmpl.selectOptions.length} options for attribute ${tmpl.fieldName}`);
        for (let i = 0; i < tmpl.selectOptions.length; i++) {
          const optVal = tmpl.selectOptions[i];
          try {
            await categoryAttributeOptionModel.create({
              attributeId: newAttr._id,
              label: optVal,
              value: optVal,
              displayOrder: i,
              status: "active"
            });
          } catch (optErr) {
            console.error(`Error creating option ${optVal}:`, optErr.message);
          }
        }
      }
    }

    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

runMigration();
