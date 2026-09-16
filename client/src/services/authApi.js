import apiClient from "./apiClient";

export const authApi = {
  // Login customer / general
  login: async (email, password) => {
    const res = await apiClient.post("/api/user/login", { email, password });
    return res.data;
  },

  // Role-specific logins
  loginAdmin: async (email, password) => {
    const res = await apiClient.post("/api/user/admin", { email, password });
    return res.data;
  },

  loginSeller: async (email, password) => {
    const res = await apiClient.post("/api/seller/login", { email, password });
    return res.data;
  },

  loginAgent: async (email, password) => {
    const res = await apiClient.post("/api/deliveryman/login", { email, password });
    return res.data;
  },

  googleLogin: async (credential) => {
    const res = await apiClient.post("/api/user/google-login", { credential });
    return res.data;
  },

  // Registration
  register: async (userData) => {
    const res = await apiClient.post("/api/user/register", userData);
    return res.data;
  },

  // User Profile
  getProfile: async (customToken) => {
    const config = customToken ? { headers: { Authorization: `Bearer ${customToken}`, token: customToken } } : {};
    const res = await apiClient.get("/api/user/profile", config);
    return res.data;
  },

  updateProfile: async (profileData) => {
    const res = await apiClient.put("/api/user/update-profile", profileData);
    return res.data;
  },

  getMembership: async () => {
    const res = await apiClient.get("/api/user/membership");
    return res.data;
  },

  // Seller / Agent profile checks
  getSellerProfile: async (customToken) => {
    const config = customToken ? { headers: { token: customToken } } : {};
    const res = await apiClient.get("/api/seller/profile", config);
    return res.data;
  },

  getAgentStats: async (customToken) => {
    const config = customToken ? { headers: { token: customToken } } : {};
    const res = await apiClient.get("/api/deliveryman/stats", config);
    return res.data;
  },

  // Address Management
  addAddress: async (addressData) => {
    const res = await apiClient.post("/api/user/add-address", addressData);
    return res.data;
  },

  deleteAddress: async (addressId) => {
    const res = await apiClient.post("/api/user/delete-address", { addressId });
    return res.data;
  },

  // Notifications
  getNotifications: async () => {
    const res = await apiClient.get("/api/user/notifications");
    return res.data;
  },

  markNotificationsRead: async () => {
    const res = await apiClient.post("/api/user/notifications/read");
    return res.data;
  },

  // VIP Security Card
  getVipSecurityStatus: async () => {
    const res = await apiClient.get("/api/user/vip-security/status");
    return res.data;
  },

  setVipSecurityCode: async (code) => {
    const res = await apiClient.post("/api/user/vip-security/set-code", { code });
    return res.data;
  },

  verifyVipSecurityCode: async (code) => {
    const res = await apiClient.post("/api/user/vip-security/verify", { code });
    return res.data;
  },

  changeVipSecurityCode: async (oldCode, newCode) => {
    const res = await apiClient.post("/api/user/vip-security/change-code", { oldCode, newCode });
    return res.data;
  },

  resetVipSecurityCode: async (password, newCode) => {
    const res = await apiClient.post("/api/user/vip-security/reset-code", { password, newCode });
    return res.data;
  },
};

export default authApi;
