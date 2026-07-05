import { v2 as cloudinary } from "cloudinary";
import bannerModel from "../models/bannerModel.js";
import dealOfDayModel from "../models/dealOfDayModel.js";
import heroAssetModel from "../models/heroAssetModel.js";
import saleModel from "../models/saleModel.js";
import tempUploadModel from "../models/tempUploadModel.js";
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import sellerModel from "../models/sellerModel.js";
import userModel from "../models/userModel.js";
import cloudinaryCleanupLogModel from "../models/cloudinaryCleanupLogModel.js";

// Helper to perform rigorous safety checks before deleting any asset
export const isAssetSafeToDelete = async (publicId, imageUrl, folder) => {
  try {
    if (!publicId) return false;

    // 1. Verify folder constraint (must belong to promotional/temp folders only)
    const allowedFolders = [
      "cartnow/banners",
      "cartnow/deals",
      "cartnow/ads",
      "cartnow/temp"
    ];
    const isAllowed = allowedFolders.some(f => folder.startsWith(f));
    if (!isAllowed) {
      console.log(`[Safety Check] Blocked deletion. Folder '${folder}' is not in promotional whitelist.`);
      return false;
    }

    // 2. Verify asset is not linked to any active products
    const productRef = await productModel.findOne({ images: imageUrl });
    if (productRef) {
      console.log(`[Safety Check] Blocked deletion. Asset ${publicId} is linked to active product: ${productRef._id}`);
      return false;
    }

    // 3. Verify asset is not linked to any category images
    const categoryRef = await categoryModel.findOne({ image: imageUrl });
    if (categoryRef) {
      console.log(`[Safety Check] Blocked deletion. Asset ${publicId} is linked to active category: ${categoryRef._id}`);
      return false;
    }

    // 4. Verify asset is not linked to any seller logos
    const sellerRef = await sellerModel.findOne({ logo: imageUrl });
    if (sellerRef) {
      console.log(`[Safety Check] Blocked deletion. Asset ${publicId} is linked to seller: ${sellerRef._id}`);
      return false;
    }

    // 5. Verify asset is not linked to any user avatars
    const userRef = await userModel.findOne({ image: imageUrl });
    if (userRef) {
      console.log(`[Safety Check] Blocked deletion. Asset ${publicId} is linked to user profile: ${userRef._id}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Safety Check] Error during safety verification:", error.message);
    return false;
  }
};

// Helper: Delete asset from Cloudinary and record in database log
const deleteFromCloudinary = async (assetId, publicId, folder, reason) => {
  try {
    console.log(`[Cloudinary Cleanup] Destroying asset from Cloudinary: ${publicId}`);
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === "ok" || result.result === "not found") {
      // Create deletion log
      const log = new cloudinaryCleanupLogModel({
        assetId,
        publicId,
        folder,
        reason
      });
      await log.save();
      console.log(`[Cloudinary Cleanup] Deleted ${publicId} successfully. Reason: ${reason}`);
      return true;
    } else {
      console.log(`[Cloudinary Cleanup] Cloudinary returned status: ${result.result} for publicId: ${publicId}`);
      return false;
    }
  } catch (error) {
    console.error(`[Cloudinary Cleanup] Failed to delete Cloudinary asset ${publicId}:`, error.message);
    return false;
  }
};

// 1. Cleanup Expired Deals of the Day
export const cleanupExpiredDeals = async () => {
  try {
    const now = new Date();
    // Expiration criteria: active deals whose end date has passed
    const expiredDeals = await dealOfDayModel.find({
      isActive: true,
      $or: [
        { endDate: { $lte: now } },
        { expiresAt: { $lte: now } }
      ]
    });

    console.log(`[Cloudinary Cleanup] Found ${expiredDeals.length} expired Deals of the Day.`);

    for (const deal of expiredDeals) {
      const isSafe = await isAssetSafeToDelete(deal.publicId, deal.modelImage, deal.folder || "cartnow/deals");
      
      if (isSafe && deal.publicId) {
        await deleteFromCloudinary(deal._id.toString(), deal.publicId, deal.folder || "cartnow/deals", "Deal Expired");
      }

      // Update database record status
      deal.isActive = false;
      deal.modelImage = ""; // delete associated image url reference
      deal.publicId = "";
      deal.expiresAt = null;
      await deal.save();
    }
  } catch (error) {
    console.error("[Cloudinary Cleanup] Error cleaning up expired deals:", error.message);
  }
};

// 2. Cleanup Expired Banners (including custom Hero assets and platform banners)
export const cleanupExpiredBanners = async () => {
  try {
    const now = new Date();
    
    // a. Standard banners cleanup
    const expiredBanners = await bannerModel.find({
      isActive: true,
      $or: [
        { endDate: { $lte: now } },
        { expiresAt: { $lte: now } }
      ]
    });

    console.log(`[Cloudinary Cleanup] Found ${expiredBanners.length} expired standard banners.`);

    for (const banner of expiredBanners) {
      const isSafe = await isAssetSafeToDelete(banner.publicId, banner.modelImage, banner.folder || "cartnow/banners");
      
      if (isSafe && banner.publicId) {
        await deleteFromCloudinary(banner._id.toString(), banner.publicId, banner.folder || "cartnow/banners", "Banner Expired");
      }

      banner.isActive = false;
      banner.modelImage = "";
      banner.publicId = "";
      banner.expiresAt = null;
      await banner.save();
    }

    // b. Hero asset custom slideshow campaigns cleanup
    const expiredHeroAssets = await heroAssetModel.find({
      isActive: true,
      expiresAt: { $lte: now }
    });

    console.log(`[Cloudinary Cleanup] Found ${expiredHeroAssets.length} expired Hero Slide assets.`);

    for (const slide of expiredHeroAssets) {
      const isSafe = await isAssetSafeToDelete(slide.publicId, slide.imageUrl, slide.folder || "cartnow/banners");

      if (isSafe && slide.publicId) {
        await deleteFromCloudinary(slide._id.toString(), slide.publicId, slide.folder || "cartnow/banners", "Banner Expired");
      }

      slide.isActive = false;
      slide.imageUrl = "";
      slide.publicId = "";
      slide.expiresAt = null;
      await slide.save();
    }

  } catch (error) {
    console.error("[Cloudinary Cleanup] Error cleaning up expired banners:", error.message);
  }
};

// 3. Cleanup Expired Advertisement Campaigns (Sales)
export const cleanupExpiredSales = async () => {
  try {
    const now = new Date();
    const expiredSales = await saleModel.find({
      active: true,
      $or: [
        { validTo: { $lte: now } },
        { expiresAt: { $lte: now } }
      ]
    });

    console.log(`[Cloudinary Cleanup] Found ${expiredSales.length} expired Advertisement Campaign (Sale) assets.`);

    for (const sale of expiredSales) {
      const isSafe = await isAssetSafeToDelete(sale.publicId, sale.image, sale.folder || "cartnow/ads");

      if (isSafe && sale.publicId) {
        await deleteFromCloudinary(sale._id.toString(), sale.publicId, sale.folder || "cartnow/ads", "Ad Campaign Ended");
      }

      sale.active = false;
      sale.image = "";
      sale.publicId = "";
      sale.expiresAt = null;
      await sale.save();
    }
  } catch (error) {
    console.error("[Cloudinary Cleanup] Error cleaning up expired sales:", error.message);
  }
};

// 4. Cleanup Unused Temporary Uploads (older than 24 hours)
export const cleanupExpiredTempUploads = async () => {
  try {
    const now = new Date();
    
    // Find all temp assets that are expired (older than 24h)
    const expiredTemps = await tempUploadModel.find({
      expiresAt: { $lte: now }
    });

    console.log(`[Cloudinary Cleanup] Found ${expiredTemps.length} temporary uploads to check.`);

    for (const temp of expiredTemps) {
      // Check if it got linked to anything in the meantime (isActive fallback check)
      const isSafe = await isAssetSafeToDelete(temp.publicId, temp.imageUrl, temp.folder || "cartnow/temp");

      if (isSafe && temp.publicId) {
        await deleteFromCloudinary(temp._id.toString(), temp.publicId, temp.folder || "cartnow/temp", "Temp Upload Cleanup");
      }

      // Delete the record completely from local DB
      await tempUploadModel.findByIdAndDelete(temp._id);
    }
  } catch (error) {
    console.error("[Cloudinary Cleanup] Error cleaning up expired temp uploads:", error.message);
  }
};

// Main entry point for orchestrating the complete Cloudinary cleanup suite
export const runFullCleanup = async () => {
  console.log("[Cloudinary Cleanup] Starting full daily cleanup cycle...");
  await cleanupExpiredDeals();
  await cleanupExpiredBanners();
  await cleanupExpiredSales();
  await cleanupExpiredTempUploads();
  console.log("[Cloudinary Cleanup] Full daily cleanup cycle completed successfully.");
};

// Statistics builder for Admin Settings Panel Dashboard
export const getCloudinaryStorageMetrics = async () => {
  try {
    // 1. Fetch live metrics from Cloudinary API
    let usageStats = { used: 0, limit: 10000000000, percentage: 0 }; // fallback: 10GB limit
    try {
      const liveUsage = await cloudinary.api.usage();
      if (liveUsage && liveUsage.storage) {
        usageStats = {
          used: liveUsage.storage.usage,
          limit: liveUsage.storage.limit,
          percentage: Number(((liveUsage.storage.usage / liveUsage.storage.limit) * 100).toFixed(2))
        };
      }
    } catch (apiErr) {
      console.warn("[Cloudinary Metrics] Cloudinary Admin API usage limit fetch error:", apiErr.message);
    }

    // 2. Count active vs expired/inactive campaigns
    const now = new Date();
    
    const activeDealsCount = await dealOfDayModel.countDocuments({ isActive: true });
    const expiredDealsCount = await dealOfDayModel.countDocuments({
      isActive: false,
      modelImage: ""
    });

    const activeBannersCount = await bannerModel.countDocuments({ isActive: true });
    const expiredBannersCount = await bannerModel.countDocuments({
      isActive: false,
      modelImage: ""
    });

    const activeHeroCount = await heroAssetModel.countDocuments({ isActive: true });
    const expiredHeroCount = await heroAssetModel.countDocuments({ isActive: false, imageUrl: "" });

    const activeAdsCount = await saleModel.countDocuments({ active: true });
    const expiredAdsCount = await saleModel.countDocuments({ active: false, image: "" });

    const pendingExpiredCount = 
      await dealOfDayModel.countDocuments({ isActive: true, endDate: { $lte: now } }) +
      await bannerModel.countDocuments({ isActive: true, endDate: { $lte: now } }) +
      await heroAssetModel.countDocuments({ isActive: true, expiresAt: { $lte: now } }) +
      await saleModel.countDocuments({ active: true, validTo: { $lte: now } }) +
      await tempUploadModel.countDocuments({ expiresAt: { $lte: now } });

    // 3. Count deletions recorded today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const deletedTodayCount = await cloudinaryCleanupLogModel.countDocuments({
      deletedAt: { $gte: startOfToday }
    });

    // 4. Fetch recent deletion logs feed (last 15 items)
    const logs = await cloudinaryCleanupLogModel.find({})
      .sort({ deletedAt: -1 })
      .limit(15);

    return {
      storageUsed: usageStats.used,
      storageLimit: usageStats.limit,
      storagePercentage: usageStats.percentage,
      activeCampaignsCount: activeDealsCount + activeBannersCount + activeHeroCount + activeAdsCount,
      expiredPendingCount: pendingExpiredCount,
      deletedTodayCount,
      logs
    };

  } catch (error) {
    console.error("[Cloudinary Metrics] Failed to aggregate cleanup metrics:", error.message);
    throw error;
  }
};
