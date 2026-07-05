import chatRoomModel from "../models/chatRoomModel.js";
import chatMessageModel from "../models/chatMessageModel.js";
import userModel from "../models/userModel.js";
import sellerModel from "../models/sellerModel.js";
import deliverymanModel from "../models/deliverymanModel.js";
import callModel from "../models/callModel.js";
import { canSendMessage, canInitiateCall, isCommunicationLocked } from "../utils/communicationHelper.js";

// Helper to escape HTML tags to prevent XSS injection
const sanitizeMessage = (msg) => {
  if (typeof msg !== "string") return "";
  return msg
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
};

// 1. Get communication status
export const getCommunicationStatus = async (req, res) => {
  try {
    const order = req.order;
    const role = req.userRole;
    const locked = isCommunicationLocked(order);

    let deliverymanName = "Delivery Partner";
    let sellerName = "Store Support";
    let customerName = "Customer";

    // 1. Fetch Deliveryman Name
    if (order.deliverymanId) {
      const driver = await deliverymanModel.findById(order.deliverymanId);
      if (driver) {
        deliverymanName = driver.name || "Delivery Partner";
      }
    }

    // 2. Fetch Seller Name
    const room = await chatRoomModel.findOne({ orderId: order._id });
    if (room && room.sellerIds && room.sellerIds.length > 0) {
      const seller = await sellerModel.findById(room.sellerIds[0]);
      if (seller) {
        sellerName = seller.shopName || seller.name || "Store Support";
      }
    }

    // 3. Fetch Customer Name
    const user = await userModel.findById(order.userId);
    if (user) {
      customerName = user.name || (order.address?.firstName ? `${order.address.firstName} ${order.address.lastName || ""}`.trim() : "Customer");
    }

    res.json({
      success: true,
      locked,
      role,
      userId: req.userId,
      customerId: order.userId,
      deliverymanId: order.deliverymanId,
      deliverymanName,
      sellerName,
      customerName,
      orderStatus: order.orderStatus,
      canChatCustomer: canSendMessage(order, role, "customer"),
      canChatDeliveryman: canSendMessage(order, role, "deliveryman"),
      canChatSeller: canSendMessage(order, role, "seller"),
      canCallDeliveryman: canInitiateCall(order, role, "deliveryman")
    });
  } catch (error) {
    console.error("Error in getCommunicationStatus:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get paginated messages for room
export const getRoomMessages = async (req, res) => {
  try {
    const order = req.order;
    const room = await chatRoomModel.findOne({ orderId: order._id });
    if (!room) {
      return res.json({ success: true, messages: [], total: 0 });
    }

    // Automatically mark all messages in room sent by OTHER users as 'seen'
    const requesterId = req.userId;
    const updateResult = await chatMessageModel.updateMany(
      {
        roomId: room._id,
        senderId: { $ne: requesterId },
        status: { $ne: "seen" }
      },
      { $set: { status: "seen" } }
    );

    if (updateResult.modifiedCount > 0) {
      const io = req.app.get("socketio");
      if (io) {
        io.to(`order_${order._id}`).emit("messages_seen", {
          orderId: order._id,
          seenBy: requesterId
        });
      }
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const total = await chatMessageModel.countDocuments({ roomId: room._id });
    const messages = await chatMessageModel.find({ roomId: room._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      messages: messages.reverse(), // Send chronological order to client
      page,
      limit,
      total
    });
  } catch (error) {
    console.error("Error in getRoomMessages:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Send message
export const sendMessage = async (req, res) => {
  try {
    const order = req.order;
    const senderRole = req.userRole;
    const senderId = req.userId;
    const { receiverRole, message } = req.body;

    if (!receiverRole || !message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Missing receiver role or message content." });
    }

    // Validate permission
    const allowed = canSendMessage(order, senderRole, receiverRole);
    if (!allowed) {
      return res.status(403).json({ success: false, message: "Messaging is currently locked or unauthorized for this status." });
    }

    // Resolve room
    let room = await chatRoomModel.findOne({ orderId: order._id });
    if (!room) {
      // Fallback if not auto-created
      const sellerIds = [];
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const sId = item.product?.sellerId || item.sellerId;
          if (sId) sellerIds.push(sId);
        });
      }
      room = await chatRoomModel.create({
        orderId: order._id,
        customerId: order.userId,
        deliverymanId: order.deliverymanId,
        sellerIds
      });
    }

    // Sync deliveryman if assigned in order but not in room
    if (order.deliverymanId && (!room.deliverymanId || room.deliverymanId.toString() !== order.deliverymanId.toString())) {
      room.deliverymanId = order.deliverymanId;
      await room.save();
    }

    // Fetch sender's display name
    let senderName = "User";
    if (senderRole === "customer") {
      const user = await userModel.findById(senderId).select("name");
      if (user) senderName = user.name;
    } else if (senderRole === "seller") {
      const seller = await sellerModel.findById(senderId).select("shopName name");
      if (seller) senderName = seller.shopName || seller.name;
    } else if (senderRole === "deliveryman") {
      const dm = await deliverymanModel.findById(senderId).select("name");
      if (dm) senderName = dm.name;
    }

    const sanitizedMessage = sanitizeMessage(message);

    // Determine if message is delivered immediately (recipient is online)
    let status = "sent";
    const onlineUsers = req.app.get("onlineUsers");
    if (onlineUsers) {
      let partnerId = null;
      if (senderRole === "customer") {
        partnerId = order.deliverymanId;
      } else if (senderRole === "deliveryman") {
        partnerId = order.userId;
      }

      if (partnerId && onlineUsers.has(String(partnerId))) {
        status = "delivered";
      }
    }

    const msg = await chatMessageModel.create({
      roomId: room._id,
      senderId,
      senderRole,
      senderName,
      message: sanitizedMessage,
      status
    });
    console.log(`[REST Message] Message successfully saved to database. MessageID: ${msg._id}, Sender: ${senderName} (Role: ${senderRole}), Room: ${room._id} [Message Sent]`);

    // Broadcast message via socket.io
    const io = req.app.get("socketio");
    if (io) {
      console.log(`[Socket Broadcast] Emitting receive_message event to room: order_${order._id} [Message Received]`);
      io.to(`order_${order._id}`).emit("receive_message", msg);

      // Notification broadcast
      io.to(`order_${order._id}`).emit("new_notification", {
        type: "message",
        message: sanitizedMessage,
        senderId: msg.senderId,
        senderRole,
        senderName,
        orderId: order._id
      });
    }

    res.json({ success: true, message: msg });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Initiate Call
export const initiateCall = async (req, res) => {
  try {
    const order = req.order;
    const callerRole = req.userRole;
    const { receiverRole, type } = req.body; // type is "audio" | "video"

    if (!receiverRole) {
      return res.status(400).json({ success: false, message: "Missing receiver role." });
    }

    // Check calling permission
    const allowed = canInitiateCall(order, callerRole, receiverRole);
    if (!allowed) {
      return res.status(403).json({ success: false, message: "Calling is not allowed under the current order status." });
    }

    // Resolve receiver ID securely based on order
    let receiverId = null;
    if (callerRole === "customer") {
      receiverId = order.deliverymanId;
    } else if (callerRole === "deliveryman") {
      receiverId = order.userId;
    }

    if (!receiverId) {
      return res.status(400).json({ success: false, message: "No assigned participant found to call." });
    }

    // Create call record in database
    const call = await callModel.create({
      orderId: order._id,
      callerId: req.userId,
      callerRole,
      receiverId,
      receiverRole,
      type: type || "audio",
      status: "initiated",
      duration: 0
    });
    console.log(`[REST Call] Call successfully initiated in database. CallID: ${call._id}, OrderID: ${order._id}, Caller: ${req.userId} (${callerRole}) calling Receiver: ${receiverId} (${receiverRole}) [Call Started]`);

    // Broadcast calling notification to socket room
    const io = req.app.get("socketio");
    if (io) {
      console.log(`[Socket Broadcast] Emitting REST incoming_call notification log to room: order_${order._id}`);
      io.to(`order_${order._id}`).emit("incoming_call", {
        orderId: order._id,
        callId: call._id,
        callerRole,
        callerId: req.userId,
        callerName: callerRole === "customer" ? "Customer" : "Delivery Partner",
        receiverRole,
        type: type || "audio",
        channelName: `order_${order._id}`
      });
    }

    res.json({
      success: true,
      callId: call._id,
      channelName: `order_${order._id}`,
      status: "initiated"
    });
  } catch (error) {
    console.error("Error in initiateCall:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Get Call History
export const getCallHistory = async (req, res) => {
  try {
    const order = req.order;
    const calls = await callModel.find({ orderId: order._id }).sort({ createdAt: -1 });
    res.json({ success: true, calls });
  } catch (error) {
    console.error("Error in getCallHistory:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Update Call Status
export const updateCallStatus = async (req, res) => {
  try {
    const { callId } = req.params;
    const { status, duration } = req.body;

    const call = await callModel.findById(callId);
    if (!call) {
      return res.status(404).json({ success: false, message: "Call log not found." });
    }

    call.status = status;
    if (typeof duration === "number") {
      call.duration = duration;
    }
    await call.save();

    // If terminal status, write a system message to the chat room
    if (["missed", "rejected", "no-answer", "completed", "busy", "failed"].includes(status)) {
      const room = await chatRoomModel.findOne({ orderId: call.orderId });
      if (room) {
        let systemMessage = "";
        const callTypeLabel = call.type === "video" ? "Video" : "Voice";
        
        if (status === "completed") {
          const sSecs = typeof duration === "number" ? duration : 0;
          const mins = Math.floor(sSecs / 60).toString().padStart(2, "0");
          const secs = (sSecs % 60).toString().padStart(2, "0");
          systemMessage = `[System] ${callTypeLabel} call completed (${mins}:${secs})`;
        } else if (status === "rejected") {
          systemMessage = `[System] ${callTypeLabel} call declined`;
        } else if (status === "busy") {
          systemMessage = `[System] ${callTypeLabel} call line busy`;
        } else if (status === "failed") {
          systemMessage = `[System] ${callTypeLabel} call connection failed`;
        } else {
          systemMessage = `[System] ${callTypeLabel} call missed`;
        }

        await chatMessageModel.create({
          roomId: room._id,
          senderId: call.callerId,
          senderRole: call.callerRole,
          senderName: call.callerRole === "customer" ? "Customer" : "Delivery Partner",
          message: systemMessage,
          status: "seen"
        });

        // Notify client chat window to reload messages
        const io = req.app.get("socketio");
        if (io) {
          io.to(`order_${call.orderId}`).emit("call_status_updated", {
            callId: call._id,
            status,
            orderId: call.orderId
          });
        }
      }
    }

    res.json({ success: true, call });
  } catch (error) {
    console.error("Error in updateCallStatus:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
