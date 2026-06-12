import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

import sellerModel from "../models/sellerModel.js";

async function run() {
  await mongoose.connect(`${process.env.MONGODB_URI}/cartNOW`);
  console.log("Connected to MongoDB");

  // Hash password "sachin"
  const hashedPassword = await bcrypt.hash("sachin", 10);

  // Delete existing if any
  await sellerModel.deleteMany({ email: "sachinsingh999@gmail.com" });
  await sellerModel.deleteMany({ _id: "6a2318979aa17278e2c785c4" });

  const seller = await sellerModel.create({
    _id: new mongoose.Types.ObjectId("6a2318979aa17278e2c785c4"),
    name: "sachin",
    email: "sachinsingh999@gmail.com",
    password: hashedPassword,
    phone: "1234567890",
    shopName: "Sachin Shop",
    status: "active",
    isEmailVerified: true
  });

  console.log("Seller created successfully:", seller);

  await mongoose.disconnect();
}

run().catch(console.error);
