import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

// Context providers
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Layout & Components
import Landing from "./pages/Landing";
import Login from "./components/Login";
import SignUp from "./pages/SignUp";
import SellerLayout from "./components/SellerLayout";

// Page Components
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import Orders from "./pages/Orders";
import Inventory from "./pages/Inventory";
import Revenue from "./pages/Revenue";
import Analytics from "./pages/Analytics";
import SellerInvoices from "./pages/SellerInvoices";
import Reviews from "./pages/Reviews";
import Returns from "./pages/Returns";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";

import { useOutletContext } from "react-router-dom";

// Wrapper to bridge React Router Outlet Context to component props without changing component files
const RouteWrapper = ({ Component }) => {
  const context = useOutletContext();
  return <Component {...context} />;
};

const AppContent = () => {
  const { theme } = useTheme();
  const { token, setToken, setSeller } = useAuth();

  return (
    <div className={`bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen flex flex-col antialiased transition-colors duration-200 ${token ? "h-[100dvh] overflow-hidden" : ""}`}>
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

      {!token ? (
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login setToken={setToken} setSeller={setSeller} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : (
        <Routes>
          <Route element={<SellerLayout />}>
            <Route path="/" element={<RouteWrapper Component={Dashboard} />} />
            <Route path="/products" element={<RouteWrapper Component={Products} />} />
            <Route path="/add-product" element={<RouteWrapper Component={AddProduct} />} />
            <Route path="/orders" element={<RouteWrapper Component={Orders} />} />
            <Route path="/inventory" element={<RouteWrapper Component={Inventory} />} />
            <Route path="/revenue" element={<RouteWrapper Component={Revenue} />} />
            <Route path="/analytics" element={<RouteWrapper Component={Analytics} />} />
            <Route path="/invoices" element={<RouteWrapper Component={SellerInvoices} />} />
            <Route path="/reviews" element={<RouteWrapper Component={Reviews} />} />
            <Route path="/returns" element={<RouteWrapper Component={Returns} />} />
            <Route path="/notifications" element={<RouteWrapper Component={Notifications} />} />
            <Route path="/profile" element={<RouteWrapper Component={Profile} />} />
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
