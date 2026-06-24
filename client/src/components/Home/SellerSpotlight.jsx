import React from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

const SellerSpotlight = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-[32px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)] flex flex-col justify-between min-h-[500px]">
      <div className="space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Seller Spotlight
        </h3>

        <div className="flex items-center gap-4 py-2 border-b border-slate-100 dark:border-slate-800/80">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-750 shadow-sm shrink-0 bg-slate-50 dark:bg-slate-950">
            <img
              src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&auto=format&fit=crop&q=80"
              alt="Seller Spotlight"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="leading-tight text-left">
            <h4 className="font-black text-slate-850 dark:text-slate-200 text-base">TechGear Hub Elite</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">Delhi NCR Hub</p>
            <div className="flex items-center gap-1 text-[10px] font-black text-amber-500 mt-1">
              <Star size={11} className="fill-amber-500 stroke-none" />
              <span>4.9 (2,450 Reviews)</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400">
            <span>Positive Reviews</span>
            <span className="text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-950/30">99.2%</span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400">
            <span>Shipment Rate</span>
            <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-950/30">99.8% (Next Day)</span>
          </div>
          <p className="text-[11px] text-slate-555 dark:text-slate-350 leading-relaxed font-bold mt-2">
            About the Seller:
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed font-semibold">
            TechGear Hub Elite is our certified marketplace vendor specializing in high-end computer peripherals, headphones, and lifestyle smartwatches. Inspected and verified by CartNow team.
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate("/product?search=Apple")}
        className="w-full mt-4 py-4 bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md transition cursor-pointer border-none"
      >
        Explore Store
      </button>
    </div>
  );
};

export default SellerSpotlight;
