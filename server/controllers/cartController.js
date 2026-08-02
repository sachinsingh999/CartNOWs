import userModel from "../models/userModel.js";
import { trackCartAdd } from "../utils/analyticsHelper.js";

// Helper to construct serialized key
const getCartKey = (itemId, size, selectedAttributes) => {
  let suffix = size || "";
  if (selectedAttributes && typeof selectedAttributes === "object") {
    suffix = Object.keys(selectedAttributes)
      .sort()
      .map(key => `${key}:${selectedAttributes[key]}`)
      .join(",");
  }
  return `${itemId}_${suffix}`;
};

/* ================= ADD TO CART ================= */
const addToCart = async (req, res) => {
  try {
    const { itemId, size, qty, selectedAttributes } = req.body;

    // ✅ auth check
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ ensure cart exists
    const cartData = { ...user.cartData };

    const key = getCartKey(itemId, size, selectedAttributes);
    const addQty = Number(qty) > 0 ? Number(qty) : 1;
    cartData[key] = (cartData[key] || 0) + addQty;

    user.cartData = cartData;
    user.markModified("cartData");
    await user.save();

    // Track cart additions dynamically
    await trackCartAdd(itemId, qty);

    res.json({
      success: true,
      message: "Added to cart",
      cartData: user.cartData,
    });
  } catch (error) {
    console.log("ADD TO CART ERROR 👉", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= GET USER CART ================= */
const getUserCart = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      cartData: user.cartData || {},
    });
  } catch (error) {
    console.log("GET CART ERROR 👉", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= UPDATE CART ================= */
const updateCart = async (req, res) => {
  try {
    const { itemId, size, qty, selectedAttributes } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    const cartData = { ...user.cartData };
    const key = getCartKey(itemId, size, selectedAttributes);

    if (qty === 0) {
      delete cartData[key];
    } else {
      cartData[key] = qty;
    }

    user.cartData = cartData;
    await user.save();

    res.json({
      success: true,
      cartData: user.cartData,
    });
  } catch (error) {
    console.log("UPDATE CART ERROR 👉", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { addToCart, getUserCart, updateCart };
