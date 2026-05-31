import express from "express";
import {
  createSale, getAllSales, toggleSale, deleteSale, getActiveSales,
} from "../controllers/saleController.js";
import adminAuth from "../middleware/adminAuth.js";

const saleRouter = express.Router();

// Public
saleRouter.get("/active", getActiveSales);

// Admin-protected
saleRouter.post("/create", adminAuth, createSale);
saleRouter.get("/all", adminAuth, getAllSales);
saleRouter.patch("/toggle/:id", adminAuth, toggleSale);
saleRouter.delete("/delete/:id", adminAuth, deleteSale);

export default saleRouter;
