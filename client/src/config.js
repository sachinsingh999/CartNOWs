export const backendUrl = import.meta.env.VITE_BACKEND_URL || 
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" 
    ? "http://localhost:4000" 
    : "https://cartnows.onrender.com");
