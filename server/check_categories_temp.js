import mongoose from "mongoose";
import "dotenv/config";
import productModel from "../../../../server/models/productModel.js";

const uri = process.env.MONGODB_URI;

async function check() {
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
  
  const products = await productModel.find({ isDeleted: { $ne: true } });
  console.log("Active products count:", products.length);
  
  const categories = {};
  products.forEach(p => {
    const cat = p.category;
    const subCat = p.subCategory;
    if (!categories[cat]) {
      categories[cat] = new Set();
    }
    if (subCat) {
      categories[cat].add(subCat);
    }
  });

  console.log("\nCategories & SubCategories Mapping:");
  for (const cat of Object.keys(categories)) {
    console.log(`- Category: "${cat}"`);
    for (const sub of categories[cat]) {
      console.log(`  * SubCategory: "${sub}"`);
    }
  }

  await mongoose.disconnect();
}

check().catch(console.error);
