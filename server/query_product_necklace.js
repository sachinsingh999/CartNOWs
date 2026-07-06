import mongoose from "mongoose";
import "dotenv/config";

const run = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/cartNOW`);
    console.log("DB Connected");
    
    const db = mongoose.connection.db;
    const productsCollection = db.collection("products");
    
    const product = await productsCollection.findOne({ name: /Elegant Gold Plated Necklace/i });
    console.log("Product:", JSON.stringify(product, null, 2));
    
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
};

run();
