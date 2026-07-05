import dealOfDayModel from "../models/dealOfDayModel.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

// @desc    Get Deal of the Day listings
// @route   GET /api/dealofday
// @access  Public / Admin
export const getDeals = async (req, res) => {
  try {
    const { admin } = req.query;
    
    if (admin === "true") {
      const deals = await dealOfDayModel.find({})
        .populate("productId")
        .sort({ createdAt: -1 });
      return res.json({ success: true, deals });
    }

    // Public storefront: retrieve only ONE currently active campaign within dates
    const now = new Date();
    const activeDeal = await dealOfDayModel.findOne({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).populate("productId");

    // Filter out if product doesn't exist
    if (!activeDeal || !activeDeal.productId || activeDeal.productId.isDeleted || activeDeal.productId.status !== "approved") {
      return res.json({ success: true, deal: null });
    }

    res.json({ success: true, deal: activeDeal });
  } catch (error) {
    console.error("Error fetching Deal of the Day:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new Deal of the Day
// @route   POST /api/admin/dealofday
// @access  Admin
export const createDeal = async (req, res) => {
  try {
    const { 
      productId, 
      title, 
      subtitle, 
      discountLabel, 
      startDate, 
      endDate, 
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
        message: "Required fields missing: Product, Heading, Start Date, and End Date are all required." 
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Model image is required for Deal of the Day" });
    }

    let imageUrl = "";
    let publicId = "";
    try {
      console.log("Uploading model image to Cloudinary...");
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "image",
        folder: "cartnow/deals"
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

    const start = new Date(startDate);
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999);

    const isActiveBool = isActive === "true" || isActive === true;

    if (isActiveBool) {
      // Overlap validation: only one active campaign allowed for a specific date
      const overlapDeal = await dealOfDayModel.findOne({
        isActive: true,
        startDate: { $lte: end },
        endDate: { $gte: start }
      });

      if (overlapDeal) {
        if (req.file) {
          fs.unlink(req.file.path, (err) => {
            if (err) console.log("Failed to delete temp file:", err.message);
          });
        }
        return res.status(400).json({ 
          success: false, 
          message: "A Deal of the Day campaign is already scheduled for this date. Overlapping campaigns are not allowed." 
        });
      }
    }

    const dealData = {
      productId,
      modelImage: imageUrl,
      title,
      subtitle: subtitle || "",
      discountLabel: discountLabel || "",
      startDate: start,
      endDate: end,
      isActive: isActiveBool,
      publicId,
      folder: "cartnow/deals",
      expiresAt: isActiveBool ? end : null
    };

    const newDeal = new dealOfDayModel(dealData);
    await newDeal.save();

    res.status(201).json({
      success: true,
      message: "Deal of the Day created successfully",
      deal: newDeal
    });

  } catch (error) {
    console.error("Error creating Deal of the Day:", error);
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.log("Failed to delete temp file:", err.message);
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Deal of the Day
// @route   PUT /api/admin/dealofday/:id
// @access  Admin
export const updateDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      productId, 
      title, 
      subtitle, 
      discountLabel, 
      startDate, 
      endDate, 
      isActive 
    } = req.body;

    const deal = await dealOfDayModel.findById(id);
    if (!deal) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.log("Failed to delete temp file:", err.message);
        });
      }
      return res.status(404).json({ success: false, message: "Deal of the Day not found" });
    }

    let imageUrl = deal.modelImage;
    let publicId = deal.publicId;
    if (req.file) {
      try {
        console.log("Uploading replacement model image to Cloudinary...");
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "image",
          folder: "cartnow/deals"
        });
        fs.unlink(req.file.path, (err) => {
          if (err) console.log("Failed to delete local temp file:", err.message);
        });
        // Delete previous local file
        if (deal.modelImage && deal.modelImage.startsWith("/uploads/")) {
          const filename = deal.modelImage.replace("/uploads/", "");
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

    let start = deal.startDate;
    let end = deal.endDate;

    if (startDate !== undefined) {
      start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0);
    }
    if (endDate !== undefined) {
      end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);
    }

    const isActiveBool = isActive === undefined 
      ? deal.isActive 
      : (isActive === "true" || isActive === true);

    if (isActiveBool) {
      // Overlap validation: ignore self during update check
      const overlapDeal = await dealOfDayModel.findOne({
        _id: { $ne: id },
        isActive: true,
        startDate: { $lte: end },
        endDate: { $gte: start }
      });

      if (overlapDeal) {
        if (req.file) {
          fs.unlink(req.file.path, (err) => {
            if (err) console.log("Failed to delete temp file:", err.message);
          });
        }
        return res.status(400).json({ 
          success: false, 
          message: "A Deal of the Day campaign is already scheduled for this date. Overlapping campaigns are not allowed." 
        });
      }
    }

    let expiresAt = deal.expiresAt;
    if (isActiveBool) {
      if (!deal.isActive || expiresAt === null) {
        expiresAt = end;
      }
    } else {
      expiresAt = null;
    }

    const updatedData = {
      productId: productId !== undefined ? productId : deal.productId,
      title: title !== undefined ? title : deal.title,
      subtitle: subtitle !== undefined ? subtitle : deal.subtitle,
      discountLabel: discountLabel !== undefined ? discountLabel : deal.discountLabel,
      startDate: start,
      endDate: end,
      modelImage: imageUrl,
      isActive: isActiveBool,
      publicId,
      folder: "cartnow/deals",
      expiresAt
    };

    const updatedDeal = await dealOfDayModel.findByIdAndUpdate(id, updatedData, { new: true });

    res.json({
      success: true,
      message: "Deal of the Day updated successfully",
      deal: updatedDeal
    });

  } catch (error) {
    console.error("Error updating Deal of the Day:", error);
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.log("Failed to delete temp file:", err.message);
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Deal of the Day
// @route   DELETE /api/admin/dealofday/:id
// @access  Admin
export const deleteDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const deal = await dealOfDayModel.findById(id);

    if (!deal) {
      return res.status(404).json({ success: false, message: "Deal not found" });
    }

    // Delete local image file if present
    if (deal.modelImage && deal.modelImage.startsWith("/uploads/")) {
      const filename = deal.modelImage.replace("/uploads/", "");
      const filepath = path.join(process.cwd(), "uploads", filename);
      fs.unlink(filepath, (err) => {
        if (err) console.log("Failed to delete local file on deal delete:", err.message);
      });
    }

    await dealOfDayModel.findByIdAndDelete(id);

    res.json({ success: true, message: "Deal of the Day deleted successfully" });
  } catch (error) {
    console.error("Error deleting Deal of the Day:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
