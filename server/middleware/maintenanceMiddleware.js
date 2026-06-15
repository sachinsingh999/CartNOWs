import { getMaintenanceSettingsCached } from "../controllers/maintenanceController.js";

const maintenanceMiddleware = async (req, res, next) => {
  try {
    const settings = await getMaintenanceSettingsCached();

    if (settings && settings.enabled) {
      const path = req.path;

      // 1. Whitelist routes that must ALWAYS remain accessible
      const isHealthCheck = path === "/";
      const isMaintenanceCheck = path === "/api/system/maintenance";
      const isAdminLogin = path === "/api/user/admin";
      const isAdminApi = path.startsWith("/api/admin");
      const isAdminPanel = path.startsWith("/admin");
      const isStaticUploads = path.startsWith("/uploads") || path.startsWith("/invoices");

      if (isHealthCheck || isMaintenanceCheck || isAdminLogin || isAdminApi || isAdminPanel || isStaticUploads) {
        return next();
      }

      // 2. IP Whitelisting bypass check
      const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
      const isIpWhitelisted = settings.whitelistIps.some(ip => {
        const cleanedIp = ip.trim();
        return cleanedIp && (clientIp.includes(cleanedIp) || cleanedIp.includes(clientIp));
      });

      if (isIpWhitelisted) {
        return next();
      }

      // 3. Block access and return Maintenance details
      return res.status(503).json({
        success: false,
        maintenance: true,
        message: settings.message || "CartNOW is currently under maintenance.",
        settings: {
          title: settings.title,
          message: settings.message,
          estimatedReturn: settings.estimatedReturn,
          bannerImage: settings.bannerImage,
          contactEmail: settings.contactEmail,
          contactPhone: settings.contactPhone
        }
      });
    }

    next();
  } catch (error) {
    console.error("Maintenance middleware error:", error);
    next();
  }
};

export default maintenanceMiddleware;
