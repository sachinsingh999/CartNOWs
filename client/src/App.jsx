import React, { useState, useEffect, useRef, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "./config";
import Lenis from "lenis";
import { ShoppingBag, Truck, ArrowRight, Sparkles, X } from "lucide-react";

// Modular components (eager loaded)
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import ComparisonTray from "./components/ComparisonTray";
import SplashLoader from "./components/SplashLoader";
import Maintenance from "./pages/Maintenance";
import ErrorBoundary from "./components/ErrorBoundary";

// Toastify components (eager loaded)
import { ToastContainer, Slide } from 'react-toastify';
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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

// Auth guards and role dashboards
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";


const App = () => {
  const location = useLocation();
  const [maintenanceSettings, setMaintenanceSettings] = useState(null);
  const [loadingMaintenance, setLoadingMaintenance] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [showPromo, setShowPromo] = useState(false);

  useEffect(() => {
    // Show partnership recruitment widget on mount after 1.2s delay to let the site load and render nicely
    const timer = setTimeout(() => {
      setShowPromo(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const closePromo = () => {
    setShowPromo(false);
  };

  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    });

    lenisRef.current = lenis;

    let frameId;
    const raf = (time) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };

    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
  }, [location.pathname]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  useEffect(() => {
    const updateHeight = () => {
      const header = document.getElementById("main-navbar-header");
      if (header) {
        const height = header.offsetHeight;
        document.documentElement.style.setProperty("--navbar-height", `${height}px`);
      }
    };

    // Run initial update
    updateHeight();

    // ResizeObserver dynamically catches responsive wraps
    const header = document.getElementById("main-navbar-header");
    let observer;
    if (header) {
      observer = new ResizeObserver(() => {
        updateHeight();
      });
      observer.observe(header);
    }

    window.addEventListener("resize", updateHeight);
    const timer = setTimeout(updateHeight, 200);

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener("resize", updateHeight);
      clearTimeout(timer);
    };
  }, [showSplash]);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/system/maintenance`);
        if (data.success) {
          setMaintenanceSettings(data.settings);
        }
      } catch (err) {
        console.error("Failed to fetch maintenance settings:", err);
      } finally {
        setLoadingMaintenance(false);
      }
    };
    checkMaintenance();
  }, []);

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashLoader onComplete={handleSplashComplete} />}
      </AnimatePresence>

      {!loadingMaintenance && maintenanceSettings && maintenanceSettings.enabled && !maintenanceSettings.isWhitelisted ? (
        <Maintenance settings={maintenanceSettings} />
      ) : (
        <div className={`flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-opacity duration-700 ease-out ${showSplash ? "opacity-0 pointer-events-none select-none overflow-hidden h-screen" : "opacity-100"}`}>
          <ScrollToTop />
          <ToastContainer
            position="bottom-right"
            autoClose={1800}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover={false}
            pauseOnFocusLoss={false}
            draggable
            transition={Slide}
            toastClassName={() =>
              "relative flex items-center gap-3 min-h-[52px] w-[340px] rounded-2xl border border-white/10 bg-slate-900 dark:bg-slate-800 text-white shadow-2xl shadow-black/30 px-4 py-3 mb-2 overflow-hidden cursor-pointer select-none"
            }
            bodyClassName={() =>
              "flex-1 text-[13px] font-semibold leading-snug text-slate-100"
            }
            closeButton={({ closeToast }) => (
              <button
                onClick={closeToast}
                className="ml-1 shrink-0 flex items-center justify-center h-5 w-5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer text-xs font-black"
              >
                ✕
              </button>
            )}
          />

          <Navbar />

          {/* MAIN must grow */}
          <main className="flex-1">
            <ErrorBoundary>
              <Suspense fallback={
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-950 text-slate-500 font-mono text-xs uppercase tracking-widest">
                  <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-slate-800 dark:border-slate-800 dark:border-t-slate-300 animate-spin" />
                  <span>Loading Page...</span>
                </div>
              }>
                    <Routes>
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
                        <Route path="/track/:id" element={<Track />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/tryon" element={<TryOn />} />
                        <Route path="/verify" element={<Verify />} />
                        <Route path="/order-confirmed/:orderId" element={<OrderConfirmed />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                        <Route path="/rma/:rmaId" element={<RMADetail />} />
                      </Route>

                      <Route path="*" element={<NotFound />} />
                    </Routes>
              </Suspense>
            </ErrorBoundary>
          </main>

          {location.pathname !== "/social" && <Footer />}
          <ComparisonTray />

          {/* ──────────────────────────────────────────────────────────
              GLOBAL PROMO/ADVERTISING PARTNERSHIP WIDGET
              ────────────────────────────────────────────────────────── */}
          <AnimatePresence>
            {showPromo && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 260, damping: 25 }}
                className="fixed bottom-6 right-6 z-50 max-w-[340px] w-full bg-gradient-to-tr from-indigo-500/40 via-purple-500/40 to-emerald-500/40 p-[1.5px] rounded-[24px] shadow-[0_25px_60px_-10px_rgba(0,0,0,0.6)] select-none"
              >
                <div className="bg-slate-950/95 backdrop-blur-xl rounded-[23.5px] p-5 flex flex-col gap-3.5 text-white w-full relative">
                  {/* Close Button */}
                  <button
                    onClick={closePromo}
                    className="absolute top-4.5 right-4.5 text-slate-400 hover:text-white transition-colors border-none bg-transparent cursor-pointer focus:outline-none"
                  >
                    <X size={14} />
                  </button>

                  {/* Header info */}
                  <div className="space-y-1 text-left">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[8px] font-black uppercase tracking-wider">
                      <Sparkles size={8} /> Partnership Hub
                    </span>
                    <h3 className="text-sm font-extrabold tracking-tight text-white mt-1.5">Join the CartNow Ecosystem</h3>
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                      Grow your business or join our logistics fleet today.
                    </p>
                  </div>

                  {/* Action Cards Grid */}
                  <div className="flex flex-col gap-2.5">
                    {/* Sell Link Card */}
                    <a
                      href="https://cartnow-seller.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3.5 bg-indigo-650/10 hover:bg-indigo-650/20 border border-indigo-500/25 rounded-2xl transition-all duration-200 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-7.5 w-7.5 bg-indigo-600 text-white rounded-lg flex items-center justify-center shrink-0">
                          <ShoppingBag size={14} />
                        </div>
                        <div className="text-left leading-none">
                          <span className="text-[10.5px] font-black block text-white">Become a Seller</span>
                          <span className="text-[8px] font-semibold text-indigo-300 block mt-0.5">Sell to millions of buyers</span>
                        </div>
                      </div>
                      <ArrowRight size={12} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
                    </a>

                    {/* Rider Link Card */}
                    <a
                      href="https://cart-now-deliveryagent.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3.5 bg-emerald-650/10 hover:bg-emerald-650/20 border border-emerald-500/25 rounded-2xl transition-all duration-200 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-7.5 w-7.5 bg-emerald-650 text-white rounded-lg flex items-center justify-center shrink-0">
                          <Truck size={14} />
                        </div>
                        <div className="text-left leading-none">
                          <span className="text-[10.5px] font-black block text-white">Become a Rider</span>
                          <span className="text-[8px] font-semibold text-emerald-300 block mt-0.5">Earn on flexible shifts</span>
                        </div>
                      </div>
                      <ArrowRight size={12} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>

                  {/* Micro details */}
                  <span className="text-[8px] text-slate-500 font-semibold text-center mt-0.5">
                    Trusted by 5,000+ active partners globally
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      )}
    </>
  );
};

export default App;
