import express from "express";
import adminAuth from "../middleware/adminAuth.js";
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
  aiFillCategoryTemplate
} from "../controllers/adminController.js";

const adminRouter = express.Router();

// Apply adminAuth to all routes below
adminRouter.use(adminAuth);

// Seller Management
adminRouter.get("/sellers", getAllSellers);
adminRouter.get("/seller/:id", getSellerDetails);
adminRouter.post("/seller/status", updateSellerStatus);
adminRouter.post("/seller/commission", updateSellerCommission);
adminRouter.post("/seller/payout", processSellerPayout);
adminRouter.delete("/seller/:id", deleteSeller);

// Customer Management
adminRouter.get("/customers", getAllCustomers);
adminRouter.post("/customer/status", updateCustomerStatus);
adminRouter.get("/customer/:id", getCustomerDetails);

// Delivery Agent Management
adminRouter.get("/agents", getAllDeliveryAgents);
adminRouter.get("/agent/:id", getAgentDetails);
adminRouter.post("/agent/status", updateAgentStatus);
adminRouter.post("/agent/zone", assignAgentZone);

// Category Management
adminRouter.get("/categories", getAllCategories);
adminRouter.post("/category/create", createCategory);
adminRouter.post("/category/update", updateCategory);
adminRouter.post("/category/delete", deleteCategory);
adminRouter.post("/category/reorder", reorderCategories);
adminRouter.post("/category/duplicate", duplicateCategory);
adminRouter.post("/category/archive", archiveCategory);
adminRouter.post("/category/restore", restoreCategory);
adminRouter.post("/category/template/field", createCategoryTemplateField);
adminRouter.post("/category/template/field/update", updateCategoryTemplateField);
adminRouter.post("/category/template/field/delete", deleteCategoryTemplateField);
adminRouter.post("/category/template/field/reorder", reorderCategoryAttributes);
adminRouter.post("/category/settings", configureCategorySettings);
adminRouter.get("/category/:id/template", getCategoryTemplate);
adminRouter.post("/category/ai-fill", aiFillCategory);
adminRouter.post("/category/template/ai-fill", aiFillCategoryTemplate);

// Product Moderation
adminRouter.get("/products", getAllProductsAdmin);
adminRouter.post("/product/status", updateProductStatus);
adminRouter.post("/product/fake", flagFakeProduct);
adminRouter.delete("/product/:id", removeProduct);

// Image Moderation & Configuration
adminRouter.get("/product/:id/images", getProductMediaAdmin);
adminRouter.post("/images/config", configureImageRules);
adminRouter.post("/images/moderate", moderateProductMedia);

// Order Management
adminRouter.get("/orders", getAllOrdersAdmin);
adminRouter.post("/order/reassign", reassignOrderAgent);
adminRouter.post("/order/cancel", cancelOrderAdmin);
adminRouter.post("/order/resolve", resolveDispute);

// Returns
adminRouter.get("/returns", getAllReturnRequestsAdmin);
adminRouter.post("/return/status", updateReturnStatus);

// Reviews
adminRouter.post("/review/hide", hideProductReview);
adminRouter.post("/review/delete", deleteProductReview);

// Finance & Commissions
adminRouter.get("/finance", getFinanceSettings);
adminRouter.post("/finance/update", updateFinanceSettings);

// Announcements
adminRouter.post("/announce", sendAnnouncement);

// Audit logs
adminRouter.get("/logs", getAuditLogs);

// Analytics
adminRouter.get("/analytics/revenue", getAdminRevenueAnalytics);
adminRouter.get("/analytics/orders", getAdminOrderAnalytics);
adminRouter.get("/analytics/products", getAdminProductAnalytics);
adminRouter.get("/analytics/sellers", getAdminSellerAnalytics);
adminRouter.get("/analytics/customers", getAdminCustomerAnalytics);
adminRouter.get("/analytics/delivery", getAdminDeliveryAnalytics);

export default adminRouter;
