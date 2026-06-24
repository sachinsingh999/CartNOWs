import mongoose from "mongoose";
import "dotenv/config";
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import collectionModel from "../models/collectionModel.js";
import brandModel from "../models/brandModel.js";

const uri = process.env.MONGODB_URI;

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

const iconMap = {
  electronics: "smartphone",
  fashion: "shirt",
  beauty: "sparkles",
  sports: "gamepad2",
  books: "bookopen",
  furniture: "home"
};

async function seed() {
  if (!uri) {
    console.error("MONGODB_URI is not defined in your environment variables.");
    process.exit(1);
  }

  await mongoose.connect(uri, { dbName: "cartNOW" });
  console.log("Connected to MongoDB for taxonomy seeding...");

  // Fetch all active products
  const products = await productModel.find({ isDeleted: { $ne: true } });
  console.log(`Found ${products.length} products to analyze.`);

  const categories = {};
  const collectionsSet = new Set();
  const brandsSet = new Set();

  products.forEach(p => {
    // Collect Category & Subcategory
    if (p.category) {
      const cat = p.category.trim();
      if (!categories[cat]) {
        categories[cat] = new Set();
      }
      if (p.subCategory) {
        categories[cat].add(p.subCategory.trim());
      }
    }

    // Collect Collections
    if (p.collection) {
      collectionsSet.add(p.collection.trim());
    }
    if (p.collections && Array.isArray(p.collections)) {
      p.collections.forEach(col => collectionsSet.add(col.trim()));
    }

    // Collect Brands
    if (p.brand) {
      brandsSet.add(p.brand.trim());
    }
  });

  // 1. Seed Categories
  console.log("\n--- Seeding Categories ---");
  for (const catName of Object.keys(categories)) {
    const slug = slugify(catName);
    const existing = await categoryModel.findOne({ name: new RegExp(`^${catName}$`, "i") });
    if (!existing) {
      const icon = iconMap[catName.toLowerCase()] || "layers";
      await categoryModel.create({
        name: catName,
        slug: slug,
        subcategories: Array.from(categories[catName]),
        description: `Premium selection of ${catName} products on CartNOW.`,
        icon: icon,
        status: "active",
        isFeatured: true
      });
      console.log(`Created Category: "${catName}" with icon: "${icon}"`);
    } else {
      // Merge subcategories
      let updated = false;
      for (const sub of categories[catName]) {
        if (!existing.subcategories.includes(sub)) {
          existing.subcategories.push(sub);
          updated = true;
        }
      }
      if (existing.status !== "active") {
        existing.status = "active";
        updated = true;
      }
      if (updated) {
        await existing.save();
        console.log(`Updated existing Category: "${catName}"`);
      }
    }
  }

  // 2. Seed Collections
  console.log("\n--- Seeding Collections ---");
  for (const colName of collectionsSet) {
    if (!colName) continue;
    const slug = slugify(colName);
    const existing = await collectionModel.findOne({ name: new RegExp(`^${colName}$`, "i") });
    if (!existing) {
      await collectionModel.create({
        name: colName,
        slug: slug,
        description: `${colName} custom collection of hot-trending items.`,
        status: "active"
      });
      console.log(`Created Collection: "${colName}"`);
    } else if (existing.status !== "active") {
      existing.status = "active";
      await existing.save();
      console.log(`Activated existing Collection: "${colName}"`);
    }
  }

  // 3. Seed Brands
  console.log("\n--- Seeding Brands ---");
  for (const brandName of brandsSet) {
    if (!brandName) continue;
    const slug = slugify(brandName);
    const existing = await brandModel.findOne({ name: new RegExp(`^${brandName}$`, "i") });
    if (!existing) {
      await brandModel.create({
        name: brandName,
        slug: slug,
        logo: "",
        banner: "",
        status: "active"
      });
      console.log(`Created Brand: "${brandName}"`);
    } else if (existing.status !== "active") {
      existing.status = "active";
      await existing.save();
      console.log(`Activated existing Brand: "${brandName}"`);
    }
  }

  console.log("\nTaxonomy seeding completed successfully!");
  await mongoose.disconnect();
}

seed().catch(console.error);
