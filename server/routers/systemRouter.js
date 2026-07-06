import express from "express";
import { getMaintenancePublic } from "../controllers/maintenanceController.js";
import { getHeroAssets, addHeroAsset, updateHeroAsset, deleteHeroAsset, removeHeroAssetBackground, reorderHeroAssets } from "../controllers/heroAssetController.js";
import adminAuth from "../middleware/adminAuth.js";
import upload from "../middleware/multer.js";

const systemRouter = express.Router();

systemRouter.get("/maintenance", getMaintenancePublic);
systemRouter.get("/hero-assets", getHeroAssets);
systemRouter.post("/hero-assets", adminAuth, upload.single("image"), addHeroAsset);
systemRouter.put("/hero-assets/:id", adminAuth, upload.single("image"), updateHeroAsset);
systemRouter.post("/hero-assets/remove-bg", adminAuth, upload.single("image"), removeHeroAssetBackground);
systemRouter.put("/hero-assets/reorder", adminAuth, reorderHeroAssets);
systemRouter.delete("/hero-assets/:id", adminAuth, deleteHeroAsset);

export default systemRouter;
