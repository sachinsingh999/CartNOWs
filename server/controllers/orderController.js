import mongoose from "mongoose";
import orderModel from "../models/orderModel.js";
import orderItemModel from "../models/orderItemModel.js";
import returnRequestModel from "../models/returnRequestModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import sellerModel from "../models/sellerModel.js";
import chatRoomModel from "../models/chatRoomModel.js";
import { autoAssignDeliveryAgent } from "../utils/assignmentHelper.js";
import Stripe from "stripe";
import Razorpay from "razorpay";
import crypto from "crypto";
import { createNotification } from "../utils/notificationHelper.js";
import { checkAndGenerateInvoice } from "../utils/invoicePdfGenerator.js";
import deliveryAssignmentModel from "../models/deliveryAssignmentModel.js";
import { trackPurchase } from "../utils/analyticsHelper.js";
import { calculateParentOrderStatus, syncParentOrderStatus } from "../utils/orderStatusHelper.js";

// Initialize payment integrations
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";
const stripe = new Stripe(stripeSecretKey);

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder";
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder";
const razorpayInstance = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
});

/* ================= HELPERS ================= */
const generateOrderNumber = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `ORD-${year}-${randomNum}`;
};

const cleanUserCart = async (userId, items) => {
  try {
    const user = await userModel.findById(userId);
    if (user && user.cartData) {
      const cartData = { ...user.cartData };
      for (const item of items) {
        const prodId = item.productId || item._id || item.itemId;
        let suffix = item.size || "";
        if (item.selectedAttributes && typeof item.selectedAttributes === "object") {
          suffix = Object.keys(item.selectedAttributes)
            .sort()
            .map((key) => `${key}:${item.selectedAttributes[key]}`)
            .join(",");
        }
        const key = `${prodId}_${suffix}`;
        delete cartData[key];
      }
      user.cartData = cartData;
      user.markModified("cartData");
      await user.save();
    }
  } catch (error) {
    console.log("Error cleaning user cart:", error);
  }
};

const createOrderAndItems = async ({
  userId,
  items,
  amount,
  address,
  paymentMethod,
  paymentStatus = "pending",
  couponCode = null,
  discount = 0,
}) => {
  let orderNumber = generateOrderNumber();
  let existing = await orderModel.findOne({ orderNumber });
  while (existing) {
    orderNumber = generateOrderNumber();
    existing = await orderModel.findOne({ orderNumber });
  }

  const subtotal = (items || []).reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1),
    0
  );
  const discountVal = Number(discount) || 0;
  const shippingFee = amount > 519 ? 0 : 40;
  const tax = Math.round(subtotal * 0.05);

  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let verificationCode = "";
  for (let i = 0; i < 6; i++) {
    verificationCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // 1. Create Parent Order
  const order = await orderModel.create({
    orderNumber,
    userId,
    amount,
    subtotal,
    tax,
    shippingFee,
    discount: discountVal,
    address,
    shippingAddress: address,
    paymentMethod,
    paymentStatus,
    orderStatus: "Processing",
    verificationCode,
    couponCode: couponCode || null,
  });

  // 2. Create Child OrderItems
  const createdItems = [];
  for (const item of items || []) {
    const prodId = item.productId || item._id || item.id || item.itemId;
    let sellerId = item.sellerId || item.product?.sellerId;
    let shopName = item.shopName;
    let sellerName = item.sellerName;
    let sellerEmail = item.sellerEmail;
    let sellerPhone = item.sellerPhone;

    if (prodId && mongoose.Types.ObjectId.isValid(prodId)) {
      const prod = await productModel.findById(prodId).lean();
      if (prod) {
        if (prod.sellerId) sellerId = prod.sellerId;
        // Reserve/deduct stock
        await productModel.findByIdAndUpdate(prodId, {
          $inc: { stock: -Math.abs(Number(item.qty) || 1) },
        });
      }
    }

    if (sellerId && mongoose.Types.ObjectId.isValid(sellerId)) {
      const seller = await sellerModel.findById(sellerId).lean();
      if (seller) {
        shopName = seller.shopName || shopName;
        sellerName = seller.name || sellerName;
        sellerEmail = seller.email || sellerEmail;
        sellerPhone = seller.phone || sellerPhone;
      }
    }

    const itemQty = Number(item.qty) || 1;
    const unitPrice = Number(item.price) || 0;
    const originalPrice =
      item.product?.originalPrice || item.originalPrice || Math.round(unitPrice * 1.25);
    const itemSubtotal = unitPrice * itemQty;
    const itemDiscount = subtotal > 0 ? Math.round((itemSubtotal / subtotal) * discountVal) : 0;
    const finalPrice = Math.max(0, itemSubtotal - itemDiscount);

    const estDate = new Date();
    estDate.setDate(estDate.getDate() + 3);

    const orderItem = await orderItemModel.create({
      orderId: order._id,
      orderNumber: order.orderNumber,
      userId,
      productId: prodId,
      productName: item.name || item.product?.name || "Product",
      productImage: item.image || item.images?.[0] || item.product?.images?.[0] || "",
      sellerId: sellerId || null,
      sellerName: sellerName || "Direct Store",
      shopName: shopName || "Platform Store",
      sellerEmail: sellerEmail || "",
      sellerPhone: sellerPhone || "",
      variant: {
        size: item.size || "Standard",
        sku: item.sku || "",
        attributes: item.selectedAttributes || {},
      },
      quantity: itemQty,
      unitPrice,
      originalPrice,
      tax: Math.round(finalPrice * 0.05),
      discount: itemDiscount,
      finalPrice,
      status: "Confirmed",
      expectedDeliveryDate: estDate,
    });

    createdItems.push(orderItem);
  }

  // Populate parent order items array for zero-breakage backward compatibility
  order.items = createdItems.map((i) => ({
    _id: i.productId,
    orderItemId: i._id,
    productId: i.productId,
    name: i.productName,
    price: i.unitPrice,
    originalPrice: i.originalPrice,
    qty: i.quantity,
    size: i.variant?.size || "Standard",
    selectedAttributes: i.variant?.attributes || {},
    status: i.status,
    sellerId: i.sellerId,
    sellerName: i.sellerName,
    shopName: i.shopName,
    images: [i.productImage],
  }));

  order.orderStatus = calculateParentOrderStatus(createdItems);
  await order.save();

  return { order, createdItems };
};

export const enrichOrdersWithSellerDetails = async (orders) => {
  if (!orders || !orders.length) return [];
  const orderIds = orders.map((o) => o._id);
  const items = await orderItemModel.find({ orderId: { $in: orderIds } }).lean();
  const requests = await returnRequestModel.find({ orderId: { $in: orderIds }, status: { $ne: "Cancelled" } }).lean();

  const itemMap = {};
  items.forEach((it) => {
    const oId = it.orderId.toString();
    if (!itemMap[oId]) itemMap[oId] = [];
    itemMap[oId].push(it);
  });

  const requestMap = {};
  requests.forEach((req) => {
    const oId = req.orderId.toString();
    if (!requestMap[oId]) requestMap[oId] = [];
    requestMap[oId].push(req);
  });

  return orders.map((order) => {
    const orderObj = typeof order.toObject === "function" ? order.toObject() : { ...order };
    const childItems = itemMap[order._id.toString()] || [];
    const activeReqs = requestMap[order._id.toString()] || [];
    orderObj.orderItems = childItems;

    if (orderObj.items && Array.isArray(orderObj.items)) {
      orderObj.items = orderObj.items.map((embItem) => {
        const matchedChild = childItems.find(
          (c) =>
            String(c._id) === String(embItem.orderItemId || embItem._id) ||
            String(c.productId) === String(embItem.productId || embItem._id)
        );

        const matchedReq = activeReqs.find(
          (r) =>
            String(r.orderItemId) === String(embItem.orderItemId || embItem._id) ||
            String(r.productId) === String(embItem.productId || embItem._id) ||
            (r.itemName && r.itemName === embItem.name)
        );

        let finalStatus = matchedChild ? matchedChild.status : embItem.status;
        if (matchedReq) {
          finalStatus = "Return Pending";
        }
        return { ...embItem, status: finalStatus };
      });
    }

    const hasChildReturnPending = (orderObj.items && orderObj.items.some((i) => (i.status || "").toLowerCase() === "return pending")) || activeReqs.length > 0;
    const topStatus = (order.orderStatus || "").toLowerCase();

    if (hasChildReturnPending || topStatus === "return pending") {
      orderObj.orderStatus = "Return Pending";
    } else if (["out for delivery", "delivered", "shipped", "cancelled", "failed delivery"].includes(topStatus)) {
      orderObj.orderStatus = order.orderStatus;
    } else {
      orderObj.orderStatus = calculateParentOrderStatus(childItems.length > 0 ? childItems : order.items) || order.orderStatus;
    }

    return orderObj;
  });
};

const createChatRoomForOrder = async (order) => {
  try {
    const existing = await chatRoomModel.findOne({ orderId: order._id });
    if (existing) return existing;

    const sellerIds = [];
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item) => {
        const sId = item.sellerId;
        if (sId) {
          const sIdStr = sId.toString();
          if (!sellerIds.includes(sIdStr)) sellerIds.push(sIdStr);
        }
      });
    }

    return await chatRoomModel.create({
      orderId: order._id,
      customerId: order.userId,
      deliverymanId: order.deliverymanId || null,
      sellerIds,
    });
  } catch (err) {
    console.error("Error auto-creating chat room:", err.message);
  }
};

/* ================= PLACE ORDER (COD) ================= */
const placeOrder = async (req, res) => {
  try {
    const { items, amount, address, paymentMethod, couponCode, discount } = req.body;
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { order } = await createOrderAndItems({
      userId: req.user._id,
      items,
      amount,
      address,
      paymentMethod,
      paymentStatus: "pending",
      couponCode,
      discount,
    });

    await cleanUserCart(req.user._id, items);
    await trackPurchase(items);
    await autoAssignDeliveryAgent(order._id);
    await createChatRoomForOrder(order);

    res.json({ success: true, order });
  } catch (error) {
    console.log("ORDER ERROR 👉", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= STRIPE CHECKOUT ================= */
const placeOrderStripe = async (req, res) => {
  try {
    const { items, amount, address, couponCode, discount } = req.body;
    const userId = req.user._id;

    const { order } = await createOrderAndItems({
      userId,
      items,
      amount,
      address,
      paymentMethod: "Stripe",
      paymentStatus: "pending",
      couponCode,
      discount,
    });

    const origin = req.headers.origin || "http://localhost:5173";

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes("placeholder")) {
      return res.json({
        success: true,
        session_url: `${origin}/verify?success=true&orderId=${order._id}&method=stripe&demo=true`,
      });
    }

    try {
      const discountVal = discount ? Number(discount) : 0;
      const totalItemsPrice = items.reduce((sum, item) => sum + item.price * item.qty, 0);
      let discountLeft = discountVal;

      const line_items = items.map((item, index) => {
        let itemTotal = item.price * item.qty;
        let itemDiscount = 0;
        if (totalItemsPrice > 0) {
          if (index === items.length - 1) {
            itemDiscount = discountLeft;
          } else {
            itemDiscount = Math.round((itemTotal / totalItemsPrice) * discountVal * 100) / 100;
          }
        }
        itemDiscount = Math.min(itemDiscount, itemTotal);
        discountLeft -= itemDiscount;
        const adjustedTotal = itemTotal - itemDiscount;
        const unitPriceINR = adjustedTotal / item.qty;

        return {
          price_data: {
            currency: "inr",
            product_data: { name: item.name },
            unit_amount: Math.max(0, Math.round(unitPriceINR * 100)),
          },
          quantity: item.qty,
        };
      });

      line_items.push({
        price_data: {
          currency: "inr",
          product_data: { name: "Shipping Charges" },
          unit_amount: Math.round(10 * 100),
        },
        quantity: 1,
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items,
        mode: "payment",
        success_url: `${origin}/verify?success=true&orderId=${order._id}&method=stripe`,
        cancel_url: `${origin}/verify?success=false&orderId=${order._id}&method=stripe`,
      });

      res.json({ success: true, session_url: session.url });
    } catch (stripeError) {
      res.json({
        success: true,
        session_url: `${origin}/verify?success=true&orderId=${order._id}&method=stripe&demo=true&error=${encodeURIComponent(stripeError.message)}`,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= STRIPE VERIFY ================= */
const verifyStripe = async (req, res) => {
  try {
    const { orderId, success } = req.body;
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { paymentStatus: "paid" });
      const order = await orderModel.findById(orderId);
      if (order) {
        await cleanUserCart(order.userId, order.items);
        await trackPurchase(order.items);
        await autoAssignDeliveryAgent(orderId);
        await createChatRoomForOrder(order);
        await checkAndGenerateInvoice(orderId);
      }
      res.json({ success: true, message: "Payment Verified Successfully" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      await orderItemModel.deleteMany({ orderId });
      res.json({ success: false, message: "Payment Cancelled" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= RAZORPAY CHECKOUT ================= */
const placeOrderRazorpay = async (req, res) => {
  try {
    const { items, amount, address, couponCode, discount } = req.body;
    const userId = req.user._id;

    const { order } = await createOrderAndItems({
      userId,
      items,
      amount,
      address,
      paymentMethod: "Razorpay",
      paymentStatus: "pending",
      couponCode,
      discount,
    });

    if (
      !process.env.RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_KEY_ID.includes("placeholder")
    ) {
      return res.json({
        success: true,
        key_id: "rzp_test_placeholder",
        orderId: order._id,
        rzpOrder: {
          id: `order_mock_${Date.now()}`,
          amount: Math.round(amount * 100),
          currency: "INR",
          isMock: true,
        },
      });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: order._id.toString(),
    };

    const rzpOrder = await razorpayInstance.orders.create(options);
    res.json({
      success: true,
      key_id: process.env.RAZORPAY_KEY_ID,
      orderId: order._id,
      rzpOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= RAZORPAY VERIFY ================= */
const verifyRazorpay = async (req, res) => {
  try {
    const { orderId, isMock } = req.body;
    if (isMock === true || isMock === "true") {
      await orderModel.findByIdAndUpdate(orderId, { paymentStatus: "paid" });
      const order = await orderModel.findById(orderId);
      if (order) {
        await cleanUserCart(order.userId, order.items);
        await trackPurchase(order.items);
        await autoAssignDeliveryAgent(orderId);
        await createChatRoomForOrder(order);
        await checkAndGenerateInvoice(orderId);
      }
      return res.json({ success: true, message: "Payment Verified Successfully" });
    }

    await orderModel.findByIdAndUpdate(orderId, { paymentStatus: "paid" });
    const order = await orderModel.findById(orderId);
    if (order) {
      await cleanUserCart(order.userId, order.items);
      await trackPurchase(order.items);
      await autoAssignDeliveryAgent(orderId);
      await createChatRoomForOrder(order);
      await checkAndGenerateInvoice(orderId);
    }
    res.json({ success: true, message: "Payment Verified Successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= ADMIN: ALL ORDERS ================= */
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({}).sort({ createdAt: -1 });
    const enrichedOrders = await enrichOrdersWithSellerDetails(orders);
    res.json({ success: true, orders: enrichedOrders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ================= USER: MY ORDERS ================= */
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    const enrichedOrders = await enrichOrdersWithSellerDetails(orders);
    res.json({ success: true, orders: enrichedOrders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ================= USER: GET ORDER BY ID ================= */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderModel.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const orderItems = await orderItemModel.find({ orderId: order._id }).lean();
    const returnRequests = await returnRequestModel.find({ orderId: order._id, status: { $ne: "Cancelled" } }).lean();

    const orderObj = order.toObject();
    orderObj.orderItems = orderItems;

    if (orderObj.items && Array.isArray(orderObj.items)) {
      orderObj.items = orderObj.items.map((embItem) => {
        const matchedChild = orderItems.find(
          (c) =>
            String(c._id) === String(embItem.orderItemId || embItem._id) ||
            String(c.productId) === String(embItem.productId || embItem._id)
        );

        const matchedReq = returnRequests.find(
          (r) =>
            String(r.orderItemId) === String(embItem.orderItemId || embItem._id) ||
            String(r.productId) === String(embItem.productId || embItem._id) ||
            (r.itemName && r.itemName === embItem.name)
        );

        let finalStatus = matchedChild ? matchedChild.status : embItem.status;
        if (matchedReq) {
          finalStatus = "Return Pending";
        }
        return { ...embItem, status: finalStatus };
      });
    }

    const hasChildReturnPending = (orderObj.items && orderObj.items.some((i) => (i.status || "").toLowerCase() === "return pending")) || returnRequests.length > 0;
    const topStatus = (order.orderStatus || "").toLowerCase();

    if (hasChildReturnPending || topStatus === "return pending") {
      orderObj.orderStatus = "Return Pending";
    } else if (["out for delivery", "delivered", "shipped", "cancelled", "failed delivery"].includes(topStatus)) {
      orderObj.orderStatus = order.orderStatus;
    } else {
      orderObj.orderStatus = calculateParentOrderStatus(orderItems.length > 0 ? orderItems : order.items) || order.orderStatus;
    }

    res.json({ success: true, order: orderObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= USER: CANCEL ORDER ITEM ================= */
const cancelOrderItem = async (req, res) => {
  try {
    const { orderItemId, reason } = req.body;
    let item = null;
    if (orderItemId && mongoose.Types.ObjectId.isValid(orderItemId)) {
      item = await orderItemModel.findById(orderItemId);
    }
    if (!item && orderItemId) {
      item = await orderItemModel.findOne({
        $or: [
          { orderItemId: orderItemId },
          { productId: orderItemId }
        ]
      });
    }

    if (!item) {
      return res.json({ success: false, message: "Order item not found" });
    }

    if (item.userId.toString() !== req.user._id.toString()) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

    const status = (item.status || "").toLowerCase();
    if (["shipped", "out for delivery", "delivered"].includes(status)) {
      return res.json({
        success: false,
        message: "This item has already been shipped and cannot be cancelled",
      });
    }

    if (status === "cancelled") {
      return res.json({ success: false, message: "This item is already cancelled" });
    }

    item.status = "Cancelled";
    item.cancelReason = reason || "Customer cancellation request";
    item.cancelledAt = new Date();
    item.refundAmount = item.finalPrice;
    item.refundStatus = "pending";
    await item.save();

    // Restore product stock
    if (item.productId) {
      await productModel.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    // Re-evaluate parent order status & sync embedded items
    const parentStatus = await syncParentOrderStatus(item.orderId);

    // Cancel active delivery assignment if parent order is completely cancelled
    if (parentStatus === "Cancelled") {
      await deliveryAssignmentModel.updateMany(
        { orderId: item.orderId, status: { $in: ["Assigned", "Accepted", "Picked Up", "Out for Delivery"] } },
        { $set: { status: "Cancelled" } }
      );
    }

    await createNotification(
      item.userId,
      item.orderId,
      "Item Cancelled",
      `Your item "${item.productName}" from order #${item.orderNumber} has been cancelled.`
    );

    res.json({
      success: true,
      message: "Item cancelled successfully",
      item,
      orderStatus: parentStatus,
    });
  } catch (error) {
    console.error("Cancel Order Item Error:", error);
    res.json({ success: false, message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    let order = null;
    if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
      order = await orderModel.findById(orderId);
    }
    if (!order && orderId) {
      order = await orderModel.findOne({ orderNumber: orderId });
    }

    if (!order) return res.json({ success: false, message: "Order not found" });

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

    const items = await orderItemModel.find({ orderId: order._id });
    for (const item of items) {
      if (!["shipped", "out for delivery", "delivered"].includes((item.status || "").toLowerCase())) {
        item.status = "Cancelled";
        item.cancelReason = reason || "Customer cancellation request";
        item.cancelledAt = new Date();
        await item.save();
        if (item.productId) {
          await productModel.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
        }
      }
    }

    // Cancel active delivery assignment
    await deliveryAssignmentModel.updateMany(
      { orderId: order._id, status: { $in: ["Assigned", "Accepted", "Picked Up", "Out for Delivery"] } },
      { $set: { status: "Cancelled" } }
    );

    // Update parent order status and embedded items
    order.orderStatus = "Cancelled";
    if (order.items && Array.isArray(order.items)) {
      order.items = order.items.map((embItem) => ({
        ...embItem,
        status: "Cancelled",
      }));
    }
    await order.save();

    await syncParentOrderStatus(order._id);

    res.json({ success: true, message: "Order cancelled successfully", orderStatus: "Cancelled" });
  } catch (error) {
    console.error("Cancel Order Error:", error);
    res.json({ success: false, message: error.message });
  }
};

/* ================= USER: RETURN ORDER ITEM ================= */
const returnOrderItem = async (req, res) => {
  try {
    const { orderItemId, reason } = req.body;
    const item = await orderItemModel.findById(orderItemId);
    if (!item) {
      return res.json({ success: false, message: "Order item not found" });
    }

    if (item.userId.toString() !== req.user._id.toString()) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

    if (item.status !== "Delivered") {
      return res.json({
        success: false,
        message: "Returns can only be requested for delivered items",
      });
    }

    item.status = "Return Requested";
    item.returnReason = reason || "Customer return request";
    item.returnedAt = new Date();
    item.refundAmount = item.finalPrice;
    item.refundStatus = "pending";
    await item.save();

    // Ensure returnRequest document exists for Admin/Seller/Delivery tracking
    const existingReq = await returnRequestModel.findOne({
      userId: req.user._id,
      orderId: item.orderId,
      productId: item.productId,
    });

    if (!existingReq) {
      await returnRequestModel.create({
        userId: req.user._id,
        orderId: item.orderId,
        productId: item.productId,
        itemName: item.productName || "Returned Item",
        itemImage: item.productImage || "",
        itemSize: item.variant?.size || item.size || "Standard",
        quantity: item.quantity || 1,
        amount: item.finalPrice || (item.unitPrice * (item.quantity || 1)),
        reason: reason || "Customer return request",
        returnType: "Refund",
        status: "Requested",
      });
    }

    const parentStatus = await syncParentOrderStatus(item.orderId);

    await createNotification(
      item.userId,
      item.orderId,
      "Return Requested",
      `Return request received for "${item.productName}". We will arrange pickup soon.`
    );

    res.json({
      success: true,
      message: "Return request submitted successfully",
      item,
      orderStatus: parentStatus,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ================= ADMIN / SELLER: UPDATE ORDER ITEM STATUS ================= */
const updateOrderItemStatusAdmin = async (req, res) => {
  try {
    const { orderItemId, status, courierName, trackingId, expectedDeliveryDate } = req.body;
    const item = await orderItemModel.findById(orderItemId);
    if (!item) {
      return res.json({ success: false, message: "Order item not found" });
    }

    item.status = status;
    if (courierName) item.courierName = courierName;
    if (trackingId) item.trackingId = trackingId;
    if (expectedDeliveryDate) item.expectedDeliveryDate = new Date(expectedDeliveryDate);

    if (status === "Shipped") item.shippedAt = new Date();
    if (status === "Out for Delivery") item.outForDeliveryAt = new Date();
    if (status === "Delivered") item.deliveredAt = new Date();

    await item.save();

    const parentStatus = await syncParentOrderStatus(item.orderId);

    res.json({
      success: true,
      message: "Item status updated successfully",
      item,
      orderStatus: parentStatus,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const order = await orderModel.findById(orderId);
    if (!order) return res.json({ success: false, message: "Order not found" });

    order.orderStatus = status;
    await order.save();

    // Update all child items to match top-level override if provided
    await orderItemModel.updateMany({ orderId }, { $set: { status } });

    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export {
  placeOrder,
  placeOrderStripe,
  placeOrderRazorpay,
  allOrders,
  userOrders,
  updateStatus,
  verifyStripe,
  verifyRazorpay,
  cancelOrder,
  getOrderById,
  cancelOrderItem,
  returnOrderItem,
  updateOrderItemStatusAdmin,
};
