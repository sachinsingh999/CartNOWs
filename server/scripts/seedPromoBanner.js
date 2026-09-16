import mongoose from "mongoose";
import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import fs from "fs";
import promoBannerModel from "../models/promoBannerModel.js";

const uri = process.env.MONGODB_URI;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY
});

async function seedPromoBanner() {
  if (!uri) {
    console.error("MONGODB_URI missing in .env");
    process.exit(1);
  }

  const dbUri = uri.endsWith("/cartNOW") ? uri : `${uri.replace(/\/$/, "")}/cartNOW`;
  await mongoose.connect(dbUri);
  console.log("Connected to MongoDB cartNOW database for promo banner seed.");

  const existingCount = await promoBannerModel.countDocuments();
  if (existingCount > 0) {
    console.log(`Promo banners already exist (${existingCount} found). Skipping seed.`);
    await mongoose.disconnect();
    return;
  }

  const localImagePath = path.resolve(process.cwd(), "../client/src/assets/tech_promo_banner.png");
  let imageUrl = "/assets/tech_promo_banner.png";
  let publicId = "";

  if (fs.existsSync(localImagePath)) {
    try {
      console.log("Uploading initial promo banner asset to Cloudinary...");
      const result = await cloudinary.uploader.upload(localImagePath, {
        resource_type: "image",
        folder: "cartnow/banners"
      });
      imageUrl = result.secure_url;
      publicId = result.public_id;
      console.log("Uploaded successfully:", imageUrl);
    } catch (err) {
      console.warn("Cloudinary upload failed, using local asset path fallback:", err.message);
    }
  }

  const initialBanner = new promoBannerModel({
    title: "Upgrade Your Digital Life",
    subtitle: "Top brands. Latest gadgets. Great prices.",
    tagline: "TECH FOR A BETTER TOMORROW",
    discountTag: "UP TO 50% OFF",
    ctaText: "Shop Electronics",
    linkUrl: "/product?category=electronics",
    imageUrl,
    publicId,
    isActive: true,
    order: 0
  });

  await initialBanner.save();
  console.log("Default Tech Ad Banner seeded successfully with ID:", initialBanner._id);

  await mongoose.disconnect();
}

seedPromoBanner().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
