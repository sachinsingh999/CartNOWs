import express from 'express';
import {
  loginUser,
  registerUser,
  adminLogin,
  getUserProfile,
  addUserAddress,
  deleteUserAddress,
  getUserNotifications,
  markNotificationsRead,
  addUserAppReview,
  getAllAppReviews,
} from '../controllers/userController.js';
import authUser from '../middleware/auth.js';


const userRouter=express.Router();

userRouter.post('/register',registerUser);
userRouter.post('/login',loginUser);
userRouter.post('/admin',adminLogin);
userRouter.get("/profile", authUser, getUserProfile);
userRouter.post("/add-address", authUser, addUserAddress);
userRouter.post("/delete-address", authUser, deleteUserAddress);
userRouter.get("/notifications", authUser, getUserNotifications);
userRouter.post("/notifications/read", authUser, markNotificationsRead);
userRouter.post("/app-review", authUser, addUserAppReview);
userRouter.get("/app-reviews", getAllAppReviews);

export default userRouter;