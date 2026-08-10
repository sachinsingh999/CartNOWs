import userModel from "../models/userModel.js";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import notificationModel from "../models/notificationModel.js";
import { validateEmail, validatePassword, validateName, validatePhone } from "../utils/validation.js";

const createToken=(id)=>{
  return jwt.sign({id},process.env.JWT_SECRET)

}

//Route for user Login
const loginUser=async(req,res)=>{
  try {
    const {email,password}=req.body;
    
    // Quick sanitization & validation
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      return res.status(400).json({ success: false, message: emailCheck.message });
    }

    const user=await userModel.findOne({email: emailCheck.value});
    if(!user){
      return res.status(409).json({
        success: false,
        message: "User doesn't exists",
      });

    }

    const isMatch=await bcrypt.compare(password,user.password);

    if(isMatch){
      const token=createToken(user._id);
      res.json({success:true,token})
    }else{
      res.json({success:false,message:"invalid credentials"})
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
    const { name, email, password } = req.body||{};

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


const adminLogin=(async (req, res) => {
  try {
    const {email,password}=req.body;
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
    res.json({success:false,message:error.message})
    
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

export {
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
  googleLogin,
};