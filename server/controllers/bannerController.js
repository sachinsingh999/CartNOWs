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
    // For non-admin, filter by active status and ensure current date is within the banner's active timeframe.
    const filter = admin === "true" 
      ? {} 
      : { 
          isActive: true,
          startDate: { $lte: new Date() },
          endDate: { $gte: new Date() }
        };
        
    const banners = await bannerModel.find(filter)
      .populate("productId")
      .sort({ displayOrder: 1, createdAt: -1 });

    // For public, filter out banners where the product was deleted/missing.
    const filteredBanners = admin === "true" ? banners : banners.filter(b => b.productId !== null);

    res.json({ success: true, banners: filteredBanners });
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
    const { 
      productId, 
      title, 
      subtitle, 
      badge, 
      ctaText, 
      backgroundTheme, 
      startDate, 
      endDate, 
      displayOrder, 
      isActive 
    } = req.body;

    if (!productId || !title || !startDate || !endDate) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.log("Failed to delete temp file:", err.message);
        });
      }
      return res.status(400).json({ 
        success: false, 
        message: "Required fields missing: Product, Title, Start Date, and End Date are all required." 
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Model image is required for new banners" });
    }

    let imageUrl = "";
    let publicId = "";
    try {
      console.log("Uploading model image to Cloudinary...");
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "image",
        folder: "cartnow/banners"
      });
      fs.unlink(req.file.path, (err) => {
        if (err) console.log("Failed to delete local temp file:", err.message);
      });
      imageUrl = result.secure_url;
      publicId = result.public_id;
    } catch (cloudinaryError) {
      console.log("Cloudinary upload failed for model, falling back to local:", cloudinaryError.message);
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const activeBool = isActive === "true" || isActive === true;
    const bannerData = {
      productId,
      modelImage: imageUrl,
      title,
      subtitle: subtitle || "",
      badge: badge || "",
      ctaText: ctaText || "Shop Now",
      backgroundTheme: backgroundTheme || "bg-gradient-to-r from-slate-900 to-indigo-955",
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      displayOrder: displayOrder ? Number(displayOrder) : 0,
      isActive: activeBool,
      publicId,
      folder: "cartnow/banners",
      expiresAt: activeBool ? new Date(endDate) : null
    };

    const banner = new bannerModel(bannerData);
    await banner.save();

    res.status(201).json({
      success: true,
      message: "Premium hero banner created successfully",
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
    const { 
      productId, 
      title, 
      subtitle, 
      badge, 
      ctaText, 
      backgroundTheme, 
      startDate, 
      endDate, 
      displayOrder, 
      isActive 
    } = req.body;

    const banner = await bannerModel.findById(id);
    if (!banner) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.log("Failed to delete temp file:", err.message);
        });
      }
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    let imageUrl = banner.modelImage;
    let publicId = banner.publicId;
    if (req.file) {
      try {
        console.log("Uploading replacement model image to Cloudinary...");
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "image",
          folder: "cartnow/banners"
        });
        fs.unlink(req.file.path, (err) => {
          if (err) console.log("Failed to delete local temp file:", err.message);
        });
        // Try to delete old local file if there was one
        if (banner.modelImage && banner.modelImage.startsWith("/uploads/")) {
          const filename = banner.modelImage.replace("/uploads/", "");
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

    const requestedActive = isActive !== undefined ? (isActive === "true" || isActive === true) : banner.isActive;
    const finalEndDate = endDate !== undefined ? new Date(endDate) : banner.endDate;
    
    let expiresAt = banner.expiresAt;
    if (requestedActive) {
      if (!banner.isActive || expiresAt === null || endDate !== undefined) {
        expiresAt = finalEndDate;
      }
    } else {
      expiresAt = null;
    }

    const updatedData = {
      productId: productId !== undefined ? productId : banner.productId,
      title: title !== undefined ? title : banner.title,
      subtitle: subtitle !== undefined ? subtitle : banner.subtitle,
      badge: badge !== undefined ? badge : banner.badge,
      ctaText: ctaText !== undefined ? ctaText : banner.ctaText,
      backgroundTheme: backgroundTheme !== undefined ? backgroundTheme : banner.backgroundTheme,
      startDate: startDate !== undefined ? new Date(startDate) : banner.startDate,
      endDate: finalEndDate,
      modelImage: imageUrl,
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : banner.displayOrder,
      isActive: requestedActive,
      publicId,
      folder: "cartnow/banners",
      expiresAt
    };

    const updatedBanner = await bannerModel.findByIdAndUpdate(id, updatedData, { new: true });

    res.json({
      success: true,
      message: "Premium hero banner updated successfully",
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
    if (banner.modelImage && banner.modelImage.startsWith("/uploads/")) {
      const filename = banner.modelImage.replace("/uploads/", "");
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
