import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "./config";
import Home from "./pages/Home";
import About from "./pages/About";
import Product from "./pages/Product";
import Navbar from "./components/Navbar";
import Men from "./pages/Men";
import Women from "./pages/Women";
import Kid from "./pages/Kid";
import Category from "./pages/Category";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import PlaceOrder from "./pages/PlaceOrder";
import Orderdetail from "./pages/Orderdetail";
import Track from "./pages/Track";
import { ToastContainer, Slide } from 'react-toastify';
import Profile from "./pages/Profile";
import { useLocation } from "react-router-dom";
import Help from "./pages/Help";
import TryOn from "./pages/TryOn";
import Verify from "./pages/Verify";
import OrderConfirmed from "./pages/OrderConfirmed";
import Wishlist from "./pages/Wishlist";
import AiAssistant from "./components/AiAssistant";
import ScrollToTop from "./components/ScrollToTop";
import ComparisonTray from "./components/ComparisonTray";
import Maintenance from "./pages/Maintenance";
import NotFound from "./pages/NotFound";
import Discover from "./pages/Discover";
import Categories from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import Collections from "./pages/Collections";
import CollectionDetail from "./pages/CollectionDetail";
import Brands from "./pages/Brands";
import BrandDetail from "./pages/BrandDetail";
import { AnimatePresence } from "framer-motion";
import SplashLoader from "./components/SplashLoader";

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
  }, []);

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
          <div className={`flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-opacity duration-700 ease-out ${showSplash ? "opacity-0 pointer-events-none select-none overflow-hidden h-screen" : "opacity-100"
            }`}>
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
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/product" element={<Product />} />
                <Route path="/products" element={<Product />} />
                <Route path="/product/men" element={<Men />} />
                <Route path="/product/women" element={<Women />} />
                <Route path="/product/kid" element={<Kid />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/placeorder" element={<PlaceOrder />} />
                <Route path="/orderdetail" element={<Orderdetail />} />
                <Route path="/track/:id" element={<Track />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/help" element={<Help />} />
                <Route path="/tryon" element={<TryOn />} />
                <Route path="/verify" element={<Verify />} />
                <Route path="/order-confirmed/:orderId" element={<OrderConfirmed />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/category/:slug" element={<Category />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/categories/:slug" element={<CategoryDetail />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/collections/:slug" element={<CollectionDetail />} />
                <Route path="/brands" element={<Brands />} />
                <Route path="/brands/:slug" element={<BrandDetail />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            <Footer />
            {location.pathname !== "/" && <AiAssistant />}
            <ComparisonTray />

          </div>
        )
      )}
    </>
  );
};

export default App;
