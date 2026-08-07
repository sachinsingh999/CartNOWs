import React from "react";
import { Route, Routes, Navigate, useOutletContext } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Context providers
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Layout & Components
import Login from "./components/Login";
import AdminLayout from "./components/AdminLayout";

// Page Components
import Dashboard from "./pages/Dashboard";
import List from "./pages/List";
import Orders from "./pages/Orders";
import Returns from "./pages/Returns";
import Deliverymen from "./pages/Deliverymen";
import Support from "./pages/Support";
import Sales from "./pages/Sales";
import Coupons from "./pages/Coupons";
import Categories from "./pages/Categories";
import CollectionsBrands from "./pages/CollectionsBrands";
import Sellers from "./pages/Sellers";
import Customers from "./pages/Customers";
import ProductModeration from "./pages/ProductModeration";
import Finance from "./pages/Finance";
import NotificationsAdmin from "./pages/NotificationsAdmin";
import AuditLogs from "./pages/AuditLogs";
import Profile from "./pages/Profile";
import InvoiceManagement from "./pages/InvoiceManagement";
import SystemSettings from "./pages/SystemSettings";
import HeroSlideshow from "./pages/HeroSlideshow";
import Banners from "./pages/Banners";
import DealOfTheDay from "./pages/DealOfTheDay";

// Wrapper to bridge React Router Outlet Context to component props without changing component files
const RouteWrapper = ({ Component }) => {
  const context = useOutletContext();
  return <Component {...context} />;
};

const AppContent = () => {
  const { theme } = useTheme();
  const { token, setToken } = useAuth();

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen flex flex-col antialiased text-slate-800 dark:text-slate-100 selection:bg-blue-500/30 w-full">
      <ToastContainer theme={theme} />

      {token === "" ? (
        <Routes>
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <Routes>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<RouteWrapper Component={Dashboard} />} />
            <Route path="/list" element={<RouteWrapper Component={List} />} />
            <Route path="/orders" element={<RouteWrapper Component={Orders} />} />
            <Route path="/returns" element={<RouteWrapper Component={Returns} />} />
            <Route path="/deliverymen" element={<RouteWrapper Component={Deliverymen} />} />
            <Route path="/support" element={<RouteWrapper Component={Support} />} />
            <Route path="/sales" element={<RouteWrapper Component={Sales} />} />
            <Route path="/coupons" element={<RouteWrapper Component={Coupons} />} />
            <Route path="/categories" element={<RouteWrapper Component={Categories} />} />
            <Route path="/collections-brands" element={<RouteWrapper Component={CollectionsBrands} />} />
            <Route path="/sellers" element={<RouteWrapper Component={Sellers} />} />
            <Route path="/customers" element={<RouteWrapper Component={Customers} />} />
            <Route path="/product-moderation" element={<RouteWrapper Component={ProductModeration} />} />
            <Route path="/finance" element={<RouteWrapper Component={Finance} />} />
            <Route path="/notifications" element={<RouteWrapper Component={NotificationsAdmin} />} />
            <Route path="/logs" element={<RouteWrapper Component={AuditLogs} />} />
            <Route path="/invoices" element={<RouteWrapper Component={InvoiceManagement} />} />
            <Route path="/profile" element={<RouteWrapper Component={Profile} />} />
            <Route path="/settings" element={<RouteWrapper Component={SystemSettings} />} />
            <Route path="/hero-slideshow" element={<RouteWrapper Component={HeroSlideshow} />} />
            <Route path="/banners" element={<RouteWrapper Component={Banners} />} />
            <Route path="/deal-of-the-day" element={<RouteWrapper Component={DealOfTheDay} />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
