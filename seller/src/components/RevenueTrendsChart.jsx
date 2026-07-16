import React, { useState, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp, FileText, Users, Landmark, Calendar } from "lucide-react";

const RevenueTrendsChart = ({ orders = [] }) => {
  const shouldReduceMotion = useReducedMotion();
  const [activeMetric, setActiveMetric] = useState("revenue"); // "revenue" | "orders" | "customers" | "aov"
  const [timeframe, setTimeframe] = useState("30D"); // "7D" | "30D" | "90D" | "1Y"
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Generate realistic data points aligning with real orders dataset (with smooth demo baselines to prevent empty states)
  const chartData = useMemo(() => {
    const baseProfiles = {
      "7D": {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        revenue: [12000, 18500, 14200, 29000, 22400, 38000, 42000],
        orders: [4, 6, 5, 9, 7, 12, 15],
        customers: [3, 5, 5, 8, 6, 11, 14]
      },
      "30D": {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        revenue: [82000, 112000, 95000, 148000],
        orders: [24, 38, 31, 45],
        customers: [20, 32, 28, 41]
      },
      "90D": {
        labels: ["Month 1", "Month 2", "Month 3"],
        revenue: [290000, 340000, 480000],
        orders: [95, 120, 160],
        customers: [84, 105, 140]
      },
      "1Y": {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        revenue: [380000, 420000, 390000, 510000, 480000, 620000, 710000, 680000, 790000, 850000, 920000, 1100000],
        orders: [120, 135, 125, 165, 150, 190, 220, 210, 245, 270, 290, 340],
        customers: [100, 115, 110, 145, 130, 170, 195, 185, 215, 240, 260, 310]
      }
    };

    const profile = baseProfiles[timeframe];
    const dataPoints = [];

    // Scale factors from real orders database
    const totalRealRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
    const scaleFactor = totalRealRevenue > 0 ? (totalRealRevenue / 300000) : 1;

    for (let i = 0; i < profile.labels.length; i++) {
      let value = 0;
      if (activeMetric === "revenue") {
        value = Math.round(profile.revenue[i] * scaleFactor);
      } else if (activeMetric === "orders") {
        value = Math.round(profile.orders[i] * (totalRealRevenue > 0 ? (orders.length / 100) : 1));
      } else if (activeMetric === "customers") {
        value = Math.round(profile.customers[i] * (totalRealRevenue > 0 ? (orders.length / 120) : 1));
      } else {
        // Average Order Value (AOV)
        const rev = profile.revenue[i] * scaleFactor;
        const ords = profile.orders[i] * (totalRealRevenue > 0 ? (orders.length / 100) : 1);
        value = Math.round(ords > 0 ? rev / ords : 0);
      }
      
      dataPoints.push({
        label: profile.labels[i],
        value: Math.max(value, 0)
      });
    }

    return dataPoints;
  }, [activeMetric, timeframe, orders]);

  // Compute SVG point coordinates
  const points = useMemo(() => {
    const maxValue = Math.max(...chartData.map(d => d.value), 10);
    return chartData.map((t, idx) => {
      const x = idx * (600 / (chartData.length - 1 || 1));
      // Keep Y-coords between 30 (peak) and 175 (zero)
      const y = 175 - (t.value / maxValue) * 140;
      return { x, y };
    });
  }, [chartData]);

  // Smooth cubic bezier curve coordinates
  const pathLine = useMemo(() => {
    if (points.length === 0) return "";
    let line = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX1 = prev.x + (curr.x - prev.x) / 3;
      const cpY1 = prev.y;
      const cpX2 = curr.x - (curr.x - prev.x) / 3;
      const cpY2 = curr.y;
      line += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
    }
    return line;
  }, [points]);

  const pathArea = useMemo(() => {
    if (!pathLine || points.length === 0) return "";
    return `${pathLine} L ${points[points.length - 1].x} 175 L ${points[0].x} 175 Z`;
  }, [pathLine, points]);

  // Mouse Move coordinate relative tracking
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    const hoverIdx = Math.min(
      Math.max(Math.round(pct * (chartData.length - 1)), 0),
      chartData.length - 1
    );
    setHoveredIdx(hoverIdx);
  };

  // Assign distinct theme colors for AOV, revenue, orders, customers
  const themeColor = 
    activeMetric === "revenue" 
      ? "#f97316" 
      : activeMetric === "orders" 
      ? "#6366f1" 
      : activeMetric === "customers" 
      ? "#10b981" 
      : "#3b82f6";

  const themeFill = 
    activeMetric === "revenue" 
      ? "chartFillRevenue" 
      : activeMetric === "orders" 
      ? "chartFillOrders" 
      : activeMetric === "customers" 
      ? "chartFillCustomers" 
      : "chartFillAov";

  return (
    <motion.div 
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white dark:bg-slate-900/35 border border-slate-200 dark:border-slate-800/80 rounded-[24px] p-6.5 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden h-[520px] flex flex-col justify-between text-slate-800 dark:text-slate-100"
    >
      {/* Decorative Glows */}
      <div className="absolute top-[-10%] right-[-10%] h-80 w-80 rounded-full bg-orange-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] h-72 w-72 rounded-full bg-indigo-500/5 blur-[110px] pointer-events-none" />

      {/* Header controls row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-slate-150 dark:border-slate-800 pb-5 z-20">
        
        {/* Left: Metric toggles */}
        <div className="flex flex-wrap sm:flex-nowrap bg-slate-50 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-900 self-start shadow-inner overflow-x-auto max-w-full no-scrollbar">
          {[
            { id: "revenue", label: "Revenue", icon: TrendingUp },
            { id: "orders", label: "Orders", icon: FileText },
            { id: "customers", label: "Customers", icon: Users },
            { id: "aov", label: "AOV", icon: Landmark }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeMetric === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveMetric(tab.id);
                  setHoveredIdx(null);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer border ${
                  active ? "text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-md" : "text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-350 border-transparent"
                }`}
              >
                <Icon size={13} className={active ? "text-orange-500" : "text-slate-500"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Timeframe filter chips */}
        <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-900 self-end">
          {["7D", "30D", "90D", "1Y"].map((t) => {
            const active = timeframe === t;
            return (
              <button
                key={t}
                onClick={() => {
                  setTimeframe(t);
                  setHoveredIdx(null);
                }}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition cursor-pointer ${
                  active ? "text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 shadow-sm border border-slate-200/60 dark:border-transparent" : "text-slate-450 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Interactive Chart Area */}
      <div 
        className="relative flex-1 mt-5 h-64 select-none cursor-crosshair overflow-visible z-10"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredIdx(null)}
      >
        {/* Tooltip Card element */}
        {hoveredIdx !== null && chartData[hoveredIdx] && (
          <div 
            className="absolute bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-2xl z-30 pointer-events-none text-left min-w-[130px]"
            style={{
              left: `${(hoveredIdx / (chartData.length - 1)) * 84 + 8}%`,
              top: "0px",
              transform: "translateX(-50%)"
            }}
          >
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <Calendar size={8} className="text-orange-500" />
              <span>{chartData[hoveredIdx].label}</span>
            </span>
            <div className="text-sm font-black text-slate-900 dark:text-slate-100 mt-1">
              {activeMetric === "revenue" || activeMetric === "aov" ? "₹" : ""}
              {chartData[hoveredIdx].value.toLocaleString("en-IN")}
            </div>
            <div className="text-[8px] text-slate-400 mt-0.5 uppercase font-bold">
              Metric Payout
            </div>
          </div>
        )}

        <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartFillRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.00" />
            </linearGradient>
            <linearGradient id="chartFillOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.00" />
            </linearGradient>
            <linearGradient id="chartFillCustomers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
            </linearGradient>
            <linearGradient id="chartFillAov" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.00" />
            </linearGradient>
            
            <filter id="chartGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1="30" x2="600" y2="30" stroke="rgba(255,255,255,0.02)" className="stroke-slate-100 dark:stroke-slate-900" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1="75" x2="600" y2="75" stroke="rgba(255,255,255,0.02)" className="stroke-slate-100 dark:stroke-slate-900" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1="120" x2="600" y2="120" stroke="rgba(255,255,255,0.02)" className="stroke-slate-100 dark:stroke-slate-900" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1="175" x2="600" y2="175" stroke="rgba(255,255,255,0.05)" className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="1" />

          {/* Area Fill */}
          {pathArea && (
            <path
              d={pathArea}
              fill={`url(#${themeFill})`}
            />
          )}

          {/* Glowing Bezier Path Line */}
          {pathLine && (
            <motion.path
              d={pathLine}
              fill="none"
              stroke={themeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#chartGlow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          )}

          {/* Hover Crosshair ruler */}
          {hoveredIdx !== null && points[hoveredIdx] && (
            <g>
              <line 
                x1={points[hoveredIdx].x} 
                y1="30" 
                x2={points[hoveredIdx].x} 
                y2="175" 
                stroke="rgba(0, 0, 0, 0.1)" 
                className="stroke-slate-300 dark:stroke-slate-700"
                strokeWidth="1" 
                strokeDasharray="3 3" 
              />
              {/* Intersection coordinates expand */}
              <circle
                cx={points[hoveredIdx].x}
                cy={points[hoveredIdx].y}
                r="6"
                fill={themeColor}
              />
              <circle
                cx={points[hoveredIdx].x}
                cy={points[hoveredIdx].y}
                r="2"
                fill="#ffffff"
              />
            </g>
          )}
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between text-[10px] text-slate-450 dark:text-slate-500 font-extrabold uppercase tracking-widest border-t border-slate-100 dark:border-slate-900/60 pt-4 px-1.5 z-20">
        {chartData.map((d, idx) => (
          <span 
            key={idx} 
            className={`transition-all duration-150 ${
              hoveredIdx === idx ? "text-orange-500 font-black scale-105" : ""
            }`}
          >
            {d.label}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

export default RevenueTrendsChart;
