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
import { createServer } from "http";
import { Server } from "socket.io";
import { startTryOnWorker } from "./workers/tryOnWorker.js";
import maintenanceMiddleware from "./middleware/maintenanceMiddleware.js";
import systemRouter from "./routers/systemRouter.js";

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

import invoiceRouter from "./routers/invoiceRouter.js";
import path from "path";
app.use('/api/invoice', invoiceRouter);
app.use('/invoices', express.static(path.join(process.cwd(), 'public', 'invoices')));



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
    origin: "*",
    methods: ["GET", "POST"]
  }
});
app.set("socketio", io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`Socket ${socket.id} joined room: ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// start worker
startTryOnWorker(io);

// start hero asset scheduler
import { startHeroAssetScheduler } from "./utils/heroScheduler.js";
startHeroAssetScheduler();

// start server
httpServer.listen(port, () => {
  console.log("Server started on PORT:", port);
});
// Nodemon reload trigger to clear maintenance cache
