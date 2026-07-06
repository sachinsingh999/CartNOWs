import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import registerRoomHandlers from "./roomHandlers.js";
import registerChatHandlers from "./chatHandlers.js";
import registerCallHandlers from "./callHandlers.js";
import registerPresenceHandlers from "./presenceHandlers.js";

export const initSocketServer = (httpServer, app) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        "https://cartnow-omega.vercel.app",
        "https://cart-now-deliveryagent.vercel.app",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176"
      ],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  app.set("socketio", io);
  const onlineUsers = new Map();
  app.set("onlineUsers", onlineUsers);

  // JWT Authentication middleware before socket connection
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error("Authentication error. Token missing."));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id || decoded._id;
      next();
    } catch (err) {
      console.error("Socket Auth Error:", err.message);
      return next(new Error("Authentication error. Invalid token."));
    }
  });

  io.on("connection", (socket) => {
    console.log(`[Socket Connection] Connected: ${socket.id} (User: ${socket.userId})`);

    // Track user online status in registry
    const userIdStr = String(socket.userId);
    if (!onlineUsers.has(userIdStr)) {
      onlineUsers.set(userIdStr, new Set());
    }
    onlineUsers.get(userIdStr).add(socket.id);
    socket.join(userIdStr); // Auto-join personal room for cluster-wide presence tracking

    // Register handlers
    registerRoomHandlers(io, socket);
    registerChatHandlers(io, socket);
    registerCallHandlers(io, socket);
    registerPresenceHandlers(io, socket, onlineUsers);
  });

  return io;
};
