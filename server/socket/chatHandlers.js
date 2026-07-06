import chatRoomModel from "../models/chatRoomModel.js";
import chatMessageModel from "../models/chatMessageModel.js";

export default function registerChatHandlers(io, socket) {
  // Handle typing indicator broadcast
  socket.on("typing", ({ orderId, isTyping }) => {
    if (!orderId) return;
    const roomName = `order_${orderId}`;
    socket.to(roomName).emit("typing_status", {
      userId: socket.userId,
      isTyping
    });
  });

  // Handle message seen receipts
  socket.on("mark_seen", async ({ orderId }) => {
    try {
      if (!orderId) return;
      const room = await chatRoomModel.findOne({ orderId });
      if (!room) return;

      const roomName = `order_${orderId}`;
      
      const result = await chatMessageModel.updateMany(
        {
          roomId: room._id,
          senderId: { $ne: socket.userId },
          status: { $ne: "seen" }
        },
        { $set: { status: "seen" } }
      );

      if (result.modifiedCount > 0) {
        console.log(`[Socket Messages] Marked ${result.modifiedCount} messages as SEEN in order ${orderId} by user ${socket.userId}`);
        io.to(roomName).emit("messages_seen", {
          orderId,
          seenBy: socket.userId
        });
      }
    } catch (err) {
      console.error("[Socket Message Error] mark_seen failed:", err);
    }
  });
}
