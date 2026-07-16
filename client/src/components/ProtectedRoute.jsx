import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SplashLoader from "./SplashLoader";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <SplashLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    const targetDashboard = (role && role !== "customer") ? `/${role}/dashboard` : "/";
    return <Navigate to={targetDashboard} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
