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


const app = express();
const port = process.env.PORT || 4000;
connectDb();
connectCloudinary();

// middlewares
app.use(express.json());
app.use(cors());


//api end point
app.use('/api/user',userRouter);
app.use('/uploads', express.static('uploads'));

app.use('/api/product',productRouter)

app.use('/api/cart',cartRouter);
app.use('/api/order',orderRouter);
app.use('/api/service',serviceRouter);
app.use('/api/deliveryman',deliverymanRouter);
app.use('/api/ai', aiRouter);
app.use('/api/sale', saleRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/coupon', couponRouter);
app.use('/api/coshop', coshopRouter);


import fs from "fs";
import path from "path";

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

// start server
app.listen(port, () => {
  console.log("Server started on PORT:", port);
});
