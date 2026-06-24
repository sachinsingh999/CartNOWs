import express from "express";
import sellerAuth from "../middleware/sellerAuth.js";
import upload from "../middleware/multer.js";
import {
  registerSeller,
  loginSeller,
  logoutSeller,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail,
  getCurrentSellerProfile,
  updateSellerProfile,
  getSellerDashboardStats,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
  getSingleProduct,
  getAllSellerProducts,
  updateStock,
  bulkStockUpdate,
  getAllSellerOrders,
  getSellerOrderDetails,
  acceptSellerOrder,
  rejectSellerOrder,
  markReadyForPickup,
  getSellerRevenue,
  requestPayout,
  getSellerPayoutRequests,
  getSellerProductReviews,
  replyToProductReview,
  getProductImages,
  uploadProductImages,
  deleteProductImage,
  reorderProductImages,
  setCoverImage,
  getCategories,
  getCategoryTemplateSeller,
  getProductAttributes,
  updateProductAttributes,
  getSellerReturns,
  updateSellerReturnStatus,
  generateProduct
} from "../controllers/sellerController.js";
import { listDeliverymen } from "../controllers/deliverymanController.js";

const sellerRouter = express.Router();

// Public auth endpoints
sellerRouter.post("/register", registerSeller);
sellerRouter.post("/login", loginSeller);
sellerRouter.post("/forgot-password", forgotPassword);
sellerRouter.post("/reset-password", resetPassword);
sellerRouter.post("/verify-email", verifyEmail);

// Protected endpoints (require active seller token)
sellerRouter.use(sellerAuth);

// Logout
sellerRouter.post("/logout", logoutSeller);
sellerRouter.get("/refresh", refreshToken);
sellerRouter.get("/profile", getCurrentSellerProfile);
sellerRouter.post("/profile/update", updateSellerProfile);
sellerRouter.post("/change-password", changePassword);

// Dashboard
sellerRouter.get("/dashboard/stats", getSellerDashboardStats);

// Products
sellerRouter.post("/add-product", upload.array("images", 10), createProduct);
sellerRouter.post("/generate-product", generateProduct);
sellerRouter.post("/update-product", updateProduct);
sellerRouter.get("/categories", getCategories);
sellerRouter.get("/category/:id/template", getCategoryTemplateSeller);
sellerRouter.get("/product/:id/attributes", getProductAttributes);
sellerRouter.post("/product/:id/attributes", updateProductAttributes);
sellerRouter.post("/delete-product", deleteProduct);
sellerRouter.post("/restore-product", restoreProduct);
sellerRouter.get("/product/:id", getSingleProduct);
sellerRouter.get("/products", getAllSellerProducts);

// Product Images
sellerRouter.get("/product/:id/images", getProductImages);
sellerRouter.post("/product/:id/images/upload", upload.array("images", 10), uploadProductImages);
sellerRouter.delete("/product/:id/image/:imageId", deleteProductImage);
sellerRouter.post("/product/:id/images/reorder", reorderProductImages);
sellerRouter.post("/product/:id/image/:imageId/cover", setCoverImage);

// Inventory
sellerRouter.post("/inventory/update-stock", updateStock);
sellerRouter.post("/inventory/bulk-stock", bulkStockUpdate);

// Orders
sellerRouter.get("/orders", getAllSellerOrders);
sellerRouter.get("/order/:id", getSellerOrderDetails);
sellerRouter.post("/order/accept", acceptSellerOrder);
sellerRouter.post("/order/reject", rejectSellerOrder);
sellerRouter.post("/order/pickup", markReadyForPickup);

// Financials & Payouts
sellerRouter.get("/revenue", getSellerRevenue);
sellerRouter.post("/payout/request", requestPayout);
sellerRouter.get("/payout/requests", getSellerPayoutRequests);

// Reviews
sellerRouter.get("/reviews", getSellerProductReviews);
sellerRouter.post("/review/reply", replyToProductReview);

// Returns
sellerRouter.get("/returns", getSellerReturns);
sellerRouter.post("/returns/status", updateSellerReturnStatus);
sellerRouter.get("/deliverymen", listDeliverymen);

export default sellerRouter;
