import express from "express";
import {
  createReturnRequest,
  getCustomerReturnRequests,
  reviewReturnRequest,
  getRMAList,
  getRMADetails,
  schedulePickup,
  verifyPickup,
  updateWarehouseInspection,
  processRefund,
  createExchangeShipment,
} from "../controllers/rmsController.js";
import authUser from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";
import sellerAuth from "../middleware/sellerAuth.js";
import deliverymanAuth from "../middleware/deliverymanAuth.js";

const rmsRouter = express.Router();

/* Customer Routes */
rmsRouter.post("/request/create", authUser, createReturnRequest);
rmsRouter.get("/request/my-requests", authUser, getCustomerReturnRequests);

/* Review & Approval Routes (Seller / Admin) */
rmsRouter.post("/request/review", (req, res, next) => {
  // Allow seller or admin token authorization
  if (req.headers.seller_token || req.headers.sellertoken) {
    return sellerAuth(req, res, () => reviewReturnRequest(req, res, next));
  }
  return adminAuth(req, res, () => reviewReturnRequest(req, res, next));
});

/* RMA Information & List */
rmsRouter.get("/rma/list", (req, res, next) => {
  if (req.headers.seller_token || req.headers.sellertoken) {
    return sellerAuth(req, res, () => getRMAList(req, res, next));
  }
  if (req.headers.deliveryman_token || req.headers.deliverytoken) {
    return deliverymanAuth(req, res, () => getRMAList(req, res, next));
  }
  if (req.headers.admin_token || req.headers.admintoken) {
    return adminAuth(req, res, () => getRMAList(req, res, next));
  }
  return authUser(req, res, () => getRMAList(req, res, next));
});

rmsRouter.get("/rma/:rmaId", (req, res, next) => {
  if (req.headers.seller_token || req.headers.sellertoken) {
    return sellerAuth(req, res, () => getRMADetails(req, res, next));
  }
  if (req.headers.deliveryman_token || req.headers.deliverytoken) {
    return deliverymanAuth(req, res, () => getRMADetails(req, res, next));
  }
  if (req.headers.admin_token || req.headers.admintoken) {
    return adminAuth(req, res, () => getRMADetails(req, res, next));
  }
  return authUser(req, res, () => getRMADetails(req, res, next));
});

/* Reverse Logistics & Pickup Operations */
rmsRouter.post("/rma/schedule-pickup", (req, res, next) => {
  if (req.headers.seller_token || req.headers.sellertoken) {
    return sellerAuth(req, res, () => schedulePickup(req, res, next));
  }
  return adminAuth(req, res, () => schedulePickup(req, res, next));
});

rmsRouter.post("/rma/verify-pickup", deliverymanAuth, verifyPickup);

/* Warehouse Inspection */
rmsRouter.post("/rma/update-inspection", (req, res, next) => {
  if (req.headers.seller_token || req.headers.sellertoken) {
    return sellerAuth(req, res, () => updateWarehouseInspection(req, res, next));
  }
  return adminAuth(req, res, () => updateWarehouseInspection(req, res, next));
});

/* Financial Refund Execution */
rmsRouter.post("/refund/process", adminAuth, processRefund);

/* Exchange & Replacement Shipment */
rmsRouter.post("/exchange/create-shipment", (req, res, next) => {
  if (req.headers.seller_token || req.headers.sellertoken) {
    return sellerAuth(req, res, () => createExchangeShipment(req, res, next));
  }
  return adminAuth(req, res, () => createExchangeShipment(req, res, next));
});

export default rmsRouter;
