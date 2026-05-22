import express from 'express'
import {placeOrder,placeOrderStripe,placeOrderRazorpay,allOrders,userOrders,updateStatus} from '../controllers/orderController.js'
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

//user feature
orderRouter.post('/userOrder',authUser,userOrders);


export default orderRouter;
