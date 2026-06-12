import { create } from "zustand";

const useTryOnStore = create((set) => ({
  isOpen: false,
  productId: null,
  uploadedImage: null,
  selectedSize: "M",
  status: "idle", // idle, uploading, validating, processing, completed, failed
  progress: 0,
  message: "",
  generatedImage: null,
  error: null,
  history: [],

  openTryOn: (productId) => set({ 
    isOpen: true, 
    productId, 
    status: "idle", 
    progress: 0, 
    message: "", 
    error: null,
    generatedImage: null 
  }),
  closeTryOn: () => set({ isOpen: false }),
  setUploadedImage: (url) => set({ uploadedImage: url }),
  setSelectedSize: (size) => set({ selectedSize: size }),
  setStatus: (status) => set({ status }),
  setProgress: (progress) => set({ progress }),
  setMessage: (message) => set({ message }),
  setGeneratedImage: (url) => set({ generatedImage: url, status: "completed", progress: 100 }),
  setError: (error) => set({ error, status: "failed" }),
  setHistory: (history) => set({ history }),
  reset: () => set({
    uploadedImage: null,
    status: "idle",
    progress: 0,
    message: "",
    generatedImage: null,
    error: null
  })
}));

export default useTryOnStore;
