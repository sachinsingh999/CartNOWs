import React, { useState } from "react";
import { 
  Store, 
  ExternalLink, 
  Calendar, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  ChevronDown 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const WelcomeHeader = ({ 
  seller, 
  timeframe = "30D", 
  setTimeframe,
  isStoreOnline = true,
  setIsStoreOnline
}) => {
  const [isTimeframeOpen, setIsTimeframeOpen] = useState(false);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const timeframeLabels = {
    "today": "Today (Live)",
    "7D": "Last 7 Days",
    "30D": "Last 30 Days",
    "this_month": "This Month",
    "1Y": "Year to Date (1Y)"
  };

  const sellerName = seller?.name || seller?.shopName?.split(" ")[0] || "Merchant Partner";
  const shopName = seller?.shopName || "CartNOW Official Store";

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-xl p-2.5 sm:p-3 border border-slate-200/80 dark:border-slate-800/80 shadow-xs relative z-30 overflow-visible transition-all duration-200">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 relative z-10">
        {/* Left: Greeting & Store Context */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Zap size={11} className="text-amber-500 fill-amber-500" />
              <span>Seller Hub</span>
            </span>

            {/* Store Status Toggle / Badge */}
            <button
              onClick={() => setIsStoreOnline && setIsStoreOnline(!isStoreOnline)}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              title="Click to toggle store availability"
            >
              <span className={`h-2 w-2 rounded-full ${isStoreOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
              <span>{isStoreOnline ? "Store Live & Accepting Orders" : "Store Inactive"}</span>
            </button>
          </div>

          <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight pt-0.5">
            {getGreeting()}, <span className="text-amber-500 dark:text-amber-400">{sellerName}!</span> <span className="inline-block animate-wiggle">👋</span>
          </h1>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Here’s what’s happening with <strong className="text-slate-800 dark:text-slate-200">{shopName}</strong> today.
          </p>
        </div>

        {/* Right: Motivational Growth Metric & Global Controls */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Growth Callout Card (Solid flat bg, no gradient) */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
            <div className="h-6 w-6 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
              <TrendingUp size={12} className="stroke-[2.5]" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1 text-[10px] font-black text-slate-900 dark:text-slate-100">
                <span>Growth Velocity</span>
                <span className="text-amber-600 dark:text-amber-400 font-black">+18.2%</span>
              </div>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">
                Pacing faster than 85% of platform peers
              </p>
            </div>
          </div>

          {/* Date-Range Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsTimeframeOpen(!isTimeframeOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700/60 transition shadow-2xs cursor-pointer"
            >
              <Calendar size={13} className="text-amber-500" />
              <span>{timeframeLabels[timeframe] || "Last 30 Days"}</span>
              <ChevronDown size={13} className={`text-slate-400 transition-transform ${isTimeframeOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {isTimeframeOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsTimeframeOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-1 z-40 text-left"
                  >
                    {Object.entries(timeframeLabels).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setTimeframe && setTimeframe(key);
                          setIsTimeframeOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                          timeframe === key
                            ? "text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-950/40"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span>{label}</span>
                        {timeframe === key && <CheckCircle2 size={12} className="text-amber-500" />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* View Store Button */}
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-xs transition-all cursor-pointer active:scale-95"
            title="Open buyer storefront in new tab"
          >
            <Store size={13} />
            <span>View Store</span>
            <ExternalLink size={11} className="opacity-80" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;
