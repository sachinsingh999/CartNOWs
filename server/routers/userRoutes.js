import express from 'express';
import {
  loginUser,
  registerUser,
  adminLogin,
  getUserProfile,
  updateUserProfile,
  addUserAddress,
  deleteUserAddress,
  getUserNotifications,
  markNotificationsRead,
  addUserAppReview,
  getAllAppReviews,
} from '../controllers/userController.js';
import authUser from '../middleware/auth.js';
import rateLimit from '../middleware/rateLimiter.js';

const loginLimiter = rateLimit(5, 60 * 1000); // Max 5 login tries per minute
const registerLimiter = rateLimit(3, 60 * 1000); // Max 3 signups per minute

const userRouter=express.Router();

userRouter.post('/register', registerLimiter, registerUser);
userRouter.post('/login', loginLimiter, loginUser);
userRouter.post('/admin', loginLimiter, adminLogin);
userRouter.get("/profile", authUser, getUserProfile);
userRouter.put("/update-profile", authUser, updateUserProfile);
userRouter.post("/add-address", authUser, addUserAddress);
userRouter.post("/delete-address", authUser, deleteUserAddress);
userRouter.get("/notifications", authUser, getUserNotifications);
userRouter.post("/notifications/read", authUser, markNotificationsRead);
userRouter.post("/app-review", authUser, addUserAppReview);
userRouter.get("/app-reviews", getAllAppReviews);

export default userRouter;