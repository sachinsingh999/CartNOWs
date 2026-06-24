import React, { useState, useEffect } from "react";
import { Clock, Star } from "lucide-react";
import { backendUrl } from "../../config";

const DealOfTheDay = ({ deals = [], onAddToCart }) => {
  const [dodTime, setDodTime] = useState({ hours: 14, minutes: 45, seconds: 12 });

  useEffect(() => {
    const timer = setInterval(() => {
      setDodTime(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 14, minutes: 45, seconds: 12 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dealProduct = deals && deals.length > 0 ? deals[0] : null;

  if (!dealProduct) {
    return (
      <div className="group relative bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/80 rounded-[32px] p-6 shadow-xl flex flex-col justify-center items-center min-h-[500px]">
        <p className="text-slate-450 dark:text-slate-500 font-bold">Checking daily promotions...</p>
      </div>
    );
  }

  const imgUrl = dealProduct.images?.length ? dealProduct.images[0] : (dealProduct.image || "");
  const finalImg = imgUrl?.startsWith("http") ? imgUrl : `${backendUrl}/${imgUrl}`;

  const originalVal = dealProduct.originalPrice || Math.round(dealProduct.price * 1.25);
  const discountPercent = Math.max(5, Math.round(((originalVal - dealProduct.price) / originalVal) * 100));

  return (
    <div className="group relative bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/80 rounded-[32px] p-6 shadow-xl shadow-slate-100/40 dark:shadow-black/20 flex flex-col justify-between min-h-[500px] text-left transition-all duration-300 hover:shadow-2xl hover:border-slate-350 dark:hover:border-slate-700/80 overflow-hidden">
      {/* Ambient background decoration */}
      <div className="absolute top-[-30px] right-[-30px] w-24 h-24 bg-orange-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-300" />
      
      <div className="space-y-4 relative z-10">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Deal of the Day
          </h3>
          <span className="px-2.5 py-1 text-[9px] bg-rose-505 bg-rose-600 text-white font-black rounded-lg uppercase tracking-wider shadow-sm animate-pulse">
            Save {discountPercent}%
          </span>
        </div>
        
        {/* Product Showcase Window */}
        <div className="w-full h-48 bg-gradient-to-tr from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950 rounded-2xl flex items-center justify-center relative overflow-hidden border border-slate-100 dark:border-slate-800/80">
          {/* Subtle Spotlight Glow behind the product */}
          <div className="absolute w-28 h-28 bg-[#7C3AED]/5 dark:bg-[#7C3AED]/10 rounded-full blur-xl pointer-events-none" />
          <img
            src={finalImg}
            alt={dealProduct.name}
            className="max-h-[85%] max-w-[85%] object-contain p-2 z-10 transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="space-y-2">
          <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-base leading-snug tracking-tight group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors line-clamp-1">
            {dealProduct.name}
          </h4>
          
          {/* Custom Glow Timer Pill */}
          <div className="flex gap-2 items-center text-[10px] font-black text-orange-600 dark:text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-xl w-fit uppercase tracking-wider select-none animate-pulse">
            <Clock size={11} className="stroke-[2.5]" />
            <span>Ends in: {String(dodTime.hours).padStart(2, "0")}:{String(dodTime.minutes).padStart(2, "0")}:{String(dodTime.seconds).padStart(2, "0")}</span>
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="font-black text-slate-900 dark:text-white text-xl">₹{dealProduct.price.toLocaleString("en-IN")}</span>
            <span className="text-xs text-slate-400 dark:text-slate-550 line-through font-medium">₹{originalVal.toLocaleString("en-IN")}</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-[10.5px] text-amber-500 pt-0.5">
            <div className="flex">
              {[...Array(5)].map((_, i) => {
                const filled = i < Math.round(dealProduct.averageRating || 4.5);
                return (
                  <Star
                    key={i}
                    size={10}
                    className={`${filled ? "fill-amber-500" : "fill-slate-200 dark:fill-slate-800"} stroke-none`}
                  />
                );
              })}
            </div>
            <span className="font-bold text-slate-400 dark:text-slate-550">({dealProduct.totalReviews || 0} Reviews)</span>
          </div>

          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold leading-relaxed pt-1">
            Includes official brand warranty. Free express delivery within 24 hours.
          </p>
        </div>
      </div>

      <button
        onClick={() => onAddToCart(dealProduct)}
        className="w-full mt-4 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 font-extrabold text-xs uppercase tracking-widest rounded-2xl shadow-md transition-all duration-200 cursor-pointer active:scale-95 border-none relative z-10 select-none flex items-center justify-center gap-1.5"
      >
        <span>Add To Cart</span>
      </button>
    </div>
  );
};

export default DealOfTheDay;
