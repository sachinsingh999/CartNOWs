import mongoose from "mongoose";
import subAdminModel from "../models/subAdminModel.js";
import bcrypt from "bcrypt";
import validator from "validator";

// Available permission modules
export const AVAILABLE_PERMISSIONS = [
  { id: "orders", label: "Orders Management", description: "View orders board, update delivery and item statuses" },
  { id: "products", label: "Product Catalog", description: "Manage products, catalog moderation, categories, and brands" },
  { id: "returns", label: "Returns & RMA", description: "Handle customer returns, inspections, and refund approvals" },
  { id: "deliverymen", label: "Delivery Fleet", description: "View delivery partners, assign delivery zones, review complaints" },
  { id: "sellers", label: "Sellers & Vendors", description: "Approve sellers, adjust commissions, and process payouts" },
  { id: "customers", label: "Customers", description: "Manage customer profiles, addresses, and access status" },
  { id: "support", label: "Support Tickets", description: "Review and respond to customer support inquiries" },
  { id: "promos", label: "Marketing & Promos", description: "Manage discount coupons, flash deals, and hero banners" },
  { id: "finance", label: "Finance & Invoices", description: "Access financial analytics, platform fees, and invoice regeneration" },
  { id: "subadmins", label: "Staff & Sub-Admins", description: "Create and manage sub-administrator accounts and permissions" },
];

/**
 * Get all sub-admins (with search and status filter)
 */
export const getSubAdmins = async (req, res) => {
  try {
    const { search = "", status = "" } = req.query;

    const query = {};
    if (status && status !== "all") {
      query.status = status;
    }
    if (search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const subAdmins = await subAdminModel
      .find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    const totalCount = await subAdminModel.countDocuments();
    const activeCount = await subAdminModel.countDocuments({ status: "active" });
    const suspendedCount = await subAdminModel.countDocuments({ status: "suspended" });

    res.json({
      success: true,
      subAdmins,
      stats: {
        total: totalCount,
        active: activeCount,
        suspended: suspendedCount,
        superAdminEmail: process.env.ADMIN_EMAIL,
      },
      availablePermissions: AVAILABLE_PERMISSIONS,
    });
  } catch (error) {
    console.error("getSubAdmins error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create a new sub-admin account
 */
export const createSubAdmin = async (req, res) => {
  try {
    const { name, email, password, permissions = [] } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
    }

    let cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.endsWith("@cartnow.com")) {
      const prefix = cleanEmail.replace(/@.*$/, "");
      cleanEmail = `${prefix}@cartnow.com`;
    }

    // Prevent using superadmin email
    if (cleanEmail === (process.env.ADMIN_EMAIL || "").toLowerCase()) {
      return res.status(400).json({ success: false, message: "Email is reserved for Superadmin" });
    }

    // Check duplicate
    const existing = await subAdminModel.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: "A sub-admin with this email already exists" });
    }

    // Validate permissions array against known modules
    const validPermIds = AVAILABLE_PERMISSIONS.map((p) => p.id);
    const sanitizedPermissions = Array.isArray(permissions)
      ? permissions.filter((p) => validPermIds.includes(p))
      : [];

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newSubAdmin = new subAdminModel({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      plainPassword: password,
      permissions: sanitizedPermissions,
      status: "active",
      createdBy: req.admin?.email || "Superadmin",
    });

    await newSubAdmin.save();

    const result = newSubAdmin.toObject();
    delete result.password;

    res.status(201).json({
      success: true,
      message: "Sub-Admin account created successfully",
      subAdmin: result,
    });
  } catch (error) {
    console.error("createSubAdmin error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update sub-admin details (name, permissions, or password reset)
 */
export const updateSubAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Sub-Admin ID" });
    }
    const { name, permissions, password } = req.body;

    const subAdmin = await subAdminModel.findById(id);
    if (!subAdmin) {
      return res.status(404).json({ success: false, message: "Sub-Admin not found" });
    }

    if (name) {
      subAdmin.name = name.trim();
    }

    if (Array.isArray(permissions)) {
      const validPermIds = AVAILABLE_PERMISSIONS.map((p) => p.id);
      subAdmin.permissions = permissions.filter((p) => validPermIds.includes(p));
    }

    if (password && password.trim()) {
      if (password.length < 8) {
        return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
      }
      const salt = await bcrypt.genSalt(10);
      subAdmin.password = await bcrypt.hash(password, salt);
      subAdmin.plainPassword = password.trim();
    }

    await subAdmin.save();

    const result = subAdmin.toObject();
    delete result.password;

    res.json({
      success: true,
      message: "Sub-Admin updated successfully",
      subAdmin: result,
    });
  } catch (error) {
    console.error("updateSubAdmin error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Toggle sub-admin status (active <-> suspended)
 */
export const toggleSubAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Sub-Admin ID" });
    }

    const subAdmin = await subAdminModel.findById(id);
    if (!subAdmin) {
      return res.status(404).json({ success: false, message: "Sub-Admin not found" });
    }

    subAdmin.status = subAdmin.status === "active" ? "suspended" : "active";
    await subAdmin.save();

    res.json({
      success: true,
      message: `Sub-Admin account has been ${subAdmin.status}`,
      status: subAdmin.status,
    });
  } catch (error) {
    console.error("toggleSubAdminStatus error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete a sub-admin account
 */
export const deleteSubAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Sub-Admin ID" });
    }

    const subAdmin = await subAdminModel.findByIdAndDelete(id);
    if (!subAdmin) {
      return res.status(404).json({ success: false, message: "Sub-Admin not found" });
    }

    res.json({
      success: true,
      message: "Sub-Admin account deleted successfully",
    });
  } catch (error) {
    console.error("deleteSubAdmin error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get single sub-admin by ID
 */
export const getSubAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Sub-Admin ID" });
    }

    const subAdmin = await subAdminModel.findById(id).select("-password");
    if (!subAdmin) {
      return res.status(404).json({ success: false, message: "Sub-admin not found" });
    }

    res.json({
      success: true,
      subAdmin,
      availablePermissions: AVAILABLE_PERMISSIONS,
    });
  } catch (error) {
    console.error("getSubAdminById error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get current admin session profile & permissions
 */
export const getAdminProfile = async (req, res) => {
  try {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    res.json({
      success: true,
      admin: req.admin,
      availablePermissions: AVAILABLE_PERMISSIONS,
    });
  } catch (error) {
    console.error("getAdminProfile error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


