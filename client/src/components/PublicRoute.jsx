import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SplashLoader from "./SplashLoader";

const PublicRoute = ({ children }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <SplashLoader />;
  }

  if (isAuthenticated) {
    const targetDashboard = (role && role !== "customer") ? `/${role}/dashboard` : "/";
    return <Navigate to={targetDashboard} replace />;
  }

  return children ? children : <Outlet />;
};

export default PublicRoute;
