import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Flame, Sparkles, Eye } from "lucide-react";
import ProductCard from "../../pages/ProductCard";
import Loader from "../Loader";

/* ─────────────── Main Component ─────────────── */
const TrendingProducts = ({
  bestSellers = [],
  newArrivals = [],
  mostViewed = [],
  loading,
  onQuickView,
  onAddToCart,
  onToggleFavorite,
  wishlist
}) => {
  const navigate = useNavigate();
  const [activeTrendingTab, setActiveTrendingTab] = useState("bestseller");

  const trendingFiltered = useMemo(() => {
    if (activeTrendingTab === "new") return newArrivals;
    if (activeTrendingTab === "viewed") return mostViewed;
    return bestSellers; // Default to bestseller
  }, [bestSellers, newArrivals, mostViewed, activeTrendingTab]);

  const scrollSlider = (direction) => {
    const el = document.getElementById("trending-slider");
    if (el) {
      const card = el.querySelector(".snap-start");
      const cardWidth = card?.offsetWidth || 280;
      const gap = 8; // gap-2 is 8px
      const scrollAmt = direction === "left" ? -(cardWidth + gap) : (cardWidth + gap);
      el.scrollBy({ left: scrollAmt, behavior: "smooth" });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[22%_1fr] gap-2 sm:gap-2.5 lg:gap-3 items-stretch mb-2 select-none text-left">

      {/* Sidebar column: Trending Hub */}
      <div className="flex flex-col h-full">
        <div 
          className="relative p-3.5 sm:p-4 text-white flex flex-col justify-between shadow-[0_4px_25px_rgba(0,0,0,0.25)] flex-1 min-h-[360px] h-full text-left border border-slate-800/90 rounded-sm overflow-hidden bg-gradient-to-br from-[#070A14] via-[#0B0F1D] to-[#030610]"
        >
          {/* Glowing Mesh Animation */}
          <div className="absolute top-[-30%] left-[-30%] w-[100%] h-[100%] bg-gradient-to-tr from-blue-500/15 to-transparent rounded-full blur-[90px] pointer-events-none animate-pulse" style={{ animationDuration: "9s" }} />
          <div className="absolute bottom-[-30%] right-[30%] w-[100%] h-[100%] bg-gradient-to-tr from-indigo-500/15 to-transparent rounded-full blur-[90px] pointer-events-none animate-pulse" style={{ animationDuration: "7s" }} />

          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/15 border border-blue-500/40 rounded-sm text-[9px] font-black uppercase tracking-wider text-blue-300 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-sm bg-blue-400 animate-pulse" />
              <span>Hot Picks</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black tracking-tight leading-none text-white">
              Trending Hub
            </h2>
            <p className="text-[11px] text-slate-400 font-medium leading-tight">
              Discover what's hot and in high demand right now across the CartNOW marketplace.
            </p>
          </div>

          {/* Stacked Vertical Tabs */}
          <div className="flex flex-col gap-1.5 relative z-10 w-full my-2">
            {[
              { id: "bestseller", label: "Best Sellers", icon: Flame, iconColor: "text-orange-400" },
              { id: "new", label: "New Arrivals", icon: Sparkles, iconColor: "text-amber-400" },
              { id: "viewed", label: "Most Viewed", icon: Eye, iconColor: "text-blue-400" }
            ].map((tab) => {
              const isActive = activeTrendingTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTrendingTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-sm text-[10.5px] font-black uppercase tracking-wider text-left transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:brightness-105 active:scale-[0.98]"
                      : "bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 hover:text-white border border-white/5 hover:border-blue-500/30 shadow-2xs"
                  }`}
                >
                  {React.createElement(tab.icon, { size: 13, className: `${isActive ? "text-white" : tab.iconColor} shrink-0 stroke-[2.5]` })}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => navigate("/product")}
            className="group relative w-full py-2 bg-slate-900/90 hover:bg-slate-800 text-white font-black text-[10.5px] uppercase tracking-wider rounded-sm shadow-2xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 border border-slate-700/80 hover:border-blue-400 z-10"
          >
            <span>Explore Catalog</span>
            <ArrowRight size={12} className="stroke-[2.5] transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Horizontal Trending Slider */}
      <div className="flex flex-col justify-between min-w-0 relative">
        {/* Top Controls Bar (without title text) */}
        <div className="flex items-center justify-end mb-2">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => scrollSlider("left")}
              aria-label="Previous trending products"
              className="h-7.5 w-7.5 sm:h-8 sm:w-8 rounded-sm border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <ChevronLeft size={15} className="stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => scrollSlider("right")}
              aria-label="Next trending products"
              className="h-7.5 w-7.5 sm:h-8 sm:w-8 rounded-sm border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <ChevronRight size={15} className="stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Loader or Slider */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/60 dark:border-slate-800 rounded-sm min-h-[320px]">
            <Loader message="" size="sm" color="blue" />
          </div>
        ) : (
          <div
            id="trending-slider"
            className="flex gap-2 overflow-x-hidden scroll-smooth snap-x snap-mandatory pb-1"
          >
            {trendingFiltered.map((p) => (
              <div
                key={p._id}
                className="min-w-[calc((100%-0.5rem)/2)] max-w-[calc((100%-0.5rem)/2)] w-[calc((100%-0.5rem)/2)] md:min-w-[calc((100%-1rem)/3)] md:max-w-[calc((100%-1rem)/3)] md:w-[calc((100%-1rem)/3)] lg:min-w-[calc((100%-1rem)/3)] lg:max-w-[calc((100%-1rem)/3)] lg:w-[calc((100%-1rem)/3)] snap-start flex-shrink-0"
              >
                <ProductCard
                  product={p}
                  onQuickView={onQuickView}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingProducts;
