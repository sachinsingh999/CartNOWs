import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const AuthContext = createContext(null);

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    if (!payload.exp) return false;
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem("seller_token") || ""
  );
  const [seller, setSeller] = useState(
    JSON.parse(localStorage.getItem("seller_info")) || null
  );

  const navigate = useNavigate();

  const logout = useCallback(() => {
    setToken("");
    setSeller(null);
    localStorage.removeItem("seller_token");
    localStorage.removeItem("seller_info");
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem("seller_token", token);
    if (seller) {
      localStorage.setItem("seller_info", JSON.stringify(seller));
    } else {
      localStorage.removeItem("seller_info");
    }
  }, [token, seller]);

  useEffect(() => {
    if (token) {
      if (isTokenExpired(token)) {
        toast.error("Session expired. Please log in again.");
        logout();
      }
    }
  }, [token, logout]);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          if (localStorage.getItem("seller_token")) {
            toast.error(error.response.data?.message || "Session expired. Please log in again.");
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [logout]);

  return (
    <AuthContext.Provider value={{ token, setToken, seller, setSeller, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
