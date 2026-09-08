import React from "react";
import { Route, Routes, Navigate, useOutletContext, Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, ShieldAlert, ArrowRight } from "lucide-react";

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
import SubAdmins from "./pages/SubAdmins";
import SubAdminProfile from "./pages/SubAdminProfile";

// Access Denied Screen for unauthorized route navigation
const AccessDeniedView = ({ moduleName, permissionKey }) => {
  const { adminData } = useAuth();
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl animate-fadeIn max-w-lg mx-auto mt-8 shadow-2xs">
      <div className="h-16 w-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/60 shadow-xs">
        <ShieldAlert size={32} />
      </div>
      <div className="space-y-2">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60">
          Module Restricted
        </span>
        <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
          Access Denied: {moduleName}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
          Your staff account <span className="font-bold text-slate-800 dark:text-slate-200">({adminData?.email || "staff"})</span> does not have the <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-mono text-[11px] font-bold">'{permissionKey}'</code> permission required to access this area.
        </p>
      </div>

      <div className="flex items-center gap-2.5 pt-3">
        <Link
          to="/profile"
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
        >
          View My Permissions
        </Link>
        <Link
          to={adminData?.permissions?.includes("orders") ? "/orders" : "/"}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
        >
          <span>Authorized View</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
};

// Permission-guarded Route Wrapper
const RouteWrapper = ({ Component, permission, moduleName, superAdminOnly }) => {
  const context = useOutletContext();
  const { isSuperAdmin, hasPermission, defaultRoute } = useAuth();

  // Root Dashboard route ("/") is reserved for Superadmins; sub-admins auto-redirect to their module
  if (!permission && !superAdminOnly && Component === Dashboard && !isSuperAdmin) {
    return <Navigate to={defaultRoute || "/orders"} replace />;
  }

  // Superadmin-only routes
  if (superAdminOnly && !isSuperAdmin) {
    toast.error(`Access Restricted: ${moduleName || "This section"} is reserved for Superadmins.`);
    return <Navigate to={defaultRoute || "/orders"} replace />;
  }

  // Module permission guarded routes
  if (permission && !isSuperAdmin && !hasPermission(permission)) {
    toast.error(`Access Denied: You do not have '${permission}' permission for ${moduleName || "this area"}.`);
    return <Navigate to={defaultRoute || "/orders"} replace />;
  }

  return <Component {...context} />;
};

const AppContent = () => {
  const { theme } = useTheme();
  const { token, setToken } = useAuth();

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen flex flex-col antialiased text-slate-800 dark:text-slate-100 selection:bg-blue-500/30 w-full">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        pauseOnFocusLoss={false}
        draggable
        style={{ zIndex: 999999 }}
        icon={({ type }) => {
          switch (type) {
            case "success":
              return (
                <div className="w-6 h-6 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={13} strokeWidth={2.4} />
                </div>
              );
            case "error":
              return (
                <div className="w-6 h-6 rounded bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                  <AlertCircle size={13} strokeWidth={2.4} />
                </div>
              );
            case "warning":
              return (
                <div className="w-6 h-6 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                  <AlertTriangle size={13} strokeWidth={2.4} />
                </div>
              );
            case "info":
            default:
              return (
                <div className="w-6 h-6 rounded bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
                  <Info size={13} strokeWidth={2.4} />
                </div>
              );
          }
        }}
        closeButton={({ closeToast }) => (
          <button
            onClick={closeToast}
            className="ml-2 shrink-0 p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer flex items-center justify-center"
            aria-label="Close notification"
          >
            <X size={13} strokeWidth={2.2} />
          </button>
        )}
      />

      {token === "" ? (
        <Routes>
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <Routes>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<RouteWrapper Component={Dashboard} />} />
            <Route path="/orders" element={<RouteWrapper Component={Orders} permission="orders" moduleName="Orders Management" />} />
            <Route path="/returns" element={<RouteWrapper Component={Returns} permission="returns" moduleName="Returns & RMA" />} />
            <Route path="/list" element={<RouteWrapper Component={List} permission="products" moduleName="Product Catalog" />} />
            <Route path="/categories" element={<RouteWrapper Component={Categories} permission="products" moduleName="Categories" />} />
            <Route path="/collections-brands" element={<RouteWrapper Component={CollectionsBrands} permission="products" moduleName="Collections & Brands" />} />
            <Route path="/product-moderation" element={<RouteWrapper Component={ProductModeration} permission="products" moduleName="Product Moderation" />} />
            <Route path="/deliverymen" element={<RouteWrapper Component={Deliverymen} permission="deliverymen" moduleName="Delivery Fleet" />} />
            <Route path="/sellers" element={<RouteWrapper Component={Sellers} permission="sellers" moduleName="Sellers & Vendors" />} />
            <Route path="/customers" element={<RouteWrapper Component={Customers} permission="customers" moduleName="Customer Accounts" />} />
            <Route path="/support" element={<RouteWrapper Component={Support} permission="support" moduleName="Support Tickets" />} />
            <Route path="/sales" element={<RouteWrapper Component={Sales} permission="promos" moduleName="Sales & Campaigns" />} />
            <Route path="/coupons" element={<RouteWrapper Component={Coupons} permission="promos" moduleName="Promo Coupons" />} />
            <Route path="/hero-slideshow" element={<RouteWrapper Component={HeroSlideshow} permission="promos" moduleName="Hero Slideshow" />} />
            <Route path="/banners" element={<RouteWrapper Component={Banners} permission="promos" moduleName="Hero Banners" />} />
            <Route path="/deal-of-the-day" element={<RouteWrapper Component={DealOfTheDay} permission="promos" moduleName="Deal of the Day" />} />
            <Route path="/finance" element={<RouteWrapper Component={Finance} permission="finance" moduleName="Finance & Revenue" />} />
            <Route path="/invoices" element={<RouteWrapper Component={InvoiceManagement} permission="finance" moduleName="Invoice Management" />} />
            <Route path="/sub-admins" element={<RouteWrapper Component={SubAdmins} permission="subadmins" moduleName="Staff & Sub-Admins" />} />
            <Route path="/sub-admins/:id" element={<RouteWrapper Component={SubAdminProfile} permission="subadmins" moduleName="Staff Profile" />} />
            <Route path="/profile" element={<RouteWrapper Component={Profile} />} />
            <Route path="/notifications" element={<RouteWrapper Component={NotificationsAdmin} />} />
            <Route path="/settings" element={<RouteWrapper Component={SystemSettings} superAdminOnly moduleName="System Settings" />} />
            <Route path="/logs" element={<RouteWrapper Component={AuditLogs} superAdminOnly moduleName="Audit Logs" />} />
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
