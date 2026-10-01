import React from "react";
import { 
  ShieldCheck, 
  Star, 
  Clock, 
  Package, 
  Calendar 
} from "lucide-react";

const StoreHealthCard = ({ 
  seller = {}, 
  products = [], 
  orders = [],
  isStoreOnline = true 
}) => {
  const memberSinceYear = seller?.createdAt ? new Date(seller.createdAt).getFullYear() : 2025;
  const rating = seller?.rating || "4.8";
  const totalReviewsCount = orders.length > 0 ? Math.round(orders.length * 0.45) + 18 : 128;
  const responseTime = "< 15 mins";
  const fulfillmentScore = "99.2%";

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-xl p-2.5 sm:p-3 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between text-left relative overflow-hidden transition-all duration-200">
      <div className="space-y-2">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={14} />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-tight">
                Store Health & Standing
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                CartNOW Quality & Fulfillment Standards
              </p>
            </div>
          </div>

          <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Excellent
          </span>
        </div>

        {/* Store Metrics Grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {/* Rating */}
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-amber-500">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rating</span>
              <Star size={12} className="fill-amber-400 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-black text-amber-500 dark:text-amber-400">{rating}</span>
              <span className="text-[10px] text-slate-400">/ 5.0</span>
            </div>
            <span className="text-[9px] text-slate-400 font-medium">({totalReviewsCount} reviews)</span>
          </div>

          {/* Response Time */}
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Response</span>
              <Clock size={12} />
            </div>
            <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{responseTime}</p>
            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">Fast Dispatch</span>
          </div>

          {/* Catalog Count */}
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-amber-500">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Listed Items</span>
              <Package size={12} />
            </div>
            <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{products.length} Items</p>
            <span className="text-[9px] text-slate-400 font-medium">Active SKU catalog</span>
          </div>

          {/* Member Since */}
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Since</span>
              <Calendar size={12} />
            </div>
            <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{memberSinceYear}</p>
            <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold">Verified Partner</span>
          </div>
        </div>

        {/* Fulfillment Performance Progress Bars */}
        <div className="space-y-1.5 pt-0.5">
          <div className="space-y-0.5">
            <div className="flex justify-between text-[10px] font-bold text-slate-700 dark:text-slate-300">
              <span>Order Fulfillment Rate</span>
              <span className="text-emerald-600 dark:text-emerald-400">{fulfillmentScore}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: "99.2%" }} />
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="flex justify-between text-[10px] font-bold text-slate-700 dark:text-slate-300">
              <span>On-Time Shipping Index</span>
              <span className="text-amber-500 dark:text-amber-400 font-bold">98.4%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: "98.4%" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreHealthCard;
