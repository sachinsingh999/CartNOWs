import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDb from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routers/userRoutes.js";
import productRouter from "./routers/productRoute.js";
import orderRouter from "./routers/orderRoute.js";
import cartRouter from "./routers/cartRouter.js";
import serviceRouter from "./routers/serviceRoute.js";
import deliverymanRouter from "./routers/deliverymanRoute.js";
import aiRouter from "./routers/aiRoute.js";
import saleRouter from "./routers/saleRoute.js";
import wishlistRouter from "./routers/wishlistRouter.js";
import couponRouter from "./routers/couponRouter.js";
import coshopRouter from "./routers/coshopRouter.js";
import adminRouter from "./routers/adminRouter.js";
import sellerRouter from "./routers/sellerRouter.js";
import tryOnRouter from "./routers/tryOnRouter.js";
import { bannerRouter, adminBannerRouter } from "./routers/bannerRouter.js";
import { dealOfDayRouter, adminDealOfDayRouter } from "./routers/dealOfDayRouter.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import IORedis from "ioredis";
import { startTryOnWorker } from "./workers/tryOnWorker.js";
import maintenanceMiddleware from "./middleware/maintenanceMiddleware.js";
import systemRouter from "./routers/systemRouter.js";
import { startCleanupCron } from "./utils/cloudinaryCron.js";
import jwt from "jsonwebtoken";
import orderModel from "./models/orderModel.js";
import sellerModel from "./models/sellerModel.js";
import deliverymanModel from "./models/deliverymanModel.js";
import { canCommunicate } from "./utils/communicationHelper.js";
import communicationRouter from "./routers/communicationRouter.js";
import chatRoomModel from "./models/chatRoomModel.js";
import chatMessageModel from "./models/chatMessageModel.js";

// Validate critical environment variables
if (!process.env.JWT_SECRET) {
  throw new Error("CRITICAL ERROR: JWT_SECRET environment variable is missing or empty in .env");
}

const app = express();
const port = process.env.PORT || 4000;
connectDb();
connectCloudinary();

// middlewares
app.use(express.json());
app.use(cors());
app.use(maintenanceMiddleware);

//api end point
app.use('/api/system', systemRouter);
app.use('/api/user',userRouter);
app.use('/uploads', express.static('uploads'));

app.use('/api/product',productRouter);
app.use('/api/products',productRouter);

app.use('/api/cart',cartRouter);
app.use('/api/order',orderRouter);
app.use('/api/service',serviceRouter);
app.use('/api/deliveryman',deliverymanRouter);
app.use('/api/ai', aiRouter);
app.use('/api/sale', saleRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/coupon', couponRouter);
app.use('/api/coshop', coshopRouter);
app.use('/api/admin', adminRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/tryon', tryOnRouter);
app.use('/api/banners', bannerRouter);
app.use('/api/admin/banners', adminBannerRouter);
app.use('/api/dealofday', dealOfDayRouter);
app.use('/api/admin/dealofday', adminDealOfDayRouter);

import invoiceRouter from "./routers/invoiceRouter.js";
import path from "path";
app.use('/api/invoice', invoiceRouter);
app.use('/invoices', express.static(path.join(process.cwd(), 'public', 'invoices')));
app.use('/api/order-communication', communicationRouter);



import fs from "fs";

app.post("/api/log", (req, res) => {
  const logMessage = `[${new Date().toISOString()}] ${req.body.message || ""}\nStack: ${req.body.stack || ""}\n\n`;
  try {
    fs.appendFileSync(path.join(process.cwd(), "browser-errors.log"), logMessage);
  } catch (err) {
    console.error("Failed to write to log file:", err);
  }
  res.sendStatus(200);
});

// test route
app.get("/", (req, res) => {
  res.send("API Working");
});

// Setup server and socket.io
const httpServer = createServer(app);
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

// Setup Redis Adapter for multi-instance horizontal scaling
if (process.env.REDIS_URL) {
  try {
    const pubClient = new IORedis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      showFriendlyErrorStack: false
    });
    const subClient = pubClient.duplicate();
    
    // Suppress errors on Redis adapter clients to prevent crash
    pubClient.on("error", (err) => {});
    subClient.on("error", (err) => {});
    
    io.adapter(createAdapter(pubClient, subClient));
    console.log("[Socket.IO] Redis adapter successfully configured.");
  } catch (err) {
    console.error("[Socket.IO] Failed to configure Redis adapter:", err);
  }
} else {
  console.log("[Socket.IO] REDIS_URL not set. Falling back to default in-memory adapter.");
}

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

// Registry to track online users is set in app settings above

io.on("connection", (socket) => {
  console.log(`[Socket Connection] Connected: ${socket.id} (User: ${socket.userId})`);

  // Track user online status in registry
  const userIdStr = String(socket.userId);
  if (!onlineUsers.has(userIdStr)) {
    onlineUsers.set(userIdStr, new Set());
  }
  onlineUsers.get(userIdStr).add(socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`[Socket Room] Socket ${socket.id} joined personal room: ${userId}`);
  });

  // Secure room joining with DB validation
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

      // Notify the room that user has joined / is online
      socket.to(roomName).emit("user_online", { userId, role });

      // Determine if partner is online
      let partnerOnline = false;
      let partnerRole = "";
      if (role === "customer") {
        partnerRole = "deliveryman";
        if (order.deliverymanId && onlineUsers.has(String(order.deliverymanId))) {
          partnerOnline = true;
        }
      } else if (role === "deliveryman") {
        partnerRole = "customer";
        if (order.userId && onlineUsers.has(String(order.userId))) {
          partnerOnline = true;
        }
      }

      if (partnerOnline) {
        socket.emit("partner_presence", { online: true, partnerRole });
      }
    } catch (err) {
      console.error("[Socket Room Error] join_order_room failed:", err);
      socket.emit("room_error", { message: "Failed to join order room." });
    }
  });

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

  // WebRTC Signaling: Relay SDP offer to recipient
  socket.on("call_user", async ({ offer, to, orderId, type, callId, callerName }) => {
    console.log(`[Socket Call] [Offer Sent] call_user event from ${socket.id} (User: ${socket.userId}) targeting ${to} for order ${orderId}`);
    
    // Relay offer to all socket connections of the target user
    const targetSockets = onlineUsers.get(String(to));
    if (targetSockets) {
      targetSockets.forEach((sId) => {
        console.log(`[Socket Call] [Offer Received/Relayed] Forwarding incoming_call to socket ${sId} (User: ${to})`);
        io.to(sId).emit("incoming_call", {
          offer,
          from: socket.userId,
          callerName: callerName || (socket.userId === String(to) ? "Delivery Partner" : "Customer"),
          orderId,
          type,
          callId
        });
      });
    } else {
      console.warn(`[Socket Call] Recipient ${to} is offline. Cannot relay Offer.`);
    }
  });

  // WebRTC Signaling: Relay ringing notification back to caller
  socket.on("ringing", ({ to, orderId }) => {
    console.log(`[Socket Call] [Ringing Sent] ringing event from ${socket.id} (User: ${socket.userId}) targeting ${to}`);
    const targetSockets = onlineUsers.get(String(to));
    if (targetSockets) {
      targetSockets.forEach((sId) => {
        console.log(`[Socket Call] [Ringing Received/Relayed] Forwarding ringing to socket ${sId}`);
        io.to(sId).emit("ringing", { orderId });
      });
    }
  });

  // WebRTC Signaling: Relay SDP answer to caller
  socket.on("call_accepted", ({ answer, to, orderId }) => {
    console.log(`[Socket Call] [Answer Sent/Accepted] call_accepted from ${socket.id} (User: ${socket.userId}) targeting ${to}`);
    const targetSockets = onlineUsers.get(String(to));
    if (targetSockets) {
      targetSockets.forEach((sId) => {
        console.log(`[Socket Call] [Answer Received/Relayed] Forwarding call_accepted to socket ${sId}`);
        io.to(sId).emit("call_accepted", { answer, orderId });
      });
    }
  });

  // WebRTC Signaling: Relay ICE Candidate
  socket.on("ice_candidate", ({ candidate, to, orderId }) => {
    console.log(`[Socket Call] [ICE Candidate Sent] ice_candidate from ${socket.id} (User: ${socket.userId}) targeting ${to}`);
    const targetSockets = onlineUsers.get(String(to));
    if (targetSockets) {
      targetSockets.forEach((sId) => {
        console.log(`[Socket Call] [ICE Candidate Received/Relayed] Forwarding ice_candidate to socket ${sId}`);
        io.to(sId).emit("ice_candidate", { candidate, orderId });
      });
    }
  });

  // WebRTC Signaling: Relay End Call event
  socket.on("end_call", ({ to, orderId }) => {
    console.log(`[Socket Call] [Call Ended Sent] end_call from ${socket.id} (User: ${socket.userId}) targeting ${to}`);
    const targetSockets = onlineUsers.get(String(to));
    if (targetSockets) {
      targetSockets.forEach((sId) => {
        console.log(`[Socket Call] [Call Ended Received/Relayed] Forwarding end_call to socket ${sId}`);
        io.to(sId).emit("end_call", { orderId });
      });
    }
  });

  // WebRTC Signaling: Relay Call Rejected event
  socket.on("call_rejected", ({ to, orderId }) => {
    console.log(`[Socket Call] [Call Rejected Sent] call_rejected from ${socket.id} (User: ${socket.userId}) targeting ${to}`);
    const targetSockets = onlineUsers.get(String(to));
    if (targetSockets) {
      targetSockets.forEach((sId) => {
        console.log(`[Socket Call] [Call Rejected Received/Relayed] Forwarding call_rejected to socket ${sId}`);
        io.to(sId).emit("call_rejected", { orderId });
      });
    }
  });

  // WebRTC Signaling: Relay Call Busy event
  socket.on("call_busy", ({ to, orderId }) => {
    console.log(`[Socket Call] [Call Busy Sent] call_busy from ${socket.id} (User: ${socket.userId}) targeting ${to}`);
    const targetSockets = onlineUsers.get(String(to));
    if (targetSockets) {
      targetSockets.forEach((sId) => {
        console.log(`[Socket Call] [Call Busy Received/Relayed] Forwarding call_busy to socket ${sId}`);
        io.to(sId).emit("call_busy", { orderId });
      });
    }
  });

  // WebRTC Signaling: Relay Call Timeout event
  socket.on("call_timeout", ({ to, orderId }) => {
    console.log(`[Socket Call] [Call Timeout Sent] call_timeout from ${socket.id} (User: ${socket.userId}) targeting ${to}`);
    const targetSockets = onlineUsers.get(String(to));
    if (targetSockets) {
      targetSockets.forEach((sId) => {
        console.log(`[Socket Call] [Call Timeout Received/Relayed] Forwarding call_timeout to socket ${sId}`);
        io.to(sId).emit("call_timeout", { orderId });
      });
    }
  });

  // WebRTC Signaling: Relay Call Failed event
  socket.on("call_failed", ({ to, orderId }) => {
    console.log(`[Socket Call] [Call Failed Sent] call_failed from ${socket.id} (User: ${socket.userId}) targeting ${to}`);
    const targetSockets = onlineUsers.get(String(to));
    if (targetSockets) {
      targetSockets.forEach((sId) => {
        console.log(`[Socket Call] [Call Failed Received/Relayed] Forwarding call_failed to socket ${sId}`);
        io.to(sId).emit("call_failed", { orderId });
      });
    }
  });

  // Handle socket disconnecting to capture rooms
  socket.on("disconnecting", () => {
    for (const room of socket.rooms) {
      if (room.startsWith("order_")) {
        console.log(`[Socket Room] Socket ${socket.id} (User: ${socket.userId}) left room: ${room} [Room Left]`);
        socket.to(room).emit("user_offline", {
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
});

// start worker
startTryOnWorker(io);

// Start Cloudinary storage cleanup scheduler
startCleanupCron();

// start server
httpServer.listen(port, () => {
  console.log("Server started on PORT:", port);
});
// Nodemon reload trigger to clear maintenance cache
