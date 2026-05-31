import express from "express";
import { 
  registerDeliveryman,
  listDeliverymen,
  updateDriverStatus,
  assignOrder,
  loginDeliveryman,
  getAssignedOrders,
  getUnassignedOrders,
  claimOrder,
  updateOrderStatus,
  toggleDutyStatus,
  deactivateAccount,
  createComplaint,
  getComplaints,
  adminGetComplaints,
  adminReplyComplaint,
  getDriverStats,
  getAssignedReturns,
  updateReturnTaskStatus
} from "../controllers/deliverymanController.js";
import adminAuth from "../middleware/adminAuth.js";
import deliverymanAuth from "../middleware/deliverymanAuth.js";

const deliverymanRouter = express.Router();

// Admin Endpoints
deliverymanRouter.get("/list", adminAuth, listDeliverymen);
deliverymanRouter.post("/assign", adminAuth, assignOrder);
deliverymanRouter.post("/status", adminAuth, updateDriverStatus);
deliverymanRouter.get("/complaints-list", adminAuth, adminGetComplaints);
deliverymanRouter.post("/complaint-reply", adminAuth, adminReplyComplaint);

// Public / Portal Signup
deliverymanRouter.post("/register", registerDeliveryman);

// Driver Endpoints
deliverymanRouter.post("/login", loginDeliveryman);
deliverymanRouter.get("/orders", deliverymanAuth, getAssignedOrders);
deliverymanRouter.get("/unassigned", deliverymanAuth, getUnassignedOrders);
deliverymanRouter.post("/claim", deliverymanAuth, claimOrder);
deliverymanRouter.post("/update-status", deliverymanAuth, updateOrderStatus);
deliverymanRouter.get("/stats", deliverymanAuth, getDriverStats);
deliverymanRouter.post("/toggle-duty", deliverymanAuth, toggleDutyStatus);
deliverymanRouter.post("/deactivate", deliverymanAuth, deactivateAccount);
deliverymanRouter.post("/complaint", deliverymanAuth, createComplaint);
deliverymanRouter.get("/complaints", deliverymanAuth, getComplaints);

// Return Tasks Endpoints
deliverymanRouter.get("/returns", deliverymanAuth, getAssignedReturns);
deliverymanRouter.post("/update-return", deliverymanAuth, updateReturnTaskStatus);

export default deliverymanRouter;
