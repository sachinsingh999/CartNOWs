import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

// Context providers
import { SystemProvider } from "./context/SystemContext";

// Modular structural components
import ErrorBoundary from "./components/ErrorBoundary";
import MainLayout from "./components/MainLayout";

// Auth guards and role dashboards
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

// Lazy loaded page components
const Home = React.lazy(() => import("./pages/Home"));
const About = React.lazy(() => import("./pages/About"));
const Product = React.lazy(() => import("./pages/Product"));
const AudienceCatalog = React.lazy(() => import("./pages/AudienceCatalog"));
const CatalogDetail = React.lazy(() => import("./pages/CatalogDetail"));
const Login = React.lazy(() => import("./pages/Login"));
const Signup = React.lazy(() => import("./pages/Signup"));
const ProductDetail = React.lazy(() => import("./pages/ProductDetail"));
const Cart = React.lazy(() => import("./pages/Cart"));
const PlaceOrder = React.lazy(() => import("./pages/PlaceOrder"));
const Orderdetail = React.lazy(() => import("./pages/Orderdetail"));
const SingleOrderDetail = React.lazy(() => import("./pages/SingleOrderDetail"));
const Track = React.lazy(() => import("./pages/Track"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Help = React.lazy(() => import("./pages/Help"));
const TryOn = React.lazy(() => import("./pages/TryOn"));
const Verify = React.lazy(() => import("./pages/Verify"));
const OrderConfirmed = React.lazy(() => import("./pages/OrderConfirmed"));
const Wishlist = React.lazy(() => import("./pages/Wishlist"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Discover = React.lazy(() => import("./pages/Discover"));
const Categories = React.lazy(() => import("./pages/Categories"));
const Collections = React.lazy(() => import("./pages/Collections"));
const Brands = React.lazy(() => import("./pages/Brands"));
const MobileShowcase = React.lazy(() => import("./pages/MobileShowcase"));
const SocialFeed = React.lazy(() => import("./pages/SocialFeed"));
const SassHome = React.lazy(() => import("./pages/SassHome"));
const RMADetail = React.lazy(() => import("./pages/RMADetail"));
const TermsAndPolicy = React.lazy(() => import("./pages/TermsAndPolicy"));

const App = () => {
  return (
    <SystemProvider>
      <ErrorBoundary>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          pauseOnFocusLoss={false}
          draggable
          transition={Slide}
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

        <Suspense fallback={
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-950 text-slate-500 font-mono text-xs uppercase tracking-widest">
            <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-slate-800 dark:border-slate-800 dark:border-t-slate-300 animate-spin" />
            <span>Loading Page...</span>
          </div>
        }>
          <Routes>
            {/* Main Application Layout wrapper */}
            <Route element={<MainLayout />}>
              {/* Public / Unprotected routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/product" element={<Product />} />
              <Route path="/products" element={<Product />} />
              <Route path="/product/men" element={<AudienceCatalog audience="men" />} />
              <Route path="/product/women" element={<AudienceCatalog audience="women" />} />
              <Route path="/product/kid" element={<AudienceCatalog audience="kids" />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/help" element={<Help />} />
              <Route path="/catalog/:type/:slug" element={<CatalogDetail />} />
              <Route path="/catalog/collection/:slug" element={<CatalogDetail type="collection" />} />
              <Route path="/catalog/category/:slug" element={<CatalogDetail type="category" />} />
              <Route path="/catalog/brand/:slug" element={<CatalogDetail type="brand" />} />
              <Route path="/category/:slug" element={<CatalogDetail type="category" />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/categories/:slug" element={<CatalogDetail type="category" />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/collections/:slug" element={<CatalogDetail type="collection" />} />
              <Route path="/brands" element={<Brands />} />
              <Route path="/brands/:slug" element={<CatalogDetail type="brand" />} />
              <Route path="/mobile" element={<MobileShowcase />} />
              <Route path="/social" element={<SocialFeed />} />
              <Route path="/saas" element={<SassHome />} />
              <Route path="/terms" element={<TermsAndPolicy />} />
              <Route path="/privacy" element={<TermsAndPolicy />} />
              <Route path="/policy" element={<TermsAndPolicy />} />
              <Route path="/terms-and-policy" element={<TermsAndPolicy />} />

              {/* Auth Guest-Only Routes */}
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/register" element={<Signup />} />
              </Route>

              {/* Customer Private Routes */}
              <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
                <Route path="/cart" element={<Cart />} />
                <Route path="/placeorder" element={<PlaceOrder />} />
                <Route path="/orderdetail" element={<Orderdetail />} />
                <Route path="/order/:orderId" element={<SingleOrderDetail />} />
                <Route path="/track" element={<Track />} />
                <Route path="/track/:id" element={<Track />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/tryon" element={<TryOn />} />
                <Route path="/verify" element={<Verify />} />
                <Route path="/order-confirmed/:orderId" element={<OrderConfirmed />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/rma/:rmaId" element={<RMADetail />} />
              </Route>
            </Route>

            {/* Wildcard NotFound Route (outside of MainLayout to hide Navbar/Footer automatically) */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </SystemProvider>
  );
};

export default App;
