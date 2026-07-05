import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Flame, Sparkles, Eye } from "lucide-react";
import ProductCard from "../../pages/ProductCard";
import Loader from "../Loader";

/* ─────────────── Main Component ─────────────── */
const TrendingProducts = ({ bestSellers = [], newArrivals = [], mostViewed = [], loading, onQuickView, onAddToCart, onToggleFavorite, wishlist }) => {
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
      const cardWidth = el.querySelector(".snap-start")?.offsetWidth || 280;
      const gap = 20; // gap-5 is 20px
      const scrollAmt = direction === "left" ? -(cardWidth + gap) : (cardWidth + gap);
      el.scrollBy({ left: scrollAmt, behavior: "smooth" });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[22%_78%] gap-6 lg:gap-8 items-start mb-8 select-none">
      
      {/* Premium Luxury Sidebar Panel - Stacked Symmetrical design */}
      <div className="relative overflow-hidden rounded-2xl p-5 text-slate-100 dark:text-white flex flex-col justify-between shadow-xl shadow-blue-500/5 dark:shadow-black/50 h-[390px] text-left bg-slate-950 border border-slate-800/80">
        {/* Glowing Mesh Animation */}
        <div className="absolute top-[-30%] left-[-30%] w-[100%] h-[100%] bg-gradient-to-tr from-blue-500/15 to-transparent rounded-full blur-[90px] pointer-events-none animate-pulse" style={{ animationDuration: "9s" }} />
        <div className="absolute bottom-[-30%] right-[30%] w-[100%] h-[100%] bg-gradient-to-tr from-indigo-500/15 to-transparent rounded-full blur-[90px] pointer-events-none animate-pulse" style={{ animationDuration: "7s" }} />
        
        <div className="space-y-3.5 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-[9px] font-black uppercase tracking-wider text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span>Hot Picks</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">Trending Hub</h2>
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
            Discover what's hot and in high demand right now across the CartNOW marketplace.
          </p>
        </div>

        {/* Stacked Vertical Tabs */}
        <div className="flex flex-col gap-2 relative z-10 w-full">
          {[
            { id: "bestseller", label: "Best Sellers", icon: Flame, iconColor: "text-orange-500" },
            { id: "new", label: "New Arrivals", icon: Sparkles, iconColor: "text-amber-500" },
            { id: "viewed", label: "Most Viewed", icon: Eye, iconColor: "text-blue-500" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTrendingTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider text-left transition-all duration-200 cursor-pointer ${ activeTrendingTab === tab.id ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-slate-100 dark:text-white shadow-md hover:brightness-105 active:scale-[0.98]" : "bg-slate-900/40 text-slate-400 hover:bg-slate-900/60 hover:text-white border border-white/5" }`}
            >
              {React.createElement(tab.icon, { size: 13, className: `${tab.iconColor} shrink-0` })}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate("/product")}
          className="group relative w-full py-3 bg-slate-900 hover:bg-slate-800 text-slate-100 dark:text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 border border-white/5 z-10"
        >
          <span>Explore Catalog</span>
          <ArrowRight size={12} className="transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      </div>

      {/* Horizontal Trending Slider */}
      <div className="flex flex-col h-[390px] justify-between overflow-hidden">
        {/* Header - Aligned precisely with layout */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <span>Trending Lineup</span>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          </h3>
          
          {/* Glassmorphism navigation buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => scrollSlider("left")}
              className="h-8.5 w-8.5 rounded-full border border-slate-200/50 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => scrollSlider("right")}
              className="h-8.5 w-8.5 rounded-full border border-slate-200/50 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* Loader or Slider */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/60 dark:border-slate-800 rounded-2xl">
            <Loader message="" size="sm" color="blue" />
          </div>
        ) : (
          <div
            id="trending-slider"
            className="flex gap-3 md:gap-4 lg:gap-5 overflow-x-hidden scroll-smooth snap-x snap-mandatory pb-1"
          >
            {trendingFiltered.map((p) => (
              <div 
                key={p._id} 
                className="min-w-[calc((100%-0.75rem)/2)] max-w-[calc((100%-0.75rem)/2)] w-[calc((100%-0.75rem)/2)] md:min-w-[calc((100%-2*1rem)/3)] md:max-w-[calc((100%-2*1rem)/3)] md:w-[calc((100%-2*1rem)/3)] lg:min-w-[calc((100%-3*1.25rem)/4)] lg:max-w-[calc((100%-3*1.25rem)/4)] lg:w-[calc((100%-3*1.25rem)/4)] snap-start flex-shrink-0 border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300"
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
