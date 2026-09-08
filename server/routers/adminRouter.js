import express from "express";
import adminAuth, { requirePermission } from "../middleware/adminAuth.js";
import { getMaintenanceAdmin, updateMaintenanceAdmin } from "../controllers/maintenanceController.js";
import {
  getAllSellers,
  getSellerDetails,
  updateSellerStatus,
  updateSellerCommission,
  processSellerPayout,
  deleteSeller,
  getAllCustomers,
  updateCustomerStatus,
  getCustomerDetails,
  getAllDeliveryAgents,
  getAgentDetails,
  updateAgentStatus,
  assignAgentZone,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  getAllBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  getAllProductsAdmin,
  updateProductStatus,
  flagFakeProduct,
  removeProduct,
  getAllOrdersAdmin,
  reassignOrderAgent,
  cancelOrderAdmin,
  resolveDispute,
  getAllReturnRequestsAdmin,
  updateReturnStatus,
  hideProductReview,
  deleteProductReview,
  getFinanceSettings,
  updateFinanceSettings,
  sendAnnouncement,
  getAuditLogs,
  getAdminRevenueAnalytics,
  getAdminOrderAnalytics,
  getAdminProductAnalytics,
  getAdminSellerAnalytics,
  getAdminCustomerAnalytics,
  getAdminDeliveryAnalytics,
  configureImageRules,
  moderateProductMedia,
  getProductMediaAdmin,
  createCategoryTemplateField,
  updateCategoryTemplateField,
  deleteCategoryTemplateField,
  configureCategorySettings,
  getCategoryTemplate,
  reorderCategories,
  duplicateCategory,
  archiveCategory,
  restoreCategory,
  reorderCategoryAttributes,
  aiFillCategory,
  aiFillCategoryTemplate,
  getDashboardSummary
} from "../controllers/adminController.js";

const adminRouter = express.Router();

// Apply adminAuth to all routes below
adminRouter.use(adminAuth);

// Seller Management
adminRouter.get("/sellers", requirePermission("sellers"), getAllSellers);
adminRouter.get("/seller/:id", requirePermission("sellers"), getSellerDetails);
adminRouter.post("/seller/status", requirePermission("sellers"), updateSellerStatus);
adminRouter.post("/seller/commission", requirePermission("sellers"), updateSellerCommission);
adminRouter.post("/seller/payout", requirePermission("sellers"), processSellerPayout);
adminRouter.delete("/seller/:id", requirePermission("sellers"), deleteSeller);

// Customer Management
adminRouter.get("/customers", requirePermission("customers"), getAllCustomers);
adminRouter.post("/customer/status", requirePermission("customers"), updateCustomerStatus);
adminRouter.get("/customer/:id", requirePermission("customers"), getCustomerDetails);

// Delivery Agent Management
adminRouter.get("/agents", requirePermission("deliverymen"), getAllDeliveryAgents);
adminRouter.get("/agent/:id", requirePermission("deliverymen"), getAgentDetails);
adminRouter.post("/agent/status", requirePermission("deliverymen"), updateAgentStatus);
adminRouter.post("/agent/zone", requirePermission("deliverymen"), assignAgentZone);

// Category Management
adminRouter.get("/categories", requirePermission("products"), getAllCategories);
adminRouter.post("/category/create", requirePermission("products"), createCategory);
adminRouter.post("/category/update", requirePermission("products"), updateCategory);
adminRouter.post("/category/delete", requirePermission("products"), deleteCategory);
adminRouter.post("/category/reorder", requirePermission("products"), reorderCategories);
adminRouter.post("/category/duplicate", requirePermission("products"), duplicateCategory);
adminRouter.post("/category/archive", requirePermission("products"), archiveCategory);
adminRouter.post("/category/restore", requirePermission("products"), restoreCategory);
adminRouter.post("/category/template/field", requirePermission("products"), createCategoryTemplateField);
adminRouter.post("/category/template/field/update", requirePermission("products"), updateCategoryTemplateField);
adminRouter.post("/category/template/field/delete", requirePermission("products"), deleteCategoryTemplateField);
adminRouter.post("/category/template/field/reorder", requirePermission("products"), reorderCategoryAttributes);
adminRouter.post("/category/settings", requirePermission("products"), configureCategorySettings);
adminRouter.get("/category/:id/template", requirePermission("products"), getCategoryTemplate);
adminRouter.post("/category/ai-fill", requirePermission("products"), aiFillCategory);
adminRouter.post("/category/template/ai-fill", requirePermission("products"), aiFillCategoryTemplate);

// Collection Management
adminRouter.get("/collections", requirePermission("products"), getAllCollections);
adminRouter.post("/collection/create", requirePermission("products"), createCollection);
adminRouter.post("/collection/update", requirePermission("products"), updateCollection);
adminRouter.post("/collection/delete", requirePermission("products"), deleteCollection);

// Brand Management
adminRouter.get("/brands", requirePermission("products"), getAllBrands);
adminRouter.post("/brand/create", requirePermission("products"), createBrand);
adminRouter.post("/brand/update", requirePermission("products"), updateBrand);
adminRouter.post("/brand/delete", requirePermission("products"), deleteBrand);

// Product Moderation
adminRouter.get("/products", requirePermission("products"), getAllProductsAdmin);
adminRouter.post("/product/status", requirePermission("products"), updateProductStatus);
adminRouter.post("/product/fake", requirePermission("products"), flagFakeProduct);
adminRouter.delete("/product/:id", requirePermission("products"), removeProduct);

// Image Moderation & Configuration
adminRouter.get("/product/:id/images", requirePermission("products"), getProductMediaAdmin);
adminRouter.post("/images/config", requirePermission("products"), configureImageRules);
adminRouter.post("/images/moderate", requirePermission("products"), moderateProductMedia);

// Order Management
adminRouter.get("/orders", requirePermission("orders"), getAllOrdersAdmin);
adminRouter.post("/order/reassign", requirePermission("orders"), reassignOrderAgent);
adminRouter.post("/order/cancel", requirePermission("orders"), cancelOrderAdmin);
adminRouter.post("/order/resolve", requirePermission("orders"), resolveDispute);

// Returns
adminRouter.get("/returns", requirePermission("returns"), getAllReturnRequestsAdmin);
adminRouter.post("/return/status", requirePermission("returns"), updateReturnStatus);

// Reviews
adminRouter.post("/review/hide", requirePermission("products"), hideProductReview);
adminRouter.post("/review/delete", requirePermission("products"), deleteProductReview);

// Finance & Commissions
adminRouter.get("/finance", requirePermission("finance"), getFinanceSettings);
adminRouter.post("/finance/update", requirePermission("finance"), updateFinanceSettings);

// Announcements
adminRouter.post("/announce", sendAnnouncement);

// Audit logs (Superadmin only)
adminRouter.get("/logs", requirePermission("*"), getAuditLogs);

// Maintenance Mode Settings (Superadmin only)
adminRouter.get("/maintenance", requirePermission("*"), getMaintenanceAdmin);
adminRouter.put("/maintenance", requirePermission("*"), updateMaintenanceAdmin);

// Analytics
adminRouter.get("/analytics/revenue", requirePermission("finance"), getAdminRevenueAnalytics);
adminRouter.get("/analytics/orders", requirePermission("orders"), getAdminOrderAnalytics);
adminRouter.get("/analytics/products", requirePermission("products"), getAdminProductAnalytics);
adminRouter.get("/analytics/sellers", requirePermission("sellers"), getAdminSellerAnalytics);
adminRouter.get("/analytics/customers", requirePermission("customers"), getAdminCustomerAnalytics);
adminRouter.get("/analytics/delivery", requirePermission("deliverymen"), getAdminDeliveryAnalytics);
adminRouter.get("/dashboard-summary", getDashboardSummary);

export default adminRouter;
