import sellerModel from "../models/sellerModel.js";
import productModel from "../models/productModel.js";
import orderModel from "../models/orderModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import productImageModel from "../models/productImageModel.js";
import platformSettingModel from "../models/platformSettingModel.js";
import categoryTemplateModel from "../models/categoryTemplateModel.js";
import categorySettingsModel from "../models/categorySettingsModel.js";
import productAttributeModel from "../models/productAttributeModel.js";
import categoryModel from "../models/categoryModel.js";
import collectionModel from "../models/collectionModel.js";
import brandModel from "../models/brandModel.js";
import categoryAttributeModel from "../models/categoryAttributeModel.js";
import categoryAttributeOptionModel from "../models/categoryAttributeOptionModel.js";
import listingAttributeValueModel from "../models/listingAttributeValueModel.js";
import listingMediaModel from "../models/listingMediaModel.js";
import activityLogModel from "../models/activityLogModel.js";
import { validateAttributes } from "../utils/validationEngine.js";
import { autoAssignDeliveryAgent } from "../utils/assignmentHelper.js";
import { validateEmail, validatePhone, validatePassword, validateName } from "../utils/validation.js";
import returnRequestModel from "../models/returnRequestModel.js";
import { createNotification } from "../utils/notificationHelper.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

/* ================= AUTHENTICATION ================= */
export const registerSeller = async (req, res) => {
  try {
    const { name, email, password, phone, shopName } = req.body;
    if (!name || !email || !password || !phone || !shopName) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const nameCheck = validateName(name);
    if (!nameCheck.isValid) {
      return res.status(400).json({ success: false, message: nameCheck.message });
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      return res.status(400).json({ success: false, message: emailCheck.message });
    }

    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.isValid) {
      return res.status(400).json({ success: false, message: phoneCheck.message });
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      return res.status(400).json({ success: false, message: passwordCheck.message });
    }

    const exists = await sellerModel.findOne({ email: emailCheck.value });
    if (exists) {
      return res.status(409).json({ success: false, message: "Seller email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const seller = await sellerModel.create({
      name: nameCheck.value,
      email: emailCheck.value,
      password: hashedPassword,
      phone: phoneCheck.value,
      shopName,
      status: "pending" // requires admin approval to sign in
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully! Waiting for administrator review.",
      seller: { name: seller.name, email: seller.email, shopName: seller.shopName }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;
    const seller = await sellerModel.findOne({ email });
    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller account does not exist" });
    }

    if (seller.status !== "active") {
      return res.status(403).json({
        success: false,
        message: `Your account is currently ${seller.status}. Please check back later or contact admin.`
      });
    }

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password credentials" });
    }

    const token = createToken(seller._id);
    res.json({
      success: true,
      message: "Log in successful",
      token,
      seller: {
        _id: seller._id,
        name: seller.name,
        email: seller.email,
        shopName: seller.shopName,
        balance: seller.balance,
        revenue: seller.revenue
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logoutSeller = async (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
};

export const refreshToken = async (req, res) => {
  try {
    const token = createToken(req.seller._id);
    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const seller = await sellerModel.findOne({ email });
    if (!seller) return res.status(404).json({ success: false, message: "Seller email not found" });

    const resetToken = Math.random().toString(36).substring(2, 12).toUpperCase();
    seller.passwordResetToken = resetToken;
    seller.passwordResetExpires = Date.now() + 3600000; // 1 Hour
    await seller.save();

    res.json({ success: true, message: "Password reset token generated", resetToken });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const seller = await sellerModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!seller) return res.status(400).json({ success: false, message: "Invalid or expired reset token" });

    seller.password = await bcrypt.hash(newPassword, 10);
    seller.passwordResetToken = null;
    seller.passwordResetExpires = null;
    await seller.save();

    res.json({ success: true, message: "Password has been reset successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const seller = await sellerModel.findById(req.seller._id);

    const isMatch = await bcrypt.compare(oldPassword, seller.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Incorrect current password" });

    seller.password = await bcrypt.hash(newPassword, 10);
    await seller.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    const seller = await sellerModel.findOne({ emailVerificationToken: token });
    if (!seller) return res.status(400).json({ success: false, message: "Invalid verification token" });

    seller.isEmailVerified = true;
    seller.emailVerificationToken = null;
    await seller.save();

    res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCurrentSellerProfile = async (req, res) => {
  res.json({ success: true, seller: req.seller });
};

export const updateSellerProfile = async (req, res) => {
  try {
    const { name, shopName, phone } = req.body;
    
    if (name) {
      const nameCheck = validateName(name);
      if (!nameCheck.isValid) {
        return res.status(400).json({ success: false, message: nameCheck.message });
      }
    }

    if (phone) {
      const phoneCheck = validatePhone(phone);
      if (!phoneCheck.isValid) {
        return res.status(400).json({ success: false, message: phoneCheck.message });
      }
    }

    const seller = await sellerModel.findByIdAndUpdate(
      req.seller._id,
      { name, shopName, phone },
      { new: true }
    );
    res.json({ success: true, message: "Profile updated successfully", seller });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= DASHBOARD STATISTICS ================= */
export const getSellerDashboardStats = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const products = await productModel.find({ sellerId, isDeleted: { $ne: true } });
    const productIds = products.map(p => p._id.toString());
    
    // Find orders where items contain this seller's products
    const allOrders = await orderModel.find({}).sort({ createdAt: -1 });
    const sellerOrders = allOrders.filter(o => 
      o.items.some(item => {
        const itemId = item.productId || item._id;
        return itemId && productIds.includes(itemId.toString());
      })
    );

    const pendingOrdersCount = sellerOrders.filter(o => o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled").length;
    const lowStockCount = products.filter(p => p.stock < 10).length;

    res.json({
      success: true,
      stats: {
        totalRevenue: req.seller.revenue,
        balance: req.seller.balance,
        totalProducts: products.length,
        totalOrders: sellerOrders.length,
        pendingOrders: pendingOrdersCount,
        lowStock: lowStockCount
      },
      recentOrders: sellerOrders.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, subCategory, collection, brand, sku, stock, sizes, tags, specifications, coverIndex } = req.body;
    
    if (!name || !price || !category) {
      if (req.files) {
        req.files.forEach(f => fs.unlink(f.path, () => {}));
      }
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Resolve Category Object or suggest it
    let catObj = await categoryModel.findOne({
      $or: [
        { name: new RegExp(`^${category.trim()}$`, "i") },
        { _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null }
      ].filter(Boolean)
    });

    if (!catObj) {
      // Suggest category with pending status
      const catSlug = slugify(category);
      catObj = await categoryModel.create({
        name: category.trim(),
        slug: catSlug,
        subcategories: subCategory ? [subCategory.trim()] : [],
        description: "AI-suggested category pending review",
        status: "pending",
        isFeatured: false
      });
      // Notify Admin
      await createNotification(null, null, "New Category Suggestion", `AI suggested a new category "${category}" from seller ${req.seller.shopName}. Please verify it.`, "admin");
    } else {
      // Add subCategory to existing category if it doesn't exist
      if (subCategory && !catObj.subcategories.some(s => s.toLowerCase() === subCategory.toLowerCase().trim())) {
        catObj.subcategories.push(subCategory.trim());
        await catObj.save();
      }
    }

    const categoryId = catObj ? catObj._id : null;

    // Resolve or suggest brand
    let finalBrandName = brand || "";
    if (brand && brand.trim()) {
      let brandObj = await brandModel.findOne({
        name: new RegExp(`^${brand.trim()}$`, "i")
      });
      if (!brandObj) {
        const brandSlug = slugify(brand);
        brandObj = await brandModel.create({
          name: brand.trim(),
          slug: brandSlug,
          status: "pending",
          logo: "",
          banner: ""
        });
        finalBrandName = brandObj.name;
        // Notify Admin
        await createNotification(null, null, "New Brand Suggestion", `AI suggested a new brand "${brand}" from seller ${req.seller.shopName}. Please verify it.`, "admin");
      } else {
        finalBrandName = brandObj.name;
      }
    }

    // Parse collections
    let collectionsList = [];
    if (req.body.collections) {
      try {
        collectionsList = typeof req.body.collections === "string"
          ? JSON.parse(req.body.collections)
          : req.body.collections;
      } catch (e) {
        if (typeof req.body.collections === "string") {
          collectionsList = req.body.collections.split(",").map(c => c.trim()).filter(Boolean);
        }
      }
    }
    if (!Array.isArray(collectionsList)) {
      collectionsList = collectionsList ? [collectionsList] : [];
    }
    if (collection && !collectionsList.includes(collection)) {
      collectionsList.push(collection);
    }

    // Resolve or suggest collections
    const finalizedCollections = [];
    for (const colName of collectionsList) {
      if (!colName || !colName.trim()) continue;
      let colObj = await collectionModel.findOne({
        name: new RegExp(`^${colName.trim()}$`, "i")
      });
      if (!colObj) {
        const colSlug = slugify(colName);
        colObj = await collectionModel.create({
          name: colName.trim(),
          slug: colSlug,
          status: "pending",
          banner: "",
          description: "AI-suggested collection pending review"
        });
        // Notify Admin
        await createNotification(null, null, "New Collection Suggestion", `AI suggested a new collection "${colName}" from seller ${req.seller.shopName}. Please verify it.`, "admin");
      }
      finalizedCollections.push(colObj.name);
    }

    // Fetch Category Settings (fallback to platform settings if not found)
    let catSettings = null;
    if (categoryId) {
      catSettings = await categorySettingsModel.findOne({ categoryId });
    }

    let settings = await platformSettingModel.findOne({});
    if (!settings) {
      settings = {
        minImages: 3,
        maxImages: 10,
        allowedFormats: ["jpg", "jpeg", "png", "webp"],
        maxImageSizeMB: 5
      };
    }

    const minImages = catSettings ? catSettings.minImages : settings.minImages;
    const maxImages = catSettings ? catSettings.maxImages : settings.maxImages;

    // Parse existingImages from body
    let existingImages = [];
    if (req.body.existingImages) {
      try {
        existingImages = typeof req.body.existingImages === "string"
          ? JSON.parse(req.body.existingImages)
          : req.body.existingImages;
      } catch (e) {
        if (typeof req.body.existingImages === "string") {
          existingImages = req.body.existingImages.split(",").map(i => i.trim()).filter(Boolean);
        }
      }
    }
    if (!Array.isArray(existingImages)) {
      existingImages = existingImages ? [existingImages] : [];
    }

    const totalImagesCount = (req.files ? req.files.length : 0) + existingImages.length;

    if (totalImagesCount < minImages) {
      if (req.files) req.files.forEach(f => fs.unlink(f.path, () => {}));
      return res.status(400).json({ success: false, message: `Minimum of ${minImages} images are required for this category` });
    }

    if (totalImagesCount > maxImages) {
      if (req.files) req.files.forEach(f => fs.unlink(f.path, () => {}));
      return res.status(400).json({ success: false, message: `Maximum of ${maxImages} images are allowed for this category` });
    }

    // Validate size and format
    for (const file of req.files) {
      const ext = file.originalname.split('.').pop().toLowerCase();
      if (!settings.allowedFormats.includes(ext)) {
        req.files.forEach(f => fs.unlink(f.path, () => {}));
        return res.status(400).json({
          success: false,
          message: `Invalid file format: ${ext}. Allowed formats: ${settings.allowedFormats.join(", ")}`
        });
      }

      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > settings.maxImageSizeMB) {
        req.files.forEach(f => fs.unlink(f.path, () => {}));
        return res.status(400).json({
          success: false,
          message: `File size too large. Maximum size allowed: ${settings.maxImageSizeMB}MB`
        });
      }
    }

    // Parse dynamically supplied specifications/attributes from body
    let finalSpecs = [];
    let dynamicAttributes = {};
    if (req.body.attributes) {
      try {
        dynamicAttributes = typeof req.body.attributes === "string"
          ? JSON.parse(req.body.attributes)
          : req.body.attributes;
      } catch (err) {
        console.error("Failed to parse attributes map:", err.message);
      }
    }

    const isNewFormat = dynamicAttributes && typeof dynamicAttributes === "object" && !Array.isArray(dynamicAttributes);
    if (isNewFormat) {
      finalSpecs = Object.entries(dynamicAttributes).map(([key, val]) => ({
        key,
        value: Array.isArray(val) ? val.join(", ") : String(val)
      }));
    } else {
      if (req.body.specifications) {
        try {
          finalSpecs = typeof req.body.specifications === "string"
            ? JSON.parse(req.body.specifications)
            : req.body.specifications;
        } catch (err) {
          console.error("Failed to parse specifications:", err.message);
        }
      } else if (req.body.attributes) {
        finalSpecs = dynamicAttributes;
      }
      if (typeof finalSpecs === "object" && !Array.isArray(finalSpecs)) {
        finalSpecs = Object.entries(finalSpecs).map(([key, value]) => ({ key, value }));
      }
    }

    let dynamicVariants = [];
    if (req.body.variants) {
      try {
        dynamicVariants = typeof req.body.variants === "string"
          ? JSON.parse(req.body.variants)
          : req.body.variants;
      } catch (err) {
        console.error("Failed to parse variants array:", err.message);
      }
    }

    if (isNewFormat && (!dynamicVariants || dynamicVariants.length === 0)) {
      const attrKeys = Object.keys(dynamicAttributes).filter(
        k => Array.isArray(dynamicAttributes[k]) && dynamicAttributes[k].length > 0
      );
      if (attrKeys.length > 0) {
        const combinations = [];
        const generate = (index, current) => {
          if (index === attrKeys.length) {
            combinations.push({ ...current });
            return;
          }
          const key = attrKeys[index];
          dynamicAttributes[key].forEach(val => {
            current[key] = val;
            generate(index + 1, current);
          });
        };
        generate(0, {});

        dynamicVariants = combinations.map((comb, idx) => ({
          sku: `${sku ? sku : (name ? name.substring(0, 5).toUpperCase() : "PROD")}-${Object.values(comb).join("-").toUpperCase()}-${idx}`,
          price: Number(price),
          stock: Number(stock) || 0,
          attributes: comb
        }));
      }
    }

    // Upload to Cloudinary or local fallback
    const imageUrls = [...existingImages];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        let imageUrl;
        try {
          const result = await cloudinary.uploader.upload(file.path, { resource_type: "image" });
          fs.unlink(file.path, () => {});
          imageUrl = result.secure_url;
        } catch (cloudinaryError) {
          console.log("Cloudinary upload failed, falling back to local file:", cloudinaryError.message);
          imageUrl = file.path;
        }
        imageUrls.push(imageUrl);
      }
    }

    // Make sure the cover is the first image in the product's images array so that standard listings display it as default/fallback
    const targetCoverIndex = parseInt(coverIndex) || 0;
    const finalImageUrls = [];
    if (imageUrls[targetCoverIndex]) {
      finalImageUrls.push(imageUrls[targetCoverIndex]);
    }
    imageUrls.forEach((url, index) => {
      if (index !== targetCoverIndex) {
        finalImageUrls.push(url);
      }
    });

    const product = await productModel.create({
      name,
      description,
      price: Number(price),
      images: finalImageUrls,
      category: catObj ? catObj.name : category,
      subCategory: subCategory || "",
      collection: collection || "",
      collections: finalizedCollections,
      audience: req.body.audience || "Unisex",
      brand: finalBrandName,
      sku: sku || "",
      stock: Number(stock) || 0,
      sizes: isNewFormat ? (dynamicAttributes["Size"] || []) : (sizes ? (Array.isArray(sizes) ? sizes : sizes.split(",")) : []),
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(",")) : [],
      specifications: finalSpecs,
      attributes: isNewFormat ? dynamicAttributes : finalSpecs,
      variants: dynamicVariants,
      sellerId: req.seller._id,
      status: "approved" // Set to approved so it is visible to users immediately
    });

    // Create productImageModel entries
    const coverUrl = imageUrls[targetCoverIndex] || imageUrls[0];
    const imagePromises = imageUrls.map((url, idx) => {
      const isCover = url === coverUrl;
      // Write to listingMediaModel (new collection)
      listingMediaModel.create({
        listingId: product._id,
        url,
        type: "image",
        isCover,
        displayOrder: idx
      });

      // Write to productImageModel (backwards compatibility)
      return productImageModel.create({
        productId: product._id,
        imageUrl: url,
        isCover,
        displayOrder: idx
      });
    });
    await Promise.all(imagePromises);

    // Write activity log
    await activityLogModel.create({
      actorId: req.seller._id,
      actorRole: "seller",
      action: "Create Listing",
      targetId: product._id,
      targetType: "product",
      details: `Created listing "${name}" in category "${category}"`
    });

    res.status(201).json({ success: true, message: "Product listing created successfully", product });
  } catch (error) {
    if (req.files) req.files.forEach(f => fs.unlink(f.path, () => {}));
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id, name, description, price, category, subCategory, collection, brand, sku, stock, sizes, tags, specifications, images } = req.body;
    
    const product = await productModel.findOne({ _id: id, sellerId: req.seller._id });
    if (!product) return res.status(404).json({ success: false, message: "Product not found or unauthorized" });

    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.category = category ?? product.category;
    product.subCategory = subCategory ?? product.subCategory;
    product.collection = collection ?? product.collection;
    product.brand = brand ?? product.brand;
    product.sku = sku ?? product.sku;
    product.stock = stock ?? product.stock;
    product.sizes = sizes ?? product.sizes;
    product.tags = tags ?? product.tags;
    
    let finalSpecs = specifications;
    if (finalSpecs) {
      if (typeof finalSpecs === "string") {
        try {
          finalSpecs = JSON.parse(finalSpecs);
        } catch (e) {}
      }
      product.specifications = finalSpecs;
    }

    let dynamicAttributes = req.body.attributes;
    if (dynamicAttributes) {
      if (typeof dynamicAttributes === "string") {
        try {
          dynamicAttributes = JSON.parse(dynamicAttributes);
        } catch (e) {}
      }
      product.attributes = dynamicAttributes;
      if (dynamicAttributes && typeof dynamicAttributes === "object" && !Array.isArray(dynamicAttributes)) {
        product.specifications = Object.entries(dynamicAttributes).map(([key, val]) => ({
          key,
          value: Array.isArray(val) ? val.join(", ") : String(val)
        }));
        if (dynamicAttributes["Size"]) {
          product.sizes = dynamicAttributes["Size"];
        }
      }
    }

    let dynamicVariants = req.body.variants;
    if (dynamicVariants) {
      if (typeof dynamicVariants === "string") {
        try {
          dynamicVariants = JSON.parse(dynamicVariants);
        } catch (e) {}
      }
      product.variants = dynamicVariants;
    } else if (dynamicAttributes && typeof dynamicAttributes === "object" && !Array.isArray(dynamicAttributes)) {
      const attrKeys = Object.keys(dynamicAttributes).filter(
        k => Array.isArray(dynamicAttributes[k]) && dynamicAttributes[k].length > 0
      );
      if (attrKeys.length > 0) {
        const combinations = [];
        const generate = (index, current) => {
          if (index === attrKeys.length) {
            combinations.push({ ...current });
            return;
          }
          const key = attrKeys[index];
          dynamicAttributes[key].forEach(val => {
            current[key] = val;
            generate(index + 1, current);
          });
        };
        generate(0, {});

        product.variants = combinations.map((comb, idx) => ({
          sku: `${sku || product.sku || "PROD"}-${Object.values(comb).join("-").toUpperCase()}-${idx}`,
          price: Number(price || product.price),
          stock: Number(stock || product.stock) || 0,
          attributes: comb
        }));
      }
    }

    product.images = images ?? product.images;
    product.status = "approved"; // Set to approved so it is visible to users immediately

    await product.save();
    res.json({ success: true, message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.body;
    const product = await productModel.findOneAndUpdate(
      { _id: id, sellerId: req.seller._id },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product soft deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const restoreProduct = async (req, res) => {
  try {
    const { id } = req.body;
    const product = await productModel.findOneAndUpdate(
      { _id: id, sellerId: req.seller._id },
      { isDeleted: false, deletedAt: null },
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product restored successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSingleProduct = async (req, res) => {
  try {
    const product = await productModel.findOne({ _id: req.params.id, sellerId: req.seller._id });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllSellerProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 1000;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const query = { sellerId: req.seller._id, isDeleted: { $ne: true } };
    const products = await productModel.find(query).skip(skip).limit(limit).sort({ date: -1, _id: -1 });
    const total = await productModel.countDocuments(query);

    res.json({
      success: true,
      products,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= STOCK/INVENTORY ================= */
export const updateStock = async (req, res) => {
  try {
    const { id, stock } = req.body;
    const product = await productModel.findOneAndUpdate(
      { _id: id, sellerId: req.seller._id },
      { stock },
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Stock updated successfully", product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bulkStockUpdate = async (req, res) => {
  try {
    const { updates } = req.body; // array of { id, stock }
    if (!Array.isArray(updates)) return res.status(400).json({ success: false, message: "Updates must be an array" });

    const promises = updates.map(u =>
      productModel.updateOne({ _id: u.id, sellerId: req.seller._id }, { stock: u.stock })
    );
    await Promise.all(promises);

    res.json({ success: true, message: "Bulk stock update complete" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= ORDER MANAGEMENT ================= */
export const getAllSellerOrders = async (req, res) => {
  try {
    const products = await productModel.find({ sellerId: req.seller._id });
    const productIds = products.map(p => p._id.toString());
    const allOrders = await orderModel.find({}).populate("deliverymanId", "name phone vehicleType").sort({ createdAt: -1 });
    
    const sellerOrders = allOrders.filter(o => 
      o.items.some(item => {
        const itemId = item.productId || item._id;
        return itemId && productIds.includes(itemId.toString());
      })
    );

    const ordersWithReviews = sellerOrders.map(order => {
      const orderObj = order.toObject();
      orderObj.items = orderObj.items.map(item => {
        const itemId = item.productId || item._id;
        const matchingProduct = products.find(p => p._id.toString() === itemId?.toString());
        if (matchingProduct) {
          const ratings = matchingProduct.reviews.map(r => r.rating);
          const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
          return {
            ...item,
            reviews: matchingProduct.reviews || [],
            averageRating: averageRating
          };
        }
        return { ...item, reviews: [], averageRating: 0 };
      });
      return orderObj;
    });

    res.json({ success: true, orders: ordersWithReviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSellerOrderDetails = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id).populate("deliverymanId", "name phone vehicleType");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    
    const products = await productModel.find({ sellerId: req.seller._id });
    const productIds = products.map(p => p._id.toString());
    
    const ownsProduct = order.items.some(item => {
      const itemId = item.productId || item._id;
      return itemId && productIds.includes(itemId.toString());
    });
    
    if (!ownsProduct) {
      return res.status(403).json({ success: false, message: "Unauthorized: You do not have permission to view this order details" });
    }

    const sellerItems = order.items.filter(item => {
      const itemId = item.productId || item._id;
      return itemId && productIds.includes(itemId.toString());
    });

    const orderObj = order.toObject();
    orderObj.items = sellerItems.map(item => {
      const itemId = item.productId || item._id;
      const matchingProduct = products.find(p => p._id.toString() === itemId?.toString());
      if (matchingProduct) {
        const ratings = matchingProduct.reviews.map(r => r.rating);
        const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
        return {
          ...item,
          reviews: matchingProduct.reviews || [],
          averageRating: averageRating
        };
      }
      return { ...item, reviews: [], averageRating: 0 };
    });

    res.json({ success: true, order: orderObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const acceptSellerOrder = async (req, res) => {
  try {
    const order = await orderModel.findByIdAndUpdate(req.body.orderId, { orderStatus: "Accepted" }, { new: true });
    res.json({ success: true, message: "Order accepted", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectSellerOrder = async (req, res) => {
  try {
    const order = await orderModel.findByIdAndUpdate(req.body.orderId, { orderStatus: "Rejected" }, { new: true });
    res.json({ success: true, message: "Order rejected", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markReadyForPickup = async (req, res) => {
  try {
    const order = await orderModel.findByIdAndUpdate(req.body.orderId, { orderStatus: "Ready For Pickup" }, { new: true });
    
    // Trigger Automated Assignment
    if (order) {
      await autoAssignDeliveryAgent(order._id);
    }

    res.json({ success: true, message: "Order marked ready for pickup and automated assignment triggered", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= REVENUE & PAYOUTS ================= */
export const getSellerRevenue = async (req, res) => {
  res.json({
    success: true,
    revenue: {
      totalRevenue: req.seller.revenue,
      balance: req.seller.balance
    }
  });
};

export const requestPayout = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: "Amount must be greater than zero" });

    const seller = await sellerModel.findById(req.seller._id);
    if (seller.balance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient balance for requested payout" });
    }

    seller.payoutRequests.push({ amount, status: "pending" });
    await seller.save();

    res.json({ success: true, message: "Payout request submitted successfully", seller });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSellerPayoutRequests = async (req, res) => {
  res.json({ success: true, payouts: req.seller.payoutRequests || [] });
};

/* ================= REVIEWS ================= */
export const getSellerProductReviews = async (req, res) => {
  try {
    const products = await productModel.find({ sellerId: req.seller._id });
    const reviews = [];
    products.forEach(p => {
      if (p.reviews && p.reviews.length > 0) {
        p.reviews.forEach(r => {
          reviews.push({ ...r.toObject(), productName: p.name, productId: p._id });
        });
      }
    });

    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const replyToProductReview = async (req, res) => {
  try {
    const { productId, reviewId, reply } = req.body;
    if (!productId || !reviewId || !reply) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const product = await productModel.findOne({ _id: productId, sellerId: req.seller._id });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found or unauthorized" });
    }

    const review = product.reviews.id(reviewId);
    if (!review) {
      const reviewIndex = product.reviews.findIndex(r => r._id.toString() === reviewId);
      if (reviewIndex !== -1) {
        product.reviews[reviewIndex].reply = reply;
      } else {
        return res.status(404).json({ success: false, message: "Review not found" });
      }
    } else {
      review.reply = reply;
    }

    product.markModified("reviews");
    await product.save();

    res.json({ success: true, message: "Reply posted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= PRODUCT IMAGES ================= */
export const getProductImages = async (req, res) => {
  try {
    const { id } = req.params;
    const images = await productImageModel.find({ productId: id }).sort({ displayOrder: 1 });
    res.json({ success: true, images });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadProductImages = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel.findOne({ _id: id, sellerId: req.seller._id });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found or unauthorized" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    let settings = await platformSettingModel.findOne({});
    if (!settings) {
      settings = {
        minImages: 3,
        maxImages: 10,
        allowedFormats: ["jpg", "jpeg", "png", "webp"],
        maxImageSizeMB: 5
      };
    }

    const currentImagesCount = await productImageModel.countDocuments({ productId: id });
    if (currentImagesCount + req.files.length > settings.maxImages) {
      // clean up files first
      if (Array.isArray(req.files)) {
        req.files.forEach(file => {
          fs.unlink(file.path, () => {});
        });
      }
      return res.status(400).json({
        success: false,
        message: `Maximum limit of ${settings.maxImages} images exceeded`
      });
    }

    // Validate size and format
    for (const file of req.files) {
      const ext = file.originalname.split('.').pop().toLowerCase();
      if (!settings.allowedFormats.includes(ext)) {
        req.files.forEach(f => fs.unlink(f.path, () => {}));
        return res.status(400).json({
          success: false,
          message: `Invalid file format: ${ext}. Allowed formats: ${settings.allowedFormats.join(", ")}`
        });
      }

      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > settings.maxImageSizeMB) {
        req.files.forEach(f => fs.unlink(f.path, () => {}));
        return res.status(400).json({
          success: false,
          message: `File size too large. Maximum size allowed: ${settings.maxImageSizeMB}MB`
        });
      }
    }

    // Upload to Cloudinary or local fallback
    const uploadPromises = req.files.map(async (file, index) => {
      let imageUrl;
      try {
        const result = await cloudinary.uploader.upload(file.path, { resource_type: "image" });
        fs.unlink(file.path, () => {});
        imageUrl = result.secure_url;
      } catch (cloudinaryError) {
        console.log("Cloudinary upload failed, falling back to local file:", cloudinaryError.message);
        imageUrl = file.path;
      }

      // Check if a cover already exists
      const coverExists = await productImageModel.findOne({ productId: id, isCover: true });
      const isCover = !coverExists && index === 0;

      return productImageModel.create({
        productId: id,
        imageUrl,
        isCover,
        displayOrder: currentImagesCount + index
      });
    });

    const newImages = await Promise.all(uploadPromises);

    // Sync product model images array with newly created images URLs
    const allImages = await productImageModel.find({ productId: id }).sort({ displayOrder: 1 });
    product.images = allImages.map(img => img.imageUrl);
    product.status = "pending";
    await product.save();

    res.status(201).json({ success: true, message: "Images uploaded successfully", images: newImages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProductImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;
    const product = await productModel.findOne({ _id: id, sellerId: req.seller._id });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found or unauthorized" });
    }

    const image = await productImageModel.findOne({ _id: imageId, productId: id });
    if (!image) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    const wasCover = image.isCover;
    await productImageModel.findByIdAndDelete(imageId);

    // If deleted image was cover, assign cover to first remaining image
    if (wasCover) {
      const firstRemaining = await productImageModel.findOne({ productId: id }).sort({ displayOrder: 1 });
      if (firstRemaining) {
        firstRemaining.isCover = true;
        await firstRemaining.save();
      }
    }

    // Re-index remaining images
    const remainingImages = await productImageModel.find({ productId: id }).sort({ displayOrder: 1 });
    for (let i = 0; i < remainingImages.length; i++) {
      remainingImages[i].displayOrder = i;
      await remainingImages[i].save();
    }

    // Sync product model images array
    product.images = remainingImages.map(img => img.imageUrl);
    await product.save();

    res.json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reorderProductImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageIds } = req.body;

    const product = await productModel.findOne({ _id: id, sellerId: req.seller._id });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found or unauthorized" });
    }

    if (!Array.isArray(imageIds)) {
      return res.status(400).json({ success: false, message: "imageIds must be an array" });
    }

    // Update displayOrder for each image
    const updatePromises = imageIds.map((imgId, index) =>
      productImageModel.updateOne({ _id: imgId, productId: id }, { displayOrder: index })
    );
    await Promise.all(updatePromises);

    // Sync product model images array
    const sortedImages = await productImageModel.find({ productId: id }).sort({ displayOrder: 1 });
    product.images = sortedImages.map(img => img.imageUrl);
    await product.save();

    res.json({ success: true, message: "Images reordered successfully", images: sortedImages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const setCoverImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;
    const product = await productModel.findOne({ _id: id, sellerId: req.seller._id });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found or unauthorized" });
    }

    // Reset all covers for this product
    await productImageModel.updateMany({ productId: id }, { isCover: false });

    // Set selected as cover
    const image = await productImageModel.findOneAndUpdate({ _id: imageId, productId: id }, { isCover: true }, { new: true });
    if (!image) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    // Sync product model images array. Make sure the cover is the first image
    const sortedImages = await productImageModel.find({ productId: id }).sort({ displayOrder: 1 });
    const imagesUrls = [];
    const coverUrl = image.imageUrl;
    imagesUrls.push(coverUrl);
    sortedImages.forEach(img => {
      if (img.imageUrl !== coverUrl) {
        imagesUrls.push(img.imageUrl);
      }
    });

    product.images = imagesUrls;
    await product.save();

    res.json({ success: true, message: "Cover image updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= SELLER CATEGORY DYNAMIC TEMPLATE SYSTEM ================= */
export const getCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find({}).sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategoryTemplateSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = await categoryAttributeModel.find({ categoryId: id }).sort({ displayOrder: 1 });
    let settings = await categorySettingsModel.findOne({ categoryId: id });
    if (!settings) {
      settings = await categorySettingsModel.create({ categoryId: id });
    }

    // Populate selectOptions
    const populatedFields = [];
    for (const f of fields) {
      const fieldObj = f.toObject();
      const options = await categoryAttributeOptionModel.find({ attributeId: f._id }).sort({ displayOrder: 1 });
      fieldObj.selectOptions = options.map(o => o.value);
      populatedFields.push(fieldObj);
    }

    res.json({ success: true, fields: populatedFields, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductAttributes = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel.findOne({ _id: id, sellerId: req.seller._id });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const attributes = (product.specifications || []).map(s => ({
      _id: s._id || s.key,
      key: s.key,
      value: s.value
    }));

    res.json({ success: true, attributes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProductAttributes = async (req, res) => {
  try {
    const { id } = req.params;
    const { attributes } = req.body;

    const product = await productModel.findOne({ _id: id, sellerId: req.seller._id });
    if (!product) return res.status(404).json({ success: false, message: "Product not found or unauthorized" });

    let finalSpecs = [];
    let isMap = false;
    let parsed = attributes;

    if (attributes) {
      if (typeof attributes === "string") {
        try {
          parsed = JSON.parse(attributes);
        } catch (e) {}
      }
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        isMap = true;
      }
    }

    if (isMap) {
      product.attributes = parsed;
      product.specifications = Object.entries(parsed).map(([key, val]) => ({
        key,
        value: Array.isArray(val) ? val.join(", ") : String(val)
      }));
    } else {
      if (Array.isArray(parsed)) {
        finalSpecs = parsed.map(attr => ({ key: attr.key || attr.fieldName || attr.name, value: attr.value }));
      } else if (parsed && typeof parsed === "object") {
        finalSpecs = Object.entries(parsed).map(([key, value]) => ({ key, value }));
      }
      product.specifications = finalSpecs;
      // Preserve dynamic attributes map if product has variants
      if (!product.variants || product.variants.length === 0) {
        product.attributes = finalSpecs;
      }
    }

    product.status = "approved"; // attributes-driven products auto approved
    await product.save();

    // Write activity log
    await activityLogModel.create({
      actorId: req.seller._id,
      actorRole: "seller",
      action: "Update Product Attributes",
      targetId: id,
      targetType: "product",
      details: `Updated dynamic specifications for listing ID: ${id}`
    });

    res.json({ success: true, message: "Product attributes updated successfully", product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSellerReturns = async (req, res) => {
  try {
    const products = await productModel.find({ sellerId: req.seller._id }).select("_id");
    const productIds = products.map(p => p._id);
    const returns = await returnRequestModel.find({ productId: { $in: productIds } }).sort({ createdAt: -1 });
    res.json({ success: true, returns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSellerReturnStatus = async (req, res) => {
  try {
    const { requestId, status, adminNote, returnType, exchangeSize, deliverymanId } = req.body;

    const returnReq = await returnRequestModel.findById(requestId);
    if (!returnReq) {
      return res.status(404).json({ success: false, message: "Return request not found" });
    }

    const product = await productModel.findById(returnReq.productId);
    if (!product || String(product.sellerId) !== String(req.seller._id)) {
      return res.status(403).json({ success: false, message: "Unauthorized return update" });
    }

    returnReq.status = status;
    if (adminNote !== undefined) returnReq.adminNote = adminNote;
    if (returnType) returnReq.returnType = returnType;
    if (exchangeSize !== undefined) returnReq.exchangeSize = exchangeSize;
    if (deliverymanId !== undefined) returnReq.deliverymanId = deliverymanId || null;

    await returnReq.save();

    await activityLogModel.create({
      actorId: req.seller._id,
      actorRole: "seller",
      action: "Update Return Status",
      targetId: requestId,
      targetType: "returnRequest",
      details: `Updated return request status to ${status}`
    });

    try {
      await createNotification(
        returnReq.userId,
        returnReq.orderId,
        "Return Status Updated",
        `The return status for your item "${returnReq.itemName}" has been updated to "${status}".`
      );
    } catch (notifErr) {
      console.log("Failed to send notification:", notifErr.message);
    }

    res.json({ success: true, message: "Return request updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateProduct = async (req, res) => {
  try {
    const { name, category, subCategory, price, images, attributes, brand, stock, sku } = req.body;

    if (!name || !category || !subCategory || price === undefined || !images || !Array.isArray(images)) {
      return res.status(400).json({ success: false, message: "Missing required fields: name, category, subCategory, price, and images array are required." });
    }

    // 1. Create slug
    const slugifyName = (str) => {
      return str
        .toLowerCase()
        .replace(/'s/g, "")
        .replace(/s'/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    };
    const slug = slugifyName(name);

    // 2. Short description
    const shortDesc = req.body.shortDescription || req.body.seoDescription || `Premium ${name} designed for comfort, style and everyday wear.`;

    // 3. Description
    const desc = req.body.description || `This ${name} is crafted using quality materials and designed to provide comfort, durability and style. Suitable for daily wear and special occasions.`;

    // 4. Generate tags
    const getSingular = (str) => {
      let s = str.trim().toLowerCase();
      if (s.endsWith("ies")) return s.slice(0, -3) + "y";
      if (s.endsWith("es")) {
        if (s.endsWith("sses") || s.endsWith("ches") || s.endsWith("shes") || s.endsWith("xes")) {
          return s.slice(0, -2);
        }
        return s.slice(0, -1);
      }
      if (s.endsWith("s") && !s.endsWith("ss")) return s.slice(0, -1);
      return s;
    };

    const singularSub = getSingular(subCategory || category || "");
    const tagsList = [];
    tagsList.push(name.toLowerCase());
    if (category) tagsList.push(category.toLowerCase());
    if (subCategory) tagsList.push(subCategory.toLowerCase());

    const words = name.toLowerCase()
      .replace(/'s/g, "")
      .replace(/s'/g, "")
      .replace(/[^a-z0-9-\s]/g, " ")
      .split(/\s+/)
      .map(w => w.trim())
      .filter(w => w.length > 1);

    words.forEach(word => {
      if (word !== singularSub && !["and", "for", "with", "the", "a", "of", "to", "in"].includes(word)) {
        tagsList.push(`${word} ${singularSub}`);
      }
    });

    if (singularSub) {
      tagsList.push(`casual ${singularSub}`);
    }

    let finalTags = [];
    if (req.body.tags) {
      if (Array.isArray(req.body.tags)) {
        finalTags = req.body.tags;
      } else if (typeof req.body.tags === 'string') {
        finalTags = req.body.tags.split(',').map(t => t.trim()).filter(Boolean);
      }
    } else {
      finalTags = [...new Set(tagsList.map(t => t.toLowerCase().trim()))].filter(Boolean);
    }

    const finalBrand = brand || "Generic";

    // 5. Generate search keywords
    let keywords = [];
    if (req.body.searchKeywords || req.body.keywords) {
      const src = req.body.searchKeywords || req.body.keywords;
      if (Array.isArray(src)) {
        keywords = src;
      } else if (typeof src === 'string') {
        keywords = src.split(',').map(k => k.trim()).filter(Boolean);
      }
    } else {
      const keywordSource = [name, category, finalBrand, ...finalTags];
      keywords = [...new Set(
        keywordSource.join(" ")
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .split(/\s+/)
          .filter(w => w.length > 1)
      )];
    }

    // 6. Generate highlights
    let highlights = [];
    if (req.body.highlights) {
      if (Array.isArray(req.body.highlights)) {
        highlights = req.body.highlights;
      } else if (typeof req.body.highlights === 'string') {
        highlights = req.body.highlights.split(',').map(h => h.trim()).filter(Boolean);
      }
    } else {
      highlights = [
        "Premium quality",
        "Comfortable fit",
        "Durable material",
        "Modern design",
        "Easy maintenance"
      ];
    }

    // 7. care instructions
    let careInstructions = [];
    if (req.body.careInstructions) {
      if (Array.isArray(req.body.careInstructions)) {
        careInstructions = req.body.careInstructions;
      } else if (typeof req.body.careInstructions === 'string') {
        careInstructions = req.body.careInstructions.split(',').map(c => c.trim()).filter(Boolean);
      }
    } else {
      careInstructions = [
        "Machine wash cold",
        "Do not bleach",
        "Dry in shade"
      ];
    }

    // 8. Generate default rating
    const ratingObj = {
      average: 0,
      count: 0
    };

    // 9. Generate default stock
    const finalStock = Number(stock) || 0;

    // 10. specifications using category template
    const getSpecsTemplate = (cat, subCat) => {
      const c = `${cat} ${subCat}`.toLowerCase();
      if (c.includes("women") || c.includes("dress") || c.includes("clothing") || c.includes("fashion") || c.includes("ethnic")) {
        return { "Material": "", "Pattern": "", "Sleeve Type": "", "Neck Type": "" };
      }
      if (c.includes("electronic") || c.includes("mobile") || c.includes("laptop") || c.includes("phone")) {
        return { "Brand": "", "Model": "", "Processor": "", "RAM": "", "Storage": "" };
      }
      if (c.includes("shoe") || c.includes("footwear")) {
        return { "Material": "", "Closure": "", "Sole": "", "Fit": "" };
      }
      if (c.includes("furniture") || c.includes("home")) {
        return { "Material": "", "Dimensions": "", "Weight": "", "Color": "" };
      }
      return { "Manufacturer": "", "Origin": "", "Warranty": "", "Material": "" };
    };
    const template = getSpecsTemplate(category, subCategory);
    let userSpecs = req.body.specifications || [];
    if (typeof userSpecs === "string") {
      try {
        userSpecs = JSON.parse(userSpecs);
      } catch (e) {
        userSpecs = [];
      }
    }
    if (!Array.isArray(userSpecs)) {
      if (userSpecs && typeof userSpecs === "object") {
        userSpecs = Object.entries(userSpecs).map(([k, v]) => ({ key: k, value: v }));
      } else {
        userSpecs = [];
      }
    }

    const finalSpecs = [...userSpecs];
    Object.entries(template).forEach(([key, defaultValue]) => {
      const exists = finalSpecs.some(s => s && typeof s === "object" && s.key?.toLowerCase() === key.toLowerCase());
      if (!exists) {
        finalSpecs.push({ key, value: defaultValue });
      }
    });

    // 11. Generate variants
    let inputAttrs = attributes || {};
    const standardFields = [
      'name', 'slug', 'category', 'subCategory', 'price', 'discountPrice', 'images',
      'brand', 'stock', 'sku', 'description', 'shortDescription', 'tags', 'keywords',
      'searchKeywords', 'specifications', 'collections', 'rating', 'ratings', 'highlights',
      'careInstructions', 'variants', 'shipping', 'seller', 'seo', 'isFeatured',
      'isTrending', 'isActive', 'createdAt', 'preview', 'audience', 'attributes'
    ];
    Object.keys(req.body).forEach(key => {
      if (!standardFields.includes(key)) {
        if (Array.isArray(req.body[key])) {
          inputAttrs[key] = req.body[key];
        } else if (typeof req.body[key] === 'string' && req.body[key].includes(',')) {
          inputAttrs[key] = req.body[key].split(',').map(s => s.trim()).filter(Boolean);
        }
      }
    });

    const attrKeys = Object.keys(inputAttrs).filter(
      k => Array.isArray(inputAttrs[k]) && inputAttrs[k].length > 0
    );
    let dynamicVariants = [];
    if (req.body.variants && Array.isArray(req.body.variants) && req.body.variants.length > 0) {
      dynamicVariants = req.body.variants.map(v => ({
        sku: v.sku || "",
        price: Number(v.price) || Number(price),
        stock: Number(v.stock) || 0,
        attributes: v.attributes || {}
      }));
    } else if (attrKeys.length > 0) {
      const combinations = [];
      const generate = (index, current) => {
        if (index === attrKeys.length) {
          combinations.push({ ...current });
          return;
        }
        const key = attrKeys[index];
        inputAttrs[key].forEach(val => {
          current[key] = val;
          generate(index + 1, current);
        });
      };
      generate(0, {});

      const baseSku = sku || name.substring(0, 5).toUpperCase().replace(/[^A-Z0-9]/g, "");
      dynamicVariants = combinations.map((comb, idx) => {
        const suffix = Object.values(comb).join("+");
        return {
          sku: `${baseSku}-${suffix}`,
          price: Number(price),
          stock: 0,
          attributes: comb
        };
      });
    }

    // Resolve Category Object or suggest it
    let catObj = await categoryModel.findOne({
      $or: [
        { name: new RegExp(`^${category.trim()}$`, "i") },
        { _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null }
      ].filter(Boolean)
    });

    if (req.body.preview) {
      return res.json({
        success: true,
        message: "Product details generated successfully",
        product: {
          name,
          slug,
          shortDescription: shortDesc,
          description: desc,
          price: Number(price),
          images,
          category: catObj ? catObj.name : category,
          subCategory: subCategory || "",
          brand: finalBrand,
          stock: finalStock,
          sizes: inputAttrs["Size"] || [],
          tags: finalTags,
          keywords,
          highlights,
          careInstructions,
          attributes: inputAttrs,
          variants: dynamicVariants,
          collections: ["New Arrivals", "Best Sellers"],
          specifications: finalSpecs
        }
      });
    }

    if (!catObj) {
      const catSlug = slugify(category);
      catObj = await categoryModel.create({
        name: category.trim(),
        slug: catSlug,
        subcategories: subCategory ? [subCategory.trim()] : [],
        description: "Rule-generated category pending review",
        status: "pending",
        isFeatured: false
      });
      await createNotification(null, null, "New Category Suggestion", `AI suggested a new category "${category}" from seller ${req.seller.shopName}. Please verify it.`, "admin");
    } else {
      if (subCategory && !catObj.subcategories.some(s => s.toLowerCase() === subCategory.toLowerCase().trim())) {
        catObj.subcategories.push(subCategory.trim());
        await catObj.save();
      }
    }

    // Save final product directly to database
    const product = await productModel.create({
      name,
      slug,
      shortDescription: shortDesc,
      description: desc,
      price: Number(price),
      images: images,
      category: catObj ? catObj.name : category,
      subCategory: subCategory || "",
      collection: "",
      collections: ["New Arrivals", "Best Sellers"],
      audience: "Unisex",
      brand: finalBrand,
      sku: sku || `GEN-${Date.now()}`,
      stock: finalStock,
      sizes: inputAttrs["Size"] || [],
      tags: finalTags,
      keywords,
      highlights,
      careInstructions,
      rating: ratingObj,
      averageRating: 0,
      totalReviews: 0,
      reviews: [],
      attributes: inputAttrs,
      variants: dynamicVariants,
      sellerId: req.seller._id,
      status: "approved"
    });

    // Create listingMediaModel entries for immediate media listing
    if (images && images.length > 0) {
      for (let idx = 0; idx < images.length; idx++) {
        const url = images[idx];
        await listingMediaModel.create({
          listingId: product._id,
          url,
          type: "image",
          isCover: idx === 0,
          displayOrder: idx
        });
      }
    }

    res.json({
      success: true,
      message: "Product generated and published successfully",
      product
    });
  } catch (error) {
    console.log("GENERATE PRODUCT ERROR 👉", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
