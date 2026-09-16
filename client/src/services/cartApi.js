import apiClient from "./apiClient";

export const cartApi = {
  // Get user's cart from backend
  getCart: async () => {
    const res = await apiClient.post("/api/cart/get", {});
    return res.data;
  },

  // Add item to cart
  addToCart: async (itemId, size, quantity = 1) => {
    const res = await apiClient.post("/api/cart/add", { itemId, size, quantity });
    return res.data;
  },

  // Update item quantity in cart
  updateCart: async (itemId, size, quantity) => {
    const res = await apiClient.post("/api/cart/update", { itemId, size, quantity });
    return res.data;
  },
};

export default cartApi;
