import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Clock, Zap } from "lucide-react";
import ProductCard from "../../pages/ProductCard";
import { motion } from "framer-motion";

/* ─────────────── Main Component ─────────────── */
const FlashDeals = ({ deals = [], onQuickView, onAddToCart, onToggleFavorite, wishlist }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 2, minutes: 45, seconds: 12 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const flashProducts = deals.slice(0, 8);

  const scrollSlider = (direction) => {
    const el = document.getElementById("flash-slider");
    if (el) {
      const card = el.querySelector(".snap-start");
      const cardWidth = card?.offsetWidth || 280;
      const gap = 8;
      const scrollAmt = direction === "left" ? -(cardWidth + gap) : (cardWidth + gap);
      el.scrollBy({ left: scrollAmt, behavior: "smooth" });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[22%_1fr] gap-2 sm:gap-2.5 lg:gap-3 items-stretch mb-2 select-none text-left">

      {/* Sidebar column: Flash Deals / Countdown */}
      <div className="flex flex-col h-full">
        <div 
          className="relative p-3.5 sm:p-4 text-white flex-col justify-between shadow-[0_4px_25px_rgba(0,0,0,0.25)] flex-1 flex min-h-[360px] text-left border border-slate-800/90 rounded-sm overflow-hidden bg-gradient-to-br from-[#070A14] via-[#0B0F1D] to-[#030610]"
        >
          {/* Glowing Mesh Animation */}
          <div className="absolute top-[-30%] left-[-30%] w-[100%] h-[100%] bg-gradient-to-tr from-orange-500/15 to-transparent rounded-full blur-[90px] pointer-events-none animate-pulse" style={{ animationDuration: "8s" }} />
          <div className="absolute bottom-[-30%] right-[30%] w-[100%] h-[100%] bg-gradient-to-tr from-amber-500/15 to-transparent rounded-full blur-[90px] pointer-events-none animate-pulse" style={{ animationDuration: "6s" }} />

          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-orange-500/15 border border-orange-500/40 rounded-sm text-[9px] font-black uppercase tracking-wider text-orange-300 shadow-2xs">
              <Clock size={10} className="animate-spin text-orange-400" style={{ animationDuration: "6s" }} />
              <span>Limited Offers</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black tracking-tight leading-none text-white flex items-center gap-1.5">
              <span>Flash Deals</span>
              <Zap size={16} className="text-amber-400 fill-amber-400" />
            </h2>
            <p className="text-[11px] text-slate-400 font-medium leading-tight">
              Exclusive campaign styles heavily discounted for a very short period. Grab yours now!
            </p>
          </div>

          {/* Luxury Digital Timer Grid */}
          <div className="grid grid-cols-4 gap-1.5 relative z-10 w-full my-2">
            {[
              { label: "days", val: timeLeft.days },
              { label: "hours", val: timeLeft.hours },
              { label: "mins", val: timeLeft.minutes },
              { label: "secs", val: timeLeft.seconds }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-xs border border-white/10 py-2 rounded-sm shadow-2xs relative">
                <span className="text-sm sm:text-base font-black text-white">{String(item.val).padStart(2, "0")}</span>
                <span className="text-[7px] font-black uppercase text-amber-400/90 tracking-wider mt-0.5">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Claimed Timeline Progress */}
          <div className="space-y-1 relative z-10 my-1.5">
            <div className="flex justify-between items-center text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
              <span>Deals Claimed</span>
              <span className="text-amber-400 font-black">84%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900/90 rounded-sm overflow-hidden border border-white/10 shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "84%" }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 rounded-sm"
              />
            </div>
          </div>

          <button
            onClick={() => navigate("/product")}
            className="group relative w-full py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-[10.5px] uppercase tracking-wider rounded-sm shadow-md shadow-orange-500/20 hover:brightness-105 active:scale-[0.99] transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 border-none z-10"
          >
            <span>View All Deals</span>
            <ArrowRight size={12} className="stroke-[2.5] transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Horizontal Flash Slider */}
      <div className="flex flex-col justify-between min-w-0 relative">
        {/* Top Controls Bar (without title text) */}
        <div className="flex items-center justify-end mb-2">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => scrollSlider("left")}
              aria-label="Previous flash deals"
              className="h-7.5 w-7.5 sm:h-8 sm:w-8 rounded-sm border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <ChevronLeft size={15} className="stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => scrollSlider("right")}
              aria-label="Next flash deals"
              className="h-7.5 w-7.5 sm:h-8 sm:w-8 rounded-sm border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <ChevronRight size={15} className="stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Slider list of products */}
        {flashProducts.length === 0 ? (
          <div className="flex-1 flex items-center justify-center bg-white/50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800 rounded-sm min-h-[320px]">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Checking flash promotions...</span>
          </div>
        ) : (
          <div
            id="flash-slider"
            className="flex gap-2 overflow-x-hidden scroll-smooth snap-x snap-mandatory pb-1"
          >
            {flashProducts.map((p) => (
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

export default FlashDeals;
