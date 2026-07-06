export default function registerPresenceHandlers(io, socket, onlineUsers) {
  const userIdStr = String(socket.userId);

  socket.on("disconnecting", () => {
    for (const room of socket.rooms) {
      if (room.startsWith("order_")) {
        console.log(`[Socket Room] Socket ${socket.id} (User: ${socket.userId}) left room: ${room} [Room Left]`);
        io.to(room).emit("user_offline", {
          userId: socket.userId
        });
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("[Socket Disconnection] Socket closed:", socket.id);
    const sockets = onlineUsers.get(userIdStr);
    if (sockets) {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        onlineUsers.delete(userIdStr);
        console.log(`[Socket Presence] User ${userIdStr} went completely offline.`);
      }
    }
  });
}
