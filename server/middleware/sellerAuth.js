import jwt from "jsonwebtoken";
import sellerModel from "../models/sellerModel.js";

const sellerAuth = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.status(401).json({ success: false, message: "Not Authorized, Login Again" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ success: false, message: "Invalid token structure" });
    }

    const seller = await sellerModel.findById(decoded.id);
    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller profile not found" });
    }

    if (seller.status !== "active") {
      return res.status(403).json({ success: false, message: `Your account status is ${seller.status}. Contact support.` });
    }

    req.seller = seller;
    next();
  } catch (error) {
    console.error("Seller authorization error:", error.message);
    res.status(401).json({ success: false, message: "Session expired or invalid token signature" });
  }
};

export default sellerAuth;
