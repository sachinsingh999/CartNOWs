import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [role, setRole] = useState(() => localStorage.getItem("role") || "");
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Synchronous initial loading check:
  // If there's no token, we are immediately not loading.
  // If there is, we stay in loading=true until verify completes.
  useEffect(() => {
    if (!token) {
      setLoading(false);
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    setToken("");
    setRole("");
    setUser(null);
    toast.info("Logged out successfully");
  };

  const login = async (email, password, selectedRole) => {
    let endpoint = "";
    if (selectedRole === "admin") {
      endpoint = `${backendUrl}/api/user/admin`;
    } else if (selectedRole === "seller") {
      endpoint = `${backendUrl}/api/seller/login`;
    } else if (selectedRole === "agent") {
      endpoint = `${backendUrl}/api/deliveryman/login`;
    } else {
      endpoint = `${backendUrl}/api/user/login`;
    }

    try {
      const response = await axios.post(endpoint, { email, password });
      if (response.data.success) {
        const receivedToken = response.data.token;
        const receivedRole = selectedRole;
        let receivedUser = null;

        if (selectedRole === "seller") {
          receivedUser = response.data.seller;
        } else if (selectedRole === "agent") {
          receivedUser = response.data.driver;
        } else if (selectedRole === "admin") {
          receivedUser = { email, name: "Administrator", role: "admin" };
        } else {
          // For Customer, fetch profile
          const profileRes = await axios.get(`${backendUrl}/api/user/profile`, {
            headers: { Authorization: `Bearer ${receivedToken}` }
          });
          if (profileRes.data.success) {
            receivedUser = profileRes.data.user;
          } else {
            return { success: false, message: profileRes.data.message || "Failed to fetch user profile" };
          }
        }

        localStorage.setItem("token", receivedToken);
        localStorage.setItem("role", receivedRole);
        localStorage.setItem("user", JSON.stringify(receivedUser));

        setToken(receivedToken);
        setRole(receivedRole);
        setUser(receivedUser);

        toast.success(response.data.message || "Login successful");
        return { success: true, token: receivedToken, role: receivedRole };
      } else {
        return { success: false, message: response.data.message || "Login failed" };
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Something went wrong";
      return { success: false, message: msg };
    }
  };

  // Background verification on mount / token change
  useEffect(() => {
    const verifyAuth = async () => {
      if (!token || !role) {
        setLoading(false);
        return;
      }

      try {
        if (role === "customer") {
          const res = await axios.get(`${backendUrl}/api/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem("user", JSON.stringify(res.data.user));
          } else {
            logout();
          }
        } else if (role === "seller") {
          const res = await axios.get(`${backendUrl}/api/seller/profile`, {
            headers: { token: token }
          });
          if (res.data.success) {
            setUser(res.data.seller);
            localStorage.setItem("user", JSON.stringify(res.data.seller));
          } else {
            logout();
          }
        } else if (role === "agent") {
          const res = await axios.get(`${backendUrl}/api/deliveryman/stats`, {
            headers: { token: token }
          });
          if (res.data.success) {
            // Stats call was successful, auth is valid
          } else {
            logout();
          }
        } else if (role === "admin") {
          const payload = JSON.parse(atob(token.split(".")[1]));
          if (payload.role !== "admin") {
            logout();
          }
        }
      } catch (err) {
        console.error("Token verification failed:", err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [token, role]);

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        user,
        loading,
        isAuthenticated: !!token,
        login,
        logout,
        setToken,
        setRole,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
