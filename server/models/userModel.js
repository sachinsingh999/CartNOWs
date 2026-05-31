import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { 
    type: String, 
    required: true, 
    unique: true 
  },

  password: { 
    type: String, 
    required: true 
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
