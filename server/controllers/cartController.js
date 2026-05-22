import userModel from "../models/userModel.js";

/* ================= ADD TO CART ================= */
const addToCart = async (req, res) => {
  try {
    const { itemId, size, qty } = req.body;

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

    const key = `${itemId}_${size}`;
    cartData[key] = (cartData[key] || 0) + qty;

    user.cartData = cartData;
    await user.save();

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
    const { itemId, size, qty } = req.body;

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
    const key = `${itemId}_${size}`;

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
