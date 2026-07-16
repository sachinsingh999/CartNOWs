import mongoose from "mongoose";
import { validateEmail, validatePhone } from "../utils/validation.js";

const addressSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, default: "" },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  lat: { type: Number, default: 0 },
  lng: { type: Number, default: 0 },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: (v) => validateEmail(v).isValid,
      message: "Invalid email format"
    }
  },

  password: { 
    type: String, 
    required: function() { return this.provider === 'local'; }
  },

  provider: {
    type: String,
    default: "local"
  },

  googleId: {
    type: String,
    default: ""
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  profilePhoto: {
    type: String,
    default: ""
  },

  cartData: { 
    type: Object, 
    default: {} 
  },

  wishlistData: {
    type: Array,
    default: []
  },

  deliveryVerificationKey: {
    type: String,
    default: null
  },

  addresses: {
    type: [addressSchema],
    default: []
  },

  isBlocked: {
    type: Boolean,
    default: false
  },

  activityLogs: {
    type: [
      {
        action: String,
        timestamp: { type: Date, default: Date.now },
        details: String
      }
    ],
    default: []
  },

  appReview: {
    rating: { type: Number, default: 0 },
    comment: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
  },

  followers: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    default: []
  },

  following: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    default: []
  }

},{ minimize:false });

// Pre-save hook to generate unique delivery verification key for the user
userSchema.pre("save", function (next) {
  if (!this.deliveryVerificationKey) {
    this.deliveryVerificationKey = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  if (typeof next === "function") {
    next();
  }
});

const userModel = mongoose.models.user 
  || mongoose.model("user", userSchema);

export default userModel;
