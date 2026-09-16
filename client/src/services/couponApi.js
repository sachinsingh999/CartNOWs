import apiClient from "./apiClient";

export const couponApi = {
  // Get all active public coupons
  getCoupons: async () => {
    const res = await apiClient.get("/api/coupon/list");
    return res.data;
  },

  // Apply / validate coupon against cart
  applyCoupon: async (couponPayload) => {
    // Can be { code, purchaseAmount, ... }
    const res = await apiClient.post("/api/coupon/apply", couponPayload);
    return res.data;
  },
};

export default couponApi;
