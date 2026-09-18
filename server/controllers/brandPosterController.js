import brandPosterModel from "../models/brandPosterModel.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// @desc    Get all active brand posters for client
// @route   GET /api/brand-posters
// @access  Public
export const getPublicBrandPosters = async (req, res) => {
  try {
    const posters = await brandPosterModel
      .find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: posters.length,
      posters
    });
  } catch (error) {
    console.error("Error fetching public brand posters:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch brand posters",
      error: error.message
    });
  }
};

// @desc    Get all brand posters for admin management
// @route   GET /api/brand-posters/admin/all
// @access  Admin (promos permission)
export const getAllBrandPostersAdmin = async (req, res) => {
  try {
    const posters = await brandPosterModel
      .find({})
      .sort({ order: 1, createdAt: -1 });

    const total = posters.length;
    const activeCount = posters.filter((p) => p.isActive).length;

    return res.status(200).json({
      success: true,
      total,
      activeCount,
      posters
    });
  } catch (error) {
    console.error("Error fetching admin brand posters:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch brand posters",
      error: error.message
    });
  }
};

// @desc    Add new brand poster
// @route   POST /api/brand-posters
// @access  Admin (promos permission)
export const addBrandPoster = async (req, res) => {
  try {
    const {
      brand,
      brandDomain,
      headline,
      subheadline,
      offerBadge,
      offerSub,
      couponCode,
      dealTag,
      rating,
      warrantyText,
      perks,
      imageAlt,
      order,
      isActive,
      imageUrl: directImageUrl
    } = req.body;

    if (!brand || !headline) {
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      return res.status(400).json({
        success: false,
        message: "Brand Name and Campaign Headline are required"
      });
    }

    let finalImageUrl = directImageUrl || "";
    let publicId = "";

    if (req.file) {
      try {
        console.log("Uploading brand poster to Cloudinary...");
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "image",
          folder: "cartnow/brand_posters"
        });
        fs.unlink(req.file.path, () => {});
        finalImageUrl = result.secure_url;
        publicId = result.public_id;
      } catch (cloudinaryErr) {
        console.warn("Cloudinary upload failed, using local storage:", cloudinaryErr.message);
        finalImageUrl = `/uploads/${req.file.filename}`;
      }
    }

    if (!finalImageUrl) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image or provide an image URL"
      });
    }

    // Parse perks if provided as JSON string or comma-separated
    let parsedPerks = ["100% Genuine", "Instant Dispatch", "Free Returns", "Manufacturer Warranty"];
    if (perks) {
      if (Array.isArray(perks)) {
        parsedPerks = perks;
      } else if (typeof perks === "string") {
        try {
          const parsed = JSON.parse(perks);
          if (Array.isArray(parsed)) parsedPerks = parsed;
        } catch {
          parsedPerks = perks.split(",").map((p) => p.trim()).filter(Boolean);
        }
      }
    }

    const cleanBrand = brand.trim();
    const slug = cleanBrand.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const domain = (brandDomain || `${slug}.com`).trim().toLowerCase();

    const newPoster = new brandPosterModel({
      brand: cleanBrand,
      brandDomain: domain,
      slug,
      headline: headline.trim(),
      subheadline: (subheadline || `Discover official authentic collections from ${cleanBrand} with direct brand warranty.`).trim(),
      offerBadge: (offerBadge || "EXCLUSIVE OFFER").trim(),
      offerSub: (offerSub || "Direct Brand Warranty & Express Delivery").trim(),
      couponCode: (couponCode || `${cleanBrand.toUpperCase().slice(0, 5)}PRO`).trim(),
      dealTag: (dealTag || "Official Flagship").trim(),
      rating: (rating || "4.9★").trim(),
      warrantyText: (warrantyText || "Official Brand Assurance").trim(),
      perks: parsedPerks,
      imageUrl: finalImageUrl,
      imageAlt: imageAlt || `${cleanBrand} Brand Campaign`,
      publicId,
      order: Number(order) || 0,
      isActive: isActive === undefined ? true : String(isActive) === "true"
    });

    await newPoster.save();

    return res.status(201).json({
      success: true,
      message: "Brand poster created successfully",
      poster: newPoster
    });
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    console.error("Error creating brand poster:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create brand poster",
      error: error.message
    });
  }
};

// @desc    Update existing brand poster
// @route   PUT /api/brand-posters/:id
// @access  Admin (promos permission)
export const updateBrandPoster = async (req, res) => {
  try {
    const { id } = req.params;
    const poster = await brandPosterModel.findById(id);

    if (!poster) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(404).json({ success: false, message: "Brand poster not found" });
    }

    const {
      brand,
      brandDomain,
      headline,
      subheadline,
      offerBadge,
      offerSub,
      couponCode,
      dealTag,
      rating,
      warrantyText,
      perks,
      imageAlt,
      order,
      isActive,
      imageUrl: directImageUrl
    } = req.body;

    if (brand) {
      poster.brand = brand.trim();
      poster.slug = brand.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }
    if (brandDomain !== undefined) poster.brandDomain = brandDomain.trim().toLowerCase();
    if (headline) poster.headline = headline.trim();
    if (subheadline !== undefined) poster.subheadline = subheadline.trim();
    if (offerBadge !== undefined) poster.offerBadge = offerBadge.trim();
    if (offerSub !== undefined) poster.offerSub = offerSub.trim();
    if (couponCode !== undefined) poster.couponCode = couponCode.trim();
    if (dealTag !== undefined) poster.dealTag = dealTag.trim();
    if (rating !== undefined) poster.rating = rating.trim();
    if (warrantyText !== undefined) poster.warrantyText = warrantyText.trim();
    if (imageAlt !== undefined) poster.imageAlt = imageAlt.trim();
    if (order !== undefined) poster.order = Number(order) || 0;
    if (isActive !== undefined) poster.isActive = String(isActive) === "true";

    if (perks) {
      if (Array.isArray(perks)) {
        poster.perks = perks;
      } else if (typeof perks === "string") {
        try {
          const parsed = JSON.parse(perks);
          if (Array.isArray(parsed)) poster.perks = parsed;
        } catch {
          poster.perks = perks.split(",").map((p) => p.trim()).filter(Boolean);
        }
      }
    }

    if (req.file) {
      try {
        console.log("Uploading replacement brand poster to Cloudinary...");
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "image",
          folder: "cartnow/brand_posters"
        });
        fs.unlink(req.file.path, () => {});

        // Delete old Cloudinary image if it had a publicId
        if (poster.publicId) {
          try {
            await cloudinary.uploader.destroy(poster.publicId);
          } catch (e) {
            console.log("Could not delete old Cloudinary image:", e.message);
          }
        }

        poster.imageUrl = result.secure_url;
        poster.publicId = result.public_id;
      } catch (cloudinaryErr) {
        console.warn("Cloudinary update failed, using local storage:", cloudinaryErr.message);
        poster.imageUrl = `/uploads/${req.file.filename}`;
      }
    } else if (directImageUrl) {
      poster.imageUrl = directImageUrl;
    }

    await poster.save();

    return res.status(200).json({
      success: true,
      message: "Brand poster updated successfully",
      poster
    });
  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => {});
    console.error("Error updating brand poster:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update brand poster",
      error: error.message
    });
  }
};

// @desc    Toggle brand poster active status
// @route   PATCH /api/brand-posters/:id/toggle
// @access  Admin (promos permission)
export const toggleBrandPosterStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const poster = await brandPosterModel.findById(id);

    if (!poster) {
      return res.status(404).json({ success: false, message: "Brand poster not found" });
    }

    poster.isActive = !poster.isActive;
    await poster.save();

    return res.status(200).json({
      success: true,
      message: `Brand poster is now ${poster.isActive ? "active" : "inactive"}`,
      isActive: poster.isActive,
      poster
    });
  } catch (error) {
    console.error("Error toggling brand poster status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle status",
      error: error.message
    });
  }
};

// @desc    Reorder brand posters
// @route   PUT /api/brand-posters/reorder
// @access  Admin (promos permission)
export const reorderBrandPosters = async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: "orderedIds array is required" });
    }

    const updates = orderedIds.map((id, index) =>
      brandPosterModel.findByIdAndUpdate(id, { order: index }, { new: true })
    );
    await Promise.all(updates);

    return res.status(200).json({
      success: true,
      message: "Brand posters reordered successfully"
    });
  } catch (error) {
    console.error("Error reordering brand posters:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reorder brand posters",
      error: error.message
    });
  }
};

// @desc    Delete brand poster
// @route   DELETE /api/brand-posters/:id
// @access  Admin (promos permission)
export const deleteBrandPoster = async (req, res) => {
  try {
    const { id } = req.params;
    const poster = await brandPosterModel.findById(id);

    if (!poster) {
      return res.status(404).json({ success: false, message: "Brand poster not found" });
    }

    if (poster.publicId) {
      try {
        await cloudinary.uploader.destroy(poster.publicId);
      } catch (err) {
        console.log("Could not delete Cloudinary asset:", err.message);
      }
    }

    await brandPosterModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Brand poster deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting brand poster:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete brand poster",
      error: error.message
    });
  }
};
