import heroAssetModel from "../models/heroAssetModel.js";
import { v2 as cloudinary } from "cloudinary";

// Categories and matching metadata templates to generate realistic commercial campaign cards
const campaignTemplates = [
  {
    category: "Fashion",
    name: "Summer Linen Campaign",
    tagline: "Breathable Silhouettes, Crafted For Sun",
    subject: "A professional fashion model posing in elegant summer linen dress, high-end clean style"
  },
  {
    category: "Fashion",
    name: "Modern Urban Trench Edit",
    tagline: "Sharp Tailoring For City Streets",
    subject: "A professional model posing in a sleek beige trench coat, modern streetwear campaign style"
  },
  {
    category: "Electronics",
    name: "Acoustic Noise-Canceling ANC",
    tagline: "Pure Sound. Infinite Focus.",
    subject: "A high-end product lifestyle showcase of premium matte-black wireless over-ear noise-canceling headphones"
  },
  {
    category: "Electronics",
    name: "Titanium Smartwatch Pro",
    tagline: "Next-Gen Fitness Under Your Sleeve",
    subject: "A sleek modern circular titanium smartwatch showcasing glowing fitness rings on screen"
  },
  {
    category: "Beauty",
    name: "Advanced Hydration Glow",
    tagline: "Radiant Skin Science. Derm Tested.",
    subject: "A luxury cosmetics serum bottle with water droplets, fresh clean hydration campaign style"
  },
  {
    category: "Beauty",
    name: "Nocturnal Restoration Elixir",
    tagline: "Midnight Skin Renewal",
    subject: "A premium night recovery cream jar closeup, luxury branding cosmetics studio lighting"
  },
  {
    category: "Accessories",
    name: "Gold Link Designer Watch",
    tagline: "Craftsmanship That Defines Time",
    subject: "A luxury designer gold link wrist watch resting on a marble stand, clean studio photography"
  },
  {
    category: "Accessories",
    name: "Polarized Sleek Aviators",
    tagline: "Bold Accents. Premium UV Protection.",
    subject: "High-end designer polarized aviator sunglasses, professional studio product shot"
  },
  {
    category: "Footwear",
    name: "Cloudfoam Running Edition",
    tagline: "Engineered Comfort For Active Runners",
    subject: "A professional athletic running sneaker levitating, clean sports footwear campaign style"
  }
];

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Generate one single hero asset campaign image and save it to the DB
export const generateAndSaveNewHeroAsset = async () => {
  try {
    const template = pickRandom(campaignTemplates);
    const fullPrompt = `${template.subject}, luxury fashion advertising campaign aesthetic, Zara and Nike marketing quality, clean studio photography, shot on Hasselblad, sharp focus, natural confidence, standing pose, on a solid pure white background, soft studio shadows, no room interiors, no background clutter, no scenery, high resolution transparent-ready image.`;

    console.log(`[Scheduler] Generating daily AI Image for campaign: ${template.name}...`);
    
    const seed = Math.floor(Math.random() * 999999);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=768&height=1024&nologo=true&seed=${seed}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch from Pollinations AI: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("[Scheduler] Uploading generated AI image buffer to Cloudinary...");
    const cloudinaryUpload = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "hero-campaigns", resource_type: "image" },
          (error, result) => {
            if (error) {
              console.error("[Scheduler] Cloudinary upload_stream error:", error);
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }
        );
        stream.write(buffer);
        stream.end();
      });
    };

    const imageUrl = await cloudinaryUpload();
    console.log(`[Scheduler] Uploaded successfully: ${imageUrl}`);

    const newAsset = new heroAssetModel({
      name: template.name,
      category: template.category,
      tagline: template.tagline,
      imageUrl,
      isActive: true
    });

    await newAsset.save();
    console.log(`[Scheduler] Saved new hero campaign asset to DB: ${template.name}`);
    return newAsset;
  } catch (error) {
    console.error("[Scheduler] Error generating daily campaign asset:", error.message);
    throw error;
  }
};

// Scheduler Runner
export const startHeroAssetScheduler = () => {
  console.log("[Scheduler] Initializing Hero Campaign Daily AI Scheduler...");

  // Check every hour if we need to generate new campaign pictures
  const CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

  const checkAndGenerate = async () => {
    try {
      // Find how many hero assets were created in the last 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const count = await heroAssetModel.countDocuments({
        createdAt: { $gte: oneDayAgo }
      });

      console.log(`[Scheduler] Hero assets generated in last 24 hours: ${count}`);

      if (count < 2) {
        const needed = 2 - count;
        console.log(`[Scheduler] Generating ${needed} new AI hero campaign images...`);
        for (let i = 0; i < needed; i++) {
          await generateAndSaveNewHeroAsset();
          // Small delay between calls to avoid overlapping streams
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    } catch (error) {
      console.error("[Scheduler] Error in checkAndGenerate loop:", error.message);
    }
  };

  // Run immediate check on start
  setTimeout(checkAndGenerate, 10000); // 10s after startup to allow DB connection to stabilize

  // Set interval for regular hourly checks
  setInterval(checkAndGenerate, CHECK_INTERVAL_MS);
};
