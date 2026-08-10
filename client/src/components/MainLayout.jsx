import React, { useState, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Lenis from "lenis";
import { ShoppingBag, Truck, ArrowRight, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ComparisonTray from "./ComparisonTray";
import { useSystem } from "../context/SystemContext";

const MainLayout = () => {
  const { showSplash } = useSystem();
  const location = useLocation();
  const [showPromo, setShowPromo] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the promo widget
    try {
      const isDismissed = sessionStorage.getItem("cartnow_promo_dismissed") || localStorage.getItem("cartnow_promo_dismissed");
      if (isDismissed) return;
    } catch (e) {
      console.warn("Storage access failed:", e);
    }

    // Show partnership recruitment widget on mount after 1.2s delay to let the site load and render nicely
    const timer = setTimeout(() => {
      setShowPromo(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const closePromo = () => {
    setShowPromo(false);
    try {
      sessionStorage.setItem("cartnow_promo_dismissed", "true");
      localStorage.setItem("cartnow_promo_dismissed", "true");
    } catch (e) {
      console.warn("Storage write failed:", e);
    }
  };

  // Scroll to top instantly on route change like Amazon
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  useEffect(() => {
    let rafId;
    const updateHeight = () => {
      rafId = requestAnimationFrame(() => {
        const header = document.getElementById("main-navbar-header");
        if (header) {
          const height = header.offsetHeight;
          document.documentElement.style.setProperty("--navbar-height", `${height}px`);
        }
      });
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
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updateHeight);
      clearTimeout(timer);
    };
  }, [location.pathname]); // Observe when pathname changes to ensure we bind to the mounted navbar header

  const isPromoOrFooterExcluded = ["/login", "/signup", "/register", "/social"].includes(location.pathname.toLowerCase());

  return (
    <div className={`flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-opacity duration-700 ease-out ${showSplash ? "opacity-0 pointer-events-none select-none overflow-hidden h-screen" : "opacity-100"}`}>
      <Navbar />

      {/* MAIN must grow */}
      <main className="flex-1">
        <Outlet />
      </main>

      {!isPromoOrFooterExcluded && <Footer />}
      <ComparisonTray />

      {/* ──────────────────────────────────────────────────────────
          GLOBAL PROMO/ADVERTISING PARTNERSHIP WIDGET
          ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showPromo && !isPromoOrFooterExcluded && (
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 max-w-[340px] w-full bg-gradient-to-tr from-indigo-500/40 via-purple-500/40 to-emerald-500/40 p-[1.5px] rounded-[24px] shadow-[0_25px_60px_-10px_rgba(0,0,0,0.6)] select-none"
          >
            <div className="bg-slate-950/95 backdrop-blur-xl rounded-[23.5px] p-5 flex flex-col gap-3.5 text-white w-full relative">
              {/* Close Button */}
              <button
                type="button"
                onClick={closePromo}
                aria-label="Dismiss partnership promo"
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
                  className="flex items-center justify-between p-3.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 rounded-2xl transition-all duration-200 group cursor-pointer"
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
                  className="flex items-center justify-between p-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 rounded-2xl transition-all duration-200 group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-7.5 w-7.5 bg-emerald-600 text-white rounded-lg flex items-center justify-center shrink-0">
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
  );
};

export default MainLayout;
