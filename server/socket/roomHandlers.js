import orderModel from "../models/orderModel.js";
import sellerModel from "../models/sellerModel.js";
import deliverymanModel from "../models/deliverymanModel.js";
import { canCommunicate } from "../utils/communicationHelper.js";

export default function registerRoomHandlers(io, socket) {
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`[Socket Room] Socket ${socket.id} joined personal room: ${userId}`);
  });

  socket.on("join_order_room", async ({ orderId }) => {
    try {
      if (!orderId) {
        return socket.emit("room_error", { message: "Invalid order ID." });
      }

      const order = await orderModel.findById(orderId);
      if (!order) {
        return socket.emit("room_error", { message: "Order not found." });
      }

      // Resolve roles and query DB to match current socket userId
      const userId = socket.userId;
      let role = "customer";

      const seller = await sellerModel.findById(userId);
      if (seller) {
        role = "seller";
      } else {
        const deliveryman = await deliverymanModel.findById(userId);
        if (deliveryman) {
          role = "deliveryman";
        }
      }

      const participant = canCommunicate(order, role, userId);
      if (!participant) {
        console.warn(`[Socket Security] Unauthorized room join blocked for user ${userId} (Role: ${role}) on order ${orderId}`);
        return socket.emit("room_error", { message: "Access denied. Not a participant of this order." });
      }

      const roomName = `order_${orderId}`;
      socket.join(roomName);

      console.log(`[Socket Room] Socket ${socket.id} (User: ${userId}, Role: ${role}) joined room: ${roomName}`);
      socket.emit("room_joined", { orderId });

      // Notify the room that user has joined / is online (use io.to to broadcast across cluster nodes)
      io.to(roomName).emit("user_online", { userId, role });

      // Determine if partner is online across all cluster nodes
      let partnerOnline = false;
      let partnerRole = "";
      let partnerIdStr = "";

      if (role === "customer") {
        partnerRole = "deliveryman";
        partnerIdStr = order.deliverymanId ? String(order.deliverymanId) : "";
      } else if (role === "deliveryman") {
        partnerRole = "customer";
        partnerIdStr = order.userId ? String(order.userId) : "";
      }

      if (partnerIdStr) {
        const partnerSockets = await io.in(partnerIdStr).fetchSockets();
        if (partnerSockets.length > 0) {
          partnerOnline = true;
        }
      }

      if (partnerOnline) {
        socket.emit("partner_presence", { online: true, partnerRole });
        // Also notify the partner that the current user is online
        io.to(partnerIdStr).emit("partner_presence", { online: true, partnerRole: role });
      } else {
        socket.emit("partner_presence", { online: false, partnerRole });
      }
    } catch (err) {
      console.error("[Socket Room Error] join_order_room failed:", err);
      socket.emit("room_error", { message: "Failed to join order room." });
    }
  });
}
