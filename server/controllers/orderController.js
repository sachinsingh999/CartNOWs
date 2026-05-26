import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

/* ================= PLACE ORDER ================= */
const placeOrder = async (req, res) => {
  try {
    console.log("REQ.USER 👉", req.user); // 🔍 MUST SHOW _id
    console.log("REQ BODY 👉", req.body);

    const { items, amount, address, paymentMethod } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const order = await orderModel.create({
      userId: req.user._id,      // 🔥 FIX 1
      items: items,              // 🔥 FIX 2
      amount,
      address,
      paymentMethod,
      paymentStatus: "pending",
      orderStatus: "Order Placed",
      date: Date.now(),
    });

    // optional: clear cart after order
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

/* ================= STRIPE (PLACEHOLDER) ================= */
const placeOrderStripe = async (req, res) => {
  try {
    res.json({ success: true, message: "Stripe order placeholder" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ================= RAZORPAY (PLACEHOLDER) ================= */
const placeOrderRazorpay = async (req, res) => {
  try {
    res.json({ success: true, message: "Razorpay order placeholder" });
  } catch (error) {
    res.json({ success: false, message: error.message });
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
      .find({ userId: req.user._id }) // 🔥 FIX 3
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

    await orderModel.findByIdAndUpdate(orderId, {
      orderStatus: status,
    });

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
};
