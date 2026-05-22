import helpRequestModel from "../models/helpRequestModel.js";
import orderModel from "../models/orderModel.js";
import returnRequestModel from "../models/returnRequestModel.js";
import userModel from "../models/userModel.js";

const sanitizeText = (value) => (typeof value === "string" ? value.trim() : "");

const createReturnRequest = async (req, res) => {
  try {
    const { orderId, productId, size, reason, feedback } = req.body;

    const cleanReason = sanitizeText(reason);
    const cleanFeedback = sanitizeText(feedback);
    const cleanSize = sanitizeText(size);

    if (!orderId || !productId || !cleanReason) {
      return res.status(400).json({
        success: false,
        message: "Order, product, and reason are required.",
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

    const item = order.items.find(
      (entry) =>
        String(entry.productId) === String(productId) &&
        sanitizeText(entry.size) === cleanSize
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Order item not found.",
      });
    }

    const existingRequest = await returnRequestModel.findOne({
      userId: req.user._id,
      orderId,
      productId,
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
      productId,
      itemName: item.name,
      itemImage: Array.isArray(item.image) ? item.image[0] : item.image,
      itemSize: cleanSize,
      quantity: Number(item.qty) || 1,
      amount: (Number(item.price) || 0) * (Number(item.qty) || 1),
      reason: cleanReason,
      feedback: cleanFeedback,
    });

    return res.json({
      success: true,
      message: "Return request submitted successfully.",
      returnRequest: createdRequest,
    });
  } catch (error) {
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
    const { requestId, status, adminNote } = req.body;

    if (!requestId || !status) {
      return res.status(400).json({
        success: false,
        message: "Request and status are required.",
      });
    }

    await returnRequestModel.findByIdAndUpdate(requestId, {
      status,
      adminNote: sanitizeText(adminNote),
    });

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

export {
  createHelpRequest,
  createReturnRequest,
  getAdminHelpRequests,
  getAdminReturns,
  getUserHelpRequests,
  getUserReturns,
  updateHelpRequest,
  updateReturnStatus,
};
