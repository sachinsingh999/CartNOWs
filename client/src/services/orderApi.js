import apiClient from "./apiClient";

export const orderApi = {
  // Place Order (COD / Standard)
  placeOrder: async (orderData) => {
    const res = await apiClient.post("/api/order/place", orderData);
    return res.data;
  },

  // Payment gateways
  placeStripeOrder: async (orderData) => {
    const res = await apiClient.post("/api/order/stripe", orderData);
    return res.data;
  },

  placeRazorpayOrder: async (orderData) => {
    const res = await apiClient.post("/api/order/rozorpay", orderData);
    return res.data;
  },

  verifyStripe: async (data) => {
    const res = await apiClient.post("/api/order/verifyStripe", data);
    return res.data;
  },

  verifyRazorpay: async (data) => {
    const res = await apiClient.post("/api/order/verifyRazorpay", data);
    return res.data;
  },

  // User Orders
  getUserOrders: async () => {
    const res = await apiClient.post("/api/order/userOrder", {});
    return res.data;
  },

  getOrderById: async (orderId) => {
    const res = await apiClient.get(`/api/order/${orderId}`);
    return res.data;
  },

  // Cancel / Return items
  cancelOrder: async (orderId, reason) => {
    const res = await apiClient.post("/api/order/cancel", { orderId, reason });
    return res.data;
  },

  cancelOrderItem: async (orderId, itemId, reason) => {
    const res = await apiClient.post("/api/order/cancel-item", { orderId, itemId, reason });
    return res.data;
  },

  returnOrderItem: async (orderId, itemId, reason) => {
    const res = await apiClient.post("/api/order/return-item", { orderId, itemId, reason });
    return res.data;
  },
};

export default orderApi;
