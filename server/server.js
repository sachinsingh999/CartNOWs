import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDb from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routers/userRoutes.js";
import productRouter from "./routers/productRoute.js";
import orderRouter from "./routers/orderRoute.js";
import cartRouter from "./routers/cartRouter.js";
import serviceRouter from "./routers/serviceRoute.js";

dotenv.config();

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


// test route
app.get("/", (req, res) => {
  res.send("API Working");
});

// start server
app.listen(port, () => {
  console.log("Server started on PORT:", port);
});
