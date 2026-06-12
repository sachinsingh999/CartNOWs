import mongoose from "mongoose";
import "dotenv/config";
import productModel from "../models/productModel.js";
import sellerModel from "../models/sellerModel.js";

const uri = process.env.MONGODB_URI;

async function run() {
  await mongoose.connect(`${uri}/cartNOW`);
  console.log("Connected to MongoDB");

  const seller = await sellerModel.findOne({ email: "sachinsingh999@gmail.com" });
  if (!seller) {
    console.log("Seller not found");
    await mongoose.disconnect();
    return;
  }

  const products = await productModel.find({ sellerId: seller._id });
  console.log("Found products:", products.length);

  for (const product of products) {
    product.reviews = [
      {
        userId: new mongoose.Types.ObjectId("6a0f36e952dbb8d7694cb5d5"),
        name: "Dev Verma",
        rating: 5,
        comment: "Excellent quality and super fast dispatch!",
        reply: "Thank you for shopping with us!",
        date: new Date()
      },
      {
        userId: new mongoose.Types.ObjectId("6a0f36e952dbb8d7694cb5d5"),
        name: "Aarav Sharma",
        rating: 4,
        comment: "Very good item. Highly recommended for daily use.",
        reply: "",
        date: new Date()
      }
    ];
    await product.save({ validateBeforeSave: false });
    console.log(`Updated reviews for product: ${product.name}`);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
