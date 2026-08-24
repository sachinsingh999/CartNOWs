import mongoose from "mongoose";
import returnRequestModel from "../models/returnRequestModel.js";
import returnOrderModel from "../models/returnOrderModel.js";
import refundModel from "../models/refundModel.js";
import exchangeModel from "../models/exchangeModel.js";
import orderModel from "../models/orderModel.js";
import orderItemModel from "../models/orderItemModel.js";
import productModel from "../models/productModel.js";
import Stripe from "stripe";
import { createNotification } from "../utils/notificationHelper.js";
import { syncParentOrderStatus } from "../utils/orderStatusHelper.js";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";
const stripe = new Stripe(stripeSecretKey);

// Helper: Emit Socket.IO Event for RMA Rooms
const emitRmaSocketEvent = (req, rmaId, event, data) => {
  try {
    const io = req.app.get("socketio");
    if (io && rmaId) {
      const roomName = `rma_${rmaId}`;
      io.to(roomName).emit(event, data);
      console.log(`[RMA Socket] Emitted "${event}" to room ${roomName}`);
    }
  } catch (err) {
    console.error("[RMA Socket Error]", err.message);
  }
};

// Helper: Generate Unique Serial Number
const generateSerial = (prefix) => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomHex = Math.floor(1000 + Math.random() * 9000).toString();
  return `${prefix}-${dateStr}-${randomHex}`;
};

// Helper: Generate 6-character Alphanumeric Verification Code
const generateVerificationCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

/* ================= 1. CREATE RETURN REQUEST (CUSTOMER) ================= */
export const createReturnRequest = async (req, res) => {
  try {
    const {
      orderId,
      orderItemId,
      returnReason,
      customerDescription,
      returnType,
      exchangeSize,
      evidenceImages,
      evidenceVideos,
    } = req.body;

    const customerId = req.user._id;

    if (!orderId || !orderItemId || !returnReason) {
      return res.status(400).json({ success: false, message: "Missing required return fields" });
    }

    let order = null;
    if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
      order = await orderModel.findById(orderId);
    }
    if (!order && orderId) {
      order = await orderModel.findOne({ orderNumber: orderId });
    }
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    let item = null;
    if (orderItemId && mongoose.Types.ObjectId.isValid(orderItemId)) {
      item = await orderItemModel.findById(orderItemId);
    }
    if (!item && orderItemId) {
      item = await orderItemModel.findOne({
        orderId: order._id,
        $or: [
          { productId: orderItemId },
          { _id: mongoose.Types.ObjectId.isValid(orderItemId) ? orderItemId : null }
        ]
      });
    }

    // Fallback: If orderItemModel record missing, auto-create from order.items
    if (!item && order.items && Array.isArray(order.items)) {
      const emb = order.items.find((it) => String(it.productId || it._id || it.orderItemId) === String(orderItemId));
      if (emb) {
        const safeOrderNumber = order.orderNumber || `ORD-${String(order._id).slice(-8).toUpperCase()}`;
        const embProdId = (emb.productId && mongoose.Types.ObjectId.isValid(emb.productId)) ? emb.productId : ((emb._id && mongoose.Types.ObjectId.isValid(emb._id)) ? emb._id : order._id);

        item = await orderItemModel.create({
          orderId: order._id,
          orderNumber: safeOrderNumber,
          userId: customerId,
          productId: embProdId,
          productName: emb.name || emb.productName || "Product",
          productImage: emb.image || (emb.images && emb.images[0]) || "",
          quantity: emb.qty || emb.quantity || 1,
          unitPrice: emb.price || emb.unitPrice || 0,
          finalPrice: (emb.price || emb.unitPrice || 0) * (emb.qty || emb.quantity || 1),
          status: order.orderStatus || "Delivered",
        });
      }
    }

    if (!item) {
      return res.status(404).json({ success: false, message: "Order item not found" });
    }

    if (String(item.userId || order.userId) !== String(customerId)) {
      return res.status(403).json({ success: false, message: "Unauthorized return action" });
    }

    const itemStatusLower = (item.status || "").toLowerCase();
    const orderStatusLower = (order.orderStatus || "").toLowerCase();
    const isDelivered = ["delivered", "completed"].includes(itemStatusLower) || ["delivered", "completed"].includes(orderStatusLower);

    if (!isDelivered) {
      return res.status(400).json({ success: false, message: "Returns can only be requested for delivered items" });
    }

    // Enforce 7-Day Return Window Policy
    const deliveryDate = new Date(order.deliveredAt || order.updatedAt || order.date || order.createdAt);
    if (!isNaN(deliveryDate.getTime())) {
      const now = new Date();
      const diffInDays = (now - deliveryDate) / (1000 * 60 * 60 * 24);
      if (diffInDays > 7) {
        return res.status(400).json({ 
          success: false, 
          message: "The 7-day return window for this order has expired." 
        });
      }
    }

    // Check if an existing request already exists
    const existingReq = await returnRequestModel.findOne({
      $or: [
        { orderItemId: item._id },
        { orderItemId: orderItemId }
      ],
      status: { $in: ["Pending Approval", "Under Review", "Approved"] },
    });

    if (existingReq) {
      return res.json({ success: true, message: "A return request is already active for this item", request: existingReq });
    }

    const requestNumber = generateSerial("REQ");
    const validReturnTypes = ["Refund", "Replacement", "Exchange"];
    if (!validReturnTypes.includes(returnType)) {
      return res.status(400).json({ success: false, message: `Invalid return type "${returnType}". Must be one of: ${validReturnTypes.join(", ")}` });
    }
    const requestedReturnType = returnType;

    const reasonMap = {
      "wrong item delivered": "Wrong Item Delivered",
      "damaged item": "Defective/Damaged",
      "defective/damaged": "Defective/Damaged",
      "product not as expected": "Item Not As Described",
      "item not as described": "Item Not As Described",
      "quality issue": "Quality Not Expected",
      "quality not expected": "Quality Not Expected",
      "changed my mind": "Changed Mind",
      "changed mind": "Changed Mind",
      "size mismatch": "Size Mismatch",
    };

    const normalizedReason = reasonMap[(returnReason || "").toLowerCase()] || "Other";

    const validObjectId = (val) => {
      if (val && mongoose.Types.ObjectId.isValid(val)) return new mongoose.Types.ObjectId(val);
      return new mongoose.Types.ObjectId();
    };

    const targetOrderId = validObjectId(order._id || orderId);
    const targetOrderItemId = validObjectId(item._id || orderItemId);
    const targetCustomerId = validObjectId(customerId);
    const targetSellerId = validObjectId(item.sellerId || order.sellerId || (order.items && order.items[0] && order.items[0].sellerId));
    const targetProductId = validObjectId(item.productId || (order.items && order.items[0] && order.items[0].productId));

    const createdRequest = await returnRequestModel.create({
      requestNumber,
      orderId: targetOrderId,
      orderItemId: targetOrderItemId,
      customerId: targetCustomerId,
      sellerId: targetSellerId,
      productId: targetProductId,
      itemName: item.productName || item.name || "Returned Item",
      itemImage: item.productImage || item.image || "",
      variant: item.variant || { size: item.size || "Standard" },
      quantity: item.quantity || item.qty || 1,
      amount: item.finalPrice || (item.unitPrice || item.price || 0) * (item.quantity || item.qty || 1),
      returnType: requestedReturnType,
      exchangeDetails: {
        requestedSize: exchangeSize || "",
      },
      returnReason: normalizedReason,
      customerDescription: customerDescription || "",
      evidenceImages: evidenceImages || [],
      evidenceVideos: evidenceVideos || [],
      status: "Pending Approval",
    });

    await orderItemModel.updateMany(
      {
        $or: [
          { _id: item._id },
          { _id: targetOrderItemId },
          { orderId: targetOrderId, productId: targetProductId }
        ]
      },
      { $set: { status: "Return Pending" } }
    );

    if (order) {
      order.orderStatus = "Return Pending";
      if (Array.isArray(order.items)) {
        order.items = order.items.map((emb) => {
          if (
            String(emb._id) === String(item._id) ||
            String(emb.productId) === String(targetProductId) ||
            String(emb.orderItemId) === String(targetOrderItemId)
          ) {
            return { ...emb, status: "Return Pending" };
          }
          return emb;
        });
      }
      await order.save();
    }

    await syncParentOrderStatus(order._id);

    return res.json({
      success: true,
      message: "Return request submitted successfully. Status updated to Return Pending.",
      returnRequest: createdRequest,
    });
  } catch (error) {
    console.error("Error creating return request:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= 2. GET CUSTOMER RETURN REQUESTS ================= */
export const getCustomerReturnRequests = async (req, res) => {
  try {
    const customerId = req.user._id;
    const requests = await returnRequestModel
      .find({ customerId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= 3. REVIEW RETURN REQUEST (ADMIN / SELLER) ================= */
export const reviewReturnRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { requestId, status, sellerNotes, adminNotes } = req.body;

    const request = await returnRequestModel.findById(requestId).session(session);
    if (!request) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Return request not found" });
    }

    if (request.status === "Approved" || request.status === "Rejected") {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
    }

    request.status = status;
    if (sellerNotes) request.sellerNotes = sellerNotes;
    if (adminNotes) request.adminNotes = adminNotes;
    request.reviewedAt = new Date();
    request.reviewedBy = req.user?._id || req.seller?._id || null;
    await request.save({ session });

    let returnOrder = null;

    if (status === "Approved") {
      // Fetch original order for pickup address
      const order = await orderModel.findById(request.orderId).session(session);
      const assignedDriver = req.body.deliverymanId || order?.deliverymanId || null;
      request.deliverymanId = assignedDriver;
      await request.save({ session });
      const rmaNumber = generateSerial("RMA");
      const pickupVerificationCode = generateVerificationCode();

      returnOrder = await returnOrderModel.create(
        [
          {
            rmaNumber,
            requestId: request._id,
            orderId: request.orderId,
            orderItemId: request.orderItemId,
            customerId: request.customerId,
            sellerId: request.sellerId,
            productId: request.productId,
            itemName: request.itemName,
            itemImage: request.itemImage,
            quantity: request.quantity,
            amount: request.amount,
            returnType: request.returnType,
            deliverymanId: req.body.deliverymanId || order?.deliverymanId || null,
            pickupAddress: order?.shippingAddress || order?.address || {},
            pickupVerificationCode,
            status: "RMA Created",
            timeline: [
              {
                status: "RMA Created",
                description: `Return Order ${rmaNumber} approved and initialized.`,
                actorRole: req.seller ? "seller" : "admin",
                actorId: req.seller?._id || req.user?._id || null,
                timestamp: new Date(),
              },
            ],
          },
        ],
        { session }
      );

      const createdRma = returnOrder[0];

      // Create linked Refund, Replacement, or Exchange entity
      if (request.returnType === "Refund") {
        const refundObj = await refundModel.create(
          [
            {
              refundNumber: generateSerial("RFD"),
              rmaId: createdRma._id,
              orderId: request.orderId,
              orderItemId: request.orderItemId,
              customerId: request.customerId,
              amount: request.amount,
              paymentMethod: order?.paymentMethod || "COD",
              refundStatus: "Pending",
            },
          ],
          { session }
        );
        createdRma.refundId = refundObj[0]._id;
        await createdRma.save({ session });
      } else if (request.returnType === "Exchange" || request.returnType === "Replacement") {
        // ATOMIC INVENTORY RESERVATION
        const targetSize = request.returnType === "Exchange"
          ? (request.exchangeDetails?.requestedSize || request.variant?.size || "Standard")
          : (request.variant?.size || "Standard");

        const requestedQty = request.quantity || 1;
        const updateOptions = { new: true, session };

        let updatedProduct = null;
        if (targetSize && targetSize !== "Standard") {
          updatedProduct = await productModel.findOneAndUpdate(
            {
              _id: request.productId,
              status: "approved",
              isDeleted: { $ne: true },
              "variants.Size": targetSize,
              "variants.stock": { $gte: requestedQty }
            },
            {
              $inc: {
                "variants.$.stock": -requestedQty,
                stock: -requestedQty
              }
            },
            updateOptions
          );
        }

        if (!updatedProduct) {
          updatedProduct = await productModel.findOneAndUpdate(
            {
              _id: request.productId,
              status: "approved",
              isDeleted: { $ne: true },
              stock: { $gte: requestedQty }
            },
            {
              $inc: { stock: -requestedQty }
            },
            updateOptions
          );
        }

        if (!updatedProduct) {
          await session.abortTransaction();
          session.endSession();
          return res.status(409).json({
            success: false,
            message: `Inventory Reservation Failed: Variant size "${targetSize}" does not have ${requestedQty} available unit(s).`
          });
        }

        const exchangeObj = await exchangeModel.create(
          [
            {
              exchangeNumber: generateSerial(request.returnType === "Replacement" ? "RPL" : "EXC"),
              rmaId: createdRma._id,
              originalOrderId: request.orderId,
              productId: request.productId,
              replacementVariant: {
                size: targetSize,
                sku: request.exchangeDetails?.requestedSku || request.variant?.sku || "",
              },
              quantity: requestedQty,
              deliveryStatus: "Reserved",
            },
          ],
          { session }
        );
        createdRma.exchangeId = exchangeObj[0]._id;
        await createdRma.save({ session });
      }

      emitRmaSocketEvent(req, createdRma._id, "rma:status_updated", {
        rmaId: createdRma._id,
        status: createdRma.status,
        timestamp: new Date()
      });

      await createNotification(
        request.customerId,
        request.orderId,
        "Return Order (RMA) Approved",
        `Your return request ${request.requestNumber} was approved! RMA: ${rmaNumber}. Verification OTP: ${pickupVerificationCode}`
      );
    } else if (status === "Rejected") {
      await createNotification(
        request.customerId,
        request.orderId,
        "Return Request Rejected",
        `Your return request ${request.requestNumber} was declined. Reason: ${sellerNotes || adminNotes || "Does not meet return policy."}`
      );
    }

    await session.commitTransaction();
    session.endSession();

    return res.json({
      success: true,
      message: `Return request ${status.toLowerCase()} successfully`,
      returnOrder: returnOrder ? returnOrder[0] : null,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error in reviewReturnRequest:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= 4. GET RMA LIST (ADMIN / SELLER / CUSTOMER / AGENT) ================= */
export const getRMAList = async (req, res) => {
  try {
    const { status, sellerId, customerId, deliverymanId } = req.query;
    const query = {};

    if (status) query.status = status;
    if (sellerId) query.sellerId = sellerId;
    if (customerId) query.customerId = customerId;
    if (deliverymanId) query.deliverymanId = deliverymanId;

    // Role-based filtering if invoked by seller or deliveryman
    if (req.seller && req.seller._id) {
      query.sellerId = req.seller._id;
    } else if (req.deliveryman && req.deliveryman.id) {
      query.deliverymanId = req.deliveryman.id;
    } else if (req.user && req.user._id && !req.isAdmin) {
      query.customerId = req.user._id;
    }

    const rmas = await returnOrderModel
      .find(query)
      .populate("requestId")
      .populate("refundId")
      .populate("exchangeId")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, count: rmas.length, rmas });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= 5. GET RMA DETAILS ================= */
export const getRMADetails = async (req, res) => {
  try {
    const { rmaId } = req.params;

    let rma = await returnOrderModel
      .findById(rmaId)
      .populate("requestId")
      .populate("refundId")
      .populate("exchangeId")
      .populate("customerId", "name email phone")
      .populate("sellerId", "name shopName email phone")
      .populate("deliverymanId", "name phone vehicleType")
      .lean();

    if (!rma) {
      rma = await returnOrderModel
        .findOne({ requestId: rmaId })
        .populate("requestId")
        .populate("refundId")
        .populate("exchangeId")
        .populate("customerId", "name email phone")
        .populate("sellerId", "name shopName email phone")
        .populate("deliverymanId", "name phone vehicleType")
        .lean();
    }

    if (!rma) {
      rma = await returnOrderModel
        .findOne({ orderId: rmaId })
        .populate("requestId")
        .populate("refundId")
        .populate("exchangeId")
        .populate("customerId", "name email phone")
        .populate("sellerId", "name shopName email phone")
        .populate("deliverymanId", "name phone vehicleType")
        .lean();
    }

    if (!rma) {
      const requestDoc = await returnRequestModel.findById(rmaId).lean();
      if (requestDoc) {
        rma = {
          _id: requestDoc._id,
          rmaNumber: "REQ-" + String(requestDoc._id).slice(-8).toUpperCase(),
          orderId: requestDoc.orderId,
          orderItemId: requestDoc.orderItemId,
          itemName: requestDoc.itemName || "Returned Item",
          itemImage: requestDoc.itemImage || "",
          quantity: requestDoc.quantity || 1,
          amount: requestDoc.amount || 0,
          returnType: requestDoc.returnType || "Refund",
          status: requestDoc.status || "Pending Review",
          pickupCourier: "Express Shipping",
          warehouseId: "WH-MAIN-01",
          inspectionStatus: "Pending",
          pickupVerificationCode: "123456",
          updatedAt: requestDoc.updatedAt || new Date(),
          requestId: requestDoc,
          timeline: [
            {
              status: requestDoc.status || "Pending Review",
              description: `Return request initialized: ${requestDoc.returnReason || "Customer requested return"}`,
              actorRole: "customer",
              timestamp: requestDoc.createdAt || new Date(),
            }
          ]
        };
      }
    }

    if (!rma) {
      return res.status(404).json({ success: false, message: "Return Order (RMA) not found" });
    }

    // Ownership Authorization Check
    const authUserId = String(req.user?._id || "");
    const authSellerId = String(req.seller?._id || "");
    const authDriverId = String(req.deliveryman?.id || "");
    const isAdmin = Boolean(req.isAdmin || (req.user && req.user.role === "admin"));

    const rmaCustomerId = String(rma.customerId?._id || rma.customerId || "");
    const rmaSellerId = String(rma.sellerId?._id || rma.sellerId || "");
    const rmaDriverId = String(rma.deliverymanId?._id || rma.deliverymanId || "");

    const isAuthorized =
      isAdmin ||
      (authUserId && authUserId === rmaCustomerId) ||
      (authSellerId && authSellerId === rmaSellerId) ||
      (authDriverId && authDriverId === rmaDriverId);

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: "Forbidden: You are not authorized to view this RMA" });
    }

    const returnType = rma.returnType || rma.requestId?.returnType || "Refund";
    const requestedVariant = rma.exchangeId?.replacementVariant || rma.requestId?.exchangeDetails || { size: rma.variant?.size || "Standard" };

    const formattedRma = {
      ...rma,
      returnType,
      rmaStatus: rma.status,
      requestedVariant,
      refund: rma.refundId
        ? {
            id: rma.refundId._id || rma.refundId,
            refundNumber: rma.refundId.refundNumber || "",
            amount: rma.refundId.amount || rma.amount,
            status: rma.refundId.refundStatus || "Pending",
            gatewayRefundId: rma.refundId.gatewayRefundId || "",
            gatewayTransactionId: rma.refundId.gatewayTransactionId || "",
            completedAt: rma.refundId.completedAt || null,
          }
        : null,
      shipment: rma.exchangeId
        ? {
            id: rma.exchangeId._id || rma.exchangeId,
            type: returnType,
            status: rma.exchangeId.deliveryStatus || "Reserved",
            courierName: rma.exchangeId.courierName || "",
            trackingNumber: rma.exchangeId.trackingNumber || "",
            shippedAt: rma.exchangeId.shippedAt || null,
            deliveredAt: rma.exchangeId.deliveredAt || null,
          }
        : null,
    };

    res.json({ success: true, rma: formattedRma });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= 6. SCHEDULE PICKUP (ADMIN / SELLER) ================= */
export const schedulePickup = async (req, res) => {
  try {
    const { rmaId, deliverymanId, courierName, scheduledDate } = req.body;

    const rma = await returnOrderModel.findById(rmaId);
    if (!rma) {
      return res.status(404).json({ success: false, message: "RMA not found" });
    }

    rma.deliverymanId = deliverymanId || rma.deliverymanId;
    if (courierName) rma.pickupCourier = courierName;
    if (scheduledDate) rma.pickupScheduledDate = new Date(scheduledDate);
    rma.status = "Pickup Scheduled";

    rma.timeline.push({
      status: "Pickup Scheduled",
      description: `Pickup scheduled for ${new Date(scheduledDate || Date.now()).toLocaleDateString()}`,
      actorRole: req.seller ? "seller" : "admin",
      actorId: req.seller?._id || req.user?._id || null,
      timestamp: new Date(),
    });

    await rma.save();

    await createNotification(
      rma.customerId,
      rma.orderId,
      "Pickup Scheduled",
      `Pickup for RMA ${rma.rmaNumber} has been scheduled. Provide verification code ${rma.pickupVerificationCode} to agent.`
    );

    res.json({ success: true, message: "Pickup scheduled successfully", rma });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= 7. VERIFY PICKUP (DELIVERY AGENT) ================= */
export const verifyPickup = async (req, res) => {
  try {
    const { rmaId, status, verificationCode } = req.body;
    const driverId = req.deliveryman?.id;

    let rma = await returnOrderModel.findById(rmaId);
    if (!rma) {
      rma = await returnOrderModel.findOne({ requestId: rmaId });
    }
    if (!rma) {
      rma = await returnOrderModel.findOne({ orderId: rmaId });
    }

    let requestDoc = null;
    let orderDoc = null;

    if (!rma) {
      requestDoc = await returnRequestModel.findById(rmaId);
    }
    if (!rma && !requestDoc) {
      orderDoc = await orderModel.findById(rmaId);
    }

    if (!rma && !requestDoc && !orderDoc) {
      return res.status(404).json({ success: false, message: "Return task / order not found" });
    }

    // Handle returnRequestModel status update
    if (requestDoc) {
      const targetStatus = status || "Out for Pickup";
      if (targetStatus === "Completed" && verificationCode) {
        requestDoc.status = "Completed";
      } else {
        requestDoc.status = targetStatus;
      }
      await requestDoc.save();
      return res.json({ success: true, message: `Return task status updated to ${requestDoc.status}`, request: requestDoc });
    }

    // Handle orderModel status update
    if (orderDoc) {
      const targetStatus = status || "Out for Pickup";
      orderDoc.orderStatus = targetStatus;
      await orderDoc.save();
      return res.json({ success: true, message: `Order status updated to ${orderDoc.orderStatus}`, order: orderDoc });
    }

    // Handle returnOrderModel (RMA) status update
    if (status && status !== "Completed") {
      rma.status = status;
      rma.timeline.push({
        status,
        description: `Status updated to ${status} by delivery agent.`,
        actorRole: "deliveryman",
        actorId: driverId || null,
        timestamp: new Date(),
      });
      await rma.save();
      return res.json({ success: true, message: `RMA status updated to ${status}`, rma });
    }

    if (!verificationCode) {
      return res.status(400).json({ success: false, message: "Verification OTP code required" });
    }

    if (rma.pickupVerificationCode && verificationCode.toUpperCase() !== rma.pickupVerificationCode.toUpperCase()) {
      return res.status(400).json({ success: false, message: "Invalid verification code" });
    }

    rma.status = status || "Picked Up";
    rma.pickupCompletedDate = new Date();

    if (rma.requestId) {
      await returnRequestModel.findByIdAndUpdate(rma.requestId, { status: rma.status });
    }

    rma.timeline.push({
      status: rma.status,
      description: `Item pickup completed & verified via customer OTP (${rma.status}).`,
      actorRole: "deliveryman",
      actorId: driverId || null,
      timestamp: new Date(),
    });

    await rma.save();

    emitRmaSocketEvent(req, rma._id, "rma:status_updated", {
      rmaId: rma._id,
      status: rma.status,
      timestamp: new Date()
    });

    await createNotification(
      rma.customerId,
      rma.orderId,
      "Item Picked Up",
      `Your returned item for RMA ${rma.rmaNumber} has been collected and verified by delivery agent.`
    );

    res.json({ success: true, message: "Pickup verified and completed successfully", rma });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= 8. WAREHOUSE INSPECTION (ADMIN / SELLER) ================= */
export const updateWarehouseInspection = async (req, res) => {
  try {
    const { rmaId, inspectionStatus, inspectionNotes, restockInventory } = req.body;

    const rma = await returnOrderModel.findById(rmaId);
    if (!rma) {
      return res.status(404).json({ success: false, message: "RMA not found" });
    }

    rma.inspectionStatus = inspectionStatus;
    if (inspectionNotes) rma.inspectionNotes = inspectionNotes;
    rma.restockInventory = Boolean(restockInventory);

    if (inspectionStatus === "Passed") {
      rma.status = "Inspection Passed";
      rma.timeline.push({
        status: "Inspection Passed",
        description: `Quality Inspection passed at warehouse ${rma.warehouseId}.`,
        actorRole: req.seller ? "seller" : "admin",
        actorId: req.seller?._id || req.user?._id || null,
        timestamp: new Date(),
      });

      // If restock requested, increment product stock
      if (restockInventory && rma.productId) {
        await productModel.findByIdAndUpdate(rma.productId, {
          $inc: { stock: rma.quantity },
        });
      }

      // If Refund type, advance refund entity
      if (rma.returnType === "Refund" && rma.refundId) {
        await refundModel.findByIdAndUpdate(rma.refundId, {
          refundStatus: "Processing",
        });
        rma.status = "Refund Initiated";
        rma.timeline.push({
          status: "Refund Initiated",
          description: "Refund processing initialized by finance ledger.",
          actorRole: "system",
          timestamp: new Date(),
        });
      } else if ((rma.returnType === "Exchange" || rma.returnType === "Replacement") && rma.exchangeId) {
        await exchangeModel.findByIdAndUpdate(rma.exchangeId, {
          deliveryStatus: "Packing",
        });
        rma.status = "Replacement Packed";
        rma.timeline.push({
          status: "Replacement Packed",
          description: "Replacement item packing in progress.",
          actorRole: "system",
          timestamp: new Date(),
        });
      }
    } else if (inspectionStatus === "Failed") {
      rma.status = "Inspection Failed";
      rma.timeline.push({
        status: "Inspection Failed",
        description: `Quality inspection failed: ${inspectionNotes || "Item damaged/unacceptable"}`,
        actorRole: req.seller ? "seller" : "admin",
        actorId: req.seller?._id || req.user?._id || null,
        timestamp: new Date(),
      });
    }

    await rma.save();

    emitRmaSocketEvent(req, rma._id, "rma:qc_updated", {
      rmaId: rma._id,
      inspectionStatus: rma.inspectionStatus,
      status: rma.status,
      timestamp: new Date()
    });

    emitRmaSocketEvent(req, rma._id, "rma:status_updated", {
      rmaId: rma._id,
      status: rma.status,
      timestamp: new Date()
    });

    res.json({ success: true, message: `Inspection status updated to ${inspectionStatus}`, rma });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= 9. PROCESS REFUND (ADMIN) ================= */
export const processRefund = async (req, res) => {
  try {
    const { rmaId, gatewayTransactionId, gatewayRefundId } = req.body;

    let rma = await returnOrderModel.findById(rmaId).populate("refundId");
    if (!rma) {
      rma = await returnOrderModel.findOne({ requestId: rmaId }).populate("refundId");
    }
    if (!rma) {
      rma = await returnOrderModel.findOne({ orderId: rmaId }).populate("refundId");
    }

    if (!rma) {
      return res.status(404).json({ success: false, message: "RMA not found" });
    }

    let refund = null;
    if (rma.refundId) {
      refund = await refundModel.findById(rma.refundId._id || rma.refundId);
    }

    // Auto-create refund record if missing
    if (!refund) {
      const refundNum = "RFD-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
      refund = await refundModel.create({
        rmaId: rma._id,
        orderId: rma.orderId,
        customerId: rma.customerId,
        sellerId: rma.sellerId,
        refundNumber: refundNum,
        amount: rma.amount || 0,
        refundStatus: "Pending",
        reason: rma.reason || "Customer Return Refund"
      });
      rma.refundId = refund._id;
    }

    // Idempotency Check: Return existing completed refund safely
    if (refund.refundStatus === "Successful") {
      rma.status = "Completed";
      rma.inspectionStatus = "Passed";
      await rma.save();
      if (rma.requestId) {
        await returnRequestModel.findByIdAndUpdate(rma.requestId, { status: "Completed" });
      }
      return res.json({ success: true, message: "Refund has already been completed", refund, rma });
    }

    const order = await orderModel.findById(rma.orderId);
    let realGatewayRefundId = gatewayRefundId;
    let realTransactionId = gatewayTransactionId || order?.paymentIntentId || order?.transactionId || `TXN-${Date.now()}`;

    // Execute Real Payment Gateway Refund if Stripe Payment Intent exists
    if (order && order.paymentMethod === "Stripe" && process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes("placeholder")) {
      const intentId = order.paymentIntentId || order.transactionId;
      if (intentId && intentId.startsWith("pi_")) {
        try {
          const stripeRefund = await stripe.refunds.create({
            payment_intent: intentId,
            amount: Math.round(refund.amount * 100),
            reason: "requested_by_customer"
          });
          realGatewayRefundId = stripeRefund.id;
          realTransactionId = stripeRefund.payment_intent || realTransactionId;
        } catch (stripeErr) {
          console.error("[Stripe Refund Gateway Error]", stripeErr.message);
          refund.refundStatus = "Failed";
          refund.failureReason = stripeErr.message;
          await refund.save();
          return res.status(502).json({ success: false, message: `Stripe Refund Gateway Failed: ${stripeErr.message}`, refund });
        }
      }
    }

    if (!realGatewayRefundId) {
      realGatewayRefundId = `RFD-GATEWAY-${Date.now()}`;
    }

    refund.refundStatus = "Successful";
    refund.gatewayTransactionId = realTransactionId;
    refund.gatewayRefundId = realGatewayRefundId;
    refund.completedAt = new Date();
    refund.processedBy = req.seller?._id || req.user?._id || null;
    await refund.save();

    rma.status = "Completed";
    rma.inspectionStatus = "Passed";
    rma.timeline.push({
      status: "Refund Completed",
      description: `Refund of ₹${refund.amount} completed and credited. Transaction ID: ${refund.gatewayRefundId}`,
      actorRole: req.seller ? "seller" : "admin",
      actorId: req.seller?._id || req.user?._id || null,
      timestamp: new Date(),
    });
    await rma.save();

    if (rma.requestId) {
      await returnRequestModel.findByIdAndUpdate(rma.requestId, { status: "Completed" });
    }

    emitRmaSocketEvent(req, rma._id, "rma:refund_updated", {
      rmaId: rma._id,
      refundStatus: refund.refundStatus,
      gatewayRefundId: refund.gatewayRefundId,
      timestamp: new Date()
    });

    emitRmaSocketEvent(req, rma._id, "rma:status_updated", {
      rmaId: rma._id,
      status: rma.status,
      timestamp: new Date()
    });

    await createNotification(
      rma.customerId,
      rma.orderId,
      "Refund Completed",
      `Refund of ₹${refund.amount} for RMA ${rma.rmaNumber} has been processed successfully.`
    );

    res.json({ success: true, message: "Refund processed and completed successfully", refund, rma });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= 10. CREATE EXCHANGE SHIPMENT (SELLER / ADMIN) ================= */
export const createExchangeShipment = async (req, res) => {
  try {
    const { rmaId, courierName, trackingNumber, deliveryStatus } = req.body;

    const rma = await returnOrderModel.findById(rmaId).populate("exchangeId");
    if (!rma || !rma.exchangeId) {
      return res.status(404).json({ success: false, message: "RMA or Exchange entity not found" });
    }

    const exchange = await exchangeModel.findById(rma.exchangeId._id || rma.exchangeId);
    if (!exchange) {
      return res.status(404).json({ success: false, message: "Exchange shipment record not found" });
    }

    if (courierName) exchange.courierName = courierName;
    if (trackingNumber) exchange.trackingNumber = trackingNumber;
    exchange.deliveryStatus = deliveryStatus || "Shipped";
    if (deliveryStatus === "Shipped") exchange.shippedAt = new Date();
    if (deliveryStatus === "Delivered") exchange.deliveredAt = new Date();
    await exchange.save();

    if (deliveryStatus === "Shipped") {
      rma.status = "Replacement Shipped";
      rma.timeline.push({
        status: "Replacement Shipped",
        description: `Replacement shipped via ${exchange.courierName}. Tracking: ${exchange.trackingNumber}`,
        actorRole: req.seller ? "seller" : "admin",
        actorId: req.seller?._id || req.user?._id || null,
        timestamp: new Date(),
      });
    } else if (deliveryStatus === "Delivered") {
      rma.status = "Completed";
      rma.timeline.push({
        status: "Completed",
        description: "Replacement item delivered to customer. RMA completed.",
        actorRole: req.seller ? "seller" : "admin",
        actorId: req.seller?._id || req.user?._id || null,
        timestamp: new Date(),
      });
    }

    await rma.save();

    emitRmaSocketEvent(req, rma._id, "rma:shipment_updated", {
      rmaId: rma._id,
      deliveryStatus: exchange.deliveryStatus,
      trackingNumber: exchange.trackingNumber,
      timestamp: new Date()
    });

    emitRmaSocketEvent(req, rma._id, "rma:status_updated", {
      rmaId: rma._id,
      status: rma.status,
      timestamp: new Date()
    });

    await createNotification(
      rma.customerId,
      rma.orderId,
      `Replacement ${deliveryStatus}`,
      `Your exchange item for RMA ${rma.rmaNumber} is ${deliveryStatus.toLowerCase()}. Tracking: ${exchange.trackingNumber}`
    );

    res.json({ success: true, message: `Exchange shipment updated to ${deliveryStatus}`, exchange, rma });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
