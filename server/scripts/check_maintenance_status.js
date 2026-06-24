import "dotenv/config";
import mongoose from "mongoose";
import maintenanceModel from "../models/maintenanceModel.js";

const check = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/cartNOW`);
    console.log("Connected to DB!");
    const settings = await maintenanceModel.findOne({});
    console.log("MAINTENANCE_SETTINGS_RESULT:", JSON.stringify(settings));
    await mongoose.disconnect();
  } catch (err) {
    console.error("Diagnostic error:", err);
  }
};
check();
