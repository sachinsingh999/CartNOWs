import "dotenv/config";
import mongoose from "mongoose";
import productModel from "../models/productModel.js";

const locations = ["Delhi", "Mumbai", "Bangalore", "Chennai"];

const run = async () => {
  try {
    const mongoUri = `${process.env.MONGODB_URI}/cartNOW`;
    console.log("Connecting to MongoDB:", mongoUri);
    await mongoose.connect(mongoUri);
    console.log("Connected to DB successfully.");

    const products = await productModel.find({});
    console.log(`Found ${products.length} products to check/update.`);

    let updatedCount = 0;
    for (const p of products) {
      let isChanged = false;
      const updates = {};
      
      // If originalPrice is missing, 0, or invalid
      if (!p.originalPrice || p.originalPrice <= p.price) {
        updates.originalPrice = Math.round(p.price * 1.25); // ~20% discount if sold at price
        isChanged = true;
      }

      // If location is missing or empty
      if (!p.location) {
        // Randomly assign one of the 4 cities
        updates.location = locations[Math.floor(Math.random() * locations.length)];
        isChanged = true;
      }

      if (isChanged) {
        await productModel.updateOne({ _id: p._id }, { $set: updates });
        updatedCount++;
      }
    }

    console.log(`Successfully updated ${updatedCount} products with originalPrice and location fields via updateOne.`);
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
};

run();
