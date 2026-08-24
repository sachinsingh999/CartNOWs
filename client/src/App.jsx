import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
          toastClassName={(context) => {
            const type = context?.type || "default";
            let bgClasses = "bg-slate-900/95 text-white border-slate-700/80 shadow-slate-950/60";
            if (type === "success") {
              bgClasses = "bg-slate-900/95 text-emerald-400 border-emerald-500/50 shadow-emerald-950/50";
            } else if (type === "error") {
              bgClasses = "bg-slate-900/95 text-rose-400 border-rose-500/50 shadow-rose-950/50";
            } else if (type === "info") {
              bgClasses = "bg-slate-900/95 text-sky-400 border-sky-500/50 shadow-sky-950/50";
            } else if (type === "warning") {
              bgClasses = "bg-slate-900/95 text-amber-400 border-amber-500/50 shadow-amber-950/50";
            }
            return `relative flex items-center justify-between gap-3 min-h-[56px] w-[360px] max-w-[calc(100vw-32px)] rounded-2xl p-4 mb-3 cursor-pointer select-none transition-all duration-300 hover:scale-[1.02] active:scale-[0.99] border backdrop-blur-2xl shadow-2xl ${bgClasses}`;
          }}
          bodyClassName={() =>
            "flex-1 text-xs font-bold leading-relaxed text-slate-100 tracking-wide flex items-center gap-2"
          }
          closeButton={({ closeToast }) => (
            <button
              onClick={closeToast}
              className="ml-2 shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer text-xs font-black active:scale-90"
              aria-label="Close notification"
            >
              ✕
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
