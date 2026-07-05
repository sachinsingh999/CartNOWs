import express from "express";
import { getDeals, createDeal, updateDeal, deleteDeal } from "../controllers/dealOfDayController.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";

const dealOfDayRouter = express.Router();

// Public routes
dealOfDayRouter.get("/", getDeals);

// Admin routes
const adminDealOfDayRouter = express.Router();
adminDealOfDayRouter.use(adminAuth);

adminDealOfDayRouter.get("/", getDeals);
adminDealOfDayRouter.post("/", upload.single("image"), createDeal);
adminDealOfDayRouter.put("/:id", upload.single("image"), updateDeal);
adminDealOfDayRouter.delete("/:id", deleteDeal);

export { dealOfDayRouter, adminDealOfDayRouter };
