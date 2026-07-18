import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SplashLoader from "./SplashLoader";

const PublicRoute = ({ children }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <SplashLoader />;
  }

  if (isAuthenticated) {
    const from = location.state?.from;
    if (from) {
      const path = typeof from === "string"
        ? from
        : `${from.pathname || "/"}${from.search || ""}${from.hash || ""}`;
      const targetState = typeof from === "object" ? from.state : undefined;
      return <Navigate to={path} state={targetState} replace />;
    }

    const targetDashboard = (role && role !== "customer") ? `/${role}/dashboard` : "/";
    return <Navigate to={targetDashboard} replace />;
  }

  return children ? children : <Outlet />;
};

export default PublicRoute;
