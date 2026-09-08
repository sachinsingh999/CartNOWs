import express from "express";
import adminAuth, { requirePermission } from "../middleware/adminAuth.js";
import {
  getSubAdmins,
  getSubAdminById,
  createSubAdmin,
  updateSubAdmin,
  toggleSubAdminStatus,
  deleteSubAdmin,
  getAdminProfile,
} from "../controllers/subAdminController.js";

const subAdminRouter = express.Router();

// All sub-admin endpoints require valid admin token
subAdminRouter.use(adminAuth);

// Current admin session profile
subAdminRouter.get("/me", getAdminProfile);

// Sub-admin management (requires superadmin or 'subadmins' permission)
subAdminRouter.get("/", requirePermission("subadmins"), getSubAdmins);
subAdminRouter.get("/:id", requirePermission("subadmins"), getSubAdminById);
subAdminRouter.post("/", requirePermission("subadmins"), createSubAdmin);
subAdminRouter.put("/:id", requirePermission("subadmins"), updateSubAdmin);
subAdminRouter.patch("/:id/status", requirePermission("subadmins"), toggleSubAdminStatus);
subAdminRouter.delete("/:id", requirePermission("subadmins"), deleteSubAdmin);

export default subAdminRouter;
