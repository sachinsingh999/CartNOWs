import apiClient from "./apiClient";

export const productApi = {
  // Get all products / filtered list
  getProducts: async (params) => {
    const res = await apiClient.get("/api/product/list", { params });
    return res.data;
  },

  // Get single product details
  getSingleProduct: async (id) => {
    const res = await apiClient.get(`/api/product/single/${id}`);
    return res.data;
  },

  // Bulk product details (used in cart / wishlist hydration)
  getBulkProducts: async (ids) => {
    const res = await apiClient.post("/api/product/bulk", { ids });
    return res.data;
  },

  // Categories, Collections, Brands
  getCategories: async () => {
    const res = await apiClient.get("/api/product/categories");
    return res.data;
  },

  getCollections: async () => {
    const res = await apiClient.get("/api/product/collections");
    return res.data;
  },

  getBrands: async () => {
    const res = await apiClient.get("/api/product/brands");
    return res.data;
  },

  getCategoryTemplate: async (id) => {
    const res = await apiClient.get(`/api/product/category/${id}/template`);
    return res.data;
  },

  // Homepage curated bundle
  getHomepageData: async () => {
    const res = await apiClient.get("/api/product/homepage");
    return res.data;
  },

  // Search & Suggestions
  getSearchSuggestions: async (query) => {
    const res = await apiClient.get("/api/product/search-suggestions", {
      params: { q: query },
    });
    return res.data;
  },

  // Featured products
  getFeaturedProducts: async () => {
    const res = await apiClient.get("/api/product/featured");
    return res.data;
  },

  // Analytics view tracking
  trackView: async (productId, meta = {}) => {
    const res = await apiClient.post("/api/product/track-view", {
      productId,
      ...meta,
    });
    return res.data;
  },

  // Product Review
  addReview: async (productId, reviewData) => {
    const res = await apiClient.post(`/api/product/review/${productId}`, reviewData);
    return res.data;
  },
};

export default productApi;
