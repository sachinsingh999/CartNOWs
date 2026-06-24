import bannerModel from "../models/bannerModel.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

// @desc    Get all active banners sorted by displayOrder
// @route   GET /api/banners
// @access  Public
export const getBanners = async (req, res) => {
  try {
    const { admin } = req.query;
    const filter = admin === "true" ? {} : { isActive: true };
    const banners = await bannerModel.find(filter).sort({ displayOrder: 1, createdAt: -1 });
    res.json({ success: true, banners });
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new hero banner
// @route   POST /api/admin/banners
// @access  Admin
export const createBanner = async (req, res) => {
  try {
    const { title, subtitle, categoryIds, displayOrder, isActive } = req.body;

    if (!title) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.log("Failed to delete temp file:", err.message);
        });
      }
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Banner image is required" });
    }

    let imageUrl = "";
    try {
      console.log("Uploading banner image to Cloudinary...");
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "image",
      });
      fs.unlink(req.file.path, (err) => {
        if (err) console.log("Failed to delete local temp file:", err.message);
      });
      imageUrl = result.secure_url;
    } catch (cloudinaryError) {
      console.log("Cloudinary upload failed for banner, falling back to local:", cloudinaryError.message);
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Process categoryIds array
    let processedCategories = [];
    if (categoryIds) {
      const parsed = Array.isArray(categoryIds) 
        ? categoryIds 
        : typeof categoryIds === "string" 
          ? categoryIds.split(",").map(id => id.trim()).filter(Boolean) 
          : [];
      processedCategories = parsed.filter(id => mongoose.Types.ObjectId.isValid(id));
    }

    const bannerData = {
      title,
      subtitle: subtitle || "",
      image: imageUrl,
      categoryIds: processedCategories,
      displayOrder: displayOrder ? Number(displayOrder) : 0,
      isActive: isActive === "true" || isActive === true
    };

    const banner = new bannerModel(bannerData);
    await banner.save();

    res.status(201).json({
      success: true,
      message: "Hero banner created successfully",
      banner
    });

  } catch (error) {
    console.error("Error creating banner:", error);
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.log("Failed to delete temp file:", err.message);
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an existing hero banner
// @route   PUT /api/admin/banners/:id
// @access  Admin
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, categoryIds, displayOrder, isActive } = req.body;

    const banner = await bannerModel.findById(id);
    if (!banner) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.log("Failed to delete temp file:", err.message);
        });
      }
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    let imageUrl = banner.image;
    if (req.file) {
      try {
        console.log("Uploading replacement banner image to Cloudinary...");
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "image",
        });
        fs.unlink(req.file.path, (err) => {
          if (err) console.log("Failed to delete local temp file:", err.message);
        });
        // Try to delete old local file if there was one
        if (banner.image.startsWith("/uploads/")) {
          const filename = banner.image.replace("/uploads/", "");
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

    // Process categoryIds array
    let processedCategories = banner.categoryIds;
    if (categoryIds !== undefined) {
      const parsed = Array.isArray(categoryIds) 
        ? categoryIds 
        : typeof categoryIds === "string" 
          ? categoryIds.split(",").map(id => id.trim()).filter(Boolean) 
          : [];
      processedCategories = parsed.filter(id => mongoose.Types.ObjectId.isValid(id));
    }

    const updatedData = {
      title: title !== undefined ? title : banner.title,
      subtitle: subtitle !== undefined ? subtitle : banner.subtitle,
      image: imageUrl,
      categoryIds: processedCategories,
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : banner.displayOrder,
      isActive: isActive !== undefined ? (isActive === "true" || isActive === true) : banner.isActive
    };

    const updatedBanner = await bannerModel.findByIdAndUpdate(id, updatedData, { new: true });

    res.json({
      success: true,
      message: "Hero banner updated successfully",
      banner: updatedBanner
    });

  } catch (error) {
    console.error("Error updating banner:", error);
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.log("Failed to delete temp file:", err.message);
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a hero banner
// @route   DELETE /api/admin/banners/:id
// @access  Admin
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await bannerModel.findById(id);

    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    // Delete local image file if present
    if (banner.image.startsWith("/uploads/")) {
      const filename = banner.image.replace("/uploads/", "");
      const filepath = path.join(process.cwd(), "uploads", filename);
      fs.unlink(filepath, (err) => {
        if (err) console.log("Failed to delete local file on banner delete:", err.message);
      });
    }

    await bannerModel.findByIdAndDelete(id);

    res.json({ success: true, message: "Hero banner deleted successfully" });
  } catch (error) {
    console.error("Error deleting banner:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
