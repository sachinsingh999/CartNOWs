import express from "express";
import { getMaintenancePublic } from "../controllers/maintenanceController.js";
import { getHeroAssets, addHeroAsset, updateHeroAsset, deleteHeroAsset, removeHeroAssetBackground, reorderHeroAssets } from "../controllers/heroAssetController.js";
import { sendContactMessage } from "../controllers/contactController.js";
import adminAuth, { requirePermission } from "../middleware/adminAuth.js";
import upload from "../middleware/multer.js";

const systemRouter = express.Router();

systemRouter.get("/maintenance", getMaintenancePublic);
systemRouter.post("/contact", sendContactMessage);
systemRouter.get("/hero-assets", getHeroAssets);
systemRouter.post("/hero-assets", adminAuth, requirePermission("promos"), upload.single("image"), addHeroAsset);
systemRouter.put("/hero-assets/:id", adminAuth, requirePermission("promos"), upload.single("image"), updateHeroAsset);
systemRouter.post("/hero-assets/remove-bg", adminAuth, requirePermission("promos"), upload.single("image"), removeHeroAssetBackground);
systemRouter.put("/hero-assets/reorder", adminAuth, requirePermission("promos"), reorderHeroAssets);
systemRouter.delete("/hero-assets/:id", adminAuth, requirePermission("promos"), deleteHeroAsset);

export default systemRouter;
