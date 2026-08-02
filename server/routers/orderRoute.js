import express from "express";
import {
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
} from "../controllers/orderController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";

const orderRouter = express.Router();

// Admin features
orderRouter.post("/list", adminAuth, allOrders);
orderRouter.post("/status", adminAuth, updateStatus);
orderRouter.post("/update-item-status", adminAuth, updateOrderItemStatusAdmin);

// Payment feature
orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/stripe", authUser, placeOrderStripe);
orderRouter.post("/rozorpay", authUser, placeOrderRazorpay);
orderRouter.post("/verifyStripe", authUser, verifyStripe);
orderRouter.post("/verifyRazorpay", authUser, verifyRazorpay);

// User feature
orderRouter.post("/userOrder", authUser, userOrders);
orderRouter.post("/cancel", authUser, cancelOrder);
orderRouter.post("/cancel-item", authUser, cancelOrderItem);
orderRouter.post("/return-item", authUser, returnOrderItem);
orderRouter.get("/:id", authUser, getOrderById);

export default orderRouter;
