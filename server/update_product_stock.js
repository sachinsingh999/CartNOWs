import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = `${process.env.MONGODB_URI}/cartNOW`;

async function updateStock() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri);
    console.log("Connected successfully.");

    const db = mongoose.connection.db;
    const productsColl = db.collection('products');
    
    // Find the product
    const product = await productsColl.findOne({ name: "Women's Ribbed Crop Top" });
    if (!product) {
      console.log("Product not found.");
      return;
    }

    console.log(`Current parent stock: ${product.stock}`);

    // Update variants to have 10 stock each, and sum them up for the parent stock
    const updatedVariants = product.variants.map(v => ({
      ...v,
      stock: 10
    }));

    const newParentStock = updatedVariants.length * 10; // 20 variants * 10 = 200

    const result = await productsColl.updateOne(
      { _id: product._id },
      { 
        $set: { 
          variants: updatedVariants,
          stock: newParentStock
        } 
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`✅ Success! Updated ${updatedVariants.length} variants to 10 stock each. Parent stock is now ${newParentStock}.`);
    } else {
      console.log("❌ Failed to update product stock.");
    }
  } catch (error) {
    console.error("Update error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

updateStock();
