import React, { useState, useEffect, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "./config";

// Modular components (eager loaded)
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import ComparisonTray from "./components/ComparisonTray";
import SplashLoader from "./components/SplashLoader";
import Maintenance from "./pages/Maintenance";

// Toastify components (eager loaded)
import { ToastContainer, Slide } from 'react-toastify';
import { useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

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


const App = () => {
  const location = useLocation();
  const [maintenanceSettings, setMaintenanceSettings] = useState(null);
  const [loadingMaintenance, setLoadingMaintenance] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [splashAnimDone, setSplashAnimDone] = useState(false);

  useEffect(() => {
    if (!loadingMaintenance && splashAnimDone) {
      setShowSplash(false);
    }
  }, [loadingMaintenance, splashAnimDone]);

  const handleSplashComplete = () => {
    setSplashAnimDone(true);
    if (!loadingMaintenance) {
      setShowSplash(false);
    }
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
        !loadingMaintenance && (
          <div className={`flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-opacity duration-700 ease-out ${showSplash ? "opacity-0 pointer-events-none select-none overflow-hidden h-screen" : "opacity-100" }`}>
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
              <Suspense fallback={
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-950 text-slate-500 font-mono text-xs uppercase tracking-widest">
                  <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-slate-800 dark:border-slate-800 dark:border-t-slate-300 animate-spin" />
                  <span>Loading Page...</span>
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/product" element={<Product />} />
                  <Route path="/products" element={<Product />} />
                  <Route path="/product/men" element={<AudienceCatalog audience="men" />} />
                  <Route path="/product/women" element={<AudienceCatalog audience="women" />} />
                  <Route path="/product/kid" element={<AudienceCatalog audience="kids" />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/placeorder" element={<PlaceOrder />} />
                  <Route path="/orderdetail" element={<Orderdetail />} />
                  <Route path="/order/:orderId" element={<SingleOrderDetail />} />
                  <Route path="/track/:id" element={<Track />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/tryon" element={<TryOn />} />
                  <Route path="/verify" element={<Verify />} />
                  <Route path="/order-confirmed/:orderId" element={<OrderConfirmed />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/category/:slug" element={<CatalogDetail type="category" />} />
                  <Route path="/discover" element={<Discover />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/categories/:slug" element={<CatalogDetail type="category" />} />
                  <Route path="/collections" element={<Collections />} />
                  <Route path="/collections/:slug" element={<CatalogDetail type="collection" />} />
                  <Route path="/brands" element={<Brands />} />
                  <Route path="/brands/:slug" element={<CatalogDetail type="brand" />} />
                  <Route path="/mobile" element={<MobileShowcase />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>

            <Footer />
            <ComparisonTray />

          </div>
        )
      )}
    </>
  );
};

export default App;
