import mongoose from "mongoose";
import "dotenv/config";
import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import sellerModel from "../models/sellerModel.js";

const uri = process.env.MONGODB_URI;

async function run() {
  if (!uri) {
    console.error("❌ MONGODB_URI environment variable is missing in .env");
    process.exit(1);
  }

  const targetEmail = process.argv[2] || process.env.SELLER_EMAIL || "sachinsingh999@gmail.com";

  try {
    const dbUri = uri.includes("cartNOW") ? uri : `${uri.replace(/\/$/, "")}/cartNOW`;
    await mongoose.connect(dbUri);
    console.log("✅ Connected to MongoDB");

    const seller = await sellerModel.findOne({ email: targetEmail });
    if (!seller) {
      console.log(`⚠️ Seller with email "${targetEmail}" not found.`);
      return;
    }
    console.log(`📋 Seller (${seller.name || targetEmail}) ID:`, seller._id);

    const products = await productModel.find({ sellerId: seller._id });
    console.log(`📦 Seller products count: ${products.length}`);
    products.forEach((p) => {
      console.log(`- Product: ${p.name} (_id: ${p._id}), Reviews: ${p.reviews?.length || 0}`);
    });

    const allOrders = await orderModel.find({});
    const sellerOrders = allOrders.filter((o) =>
      o.items.some((item) => {
        const itemId = item.productId || item._id;
        return itemId && products.some((p) => p._id.toString() === itemId.toString());
      })
    );

    console.log(`🛒 Seller orders count: ${sellerOrders.length}`);
    sellerOrders.forEach((o) => {
      console.log(`- Order ID: ${o._id}, Status: ${o.orderStatus}`);
      o.items.forEach((item) => {
        const itemId = item.productId || item._id;
        const match = products.find((p) => p._id.toString() === itemId?.toString());
        console.log(`  ↳ Item: ${item.name || item.productName || "Item"}, Seller Owns: ${!!match}`);
      });
    });
  } catch (err) {
    console.error("❌ Error inspecting seller orders:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

run();
