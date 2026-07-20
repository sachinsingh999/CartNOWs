import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "../../pages/ProductCard";

/* ─────────────── Main Component ─────────────── */
const FlashDeals = ({ deals = [], onQuickView, onAddToCart, onToggleFavorite, wishlist }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 4, minutes: 12, seconds: 50 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { days: 0, hours: 4, minutes: 12, seconds: 50 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const flashProducts = deals && deals.length > 0 ? deals : [];

  const scrollSlider = (direction) => {
    const el = document.getElementById("flash-slider");
    if (el) {
      const cardWidth = el.querySelector(".snap-start")?.offsetWidth || 280;
      const gap = 20; // gap-5 is 20px
      const scrollAmt = direction === "left" ? -(cardWidth + gap) : (cardWidth + gap);
      el.scrollBy({ left: scrollAmt, behavior: "smooth" });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[22%_78%] gap-6 lg:gap-8 items-stretch mb-8 select-none">

      {/* Sidebar column with spacer to align with product card tops */}
      <div className="flex flex-col h-full">
        <div className="hidden lg:block h-[46px]" />
        <div 
          style={{ borderRadius: "0px", backgroundColor: "#020617" }}
          className="relative p-5 text-slate-100 dark:text-white flex-col justify-between shadow-xl shadow-indigo-500/5 dark:shadow-black/50 flex-1 flex min-h-[390px] text-left border border-slate-800/80"
        >
          {/* Glowing Mesh Animation */}
          <div className="absolute top-[-30%] left-[-30%] w-[100%] h-[100%] bg-gradient-to-tr from-orange-500/15 to-transparent rounded-full blur-[90px] pointer-events-none animate-pulse" style={{ animationDuration: "8s" }} />
          <div className="absolute bottom-[-30%] right-[30%] w-[100%] h-[100%] bg-gradient-to-tr from-amber-500/15 to-transparent rounded-full blur-[90px] pointer-events-none animate-pulse" style={{ animationDuration: "6s" }} />

          <div className="space-y-3.5 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/10 border border-orange-500/30 rounded-full text-[9px] font-black uppercase tracking-wider text-orange-400">
              <Clock size={9} className="animate-spin text-orange-400" style={{ animationDuration: "6s" }} />
              <span>Limited Offers</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-white via-slate-100 to-orange-250 bg-clip-text text-transparent">Flash Deals</h2>
            <p className="text-[11px] text-slate-450 font-medium leading-relaxed">
              Exclusive campaign styles heavily discounted for a very short period. Grab yours now!
            </p>
          </div>

          {/* Luxury Digital Timer Grid */}
          <div className="grid grid-cols-4 gap-2 relative z-10 w-full">
            {[
              { label: "days", val: timeLeft.days },
              { label: "hours", val: timeLeft.hours },
              { label: "mins", val: timeLeft.minutes },
              { label: "secs", val: timeLeft.seconds }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-xs border border-white/5 py-2.5 rounded-none shadow-sm relative">
                <span className="text-base font-black text-slate-100 dark:text-white">{String(item.val).padStart(2, "0")}</span>
                <span className="text-[7px] font-black uppercase text-amber-400/80 tracking-wider mt-0.5">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Claimed Timeline Progress */}
          <div className="space-y-1.5 relative z-10">
            <div className="flex justify-between items-center text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
              <span>Deals Claimed</span>
              <span className="text-amber-400 font-black">84%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900/90 rounded-full overflow-hidden border border-white/5 shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "84%" }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 rounded-full"
              />
            </div>
          </div>

          <button
            onClick={() => navigate("/product")}
            className="group relative w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-100 dark:text-white font-extrabold text-[10px] uppercase tracking-wider rounded-none shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 border-none z-10"
          >
            <span>View All Deals</span>
            <ArrowRight size={12} className="transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Horizontal Deal Slider */}
      <div className="flex flex-col justify-between">
        {/* Header - Aligned precisely with layout */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <span>Today's Flash Lineup</span>
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
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

        {/* Slider list of products - Exactly 4 cards visible on desktop, 3 on tablet, 2 on mobile with zero cutting */}
        {flashProducts.length === 0 ? (
          <div className="flex-1 flex items-center justify-center bg-white/50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800 rounded-2xl h-full">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Checking flash promotions...</span>
          </div>
        ) : (
          <div
            id="flash-slider"
            className="flex gap-3 md:gap-4 lg:gap-5 overflow-x-hidden scroll-smooth snap-x snap-mandatory pb-1"
          >
            {flashProducts.map((p) => (
              <div
                key={p._id}
                className="min-w-[calc((100%-0.75rem)/2)] max-w-[calc((100%-0.75rem)/2)] w-[calc((100%-0.75rem)/2)] md:min-w-[calc((100%-2*1rem)/3)] md:max-w-[calc((100%-2*1rem)/3)] md:w-[calc((100%-2*1rem)/3)] lg:min-w-[calc((100%-2*1.25rem)/3)] lg:max-w-[calc((100%-2*1.25rem)/3)] lg:w-[calc((100%-2*1.25rem)/3)] snap-start flex-shrink-0"
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
