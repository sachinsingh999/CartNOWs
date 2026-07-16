import React, { useState, useEffect } from "react";
import { DollarSign, Package, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { motion, useReducedMotion, useMotionValue, animate } from "framer-motion";

// Local Number Counter Utility
const AnimatedCounter = ({ value, prefix = "", suffix = "", decimalPlaces = 0 }) => {
  const shouldReduceMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }
    const controls = animate(motionValue, value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo
      onUpdate: (latest) => {
        setDisplayValue(latest);
      }
    });
    return () => controls.stop();
  }, [value, motionValue, shouldReduceMotion]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString("en-IN", {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces
      })}
      {suffix}
    </span>
  );
};

const KPIGrid = ({
  products = [],
  orders = [],
  dashboardStats,
  totalRevenue
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Calculations
  const activeListingsCount = products.length;
  
  const inventoryValue = products.reduce((sum, p) => {
    return sum + (Number(p.price || 0) * Number(p.stock || 0));
  }, 0);
  
  const lowStockCount = products.filter(p => Number(p.stock || 0) < 10).length;
  
  // Dynamic active listings trend
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newListingsThisWeek = products.filter(p => new Date(p.createdAt || Date.now()).getTime() >= oneWeekAgo).length;
  const oldListingsCount = activeListingsCount - newListingsThisWeek;
  const listingTrendVal = oldListingsCount > 0 ? (newListingsThisWeek / oldListingsCount) * 100 : (newListingsThisWeek > 0 ? 100 : 0);
  const listingTrend = listingTrendVal > 0 ? `+${listingTrendVal.toFixed(1)}%` : "0%";

  // Dynamic monthly revenue trend
  const today = new Date();
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1).getTime();

  const currentMonthRevenue = orders
    .filter(o => new Date(o.createdAt || o.date || Date.now()).getTime() >= currentMonthStart)
    .reduce((sum, o) => sum + Number(o.amount || 0), 0);

  const lastMonthRevenue = orders
    .filter(o => {
      const time = new Date(o.createdAt || o.date || Date.now()).getTime();
      return time >= lastMonthStart && time < currentMonthStart;
    })
    .reduce((sum, o) => sum + Number(o.amount || 0), 0);

  let revenueTrend = "0%";
  let revenueTrendType = "neutral";
  if (lastMonthRevenue > 0) {
    const diff = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    revenueTrend = `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`;
    revenueTrendType = diff >= 0 ? "up" : "down";
  } else {
    revenueTrend = currentMonthRevenue > 0 ? "+100%" : "0%";
    revenueTrendType = currentMonthRevenue > 0 ? "up" : "neutral";
  }

  // Metrics Configurations
  const metrics = [
    {
      label: "Active Listings",
      numericValue: activeListingsCount,
      prefix: "",
      suffix: " Items",
      trend: "↑ 12% this week",
      trendType: "up",
      icon: Package,
      iconColor: "text-indigo-500",
      glowColor: "rgba(99, 102, 241, 0.15)",
      sparkline: "M 0,20 C 15,12 25,18 35,8 C 50,18 65,4 80,12 C 90,8 95,2 100,5",
      sparkColor: "#6366f1"
    },
    {
      label: "Inventory Value",
      numericValue: inventoryValue,
      prefix: "₹",
      suffix: "",
      trend: "↑ 8% this week",
      trendType: "up",
      icon: DollarSign,
      iconColor: "text-emerald-500",
      glowColor: "rgba(16, 185, 129, 0.15)",
      sparkline: "M 0,15 C 10,18 20,10 35,4 C 50,15 65,10 80,6 C 90,2 95,8 100,3",
      sparkColor: "#10b981"
    },
    {
      label: "Low Stock Alerts",
      numericValue: lowStockCount,
      prefix: "",
      suffix: " Products",
      trend: lowStockCount > 0 ? `↑ ${lowStockCount} items` : "↓ 4% this month",
      trendType: lowStockCount > 0 ? "down" : "up",
      icon: AlertTriangle,
      iconColor: lowStockCount > 0 ? "text-red-500" : "text-slate-450 dark:text-slate-500",
      glowColor: lowStockCount > 0 ? "rgba(239, 68, 68, 0.15)" : "rgba(148, 163, 184, 0.05)",
      sparkline: lowStockCount > 0 
        ? "M 0,5 C 15,8 25,2 40,12 C 55,20 70,14 85,25 C 92,20 98,28 100,26" 
        : "M 0,15 L 100,15",
      sparkColor: lowStockCount > 0 ? "#ef4444" : "#94a3b8"
    },
    {
      label: "Monthly Revenue",
      numericValue: currentMonthRevenue,
      prefix: "₹",
      suffix: "",
      trend: "↑ 22% this week",
      trendType: "up",
      icon: TrendingUp,
      iconColor: "text-orange-500",
      glowColor: "rgba(249, 115, 22, 0.15)",
      sparkline: "M 0,22 C 10,18 20,24 35,14 C 50,4 65,16 80,8 C 90,14 95,2 100,4",
      sparkColor: "#f97316"
    }
  ];

  const gridContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <motion.div 
      variants={gridContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6"
    >
      {metrics.map((m) => {
        const Icon = m.icon;
        // Make the value font size responsive so long values never get truncated
        const valueLength = (m.prefix + m.numericValue.toLocaleString("en-IN") + m.suffix).length;
        const fontSizeClass = valueLength > 15 ? "text-lg xl:text-xl" : valueLength > 10 ? "text-xl xl:text-2xl" : "text-2xl xl:text-3xl";

        return (
          <motion.div 
            key={m.label}
            variants={cardVariants}
            whileHover={{ 
              y: shouldReduceMotion ? 0 : -6,
              boxShadow: `0 20px 40px -15px ${m.glowColor}`,
              borderColor: "rgba(249, 115, 22, 0.2)"
            }}
            className="p-[1px] bg-gradient-to-br from-white/10 to-transparent dark:from-slate-800/40 dark:to-transparent rounded-[24px] transition-all duration-300"
          >
            <div className="bg-white dark:bg-slate-900/35 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl rounded-[23px] p-6 flex flex-col justify-between min-h-[176px] relative overflow-hidden transition-colors duration-300">
              
              {/* Top row: Icon + Metric Name */}
              <div className="flex items-center justify-between relative z-10">
                <span className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500 tracking-wider">
                  {m.label}
                </span>
                <div className="h-8 w-8 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 flex items-center justify-center text-slate-555 shrink-0 shadow-inner">
                  <Icon size={14} className={m.iconColor} />
                </div>
              </div>

              {/* Middle row: Large animated value with responsive size */}
              <div className="text-left relative z-10 mt-2 pr-1 break-words">
                <h3 className={`${fontSizeClass} font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight`}>
                  <AnimatedCounter 
                    value={m.numericValue} 
                    prefix={m.prefix} 
                    suffix={m.suffix} 
                  />
                </h3>
              </div>
              
              {/* Bottom Row: Trend and Sparkline */}
              <div className="flex items-end justify-between pt-3 border-t border-slate-100 dark:border-slate-900/60 relative z-10 mt-3">
                {/* Trend percentage chip */}
                <div className="flex flex-col text-left">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider ${
                    m.trendType === "up" 
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                      : "bg-red-500/10 text-red-650 dark:text-red-400"
                  }`}>
                    {m.trend}
                  </span>
                </div>

                {/* Animated Sparkline SVG */}
                <div className="h-6 w-20 shrink-0">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <motion.path
                      d={m.sparkline}
                      fill="none"
                      stroke={m.sparkColor}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.0, ease: "easeOut" }}
                    />
                  </svg>
                </div>
              </div>

            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default KPIGrid;
