import express from "express";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";
import {
  getActivePromoBanner,
  getAllPromoBanners,
  createPromoBanner,
  updatePromoBanner,
  togglePromoBannerStatus,
  deletePromoBanner
} from "../controllers/promoBannerController.js";

const promoBannerRouter = express.Router();

// Public route to fetch the active promo banner for homepage
promoBannerRouter.get("/active", getActivePromoBanner);

// Multer middleware supporting both single image and multiple images array
const bannerUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "images", maxCount: 10 }
]);

// Admin-managed routes
promoBannerRouter.get("/", adminAuth, getAllPromoBanners);
promoBannerRouter.post("/", adminAuth, bannerUpload, createPromoBanner);
promoBannerRouter.put("/:id", adminAuth, bannerUpload, updatePromoBanner);
promoBannerRouter.patch("/:id/status", adminAuth, togglePromoBannerStatus);
promoBannerRouter.patch("/:id/toggle", adminAuth, togglePromoBannerStatus);
promoBannerRouter.delete("/:id", adminAuth, deletePromoBanner);

export default promoBannerRouter;
