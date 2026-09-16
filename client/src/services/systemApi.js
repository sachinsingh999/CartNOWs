import apiClient from "./apiClient";

export const systemApi = {
  // Maintenance status
  getMaintenanceStatus: async (timeout = 1500) => {
    const res = await apiClient.get("/api/system/maintenance", { timeout });
    return res.data;
  },

  // Contact form submission
  sendContactMessage: async (contactData) => {
    const res = await apiClient.post("/api/system/contact", contactData);
    return res.data;
  },

  // Hero assets
  getHeroAssets: async () => {
    const res = await apiClient.get("/api/system/hero-assets");
    return res.data;
  },

  // Homepage Banners
  getBanners: async () => {
    const res = await apiClient.get("/api/banners");
    return res.data;
  },

  // Promo Banners (Countdown / Flash bar)
  getActivePromoBanner: async (placement) => {
    const params = placement ? { placement } : {};
    const res = await apiClient.get("/api/promo-banners/active", { params });
    return res.data;
  },

  // Deals of the day
  getDealsOfDay: async () => {
    const res = await apiClient.get("/api/dealofday");
    return res.data;
  },
};

export default systemApi;
