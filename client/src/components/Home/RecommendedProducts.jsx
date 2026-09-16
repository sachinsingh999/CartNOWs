import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Flame, Award, Star, TrendingUp, Eye, Zap, Heart } from "lucide-react";
import ProductCard from "../../pages/ProductCard";
import Loader from "../Loader";

/* ─────────────── Main Unified Discovery Showcase Component ─────────────── */
const RecommendedProducts = ({
  recommended = [],
  trending = [],
  bestSellers = [],
  topRated = [],
  newArrivals = [],
  mostViewed = [],
  dealsOfDay = [],
  mostWishlisted = [],
  loading,
  onQuickView,
  onAddToCart,
  onToggleFavorite,
  wishlist = []
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("foryou");

  const TABS = [
    { id: "foryou", label: "For You", icon: Sparkles, iconColor: "text-purple-400" },
    { id: "trending", label: "Trending", icon: Flame, iconColor: "text-orange-400" },
    { id: "bestsellers", label: "Best Sellers", icon: Award, iconColor: "text-amber-400" },
    { id: "rated", label: "Top Rated", icon: Star, iconColor: "text-yellow-400" },
    { id: "arrivals", label: "New Arrivals", icon: TrendingUp, iconColor: "text-blue-400" },
    { id: "viewed", label: "Most Viewed", icon: Eye, iconColor: "text-cyan-400" },
    { id: "deals", label: "Super Deals", icon: Zap, iconColor: "text-rose-400" },
    { id: "loved", label: "Most Loved", icon: Heart, iconColor: "text-pink-400" }
  ];

  const filteredProducts = useMemo(() => {
    switch (activeTab) {
      case "trending":
        return trending.length > 0 ? trending : recommended;
      case "bestsellers":
        return bestSellers.length > 0 ? bestSellers : (trending.length > 0 ? trending : recommended);
      case "rated":
        return topRated.length > 0 ? topRated : recommended;
      case "arrivals":
        return newArrivals.length > 0 ? newArrivals : recommended;
      case "viewed":
        return mostViewed.length > 0 ? mostViewed : (trending.length > 0 ? trending : recommended);
      case "deals":
        return dealsOfDay.length > 0 ? dealsOfDay : recommended;
      case "loved":
        return mostWishlisted.length > 0 ? mostWishlisted : recommended;
      case "foryou":
      default:
        return recommended;
    }
  }, [recommended, trending, bestSellers, topRated, newArrivals, mostViewed, dealsOfDay, mostWishlisted, activeTab]);

  useEffect(() => {
    const el = document.getElementById("recommended-slider");
    if (el) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [activeTab]);

  const scrollSlider = (direction) => {
    const el = document.getElementById("recommended-slider");
    if (el) {
      const card = el.querySelector(".snap-start");
      const cardWidth = card?.offsetWidth || 280;
      const gap = 8;
      const scrollAmt = direction === "left" ? -(cardWidth + gap) : (cardWidth + gap);
      el.scrollBy({ left: scrollAmt, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm p-3.5 sm:p-4.5 lg:p-5 shadow-xs transition-shadow duration-300 select-none text-left">
      
      {/* Section Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
        <div className="text-left space-y-1">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800/60 rounded-sm text-[9px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 shadow-2xs">
              <Sparkles size={11} className="stroke-[2.5]" />
              <span>AI PICKS</span>
            </div>

            <span className="px-2 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
              8 Discovery Feeds
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>For You & Curated Picks</span>
            <span className="h-1.5 w-1.5 rounded-sm bg-blue-600 dark:bg-blue-400 animate-pulse" />
          </h2>

          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Handpicked items selected by CartNow AI based on your preferences, browsing patterns, and style.
          </p>
        </div>

        {/* Top Right Action & Navigation */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          <button
            onClick={() => navigate("/product")}
            className="px-3 py-1.5 rounded-sm border border-slate-300 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white text-slate-800 dark:text-slate-200 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 shadow-2xs"
          >
            <span>Explore All</span>
            <ArrowRight size={12} className="stroke-[2.5]" />
          </button>

          {/* Slider Navigation Chevrons */}
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => scrollSlider("left")}
              aria-label="Previous products"
              className="w-8 h-8 rounded-sm bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
            >
              <ChevronLeft size={15} className="stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => scrollSlider("right")}
              aria-label="Next products"
              className="w-8 h-8 rounded-sm bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
            >
              <ChevronRight size={15} className="stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Dedicated Filter Tabs Strip (Horizontal scrollable, never awkwardly wraps) */}
      <div 
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        className="w-full flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden pb-2.5 pt-0.5 mb-3 border-b border-slate-100 dark:border-slate-800/80"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-sm text-[10.5px] font-black uppercase tracking-wider border transition-colors duration-150 cursor-pointer shadow-2xs flex items-center gap-1.5 shrink-0 select-none ${
                isActive
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs"
                  : "bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-700 hover:border-slate-400 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              {React.createElement(tab.icon, { 
                size: 12, 
                className: `${isActive ? "text-blue-400 dark:text-blue-600" : tab.iconColor} shrink-0 stroke-[2.5]` 
              })}
              <span>{tab.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Product Carousel Slider with Smooth Framer Motion Transition */}
      {loading ? (
        <div className="flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 rounded-sm min-h-[260px]">
          <Loader message="" size="sm" color="purple" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            id="recommended-slider"
            className="flex gap-3 sm:gap-3.5 overflow-x-hidden scroll-smooth snap-x snap-mandatory pb-1"
          >
            {filteredProducts.map((p) => (
              <div
                key={p._id}
                className="min-w-[72vw] max-w-[290px] sm:min-w-[calc((100%-0.875rem)/2)] sm:max-w-[calc((100%-0.875rem)/2)] md:min-w-[calc((100%-1.75rem)/3)] md:max-w-[calc((100%-1.75rem)/3)] lg:min-w-[calc((100%-2.625rem)/4)] lg:max-w-[calc((100%-2.625rem)/4)] snap-start flex-shrink-0"
              >
                <ProductCard
                  product={p}
                  onQuickView={onQuickView}
                  onAddToCart={onAddToCart}
                  onToggleFavorite={onToggleFavorite}
                  wishlist={wishlist}
                />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default RecommendedProducts;
