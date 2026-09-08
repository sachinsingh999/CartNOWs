import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import axios from "axios";
import { backendUrl } from "../config";
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

  const [liveProfile, setLiveProfile] = useState(null);

  // Parse token payload for immediate local state
  const tokenPayload = useMemo(() => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return {
        id: payload.id || "superadmin",
        name: payload.name || (payload.role === "admin" ? "Superadmin" : "Staff Member"),
        email: payload.email || "",
        role: payload.role || (payload.email?.includes("admin") ? "superadmin" : "subadmin"),
        permissions: payload.permissions || (payload.role === "admin" ? ["*"] : []),
      };
    } catch (e) {
      return null;
    }
  }, [token]);

  // Merge live profile from database if available, else use token payload
  const adminData = useMemo(() => {
    if (!token) return null;
    if (liveProfile) {
      return {
        id: liveProfile.id || liveProfile._id,
        name: liveProfile.name || tokenPayload?.name || "Staff Member",
        email: liveProfile.email || tokenPayload?.email || "",
        role: liveProfile.role || tokenPayload?.role || "subadmin",
        permissions: liveProfile.permissions || tokenPayload?.permissions || [],
      };
    }
    return tokenPayload;
  }, [token, tokenPayload, liveProfile]);

  // Synchronize live profile from server whenever token changes
  useEffect(() => {
    if (!token) {
      setLiveProfile(null);
      return;
    }

    let isMounted = true;
    const fetchLiveProfile = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/subadmins/me`, {
          headers: { token },
        });
        if (isMounted && res.data?.success && res.data.admin) {
          setLiveProfile(res.data.admin);
        }
      } catch (err) {
        // If suspended or unauthorized, clear session
        if (err.response?.status === 401 || err.response?.status === 403) {
          toast.error(err.response?.data?.message || "Session unauthorized");
          setToken("");
          localStorage.removeItem("token");
        }
      }
    };

    fetchLiveProfile();

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Expiration timer
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

  // Strict superadmin check: NEVER true for role "subadmin"
  const isSuperAdmin = useMemo(() => {
    if (!adminData) return false;
    if (adminData.role === "subadmin") return false;
    return (
      adminData.role === "superadmin" ||
      adminData.role === "admin" ||
      (Array.isArray(adminData.permissions) && adminData.permissions.includes("*"))
    );
  }, [adminData]);

  // Strict permission check
  const hasPermission = (permissionKey) => {
    if (!adminData) return false;
    if (isSuperAdmin) return true;
    if (adminData.role === "subadmin") {
      return Array.isArray(adminData.permissions) && adminData.permissions.includes(permissionKey);
    }
    return false;
  };

  // Compute default authorized landing route for this staff member
  const defaultRoute = useMemo(() => {
    if (!adminData) return "/login";
    if (isSuperAdmin) return "/";
    const perms = adminData.permissions || [];
    if (perms.includes("orders")) return "/orders";
    if (perms.includes("returns")) return "/returns";
    if (perms.includes("products")) return "/list";
    if (perms.includes("deliverymen")) return "/deliverymen";
    if (perms.includes("sellers")) return "/sellers";
    if (perms.includes("customers")) return "/customers";
    if (perms.includes("support")) return "/support";
    if (perms.includes("finance")) return "/finance";
    if (perms.includes("promos")) return "/sales";
    if (perms.includes("subadmins")) return "/sub-admins";
    return "/profile";
  }, [adminData, isSuperAdmin]);

  const logout = () => {
    setToken("");
    setLiveProfile(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        adminData,
        hasPermission,
        isSuperAdmin,
        defaultRoute,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
