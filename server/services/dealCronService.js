import cron from "node-cron";
import { v2 as cloudinary } from "cloudinary";
import dailyDealCacheModel from "../models/dailyDealCacheModel.js";
import dealOfDayModel from "../models/dealOfDayModel.js";
import productModel from "../models/productModel.js";

/**
 * Format today's date key as YYYY-MM-DD in local time
 */
export const getTodayDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Generate high-definition studio product image matching product name
 */
export const generateAiDealVisual = async (productName, description = "") => {
  try {
    if (!productName || !productName.trim()) {
      return null;
    }

    const cleanName = productName.trim();

    // 1. Check Gemini Imagen 3 if API key has image permissions
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey) {
      try {
        const cleanPrompt = `Professional commercial studio photography of ${cleanName}. ${description ? description.slice(0, 150) : ""}. Isolated on clean neutral studio backdrop, high-end commercial e-commerce product shot, soft cinematic lighting, 8k resolution, photorealistic.`;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${geminiApiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instances: [{ prompt: cleanPrompt }],
            parameters: { sampleCount: 1, aspectRatio: "1:1", outputMimeType: "image/png" }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const prediction = data?.predictions?.[0];
          if (prediction?.bytesBase64Encoded) {
            const uploadResult = await cloudinary.uploader.upload(
              `data:image/png;base64,${prediction.bytesBase64Encoded}`,
              {
                folder: "products/ai-generated",
                resource_type: "image"
              }
            );
            return uploadResult.secure_url;
          }
        }
      } catch (geminiErr) {
        // Fall through to Flux AI
      }
    }

    // 2. High-Quality Flux AI Generation matching exact product name
    const pollinationsPrompt = encodeURIComponent(
      `Professional commercial studio photography of ${cleanName}, isolated on clean neutral white studio backdrop, pristine catalog presentation, centered composition, sharp focus, 8k resolution`
    );
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${pollinationsPrompt}?width=800&height=800&nologo=true&model=flux&seed=${Math.floor(
      Math.random() * 100000
    )}`;

    let finalImageUrl = pollinationsUrl;
    try {
      const uploadResult = await cloudinary.uploader.upload(pollinationsUrl, {
        folder: "products/ai-generated",
        resource_type: "image"
      });
      finalImageUrl = uploadResult.secure_url;
    } catch (cErr) {
      console.warn("[DealCron] Cloudinary upload fallback to direct URL:", cErr.message);
    }

    return finalImageUrl;
  } catch (err) {
    console.error("[DealCron] Error generating visual:", err.message);
    return null;
  }
};

/**
 * Determine today's deal product (matches the deterministic logic on frontend & backend)
 */
export const resolveTodayDealProduct = async () => {
  const now = new Date();

  // 1. Check for active admin campaign deal
  const activeDeal = await dealOfDayModel
    .findOne({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    })
    .populate("productId");

  if (activeDeal && activeDeal.productId && !activeDeal.productId.isDeleted) {
    return {
      product: activeDeal.productId,
      activeDealDoc: activeDeal
    };
  }

  // 2. Deterministic rotation among top discounted catalog products
  const products = await productModel
    .find({ status: "approved", isDeleted: { $ne: true } })
    .select("_id name description price originalPrice images")
    .sort({ discountPercent: -1, createdAt: -1 })
    .limit(20)
    .lean();

  if (!products || products.length === 0) {
    return {
      product: {
        _id: "deal-celestial-necklace",
        name: "18K Gold Plated Layered Celestial Pendant Necklace",
        description: "Exquisite handcrafted dual-layer pendant necklace."
      },
      activeDealDoc: null
    };
  }

  const daySeed = Math.floor(
    (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(2025, 0, 1)) /
      (1000 * 60 * 60 * 24)
  );

  const selected = products[((daySeed % products.length) + products.length) % products.length];
  return {
    product: selected,
    activeDealDoc: null
  };
};

/**
 * Preload today's AI deal image at 12:00 AM (midnight)
 */
export const preloadTodayDealImage = async () => {
  try {
    const dateKey = getTodayDateKey();
    console.log(`[DealCron] Checking preloaded AI image for date: ${dateKey}...`);

    // Check if already generated for today
    const existing = await dailyDealCacheModel.findOne({ dateKey });
    if (existing && existing.aiImageUrl) {
      console.log(`[DealCron] AI visual for ${dateKey} already cached: ${existing.productName}`);
      return existing.aiImageUrl;
    }

    const { product, activeDealDoc } = await resolveTodayDealProduct();
    if (!product || !product.name) {
      console.warn("[DealCron] No valid deal product found to preload.");
      return null;
    }

    console.log(`[DealCron] Generating midnight AI deal visual for: "${product.name}"...`);
    const aiImageUrl = await generateAiDealVisual(product.name, product.description || "");

    if (aiImageUrl) {
      await dailyDealCacheModel.findOneAndUpdate(
        { dateKey },
        {
          dateKey,
          productId: product._id && String(product._id).startsWith("deal-") ? null : product._id,
          productName: product.name,
          aiImageUrl,
          status: "ready",
          generatedAt: new Date()
        },
        { upsert: true, new: true }
      );

      // If there's an active campaign, persist aiImage to campaign document
      if (activeDealDoc) {
        activeDealDoc.aiImage = aiImageUrl;
        await activeDealDoc.save();
      }

      console.log(`[DealCron] Successfully preloaded AI image for "${product.name}" at midnight.`);
      return aiImageUrl;
    }
  } catch (err) {
    console.error("[DealCron] Preload error at midnight:", err.message);
  }
  return null;
};

/**
 * Retrieve today's cached AI deal image
 */
export const getTodayCachedDealImage = async () => {
  try {
    const dateKey = getTodayDateKey();
    const cached = await dailyDealCacheModel.findOne({ dateKey }).lean();
    if (cached && cached.aiImageUrl) {
      return {
        dateKey,
        productName: cached.productName,
        aiImageUrl: cached.aiImageUrl
      };
    }
  } catch (err) {
    console.warn("[DealCron] Error reading cached deal image:", err.message);
  }
  return null;
};

/**
 * Initialize midnight cron schedule (12:00 AM every night)
 */
export const initDealCron = () => {
  console.log("[DealCron] Initializing Deal of the Day midnight scheduler (00:00 every night)...");

  // Schedule for 12:00 AM (midnight) every day: '0 0 * * *'
  cron.schedule("0 0 * * *", async () => {
    console.log("[DealCron] 12:00 AM Midnight reached! Executing AI deal visual preloader...");
    await preloadTodayDealImage();
  });

  // Also check immediately on boot asynchronously (with 3s buffer for DB connection)
  setTimeout(() => {
    preloadTodayDealImage().catch((err) => {
      console.warn("[DealCron] Initial startup preload check note:", err.message);
    });
  }, 3000);
};

