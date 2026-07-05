import jwt from "jsonwebtoken";
import orderModel from "../models/orderModel.js";
import { canCommunicate } from "../utils/communicationHelper.js";
import sellerModel from "../models/sellerModel.js";
import deliverymanModel from "../models/deliverymanModel.js";

export const canAccessOrderCommunication = async (req, res, next) => {
  try {
    // Look for token in Authorization header or custom header
    let token = req.headers.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Access Denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || (!decoded.id && !decoded._id)) {
      return res.status(401).json({ success: false, message: "Invalid access token." });
    }

    const userId = decoded.id || decoded._id;
    let role = "customer"; // Default role

    // Resolve user role
    if (decoded.role === "deliveryman") {
      role = "deliveryman";
    } else {
      const seller = await sellerModel.findById(userId);
      if (seller) {
        role = "seller";
      } else {
        const deliveryman = await deliverymanModel.findById(userId);
        if (deliveryman) {
          role = "deliveryman";
        }
      }
    }

    // Load order ID
    const orderId = req.params.id || req.body.orderId;
    if (!orderId) {
      return res.status(400).json({ success: false, message: "Missing order ID parameter." });
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Requested order not found." });
    }

    // Verify participation
    const participant = canCommunicate(order, role, userId);
    if (!participant) {
      return res.status(403).json({ success: false, message: "Unauthorized. You are not a participant in this order." });
    }

    // Attach role variables
    req.userId = userId;
    req.userRole = role;
    req.order = order;

    next();
  } catch (error) {
    console.error("Communication auth error:", error);
    return res.status(401).json({ success: false, message: "Session expired or unauthorized." });
  }
};

const messageRateLimits = new Map(); // key: userId, value: array of timestamps

export const rateLimitMessage = (req, res, next) => {
  const userIdStr = req.userId.toString();
  const now = Date.now();

  if (!messageRateLimits.has(userIdStr)) {
    messageRateLimits.set(userIdStr, []);
  }

  const timestamps = messageRateLimits.get(userIdStr);

  // Keep only timestamps from the last 10 seconds
  const tenSecondsAgo = now - 10000;
  const activeTimestamps = timestamps.filter(t => t > tenSecondsAgo);

  if (activeTimestamps.length >= 5) { // Max 5 messages per 10 seconds
    return res.status(429).json({
      success: false,
      message: "Too many messages sent. Please slow down."
    });
  }

  activeTimestamps.push(now);
  messageRateLimits.set(userIdStr, activeTimestamps);
  next();
};
