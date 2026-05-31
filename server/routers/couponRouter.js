import express from "express";
import { createCoupon, listCoupons, toggleCoupon, deleteCoupon, applyCoupon } from "../controllers/couponController.js";
import authUser from "../middleware/auth.js";

const couponRouter = express.Router();

couponRouter.post("/create", createCoupon);
couponRouter.get("/list", listCoupons);
couponRouter.post("/toggle", toggleCoupon);
couponRouter.post("/delete", deleteCoupon);
couponRouter.post("/apply", authUser, applyCoupon);

export default couponRouter;
