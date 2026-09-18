import express from "express";
import {
  getPublicBrandPosters,
  getAllBrandPostersAdmin,
  addBrandPoster,
  updateBrandPoster,
  toggleBrandPosterStatus,
  reorderBrandPosters,
  deleteBrandPoster
} from "../controllers/brandPosterController.js";
import adminAuth, { requirePermission } from "../middleware/adminAuth.js";
import upload from "../middleware/multer.js";

const brandPosterRouter = express.Router();

// Public routes for client
brandPosterRouter.get("/", getPublicBrandPosters);

// Admin-only management routes
brandPosterRouter.get("/admin/all", adminAuth, requirePermission("promos"), getAllBrandPostersAdmin);
brandPosterRouter.post("/", adminAuth, requirePermission("promos"), upload.single("image"), addBrandPoster);
brandPosterRouter.put("/reorder", adminAuth, requirePermission("promos"), reorderBrandPosters);
brandPosterRouter.put("/:id", adminAuth, requirePermission("promos"), upload.single("image"), updateBrandPoster);
brandPosterRouter.patch("/:id/toggle", adminAuth, requirePermission("promos"), toggleBrandPosterStatus);
brandPosterRouter.delete("/:id", adminAuth, requirePermission("promos"), deleteBrandPoster);

export default brandPosterRouter;
