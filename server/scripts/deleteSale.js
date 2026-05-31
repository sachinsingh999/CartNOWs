import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const saleSchema = new mongoose.Schema({
  title: String,
  active: Boolean
}, { collection: "sales" });

const Sale = mongoose.models.sales || mongoose.model("sales", saleSchema);

const removeSale = async () => {
  const dbUri = process.env.MONGODB_URI;
  if (!dbUri) {
    throw new Error("MONGODB_URI is missing");
  }
  await mongoose.connect(dbUri, { dbName: "cartNOW" });
  console.log("Connected to MongoDB.");

  const result = await Sale.deleteMany({ title: "Premium Men's Heritage" });
  console.log(`Deleted matching sales count: ${result.deletedCount}`);

  // Let's also see what active sales are left in the DB:
  const activeSales = await Sale.find({});
  console.log("Current sales in DB:", activeSales);
};

removeSale()
  .catch((err) => console.error(err))
  .finally(async () => {
    await mongoose.disconnect();
    process.exit(0);
  });
