import promoBannerModel from "../models/promoBannerModel.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Helper to safely delete local temp files
const cleanLocalFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.warn("Failed to delete temp file:", err.message);
    });
  }
};

// Helper to safely upload a single file to Cloudinary with local fallback
const uploadSingleFile = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "image",
      folder: "cartnow/banners"
    });
    cleanLocalFile(filePath);
    return { url: result.secure_url, publicId: result.public_id };
  } catch (cloudErr) {
    console.warn("Cloudinary upload failed, falling back to local path:", cloudErr.message);
    const filename = filePath.split("/").pop();
    return { url: `/uploads/${filename}`, publicId: "" };
  }
};

// Helper to gather all uploaded files from req
const getUploadedFiles = (req) => {
  if (req.files) {
    const images = req.files.images || [];
    const single = req.files.image || [];
    return [...images, ...single];
  }
  if (req.file) {
    return [req.file];
  }
  return [];
};

// Helper to parse existing image URLs from body
const parseExistingImages = (body) => {
  let list = [];
  if (body.existingImages) {
    try {
      list = typeof body.existingImages === "string" ? JSON.parse(body.existingImages) : body.existingImages;
    } catch {
      list = [body.existingImages];
    }
  } else if (body.images && typeof body.images === "string") {
    try {
      list = JSON.parse(body.images);
    } catch {
      list = body.images.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  if (!Array.isArray(list)) list = [];
  return list.filter(Boolean);
};

// @desc    Get the active promotional banner (public)
// @route   GET /api/promo-banners/active
// @access  Public
export const getActivePromoBanner = async (req, res) => {
  try {
    const now = new Date();
    const placement = req.query.placement || "homepage";
    const query = {
      isActive: true,
      $and: [
        {
          $or: [
            { startDate: null },
            { startDate: { $exists: false } },
            { startDate: { $lte: now } }
          ]
        },
        {
          $or: [
            { endDate: null },
            { endDate: { $exists: false } },
            { endDate: { $gte: now } }
          ]
        }
      ]
    };

    if (placement === "homepage") {
      query.$or = [
        { placement: "homepage" },
        { placement: null },
        { placement: { $exists: false } }
      ];
    } else if (placement !== "all") {
      query.placement = placement;
    }

    const banner = await promoBannerModel
      .findOne(query)
      .sort({ order: 1, createdAt: -1 });

    const banners = await promoBannerModel
      .find(query)
      .sort({ order: 1, createdAt: -1 });

    res.json({
      success: true,
      banner: banner || null,
      banners: banners || []
    });
  } catch (error) {
    console.error("Error fetching active promo banner:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all promotional banners (admin)
// @route   GET /api/promo-banners
// @access  Admin
export const getAllPromoBanners = async (req, res) => {
  try {
    const query = {};
    if (req.query.placement && req.query.placement !== "all") {
      query.placement = req.query.placement;
    }

    const banners = await promoBannerModel
      .find(query)
      .sort({ order: 1, createdAt: -1 });

    res.json({
      success: true,
      banners
    });
  } catch (error) {
    console.error("Error fetching all promo banners:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new promotional banner
// @route   POST /api/promo-banners
// @access  Admin
export const createPromoBanner = async (req, res) => {
  const files = getUploadedFiles(req);
  try {
    const {
      title,
      subtitle,
      tagline,
      discountTag,
      ctaText,
      linkUrl,
      placement,
      displayMode,
      theme,
      bgColor,
      showPerks,
      isActive,
      order,
      startDate,
      endDate
    } = req.body;

    // Upload newly provided files
    const uploadedResults = await Promise.all(files.map((f) => uploadSingleFile(f.path)));
    const newImageUrls = uploadedResults.map((r) => r.url);
    const existingImageUrls = parseExistingImages(req.body);

    const combinedImages = [...existingImageUrls, ...newImageUrls];
    if (combinedImages.length === 0 && req.body.imageUrl) {
      combinedImages.push(req.body.imageUrl.trim());
    }

    if (combinedImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one banner image is required"
      });
    }

    const primaryImageUrl = combinedImages[0];
    const primaryPublicId = uploadedResults[0]?.publicId || "";

    const banner = new promoBannerModel({
      title: title || "Shop by Category",
      subtitle: subtitle || "Discover a wide range of products in your favorite categories.",
      tagline: tagline || "EXPLORE. SHOP. BELONG.",
      discountTag: discountTag || "",
      ctaText: ctaText || "Start Shopping",
      linkUrl: linkUrl || "/catalog/collection/festival-offers",
      placement: placement || "homepage",
      displayMode: displayMode || "overlay",
      theme: theme || "dark",
      bgColor: bgColor || "#F6F4FF",
      showPerks: showPerks === undefined ? true : String(showPerks) === "true",
      imageUrl: primaryImageUrl,
      images: combinedImages,
      publicId: primaryPublicId,
      isActive: isActive === undefined ? true : String(isActive) === "true",
      order: Number(order) || 0,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null
    });

    await banner.save();

    res.status(201).json({
      success: true,
      message: "Promotional banner created successfully",
      banner
    });
  } catch (error) {
    files.forEach((f) => cleanLocalFile(f.path));
    console.error("Error creating promo banner:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a promotional banner
// @route   PUT /api/promo-banners/:id
// @access  Admin
export const updatePromoBanner = async (req, res) => {
  const files = getUploadedFiles(req);
  try {
    const { id } = req.params;
    const banner = await promoBannerModel.findById(id);

    if (!banner) {
      files.forEach((f) => cleanLocalFile(f.path));
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    const {
      title,
      subtitle,
      tagline,
      discountTag,
      ctaText,
      linkUrl,
      placement,
      displayMode,
      theme,
      bgColor,
      showPerks,
      isActive,
      order,
      startDate,
      endDate
    } = req.body;

    if (title !== undefined) banner.title = title;
    if (subtitle !== undefined) banner.subtitle = subtitle;
    if (tagline !== undefined) banner.tagline = tagline;
    if (discountTag !== undefined) banner.discountTag = discountTag;
    if (ctaText !== undefined) banner.ctaText = ctaText;
    if (linkUrl !== undefined) banner.linkUrl = linkUrl;
    if (placement !== undefined) banner.placement = placement;
    if (displayMode !== undefined) banner.displayMode = displayMode;
    if (theme !== undefined) banner.theme = theme;
    if (bgColor !== undefined) banner.bgColor = bgColor;
    if (showPerks !== undefined) banner.showPerks = String(showPerks) === "true";
    if (isActive !== undefined) banner.isActive = String(isActive) === "true";
    if (order !== undefined) banner.order = Number(order);
    if (startDate !== undefined) banner.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) banner.endDate = endDate ? new Date(endDate) : null;

    // Upload newly provided files
    const uploadedResults = await Promise.all(files.map((f) => uploadSingleFile(f.path)));
    const newImageUrls = uploadedResults.map((r) => r.url);

    // Existing images kept by admin
    const existingImageUrls = parseExistingImages(req.body);

    let updatedImages = [];
    if (req.body.existingImages !== undefined || req.body.images !== undefined) {
      updatedImages = [...existingImageUrls, ...newImageUrls];
    } else if (newImageUrls.length > 0) {
      updatedImages = [...(banner.images || [banner.imageUrl]), ...newImageUrls];
    } else if (req.body.imageUrl) {
      updatedImages = [req.body.imageUrl, ...(banner.images || []).filter((u) => u !== banner.imageUrl)];
    } else {
      updatedImages = banner.images && banner.images.length > 0 ? banner.images : [banner.imageUrl];
    }

    // Clean up empty values
    updatedImages = updatedImages.filter(Boolean);

    if (updatedImages.length > 0) {
      banner.images = updatedImages;
      banner.imageUrl = updatedImages[0];
      if (uploadedResults[0]?.publicId) {
        banner.publicId = uploadedResults[0].publicId;
      }
    }

    await banner.save();

    res.json({
      success: true,
      message: "Promotional banner updated successfully",
      banner
    });
  } catch (error) {
    files.forEach((f) => cleanLocalFile(f.path));
    console.error("Error updating promo banner:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle banner active status
// @route   PATCH /api/promo-banners/:id/status
// @access  Admin
export const togglePromoBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await promoBannerModel.findById(id);

    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    res.json({
      success: true,
      message: `Banner ${banner.isActive ? "activated" : "deactivated"} successfully`,
      banner
    });
  } catch (error) {
    console.error("Error toggling promo banner status:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a promotional banner
// @route   DELETE /api/promo-banners/:id
// @access  Admin
export const deletePromoBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await promoBannerModel.findById(id);

    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    // Clean up Cloudinary asset
    if (banner.publicId) {
      try {
        await cloudinary.uploader.destroy(banner.publicId);
      } catch (e) {
        console.warn("Failed to delete Cloudinary asset on banner deletion:", e.message);
      }
    }

    await promoBannerModel.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Promotional banner deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting promo banner:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
