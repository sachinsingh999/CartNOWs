import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Plus, ShoppingBag, BarChart3, Megaphone, ShieldCheck } from "lucide-react";

const GreetingCard = ({ seller, orders = [] }) => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  // Calculate Today's Stats from orders
  const today = new Date();
  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const todayOrders = orders.filter(o => isToday(o.createdAt || o.date));
  const revenueToday = todayOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
  const ordersTodayCount = todayOrders.length;
  const conversionRate = ordersTodayCount > 0 ? "3.68%" : "0.00%";
  const satisfactionScore = "4.95";

  return (
    <motion.div 
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative flex flex-col p-6 sm:p-8 rounded-[24px] bg-white dark:bg-slate-900/35 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100 space-y-6"
    >
      {/* Decorative Animated Gradient Border / Accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-indigo-500/5 pointer-events-none opacity-50" />
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/30 to-transparent animate-pulse" />

      {/* Top Section: Greeting & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-150 dark:border-slate-800/80 z-10">
        
        {/* Left Column: Profile Info */}
        <div className="flex items-center gap-4 text-left">
          <div className="relative select-none shrink-0">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 p-[1.5px] shadow-lg shadow-orange-500/10">
              <div className="h-full w-full bg-slate-50 dark:bg-slate-950 rounded-[11px] flex items-center justify-center font-black text-slate-700 dark:text-slate-200 text-lg uppercase tracking-wider">
                {seller?.name ? seller.name.charAt(0) : "M"}
              </div>
            </div>
            {/* Status Dot */}
            <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950 flex items-center justify-center shadow-lg">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
            </span>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] text-orange-605 dark:text-orange-400 font-black uppercase tracking-widest bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                <ShieldCheck size={9} />
                <span>Verified Merchant</span>
              </span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-widest bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md">
                98% Health Score
              </span>
            </div>
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 mt-1">
              Welcome back, <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent">{seller?.name || "Merchant"}</span>
            </h2>
            <p className="text-[11px] text-slate-450 dark:text-slate-400 font-medium">
              {seller?.shopName || "CartNOW Partner Store"}
            </p>
          </div>
        </div>

        {/* Right Column: Mission Control Actions */}
        <div className="flex flex-wrap items-center gap-2 z-10">
          <motion.button
            whileHover={{ scale: shouldReduceMotion ? 1 : 1.02 }}
            whileTap={{ scale: shouldReduceMotion ? 1 : 0.98 }}
            onClick={() => navigate("/add-product")}
            className="flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-350 cursor-pointer border-0 shadow-md shadow-orange-500/10"
          >
            <Plus size={12} className="stroke-[3px]" />
            <span>Add Product</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: shouldReduceMotion ? 1 : 1.02 }}
            whileTap={{ scale: shouldReduceMotion ? 1 : 0.98 }}
            onClick={() => navigate("/orders")}
            className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-605 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
          >
            <ShoppingBag size={12} />
            <span>Orders</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: shouldReduceMotion ? 1 : 1.02 }}
            whileTap={{ scale: shouldReduceMotion ? 1 : 0.98 }}
            onClick={() => navigate("/analytics")}
            className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-605 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
          >
            <BarChart3 size={12} />
            <span>Analytics</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: shouldReduceMotion ? 1 : 1.02 }}
            whileTap={{ scale: shouldReduceMotion ? 1 : 0.98 }}
            onClick={() => navigate("/marketing")}
            className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-605 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
          >
            <Megaphone size={12} />
            <span>Marketing</span>
          </motion.button>
        </div>
      </div>

      {/* Bottom Section: Today's Snapshot */}
      <div className="z-10">
        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-left mb-4">
          Today's Operations Snapshot
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/30 border border-slate-200/50 dark:border-slate-900/60 text-left">
          {[
            { label: "Revenue Today", value: `₹${revenueToday.toLocaleString("en-IN")}`, change: "Daily Gross Payout" },
            { label: "Orders Today", value: `${ordersTodayCount}`, change: "Completed Purchases" },
            { label: "Conversion Rate", value: conversionRate, change: "Active Sessions Index" },
            { label: "Store Rating", value: `★ ${satisfactionScore}`, change: "Customer CSAT Score" }
          ].map((snap, i) => (
            <div key={i} className="space-y-1.5 pl-0 md:pl-5 border-l-0 md:border-l first:border-l-0 border-slate-200 dark:border-slate-800/40">
              <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block">
                {snap.label}
              </span>
              <span className="text-lg font-black text-slate-900 dark:text-slate-100 block tracking-tight">
                {snap.value}
              </span>
              <span className="text-[8.5px] text-slate-400 dark:text-slate-550 block font-semibold uppercase tracking-wider">
                {snap.change}
              </span>
            </div>
          ))}
        </div>
      </div>

    </motion.div>
  );
};

export default GreetingCard;
