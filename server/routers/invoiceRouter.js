import express from "express";
import {
  getMyInvoices,
  getSellerInvoices,
  getAdminInvoices,
  downloadInvoicePdf,
  regenerateInvoice
} from "../controllers/invoiceController.js";
import authUser from "../middleware/auth.js";
import sellerAuth from "../middleware/sellerAuth.js";
import adminAuth from "../middleware/adminAuth.js";
import jwt from "jsonwebtoken";

const invoiceRouter = express.Router();

// Helper to allow authorization via either headers or query parameter token (critical for browser downloads)
const flexibleAuth = async (req, res, next) => {
  try {
    const token = req.headers.token || req.query.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Authorization token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const resolvedId = decoded.id || decoded._id;

    if (decoded.id && decoded.role === "deliveryman") {
      req.deliveryman = decoded;
    } else if (resolvedId) {
      // Set resolved ID for both user and seller checking
      req.user = { _id: resolvedId };
      req.seller = { _id: resolvedId };
    }

    // Check if admin token
    if (token === process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD || decoded === process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
      req.isAdmin = true;
    }

    next();
  } catch (error) {
    // If it fails but has a valid admin match
    const token = req.headers.token || req.query.token;
    if (token === process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
      req.isAdmin = true;
      return next();
    }
    return res.status(401).json({ success: false, message: "Unauthorized: Invalid token signature" });
  }
};

invoiceRouter.get("/my-invoices", authUser, getMyInvoices);
invoiceRouter.get("/seller-invoices", sellerAuth, getSellerInvoices);
invoiceRouter.get("/admin-invoices", adminAuth, getAdminInvoices);
invoiceRouter.get("/download/:id", flexibleAuth, downloadInvoicePdf);
invoiceRouter.post("/regenerate", adminAuth, regenerateInvoice);

export default invoiceRouter;
