import mongoose from "mongoose";
import "dotenv/config";
import orderModel from "../models/orderModel.js";
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
  console.log("Seller ID:", seller._id);

  const products = await productModel.find({ sellerId: seller._id });
  console.log("Seller products count:", products.length);
  products.forEach(p => {
    console.log(`Product: ${p.name} (_id: ${p._id}), Reviews count: ${p.reviews?.length || 0}`);
    if (p.reviews && p.reviews.length > 0) {
      console.log("Reviews:", p.reviews);
    }
  });

  const allOrders = await orderModel.find({});
  const sellerOrders = allOrders.filter(o => 
    o.items.some(item => {
      const itemId = item.productId || item._id;
      return itemId && products.some(p => p._id.toString() === itemId.toString());
    })
  );

  console.log("Seller orders count:", sellerOrders.length);
  sellerOrders.forEach(o => {
    console.log(`Order ID: ${o._id}, Status: ${o.orderStatus}`);
    o.items.forEach(item => {
      const itemId = item.productId || item._id;
      const match = products.find(p => p._id.toString() === itemId?.toString());
      console.log(`  Item: ${item.name}, Seller Owns: ${!!match}`);
    });
  });

  await mongoose.disconnect();
}

run().catch(console.error);
