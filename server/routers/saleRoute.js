import express from "express";
import {
  createSale, getAllSales, toggleSale, deleteSale, getActiveSales,
} from "../controllers/saleController.js";
import adminAuth, { requirePermission } from "../middleware/adminAuth.js";

const saleRouter = express.Router();

// Public
saleRouter.get("/active", getActiveSales);

// Admin-protected
saleRouter.post("/create", adminAuth, requirePermission("promos"), createSale);
saleRouter.get("/all", adminAuth, requirePermission("promos"), getAllSales);
saleRouter.patch("/toggle/:id", adminAuth, requirePermission("promos"), toggleSale);
saleRouter.delete("/delete/:id", adminAuth, requirePermission("promos"), deleteSale);

export default saleRouter;
