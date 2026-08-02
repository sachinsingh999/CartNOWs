import mongoose from "mongoose";
import helpRequestModel from "../models/helpRequestModel.js";
import orderModel from "../models/orderModel.js";
import orderItemModel from "../models/orderItemModel.js";
import returnRequestModel from "../models/returnRequestModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import { v2 as cloudinary } from "cloudinary";
import axios from "axios";
import fs from "fs";
import { createNotification } from "../utils/notificationHelper.js";
import { syncParentOrderStatus } from "../utils/orderStatusHelper.js";


const sanitizeText = (value) => (typeof value === "string" ? value.trim() : "");

const createReturnRequest = async (req, res) => {
  try {
    const { orderId, productId, size, reason, feedback, returnType, exchangeSize } = req.body;

    const cleanProductId = productId || req.body._id || req.body.id;
    const cleanReason = sanitizeText(reason);
    const cleanFeedback = sanitizeText(feedback);
    const cleanSize = sanitizeText(size);
    const cleanReturnType = sanitizeText(returnType) || "Refund";
    const cleanExchangeSize = sanitizeText(exchangeSize) || "";

    if (!orderId || !cleanProductId || !cleanReason) {
      return res.status(400).json({
        success: false,
        message: "Order, product, and reason are required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format.",
      });
    }

    const order = await orderModel.findOne({
      _id: orderId,
      userId: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const item = order.items.find((entry) => {
      const entryProdId = String(entry.productId || entry._id || entry.id || "");
      const targetProdId = String(cleanProductId || "");
      const entrySize = sanitizeText(entry.size);

      const isProdMatch = entryProdId && targetProdId && entryProdId === targetProdId;
      if (!isProdMatch) return false;

      if (!entrySize || !cleanSize || entrySize === "N/A" || cleanSize === "N/A") {
        return true;
      }
      return entrySize.toLowerCase() === cleanSize.toLowerCase();
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Order item not found.",
      });
    }

    const queryProdId = mongoose.Types.ObjectId.isValid(cleanProductId) ? cleanProductId : null;
    const existingRequest = await returnRequestModel.findOne({
      userId: req.user._id,
      orderId,
      ...(queryProdId ? { productId: queryProdId } : {}),
      itemSize: cleanSize,
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "Return request already submitted for this item.",
      });
    }

    const createdRequest = await returnRequestModel.create({
      userId: req.user._id,
      orderId,
      productId: queryProdId,
      itemName: item.name || item.title || item.productName || "Returned Item",
      itemImage: Array.isArray(item.image)
        ? (item.image[0] || "")
        : (item.image || (Array.isArray(item.images) ? (item.images[0] || "") : (item.images || ""))),
      itemSize: cleanSize,
      quantity: Number(item.qty || item.quantity) || 1,
      amount: (Number(item.price) || 0) * (Number(item.qty || item.quantity) || 1),
      reason: cleanReason,
      feedback: cleanFeedback,
      returnType: cleanReturnType,
      exchangeSize: cleanExchangeSize,
    });

    // Update orderItemModel status
    await orderItemModel.findByIdAndUpdate(item._id, {
      status: "Return Requested",
      returnReason: cleanReason,
      returnedAt: new Date(),
      refundAmount: createdRequest.amount,
      refundStatus: "pending",
    });

    // Sync parent order status
    await syncParentOrderStatus(orderId);

    // Create user notification
    await createNotification(
      req.user._id,
      orderId,
      "Return Requested",
      `Return request received for "${item.name || item.productName || "item"}". We will arrange pickup soon.`
    );

    return res.json({
      success: true,
      message: "Return request submitted successfully.",
      returnRequest: createdRequest,
    });
  } catch (error) {
    console.error("Error in createReturnRequest:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUserReturns = async (req, res) => {
  try {
    const returns = await returnRequestModel
      .find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    return res.json({ success: true, returns });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAdminReturns = async (_req, res) => {
  try {
    const returns = await returnRequestModel.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, returns });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateReturnStatus = async (req, res) => {
  try {
    const { requestId, status, adminNote, returnType, exchangeSize, deliverymanId } = req.body;

    if (!requestId || !status) {
      return res.status(400).json({
        success: false,
        message: "Request and status are required.",
      });
    }

    const returnReq = await returnRequestModel.findById(requestId);
    if (!returnReq) {
      return res.status(404).json({
        success: false,
        message: "Return request not found.",
      });
    }

    returnReq.status = status;
    returnReq.adminNote = sanitizeText(adminNote);
    if (returnType) returnReq.returnType = returnType;
    if (exchangeSize !== undefined) returnReq.exchangeSize = sanitizeText(exchangeSize);
    if (deliverymanId !== undefined) returnReq.deliverymanId = deliverymanId || null;

    await returnReq.save();

    // Trigger notification to customer
    await createNotification(
      returnReq.userId,
      returnReq.orderId,
      "Return Status Updated",
      `The return status for your item "${returnReq.itemName}" has been updated to "${status}".`
    );

    return res.json({ success: true, message: "Return status updated." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createHelpRequest = async (req, res) => {
  try {
    const { category, subject, message } = req.body;

    const cleanCategory = sanitizeText(category);
    const cleanSubject = sanitizeText(subject);
    const cleanMessage = sanitizeText(message);

    if (!cleanCategory || !cleanSubject || !cleanMessage) {
      return res.status(400).json({
        success: false,
        message: "Category, subject, and message are required.",
      });
    }

    const user = await userModel.findById(req.user._id).select("name email");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const helpRequest = await helpRequestModel.create({
      userId: req.user._id,
      name: user.name,
      email: user.email,
      category: cleanCategory,
      subject: cleanSubject,
      message: cleanMessage,
    });

    return res.json({
      success: true,
      message: "Help request created successfully.",
      helpRequest,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getUserHelpRequests = async (req, res) => {
  try {
    const helpRequests = await helpRequestModel
      .find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    return res.json({ success: true, helpRequests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAdminHelpRequests = async (_req, res) => {
  try {
    const helpRequests = await helpRequestModel.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, helpRequests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateHelpRequest = async (req, res) => {
  try {
    const { requestId, status, adminReply } = req.body;

    if (!requestId || !status) {
      return res.status(400).json({
        success: false,
        message: "Request and status are required.",
      });
    }

    await helpRequestModel.findByIdAndUpdate(requestId, {
      status,
      adminReply: sanitizeText(adminReply),
    });

    return res.json({ success: true, message: "Help request updated." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const tryOnGarment = async (req, res) => {
  try {
    const { productId, category } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Human image is required.",
      });
    }

    let product;
    try {
      product = await productModel.findById(productId).maxTimeMS(3000);
    } catch (dbError) {
      console.log("Database connection query failed. Falling back to default garment info:", dbError.message);
    }

    if (!product) {
      // Fallback in case of database timeout/connection failure to allow demo/replicate run
      product = {
        _id: productId,
        name: "Premium Garment",
        images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80"],
        category: category || "upper_body",
        subCategory: category || "upper_body",
        collection: "women",
        price: 999,
        description: "AI Try-On Garment"
      };
    }

    // 1️⃣ Upload human image to Cloudinary
    let humanUrl;
    try {
      const humanUpload = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "image",
      });
      humanUrl = huma9nUpload.secure_url;
    } finally {
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.log("Failed to clean up temp human upload:", err.message);
        });
      }
    }

    // 2️⃣ Upload garment image (if local) to Cloudinary
    const garmentPath = product.images[0];
    let garmentUrl = garmentPath;
    if (garmentPath && !garmentPath.startsWith("http")) {
      const garmentUpload = await cloudinary.uploader.upload(garmentPath, {
        resource_type: "image",
      });
      garmentUrl = garmentUpload.secure_url;
    }

    const garmCategory = category || "upper_body";
    const garmentDescription = product.description || product.name;

    // 3️⃣ Call Replicate VTON API or Fallback
    const token = process.env.REPLICATE_API_TOKEN;

    if (!token) {
      // Graceful fallback / Demo mode
      console.log("REPLICATE_API_TOKEN missing. Using high-quality try-on preview fallback.");
      
      // Let's return a beautiful try-on preview based on the category
      let mockTryOnUrl = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"; // default
      if (product.collection?.toLowerCase() === "men") {
        mockTryOnUrl = "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80";
      } else if (product.category?.toLowerCase() === "footwear") {
        mockTryOnUrl = "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80";
      } else if (product.category?.toLowerCase() === "accessories") {
        mockTryOnUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";
      }

      return res.json({
        success: true,
        tryOnUrl: mockTryOnUrl,
        demo: true,
        message: "Running in Demo Mode. Set REPLICATE_API_TOKEN in server .env for actual AI try-ons.",
      });
    }

    try {
      // Call Replicate using REST API
      console.log("Initiating try-on with Replicate VTON...");
      const predictionResponse = await axios.post(
        "https://api.replicate.com/v1/predictions",
        {
          version: "0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985",
          input: {
            garm_img: garmentUrl,
            human_img: humanUrl,
            garment_des: garmentDescription,
            category: garmCategory,
          },
        },
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const predictionId = predictionResponse.data.id;
      console.log("Prediction started. ID:", predictionId);

      // Poll prediction status
      let tryOnUrl = null;
      let attempts = 0;
      const maxAttempts = 30; // 30 attempts * 2s = 60s max wait time

      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        attempts++;

        console.log(`Polling prediction status (attempt ${attempts}/${maxAttempts})...`);
        const statusResponse = await axios.get(
          `https://api.replicate.com/v1/predictions/${predictionId}`,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );

        const { status, output, error } = statusResponse.data;
        if (status === "succeeded") {
          tryOnUrl = Array.isArray(output) ? output[0] : output;
          break;
        }

        if (status === "failed") {
          throw new Error(error || "Replicate prediction failed.");
        }
      }

      if (!tryOnUrl) {
        throw new Error("Prediction timed out.");
      }

      return res.json({
        success: true,
        tryOnUrl,
        demo: false,
      });

    } catch (replicateError) {
      console.log("REPLICATE MODEL ERROR 👉", replicateError.message);
      const errorDetail = replicateError.response?.data?.detail || replicateError.message;
      console.log("Falling back to demo mode due to Replicate error:", errorDetail);

      let mockTryOnUrl = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"; // default
      if (product.collection?.toLowerCase() === "men") {
        mockTryOnUrl = "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80";
      } else if (product.category?.toLowerCase() === "footwear") {
        mockTryOnUrl = "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80";
      } else if (product.category?.toLowerCase() === "accessories") {
        mockTryOnUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";
      }

      return res.json({
        success: true,
        tryOnUrl: mockTryOnUrl,
        demo: true,
        message: `Replicate API error: ${errorDetail}. Running in Demo Mode instead.`,
      });
    }

  } catch (error) {
    console.log("AI TRYON ERROR 👉", error);
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred during AI try-on.",
    });
  }
};

export {
  createHelpRequest,
  createReturnRequest,
  getAdminHelpRequests,
  getAdminReturns,
  getUserHelpRequests,
  getUserReturns,
  updateHelpRequest,
  updateReturnStatus,
  tryOnGarment,
};
