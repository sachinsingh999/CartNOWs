import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Product from "../models/productModel.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const runMigration = async () => {
  try {
    const dbUri = `${process.env.MONGODB_URI}/cartNOW`;
    console.log("Connecting to database:", dbUri);
    await mongoose.connect(dbUri);
    console.log("DB Connected successfully.");

    const products = await Product.find({});
    console.log(`Found ${products.length} products to check/migrate.`);

    let updatedCount = 0;

    for (const product of products) {
      let isModified = false;
      let newAttributes = [];

      const currentAttributes = product.attributes;

      if (Array.isArray(currentAttributes)) {
        // If it's already an array, check and add displayType to items if missing
        newAttributes = currentAttributes.map(attr => {
          if (attr && typeof attr === "object") {
            const name = attr.name || "Unknown";
            let displayType = attr.displayType;

            if (!displayType) {
              const lowerName = name.trim().toLowerCase();
              if (["color", "size", "ram", "storage", "length", "capacity"].includes(lowerName)) {
                displayType = "variant";
              } else {
                displayType = "specification";
              }
              isModified = true;
            }

            return {
              ...attr,
              displayType
            };
          }
          return attr;
        });
      } else if (currentAttributes && typeof currentAttributes === "object" && Object.keys(currentAttributes).length > 0) {
        // If it's a flat object (legacy), convert to structured array format with displayType
        Object.entries(currentAttributes).forEach(([name, val]) => {
          const lowerName = name.trim().toLowerCase();
          let displayType = "specification";
          
          if (["color", "size", "ram", "storage", "length", "capacity"].includes(lowerName)) {
            displayType = "variant";
          }

          let value = "";
          let values = [];
          let inputType = "Text";

          if (displayType === "variant") {
            if (Array.isArray(val)) {
              values = val.map(v => String(v).trim()).filter(Boolean);
            } else if (typeof val === "string" && val) {
              values = val.split(",").map(v => v.trim()).filter(Boolean);
            } else {
              values = [String(val).trim()];
            }
            value = values[0] || "";
            inputType = lowerName === "color" ? "Color Picker" : "Dropdown";
          } else {
            value = Array.isArray(val) ? val.join(", ") : String(val);
            values = [];
            inputType = "Text";
          }

          newAttributes.push({
            name: name.trim(),
            displayType,
            inputType,
            value,
            values
          });
        });
        isModified = true;
      }

      if (isModified) {
        product.attributes = newAttributes;
        // Mark attributes modified if mongoose needs it (it's Mixed type)
        product.markModified("attributes");
        await product.save({ validateBeforeSave: false }); // bypass validation to save cleanly
        console.log(`Updated attributes for product ID: ${product._id} (${product.name})`);
        updatedCount++;
      }
    }

    console.log(`Migration complete. Updated ${updatedCount} products.`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("DB Disconnected.");
  }
};

runMigration();
