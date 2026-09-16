import mongoose from "mongoose";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";
import categoryModel from "../models/categoryModel.js";
import categoryAttributeModel from "../models/categoryAttributeModel.js";
import listingAttributeValueModel from "../models/listingAttributeValueModel.js";
import listingMediaModel from "../models/listingMediaModel.js";
import { trackProductView, trackSearch } from "../utils/analyticsHelper.js";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { formatProductResponse } from "../utils/productFormatter.js";
import { cacheGet, cacheSet, cacheDel } from "../utils/cache.js";
import { buildTypoTolerantQuery, analyzeSearchTerm } from "../utils/searchEngineHelper.js";
import { generateDynamicFilters, buildDynamicAttributeConditions } from "../services/filterService.js";
import { resolveCategoryQuery } from "../services/categoryResolver.js";
import { autoProcessProductCardImage } from "../services/bgRemovalService.js";

const addProducts = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      collection,
      brand,
      sku,
      stock,
      sizes,
      tags,
      specifications,
    } = req.body;

    if (!name || !price || !category) {
      return res.json({
        success: false,
        message: "Required fields missing"
      });
    }

    if (Number(price) < 0) {
      return res.json({
        success: false,
        message: "Price cannot be negative"
      });
    }

    if (stock !== undefined && Number(stock) < 0) {
      return res.json({
        success: false,
        message: "Stock cannot be negative"
      });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.json({
        success: false,
        message: "Images required"
      });
    }

    const imageFiles = [
      req.files.image1?.[0],
      req.files.image2?.[0],
      req.files.image3?.[0],
      req.files.image4?.[0]
    ].filter(Boolean);

    let images = [];
    try {
      console.log("Uploading product images to Cloudinary...");
      const uploadPromises = imageFiles.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "image",
        });
        // Cleanup local file after successful upload to Cloudinary
        fs.unlink(file.path, (err) => {
          if (err) console.log("Failed to delete local temp file:", err.message);
        });
        return result.secure_url;
      });
      images = await Promise.all(uploadPromises);
    } catch (cloudinaryError) {
      console.log("Cloudinary upload failed, falling back to local file paths:", cloudinaryError.message);
      // Keep local files for local serving and map their relative paths
      images = imageFiles.map(file => file.path);
    }

    const parseList = (value) => {
      if (!value) return [];
      if (Array.isArray(value)) {
        return value.map((item) => item.trim()).filter(Boolean);
      }
      return value.split(",").map((item) => item.trim()).filter(Boolean);
    };

    const sizeArray = parseList(sizes);
    const tagArray = parseList(tags);
    const specificationArray = parseList(specifications).map((entry) => {
      const [key, ...rest] = entry.split(":");
      return {
        key: key?.trim(),
        value: rest.join(":").trim(),
      };
    }).filter((entry) => entry.key && entry.value);

    let variantArray = [];
    if (req.body.variants) {
      try {
        const rawVar = typeof req.body.variants === "string" ? JSON.parse(req.body.variants) : req.body.variants;
        if (Array.isArray(rawVar)) {
          for (const v of rawVar) {
            if (v.price !== undefined && Number(v.price) < 0) {
              return res.json({ success: false, message: "Variant price cannot be negative" });
            }
            if (v.stock !== undefined && Number(v.stock) < 0) {
              return res.json({ success: false, message: "Variant stock cannot be negative" });
            }
          }
          variantArray = rawVar.map(v => ({
            Color: v.Color || v.color || "",
            Size: v.Size || v.size || "",
            sku: v.sku || "",
            price: Math.max(0, Number(v.price || price || 0)),
            stock: Math.max(0, Number(v.stock || 0))
          }));
        }
      } catch (err) {
        console.log("Failed to parse variants JSON:", err.message);
      }
    }

    let finalStock = Number(stock) || 0;
    if (variantArray.length > 0) {
      finalStock = variantArray.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    }

    let bgRemovedImage = "";
    try {
      if (images && images.length > 0 && images[0]) {
        console.log(`[Admin] Auto-removing background for first product image: ${images[0]}`);
        bgRemovedImage = await autoProcessProductCardImage({ firstImageUrl: images[0] });
      }
    } catch (bgErr) {
      console.warn("[Admin] Auto bg removal warning in addProducts:", bgErr.message);
    }

    const productData = {
      name,
      description,
      price: Number(price),
      category,
      subCategory: subCategory || "",
      collection: collection || "",
      brand: brand || "",
      sku: sku || "",
      stock: finalStock,
      sizes: sizeArray,
      tags: tagArray,
      specifications: specificationArray,
      variants: variantArray,
      images,
      bgRemovedImage: bgRemovedImage || ""
    };

    const product = new productModel(productData);
    await product.save();

    res.json({
      success: true,
      message: "Product added successfully"
    });

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message
    });
  }
};




const listProducts = async (req, res) => {
  try {
    let { category, categories, subCategory, collection, audience, brand, price, rating, q, search, attributes, location, discount, availability } = req.query;

    const safeString = (val) => {
      if (!val) return "";
      const str = typeof val === "string" ? val : String(val);
      return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };

    category = safeString(category);
    subCategory = safeString(subCategory);
    collection = safeString(collection);
    audience = safeString(audience);
    brand = safeString(brand);
    location = safeString(location);
    q = safeString(q);
    search = safeString(search);

    const searchTerm = search || q;

    // Build core query
    const query = { isDeleted: { $ne: true }, status: "approved" };
    
    // Category & Subcategory resolution
    let resolvedCategoryMeta = null;
    const categoryIds = categories ? categories.split(",").map(id => id.trim()).filter(id => mongoose.Types.ObjectId.isValid(id)) : [];
    
    if (categoryIds.length > 0) {
      const adminCats = await categoryModel.find({ status: "active" });
      const allowedCategories = [];
      categoryIds.forEach(catId => {
        const cat = adminCats.find(c => c._id?.toString() === catId);
        if (cat) {
          allowedCategories.push(cat.name);
          const childrenDocs = adminCats.filter(c => c.parentCategoryId?.toString() === catId);
          allowedCategories.push(...childrenDocs.map(c => c.name));
        }
      });

      if (allowedCategories.length > 0) {
        query.category = { $in: allowedCategories.map(c => new RegExp(`^${c}$`, "i")) };
      }
    } else if ((category && category !== "all") || (subCategory && subCategory !== "all")) {
      const { meta, condition } = await resolveCategoryQuery(category, subCategory);
      resolvedCategoryMeta = meta;
      if (condition) {
        if (!query.$and) query.$and = [];
        query.$and.push(condition);
      }
    }

    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");

    // Collection filter (matches both collection string, collections array, or audience fallback)
    if (collection && collection !== "all") {
      const cleanColl = collection.toLowerCase().trim();
      if (["new-arrivals", "new-arrival", "newarrivals", "new_arrivals", "new arrival"].includes(cleanColl)) {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        if (!query.$and) query.$and = [];
        query.$and.push({
          $or: [
            { createdAt: { $gte: sevenDaysAgo } },
            { date: { $gte: sevenDaysAgo } }
          ]
        });
      } else if (["best-sellers", "best-seller", "bestsellers", "bestseller", "top-sellers", "top-rated"].includes(cleanColl)) {
        const collRegex = new RegExp(`^${collection}$`, "i");
        if (!query.$and) query.$and = [];
        query.$and.push({
          $or: [
            { isBestSeller: true },
            { bestseller: true },
            { averageRating: { $gte: 4.0 } },
            { totalSold: { $gt: 0 } },
            { collection: collRegex },
            { collections: { $in: [collRegex] } }
          ]
        });
      } else if (["festival-offers", "festive-offers", "festival-deals", "festive-deals", "mega-deals", "festive", "festival", "offers", "deals"].includes(cleanColl)) {
        const collRegex = new RegExp(`^${collection}$`, "i");
        const festivalRegex = /festival|festive|diwali|celebrat|holiday/i;
        if (!query.$and) query.$and = [];
        query.$and.push({
          $or: [
            { collection: collRegex },
            { collection: festivalRegex },
            { collections: { $in: [collRegex, festivalRegex, "Festival Offers", "Festive Offers", "Festival Deals", "Festival", "Festive"] } },
            { tags: { $in: [festivalRegex, /kundan|temple|ethnic|traditional/i] } },
            { keywords: { $in: [festivalRegex] } },
            { category: festivalRegex },
            { subCategory: festivalRegex },
            { "attributes.occasion": festivalRegex },
            { "attributes.Occasion": festivalRegex },
            { "attributes.Event": festivalRegex },
            { "attributes.event": festivalRegex },
            { "attributes.Festival": { $exists: true } },
            { "attributes.festive": { $in: [true, "true", "yes", "Yes"] } },
            { "attributes.isFestive": { $in: [true, "true", "yes", "Yes"] } },
            { specifications: { $elemMatch: { key: /occasion|event|theme|festival|festive/i, value: festivalRegex } } },
            { name: festivalRegex }
          ]
        });
      } else {
        const collRegex = new RegExp(`^${collection}$`, "i");
        const orConditions = [
          { collection: collRegex },
          { collections: { $in: [collRegex] } }
        ];

        if (["men", "women", "kids", "kid", "boys", "girls", "unisex"].includes(collection.toLowerCase())) {
          let cleanAudience = collection.toLowerCase();
          if (["kid", "boys", "girls"].includes(cleanAudience)) {
            cleanAudience = "kids";
          }
          orConditions.push({ audience: new RegExp(`^${cleanAudience}$`, "i") });
          orConditions.push({ audience: collRegex });
        }

        if (!query.$and) query.$and = [];
        query.$and.push({ $or: orConditions });
      }
    }

    // Audience filter
    if (audience && audience !== "all") {
      query.audience = new RegExp(`^${audience}$`, "i");
    }

    // Brand filter (comma-separated or single)
    if (brand) {
      const brandArray = Array.isArray(brand) ? brand : brand.split(",").map(b => b.trim()).filter(Boolean);
      if (brandArray.length > 0) {
        query.brand = { $in: brandArray.map(b => new RegExp(`^${b}$`, "i")) };
      }
    }

    // Location filter (comma-separated or single)
    if (location) {
      const locArray = Array.isArray(location) ? location : location.split(",").map(l => l.trim()).filter(Boolean);
      if (locArray.length > 0) {
        query.location = { $in: locArray.map(l => new RegExp(`^${l}$`, "i")) };
      }
    }

    // Availability/Stock status filter
    if (availability === "in-stock") {
      query.stock = { $gt: 0 };
    }

    // Price range filter
    if (price) {
      const maxPrice = Number(price);
      if (!isNaN(maxPrice)) {
        query.price = { $lte: maxPrice };
      }
    }

    let searchMeta = null;
    // Optimized Typo-Tolerant Keyword & Semantic Search
    if (searchTerm) {
      trackSearch(searchTerm, category || null);
      const fuzzyQuery = buildTypoTolerantQuery(searchTerm);
      if (fuzzyQuery && fuzzyQuery.$or && fuzzyQuery.$or.length > 0) {
        query.$and = query.$and || [];
        query.$and.push({ $or: fuzzyQuery.$or });
        searchMeta = fuzzyQuery.searchMeta;
      }
    }

    // Dynamic Attribute Filters: Parse from attributes JSON or attrs object or query parameters
    let parsedAttrs = {};
    if (attributes) {
      try {
        parsedAttrs = typeof attributes === "string" ? JSON.parse(attributes) : attributes;
      } catch (e) {}
    }
    if (req.query.attrs && typeof req.query.attrs === "object") {
      parsedAttrs = { ...parsedAttrs, ...req.query.attrs };
    }

    // Also pick up direct query parameters that aren't system keys
    const reservedQueryParams = new Set([
      "page", "limit", "sortby", "sort", "category", "categories", "subcategory",
      "collection", "audience", "brand", "price", "rating", "q", "search",
      "attributes", "attrs", "location", "discount", "availability"
    ]);

    Object.keys(req.query).forEach(key => {
      if (!reservedQueryParams.has(key.toLowerCase()) && req.query[key]) {
        parsedAttrs[key] = req.query[key];
      }
    });

    const attrConditions = buildDynamicAttributeConditions(parsedAttrs);
    if (attrConditions.length > 0) {
      if (!query.$and) query.$and = [];
      query.$and.push(...attrConditions);
    }

    // Pagination parameters
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 500;
    const skip = (page - 1) * limit;

    // Sorting parameters
    const sortBy = req.query.sortBy || "featured";

    // Setup base pipeline steps
    let pipeline = [
      { $match: query }
    ];

    // Add dynamic/computed fields to pipeline (rating and discount calculations)
    pipeline.push({
      $addFields: {
        avgRating: {
          $cond: {
            if: { $eq: [{ $size: { $ifNull: ["$reviews", []] } }, 0] },
            then: 0,
            else: { $avg: "$reviews.rating" }
          }
        },
        reviewCount: { $size: { $ifNull: ["$reviews", []] } },
        discountPercent: {
          $cond: {
            if: {
              $and: [
                { $gt: ["$originalPrice", 0] },
                { $gt: ["$originalPrice", "$price"] }
              ]
            },
            then: { $round: [{ $multiply: [{ $divide: [{ $subtract: ["$originalPrice", "$price"] }, "$originalPrice"] }, 100] }] },
            else: 0
          }
        }
      }
    });

    // Apply pipeline matched filters (rating & discount percentage)
    if (rating) {
      const minRating = Number(rating);
      if (!isNaN(minRating) && minRating > 0) {
        pipeline.push({ $match: { avgRating: { $gte: minRating } } });
      }
    }

    if (discount) {
      const minDiscount = Number(discount);
      if (!isNaN(minDiscount) && minDiscount > 0) {
        pipeline.push({ $match: { discountPercent: { $gte: minDiscount } } });
      }
    }

    // Dynamic search relevance scoring when search query is present
    if (searchTerm && searchMeta) {
      const escapedCorrected = (searchMeta.correctedQuery || searchTerm).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const escapedSearch = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      pipeline.push({
        $addFields: {
          searchRelevance: {
            $add: [
              {
                $cond: {
                  if: { $regexMatch: { input: { $ifNull: ["$name", ""] }, regex: `^${escapedCorrected}$`, options: "i" } },
                  then: 100,
                  else: 0
                }
              },
              {
                $cond: {
                  if: { $regexMatch: { input: { $ifNull: ["$name", ""] }, regex: escapedCorrected, options: "i" } },
                  then: 50,
                  else: {
                    $cond: {
                      if: { $regexMatch: { input: { $ifNull: ["$name", ""] }, regex: escapedSearch, options: "i" } },
                      then: 40,
                      else: 0
                    }
                  }
                }
              },
              {
                $cond: {
                  if: { $regexMatch: { input: { $ifNull: ["$brand", ""] }, regex: escapedCorrected, options: "i" } },
                  then: 30,
                  else: 0
                }
              },
              {
                $cond: {
                  if: { $regexMatch: { input: { $ifNull: ["$category", ""] }, regex: escapedCorrected, options: "i" } },
                  then: 25,
                  else: 0
                }
              },
              {
                $cond: {
                  if: { $regexMatch: { input: { $ifNull: ["$subCategory", ""] }, regex: escapedCorrected, options: "i" } },
                  then: 20,
                  else: 0
                }
              }
            ]
          }
        }
      });
    }

    // Build the count query pipeline (before sorting/skipping/limiting)
    const countPipeline = [...pipeline, { $count: "count" }];
    const countResult = await productModel.aggregate(countPipeline);
    const total = countResult[0]?.count || 0;

    // Apply sorting
    if (sortBy === "price-low") {
      pipeline.push({ $sort: { price: 1 } });
    } else if (sortBy === "price-high") {
      pipeline.push({ $sort: { price: -1 } });
    } else if (sortBy === "name") {
      pipeline.push({ $sort: { name: 1 } });
    } else if (sortBy === "rating" || sortBy === "highest-rated") {
      pipeline.push({ $sort: { avgRating: -1, reviewCount: -1 } });
    } else if (sortBy === "popularity" || sortBy === "best-selling") {
      pipeline.push({ $sort: { reviewCount: -1, avgRating: -1 } });
    } else {
      if (searchTerm && searchMeta) {
        pipeline.push({ $sort: { searchRelevance: -1, avgRating: -1, reviewCount: -1, date: -1, _id: -1 } });
      } else {
        pipeline.push({ $sort: { date: -1, _id: -1 } }); // default to newest
      }
    }

    // Apply skip & limit
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // Project output fields
    pipeline.push({
      $project: {
        name: 1,
        description: 1,
        price: 1,
        originalPrice: 1,
        location: 1,
        images: 1,
        bgRemovedImage: 1,
        category: 1,
        subCategory: 1,
        collection: 1,
        brand: 1,
        stock: 1,
        sizes: 1,
        sku: 1,
        status: 1,
        avgRating: 1,
        reviewCount: 1,
        discountPercent: 1,
        reviews: {
          $map: {
            input: { $ifNull: ["$reviews", []] },
            as: "r",
            in: { rating: "$$r.rating" }
          }
        }
      }
    });

    let products = await productModel.aggregate(pipeline);

    // Batch enrich dynamic media in a single query to avoid N+1 sequential roundtrips
    const uniqueIds = products.map(p => p._id);
    const allMedia = await listingMediaModel.find({ listingId: { $in: uniqueIds } }).sort({ displayOrder: 1 }).lean();
    const mediaMap = {};
    allMedia.forEach(m => {
      const lid = m.listingId.toString();
      if (!mediaMap[lid]) mediaMap[lid] = [];
      mediaMap[lid].push(m);
    });

    const enrichedProducts = products.map(p => {
      const media = mediaMap[p._id.toString()] || [];
      p.media = media;
      if (media.length > 0) {
        const coverItem = media.find(m => m.isCover);
        p.images = media.map(m => m.url);
        if (coverItem) {
          p.images = [coverItem.url, ...media.filter(m => !m.isCover).map(m => m.url)];
        }
      }
      return p;
    });

    const activeFiltersContext = {
      ...parsedAttrs,
      ...(brand ? { brand, Brand: brand } : {}),
      ...(category && category !== "all" ? { category, Category: category } : {}),
      ...(subCategory && subCategory !== "all" ? { subCategory, Subcategory: subCategory } : {})
    };

    // Generate dynamic attribute filters and price range based on the current context query
    const dynamicFilterData = await generateDynamicFilters(query, activeFiltersContext);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      products: enrichedProducts.map(formatProductResponse),
      total,
      page,
      totalPages,
      hasMore: page < totalPages,
      searchMeta: searchMeta || undefined,
      category: resolvedCategoryMeta || undefined,
      filters: dynamicFilterData.filters || {},
      priceRange: dynamicFilterData.priceRange || { min: 0, max: 200000 }
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const removeProduct = async (req, res) => {
  try {
    const { id } = req.body;

    console.log("🔥 Deleting product:", id);

    // 1️⃣ delete product
    const deleted = await productModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Clean up dynamic attribute values and media
    await listingAttributeValueModel.deleteMany({ listingId: id });
    await listingMediaModel.deleteMany({ listingId: id });

    // 2️⃣ remove product from ALL carts
    const users = await userModel.find({ cartData: { $exists: true } });

    for (const user of users) {
      let changed = false;

      for (const key of Object.keys(user.cartData)) {
        const productId = key.split("_")[0];

        if (productId === id) {
          delete user.cartData[key];
          changed = true;
        }
      }

      if (changed) {
        user.markModified("cartData"); // 🔥 VERY IMPORTANT
        await user.save();
      }
    }

    res.json({
      success: true,
      message: "Product removed from products and all carts",
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default removeProduct;

const singleProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (id && id.startsWith("mock_")) {
      const mockProducts = [
        {
          _id: "mock_eb_1",
          name: "boAt Airdopes 141 Wireless Earbuds",
          price: 1299,
          originalPrice: 2990,
          images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80"],
          brand: "boAt",
          category: "electronics",
          stock: 15,
          sizes: ["Standard"],
          rating: 4.5,
          reviews: [{ rating: 5, comment: "Amazing sound!" }],
          specifications: [{ key: "Driver Size", value: "8mm" }, { key: "Playback", value: "42 Hours" }]
        },
        {
          _id: "mock_watch_1",
          name: "Skagen Dress Watch Minimalist Edition",
          price: 3965,
          originalPrice: 7999,
          images: ["https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80"],
          brand: "Skagen",
          category: "watches",
          stock: 8,
          sizes: ["Standard"],
          rating: 4.6,
          reviews: [],
          specifications: [{ key: "Water Resistance", value: "3 ATM" }]
        },
        {
          _id: "mock_shoes_1",
          name: "Nike Air Max Sports Sneakers",
          price: 4999,
          originalPrice: 7999,
          images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80"],
          brand: "Nike",
          category: "sports",
          stock: 5,
          sizes: ["8", "9", "10"],
          rating: 4.8,
          reviews: [],
          specifications: [{ key: "Sole", value: "Rubber" }]
        },
        {
          _id: "mock_bag_1",
          name: "Urban Explorer Travel Backpack",
          price: 1899,
          originalPrice: 3499,
          images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80"],
          brand: "Wildcraft",
          category: "fashion",
          stock: 12,
          sizes: ["Standard"],
          rating: 4.4,
          reviews: [],
          specifications: []
        },
        {
          _id: "mock_perf_1",
          name: "Signature Blue Premium Eau de Parfum",
          price: 999,
          originalPrice: 1999,
          images: ["https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&auto=format&fit=crop&q=80"],
          brand: "Park Avenue",
          category: "beauty",
          stock: 20,
          sizes: ["55ml", "100ml"],
          rating: 4.7,
          reviews: [],
          specifications: []
        },
        {
          _id: "mock_airpods",
          name: "Apple AirPods Pro (2nd Gen)",
          price: 24900,
          originalPrice: 26900,
          images: ["https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80"],
          brand: "Apple",
          category: "electronics",
          stock: 10,
          sizes: ["Standard"],
          rating: 4.9,
          reviews: [],
          specifications: []
        },
        {
          _id: "mock_iphone",
          name: "iPhone 15 Pro Max (256 GB)",
          price: 144900,
          originalPrice: 159900,
          images: ["https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80"],
          brand: "Apple",
          category: "electronics",
          stock: 4,
          sizes: ["128GB", "256GB"],
          rating: 4.9,
          reviews: [],
          specifications: []
        },
        {
          _id: "mock_macbook",
          name: "MacBook Air M2 (13-inch, 8GB RAM)",
          price: 89990,
          originalPrice: 114900,
          images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80"],
          brand: "Apple",
          category: "electronics",
          stock: 6,
          sizes: ["256GB", "512GB"],
          rating: 4.8,
          reviews: [],
          specifications: []
        }
      ];

      const found = mockProducts.find(p => p._id === id);
      if (found) {
        return res.json({
          success: true,
          product: {
            ...found,
            image: found.images[0],
            dynamicAttributes: {}
          }
        });
      }
    }

    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Trigger product view tracking asynchronously (non-blocking)
    trackProductView(product._id, req.user?._id);

    const pObj = product.toObject();

    // Setup dynamicAttributes mapping from specifications for backward compatibility
    const dynAttrs = {};
    if (product.specifications) {
      product.specifications.forEach(s => {
        dynAttrs[s.key] = s.value;
      });
    }
    pObj.dynamicAttributes = dynAttrs;

    // Fetch dynamic media
    const media = await listingMediaModel.find({ listingId: id }).sort({ displayOrder: 1 });
    pObj.media = media;

    res.json({
      success: true,
      product: formatProductResponse(pObj),
    });
  } catch (error) {
    console.log(error);
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const bulkProducts = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing product IDs array"
      });
    }

    const dbIds = ids.filter(id => id && mongoose.Types.ObjectId.isValid(id));
    const mockIds = ids.filter(id => id && String(id).startsWith("mock_"));

    const products = await productModel.find({ _id: { $in: dbIds } });
    const formatted = [];

    for (const prod of products) {
      const pObj = prod.toObject();
      const dynAttrs = {};
      if (prod.specifications) {
        prod.specifications.forEach(s => {
          dynAttrs[s.key] = s.value;
        });
      }
      pObj.dynamicAttributes = dynAttrs;

      const media = await listingMediaModel.find({ listingId: prod._id }).sort({ displayOrder: 1 });
      pObj.media = media;

      formatted.push(formatProductResponse(pObj));
    }

    if (mockIds.length > 0) {
      const mockProducts = [
        {
          _id: "mock_eb_1",
          name: "boAt Airdopes 141 Wireless Earbuds",
          price: 1299,
          originalPrice: 2990,
          images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80"],
          brand: "boAt",
          category: "electronics",
          stock: 15,
          sizes: ["Standard"],
          rating: 4.5,
          specifications: []
        }
      ];
      mockIds.forEach(mId => {
        const found = mockProducts.find(p => p._id === mId);
        if (found) {
          formatted.push({
            ...found,
            image: found.images[0],
            dynamicAttributes: {}
          });
        }
      });
    }

    res.json({
      success: true,
      products: formatted
    });
  } catch (error) {
    console.error("Bulk products fetch error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const addProductReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const numericRating = Number(rating);
    const cleanComment = comment?.trim();

    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (!cleanComment) {
      return res.status(400).json({
        success: false,
        message: "Review is required",
      });
    }

    const product = await productModel.findById(id);
    const user = await userModel.findById(req.user._id).select("name");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingReview = product.reviews.find(
      (review) => review.userId.toString() === req.user._id.toString()
    );

    if (existingReview) {
      existingReview.rating = numericRating;
      existingReview.comment = cleanComment;
      existingReview.name = user.name;
      existingReview.date = Date.now();
    } else {
      product.reviews.push({
        userId: req.user._id,
        name: user.name,
        rating: numericRating,
        comment: cleanComment,
      });
    }

    // Recalculate rating and review count
    const reviewCount = product.reviews.length;
    const ratingSum = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.totalReviews = reviewCount;
    product.averageRating = reviewCount > 0 ? Number((ratingSum / reviewCount).toFixed(2)) : 0;

    await product.save();

    res.json({
      success: true,
      message: existingReview ? "Review updated" : "Review added",
      product: formatProductResponse(product),
    });
  } catch (error) {
    console.log("ADD REVIEW ERROR 👉", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateStock = async (req, res) => {
  try {
    const { id, stock } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID required",
      });
    }

    const parsedStock = Number(stock);
    if (isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative",
      });
    }

    const updated = await productModel.findByIdAndUpdate(
      id,
      { stock: Math.max(0, parseInt(stock, 10) || 0) },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Stock updated successfully",
      product: formatProductResponse(updated),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const generateDescription = async (req, res) => {
  try {
    const { name, category, subCategory, collection, brand, price, sizes } = req.body;

    if (!name) {
      return res.json({ success: false, message: "Product name is required for generation" });
    }

    const promptText = `Write a highly engaging, professional e-commerce product description for a product named "${name}" in the category "${category || "Fashion"}" / "${subCategory || "Clothing"}", collection "${collection || "General"}", brand "${brand || "CartNOW"}". It is priced at ₹${price || 999} and available in sizes: ${sizes || "S, M, L"}. Write a engaging paragraph about features and comfort. Output ONLY the description text, no preamble or extra text.`;

    // 1️⃣ Check for Gemini API Key in environment
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        console.log("Generating description with Google Gemini API...");
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiKey}`,
          {
            contents: [{ parts: [{ text: promptText }] }]
          }
        );
        if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          const desc = response.data.candidates[0].content.parts[0].text.trim();
          return res.json({ success: true, description: desc });
        }
      } catch (geminiError) {
        console.log("Gemini API call failed:", geminiError.message);
      }
    }

    // 2️⃣ Instant high-quality e-commerce template-based NLP generation (Fallback)
    console.log("Generating description with high-quality local NLP template...");
    
    let descriptionText = "";
    const brandName = brand || "CartNOW";
    const subCatName = subCategory || "Apparel";
    const sizeStr = sizes ? `sizes: ${sizes}` : "standard sizes";

    if (category?.toLowerCase() === "electronics") {
      descriptionText = `Experience cutting-edge performance with the all-new ${name} by ${brandName}. Engineered for excellence, this premium ${subCatName} combines state-of-the-art technology with an ergonomic, durable design. Whether you are using it for work or leisure, it delivers seamless functionality, high durability, and top-tier reliability. Available now at ₹${price || 999} for premium tier consumers. Features include advanced efficiency, easy-to-use interface options, and industry-standard warranty protection.`;
    } else if (category?.toLowerCase() === "beauty") {
      descriptionText = `Reveal your natural radiance with the ${name} from ${brandName}. Formulated with high-quality, nourishing ingredients, this ${subCatName} is suitable for all skin types and designed to offer visible, long-lasting results. Perfect for daily routines, it hydrates, refreshes, and leaves a premium feel. Available in standard size options. Add this premium beauty essential to your self-care registry today!`;
    } else if (category?.toLowerCase() === "home" || category?.toLowerCase() === "living") {
      descriptionText = `Enhance your living space with the beautiful and functional ${name} by ${brandName}. Crafted from premium, eco-friendly materials, this ${subCatName} is designed to blend seamlessly into modern interiors while providing maximum utility and comfort. Durable and easy to clean, it adds an instant touch of class to any room. Available in various size specifications to fit your layout.`;
    } else {
      descriptionText = `Elevate your everyday style with the premium ${name} by ${brandName}. Masterfully tailored for the perfect fit, this ${subCatName} is crafted from an ultra-soft, breathable fabric blend to ensure all-day comfort. Featuring a modern, versatile silhouette, it is suitable for both casual outings and polished formal events. Easy to style and wash, it is available in ${sizeStr} to fit your exact measurements. A marquee fashion pick for the modern closet!`;
    }

    return res.json({
      success: true,
      description: descriptionText
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

let categoryCountMapCache = null;
let categoryCountMapCacheTime = 0;

const getCategoriesPublic = async (req, res) => {
  try {
    res.set("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");
    const categories = await categoryModel.find({ status: "active" }).sort({ displayOrder: 1, name: 1 }).lean();
    
    const now = Date.now();
    let countMap = categoryCountMapCache;

    if (!countMap || now - categoryCountMapCacheTime > 120000) {
      const counts = await productModel.aggregate([
        { $match: { isDeleted: { $ne: true }, status: "approved" } },
        { $group: { _id: "$category", count: { $sum: 1 } } }
      ]);
      
      countMap = {};
      counts.forEach(c => {
        if (c._id) {
          countMap[c._id.toLowerCase()] = c.count;
        }
      });

      categoryCountMapCache = countMap;
      categoryCountMapCacheTime = now;
    }

    const enrichedCategories = categories.map(cat => ({
      ...cat,
      count: countMap[cat.name.toLowerCase()] || 0
    }));

    res.json({ success: true, categories: enrichedCategories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCategoryTemplatePublic = async (req, res) => {
  try {
    const { id } = req.params;
    const categoryModel = (await import("../models/categoryModel.js")).default;
    const categorySettingsModel = (await import("../models/categorySettingsModel.js")).default;

    // Check if id is an ObjectId or slug
    let category;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await categoryModel.findById(id);
    } else {
      category = await categoryModel.findOne({ slug: id });
    }

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Load category settings or create default
    let settings = await categorySettingsModel.findOne({ categoryId: category._id });
    if (!settings) {
      settings = {
        categoryId: category._id,
        minImages: 3,
        maxImages: 10,
        requiresApproval: true,
        inventoryTrackingEnabled: true,
        skuRequired: false,
        barcodeRequired: false
      };
    }

    // Find all products in this category
    const products = await productModel.find({
      category: new RegExp(`^${category.name}$`, "i"),
      isDeleted: { $ne: true }
    });

    // Extract unique attribute keys and values
    const attrMap = new Map(); // key -> Set of values
    products.forEach(p => {
      const specs = p.specifications || p.attributes || [];
      specs.forEach(s => {
        if (s.key && s.value) {
          const trimmedKey = s.key.trim();
          const trimmedVal = s.value.trim();
          if (trimmedKey && trimmedVal) {
            if (!attrMap.has(trimmedKey)) {
              attrMap.set(trimmedKey, new Set());
            }
            attrMap.get(trimmedKey).add(trimmedVal);
          }
        }
      });
    });

    const populatedFields = [];
    attrMap.forEach((vals, key) => {
      populatedFields.push({
        _id: key,
        fieldName: key,
        label: key,
        fieldType: "Dropdown",
        isFilterable: true,
        visibleOnSearch: true,
        selectOptions: Array.from(vals)
      });
    });

    res.json({ success: true, fields: populatedFields, settings, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCollectionsPublic = async (req, res) => {
  try {
    const collectionModel = (await import("../models/collectionModel.js")).default;
    let collections = await collectionModel.find({ status: "active" }).sort({ name: 1 });

    const defaultCollections = [
      { name: "Electronics Special", slug: "electronics", description: "Curated flagship devices, accessories & smart gadgetry." },
      { name: "Fashion & Lifestyle", slug: "fashion", description: "Seasonal aesthetics, luxury fabrics & modern street silhouettes." },
      { name: "Home & Living", slug: "home", description: "Minimalist interior accents, ergonomic decor & smart home essentials." },
      { name: "Organic Glow", slug: "beauty", description: "Natural skincare science, herbal peptides & cellular restoration." },
      { name: "Cyber Sneakers", slug: "sports", description: "High-performance outsoles, reactive cushioning & active gear." },
      { name: "Chrono Luxury", slug: "accessories", description: "Swiss precision movements, obsidian craftsmanship & leather accents." }
    ];

    if (!collections || collections.length === 0) {
      collections = defaultCollections;
    }

    const enrichedCollections = [];
    for (const col of collections) {
      const colObj = typeof col.toObject === "function" ? col.toObject() : { ...col };
      const colName = colObj.name || "";
      const colSlug = colObj.slug || colName.toLowerCase().replace(/\s+/g, "-");

      const isNewArrivals = colSlug === "new-arrivals" || colSlug === "new-arrival" || colName.toLowerCase() === "new arrivals";
      const queryFilter = {
        isDeleted: { $ne: true },
        status: "approved"
      };

      if (isNewArrivals) {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        queryFilter.$or = [
          { createdAt: { $gte: sevenDaysAgo } },
          { date: { $gte: sevenDaysAgo } }
        ];
      } else {
        queryFilter.$or = [
          { collection: new RegExp(`^${colName}$`, "i") },
          { collection: new RegExp(`^${colSlug}$`, "i") },
          { collections: { $in: [new RegExp(`^${colName}$`, "i"), new RegExp(`^${colSlug}$`, "i")] } },
          { category: new RegExp(`^${colSlug}$`, "i") },
          { category: new RegExp(`^${colName}$`, "i") }
        ];
      }

      const count = await productModel.countDocuments(queryFilter);
      const sampleProducts = await productModel.find(queryFilter)
        .select("name price originalPrice images bgRemovedImage category brand rating")
        .limit(4);

      colObj.count = count > 0 ? count : (sampleProducts.length > 0 ? sampleProducts.length : 12);
      colObj.sampleProducts = sampleProducts.map(formatProductResponse);
      enrichedCollections.push(colObj);
    }

    // Merge defaults if database has fewer than 3 collections
    if (enrichedCollections.length < 3) {
      const existingSlugs = new Set(enrichedCollections.map(c => c.slug));
      for (const def of defaultCollections) {
        if (!existingSlugs.has(def.slug)) {
          const sampleProducts = await productModel.find({
            isDeleted: { $ne: true },
            status: "approved",
            category: new RegExp(`^${def.slug}$`, "i")
          }).select("name price originalPrice images bgRemovedImage category brand rating").limit(4);

          enrichedCollections.push({
            ...def,
            count: sampleProducts.length > 0 ? sampleProducts.length : 14,
            sampleProducts: sampleProducts.map(formatProductResponse)
          });
        }
      }
    }

    res.json({ success: true, collections: enrichedCollections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBrandsPublic = async (req, res) => {
  try {
    const brandModel = (await import("../models/brandModel.js")).default;
    const brands = await brandModel.find({ status: "active" }).sort({ name: 1 }).lean();

    const brandCounts = await productModel.aggregate([
      { $match: { isDeleted: { $ne: true }, status: "approved" } },
      { $group: { _id: { $toLower: "$brand" }, count: { $sum: 1 } } }
    ]);

    const countMap = {};
    brandCounts.forEach((b) => {
      if (b._id) countMap[b._id] = b.count;
    });

    const enrichedBrands = brands.map((brand) => ({
      ...brand,
      count: countMap[brand.name?.toLowerCase()] || 0
    }));

    res.json({ success: true, brands: enrichedBrands });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= TRACK PRODUCT VIEW API ================= */
const trackProductViewApi = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID required" });
    }
    await trackProductView(productId, req.user?._id);
    res.json({ success: true, message: "View tracked successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= GET HOMEPAGE DATA ================= */
const getHomepageData = async (req, res) => {
  try {
    const userId = req.user?._id;

    // Constrained fields to select for homepage product items
    const productFields = "_id name description price originalPrice images bgRemovedImage category brand stock sizes location reviews averageRating totalReviews createdAt viewCount wishlistCount cartCount purchaseCount totalSold status isDeleted";

    // Batch enrich media to avoid N+1 query pattern across 7+ arrays
    const enrichProductListBulk = async (products) => {
      const uniqueIds = [...new Set(products.map(p => p._id.toString()))];
      if (uniqueIds.length === 0) return;

      const listingMediaModel = (await import("../models/listingMediaModel.js")).default;
      const allMedia = await listingMediaModel.find({ listingId: { $in: uniqueIds } })
        .sort({ displayOrder: 1 })
        .lean();

      const mediaMap = {};
      allMedia.forEach(m => {
        const lid = m.listingId.toString();
        if (!mediaMap[lid]) mediaMap[lid] = [];
        mediaMap[lid].push(m);
      });

      products.forEach(p => {
        const media = mediaMap[p._id.toString()] || [];
        p.media = media;
        if (media.length > 0) {
          const coverItem = media.find(m => m.isCover);
          p.images = media.map(m => m.url);
          if (coverItem) {
            p.images = [coverItem.url, ...media.filter(m => !m.isCover).map(m => m.url)];
          }
        }
      });
    };

    const PUBLIC_HOMEPAGE_CACHE_KEY = "public_homepage_data_v2";
    let publicData = await cacheGet(PUBLIC_HOMEPAGE_CACHE_KEY);

    if (!publicData) {
      // Parallelize all independent queries on cache miss
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() - 60);

      const newArrivalsPromise = productModel.find({
        status: "approved",
        isDeleted: { $ne: true },
        createdAt: { $gte: thresholdDate }
      }).select(productFields).sort({ createdAt: -1 }).limit(10).lean();

      const trendingPromise = productModel.aggregate([
        { $match: { status: "approved", isDeleted: { $ne: true } } },
        {
          $addFields: {
            trendingScore: {
              $add: [
                { $multiply: [{ $ifNull: ["$viewCount", 0] }, 1] },
                { $multiply: [{ $ifNull: ["$wishlistCount", 0] }, 3] },
                { $multiply: [{ $ifNull: ["$cartCount", 0] }, 5] },
                { $multiply: [{ $ifNull: ["$purchaseCount", 0] }, 10] }
              ]
            }
          }
        },
        { $sort: { trendingScore: -1, createdAt: -1 } },
        { $limit: 10 },
        {
          $project: {
            _id: 1, name: 1, description: 1, price: 1, originalPrice: 1, images: 1, bgRemovedImage: 1,
            category: 1, brand: 1, stock: 1, sizes: 1, location: 1, reviews: 1,
            averageRating: 1, totalReviews: 1, createdAt: 1, viewCount: 1,
            wishlistCount: 1, cartCount: 1, purchaseCount: 1, totalSold: 1,
            status: 1, isDeleted: 1
          }
        }
      ]);

      const bestSellersPromise = productModel.find({
        status: "approved",
        isDeleted: { $ne: true }
      }).select(productFields).sort({ totalSold: -1, createdAt: -1 }).limit(10).lean();

      const mostViewedPromise = productModel.find({
        status: "approved",
        isDeleted: { $ne: true }
      }).select(productFields).sort({ viewCount: -1, createdAt: -1 }).limit(10).lean();

      const mostWishlistedPromise = productModel.find({
        status: "approved",
        isDeleted: { $ne: true }
      }).select(productFields).sort({ wishlistCount: -1, createdAt: -1 }).limit(10).lean();

      const topRatedPromise = productModel.find({
        status: "approved",
        isDeleted: { $ne: true },
        totalReviews: { $gte: 20 }
      }).select(productFields).sort({ averageRating: -1, totalReviews: -1 }).limit(10).lean();

      const brandModel = (await import("../models/brandModel.js")).default;
      const popularBrandsPromise = brandModel.aggregate([
        { $match: { status: "active" } },
        {
          $addFields: {
            brandScore: {
              $add: [
                { $ifNull: ["$totalViews", 0] },
                { $multiply: [{ $ifNull: ["$totalSales", 0] }, 5] }
              ]
            }
          }
        },
        { $sort: { brandScore: -1, name: 1 } },
        { $limit: 10 }
      ]);

      const collectionModel = (await import("../models/collectionModel.js")).default;
      const trendingCollectionsPromise = collectionModel.aggregate([
        { $match: { status: "active" } },
        {
          $addFields: {
            collectionScore: {
              $add: [
                { $ifNull: ["$totalViews", 0] },
                { $ifNull: ["$totalClicks", 0] },
                { $multiply: [{ $ifNull: ["$totalSales", 0] }, 5] }
              ]
            }
          }
        },
        { $sort: { collectionScore: -1, name: 1 } },
        { $limit: 10 }
      ]);

      const categoryModel = (await import("../models/categoryModel.js")).default;
      const popularCategoriesPromise = categoryModel.aggregate([
        { $match: { status: "active" } },
        {
          $addFields: {
            categoryScore: {
              $add: [
                { $ifNull: ["$totalViews", 0] },
                { $ifNull: ["$totalSearches", 0] },
                { $multiply: [{ $ifNull: ["$totalSales", 0] }, 5] }
              ]
            }
          }
        },
        { $sort: { categoryScore: -1, name: 1 } },
        { $limit: 10 }
      ]);

      const searchQueryModel = (await import("../models/searchQueryModel.js")).default;
      const searchLogsPromise = searchQueryModel.find({})
        .sort({ count: -1, lastSearched: -1 })
        .limit(10)
        .lean();

      const dealsPromise = productModel.aggregate([
        {
          $match: {
            status: "approved",
            isDeleted: { $ne: true },
            originalPrice: { $gt: 0 },
            $expr: { $lt: ["$price", "$originalPrice"] }
          }
        },
        {
          $addFields: {
            discountPercent: {
              $multiply: [
                { $divide: [{ $subtract: ["$originalPrice", "$price"] }, "$originalPrice"] },
                100
              ]
            }
          }
        },
        { $sort: { discountPercent: -1 } },
        { $limit: 10 },
        {
          $project: {
            _id: 1, name: 1, description: 1, price: 1, originalPrice: 1, images: 1, bgRemovedImage: 1,
            category: 1, brand: 1, stock: 1, sizes: 1, location: 1, reviews: 1,
            averageRating: 1, totalReviews: 1, createdAt: 1, viewCount: 1,
            wishlistCount: 1, cartCount: 1, purchaseCount: 1, totalSold: 1,
            status: 1, isDeleted: 1
          }
        }
      ]);

      const dealOfDayModel = (await import("../models/dealOfDayModel.js")).default;
      const now = new Date();
      const activeDealPromise = dealOfDayModel.findOne({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
      }).populate({
        path: "productId",
        select: productFields
      }).lean();

      const [
        newArrivalsRaw,
        trendingRaw,
        bestSellersRaw,
        mostViewedRaw,
        mostWishlistedRaw,
        topRatedRaw,
        popularBrands,
        trendingCollections,
        popularCategories,
        searchLogs,
        dealsRaw,
        activeDealRaw
      ] = await Promise.all([
        newArrivalsPromise,
        trendingPromise,
        bestSellersPromise,
        mostViewedPromise,
        mostWishlistedPromise,
        topRatedPromise,
        popularBrandsPromise,
        trendingCollectionsPromise,
        popularCategoriesPromise,
        searchLogsPromise,
        dealsPromise,
        activeDealPromise
      ]);

      // Backfill top rated if not enough items
      let topRatedList = topRatedRaw;
      if (topRatedList.length < 4) {
        const existingIds = topRatedList.map(p => p._id);
        const additionalRated = await productModel.find({
          status: "approved",
          isDeleted: { $ne: true },
          _id: { $nin: existingIds }
        }).select(productFields).sort({ averageRating: -1, totalReviews: -1 }).limit(10 - topRatedList.length).lean();
        topRatedList = [...topRatedList, ...additionalRated];
      }

      // Backfill new arrivals if not enough items
      let newArrivalsList = newArrivalsRaw;
      if (newArrivalsList.length < 4) {
        newArrivalsList = await productModel.find({
          status: "approved",
          isDeleted: { $ne: true }
        }).select(productFields).sort({ createdAt: -1 }).limit(10).lean();
      }

      // Consolidate all products across lists to perform media enrichment in a single database call
      const allProductsToEnrich = [
        ...newArrivalsList,
        ...trendingRaw,
        ...bestSellersRaw,
        ...mostViewedRaw,
        ...mostWishlistedRaw,
        ...topRatedList,
        ...dealsRaw
      ];
      if (activeDealRaw && activeDealRaw.productId) {
        allProductsToEnrich.push(activeDealRaw.productId);
      }

      await enrichProductListBulk(allProductsToEnrich);

      const newArrivals = newArrivalsList.map(formatProductResponse);
      const trending = trendingRaw.map(formatProductResponse);
      const bestSellers = bestSellersRaw.map(formatProductResponse);
      const mostViewed = mostViewedRaw.map(formatProductResponse);
      const mostWishlisted = mostWishlistedRaw.map(formatProductResponse);
      const topRated = topRatedList.map(formatProductResponse);
      const dealsOfDay = dealsRaw.map(formatProductResponse);

      let activeDeal = null;
      if (activeDealRaw && activeDealRaw.productId) {
        const deal = { ...activeDealRaw };
        deal.productId = formatProductResponse(deal.productId);
        activeDeal = deal;
      }

      const searchSuggestions = searchLogs.map(log => log.query);

      publicData = {
        newArrivals,
        trending,
        bestSellers,
        mostViewed,
        mostWishlisted,
        topRated,
        dealsOfDay,
        popularBrands,
        trendingCollections,
        popularCategories,
        searchSuggestions,
        activeDeal
      };

      // Set public homepage cache with 5-minute TTL
      await cacheSet(PUBLIC_HOMEPAGE_CACHE_KEY, publicData, 300);
    }

    // Handle user-specific data dynamically
    let recentlyViewed = [];
    let recommended = [];

    if (userId) {
      const recentlyViewedModel = (await import("../models/recentlyViewedModel.js")).default;
      const logs = await recentlyViewedModel.find({ userId })
        .sort({ lastViewed: -1 })
        .limit(10)
        .populate({
          path: "productId",
          select: productFields
        })
        .lean();
      
      const rvProducts = logs
        .map(l => l.productId)
        .filter(p => p && p.status === "approved" && !p.isDeleted);
      
      if (rvProducts.length > 0) {
        await enrichProductListBulk(rvProducts);
        recentlyViewed = rvProducts.map(formatProductResponse);
      }

      // User recommendation calculation
      const user = await userModel.findById(userId).select("wishlistData").lean();
      const categoryFreq = {};
      const brandFreq = {};

      if (user?.wishlistData && user.wishlistData.length > 0) {
        const wishProducts = await productModel.find({ _id: { $in: user.wishlistData } })
          .select("category brand")
          .lean();
        wishProducts.forEach(p => {
          if (p.category) categoryFreq[p.category] = (categoryFreq[p.category] || 0) + 3;
          if (p.brand) brandFreq[p.brand] = (brandFreq[p.brand] || 0) + 3;
        });
      }

      const rvLogs = await recentlyViewedModel.find({ userId }).limit(10).populate({
        path: "productId",
        select: "category brand status isDeleted"
      }).lean();
      rvLogs.forEach(log => {
        const p = log.productId;
        if (p && p.status === "approved" && !p.isDeleted) {
          if (p.category) categoryFreq[p.category] = (categoryFreq[p.category] || 0) + 1;
          if (p.brand) brandFreq[p.brand] = (brandFreq[p.brand] || 0) + 1;
        }
      });

      const orderModel = (await import("../models/orderModel.js")).default;
      const orders = await orderModel.find({ userId, paymentStatus: "paid" })
        .select("items")
        .lean();
      const purchasedIds = [];
      orders.forEach(o => {
        if (o.items) {
          o.items.forEach(item => {
            const pid = item.productId || item._id || item.itemId;
            if (pid) purchasedIds.push(pid);
          });
        }
      });

      if (purchasedIds.length > 0) {
        const purProducts = await productModel.find({ _id: { $in: purchasedIds } })
          .select("category brand")
          .lean();
        purProducts.forEach(p => {
          if (p.category) categoryFreq[p.category] = (categoryFreq[p.category] || 0) + 5;
          if (p.brand) brandFreq[p.brand] = (brandFreq[p.brand] || 0) + 5;
        });
      }

      let topCategory = null;
      let topBrand = null;
      let maxCatVal = 0;
      let maxBrandVal = 0;

      Object.entries(categoryFreq).forEach(([cat, val]) => {
        if (val > maxCatVal) {
          maxCatVal = val;
          topCategory = cat;
        }
      });
      Object.entries(brandFreq).forEach(([br, val]) => {
        if (val > maxBrandVal) {
          maxBrandVal = val;
          topBrand = br;
        }
      });

      const recQuery = { status: "approved", isDeleted: { $ne: true } };
      if (topCategory && topBrand) {
        recQuery.$or = [{ category: topCategory }, { brand: topBrand }];
      } else if (topCategory) {
        recQuery.category = topCategory;
      } else if (topBrand) {
        recQuery.brand = topBrand;
      }

      if (topCategory || topBrand) {
        const recList = await productModel.find(recQuery)
          .select(productFields)
          .sort({ viewCount: -1, totalSold: -1 })
          .limit(10)
          .lean();
        if (recList.length > 0) {
          await enrichProductListBulk(recList);
          recommended = recList.map(formatProductResponse);
        }
      }
    }

    if (recommended.length < 4) {
      const trendingIds = new Set(recommended.map(p => p._id.toString()));
      const additional = publicData.trending.filter(p => !trendingIds.has(p._id.toString()));
      recommended = [...recommended, ...additional].slice(0, 10);
    }

    res.json({
      success: true,
      ...publicData,
      recentlyViewed,
      recommended
    });
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= GET SEARCH SUGGESTIONS ================= */
const getSearchSuggestions = async (req, res) => {
  try {
    const { q, search } = req.query;
    const queryTerm = (q || search || "").trim();
    const searchQueryModel = (await import("../models/searchQueryModel.js")).default;
    
    if (queryTerm) {
      const analysis = analyzeSearchTerm(queryTerm);
      const keywords = analysis.allKeywords.filter(k => k.length >= 2);
      
      const searchLogs = await searchQueryModel.find({
        query: { $in: keywords.map(k => new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")) }
      })
      .sort({ count: -1 })
      .limit(6);
      
      let suggestions = searchLogs.map(log => log.query);
      if (analysis.didYouMean && !suggestions.includes(analysis.didYouMean)) {
        suggestions.unshift(analysis.didYouMean);
      }
      return res.json({ success: true, suggestions, searchMeta: analysis });
    }

    const searchLogs = await searchQueryModel.find({})
      .sort({ count: -1, lastSearched: -1 })
      .limit(10);
    const suggestions = searchLogs.map(log => log.query);
    res.json({ success: true, suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get active, scheduled featured products for showcase carousel
// @route   GET /api/product/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 12, 24);
    const now = new Date();

    // Query active, in-stock products with valid featured dates
    const query = {
      status: "approved",
      isDeleted: { $ne: true },
      stock: { $gt: 0 },
      isFeatured: true,
      $and: [
        { $or: [{ featuredStartDate: null }, { featuredStartDate: { $lte: now } }] },
        { $or: [{ featuredEndDate: null }, { featuredEndDate: { $gte: now } }] }
      ]
    };

    let products = await productModel.find(query)
      .select("_id name slug category brand price originalPrice featuredDiscount images bgRemovedImage description shortDescription rating averageRating totalReviews stock isFeatured featuredPriority featuredStartDate featuredEndDate")
      .sort({ featuredPriority: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    // If fewer than limit products have isFeatured: true, supplement with top approved products with stock > 0
    if (products.length < limit) {
      const existingIds = products.map(p => p._id);
      const additionalProducts = await productModel.find({
        _id: { $nin: existingIds },
        status: "approved",
        isDeleted: { $ne: true },
        stock: { $gt: 0 }
      })
      .select("_id name slug category brand price originalPrice featuredDiscount images bgRemovedImage description shortDescription rating averageRating totalReviews stock isFeatured featuredPriority featuredStartDate featuredEndDate")
      .sort({ totalSold: -1, averageRating: -1, createdAt: -1 })
      .limit(limit - products.length)
      .lean();

      products = [...products, ...additionalProducts];
    }

    const formattedProducts = products.map(p => {
      const origPrice = p.originalPrice && p.originalPrice > p.price ? p.originalPrice : Math.round(p.price * 1.35);
      const computedDiscount = Math.max(5, Math.round(((origPrice - p.price) / origPrice) * 100));
      const discountPercentage = p.featuredDiscount > 0 ? p.featuredDiscount : computedDiscount;

      return {
        _id: p._id,
        name: p.name,
        slug: p.slug || "",
        category: p.category || "Deals",
        brand: p.brand || "",
        price: p.price,
        originalPrice: origPrice,
        discountPercentage,
        images: p.images || [],
        description: p.description || "",
        shortDescription: p.shortDescription || (p.description ? p.description.slice(0, 140) + "..." : "Handpicked premium product at an exclusive discounted price."),
        rating: p.rating?.average || p.averageRating || 4.7,
        reviewCount: p.rating?.count || p.totalReviews || 128,
        stock: p.stock,
        isFeatured: Boolean(p.isFeatured),
        featuredPriority: p.featuredPriority || 0,
        featuredStartDate: p.featuredStartDate || null,
        featuredEndDate: p.featuredEndDate || null
      };
    });

    res.json({ success: true, products: formattedProducts });
  } catch (error) {
    console.error("getFeaturedProducts error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Update product featured status, promotion dates, discount & priority
// @route   PUT /api/product/featured/:id
// @access  Private (Admin)
const updateProductFeaturedStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      isFeatured,
      featuredPriority,
      featuredDiscount,
      featuredStartDate,
      featuredEndDate
    } = req.body;

    const updateData = {
      isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : true,
      featuredPriority: Number(featuredPriority) || 0,
      featuredDiscount: Number(featuredDiscount) || 0,
      featuredStartDate: featuredStartDate ? new Date(featuredStartDate) : null,
      featuredEndDate: featuredEndDate ? new Date(featuredEndDate) : null
    };

    const updated = await productModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Clear public homepage cache so changes show immediately
    await cacheDel("public_homepage_data_v2");

    res.json({
      success: true,
      message: updated.isFeatured ? "Product added to Featured Carousel" : "Product removed from Featured Carousel",
      product: updated
    });
  } catch (error) {
    console.error("updateProductFeaturedStatus error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: List all featured products for admin table
// @route   GET /api/product/featured/admin
// @access  Private (Admin)
const listFeaturedProductsAdmin = async (req, res) => {
  try {
    const products = await productModel.find({ isFeatured: true, isDeleted: { $ne: true } })
      .select("_id name category brand price originalPrice featuredDiscount images stock status isFeatured featuredPriority featuredStartDate featuredEndDate createdAt")
      .sort({ featuredPriority: -1, createdAt: -1 })
      .lean();

    res.json({ success: true, products });
  } catch (error) {
    console.error("listFeaturedProductsAdmin error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  addProducts,
  listProducts,
  removeProduct,
  singleProduct,
  bulkProducts,
  addProductReview,
  updateStock,
  generateDescription,
  getCategoriesPublic,
  getCategoryTemplatePublic,
  getCollectionsPublic,
  getBrandsPublic,
  trackProductViewApi,
  getHomepageData,
  getSearchSuggestions,
  getFeaturedProducts,
  updateProductFeaturedStatus,
  listFeaturedProductsAdmin
};

