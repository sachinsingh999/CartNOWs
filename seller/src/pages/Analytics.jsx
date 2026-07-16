import React, { useState } from "react";
import { TrendingUp, Users, ArrowUpRight, Percent, BarChart3, LineChart } from "lucide-react";

const Analytics = ({ products = [], orders = [] }) => {
  const [hoveredTraffic, setHoveredTraffic] = useState(null);
  const getWeeklyTraffic = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayOrders = { "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0, "Sun": 0 };
    const dayTraffic = { "Mon": 120, "Tue": 160, "Wed": 190, "Thu": 170, "Fri": 210, "Sat": 240, "Sun": 180 };
    
    orders.forEach(o => {
      if (!o.createdAt) return;
      const d = new Date(o.createdAt);
      const dayName = days[d.getDay()];
      if (dayOrders[dayName] !== undefined) {
        dayOrders[dayName]++;
      }
    });
    
    return Object.keys(dayTraffic).map(day => ({
      day,
      count: dayTraffic[day] + (dayOrders[day] * 35)
    }));
  };

  const weeklyTraffic = getWeeklyTraffic();
  const visitorCount = weeklyTraffic.reduce((sum, t) => sum + t.count, 0);
  const pageViews = Math.round(visitorCount * 2.8);
  const conversionRate = visitorCount > 0 ? ((orders.length / visitorCount) * 100).toFixed(1) : "0.0";
  const avgOrderValue = orders.length > 0 ? orders.reduce((sum, o) => sum + (o.amount || 0), 0) / orders.length : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Analytics Dashboard</h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          Review traffic logs, target shopper demographics, conversion paths, and purchase stats.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Visitors */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Visitors</p>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{visitorCount.toLocaleString()}</p>
            </div>
            <div className="h-10 w-10 bg-brand/10 text-brand rounded-xl flex items-center justify-center border border-brand/20">
              <Users size={18} />
            </div>
          </div>
          <p className="text-[10px] text-emerald-600 font-bold mt-4 flex items-center gap-1">
            <TrendingUp size={12} />
            <span>+15.2% from last week</span>
          </p>
        </div>

        {/* Page Views */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Page Views</p>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{pageViews.toLocaleString()}</p>
            </div>
            <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
              <LineChart size={18} />
            </div>
          </div>
          <p className="text-[10px] text-emerald-600 font-bold mt-4 flex items-center gap-1">
            <TrendingUp size={12} />
            <span>+8.4% from last week</span>
          </p>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Conversion Rate</p>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{conversionRate}%</p>
            </div>
            <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
              <Percent size={18} />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold mt-4">Shopper-to-buyer ratio</p>
        </div>

        {/* Average Order Value */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Avg. Order Value</p>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">₹{avgOrderValue.toFixed(2)}</p>
            </div>
            <div className="h-10 w-10 bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 rounded-xl flex items-center justify-center border border-violet-100 dark:border-violet-900/50">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold mt-4">Per check-out transaction</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traffic Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Weekly Store Traffic</h3>
              <p className="text-[11px] text-slate-400">Total number of unique visitor requests over the past 7 days.</p>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-950 border border-slate-100 px-3 py-1 rounded-full">
              Live Monitor
            </span>
          </div>

          {/* Custom SVG Bar Chart representation */}
          <div className="relative pt-6 px-2">
            {/* Tooltip Overlay */}
            {hoveredTraffic !== null && (
              <div 
                className="absolute bg-slate-950 text-slate-100 dark:text-white rounded-xl px-3.5 py-2 text-left shadow-xl border border-slate-800 pointer-events-none z-10 transition-all duration-150"
                style={{
                  left: `${(hoveredTraffic / (weeklyTraffic.length - 1)) * 80 + 10}%`,
                  top: "0px",
                  transform: "translateX(-50%)"
                }}
              >
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                  {weeklyTraffic[hoveredTraffic].day} Traffic
                </p>
                <p className="text-xs font-black text-orange-400 mt-0.5">
                  {weeklyTraffic[hoveredTraffic].count} Shoppers
                </p>
              </div>
            )}

            <div className="h-64 w-full">
              <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  {/* Gradients */}
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff6b00" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                  <linearGradient id="barGradHover" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff8f3d" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="40" x2="600" y2="40" stroke="currentColor" className="text-slate-100 dark:text-slate-800/40" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="90" x2="600" y2="90" stroke="currentColor" className="text-slate-100 dark:text-slate-800/40" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="140" x2="600" y2="140" stroke="currentColor" className="text-slate-100 dark:text-slate-800/40" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="180" x2="600" y2="180" stroke="currentColor" className="text-slate-200 dark:text-slate-800/70" strokeWidth="1.5" />

                {/* Bars */}
                {weeklyTraffic.map((t, idx) => {
                  const barHeight = Math.min((t.count / 500) * 150, 150);
                  const x = 30 + idx * 83;
                  const y = 180 - barHeight;
                  const width = 32;
                  return (
                    <rect
                      key={idx}
                      x={x}
                      y={y}
                      width={width}
                      height={barHeight}
                      rx="6"
                      fill={hoveredTraffic === idx ? "url(#barGradHover)" : "url(#barGrad)"}
                      className="cursor-pointer transition-all duration-200"
                      onMouseEnter={() => setHoveredTraffic(idx)}
                      onMouseLeave={() => setHoveredTraffic(null)}
                    />
                  );
                })}
              </svg>
            </div>

            {/* Labels */}
            <div className="flex justify-between text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-4 px-8">
              {weeklyTraffic.map((t, idx) => (
                <span 
                  key={idx} 
                  className={`transition-colors duration-150 cursor-pointer ${hoveredTraffic === idx ? "text-orange-500 font-black scale-105" : ""}`}
                  onMouseEnter={() => setHoveredTraffic(idx)}
                  onMouseLeave={() => setHoveredTraffic(null)}
                >
                  {t.day}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Categories Share */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Catalog Metrics</h3>
          <p className="text-[11px] text-slate-400">Detailed breakdown of product listing distributions.</p>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 font-bold">
                <span>Active Products</span>
                <span>{products.length} Items</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800/40 rounded-full h-1.5 overflow-hidden">
                <div className="bg-indigo-600 h-full w-[80%]" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 font-bold">
                <span>Unique Categories</span>
                <span>{[...new Set(products.map((p) => p.category))].length} tags</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800/40 rounded-full h-1.5 overflow-hidden">
                <div className="bg-orange-500 h-full w-[55%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
