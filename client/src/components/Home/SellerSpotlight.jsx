import React from "react";
import { useNavigate } from "react-router-dom";
import { Star, ShieldCheck, ArrowRight } from "lucide-react";

const SellerSpotlight = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-6 shadow-xs flex flex-col justify-between min-h-[500px]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck size={15} className="text-amber-500" />
            Seller Spotlight
          </h2>
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 px-2 py-0.5 rounded-sm">
            VERIFIED VENDOR
          </span>
        </div>

        <div className="flex items-center gap-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-16 h-16 rounded-sm overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs shrink-0 bg-slate-50 dark:bg-slate-950">
            <img
              src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&auto=format&fit=crop&q=80"
              alt="Seller Spotlight"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="leading-tight text-left">
            <h4 className="font-black text-slate-900 dark:text-slate-100 text-base">TechGear Hub Elite</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">Delhi NCR Hub</p>
            <div className="flex items-center gap-1 text-[10px] font-black text-amber-500 mt-1">
              <Star size={11} className="fill-amber-500 stroke-none" />
              <span>4.9 (2,450 Reviews)</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400">
            <span>Positive Reviews</span>
            <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-sm border border-emerald-200 dark:border-emerald-900/40 font-mono">
              99.2%
            </span>
          </div>

          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400">
            <span>Shipment Rate</span>
            <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-sm border border-blue-200 dark:border-blue-900/40 font-mono">
              99.8% (Next Day)
            </span>
          </div>

          <div className="pt-2">
            <p className="text-[11px] text-slate-900 dark:text-slate-100 leading-relaxed font-bold">
              About the Seller:
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium mt-1">
              TechGear Hub Elite is our certified marketplace vendor specializing in high-end computer peripherals, headphones, and lifestyle smartwatches. Inspected and verified by CartNow team.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate("/product?search=Apple")}
        className="w-full mt-4 py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-xs uppercase tracking-wider rounded-sm shadow-xs transition cursor-pointer border-none flex items-center justify-center gap-2 group"
      >
        <span>Explore Store</span>
        <ArrowRight size={14} className="stroke-[2.5] transition-transform duration-200 group-hover:translate-x-1" />
      </button>
    </div>
  );
};

export default SellerSpotlight;
