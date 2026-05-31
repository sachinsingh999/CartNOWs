import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import deliverymanModel from "../models/deliverymanModel.js";
import orderModel from "../models/orderModel.js";
import deliverymanComplaintModel from "../models/deliverymanComplaintModel.js";
import returnRequestModel from "../models/returnRequestModel.js";

// JWT Generator
const createToken = (id) => {
  return jwt.sign({ id, role: "deliveryman" }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Admin/Portal registers a deliveryman (public route)
const registerDeliveryman = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    // Check if email already exists
    const exists = await deliverymanModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "Deliveryman already exists with this email" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newDriver = new deliverymanModel({
      name,
      email,
      password: hashedPassword,
      phone,
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
          orderStatus: { $ne: "Delivered" }
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

    // Update order with driver ID
    order.deliverymanId = deliverymanId || null;
    
    // Auto-update orderStatus to "Packed" or "Shipped" if driver assigned
    if (deliverymanId && order.orderStatus === "Order Placed") {
      order.orderStatus = "Packed";
    }
    
    await order.save();

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
    const orders = await orderModel.find({ deliverymanId: driverId });
    res.json({ success: true, orders });
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
      orderStatus: { $nin: ["Delivered"] }
    });
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
        return res.json({
          success: false,
          requiresVerification: true,
          message: "Verification code is required to mark this order as Delivered.",
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

    // If delivered, toggle payment status if COD
    if (status === "Delivered") {
      if (order.paymentMethod.toLowerCase() === "cod") {
        order.paymentStatus = "Paid";
      }
    }

    await order.save();

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
    const activeCount = orders.filter(o => o.orderStatus !== "Delivered").length;

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
    const returnRequests = await returnRequestModel.find({ deliverymanId: driverId });

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

    res.json({ success: true, message: `Return task updated to ${status}` });
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
};
