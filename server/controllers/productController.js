import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";
import categoryAttributeModel from "../models/categoryAttributeModel.js";
import listingAttributeValueModel from "../models/listingAttributeValueModel.js";
import listingMediaModel from "../models/listingMediaModel.js";
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
    const { category, subCategory, collection, brand, price, rating, q, attributes, location, discount, availability } = req.query;

    // Build core query
    const query = { isDeleted: { $ne: true } };
    
    // Category filter
    if (category && category !== "all") {
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
        query.category = new RegExp(`^${category}$`, "i");
      }
    }

    // Subcategory filter (comma-separated or single)
    if (subCategory) {
      const subArray = Array.isArray(subCategory) ? subCategory : subCategory.split(",").map(s => s.trim()).filter(Boolean);
      if (subArray.length > 0) {
        query.subCategory = { $in: subArray.map(s => new RegExp(`^${s}$`, "i")) };
      }
    }

    // Collection filter
    if (collection && collection !== "all") {
      query.collection = collection;
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

    // Text search filter
    if (q) {
      const searchRegex = new RegExp(q, "i");
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { brand: searchRegex },
        { category: searchRegex },
        { subCategory: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
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
    const limit = Number(req.query.limit) || 20;
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

    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

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
    res.json({ success: true, categories });
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

export {
  addProducts,
  listProducts,
  removeProduct,
  singleProduct,
  addProductReview,
  updateStock,
  generateDescription,
  getCategoriesPublic,
  getCategoryTemplatePublic
}

