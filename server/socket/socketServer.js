import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import registerRoomHandlers from "./roomHandlers.js";
import registerChatHandlers from "./chatHandlers.js";
import registerCallHandlers from "./callHandlers.js";
import registerPresenceHandlers from "./presenceHandlers.js";

export const initSocketServer = (httpServer, app) => {
  const io = new Server(httpServer, {
    cors: {
      origin: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true
    },
    allowEIO3: true,
    transports: ["polling", "websocket"]
  });

  app.set("socketio", io);
  const onlineUsers = new Map();
  app.set("onlineUsers", onlineUsers);

  // JWT Authentication middleware before socket connection
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          socket.userId = decoded.id || decoded._id;
          socket.isAuthenticated = true;
          return next();
        } catch (jwtErr) {
          // Token expired or invalid, fallback to guest gracefully
        }
      }
      
      // Allow guest / unauthenticated sockets for real-time notifications and progress tracking
      const requestedUserId = socket.handshake.auth?.userId || socket.handshake.query?.userId;
      socket.userId = requestedUserId || `guest_${socket.id}`;
      socket.isAuthenticated = false;
      next();
    } catch (err) {
      socket.userId = `guest_${socket.id}`;
      socket.isAuthenticated = false;
      next();
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
