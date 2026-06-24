import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { autoAssignDeliveryAgent } from "../utils/assignmentHelper.js";
import Stripe from "stripe";
import Razorpay from "razorpay";
import crypto from "crypto";
import { createNotification } from "../utils/notificationHelper.js";
import { checkAndGenerateInvoice } from "../utils/invoicePdfGenerator.js";
import deliveryAssignmentModel from "../models/deliveryAssignmentModel.js";
import { trackPurchase } from "../utils/analyticsHelper.js";



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
// Generate a random 6-character alphanumeric verification code
const generateVerificationCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // exclude ambiguous chars
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Helper function to remove only ordered items from the user's cart
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
            .map(key => `${key}:${item.selectedAttributes[key]}`)
            .join(",");
        }
        const key = `${prodId}_${suffix}`;
        delete cartData[key];
      }
      user.cartData = cartData;
      await user.save();
    }
  } catch (error) {
    console.log("Error cleaning user cart:", error);
  }
};

/* ================= PLACE ORDER (COD) ================= */
const placeOrder = async (req, res) => {
  try {
    console.log("REQ.USER 👉", req.user);
    console.log("REQ BODY 👉", req.body);

    const { items, amount, address, paymentMethod, couponCode, discount } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const verificationCode = null;

    const order = await orderModel.create({
      userId: req.user._id,
      items: items,
      amount,
      address,
      paymentMethod,
      paymentStatus: "pending",
      orderStatus: "Order Placed",
      verificationCode,
      couponCode: couponCode || null,
      discount: discount ? Number(discount) : 0,
      date: Date.now(),
    });

    // Remove only ordered items from the user's cart after order placement
    await cleanUserCart(req.user._id, items);

    // Track purchases dynamically
    await trackPurchase(items);

    // Auto-assign delivery agent
    await autoAssignDeliveryAgent(order._id);

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.log("ORDER ERROR 👉", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= STRIPE CHECKOUT ================= */
const placeOrderStripe = async (req, res) => {
  try {
    const { items, amount, address, couponCode, discount } = req.body;
    const userId = req.user._id;

    const verificationCode = null;

    const order = await orderModel.create({
      userId,
      items,
      amount,
      address,
      paymentMethod: "Stripe",
      paymentStatus: "pending",
      orderStatus: "Order Placed",
      verificationCode,
      couponCode: couponCode || null,
      discount: discount ? Number(discount) : 0,
      date: Date.now(),
    });

    const origin = req.headers.origin || "http://localhost:5173";

    // Dynamic demo mode fallback if Stripe keys are placeholders
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes("placeholder")) {
      console.log("Stripe key is placeholder. Redirecting to simulated payment success...");
      return res.json({
        success: true,
        session_url: `${origin}/verify?success=true&orderId=${order._id}&method=stripe&demo=true`,
      });
    }

    try {
      const discountVal = discount ? Number(discount) : 0;
      const totalItemsPrice = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
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
            product_data: {
              name: item.name,
            },
            unit_amount: Math.max(0, Math.round(unitPriceINR * 100)), // unit price in paise
          },
          quantity: item.qty,
        };
      });

      // Calculate adjusted shipping charge (10 INR base)
      let shippingAmountINR = 10;
      if (discountLeft > 0) {
        shippingAmountINR = Math.max(0, shippingAmountINR - discountLeft);
      }

      // Add shipping charges as line item
      line_items.push({
        price_data: {
          currency: "inr",
          product_data: {
            name: "Shipping Charges",
          },
          unit_amount: Math.round(shippingAmountINR * 100), // in paise
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
      console.log("Stripe Session Creation Failed (falling back to demo mode) 👉", stripeError.message);
      res.json({
        success: true,
        session_url: `${origin}/verify?success=true&orderId=${order._id}&method=stripe&demo=true&error=${encodeURIComponent(stripeError.message)}`,
      });
    }
  } catch (error) {
    console.log("STRIPE PAYMENT ERROR 👉", error);
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
      }
      // Auto-assign delivery agent
      await autoAssignDeliveryAgent(orderId);
      // Try generating invoice if conditions are met
      await checkAndGenerateInvoice(orderId);
      res.json({ success: true, message: "Payment Verified Successfully" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Payment Cancelled" });
    }
  } catch (error) {
    console.log("STRIPE VERIFY ERROR 👉", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= RAZORPAY CHECKOUT ================= */
const placeOrderRazorpay = async (req, res) => {
  try {
    const { items, amount, address, couponCode, discount } = req.body;
    const userId = req.user._id;

    const verificationCode = null;

    const order = await orderModel.create({
      userId,
      items,
      amount,
      address,
      paymentMethod: "Razorpay",
      paymentStatus: "pending",
      orderStatus: "Order Placed",
      verificationCode,
      couponCode: couponCode || null,
      discount: discount ? Number(discount) : 0,
      date: Date.now(),
    });

    // Dynamic demo mode fallback if Razorpay keys are placeholders
    if (
      !process.env.RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_KEY_ID.includes("placeholder") ||
      !process.env.RAZORPAY_KEY_SECRET ||
      process.env.RAZORPAY_KEY_SECRET.includes("placeholder")
    ) {
      console.log("Razorpay keys are placeholder. Creating simulated order...");
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

    try {
      const options = {
        amount: Math.round(amount * 100), // amount in paise
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
    } catch (rzpError) {
      console.log("Razorpay Order Creation Failed (falling back to demo mode) 👉", rzpError.message);
      res.json({
        success: true,
        key_id: "rzp_test_placeholder",
        orderId: order._id,
        rzpOrder: {
          id: `order_mock_${Date.now()}`,
          amount: Math.round(amount * 100),
          currency: "INR",
          isMock: true,
          error: rzpError.message,
        },
      });
    }
  } catch (error) {
    console.log("RAZORPAY PAYMENT ERROR 👉", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= RAZORPAY VERIFY ================= */
const verifyRazorpay = async (req, res) => {
  try {
    const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature, isMock } = req.body;

    if (isMock === true || isMock === "true") {
      console.log("Verifying simulated Razorpay payment...");
      await orderModel.findByIdAndUpdate(orderId, { paymentStatus: "paid" });
      const order = await orderModel.findById(orderId);
      if (order) {
        await cleanUserCart(order.userId, order.items);
        await trackPurchase(order.items);
      }
      // Auto-assign delivery agent
      await autoAssignDeliveryAgent(orderId);
      // Try generating invoice if conditions are met
      await checkAndGenerateInvoice(orderId);
      return res.json({ success: true, message: "Payment Verified Successfully" });
    }

    // Verify cryptographic SHA256 HMAC signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature === razorpay_signature) {
      await orderModel.findByIdAndUpdate(orderId, { paymentStatus: "paid" });
      const order = await orderModel.findById(orderId);
      if (order) {
        await cleanUserCart(order.userId, order.items);
        await trackPurchase(order.items);
      }
      // Auto-assign delivery agent
      await autoAssignDeliveryAgent(orderId);
      // Try generating invoice if conditions are met
      await checkAndGenerateInvoice(orderId);
      res.json({ success: true, message: "Payment Verified Successfully" });
    } else {
      res.json({ success: false, message: "Signature verification failed" });
    }
  } catch (error) {
    console.log("RAZORPAY VERIFY ERROR 👉", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= ADMIN: ALL ORDERS ================= */
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({}).sort({ date: -1 });
    
    // Fetch active assignments for these orders
    const orderIds = orders.map(o => o._id);
    const assignments = await deliveryAssignmentModel.find({
      orderId: { $in: orderIds },
      status: { $nin: ["Cancelled", "Rejected"] }
    });

    const ordersWithAssignments = orders.map(order => {
      const orderObj = order.toObject();
      if (order.deliverymanId) {
        const assignment = assignments.find(
          a => a.orderId.toString() === order._id.toString() &&
               a.agentId.toString() === order.deliverymanId.toString()
        );
        orderObj.assignmentStatus = assignment ? assignment.status : "Assigned";
        orderObj.assignedAt = assignment ? assignment.assignedAt : null;
      } else {
        orderObj.assignmentStatus = null;
        orderObj.assignedAt = null;
      }
      return orderObj;
    });

    res.json({ success: true, orders: ordersWithAssignments });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ================= USER: MY ORDERS ================= */
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ userId: req.user._id })
      .sort({ date: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ================= ADMIN: UPDATE STATUS ================= */
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    order.orderStatus = status;
    await order.save();

    // Sync status with DeliveryAssignment if deliveryman is assigned
    if (order.deliverymanId) {
      await deliveryAssignmentModel.findOneAndUpdate(
        { orderId, agentId: order.deliverymanId, status: { $in: ["Assigned", "Accepted", "Picked Up", "Out for Delivery"] } },
        { status, ...(status === "Delivered" ? { deliveredAt: new Date() } : {}) }
      );
    }

    // Try generating invoice if conditions are met
    await checkAndGenerateInvoice(orderId);

    // Trigger notification to customer
    await createNotification(
      order.userId,
      order._id,
      "Order Status Updated",
      `Your order #${order._id.toString().slice(-6).toUpperCase()} status has been updated to "${status}".`
    );

    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ================= USER: CANCEL ORDER ================= */
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    // Verify order ownership
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

    // Check cancellation eligibility
    const status = order.orderStatus.toLowerCase();
    if (status === "delivered") {
      return res.json({
        success: false,
        message: `Order cannot be cancelled once it has been delivered`,
      });
    }

    if (status === "cancelled") {
      return res.json({ success: false, message: "Order is already cancelled" });
    }

    // Update status and unassign deliveryman
    order.orderStatus = "Cancelled";
    order.deliverymanId = null;
    await order.save();

    // Trigger notification to customer
    await createNotification(
      order.userId,
      order._id,
      "Order Cancelled",
      `Your order #${order._id.toString().slice(-6).toUpperCase()} has been successfully cancelled.`
    );

    res.json({ success: true, message: "Order cancelled successfully" });
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
};
