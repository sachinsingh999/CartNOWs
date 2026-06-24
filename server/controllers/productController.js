import mongoose from "mongoose";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";
import categoryAttributeModel from "../models/categoryAttributeModel.js";
import listingAttributeValueModel from "../models/listingAttributeValueModel.js";
import listingMediaModel from "../models/listingMediaModel.js";
import { trackProductView, trackSearch } from "../utils/analyticsHelper.js";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

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

    const productData = {
      name,
      description,
      price: Number(price),
      category,
      subCategory: subCategory || "",
      collection: collection || "",
      brand: brand || "",
      sku: sku || "",
      stock: Number(stock) || 0,
      sizes: sizeArray,
      tags: tagArray,
      specifications: specificationArray,
      images
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
    const { category, categories, subCategory, collection, audience, brand, price, rating, q, search, attributes, location, discount, availability } = req.query;
    const searchTerm = search || q;

    // Build core query
    const query = { isDeleted: { $ne: true }, status: "approved" };
    
    // Category filter
    if (categories) {
      const categoryModel = (await import("../models/categoryModel.js")).default;
      const adminCats = await categoryModel.find({ status: "active" });
      const categoryIdList = categories.split(",").map(id => id.trim()).filter(id => mongoose.Types.ObjectId.isValid(id));
      
      if (categoryIdList.length > 0) {
        let allowedCategories = [];
        
        categoryIdList.forEach(catId => {
          const selectedCatDoc = adminCats.find(c => c._id.toString() === catId);
          if (selectedCatDoc) {
            allowedCategories.push(selectedCatDoc.name);
            if (selectedCatDoc.subcategories) {
              allowedCategories.push(...selectedCatDoc.subcategories);
            }
            // Find children that have this parentCategoryId
            const childrenDocs = adminCats.filter(c => c.parentCategoryId?.toString() === catId);
            allowedCategories.push(...childrenDocs.map(c => c.name));
          }
        });

        // Category mapping expansions for database compatibility
        const lowerAllowed = allowedCategories.map(c => c.toLowerCase());
        if (lowerAllowed.includes("fashion")) {
          allowedCategories.push(
            "Fashion", "Men", "Women", "Kids", "Accessories", "Footwear",
            "Fashion (Men)", "Fashion (Women)", "Fashion (Kids)",
            "clothing", "apparel", "shirts", "trousers", "t-shirts", "jackets", "sportswear", "jeans"
          );
        }
        if (lowerAllowed.includes("electrinocs") || lowerAllowed.includes("electronics")) {
          allowedCategories.push("Electronics", "Electrinocs");
        }

        if (allowedCategories.length > 0) {
          query.category = { $in: allowedCategories.map(c => new RegExp(`^${c}$`, "i")) };
        }
      }
    } else if (category && category !== "all") {
      const categoryModel = (await import("../models/categoryModel.js")).default;
      const adminCats = await categoryModel.find({ status: "active" });
      const selectedCatDoc = adminCats.find(c => c.name.toLowerCase() === category.toLowerCase());
      if (selectedCatDoc) {
        const childrenDocs = adminCats.filter(c => c.parentCategoryId?.toString() === selectedCatDoc._id.toString());
        let allowedCategories = [
          selectedCatDoc.name,
          ...(selectedCatDoc.subcategories || []),
          ...childrenDocs.map(c => c.name)
        ];

        // Category mapping expansions for database compatibility
        const lowerAllowed = allowedCategories.map(c => c.toLowerCase());
        if (lowerAllowed.includes("fashion")) {
          allowedCategories.push(
            "Fashion", "Men", "Women", "Kids", "Accessories", "Footwear",
            "Fashion (Men)", "Fashion (Women)", "Fashion (Kids)",
            "clothing", "apparel", "shirts", "trousers", "t-shirts", "jackets", "sportswear", "jeans"
          );
        }
        if (lowerAllowed.includes("electrinocs") || lowerAllowed.includes("electronics")) {
          allowedCategories.push("Electronics", "Electrinocs");
        }

        // Case-insensitive query match
        query.category = { $in: allowedCategories.map(c => new RegExp(`^${c}$`, "i")) };
      } else {
        if (["men", "women", "kids", "kid"].includes(category.toLowerCase())) {
          const cleanGen = category.toLowerCase() === "kid" ? "kids" : category.toLowerCase();
          query.$or = [
            { category: new RegExp(`^${category}$`, "i") },
            { collection: new RegExp(`^${cleanGen}$`, "i") },
            { collections: { $in: [new RegExp(`^${cleanGen}$`, "i")] } },
            { audience: new RegExp(`^${cleanGen}$`, "i") },
            { audience: new RegExp(`^${category}$`, "i") }
          ];
        } else {
          query.category = new RegExp(`^${category}$`, "i");
        }
      }
    }

    // Subcategory filter (comma-separated or single)
    if (subCategory) {
      const subArray = Array.isArray(subCategory) ? subCategory : subCategory.split(",").map(s => s.trim()).filter(Boolean);
      if (subArray.length > 0) {
        query.subCategory = { $in: subArray.map(s => new RegExp(`^${s}$`, "i")) };
      }
    }

    // Collection filter (matches both collection string, collections array, or audience fallback)
    if (collection && collection !== "all") {
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

    // Optimized Keyword-Based Text Search
    if (searchTerm) {
      trackSearch(searchTerm, category || null);
      const keywordsList = searchTerm.trim().split(/\s+/).filter(Boolean);
      if (keywordsList.length > 0) {
        query.$and = query.$and || [];
        keywordsList.forEach(word => {
          const wordRegex = new RegExp(word, "i");
          query.$and.push({
            $or: [
              { name: wordRegex },
              { description: wordRegex },
              { brand: wordRegex },
              { category: wordRegex },
              { subCategory: wordRegex },
              { tags: { $in: [wordRegex] } },
              { keywords: { $in: [wordRegex] } },
              { collections: { $in: [wordRegex] } },
              { audience: wordRegex }
            ]
          });
        });
      }
    }

    // Dynamic Attribute Filters
    let parsedAttrs = {};
    if (attributes) {
      try {
        parsedAttrs = typeof attributes === "string" ? JSON.parse(attributes) : attributes;
      } catch (e) {}
    }

    const attrFilterKeys = Object.keys(parsedAttrs).filter(k => {
      const val = parsedAttrs[k];
      if (val === undefined || val === null || val === "") return false;
      if (Array.isArray(val) && val.length === 0) return false;
      return true;
    });

    if (attrFilterKeys.length > 0) {
      if (!query.$and) query.$and = [];
      attrFilterKeys.forEach(key => {
        const valFilter = parsedAttrs[key];
        if (Array.isArray(valFilter)) {
          query.$and.push({
            specifications: {
              $elemMatch: {
                key: new RegExp(`^${key}$`, "i"),
                value: { $in: valFilter }
              }
            }
          });
        } else if (typeof valFilter === "object") {
          const rangeCond = {};
          if (valFilter.min !== undefined) rangeCond.$gte = Number(valFilter.min);
          if (valFilter.max !== undefined) rangeCond.$lte = Number(valFilter.max);
          query.$and.push({
            specifications: {
              $elemMatch: {
                key: new RegExp(`^${key}$`, "i"),
                value: rangeCond
              }
            }
          });
        } else {
          query.$and.push({
            specifications: {
              $elemMatch: {
                key: new RegExp(`^${key}$`, "i"),
                value: valFilter
              }
            }
          });
        }
      });
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
      pipeline.push({ $sort: { date: -1, _id: -1 } }); // default to newest
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

    // Populate each product with dynamic media if available
    const enrichedProducts = [];
    for (const p of products) {
      const media = await listingMediaModel.find({ listingId: p._id }).sort({ displayOrder: 1 });
      p.media = media;
      if (media.length > 0) {
        const coverItem = media.find(m => m.isCover);
        p.images = media.map(m => m.url);
        if (coverItem) {
          p.images = [coverItem.url, ...media.filter(m => !m.isCover).map(m => m.url)];
        }
      }
      enrichedProducts.push(p);
    }

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      products: enrichedProducts,
      total,
      page,
      totalPages,
      hasMore: page < totalPages
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
      product: pObj,
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
      product,
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

    const updated = await productModel.findByIdAndUpdate(
      id,
      { stock: Number(stock) || 0 },
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
      product: updated,
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

const getCategoriesPublic = async (req, res) => {
  try {
    const categoryModel = (await import("../models/categoryModel.js")).default;
    const categories = await categoryModel.find({ status: "active" }).sort({ displayOrder: 1, name: 1 });
    
    // Aggregate product counts
    const counts = await productModel.aggregate([
      { $match: { isDeleted: { $ne: true }, status: "approved" } },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    
    const countMap = {};
    counts.forEach(c => {
      if (c._id) {
        countMap[c._id.toLowerCase()] = c.count;
      }
    });

    const enrichedCategories = categories.map(cat => {
      const catObj = cat.toObject();
      catObj.count = countMap[cat.name.toLowerCase()] || 0;
      return catObj;
    });

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
    const collections = await collectionModel.find({ status: "active" }).sort({ name: 1 });

    const enrichedCollections = [];
    for (const col of collections) {
      const colObj = col.toObject();
      const count = await productModel.countDocuments({
        isDeleted: { $ne: true },
        status: "approved",
        $or: [
          { collection: new RegExp(`^${col.name}$`, "i") },
          { collection: new RegExp(`^${col.slug}$`, "i") },
          { collections: { $in: [new RegExp(`^${col.name}$`, "i"), new RegExp(`^${col.slug}$`, "i")] } }
        ]
      });
      colObj.count = count;
      enrichedCollections.push(colObj);
    }

    res.json({ success: true, collections: enrichedCollections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBrandsPublic = async (req, res) => {
  try {
    const brandModel = (await import("../models/brandModel.js")).default;
    const brands = await brandModel.find({ status: "active" }).sort({ name: 1 });

    const enrichedBrands = [];
    for (const brand of brands) {
      const brandObj = brand.toObject();
      const count = await productModel.countDocuments({
        isDeleted: { $ne: true },
        status: "approved",
        brand: new RegExp(`^${brand.name}$`, "i")
      });
      brandObj.count = count;
      enrichedBrands.push(brandObj);
    }

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

    // Helper to enrich dynamic media
    const enrichProductList = async (productsList) => {
      const listingMediaModel = (await import("../models/listingMediaModel.js")).default;
      const enriched = [];
      for (const item of productsList) {
        const p = item.toObject ? item.toObject() : item;
        const media = await listingMediaModel.find({ listingId: p._id }).sort({ displayOrder: 1 });
        p.media = media;
        if (media && media.length > 0) {
          const coverItem = media.find(m => m.isCover);
          p.images = media.map(m => m.url);
          if (coverItem) {
            p.images = [coverItem.url, ...media.filter(m => !m.isCover).map(m => m.url)];
          }
        }
        enriched.push(p);
      }
      return enriched;
    };

    // 1. New Arrivals: Approved products, sorted by createdAt DESC or date DESC.
    // Filter to last 60 days if possible, or fall back to overall newest.
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - 60);

    let newArrivalsList = await productModel.find({
      status: "approved",
      isDeleted: { $ne: true },
      createdAt: { $gte: thresholdDate }
    }).sort({ createdAt: -1 }).limit(10);

    if (newArrivalsList.length < 4) {
      newArrivalsList = await productModel.find({
        status: "approved",
        isDeleted: { $ne: true }
      }).sort({ createdAt: -1 }).limit(10);
    }
    const newArrivals = await enrichProductList(newArrivalsList);

    // 2. Trending: Highest engagement score: views * 1 + wishlist * 3 + cart * 5 + purchases * 10
    const trendingList = await productModel.aggregate([
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
      { $limit: 10 }
    ]);
    const trending = await enrichProductList(trendingList);

    // 3. Best Sellers: Highest sales
    const bestSellersList = await productModel.find({
      status: "approved",
      isDeleted: { $ne: true }
    }).sort({ totalSold: -1, createdAt: -1 }).limit(10);
    const bestSellers = await enrichProductList(bestSellersList);

    // 4. Most Viewed: Highest views
    const mostViewedList = await productModel.find({
      status: "approved",
      isDeleted: { $ne: true }
    }).sort({ viewCount: -1, createdAt: -1 }).limit(10);
    const mostViewed = await enrichProductList(mostViewedList);

    // 5. Most Wishlisted: Highest wishlist count
    const mostWishlistedList = await productModel.find({
      status: "approved",
      isDeleted: { $ne: true }
    }).sort({ wishlistCount: -1, createdAt: -1 }).limit(10);
    const mostWishlisted = await enrichProductList(mostWishlistedList);

    // 6. Top Rated: Average rating DESC (minimum 20 reviews, fallback backfill)
    let topRatedList = await productModel.find({
      status: "approved",
      isDeleted: { $ne: true },
      totalReviews: { $gte: 20 }
    }).sort({ averageRating: -1, totalReviews: -1 }).limit(10);

    if (topRatedList.length < 4) {
      const existingIds = topRatedList.map(p => p._id);
      const additionalRated = await productModel.find({
        status: "approved",
        isDeleted: { $ne: true },
        _id: { $nin: existingIds }
      }).sort({ averageRating: -1, totalReviews: -1 }).limit(10 - topRatedList.length);
      topRatedList = [...topRatedList, ...additionalRated];
    }
    const topRated = await enrichProductList(topRatedList);

    // 7. Recently Viewed (User-specific)
    let recentlyViewed = [];
    if (userId) {
      const recentlyViewedModel = (await import("../models/recentlyViewedModel.js")).default;
      const logs = await recentlyViewedModel.find({ userId })
        .sort({ lastViewed: -1 })
        .limit(10)
        .populate("productId");
      
      const rvProducts = logs
        .map(l => l.productId)
        .filter(p => p && p.status === "approved" && !p.isDeleted);
      recentlyViewed = await enrichProductList(rvProducts);
    }

    // 8. Recommended For You: Categories, brands, products viewed/wishlisted/purchased
    let recommended = [];
    if (userId) {
      const user = await userModel.findById(userId);
      const categoryFreq = {};
      const brandFreq = {};

      if (user?.wishlistData && user.wishlistData.length > 0) {
        const wishProducts = await productModel.find({ _id: { $in: user.wishlistData } });
        wishProducts.forEach(p => {
          if (p.category) categoryFreq[p.category] = (categoryFreq[p.category] || 0) + 3;
          if (p.brand) brandFreq[p.brand] = (brandFreq[p.brand] || 0) + 3;
        });
      }

      const recentlyViewedModel = (await import("../models/recentlyViewedModel.js")).default;
      const rvLogs = await recentlyViewedModel.find({ userId }).limit(10).populate("productId");
      rvLogs.forEach(log => {
        const p = log.productId;
        if (p) {
          if (p.category) categoryFreq[p.category] = (categoryFreq[p.category] || 0) + 1;
          if (p.brand) brandFreq[p.brand] = (brandFreq[p.brand] || 0) + 1;
        }
      });

      const orderModel = (await import("../models/orderModel.js")).default;
      const orders = await orderModel.find({ userId, paymentStatus: "paid" });
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
        const purProducts = await productModel.find({ _id: { $in: purchasedIds } });
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
          .sort({ viewCount: -1, totalSold: -1 })
          .limit(10);
        recommended = await enrichProductList(recList);
      }
    }

    if (recommended.length < 4) {
      // Backfill with trending
      const trendingIds = new Set(recommended.map(p => p._id.toString()));
      const additional = trending.filter(p => !trendingIds.has(p._id.toString()));
      recommended = [...recommended, ...additional].slice(0, 10);
    }

    // 9. Deals of the Day: Highest discount percentage
    const dealsList = await productModel.aggregate([
      {
        $match: {
          status: "approved",
          isDeleted: { $ne: true },
          originalPrice: { $gt: 0 },
          price: { $lt: "$originalPrice" }
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
      { $limit: 10 }
    ]);
    const dealsOfDay = await enrichProductList(dealsList);

    // 10. Popular Brands: Rank by totalViews + totalSales
    const brandModel = (await import("../models/brandModel.js")).default;
    const popularBrands = await brandModel.aggregate([
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

    // 11. Trending Collections: Rank by totalViews + totalClicks + totalSales
    const collectionModel = (await import("../models/collectionModel.js")).default;
    const trendingCollections = await collectionModel.aggregate([
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

    // 12. Popular Categories: Rank by totalViews + totalSales + totalSearches
    const categoryModel = (await import("../models/categoryModel.js")).default;
    const popularCategories = await categoryModel.aggregate([
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

    // 13. Search Suggestions: Real most searched terms
    const searchQueryModel = (await import("../models/searchQueryModel.js")).default;
    const searchLogs = await searchQueryModel.find({})
      .sort({ count: -1, lastSearched: -1 })
      .limit(10);
    const searchSuggestions = searchLogs.map(log => log.query);

    res.json({
      success: true,
      newArrivals,
      trending,
      bestSellers,
      mostViewed,
      mostWishlisted,
      topRated,
      recentlyViewed,
      recommended,
      dealsOfDay,
      popularBrands,
      trendingCollections,
      popularCategories,
      searchSuggestions
    });
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= GET SEARCH SUGGESTIONS ================= */
const getSearchSuggestions = async (req, res) => {
  try {
    const searchQueryModel = (await import("../models/searchQueryModel.js")).default;
    const searchLogs = await searchQueryModel.find({})
      .sort({ count: -1, lastSearched: -1 })
      .limit(10);
    const suggestions = searchLogs.map(log => log.query);
    res.json({ success: true, suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  addProducts,
  listProducts,
  removeProduct,
  singleProduct,
  addProductReview,
  updateStock,
  generateDescription,
  getCategoriesPublic,
  getCategoryTemplatePublic,
  getCollectionsPublic,
  getBrandsPublic,
  trackProductViewApi,
  getHomepageData,
  getSearchSuggestions
}

