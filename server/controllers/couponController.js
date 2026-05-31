import couponModel from "../models/couponModel.js";

// Create a new coupon (Admin)
export const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, expiryDate } = req.body;

    if (!code || !discountValue) {
      return res.json({ success: false, message: "Code and discount value are required" });
    }

    const existing = await couponModel.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.json({ success: false, message: "Coupon code already exists" });
    }

    const coupon = new couponModel({
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    });

    await coupon.save();
    res.json({ success: true, message: "Coupon created successfully", coupon });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// List all coupons
export const listCoupons = async (req, res) => {
  try {
    const coupons = await couponModel.find({}).sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Toggle active status
export const toggleCoupon = async (req, res) => {
  try {
    const { id } = req.body;
    const coupon = await couponModel.findById(id);

    if (!coupon) {
      return res.json({ success: false, message: "Coupon not found" });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.json({ success: true, message: `Coupon ${coupon.isActive ? "activated" : "deactivated"}`, coupon });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Delete a coupon
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.body;
    const coupon = await couponModel.findByIdAndDelete(id);

    if (!coupon) {
      return res.json({ success: false, message: "Coupon not found" });
    }

    res.json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Apply a coupon at checkout
export const applyCoupon = async (req, res) => {
  try {
    const { code, cartAmount } = req.body;

    if (!code) {
      return res.json({ success: false, message: "Coupon code required" });
    }

    const coupon = await couponModel.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.json({ success: false, message: "Invalid coupon code" });
    }

    if (!coupon.isActive) {
      return res.json({ success: false, message: "Coupon is inactive" });
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.json({ success: false, message: "Coupon has expired" });
    }

    if (cartAmount < coupon.minOrderAmount) {
      return res.json({ 
        success: false, 
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon` 
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = Math.round((cartAmount * coupon.discountValue) / 100);
    } else {
      discountAmount = Math.min(coupon.discountValue, cartAmount);
    }

    res.json({
      success: true,
      message: "Coupon applied successfully",
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      newTotal: cartAmount - discountAmount,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
