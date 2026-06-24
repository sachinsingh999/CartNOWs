import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const connectDb = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/cartNOW`);
    console.log("DB Connected for clearing...");
    
    // Define temporary schema to drop collection contents safely
    const productSchema = new mongoose.Schema({}, { strict: false });
    const Product = mongoose.models.product || mongoose.model("product", productSchema);
    
    const result = await Product.deleteMany({});
    console.log("Products cleared successfully:", result);
    
  } catch (error) {
    console.error("Error clearing database:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("DB Disconnected.");
  }
};

connectDb();
