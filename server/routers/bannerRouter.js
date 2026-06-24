import express from "express";
import { getBanners, createBanner, updateBanner, deleteBanner } from "../controllers/bannerController.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";

const bannerRouter = express.Router();

// Public routes
bannerRouter.get("/", getBanners);

// Admin routes
const adminBannerRouter = express.Router();
adminBannerRouter.use(adminAuth);

adminBannerRouter.post("/", upload.single("image"), createBanner);
adminBannerRouter.put("/:id", upload.single("image"), updateBanner);
adminBannerRouter.delete("/:id", deleteBanner);

export { bannerRouter, adminBannerRouter };
