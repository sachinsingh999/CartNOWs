import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ShieldAlert, Sparkles, BrainCircuit, ArrowUpRight } from "lucide-react";

const DashboardSidebar = ({
  lowStockItems = [],
  navigate
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Compute inventory risk score
  const totalCount = lowStockItems.length;
  const riskScore = totalCount > 0 ? Math.min(totalCount * 18, 100) : 0;
  const riskStatus = riskScore > 50 ? "High Risk" : riskScore > 20 ? "Moderate" : "Healthy";
  const riskColor = riskScore > 50 ? "text-red-650 dark:text-red-400" : riskScore > 20 ? "text-amber-650 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400";
  const riskProgressColor = riskScore > 50 ? "bg-red-500" : riskScore > 20 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="space-y-6">
      
      {/* Card 1: Store Health (Apple Watch-style Concentric Rings) */}
      <motion.div 
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-slate-900/35 rounded-[24px] p-6 backdrop-blur-xl shadow-xs relative overflow-hidden"
      >
        <div className="flex items-center justify-between pb-3 mb-4 text-left">
          <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Store Health
          </h3>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded-full shadow-sm">
            Optimal
          </span>
        </div>

        {/* Concentric rings visualization */}
        <div className="flex items-center gap-6">
          <div className="relative h-24 w-24 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90 overflow-visible">
              {/* Ring 1 background & fill (Inventory - Emerald) */}
              <circle cx="50" cy="50" r="36" fill="transparent" stroke="rgba(16, 185, 129, 0.08)" strokeWidth="6" />
              <motion.circle 
                cx="50" cy="50" r="36" fill="transparent" stroke="#10b981" strokeWidth="6" 
                strokeDasharray="226" 
                initial={{ strokeDashoffset: 226 }}
                animate={{ strokeDashoffset: 226 * (1 - 0.92) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
              />

              {/* Ring 2 background & fill (Shipping - Amber) */}
              <circle cx="50" cy="50" r="27" fill="transparent" stroke="rgba(245, 158, 11, 0.08)" strokeWidth="6" />
              <motion.circle 
                cx="50" cy="50" r="27" fill="transparent" stroke="#f59e0b" strokeWidth="6" 
                strokeDasharray="170" 
                initial={{ strokeDashoffset: 170 }}
                animate={{ strokeDashoffset: 170 * (1 - 0.78) }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.1 }}
                strokeLinecap="round"
              />

              {/* Ring 3 background & fill (Customer Support - Indigo) */}
              <circle cx="50" cy="50" r="18" fill="transparent" stroke="rgba(99, 102, 241, 0.08)" strokeWidth="6" />
              <motion.circle 
                cx="50" cy="50" r="18" fill="transparent" stroke="#6366f1" strokeWidth="6" 
                strokeDasharray="113" 
                initial={{ strokeDashoffset: 113 }}
                animate={{ strokeDashoffset: 113 * (1 - 0.95) }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute font-black text-xs text-slate-800 dark:text-slate-100">
              94%
            </div>
          </div>

          {/* Legend Details */}
          <div className="flex-1 space-y-2 text-left text-[11px] font-bold">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Inventory</span>
              </span>
              <span className="text-slate-800 dark:text-slate-100">92%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>Shipping</span>
              </span>
              <span className="text-slate-800 dark:text-slate-100">78%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                <span>CSAT Score</span>
              </span>
              <span className="text-slate-800 dark:text-slate-100">95%</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Card 2: Low Stock Alerts */}
      <motion.div 
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="bg-white dark:bg-slate-900/35 rounded-[24px] p-6 backdrop-blur-xl shadow-xs relative overflow-hidden"
      >
        <div className="flex items-center justify-between pb-3 mb-4 text-left">
          <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert size={14} className="text-red-500 animate-pulse" />
            <span>Low Stock Warning</span>
          </h3>
          <span className={`text-[10px] font-bold uppercase ${riskColor}`}>
            {riskStatus}
          </span>
        </div>

        {/* Critical items list */}
        {lowStockItems.length === 0 ? (
          <p className="text-xs text-slate-500 py-3">All product stock levels are healthy.</p>
        ) : (
          <div className="space-y-3">
            {lowStockItems.slice(0, 3).map((item) => {
              const stockPercentage = Math.min((item.stock / 10) * 100, 100);
              return (
                <div key={item._id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 text-xs flex flex-col gap-2 relative shadow-2xs">
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 text-left min-w-0">
                      {/* Product Image */}
                      <div className="h-8 w-8 rounded-lg bg-white dark:bg-slate-950 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                        {item.images?.[0] ? (
                          <img src={item.images[0]} alt="" className="h-full w-full object-contain" />
                        ) : (
                          <span className="text-[7px] text-slate-400 font-bold uppercase">Item</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                        <p className="text-[9px] text-red-550 dark:text-red-400 font-bold mt-0.5">
                          Stock: {item.stock} left
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate("/inventory")}
                      className="bg-red-500 hover:bg-red-650 text-white font-black text-[8.5px] uppercase px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer border-0"
                    >
                      Restock
                    </button>
                  </div>
                  
                  {/* Linear Stock Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-red-500 h-full rounded-full" 
                      style={{ width: `${stockPercentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Card 3: AI Growth Opportunity */}
      <motion.div 
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-gradient-to-br from-indigo-950/20 to-purple-950/20 dark:from-indigo-950/40 dark:to-purple-950/40 rounded-[24px] p-6 backdrop-blur-xl shadow-xs relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 h-14 w-14 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-full blur-lg pointer-events-none" />
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 text-left">
          <h3 className="text-xs font-black text-indigo-750 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
            <BrainCircuit size={14} className="text-indigo-650 dark:text-indigo-400" />
            <span>Growth Intelligence</span>
          </h3>
          <Sparkles size={11} className="text-indigo-500" />
        </div>

        <div className="space-y-3.5 text-left">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
            "Wireless Earbuds generated <span className="text-indigo-600 dark:text-indigo-400 font-black">32% more clicks</span> this week. Consider boosting inventory target caps to capture conversions."
          </p>
          <button 
            onClick={() => navigate("/analytics")}
            className="w-full flex items-center justify-center gap-1 text-[9.5px] font-black uppercase text-indigo-750 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition py-2 bg-indigo-500/10 rounded-xl cursor-pointer shadow-2xs"
          >
            <span>Analyze Growth Stream</span>
            <ArrowUpRight size={11} />
          </button>
        </div>
      </motion.div>

    </div>
  );
};

export default DashboardSidebar;
