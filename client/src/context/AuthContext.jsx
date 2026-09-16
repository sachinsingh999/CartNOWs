import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { authApi } from "../services";
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
    try {
      let data;
      if (selectedRole === "admin") {
        data = await authApi.loginAdmin(email, password);
      } else if (selectedRole === "seller") {
        data = await authApi.loginSeller(email, password);
      } else if (selectedRole === "agent") {
        data = await authApi.loginAgent(email, password);
      } else {
        data = await authApi.login(email, password);
      }

      if (data.success) {
        const receivedToken = data.token;
        const receivedRole = selectedRole;
        let receivedUser = null;

        if (selectedRole === "seller") {
          receivedUser = data.seller;
        } else if (selectedRole === "agent") {
          receivedUser = data.driver;
        } else if (selectedRole === "admin") {
          receivedUser = { email, name: "Administrator", role: "admin" };
        } else {
          // For Customer, fetch profile
          const profileData = await authApi.getProfile(receivedToken);
          if (profileData.success) {
            receivedUser = profileData.user;
          } else {
            return { success: false, message: profileData.message || "Failed to fetch user profile" };
          }
        }

        localStorage.setItem("token", receivedToken);
        localStorage.setItem("role", receivedRole);
        localStorage.setItem("user", JSON.stringify(receivedUser));

        setToken(receivedToken);
        setRole(receivedRole);
        setUser(receivedUser);

        toast.success(data.message || "Login successful");
        return { success: true, token: receivedToken, role: receivedRole };
      } else {
        return { success: false, message: data.message || "Login failed" };
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
          const resData = await authApi.getProfile(token);
          if (resData.success) {
            setUser(resData.user);
            localStorage.setItem("user", JSON.stringify(resData.user));
          } else {
            logout();
          }
        } else if (role === "seller") {
          const resData = await authApi.getSellerProfile(token);
          if (resData.success) {
            setUser(resData.seller);
            localStorage.setItem("user", JSON.stringify(resData.seller));
          } else {
            logout();
          }
        } else if (role === "agent") {
          const resData = await authApi.getAgentStats(token);
          if (!resData.success) {
            logout();
          }
        } else if (role === "admin") {
          const payload = JSON.parse(atob(token.split(".")[1]));
          if (payload.role !== "admin") {
            logout();
          }
        }
      } catch (err) {
        console.warn("Token background verification warning:", err.message);
        // Only logout if explicit 401/403 unauthorized, not on network timeout / cold start!
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [token, role]);

  const authContextValue = useMemo(
    () => ({
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
    }),
    [token, role, user, loading]
  );

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
