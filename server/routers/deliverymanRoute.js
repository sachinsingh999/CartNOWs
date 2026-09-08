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
  updateReturnTaskStatus,
  updateProfile,
  updateAvailability,
  updateDeliveryZones,
  acceptDelivery,
  rejectDelivery,
  updateDeliveryCoordinates,
  changePassword,
  forgotPassword,
  resetPassword
} from "../controllers/deliverymanController.js";
import adminAuth, { requirePermission } from "../middleware/adminAuth.js";
import deliverymanAuth from "../middleware/deliverymanAuth.js";

const deliverymanRouter = express.Router();

// Admin Endpoints
deliverymanRouter.get("/list", adminAuth, requirePermission("deliverymen"), listDeliverymen);
deliverymanRouter.post("/assign", adminAuth, requirePermission("deliverymen"), assignOrder);
deliverymanRouter.post("/status", adminAuth, requirePermission("deliverymen"), updateDriverStatus);
deliverymanRouter.get("/complaints-list", adminAuth, requirePermission("deliverymen"), adminGetComplaints);
deliverymanRouter.post("/complaint-reply", adminAuth, requirePermission("deliverymen"), adminReplyComplaint);

// Public / Portal Signup & Recovery
deliverymanRouter.post("/register", registerDeliveryman);
deliverymanRouter.post("/forgot-password", forgotPassword);
deliverymanRouter.post("/reset-password", resetPassword);

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
deliverymanRouter.put("/profile/update", deliverymanAuth, updateProfile);
deliverymanRouter.post("/update-availability", deliverymanAuth, updateAvailability);
deliverymanRouter.post("/update-zones", deliverymanAuth, updateDeliveryZones);
deliverymanRouter.post("/update-coordinates", deliverymanAuth, updateDeliveryCoordinates);
deliverymanRouter.post("/accept-delivery", deliverymanAuth, acceptDelivery);
deliverymanRouter.post("/reject-delivery", deliverymanAuth, rejectDelivery);
deliverymanRouter.post("/change-password", deliverymanAuth, changePassword);

// Return Tasks Endpoints
deliverymanRouter.get("/returns", deliverymanAuth, getAssignedReturns);
deliverymanRouter.post("/update-return", deliverymanAuth, updateReturnTaskStatus);

export default deliverymanRouter;
