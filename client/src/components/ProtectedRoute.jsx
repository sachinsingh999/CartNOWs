import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SplashLoader from "./SplashLoader";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <SplashLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    const targetDashboard = (role && role !== "customer") ? `/${role}/dashboard` : "/";
    return <Navigate to={targetDashboard} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
