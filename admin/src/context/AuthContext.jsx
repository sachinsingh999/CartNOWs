import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem("token") || "";
    if (savedToken) {
      try {
        const payload = JSON.parse(atob(savedToken.split(".")[1]));
        const expTime = payload.exp * 1000;
        if (Date.now() >= expTime) {
          localStorage.removeItem("token");
          return "";
        }
      } catch (e) {
        localStorage.removeItem("token");
        return "";
      }
    }
    return savedToken;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const expTime = payload.exp * 1000;
        const timeRemaining = expTime - Date.now();
        
        if (timeRemaining <= 0) {
          setToken("");
          localStorage.removeItem("token");
        } else {
          const timer = setTimeout(() => {
            setToken("");
            localStorage.removeItem("token");
            toast.warn("Your session has expired. Please log in again.");
          }, timeRemaining);
          return () => clearTimeout(timer);
        }
      } catch (e) {
        setToken("");
        localStorage.removeItem("token");
      }
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  const logout = () => {
    setToken("");
  };

  return (
    <AuthContext.Provider value={{ token, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
