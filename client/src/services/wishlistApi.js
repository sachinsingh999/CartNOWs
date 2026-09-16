import apiClient from "./apiClient";

export const wishlistApi = {
  // Get user wishlist
  getWishlist: async () => {
    const res = await apiClient.post("/api/wishlist/get", {});
    return res.data;
  },

  // Toggle item in wishlist
  toggleWishlist: async (itemId) => {
    const res = await apiClient.post("/api/wishlist/toggle", { itemId });
    return res.data;
  },
};

export default wishlistApi;
