import express from 'express'
import {
  placeOrder,
  placeOrderStripe,
  placeOrderRazorpay,
  allOrders,
  userOrders,
  updateStatus,
  verifyStripe,
  verifyRazorpay,
  cancelOrder
} from '../controllers/orderController.js'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'

const orderRouter=express.Router();

//lsit order for admin
orderRouter.post('/list',adminAuth,allOrders);
orderRouter.post('/status',adminAuth,updateStatus)

//payment feature
orderRouter.post('/place',authUser,placeOrder);
orderRouter.post('/stripe',authUser,placeOrderStripe);
orderRouter.post('/rozorpay',authUser,placeOrderRazorpay);
orderRouter.post('/verifyStripe',authUser,verifyStripe);
orderRouter.post('/verifyRazorpay',authUser,verifyRazorpay);

//user feature
orderRouter.post('/userOrder',authUser,userOrders);
orderRouter.post('/cancel',authUser,cancelOrder);


export default orderRouter;
