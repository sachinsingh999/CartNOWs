import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import deliverymanModel from "../models/deliverymanModel.js";
import orderModel from "../models/orderModel.js";
import deliverymanComplaintModel from "../models/deliverymanComplaintModel.js";
import returnRequestModel from "../models/returnRequestModel.js";
import productModel from "../models/productModel.js";
import { createNotification } from "../utils/notificationHelper.js";
import deliveryAssignmentModel from "../models/deliveryAssignmentModel.js";
import { autoAssignDeliveryAgent } from "../utils/assignmentHelper.js";
import { validateEmail, validatePhone, validatePassword, validateName } from "../utils/validation.js";
import { checkAndGenerateInvoice } from "../utils/invoicePdfGenerator.js";



// JWT Generator
const createToken = (id) => {
  return jwt.sign({ id, role: "deliveryman" }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Admin/Portal registers a deliveryman (public route)
const registerDeliveryman = async (req, res) => {
  try {
    const { name, email, password, phone, vehicleType, assignedAreas } = req.body;

    if (!name || !email || !password || !phone) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    const nameCheck = validateName(name);
    if (!nameCheck.isValid) {
      return res.json({ success: false, message: nameCheck.message });
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      return res.json({ success: false, message: emailCheck.message });
    }

    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.isValid) {
      return res.json({ success: false, message: phoneCheck.message });
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      return res.json({ success: false, message: passwordCheck.message });
    }

    // Check if email already exists
    const exists = await deliverymanModel.findOne({ email: emailCheck.value });
    if (exists) {
      return res.json({ success: false, message: "Deliveryman already exists with this email" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newDriver = new deliverymanModel({
      name: nameCheck.value,
      email: emailCheck.value,
      password: hashedPassword,
      phone: phoneCheck.value,
      vehicleType: vehicleType || "Bike",
      assignedAreas: assignedAreas || [],
      status: "pending" // Default status is pending
    });

    const savedDriver = await newDriver.save();

    res.json({
      success: true,
      message: "Registration application submitted. Please wait for admin approval.",
      driver: {
        id: savedDriver._id,
        name: savedDriver.name,
        email: savedDriver.email,
        phone: savedDriver.phone,
        vehicleType: savedDriver.vehicleType,
        assignedAreas: savedDriver.assignedAreas
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Admin lists all deliverymen (with workload calculations)
const listDeliverymen = async (req, res) => {
  try {
    const drivers = await deliverymanModel.find({}).select("-password");
    
    // Map drivers to attach active order counts
    const driversWithWorkload = await Promise.all(
      drivers.map(async (driver) => {
        const activeCount = await orderModel.countDocuments({
          deliverymanId: driver._id,
          orderStatus: { $nin: ["Delivered", "Cancelled"] }
        });
        
        const driverObj = driver.toObject();
        driverObj.activeDeliveries = activeCount;
        return driverObj;
      })
    );
    
    res.json({ success: true, drivers: driversWithWorkload });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Admin updates a deliveryman's status (Approve/Suspend/Activate)
const updateDriverStatus = async (req, res) => {
  try {
    const { id, status } = req.body; // status: active, suspended, rejected

    if (!id || !status) {
      return res.json({ success: false, message: "Driver ID and status are required" });
    }

    const driver = await deliverymanModel.findById(id);
    if (!driver) {
      return res.json({ success: false, message: "Delivery agent account not found" });
    }

    driver.status = status;
    await driver.save();

    res.json({
      success: true,
      message: `Delivery agent status updated to ${status} successfully`,
      driver: {
        id: driver._id,
        name: driver.name,
        status: driver.status
      }
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Admin assigns order to a deliveryman
const assignOrder = async (req, res) => {
  try {
    const { orderId, deliverymanId } = req.body;

    if (!orderId) {
      return res.json({ success: false, message: "Order ID is required" });
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    // Cancel existing active assignments
    await deliveryAssignmentModel.updateMany(
      { orderId, status: { $in: ["Assigned", "Accepted", "Picked Up", "Out for Delivery"] } },
      { status: "Cancelled" }
    );

    // Update order with driver ID
    order.deliverymanId = deliverymanId || null;
    
    // Auto-update orderStatus to "Packed" or "Shipped" if driver assigned
    if (deliverymanId && order.orderStatus === "Order Placed") {
      order.orderStatus = "Packed";
    }
    
    await order.save();

    // Create new assignment document
    if (deliverymanId) {
      await deliveryAssignmentModel.create({
        orderId: order._id,
        agentId: deliverymanId,
        status: "Assigned"
      });

      // Notify agent
      const driver = await deliverymanModel.findById(deliverymanId);
      if (driver) {
        await createNotification(
          deliverymanId,
          order._id,
          "New Delivery Assignment",
          `Admin has manually assigned you to order #${order._id.toString().slice(-6).toUpperCase()}. Please review and accept.`,
          "deliveryman"
        );
      }
    }

    res.json({
      success: true,
      message: deliverymanId 
        ? "Order assigned to deliveryman successfully" 
        : "Order unassigned from deliveryman successfully",
      order,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Deliveryman login
const loginDeliveryman = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ success: false, message: "Missing email or password" });
    }

    const driver = await deliverymanModel.findOne({ email });
    if (!driver) {
      return res.json({ success: false, message: "Deliveryman account not found" });
    }

    const isMatch = await bcrypt.compare(password, driver.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    // Status Checks
    if (driver.status === "pending") {
      return res.json({ success: false, message: "Your account is pending administrator approval." });
    }

    if (driver.status !== "active") {
      return res.json({ success: false, message: "Your account is currently suspended or inactive." });
    }

    const token = createToken(driver._id);

    res.json({
      success: true,
      message: "Login successful",
      token,
      driver: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Deliveryman lists their assigned orders
const getAssignedOrders = async (req, res) => {
  try {
    const driverId = req.deliveryman.id;
    const orders = await orderModel.find({ deliverymanId: driverId }).sort({ createdAt: -1 });

    const assignments = await deliveryAssignmentModel.find({
      agentId: driverId,
      orderId: { $in: orders.map(o => o._id) }
    });

    const ordersWithStatus = orders.map(order => {
      const orderObj = order.toObject();
      const assignment = assignments.find(a => a.orderId.toString() === order._id.toString());
      orderObj.assignmentStatus = assignment ? assignment.status : "Accepted";
      return orderObj;
    });

    res.json({ success: true, orders: ordersWithStatus });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Deliveryman views unassigned orders pool (claimable)
const getUnassignedOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({
      deliverymanId: null,
      orderStatus: { $nin: ["Delivered", "Cancelled"] }
    }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Deliveryman claims an unassigned order
const claimOrder = async (req, res) => {
  try {
    const driverId = req.deliveryman.id;
    const { orderId } = req.body;

    const driver = await deliverymanModel.findById(driverId);
    if (!driver || !driver.isOnline) {
      return res.json({ 
        success: false, 
        message: "You must go Online (On Duty) to claim shipments." 
      });
    }

    if (!orderId) {
      return res.json({ success: false, message: "Order ID is required" });
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    if (order.deliverymanId) {
      return res.json({ 
        success: false, 
        message: "This shipment has already been claimed by another courier agent." 
      });
    }

    // Bind driver and set status
    order.deliverymanId = driverId;
    order.orderStatus = "Out for Delivery";
    await order.save();

    // Trigger notification to customer
    await createNotification(
      order.userId,
      order._id,
      "Order Out for Delivery",
      `Your order #${order._id.toString().slice(-6).toUpperCase()} has been claimed by delivery agent ${driver.name} and is out for delivery.`
    );

    res.json({
      success: true,
      message: "Shipment claimed! It is now in your active deliveries list.",
      order,
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Deliveryman updates order shipment status
const updateOrderStatus = async (req, res) => {
  try {
    const driverId = req.deliveryman.id;
    const { orderId, status, verificationCode } = req.body;

    if (!orderId || !status) {
      return res.json({ success: false, message: "Missing orderId or status" });
    }

    const order = await orderModel.findOne({ _id: orderId, deliverymanId: driverId });
    if (!order) {
      return res.json({ success: false, message: "Order not found or not assigned to you" });
    }

    // ✅ Delivery Verification Gate
    if (status === "Delivered") {
      if (!verificationCode) {
        // Generate verification code if not present
        if (!order.verificationCode) {
          const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
          let code = "";
          for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          order.verificationCode = code;
          await order.save();
        }

        // Notify customer about the secret key
        await createNotification(
          order.userId,
          order._id,
          "Delivery Verification Code",
          `A secret key has been generated for order #${order._id.toString().slice(-6).toUpperCase()}. Please provide code ${order.verificationCode} to the delivery agent to confirm delivery.`
        );

        return res.json({
          success: false,
          requiresVerification: true,
          message: "A secret verification key has been generated on the customer's end. Ask the customer for the key to verify.",
        });
      }

      if (
        !order.verificationCode ||
        order.verificationCode.toUpperCase() !== verificationCode.toString().toUpperCase().trim()
      ) {
        return res.json({
          success: false,
          requiresVerification: true,
          message: "Invalid verification code. Please ask the customer for their unique delivery code.",
        });
      }
    }

    order.orderStatus = status;

    // Sync status with DeliveryAssignment
    await deliveryAssignmentModel.findOneAndUpdate(
      { orderId, agentId: driverId, status: { $in: ["Assigned", "Accepted", "Picked Up", "Out for Delivery"] } },
      { status, ...(status === "Delivered" ? { deliveredAt: new Date() } : {}) }
    );

    // If delivered, toggle payment status if COD and update agent stats
    if (status === "Delivered") {
      if (order.paymentMethod.toLowerCase() === "cod") {
        order.paymentStatus = "Paid";
      }

      await deliverymanModel.findByIdAndUpdate(driverId, {
        $inc: { activeDeliveries: -1, totalDeliveries: 1, completedDeliveries: 1, earnings: 75 }
      });

      // Notify customer of delivery success
      await createNotification(
        order.userId,
        order._id,
        "Order Delivered Successfully",
        `Your order #${order._id.toString().slice(-6).toUpperCase()} has been delivered successfully. Thank you for shopping with CartNOW!`
      );
    } else if (status === "Failed Delivery" || status === "Cancelled") {
      await deliverymanModel.findByIdAndUpdate(driverId, {
        $inc: { activeDeliveries: -1, failedDeliveries: 1 }
      });

      // General status update notification
      await createNotification(
        order.userId,
        order._id,
        "Order Status Updated",
        `Your order #${order._id.toString().slice(-6).toUpperCase()} is now "${status}".`
      );
    } else if (status === "Out for Delivery") {
      if (!order.verificationCode) {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let code = "";
        for (let i = 0; i < 6; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        order.verificationCode = code;
      }

      await createNotification(
        order.userId,
        order._id,
        "Delivery Verification Code",
        `Your order #${order._id.toString().slice(-6).toUpperCase()} is Out for Delivery! Please provide code ${order.verificationCode} to the delivery agent to confirm delivery.`
      );
    } else {
      // General status update notification
      await createNotification(
        order.userId,
        order._id,
        "Order Status Updated",
        `Your order #${order._id.toString().slice(-6).toUpperCase()} is now "${status}".`
      );
    }

    await order.save();

    // Generate invoice if Delivered (especially for COD)
    if (status === "Delivered") {
      await checkAndGenerateInvoice(orderId);
    }

    res.json({
      success: true,
      message: status === "Delivered"
        ? "Order verified and marked as Delivered successfully! ✅"
        : "Order delivery status updated successfully",
      order,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Toggle Duty Status (Online/Offline)
const toggleDutyStatus = async (req, res) => {
  try {
    const driverId = req.deliveryman.id;
    const driver = await deliverymanModel.findById(driverId);
    if (!driver) {
      return res.json({ success: false, message: "Delivery agent not found" });
    }

    driver.isOnline = !driver.isOnline;
    driver.availabilityStatus = driver.isOnline ? "Available" : "Offline";
    await driver.save();

    res.json({
      success: true,
      message: `You are now ${driver.isOnline ? "Online" : "Offline"}`,
      isOnline: driver.isOnline,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Resign / Deactivate Account
const deactivateAccount = async (req, res) => {
  try {
    const driverId = req.deliveryman.id;
    const driver = await deliverymanModel.findById(driverId);
    if (!driver) {
      return res.json({ success: false, message: "Delivery agent not found" });
    }

    driver.status = "inactive";
    driver.isOnline = false;
    driver.availabilityStatus = "Offline";
    await driver.save();

    res.json({
      success: true,
      message: "Account deactivated successfully. You have been placed on inactive status.",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Create a complaint
const createComplaint = async (req, res) => {
  try {
    const driverId = req.deliveryman.id;
    const { subject, category, description } = req.body;

    if (!subject || !category || !description) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    const driver = await deliverymanModel.findById(driverId);
    if (!driver) {
      return res.json({ success: false, message: "Delivery agent not found" });
    }

    const newComplaint = new deliverymanComplaintModel({
      deliverymanId: driverId,
      deliverymanName: driver.name,
      subject,
      category,
      description,
    });

    await newComplaint.save();

    res.json({
      success: true,
      message: "Complaint submitted successfully. Admin will review it shortly.",
      complaint: newComplaint,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get complaints submitted by driver
const getComplaints = async (req, res) => {
  try {
    const driverId = req.deliveryman.id;
    const complaints = await deliverymanComplaintModel.find({ deliverymanId: driverId }).sort({ createdAt: -1 });
    res.json({ success: true, complaints });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Admin: Get all driver complaints
const adminGetComplaints = async (req, res) => {
  try {
    const complaints = await deliverymanComplaintModel.find({}).sort({ createdAt: -1 });
    res.json({ success: true, complaints });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Admin: Respond to complaint
const adminReplyComplaint = async (req, res) => {
  try {
    const { complaintId, status, adminRemarks } = req.body;

    if (!complaintId || !status) {
      return res.json({ success: false, message: "Complaint ID and Status are required" });
    }

    const complaint = await deliverymanComplaintModel.findById(complaintId);
    if (!complaint) {
      return res.json({ success: false, message: "Complaint not found" });
    }

    complaint.status = status;
    if (adminRemarks !== undefined) {
      complaint.adminRemarks = adminRemarks;
    }
    await complaint.save();

    res.json({
      success: true,
      message: "Complaint updated successfully",
      complaint,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get driver stats and revenue overview
const getDriverStats = async (req, res) => {
  try {
    const driverId = req.deliveryman.id;
    const driver = await deliverymanModel.findById(driverId);
    if (!driver) {
      return res.json({ success: false, message: "Delivery agent not found" });
    }

    // Fetch all orders related to this driver
    const orders = await orderModel.find({ deliverymanId: driverId });

    const totalDelivered = orders.filter(o => o.orderStatus === "Delivered").length;
    const activeCount = orders.filter(o => o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled").length;

    // Calculate earnings: ₹75 per delivered order
    const totalEarnings = totalDelivered * 75;

    // Cash collected: Sum of COD orders that are Delivered
    const cashCollected = orders
      .filter(o => o.orderStatus === "Delivered" && o.paymentMethod.toLowerCase() === "cod")
      .reduce((sum, o) => sum + (o.amount || 0), 0);

    res.json({
      success: true,
      stats: {
        totalEarnings,
        totalDelivered,
        activeCount,
        cashCollected,
        isOnline: driver.isOnline,
        status: driver.status,
      }
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Deliveryman lists their assigned return tasks
const getAssignedReturns = async (req, res) => {
  try {
    const driverId = req.deliveryman.id;
    const returnRequests = await returnRequestModel.find({ deliverymanId: driverId }).sort({ createdAt: -1 });

    const populated = await Promise.all(returnRequests.map(async (reqItem) => {
      const order = await orderModel.findById(reqItem.orderId).select("address userId paymentMethod");
      return {
        ...reqItem._doc,
        orderAddress: order ? order.address : null,
        paymentMethod: order ? order.paymentMethod : null,
      };
    }));

    res.json({ success: true, returns: populated });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Deliveryman updates return request status (requires customer code for completion)
const updateReturnTaskStatus = async (req, res) => {
  try {
    const driverId = req.deliveryman.id;
    const { requestId, status, verificationCode } = req.body;

    if (!requestId || !status) {
      return res.json({ success: false, message: "Missing required fields." });
    }

    const returnReq = await returnRequestModel.findOne({ _id: requestId, deliverymanId: driverId });
    if (!returnReq) {
      return res.json({ success: false, message: "Return task not found or not assigned to you." });
    }

    if (status === "Completed") {
      if (!verificationCode) {
        return res.json({
          success: false,
          requiresVerification: true,
          message: "A verification code from the customer is required to complete return tasks."
        });
      }
      if (verificationCode.toUpperCase() !== returnReq.verificationCode) {
        return res.json({
          success: false,
          requiresVerification: true,
          message: "Incorrect verification code."
        });
      }
    }

    returnReq.status = status;
    await returnReq.save();

    // Notify customer about return status update
    await createNotification(
      returnReq.userId,
      returnReq.orderId,
      "Return Task Status Updated",
      `The return pickup for your item "${returnReq.itemName}" is now "${status}".`
    );

    res.json({ success: true, message: `Return task updated to ${status}` });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const driverId = req.deliveryman.id;
    const { name, phone, vehicleType, profilePhoto } = req.body;

    if (name) {
      const nameCheck = validateName(name);
      if (!nameCheck.isValid) {
        return res.json({ success: false, message: nameCheck.message });
      }
    }

    if (phone) {
      const phoneCheck = validatePhone(phone);
      if (!phoneCheck.isValid) {
        return res.json({ success: false, message: phoneCheck.message });
      }
    }

    const driver = await deliverymanModel.findByIdAndUpdate(
      driverId,
      { name, phone, vehicleType, profilePhoto },
      { new: true }
    );
    res.json({ success: true, message: "Profile updated successfully", driver });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const driverId = req.deliveryman.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.json({ success: false, message: "Missing current or new password" });
    }

    const driver = await deliverymanModel.findById(driverId);
    if (!driver) {
      return res.json({ success: false, message: "Driver not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, driver.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Incorrect current password" });
    }

    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.isValid) {
      return res.json({ success: false, message: passwordCheck.message });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    driver.password = hashedPassword;
    await driver.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const driver = await deliverymanModel.findOne({ email });
    if (!driver) {
      return res.json({ success: false, message: "Email not found" });
    }

    const resetToken = Math.random().toString(36).substring(2, 12).toUpperCase();
    driver.passwordResetToken = resetToken;
    driver.passwordResetExpires = Date.now() + 3600000; // 1 hour expiry
    await driver.save();

    res.json({ success: true, message: "Password reset token generated", resetToken });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.json({ success: false, message: "Missing reset token or new password" });
    }

    const driver = await deliverymanModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!driver) {
      return res.json({ success: false, message: "Invalid or expired reset token" });
    }

    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.isValid) {
      return res.json({ success: false, message: passwordCheck.message });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    driver.password = hashedPassword;
    driver.passwordResetToken = null;
    driver.passwordResetExpires = null;
    await driver.save();

    res.json({ success: true, message: "Password has been reset successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const updateAvailability = async (req, res) => {
  try {
    const driverId = req.deliveryman.id;
    const { availabilityStatus } = req.body; // Available, Busy, Offline, Suspended
    if (!["Available", "Busy", "Offline", "Suspended"].includes(availabilityStatus)) {
      return res.json({ success: false, message: "Invalid status value" });
    }
    const driver = await deliverymanModel.findById(driverId);
    if (!driver) {
      return res.json({ success: false, message: "Delivery agent not found" });
    }
    driver.availabilityStatus = availabilityStatus;
    driver.isOnline = availabilityStatus === "Available";
    await driver.save();
    res.json({ success: true, message: `Availability status updated to ${availabilityStatus}`, driver });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const updateDeliveryZones = async (req, res) => {
  try {
    const driverId = req.deliveryman.id;
    const { assignedAreas } = req.body; // array of strings
    if (!Array.isArray(assignedAreas)) {
      return res.json({ success: false, message: "assignedAreas must be an array of strings" });
    }
    const driver = await deliverymanModel.findByIdAndUpdate(
      driverId,
      { assignedAreas },
      { new: true }
    );
    res.json({ success: true, message: "Delivery zones updated successfully", driver });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const acceptDelivery = async (req, res) => {
  try {
    const driverId = req.deliveryman.id;
    const { orderId } = req.body;
    
    // Find active assignment
    const assignment = await deliveryAssignmentModel.findOne({ orderId, agentId: driverId, status: "Assigned" });
    if (!assignment) {
      return res.json({ success: false, message: "No active assignment found for this order" });
    }

    assignment.status = "Accepted";
    assignment.acceptedAt = new Date();
    await assignment.save();

    // Update order status
    const order = await orderModel.findById(orderId);
    if (order) {
      order.orderStatus = "Accepted";
      await order.save();

      // Notify customer
      await createNotification(
        order.userId,
        order._id,
        "Order Accepted by Delivery Agent",
        `Delivery agent has accepted the assignment and is on the way.`,
        "user"
      );

      // Notify seller
      if (order.items && order.items.length > 0) {
        const firstItem = order.items[0];
        const itemId = firstItem.productId || firstItem._id;
        const product = await productModel.findById(itemId);
        if (product && product.sellerId) {
          await createNotification(
            product.sellerId,
            order._id,
            "Agent Assigned",
            `Delivery agent has accepted the assignment for order #${order._id.toString().slice(-6).toUpperCase()}.`,
            "seller"
          );
        }
      }
    }

    // Update agent workload
    await deliverymanModel.findByIdAndUpdate(driverId, {
      $inc: { activeDeliveries: 1 }
    });

    res.json({ success: true, message: "Delivery assignment accepted successfully", assignment });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const rejectDelivery = async (req, res) => {
  try {
    const driverId = req.deliveryman.id;
    const { orderId } = req.body;

    // Find active assignment
    const assignment = await deliveryAssignmentModel.findOne({ orderId, agentId: driverId, status: "Assigned" });
    if (!assignment) {
      return res.json({ success: false, message: "No active assignment found for this order" });
    }

    assignment.status = "Rejected";
    await assignment.save();

    // Clear deliverymanId from order so it is not associated with this driver anymore
    const order = await orderModel.findById(orderId);
    if (order) {
      order.deliverymanId = null;
      await order.save();
    }

    // Call re-assignment logic
    await autoAssignDeliveryAgent(orderId);

    res.json({ success: true, message: "Delivery assignment rejected. Order is being reassigned." });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Update Delivery Coordinates and Radius
const updateDeliveryCoordinates = async (req, res) => {
  try {
    const driverId = req.deliveryman.id;
    const { lat, lng, radius } = req.body;

    if (lat === undefined || lng === undefined || radius === undefined) {
      return res.json({ success: false, message: "Missing coordinates or radius" });
    }

    const driver = await deliverymanModel.findByIdAndUpdate(
      driverId,
      {
        deliveryLat: Number(lat),
        deliveryLng: Number(lng),
        deliveryRadius: Number(radius)
      },
      { new: true }
    );

    if (!driver) {
      return res.json({ success: false, message: "Delivery agent not found" });
    }

    res.json({
      success: true,
      message: "Delivery zone map coordinates updated successfully",
      driver
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  registerDeliveryman,
  listDeliverymen,
  updateDriverStatus,
  assignOrder,
  loginDeliveryman,
  getAssignedOrders,
  getUnassignedOrders,
  claimOrder,
  updateOrderStatus,
  toggleDutyStatus,
  deactivateAccount,
  createComplaint,
  getComplaints,
  adminGetComplaints,
  adminReplyComplaint,
  getDriverStats,
  getAssignedReturns,
  updateReturnTaskStatus,
  updateProfile,
  updateAvailability,
  updateDeliveryZones,
  acceptDelivery,
  rejectDelivery,
  updateDeliveryCoordinates,
  changePassword,
  forgotPassword,
  resetPassword
};
