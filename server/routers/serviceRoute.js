import express from "express";
import adminAuth, { requirePermission } from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import {
  createHelpRequest,
  createReturnRequest,
  getAdminHelpRequests,
  getAdminReturns,
  getUserHelpRequests,
  getUserReturns,
  updateHelpRequest,
  updateReturnStatus,
  tryOnGarment,
} from "../controllers/serviceController.js";

const serviceRouter = express.Router();

serviceRouter.post("/tryon", authUser, upload.single("humanImage"), tryOnGarment);

serviceRouter.post("/returns/create", authUser, createReturnRequest);
serviceRouter.get("/returns/user", authUser, getUserReturns);
serviceRouter.post("/returns/admin/list", adminAuth, requirePermission("returns"), getAdminReturns);
serviceRouter.post("/returns/admin/status", adminAuth, requirePermission("returns"), updateReturnStatus);

serviceRouter.post("/help/create", authUser, createHelpRequest);
serviceRouter.get("/help/user", authUser, getUserHelpRequests);
serviceRouter.post("/help/admin/list", adminAuth, requirePermission("support"), getAdminHelpRequests);
serviceRouter.post("/help/admin/status", adminAuth, requirePermission("support"), updateHelpRequest);

export default serviceRouter;
