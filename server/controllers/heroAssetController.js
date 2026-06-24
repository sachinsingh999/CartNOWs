import heroAssetModel from "../models/heroAssetModel.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { Client } from "@gradio/client";

// @desc    Get all active hero slideshow assets
// @route   GET /api/system/hero-assets
// @access  Public
export const getHeroAssets = async (req, res) => {
  try {
    const { admin } = req.query;
    const filter = admin === "true" ? {} : { isActive: true };
    const assets = await heroAssetModel.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, assets });
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

    try {
      console.log("Uploading hero asset to Cloudinary...");
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "image",
      });
      // Delete local file after successful upload to Cloudinary
      fs.unlink(req.file.path, (err) => {
        if (err) console.log("Failed to delete local temp file:", err.message);
      });
      imageUrl = result.secure_url;
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
      isActive: true
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

// Helper function to remove background using BiRefNet (Matting-HR model for professional cutout quality)
const removeBackgroundBiRefNet = async (imageUrl) => {
  try {
    console.log(`Connecting to ZhengPeng7/BiRefNet_demo for high-quality background removal...`);
    const client = await Client.connect("ZhengPeng7/BiRefNet_demo");
    console.log(`Sending image URL to BiRefNet: ${imageUrl}`);
    const result = await client.predict("/URL", {
      images: imageUrl,
      resolution: "1024x1024",
      weights_file: "Matting-HR" // Matting-HR is optimal for hair, lace, transparent fabrics, and luxury cutouts
    });
    
    if (result?.data && result.data[0] && result.data[0][1]) {
      const predictionUrl = result.data[0][1].url;
      console.log(`Background removed successfully. Transparent image URL: ${predictionUrl}`);
      return predictionUrl;
    } else {
      throw new Error("Invalid response format from BiRefNet Space");
    }
  } catch (error) {
    console.error("BiRefNet background removal failed:", error.message);
    throw error;
  }
};

// @desc    Remove background of uploaded image using BiRefNet AI
// @route   POST /api/system/hero-assets/remove-bg
// @access  Admin
export const removeHeroAssetBackground = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload an image file" });
    }

    let rawImageUrl = "";
    // Upload local file to Cloudinary first
    try {
      console.log("Uploading raw user image to Cloudinary...");
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "image",
      });
      // Delete local file
      fs.unlink(req.file.path, (err) => {
        if (err) console.log("Failed to delete local temp file:", err.message);
      });
      rawImageUrl = result.secure_url;
    } catch (uploadError) {
      // Clean up file if Cloudinary upload fails
      fs.unlink(req.file.path, (err) => {
        if (err) console.log("Failed to delete local temp file:", err.message);
      });
      return res.status(500).json({ success: false, message: "Cloudinary upload failed: " + uploadError.message });
    }

    console.log("Applying high-quality BiRefNet background removal on uploaded file...");
    const transparentUrl = await removeBackgroundBiRefNet(rawImageUrl);

    // Download transparent image and upload it to Cloudinary
    const transparentResponse = await fetch(transparentUrl);
    if (!transparentResponse.ok) {
      throw new Error(`Failed to fetch transparent image from BiRefNet: ${transparentResponse.statusText}`);
    }

    const arrayBuffer = await transparentResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("Uploading transparent user image to Cloudinary...");
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
        stream.write(buffer);
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
      } catch (cloudinaryError) {
        console.log("Cloudinary replacement upload failed, falling back to local:", cloudinaryError.message);
        imageUrl = `/uploads/${req.file.filename}`;
      }
    }

    const updatedData = {
      name: name !== undefined ? name : asset.name,
      category: category !== undefined ? category : asset.category,
      tagline: tagline !== undefined ? tagline : asset.tagline,
      imageUrl,
      isActive: isActive !== undefined ? (isActive === "true" || isActive === true) : asset.isActive
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
