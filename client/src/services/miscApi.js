import apiClient from "./apiClient";

export const invoiceApi = {
  getMyInvoices: async () => {
    const res = await apiClient.get("/api/invoice/my-invoices");
    return res.data;
  },

  getDownloadUrl: (invoiceId, token) => {
    const baseUrl = apiClient.defaults.baseURL || "";
    return `${baseUrl}/api/invoice/download/${invoiceId}?token=${encodeURIComponent(token || localStorage.getItem("token") || "")}`;
  },
};

export const serviceApi = {
  // Returns & Help requests
  getUserReturns: async () => {
    const res = await apiClient.get("/api/service/returns/user");
    return res.data;
  },

  createReturnRequest: async (returnData) => {
    const res = await apiClient.post("/api/service/returns/create", returnData);
    return res.data;
  },

  getUserHelpRequests: async () => {
    const res = await apiClient.get("/api/service/help/user");
    return res.data;
  },

  createHelpRequest: async (helpData) => {
    const res = await apiClient.post("/api/service/help/create", helpData);
    return res.data;
  },
};

export const rmsApi = {
  getMyRequests: async () => {
    const res = await apiClient.get("/api/rms/request/my-requests");
    return res.data;
  },

  createRequest: async (requestData) => {
    const res = await apiClient.post("/api/rms/request/create", requestData);
    return res.data;
  },

  getRMAList: async () => {
    const res = await apiClient.get("/api/rms/rma/list");
    return res.data;
  },

  getRMADetails: async (rmaId) => {
    const res = await apiClient.get(`/api/rms/rma/${rmaId}`);
    return res.data;
  },
};

export const socialApi = {
  getFeed: async (params) => {
    const res = await apiClient.get("/api/social", { params });
    return res.data;
  },

  createPost: async (formData) => {
    const res = await apiClient.post("/api/social", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  likePost: async (postId) => {
    const res = await apiClient.post(`/api/social/${postId}/like`);
    return res.data;
  },

  addComment: async (postId, text) => {
    const res = await apiClient.post(`/api/social/${postId}/comment`, { text });
    return res.data;
  },

  getComments: async (postId) => {
    const res = await apiClient.get(`/api/social/${postId}/comments`);
    return res.data;
  },

  getPurchasedProducts: async () => {
    const res = await apiClient.get("/api/social/purchased");
    return res.data;
  },

  getTrendingHashtags: async () => {
    const res = await apiClient.get("/api/social/trending-hashtags");
    return res.data;
  },

  getSuggestedCreators: async () => {
    const res = await apiClient.get("/api/social/suggested-creators");
    return res.data;
  },

  getTopPicks: async () => {
    const res = await apiClient.get("/api/social/top-picks");
    return res.data;
  },

  toggleFollowUser: async (targetUserId) => {
    const res = await apiClient.post(`/api/social/user/${targetUserId}/follow`);
    return res.data;
  },

  getStories: async () => {
    const res = await apiClient.get("/api/social/stories");
    return res.data;
  },

  createStory: async (formData) => {
    const res = await apiClient.post("/api/social/stories", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};

export const tryOnApi = {
  uploadImage: async (formData) => {
    const res = await apiClient.post("/api/tryon/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  generateTryOn: async (payload) => {
    const res = await apiClient.post("/api/tryon/generate", payload);
    return res.data;
  },

  getTryOnStatus: async (jobId) => {
    const res = await apiClient.get(`/api/tryon/status/${jobId}`);
    return res.data;
  },

  getTryOnHistory: async () => {
    const res = await apiClient.get("/api/tryon/history");
    return res.data;
  },

  deleteTryOnSession: async (id) => {
    const res = await apiClient.delete(`/api/tryon/${id}`);
    return res.data;
  },
};

export const coshopApi = {
  createRoom: async () => {
    const res = await apiClient.post("/api/coshop/create");
    return res.data;
  },

  joinRoom: async (roomId, member) => {
    const res = await apiClient.post("/api/coshop/join", { roomId, member });
    return res.data;
  },

  getRoomState: async (roomId) => {
    const res = await apiClient.get(`/api/coshop/room/${roomId}`);
    return res.data;
  },
};

export const appReviewApi = {
  getAllReviews: async () => {
    const res = await apiClient.get("/api/user/app-reviews");
    return res.data;
  },

  submitReview: async (reviewData) => {
    const res = await apiClient.post("/api/user/app-review", reviewData);
    return res.data;
  },
};
