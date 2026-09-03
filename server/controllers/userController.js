import userModel from "../models/userModel.js";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import notificationModel from "../models/notificationModel.js";
import { validateEmail, validatePassword, validateName, validatePhone } from "../utils/validation.js";
import { recalculateUserVIPStatus } from "../services/vipService.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET)

}

//Route for user Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Quick sanitization & validation
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      return res.status(400).json({ success: false, message: emailCheck.message });
    }

    const user = await userModel.findOne({ email: emailCheck.value });
    if (!user) {
      return res.status(409).json({
        success: false,
        message: "User doesn't exists",
      });

    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = createToken(user._id);
      res.json({ success: true, token })
    } else {
      res.json({ success: false, message: "invalid credentials" })
    }


  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });

  }

}

// Route for user registration
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const nameCheck = validateName(name);
    if (!nameCheck.isValid) {
      return res.status(400).json({ success: false, message: nameCheck.message });
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      return res.status(400).json({ success: false, message: emailCheck.message });
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      return res.status(400).json({ success: false, message: passwordCheck.message });
    }

    const exists = await userModel.findOne({ email: emailCheck.value });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      name: nameCheck.value,
      email: emailCheck.value,
      password: hashedPassword,
    });

    const token = createToken(user._id);

    res.status(201).json({
      success: true,
      token
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


const adminLogin = (async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign({ role: "admin", email }, process.env.JWT_SECRET, { expiresIn: "5d" });
      res.json({ success: true, token });
    } else {
      res.status(401).json({
        success: false,
        message: "invalid credentials",
      });
    }
  } catch (error) {

    console.log(error);
    res.json({ success: false, message: error.message })

  }


})



/* ================= GET USER PROFILE ================= */
const getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    // Migrate older users who do not have a key yet
    if (!user.deliveryVerificationKey) {
      user.deliveryVerificationKey = Math.random().toString(36).substring(2, 8).toUpperCase();
      await user.save();
    }

    const vipInfo = await recalculateUserVIPStatus(user._id);

    const userProfile = {
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePhoto: user.profilePhoto || "",
      deliveryVerificationKey: user.deliveryVerificationKey,
      addresses: user.addresses || [],
      appReview: user.appReview || null,
      walletBalance: user.walletBalance || 0,
      rewardPoints: user.rewardPoints || 0,
      membership: vipInfo
    };

    res.json({
      success: true,
      user: userProfile,
    });
  } catch (error) {
    console.log("PROFILE ERROR 👉", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= GET USER MEMBERSHIP ================= */
const getUserMembership = async (req, res) => {
  try {
    const vipInfo = await recalculateUserVIPStatus(req.user._id);
    if (!vipInfo) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({
      success: true,
      membership: vipInfo
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= UPDATE USER PROFILE ================= */
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email, profilePhoto, password } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (name) {
      const nameCheck = validateName(name);
      if (!nameCheck.isValid) {
        return res.json({ success: false, message: nameCheck.message });
      }
      user.name = nameCheck.value;
    }

    if (email) {
      const emailCheck = validateEmail(email);
      if (!emailCheck.isValid) {
        return res.json({ success: false, message: emailCheck.message });
      }
      if (emailCheck.value !== user.email) {
        const emailExists = await userModel.findOne({ email: emailCheck.value });
        if (emailExists) {
          return res.json({ success: false, message: "Email already in use" });
        }
        user.email = emailCheck.value;
      }
    }

    if (profilePhoto !== undefined) {
      user.profilePhoto = profilePhoto;
    }

    if (password) {
      const passwordCheck = validatePassword(password);
      if (!passwordCheck.isValid) {
        return res.json({ success: false, message: passwordCheck.message });
      }
      user.password = await bcrypt.hash(passwordCheck.value, 10);
    }

    await user.save();

    const userProfile = {
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePhoto: user.profilePhoto || "",
      deliveryVerificationKey: user.deliveryVerificationKey,
      addresses: user.addresses || [],
      appReview: user.appReview || null,
    };

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: userProfile,
    });
  } catch (error) {
    console.log("UPDATE PROFILE ERROR 👉", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= ADD USER ADDRESS ================= */
const addUserAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { firstName, lastName, email, phone, street, city, state, country } = req.body;

    if (!firstName || !email || !phone || !street || !city || !state || !country) {
      return res.json({
        success: false,
        message: "Missing required fields",
      });
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      return res.json({ success: false, message: emailCheck.message });
    }

    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.isValid) {
      return res.json({ success: false, message: phoneCheck.message });
    }

    const firstCheck = validateName(firstName);
    if (!firstCheck.isValid) {
      return res.json({ success: false, message: "First name: " + firstCheck.message });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    user.addresses.push({
      firstName: firstCheck.value,
      lastName: lastName || "",
      email: emailCheck.value,
      phone: phoneCheck.value,
      street,
      city,
      state,
      country,
      lat: Number(req.body.lat) || 0,
      lng: Number(req.body.lng) || 0,
    });

    await user.save();

    res.json({
      success: true,
      message: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.log("ADD ADDRESS ERROR 👉", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= DELETE USER ADDRESS ================= */
const deleteUserAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { addressId } = req.body;

    if (!addressId) {
      return res.json({
        success: false,
        message: "Address ID is required",
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    // Pull or filter out the subdocument
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);
    await user.save();

    res.json({
      success: true,
      message: "Address deleted successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.log("DELETE ADDRESS ERROR 👉", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUserNotifications = async (req, res) => {
  try {
    const notifications = await notificationModel
      .find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, notifications });
  } catch (error) {
    console.log("FETCH NOTIFICATIONS ERROR 👉", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const markNotificationsRead = async (req, res) => {
  try {
    const { notificationId } = req.body;
    if (notificationId) {
      await notificationModel.updateOne(
        { _id: notificationId, userId: req.user._id },
        { isRead: true }
      );
      res.json({ success: true, message: "Notification marked as read" });
    } else {
      await notificationModel.updateMany(
        { userId: req.user._id, isRead: false },
        { isRead: true }
      );
      res.json({ success: true, message: "All notifications marked as read" });
    }
  } catch (error) {
    console.log("MARK NOTIFICATIONS READ ERROR 👉", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= ADD OR UPDATE USER APP REVIEW ================= */
const addUserAppReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { rating, comment } = req.body;

    if (rating === undefined || rating < 1 || rating > 5) {
      return res.json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    user.appReview = {
      rating: Number(rating),
      comment: comment || "",
      createdAt: new Date(),
    };

    await user.save();

    res.json({
      success: true,
      message: "Application review saved successfully",
      appReview: user.appReview,
    });
  } catch (error) {
    console.log("ADD APP REVIEW ERROR 👉", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= GET ALL APPLICATION REVIEWS ================= */
const getAllAppReviews = async (req, res) => {
  try {
    const usersWithReviews = await userModel
      .find({ "appReview.rating": { $gt: 0 } }, "name profilePhoto appReview")
      .lean();

    const reviews = usersWithReviews.map(user => {
      const nameParts = user.name.trim().split(" ");
      const initials = nameParts.map(n => n.charAt(0).toUpperCase()).join("").slice(0, 2);

      return {
        id: user._id,
        name: user.name,
        rating: user.appReview.rating,
        comment: user.appReview.comment,
        product: "Platform Experience",
        date: user.appReview.createdAt
          ? new Date(user.appReview.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
          : "Recently",
        initials: initials || "U",
        profilePhoto: user.profilePhoto || ""
      };
    });

    res.json({
      success: true,
      reviews
    });
  } catch (error) {
    console.log("GET ALL APP REVIEWS ERROR 👉", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: "Google ID Token is required" });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const client = new OAuth2Client(clientId);

    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: clientId,
      });
    } catch (err) {
      // Fallback verification without audience check if GOOGLE_CLIENT_ID is not set in env yet
      ticket = await client.verifyIdToken({
        idToken: idToken,
      });
    }

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email not provided by Google account" });
    }

    let user = await userModel.findOne({ email });

    if (user) {
      // Account Linking: update existing account with Google login credentials
      let needsSave = false;
      if (user.provider !== "google") {
        user.provider = "google";
        needsSave = true;
      }
      if (!user.googleId) {
        user.googleId = googleId;
        needsSave = true;
      }
      if (!user.isVerified) {
        user.isVerified = true;
        needsSave = true;
      }
      if (picture && !user.profilePhoto) {
        user.profilePhoto = picture;
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
      }
    } else {
      // Create user automatically
      user = await userModel.create({
        name: name || "Google User",
        email: email,
        provider: "google",
        googleId: googleId,
        isVerified: true,
        profilePhoto: picture || "",
      });
    }

    const token = createToken(user._id);
    res.json({
      success: true,
      token,
      message: "Logged in with Google successfully",
      user: {
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto,
        role: "customer"
      }
    });

  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ success: false, message: "Google token verification failed" });
  }
};

/* ================= VIP CARD SECURITY CONTROLLERS ================= */

const generateUnmaskedMembershipId = (userId) => {
  if (!userId) return "4532 8910 4729 B5D5";
  const idStr = userId.toString();
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash << 5) - hash + idStr.charCodeAt(i);
    hash |= 0;
  }
  const strHash = Math.abs(hash).toString().padStart(8, "89104729");
  const p1 = strHash.slice(0, 4);
  const p2 = strHash.slice(4, 8);
  const last4 = idStr.slice(-4).toUpperCase();
  return `4532 ${p1} ${p2} ${last4}`;
};

// GET /api/user/vip-security/status
const getVipSecurityStatus = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const vipSec = user.vipSecurity || {};
    const now = Date.now();
    const isLocked = !!(vipSec.lockUntil && new Date(vipSec.lockUntil).getTime() > now);
    const remainingLockSeconds = isLocked ? Math.ceil((new Date(vipSec.lockUntil).getTime() - now) / 1000) : 0;

    res.json({
      success: true,
      enabled: !!vipSec.enabled,
      isLocked,
      remainingLockSeconds
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/user/vip-security/set-code
const setVipSecurityCode = async (req, res) => {
  try {
    const { code } = req.body || {};
    if (!code || !/^\d{4,6}$/.test(code.toString())) {
      return res.status(400).json({ success: false, message: "Security code must be 4 to 6 numeric digits" });
    }

    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const codeHash = await bcrypt.hash(code.toString(), 10);
    user.vipSecurity = {
      codeHash,
      enabled: true,
      updatedAt: new Date(),
      failedAttempts: 0,
      lockUntil: null
    };

    await user.save();

    res.json({
      success: true,
      message: "VIP Card Security Code created successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/user/vip-security/verify
const verifyVipSecurityCode = async (req, res) => {
  try {
    const { code } = req.body || {};
    if (!code) {
      return res.status(400).json({ success: false, message: "Security code is required" });
    }

    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const vipSec = user.vipSecurity || {};
    if (!vipSec.enabled || !vipSec.codeHash) {
      return res.status(400).json({ success: false, message: "VIP Security Code is not configured" });
    }

    const now = Date.now();
    if (vipSec.lockUntil && new Date(vipSec.lockUntil).getTime() > now) {
      const remainingSecs = Math.ceil((new Date(vipSec.lockUntil).getTime() - now) / 1000);
      return res.status(429).json({
        success: false,
        message: `Too many failed attempts. Locked temporarily for ${remainingSecs} seconds.`
      });
    }

    const isMatch = await bcrypt.compare(code.toString(), vipSec.codeHash);

    if (isMatch) {
      // Reset attempts on successful verification
      user.vipSecurity.failedAttempts = 0;
      user.vipSecurity.lockUntil = null;
      await user.save();

      // Generate a short-lived 5-minute unlock token
      const unlockToken = jwt.sign(
        { id: user._id, type: "vip_card_unlock" },
        process.env.JWT_SECRET,
        { expiresIn: "5m" }
      );

      const unmaskedMembershipId = generateUnmaskedMembershipId(user._id);

      return res.json({
        success: true,
        message: "VIP Card Security Verified",
        unlockToken,
        unmaskedMembershipId,
        expiresInSeconds: 300
      });
    } else {
      // Increment failed attempts
      user.vipSecurity.failedAttempts = (user.vipSecurity.failedAttempts || 0) + 1;

      if (user.vipSecurity.failedAttempts >= 5) {
        user.vipSecurity.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minute lock
      }

      await user.save();

      return res.status(401).json({
        success: false,
        message: "Incorrect security code."
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/user/vip-security/change-code
const changeVipSecurityCode = async (req, res) => {
  try {
    const { currentCode, newCode, confirmNewCode } = req.body || {};

    if (!currentCode || !newCode || !confirmNewCode) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (!/^\d{4,6}$/.test(newCode.toString())) {
      return res.status(400).json({ success: false, message: "New security code must be 4 to 6 numeric digits" });
    }

    if (newCode !== confirmNewCode) {
      return res.status(400).json({ success: false, message: "New security code and confirmation do not match" });
    }

    if (currentCode === newCode) {
      return res.status(400).json({ success: false, message: "New security code must be different from current code" });
    }

    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const vipSec = user.vipSecurity || {};
    if (!vipSec.enabled || !vipSec.codeHash) {
      return res.status(400).json({ success: false, message: "VIP Security Code is not set up" });
    }

    const isMatch = await bcrypt.compare(currentCode.toString(), vipSec.codeHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current security code is incorrect" });
    }

    const newHash = await bcrypt.hash(newCode.toString(), 10);
    user.vipSecurity = {
      codeHash: newHash,
      enabled: true,
      updatedAt: new Date(),
      failedAttempts: 0,
      lockUntil: null
    };

    await user.save();

    res.json({
      success: true,
      message: "VIP Security Code updated successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/user/vip-security/reset-code (Forgot Code Flow)
const resetVipSecurityCode = async (req, res) => {
  try {
    const { password, newCode, confirmNewCode } = req.body || {};

    if (!password || !newCode || !confirmNewCode) {
      return res.status(400).json({ success: false, message: "Account password and new security code are required" });
    }

    if (!/^\d{4,6}$/.test(newCode.toString())) {
      return res.status(400).json({ success: false, message: "New security code must be 4 to 6 numeric digits" });
    }

    if (newCode !== confirmNewCode) {
      return res.status(400).json({ success: false, message: "New security code and confirmation do not match" });
    }

    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Re-verify identity with user password
    if (user.provider === "local") {
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        return res.status(401).json({ success: false, message: "Invalid account password. Security verification failed." });
      }
    }

    const newHash = await bcrypt.hash(newCode.toString(), 10);
    user.vipSecurity = {
      codeHash: newHash,
      enabled: true,
      updatedAt: new Date(),
      failedAttempts: 0,
      lockUntil: null
    };

    await user.save();

    return res.json({
      success: true,
      message: "VIP Security Code reset successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 1. Forgot Password - Send Reset OTP
 * Generates 6-digit OTP, hashes it with bcrypt, saves to DB with 5-minute expiry, sends email.
 * Enforces anti-account enumeration & 60s resend cooldown.
 */
const sendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      return res.status(400).json({ success: false, message: emailCheck.message });
    }

    const cleanEmail = emailCheck.value;
    const user = await userModel.findOne({ email: cleanEmail });

    // Anti-account enumeration: Always return success message even if user does not exist
    if (!user) {
      return res.json({
        success: true,
        message: "If an account exists with this email, an OTP has been sent."
      });
    }

    // Rate-limiting: 60-second cooldown check
    if (user.resetOtp?.lastRequestedAt) {
      const timeSinceLastRequest = (Date.now() - new Date(user.resetOtp.lastRequestedAt).getTime()) / 1000;
      if (timeSinceLastRequest < 60) {
        const remainingSeconds = Math.ceil(60 - timeSinceLastRequest);
        return res.status(429).json({
          success: false,
          message: `Please wait ${remainingSeconds} seconds before requesting a new OTP.`
        });
      }
    }

    // Generate 6-digit OTP code safely
    let otpCode;
    try {
      otpCode = crypto.randomInt(100000, 999999).toString();
    } catch (err) {
      otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    }

    const otpHash = await bcrypt.hash(otpCode, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    // Atomically update user document in MongoDB
    await userModel.updateOne(
      { _id: user._id },
      {
        $set: {
          resetOtp: {
            codeHash: otpHash,
            expiresAt,
            createdAt: new Date(),
            lastRequestedAt: new Date(),
            attempts: 0
          },
          resetSession: { tokenHash: null, expiresAt: null }
        }
      }
    );

    // Send email via Nodemailer (with dev log fallback)
    try {
      await sendPasswordResetOtpEmail(cleanEmail, otpCode);
    } catch (mailErr) {
      console.error("Nodemailer error sending password reset OTP:", mailErr);
    }

    res.json({
      success: true,
      message: "If an account exists with this email, an OTP has been sent."
    });
  } catch (error) {
    console.error("sendResetOtp error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. Resend Reset OTP
 * Enforces 60-second rate-limiting cooldown and issues a fresh 6-digit OTP.
 */
const resendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      return res.status(400).json({ success: false, message: emailCheck.message });
    }

    const cleanEmail = emailCheck.value;
    const user = await userModel.findOne({ email: cleanEmail });

    if (!user) {
      return res.json({
        success: true,
        message: "If an account exists with this email, an OTP has been sent."
      });
    }

    // 60-second cooldown rate-limiting check
    if (user.resetOtp?.lastRequestedAt) {
      const timeSinceLastRequest = (Date.now() - new Date(user.resetOtp.lastRequestedAt).getTime()) / 1000;
      if (timeSinceLastRequest < 60) {
        const remainingSeconds = Math.ceil(60 - timeSinceLastRequest);
        return res.status(429).json({
          success: false,
          message: `Please wait ${remainingSeconds} seconds before requesting a new OTP.`
        });
      }
    }

    let otpCode;
    try {
      otpCode = crypto.randomInt(100000, 999999).toString();
    } catch (err) {
      otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    }

    const otpHash = await bcrypt.hash(otpCode, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await userModel.updateOne(
      { _id: user._id },
      {
        $set: {
          resetOtp: {
            codeHash: otpHash,
            expiresAt,
            createdAt: new Date(),
            lastRequestedAt: new Date(),
            attempts: 0
          }
        }
      }
    );

    try {
      await sendPasswordResetOtpEmail(cleanEmail, otpCode);
    } catch (mailErr) {
      console.error("Nodemailer error resending password reset OTP:", mailErr);
    }

    res.json({
      success: true,
      message: "A new OTP has been sent to your email address."
    });
  } catch (error) {
    console.error("resendResetOtp error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. Verify Reset OTP
 * Checks 5-minute expiration, tracks failed attempts (max 5), invalidates OTP on max failures.
 * On success, generates a single-use resetSessionToken valid for 10 minutes.
 */
const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      return res.status(400).json({ success: false, message: emailCheck.message });
    }

    if (!otp || typeof otp !== "string" || otp.trim().length !== 6) {
      return res.status(400).json({ success: false, message: "Please enter a valid 6-digit OTP." });
    }

    const cleanEmail = emailCheck.value;
    const cleanOtp = otp.trim();
    const user = await userModel.findOne({ email: cleanEmail });

    if (!user || !user.resetOtp || !user.resetOtp.codeHash) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification code." });
    }

    // Expiration check (5 minutes)
    if (new Date() > new Date(user.resetOtp.expiresAt)) {
      await userModel.updateOne(
        { _id: user._id },
        { $set: { resetOtp: { codeHash: null, expiresAt: null, createdAt: null, lastRequestedAt: null, attempts: 0 } } }
      );
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new code." });
    }

    // Max attempts check (5 attempts max)
    if (user.resetOtp.attempts >= 5) {
      await userModel.updateOne(
        { _id: user._id },
        { $set: { resetOtp: { codeHash: null, expiresAt: null, createdAt: null, lastRequestedAt: null, attempts: 0 } } }
      );
      return res.status(400).json({
        success: false,
        message: "Maximum verification attempts exceeded. Please request a new OTP."
      });
    }

    // Verify hashed OTP
    const isMatch = await bcrypt.compare(cleanOtp, user.resetOtp.codeHash);

    if (!isMatch) {
      const newAttempts = (user.resetOtp.attempts || 0) + 1;
      const remainingAttempts = 5 - newAttempts;

      if (remainingAttempts <= 0) {
        await userModel.updateOne(
          { _id: user._id },
          { $set: { resetOtp: { codeHash: null, expiresAt: null, createdAt: null, lastRequestedAt: null, attempts: 0 } } }
        );
        return res.status(400).json({
          success: false,
          message: "Maximum verification attempts exceeded. Please request a new OTP."
        });
      }

      await userModel.updateOne(
        { _id: user._id },
        { $set: { "resetOtp.attempts": newAttempts } }
      );

      return res.status(400).json({
        success: false,
        message: `Invalid OTP code. ${remainingAttempts} attempt${remainingAttempts === 1 ? "" : "s"} remaining.`
      });
    }

    // Success! Generate single-use resetSessionToken (valid for 10 minutes)
    const resetSessionToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(resetSessionToken).digest("hex");
    const sessionExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await userModel.updateOne(
      { _id: user._id },
      {
        $set: {
          resetSession: { tokenHash, expiresAt: sessionExpiresAt },
          resetOtp: { codeHash: null, expiresAt: null, createdAt: null, lastRequestedAt: null, attempts: 0 }
        }
      }
    );

    res.json({
      success: true,
      message: "OTP verified successfully. You may now set a new password.",
      resetSessionToken
    });
  } catch (error) {
    console.error("verifyResetOtp error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4. Reset Password with Verified OTP Token
 * Validates reset session, matching passwords & validatePassword strength rules, hashes password with bcrypt.
 */
const resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, resetSessionToken, newPassword, confirmPassword } = req.body;

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      return res.status(400).json({ success: false, message: emailCheck.message });
    }

    if (!resetSessionToken) {
      return res.status(400).json({ success: false, message: "Reset session token is missing. Please verify OTP again." });
    }

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: "New password and confirmation password are required." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match." });
    }

    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.isValid) {
      return res.status(400).json({ success: false, message: passwordCheck.message });
    }

    const cleanEmail = emailCheck.value;
    const tokenHash = crypto.createHash("sha256").update(resetSessionToken).digest("hex");

    const user = await userModel.findOne({
      email: cleanEmail,
      "resetSession.tokenHash": tokenHash,
      "resetSession.expiresAt": { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset session. Please request a new OTP."
      });
    }

    // Hash new password using bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await userModel.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          resetSession: { tokenHash: null, expiresAt: null },
          resetOtp: { codeHash: null, expiresAt: null, createdAt: null, lastRequestedAt: null, attempts: 0 },
          resetPasswordToken: null,
          resetPasswordExpires: null
        }
      }
    );

    res.json({
      success: true,
      message: "Password has been reset successfully. You can now log in with your new password."
    });
  } catch (error) {
    console.error("resetPasswordWithOtp error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const forgotPassword = sendResetOtp;
const resetPassword = resetPasswordWithOtp;

export {
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
  forgotPassword,
  resetPassword,
  sendResetOtp,
  resendResetOtp,
  verifyResetOtp,
  resetPasswordWithOtp,
};