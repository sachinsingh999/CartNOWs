import { v2 as cloudinary } from "cloudinary";
import tempUploadModel from "../models/tempUploadModel.js";
import { runFullCleanup, getCloudinaryStorageMetrics } from "../services/cloudinaryCleanupService.js";
import fs from "fs";
import path from "path";

// @desc    Upload temporary image to Cloudinary (expires in 24 hours)
// @route   POST /api/system/upload-temp
// @access  Admin
export const uploadTempImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload an image file" });
    }

    // Verify format (PNG/WebP/JPEG)
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    const allowedExts = [".png", ".jpg", ".jpeg", ".webp"];
    if (!allowedExts.includes(fileExt)) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.log("Failed to delete temp file:", err.message);
      });
      return res.status(400).json({ success: false, message: "Allowed image formats: PNG, JPG, JPEG, WebP" });
    }

    let result;
    try {
      console.log("[Cloudinary Temp] Uploading to temp folder...");
      result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "image",
        folder: "cartnow/temp"
      });
      fs.unlink(req.file.path, (err) => {
        if (err) console.log("Failed to delete local temp file:", err.message);
      });
    } catch (cloudinaryError) {
      console.error("[Cloudinary Temp] Upload failed:", cloudinaryError.message);
      return res.status(500).json({ success: false, message: "Cloudinary upload failed: " + cloudinaryError.message });
    }

    // Expiration date (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const tempUpload = new tempUploadModel({
      publicId: result.public_id,
      imageUrl: result.secure_url,
      folder: "cartnow/temp",
      expiresAt,
      isActive: false
    });

    await tempUpload.save();

    res.status(201).json({
      success: true,
      message: "Temporary image uploaded successfully (valid for 24h)",
      imageUrl: result.secure_url,
      publicId: result.public_id,
      temp: tempUpload
    });

  } catch (error) {
    console.error("[Cloudinary Temp] Upload error:", error);
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.log("Failed to delete temp file:", err.message);
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Cloudinary storage usage stats and database cleanup metrics
// @route   GET /api/system/cloudinary-stats
// @access  Admin
export const getCloudinaryStats = async (req, res) => {
  try {
    const stats = await getCloudinaryStorageMetrics();
    res.json({ success: true, stats });
  } catch (error) {
    console.error("[Cloudinary Stats] Controller error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Manually trigger Cloudinary expiration cleanup
// @route   POST /api/system/trigger-cleanup
// @access  Admin
export const triggerManualCleanup = async (req, res) => {
  try {
    await runFullCleanup();
    res.json({ success: true, message: "Manual Cloudinary storage cleanup executed successfully!" });
  } catch (error) {
    console.error("[Cloudinary Cleanup] Trigger error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
