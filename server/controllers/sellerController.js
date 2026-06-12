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

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, subCategory, collection, brand, sku, stock, sizes, tags, specifications, coverIndex } = req.body;
    
    if (!name || !price || !category) {
      if (req.files) {
        req.files.forEach(f => fs.unlink(f.path, () => {}));
      }
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Resolve Category Object
    const catObj = await categoryModel.findOne({
      $or: [
        { name: category },
        { _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null }
      ].filter(Boolean)
    });

    const categoryId = catObj ? catObj._id : null;

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
    const requiresApproval = catSettings ? catSettings.requiresApproval : true;

    if (!req.files || req.files.length < minImages) {
      if (req.files) req.files.forEach(f => fs.unlink(f.path, () => {}));
      return res.status(400).json({ success: false, message: `Minimum of ${minImages} images are required for this category` });
    }

    if (req.files.length > maxImages) {
      req.files.forEach(f => fs.unlink(f.path, () => {}));
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

    // Validate Dynamic Template Fields
    let parsedAttributes = {};
    if (req.body.attributes) {
      try {
        parsedAttributes = typeof req.body.attributes === "string" ? JSON.parse(req.body.attributes) : req.body.attributes;
      } catch (err) {
        console.error("Failed to parse attributes:", err.message);
      }
    }

    // Read attributes schema
    let fields = [];
    if (categoryId) {
      fields = await categoryAttributeModel.find({ categoryId }).sort({ displayOrder: 1 });
    }

    // Perform metadata-driven validation
    const validation = validateAttributes(parsedAttributes, fields);
    if (!validation.isValid) {
      if (req.files) req.files.forEach(f => fs.unlink(f.path, () => {}));
      return res.status(400).json({ success: false, message: validation.errors.join("; ") });
    }

    // Upload to Cloudinary or local fallback
    const imageUrls = [];
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
      brand: brand || "",
      sku: sku || "",
      stock: Number(stock) || 0,
      sizes: sizes ? (Array.isArray(sizes) ? sizes : sizes.split(",")) : [],
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(",")) : [],
      specifications: specifications || [],
      sellerId: req.seller._id,
      status: requiresApproval ? "pending" : "approved"
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

    // Save Product Attributes
    const attrPromises = fields.map(async (field) => {
      const value = parsedAttributes[field.fieldName] !== undefined ? parsedAttributes[field.fieldName] : req.body[field.fieldName] || field.defaultValue;
      if (value !== undefined && value !== null && value !== "") {
        // Write to listingAttributeValueModel (new collection)
        await listingAttributeValueModel.create({
          listingId: product._id,
          attributeId: field._id,
          value
        });

        // Write to productAttributeModel (backwards compatibility)
        return productAttributeModel.create({
          productId: product._id,
          templateFieldId: field._id,
          value
        });
      }
    });
    await Promise.all(attrPromises);

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
    product.specifications = specifications ?? product.specifications;
    product.images = images ?? product.images;
    product.status = "pending"; // re-moderated on edit

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
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const query = { sellerId: req.seller._id, isDeleted: { $ne: true } };
    const products = await productModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });
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
    
    // First try retrieving from listingAttributeValueModel
    let attributes = await listingAttributeValueModel.find({ listingId: id }).populate({
      path: "attributeId",
      model: "categoryAttribute"
    });

    if (attributes.length === 0) {
      // Fallback to productAttributeModel for backwards compatibility
      const legacyAttrs = await productAttributeModel.find({ productId: id }).populate({
        path: "templateFieldId",
        model: "categoryAttribute" // Mapped during migration
      });

      // Format in same signature
      attributes = legacyAttrs.map(la => ({
        _id: la._id,
        listingId: la.productId,
        attributeId: la.templateFieldId,
        value: la.value
      }));
    }

    res.json({ success: true, attributes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProductAttributes = async (req, res) => {
  try {
    const { id } = req.params;
    const { attributes } = req.body; // Map of attributeId (or fieldName) -> value

    const product = await productModel.findOne({ _id: id, sellerId: req.seller._id });
    if (!product) return res.status(404).json({ success: false, message: "Product not found or unauthorized" });

    const attrKeys = Object.keys(attributes || {});
    for (const key of attrKeys) {
      // Key can be fieldName or attributeId. Support both.
      const field = await categoryAttributeModel.findOne({
        $or: [
          { _id: key.match(/^[0-9a-fA-F]{24}$/) ? key : null },
          { fieldName: key }
        ].filter(Boolean)
      });

      if (field) {
        // Update listingAttributeValueModel (new collection)
        await listingAttributeValueModel.findOneAndUpdate(
          { listingId: id, attributeId: field._id },
          { value: attributes[key] },
          { new: true, upsert: true }
        );

        // Update productAttributeModel (backwards compatibility)
        await productAttributeModel.findOneAndUpdate(
          { productId: id, templateFieldId: field._id },
          { value: attributes[key] },
          { new: true, upsert: true }
        );
      }
    }

    // Write activity log
    await activityLogModel.create({
      actorId: req.seller._id,
      actorRole: "seller",
      action: "Update Product Attributes",
      targetId: id,
      targetType: "product",
      details: `Updated dynamic specifications for listing ID: ${id}`
    });

    res.json({ success: true, message: "Product attributes updated successfully" });
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
