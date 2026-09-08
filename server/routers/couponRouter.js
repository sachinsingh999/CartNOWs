import express from "express";
import { createCoupon, listCoupons, toggleCoupon, deleteCoupon, applyCoupon } from "../controllers/couponController.js";
import authUser from "../middleware/auth.js";
import adminAuth, { requirePermission } from "../middleware/adminAuth.js";

const couponRouter = express.Router();

couponRouter.post("/create", adminAuth, requirePermission("promos"), createCoupon);
couponRouter.get("/list", listCoupons);
couponRouter.post("/toggle", adminAuth, requirePermission("promos"), toggleCoupon);
couponRouter.post("/delete", adminAuth, requirePermission("promos"), deleteCoupon);
couponRouter.post("/apply", authUser, applyCoupon);

export default couponRouter;
