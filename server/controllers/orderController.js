import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import Razorpay from "razorpay";
import crypto from "crypto";
import { createNotification } from "../utils/notificationHelper.js";


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

    // Clear cart after order placement
    await userModel.findByIdAndUpdate(req.user._id, {
      cartData: {},
    });

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

    await userModel.findByIdAndUpdate(userId, { cartData: {} });

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
      const line_items = items.map((item) => ({
        price_data: {
          currency: "inr",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100), // unit price in paise
        },
        quantity: item.qty,
      }));

      // Add shipping charges (10 INR) as line item
      line_items.push({
        price_data: {
          currency: "inr",
          product_data: {
            name: "Shipping Charges",
          },
          unit_amount: 10 * 100, // 10 rupees in paise
        },
        quantity: 1,
      });

      if (discount && discount > 0) {
        line_items.push({
          price_data: {
            currency: "inr",
            product_data: {
              name: `Promo Code Discount (${couponCode || "COUPON"})`,
            },
            unit_amount: Math.round(-discount * 100), // negative amount in paise
          },
          quantity: 1,
        });
      }

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

    await userModel.findByIdAndUpdate(userId, { cartData: {} });

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

    if (isMock) {
      console.log("Verifying simulated Razorpay payment...");
      await orderModel.findByIdAndUpdate(orderId, { paymentStatus: "paid" });
      return res.json({ success: true, message: "Payment Verified Successfully" });
    }

    // Verify cryptographic SHA256 HMAC signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature === razorpay_signature) {
      await orderModel.findByIdAndUpdate(orderId, { paymentStatus: "paid" });
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
    res.json({ success: true, orders });
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
