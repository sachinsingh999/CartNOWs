import express from "express";
import { getWishlist, toggleWishlist } from "../controllers/wishlistController.js";
import authUser from "../middleware/auth.js";

const wishlistRouter = express.Router();

wishlistRouter.post("/get", authUser, getWishlist);
wishlistRouter.post("/toggle", authUser, toggleWishlist);

export default wishlistRouter;
