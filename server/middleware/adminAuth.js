import jwt from "jsonwebtoken";
import subAdminModel from "../models/subAdminModel.js";

const adminAuth = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    if (!token_decode) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    // 1. Superadmin authentication (from .env)
    if (token_decode.role === "admin" && token_decode.email === process.env.ADMIN_EMAIL) {
      req.admin = {
        id: "superadmin",
        email: token_decode.email,
        role: "superadmin",
        permissions: ["*"],
      };
      return next();
    }

    // 2. Sub-Admin authentication (from database)
    if (token_decode.role === "subadmin") {
      const subAdmin = await subAdminModel.findById(token_decode.id).select("-password");
      if (!subAdmin) {
        return res.status(401).json({ success: false, message: "Sub-Admin account not found" });
      }

      if (subAdmin.status !== "active") {
        return res.status(403).json({ success: false, message: "Sub-Admin account is suspended. Contact Superadmin." });
      }

      req.admin = {
        id: subAdmin._id,
        email: subAdmin.email,
        name: subAdmin.name,
        role: "subadmin",
        permissions: subAdmin.permissions || [],
      };
      return next();
    }

    return res.status(401).json({ success: false, message: "Not authorized" });
  } catch (error) {
    console.error("adminAuth error:", error);
    return res.status(401).json({ success: false, message: error.message || "Not authorized" });
  }
};

/**
 * Middleware to enforce granular module permissions for sub-admins
 */
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    if (
      req.admin.role === "superadmin" ||
      req.admin.permissions.includes("*") ||
      req.admin.permissions.includes(permission)
    ) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. You do not have permission to access '${permission}'.`,
    });
  };
};

export default adminAuth;