import jwt from "jsonwebtoken";
import maintenanceModel from "../models/maintenanceModel.js";
import auditLogModel from "../models/auditLogModel.js";

// Local cache for high-performance retrieval
let maintenanceCache = null;

export const getMaintenanceSettingsCached = async () => {
  if (maintenanceCache) {
    return maintenanceCache;
  }
  let settings = await maintenanceModel.findOne({});
  if (!settings) {
    settings = await maintenanceModel.create({
      enabled: false,
      title: "CartNOW is Under Maintenance",
      message: "We are improving our services. Please check back shortly.",
      estimatedReturn: null,
      bannerImage: "",
      contactEmail: "support@cartnow.com",
      contactPhone: "+91 9988776655",
      whitelistIps: [],
      updatedBy: "System"
    });
  }
  maintenanceCache = settings;
  return settings;
};

export const clearMaintenanceCache = () => {
  maintenanceCache = null;
};

// Helper to write admin audit log
const writeAuditLog = async (req, action, target, details) => {
  try {
    let email = "admin@cartnow.com";
    const { token } = req.headers;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded && typeof decoded === "string") {
          email = decoded.replace(process.env.ADMIN_PASSWORD, "") || "admin@cartnow.com";
        }
      } catch (err) {}
    }
    await auditLogModel.create({
      adminEmail: email,
      action,
      target,
      details
    });
  } catch (err) {
    console.error("writeAuditLog error:", err);
  }
};

// GET /api/system/maintenance (Public)
export const getMaintenancePublic = async (req, res) => {
  try {
    const settings = await getMaintenanceSettingsCached();
    
    // Check if client IP is whitelisted
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
    const isIpWhitelisted = settings.whitelistIps.some(ip => {
      const cleanedIp = ip.trim();
      return cleanedIp && (clientIp.includes(cleanedIp) || cleanedIp.includes(clientIp));
    });

    return res.json({
      success: true,
      settings: {
        enabled: settings.enabled,
        title: settings.title,
        message: settings.message,
        estimatedReturn: settings.estimatedReturn,
        bannerImage: settings.bannerImage,
        contactEmail: settings.contactEmail,
        contactPhone: settings.contactPhone,
        isWhitelisted: isIpWhitelisted
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/maintenance (Admin-only for full details including whitelist)
export const getMaintenanceAdmin = async (req, res) => {
  try {
    const settings = await getMaintenanceSettingsCached();
    return res.json({ success: true, settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/maintenance (Admin-only)
export const updateMaintenanceAdmin = async (req, res) => {
  try {
    const {
      enabled,
      title,
      message,
      estimatedReturn,
      bannerImage,
      contactEmail,
      contactPhone,
      whitelistIps
    } = req.body;

    let settings = await maintenanceModel.findOne({});
    if (!settings) {
      settings = new maintenanceModel();
    }

    const previousState = settings.enabled;

    settings.enabled = enabled !== undefined ? enabled : settings.enabled;
    settings.title = title !== undefined ? title : settings.title;
    settings.message = message !== undefined ? message : settings.message;
    settings.estimatedReturn = estimatedReturn !== undefined ? estimatedReturn : settings.estimatedReturn;
    settings.bannerImage = bannerImage !== undefined ? bannerImage : settings.bannerImage;
    settings.contactEmail = contactEmail !== undefined ? contactEmail : settings.contactEmail;
    settings.contactPhone = contactPhone !== undefined ? contactPhone : settings.contactPhone;
    settings.whitelistIps = whitelistIps !== undefined ? whitelistIps : settings.whitelistIps;

    // Retrieve admin email for logging
    let adminEmail = "admin@cartnow.com";
    const { token } = req.headers;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded && typeof decoded === "string") {
          adminEmail = decoded.replace(process.env.ADMIN_PASSWORD, "") || "admin@cartnow.com";
        }
      } catch (err) {}
    }
    settings.updatedBy = adminEmail;

    await settings.save();
    
    // Clear in-memory cache to apply updates immediately
    clearMaintenanceCache();

    // Log action to Audit Logs
    if (previousState !== settings.enabled) {
      const logAction = settings.enabled ? "MAINTENANCE_ENABLED" : "MAINTENANCE_DISABLED";
      await writeAuditLog(
        req,
        logAction,
        "System Settings",
        `Maintenance Mode has been turned ${settings.enabled ? "ON" : "OFF"}.`
      );
    } else {
      await writeAuditLog(
        req,
        "MAINTENANCE_UPDATED",
        "System Settings",
        "Maintenance Mode settings updated."
      );
    }

    return res.json({ success: true, message: "Maintenance settings updated successfully", settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
