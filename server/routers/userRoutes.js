import express from 'express';
import {
  loginUser,
  registerUser,
  adminLogin,
  getUserProfile,
  getUserMembership,
  updateUserProfile,
  addUserAddress,
  deleteUserAddress,
  getUserNotifications,
  markNotificationsRead,
  addUserAppReview,
  getAllAppReviews,
  googleLogin,
  getVipSecurityStatus,
  setVipSecurityCode,
  verifyVipSecurityCode,
  changeVipSecurityCode,
  resetVipSecurityCode,
} from '../controllers/userController.js';
import authUser from '../middleware/auth.js';
import rateLimit from '../middleware/rateLimiter.js';

const loginLimiter = rateLimit(10, 60 * 1000); // Max 10 login tries per minute
const adminLoginLimiter = rateLimit(30, 60 * 1000); // Max 30 admin login tries per minute
const registerLimiter = rateLimit(5, 60 * 1000); // Max 5 signups per minute
const vipVerifyLimiter = rateLimit(10, 60 * 1000); // Max 10 verification tries per minute

const userRouter = express.Router();

userRouter.post('/register', registerLimiter, registerUser);
userRouter.post('/login', loginLimiter, loginUser);
userRouter.post('/google-login', loginLimiter, googleLogin);
userRouter.post('/admin', adminLoginLimiter, adminLogin);
userRouter.get("/profile", authUser, getUserProfile);
userRouter.get("/membership", authUser, getUserMembership);
userRouter.put("/update-profile", authUser, updateUserProfile);
userRouter.post("/add-address", authUser, addUserAddress);
userRouter.post("/delete-address", authUser, deleteUserAddress);
userRouter.get("/notifications", authUser, getUserNotifications);
userRouter.post("/notifications/read", authUser, markNotificationsRead);
userRouter.post("/app-review", authUser, addUserAppReview);
userRouter.get("/app-reviews", getAllAppReviews);

/* ================= VIP CARD SECURITY ROUTES ================= */
userRouter.get("/vip-security/status", authUser, getVipSecurityStatus);
userRouter.post("/vip-security/set-code", authUser, setVipSecurityCode);
userRouter.post("/vip-security/verify", authUser, vipVerifyLimiter, verifyVipSecurityCode);
userRouter.post("/vip-security/change-code", authUser, changeVipSecurityCode);
userRouter.post("/vip-security/reset-code", authUser, resetVipSecurityCode);

export default userRouter;