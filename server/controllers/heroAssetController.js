import heroAssetModel from "../models/heroAssetModel.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

// @desc    Get all active hero slideshow assets
// @route   GET /api/system/hero-assets
// @access  Public
export const getHeroAssets = async (req, res) => {
  try {
    const { admin } = req.query;

    // Ensure all existing hero assets have expiresAt cleared so they never auto-expire
    await heroAssetModel.updateMany(
      { expiresAt: { $ne: null } },
      { $set: { expiresAt: null } }
    );

    const filter = admin === "true" ? {} : { isActive: true };

    const rawAssets = await heroAssetModel.find(filter).lean();
    rawAssets.sort((a, b) => {
      const orderA = a.order ?? 0;
      const orderB = b.order ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    res.json({ success: true, assets: rawAssets });
  } catch (error) {
    console.error("Error fetching hero assets:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add new hero slideshow asset
// @route   POST /api/system/hero-assets
// @access  Admin
export const addHeroAsset = async (req, res) => {
  try {
    const { name, category, tagline } = req.body;

    if (!name || !category) {
      // Clean up file if it was uploaded
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.log("Failed to delete temp file:", err.message);
        });
      }
      return res.status(400).json({ success: false, message: "Name and Category are required" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload an image asset" });
    }

    // Verify file extension (only PNG/WebP allowed)
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    if (fileExt !== ".png" && fileExt !== ".webp") {
      fs.unlink(req.file.path, (err) => {
        if (err) console.log("Failed to delete temp file:", err.message);
      });
      return res.status(400).json({ success: false, message: "Only transparent background PNG or WebP assets are allowed" });
    }

    let imageUrl = "";
    let publicId = "";

    try {
      console.log("Uploading hero asset to Cloudinary...");
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "image",
        folder: "cartnow/banners"
      });
      // Delete local file after successful upload to Cloudinary
      fs.unlink(req.file.path, (err) => {
        if (err) console.log("Failed to delete local temp file:", err.message);
      });
      imageUrl = result.secure_url;
      publicId = result.public_id;
    } catch (cloudinaryError) {
      console.log("Cloudinary upload failed for hero asset, falling back to local storage:", cloudinaryError.message);
      // Fallback: use local served path
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const assetData = {
      name,
      category,
      tagline: tagline || "",
      imageUrl,
      isActive: true,
      publicId,
      folder: "cartnow/banners",
      expiresAt: null
    };

    const newAsset = new heroAssetModel(assetData);
    await newAsset.save();

    res.status(201).json({
      success: true,
      message: "Hero asset campaign uploaded successfully",
      asset: newAsset
    });
  } catch (error) {
    console.error("Error adding hero asset:", error);
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.log("Failed to delete temp file:", err.message);
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a hero slideshow asset
// @route   DELETE /api/system/hero-assets/:id
// @access  Admin
export const deleteHeroAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await heroAssetModel.findById(id);

    if (!asset) {
      return res.status(404).json({ success: false, message: "Hero asset not found" });
    }

    // If local file, delete from uploads folder
    if (asset.imageUrl.startsWith("/uploads/")) {
      const filename = asset.imageUrl.replace("/uploads/", "");
      const filepath = path.join(process.cwd(), "uploads", filename);
      fs.unlink(filepath, (err) => {
        if (err) console.log("Failed to delete local file on asset delete:", err.message);
      });
    }

    await heroAssetModel.findByIdAndDelete(id);

    res.json({ success: true, message: "Hero asset campaign deleted successfully" });
  } catch (error) {
    console.error("Error deleting hero asset:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate AI image for hero slideshow asset
// @route   POST /api/system/hero-assets/generate
// @access  Admin
export const generateHeroAssetImage = async (req, res) => {
  try {
    const { category, prompt } = req.body;

    let fullPrompt = "";
    if (prompt && prompt.trim()) {
      fullPrompt = prompt.trim();
    } else {
      // Fallback if no prompt is provided
      fullPrompt = `A professional commercial model showcasing ${category} campaign, luxury fashion advertising campaign aesthetic, Zara and Nike marketing quality, clean studio photography, shot on Hasselblad, sharp focus, natural confidence, standing pose, on a solid pure white background, soft studio shadows, no room interiors, no background clutter, no scenery, high resolution transparent-ready image.`;
    }

    console.log(`Starting AI Image Generation on Pollinations AI for category: ${category}${prompt ? ` with custom prompt: "${prompt}"` : ""}...`);
    
    // Call Pollinations AI
    const seed = Math.floor(Math.random() * 999999);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=768&height=1024&nologo=true&seed=${seed}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch from Pollinations AI: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("Uploading generated AI image buffer to Cloudinary...");
    // Upload buffer to Cloudinary using upload_stream
    const cloudinaryUpload = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "hero-campaigns", resource_type: "image" },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload_stream error:", error);
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
    console.log(`Successfully generated and uploaded to Cloudinary: ${imageUrl}`);

    res.json({ success: true, imageUrl, isTransparent: false });

  } catch (error) {
    console.error("AI Image Generation/Cloudinary failed:", error);
    res.status(500).json({ success: false, message: error.message, stack: error.stack });
  }
};

// Helper function to remove background using remove.bg API (using env REMOVE_BG key)
const removeBackgroundViaRemoveBg = async (localFilePath, mimetype, originalname) => {
  const removeBgApiKey = process.env.REMOVE_BG;
  if (!removeBgApiKey) {
    throw new Error("REMOVE_BG API key is not configured in .env file");
  }

  console.log(`Sending file to remove.bg API...`);
  
  const formData = new FormData();
  const fileBuffer = fs.readFileSync(localFilePath);
  const fileBlob = new Blob([fileBuffer], { type: mimetype });
  formData.append("image_file", fileBlob, originalname);
  formData.append("size", "full");

  const response = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: {
      "X-Api-Key": removeBgApiKey
    },
    body: formData
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`remove.bg API error: ${response.statusText} - ${errText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

// @desc    Remove background of uploaded image using remove.bg API
// @route   POST /api/system/hero-assets/remove-bg
// @access  Admin
export const removeHeroAssetBackground = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload an image file" });
    }

    console.log("Applying remove.bg background removal on uploaded file...");
    let transparentBuffer;
    try {
      transparentBuffer = await removeBackgroundViaRemoveBg(req.file.path, req.file.mimetype, req.file.originalname);
    } finally {
      // Clean up the local temp file immediately after processing
      fs.unlink(req.file.path, (err) => {
        if (err) console.log("Failed to delete local temp file:", err.message);
      });
    }

    console.log("Uploading transparent image from remove.bg to Cloudinary...");
    const cloudinaryUploadTransparent = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "hero-campaigns-transparent", resource_type: "image" },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload_stream error:", error);
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }
        );
        stream.write(transparentBuffer);
        stream.end();
      });
    };

    const transparentImageUrl = await cloudinaryUploadTransparent();
    console.log(`Successfully generated and uploaded transparent image to Cloudinary: ${transparentImageUrl}`);

    res.json({ success: true, imageUrl: transparentImageUrl });

  } catch (error) {
    console.error("Remove background endpoint failed:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an existing hero slideshow asset
// @route   PUT /api/system/hero-assets/:id
// @access  Admin
export const updateHeroAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, tagline, isActive } = req.body;

    const asset = await heroAssetModel.findById(id);
    if (!asset) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.log("Failed to delete temp file:", err.message);
        });
      }
      return res.status(404).json({ success: false, message: "Hero asset not found" });
    }

    let imageUrl = asset.imageUrl;
    let publicId = asset.publicId;
    if (req.file) {
      const fileExt = path.extname(req.file.originalname).toLowerCase();
      if (fileExt !== ".png" && fileExt !== ".webp") {
        fs.unlink(req.file.path, (err) => {
          if (err) console.log("Failed to delete temp file:", err.message);
        });
        return res.status(400).json({ success: false, message: "Only transparent background PNG or WebP assets are allowed" });
      }

      try {
        console.log("Uploading replacement hero asset to Cloudinary...");
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "image",
          folder: "cartnow/banners"
        });
        fs.unlink(req.file.path, (err) => {
          if (err) console.log("Failed to delete local temp file:", err.message);
        });
        if (asset.imageUrl.startsWith("/uploads/")) {
          const filename = asset.imageUrl.replace("/uploads/", "");
          const filepath = path.join(process.cwd(), "uploads", filename);
          fs.unlink(filepath, (err) => {
            if (err) console.log("Failed to delete old local file:", err.message);
          });
        }
        imageUrl = result.secure_url;
        publicId = result.public_id;
      } catch (cloudinaryError) {
        console.log("Cloudinary replacement upload failed, falling back to local:", cloudinaryError.message);
        imageUrl = `/uploads/${req.file.filename}`;
      }
    }

    const requestedActive = isActive !== undefined ? (isActive === "true" || isActive === true) : asset.isActive;

    const updatedData = {
      name: name !== undefined ? name : asset.name,
      category: category !== undefined ? category : asset.category,
      tagline: tagline !== undefined ? tagline : asset.tagline,
      imageUrl,
      isActive: requestedActive,
      expiresAt: null,
      publicId,
      folder: "cartnow/banners"
    };

    const updatedAsset = await heroAssetModel.findByIdAndUpdate(id, updatedData, { new: true });

    res.json({
      success: true,
      message: "Hero asset updated successfully",
      asset: updatedAsset
    });

  } catch (error) {
    console.error("Error updating hero asset:", error);
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.log("Failed to delete temp file:", err.message);
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reorder hero slideshow assets
// @route   PUT /api/system/hero-assets/reorder
// @access  Admin
export const reorderHeroAssets = async (req, res) => {
  try {
    const { orderIds } = req.body;
    if (!Array.isArray(orderIds)) {
      return res.status(400).json({ success: false, message: "orderIds array is required" });
    }

    const bulkOps = orderIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { order: index }
      }
    }));

    await heroAssetModel.bulkWrite(bulkOps);

    res.json({ success: true, message: "Hero assets reordered successfully" });
  } catch (error) {
    console.error("Error reordering hero assets:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate AI Title & Tagline for Hero Slideshow asset using Gemini AI / smart heuristic engine
// @route   POST /api/system/hero-assets/ai-generate-title
// @access  Admin
export const aiGenerateHeroAssetTitle = async (req, res) => {
  const { category = "Fashion", currentTitle = "", currentTagline = "" } = req.body;

  const getRuleBasedFallback = (cat) => {
    const presets = {
      "Fashion": [
        { title: "Pastel Summer Silhouette", tagline: "Effortless grace for the sun-kissed season." },
        { title: "Urban Streetwear Edge", tagline: "Contemporary aesthetic crafted for city rhythms." },
        { title: "Modern Minimalist Silhouette", tagline: "Clean lines and understated luxury." },
        { title: "Haute Couture Evening Edit", tagline: "Elevate your signature presence with timeless charm." },
        { title: "Monochrome City Nomad", tagline: "Bold tailoring meets versatile comfort." },
        { title: "Luxe Linen Resort Collection", tagline: "Breezy silhouettes tailored for effortless elegance." },
        { title: "Velvet Elegance Tailored Blazer", tagline: "Structured sophistication designed to turn heads." },
        { title: "Retro Revival Denim Ensemble", tagline: "Nostalgic vibes infused with cutting-edge streetwear." }
      ],
      "Footwear": [
        { title: "AeroGlide Runner Pro", tagline: "Next-gen responsiveness engineered for every stride." },
        { title: "Urban Street High-Tops", tagline: "Iconic court legacy refined for everyday dominance." },
        { title: "Artisan Leather Loafers", tagline: "Handcrafted sophistication and all-day comfort." },
        { title: "Velocity Sprint Sneakers", tagline: "Unleash maximum agility with cloud-light cushioning." },
        { title: "TrailForce Waterproof Boots", tagline: "Rugged durability built to conquer every terrain." }
      ],
      "Electronics": [
        { title: "Next-Gen Pro Flagship", tagline: "Uncompromised performance engineered for tomorrow." },
        { title: "Acoustic Noise-Cancelling Pro", tagline: "Studio-master sound with immersive spatial depth." },
        { title: "Ultra-Slim OLED Studio Display", tagline: "Hyper-vivid colors and cinematic clarity." },
        { title: "Smart Apex Fitness Wearable", tagline: "Precision biometrics wrapped in titanium durability." },
        { title: "HyperFast Mechanical Keyboard", tagline: "Tactile precision tuned for creators and gamers." }
      ],
      "Beauty": [
        { title: "Radiance Dew Organic Glow", tagline: "Nourish, revive, and illuminate your natural beauty." },
        { title: "Velvet Matte Luxe Pigment", tagline: "High-impact vibrant color with weightless wear." },
        { title: "Botanical Essence Elixir", tagline: "Deep cellular hydration powered by pure botanicals." },
        { title: "Celestial Shimmer Illuminator", tagline: "Catch the light from every angle with ethereal brilliance." }
      ],
      "Fitness": [
        { title: "Core Power Performance Gear", tagline: "Engineered flexibility to push past limits." },
        { title: "Ultra-Endurance Training Kit", tagline: "Breathable moisture-wicking tech for peak sweat." },
        { title: "Athletic Motion Sculpt", tagline: "Dynamic support designed for unrestricted movement." },
        { title: "Pro Compression Dynamic Leggings", tagline: "Targeted muscle stabilization for ultimate endurance." }
      ],
      "Accessories": [
        { title: "Midnight Titanium Chronograph", tagline: "Masterpiece precision for the modern connoisseur." },
        { title: "Minimalist Italian Leather Bag", tagline: "Sleek architecture tailored for daily essentials." },
        { title: "Polarized Horizon Aviators", tagline: "Timeless optics engineered with UV400 clarity." },
        { title: "Woven Silk Jacquard Scarf", tagline: "Delicate warmth and refined artisanal charm." }
      ],
      "Home & Lifestyle": [
        { title: "Scandinavian Living Harmony", tagline: "Warm minimalism designed to transform your sanctuary." },
        { title: "Artisan Ceramic & Amber Blend", tagline: "Curated warmth for modern living spaces." },
        { title: "Luxe Velvet Accent Lounger", tagline: "Ergonomic comfort meets contemporary interior art." },
        { title: "Aroma Diffuser & Essential Glow", tagline: "Create a serene spa oasis in the comfort of home." }
      ],
      "Kids Collection": [
        { title: "Little Explorer Adventure Kit", tagline: "Durable comfort ready for endless fun and play." },
        { title: "Pastel Dreams Cotton Set", tagline: "Ultra-soft hypoallergenic fabrics for sweet moments." },
        { title: "Playful Sunshine Denim Duo", tagline: "Vibrant styles built to match their joyful energy." }
      ]
    };

    const options = presets[cat] || presets["Fashion"];
    const randomChoice = options[Math.floor(Math.random() * options.length)];
    return randomChoice;
  };

  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      const fallback = getRuleBasedFallback(category);
      return res.json({ success: true, ...fallback, isFallback: true });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

    const prompt = `You are a world-class creative fashion copywriter and brand director for CartNOW.
Generate 1 stylish, catchy, high-converting Campaign Title (Asset Name / Title) and 1 concise Tagline (Subtext) for a homepage model banner in the category "${category}".
${currentTitle ? `User draft title: "${currentTitle}"` : ""}
${currentTagline ? `User draft tagline: "${currentTagline}"` : ""}

Guidelines:
- Title: 2-5 words. Punchy, modern, elegant, Zara/Nike editorial quality.
- Tagline: 5-10 words. Inspiring, benefit-driven, smooth.

Output format MUST be strictly a JSON object with NO markdown formatting, NO backticks:
{"title": "...", "tagline": "..."}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.75,
          maxOutputTokens: 250
        }
      })
    });

    if (!response.ok) {
      const fallback = getRuleBasedFallback(category);
      return res.json({ success: true, ...fallback, isFallback: true });
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    const jsonString = rawText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(jsonString);

    return res.json({
      success: true,
      title: parsed.title || getRuleBasedFallback(category).title,
      tagline: parsed.tagline || getRuleBasedFallback(category).tagline
    });
  } catch (error) {
    console.error("AI hero title generator error:", error);
    const fallback = getRuleBasedFallback(category);
    return res.json({ success: true, ...fallback, isFallback: true });
  }
};
