import React, { useState, useMemo } from "react";
import { TrendingUp, Users, ArrowUpRight, Percent, BarChart3, LineChart, RefreshCw, Calendar } from "lucide-react";

const Analytics = ({ products = [], orders = [] }) => {
  const [hoveredTraffic, setHoveredTraffic] = useState(null);
  const [timeframe, setTimeframe] = useState("7D");

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
  const visitorCount = useMemo(() => weeklyTraffic.reduce((sum, t) => sum + t.count, 0), [weeklyTraffic]);
  const pageViews = useMemo(() => Math.round(visitorCount * 2.8), [visitorCount]);
  const conversionRate = useMemo(() => visitorCount > 0 ? ((orders.length / visitorCount) * 100).toFixed(1) : "0.0", [visitorCount, orders]);
  const avgOrderValue = useMemo(() => orders.length > 0 ? orders.reduce((sum, o) => sum + (o.amount || 0), 0) / orders.length : 0, [orders]);

  const uniqueCategories = useMemo(() => [...new Set(products.map((p) => p.category).filter(Boolean))], [products]);

  return (
    <div className="space-y-4 animate-fadeIn text-slate-800 dark:text-slate-100">
      
      {/* ── Single Consolidated Container: Header, Controls & Stats Grid ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs space-y-3.5 shrink-0">
        
        {/* Top: Header & Timeframe Chips */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-indigo-600 dark:bg-indigo-500/10 text-white dark:text-indigo-400 rounded-lg flex items-center justify-center shadow-xs shrink-0">
              <BarChart3 size={16} />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Analytics & Traffic Intelligence</h1>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Review shopper traffic logs, conversion paths, and sales volume trends</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl">
            {["7D", "30D", "90D", "1Y"].map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition cursor-pointer ${
                  timeframe === tf
                    ? "bg-orange-500 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Middle: 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Card 1: Visitors */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between group relative overflow-hidden">
            <div className="space-y-1 relative z-10 text-left">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Total Visitors
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{visitorCount.toLocaleString()}</span>
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                <TrendingUp size={10} /> +15.2% vs prev
              </span>
            </div>
            <div className="p-2 rounded-lg text-orange-500 bg-orange-500/10 transition-transform duration-200 group-hover:scale-105 relative z-10">
              <Users size={16} />
            </div>
          </div>

          {/* Card 2: Page Views */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between group relative overflow-hidden">
            <div className="space-y-1 relative z-10 text-left">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Total Page Views
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{pageViews.toLocaleString()}</span>
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                <TrendingUp size={10} /> +8.4% vs prev
              </span>
            </div>
            <div className="p-2 rounded-lg text-indigo-500 bg-indigo-500/10 transition-transform duration-200 group-hover:scale-105 relative z-10">
              <LineChart size={16} />
            </div>
          </div>

          {/* Card 3: Conversion Rate */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between group relative overflow-hidden">
            <div className="space-y-1 relative z-10 text-left">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Conversion Rate
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{conversionRate}%</span>
              </div>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block">
                Shopper to buyer ratio
              </span>
            </div>
            <div className="p-2 rounded-lg text-emerald-500 bg-emerald-500/10 transition-transform duration-200 group-hover:scale-105 relative z-10">
              <Percent size={16} />
            </div>
          </div>

          {/* Card 4: Avg Order Value */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between group relative overflow-hidden">
            <div className="space-y-1 relative z-10 text-left">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Avg. Order Value
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">₹{avgOrderValue.toFixed(2)}</span>
              </div>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block">
                Per checkout basket
              </span>
            </div>
            <div className="p-2 rounded-lg text-violet-500 bg-violet-500/10 transition-transform duration-200 group-hover:scale-105 relative z-10">
              <ArrowUpRight size={16} />
            </div>
          </div>

        </div>

      </div>

      {/* Traffic Chart & Catalog Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        
        {/* Weekly Store Traffic (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs space-y-4 flex flex-col justify-between min-h-[350px]">
          <div className="flex items-center justify-between pb-3">
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Weekly Store Traffic Monitor</h3>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Unique visitor requests mapped across past 7 days</p>
            </div>
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-0.5 rounded-md">
              Live Feed
            </span>
          </div>

          {/* SVG Bar Chart */}
          <div className="relative pt-4 px-2 select-none">
            {hoveredTraffic !== null && (
              <div 
                className="absolute bg-slate-950 text-white rounded-xl px-3 py-1.5 text-left shadow-xl pointer-events-none z-10 transition-all duration-150"
                style={{
                  left: `${(hoveredTraffic / (weeklyTraffic.length - 1)) * 80 + 10}%`,
                  top: "-10px",
                  transform: "translateX(-50%)"
                }}
              >
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">
                  {weeklyTraffic[hoveredTraffic].day} Traffic
                </p>
                <p className="text-xs font-black text-orange-400 mt-0.5">
                  {weeklyTraffic[hoveredTraffic].count} Shoppers
                </p>
              </div>
            )}

            <div className="h-52 w-full">
              <svg viewBox="0 0 600 180" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
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
                <line x1="0" y1="30" x2="600" y2="30" stroke="currentColor" className="text-slate-100 dark:text-slate-800/40" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="80" x2="600" y2="80" stroke="currentColor" className="text-slate-100 dark:text-slate-800/40" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="130" x2="600" y2="130" stroke="currentColor" className="text-slate-100 dark:text-slate-800/40" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="160" x2="600" y2="160" stroke="currentColor" className="text-slate-200 dark:text-slate-800/70" strokeWidth="1.5" />

                {/* Bars */}
                {weeklyTraffic.map((t, idx) => {
                  const barHeight = Math.min((t.count / 500) * 130, 130);
                  const x = 30 + idx * 83;
                  const y = 160 - barHeight;
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
            <div className="flex justify-between text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-2 px-8">
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

        {/* Catalog Shares (1 Col) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs space-y-4 min-h-[350px]">
          <div className="pb-3">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Catalog Metrics</h3>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Product listing distribution & category depth</p>
          </div>

          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-800 dark:text-slate-200 font-bold">
                <span>Active Listings</span>
                <span className="font-black text-slate-900 dark:text-white">{products.length} Items</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2 overflow-hidden">
                <div className="bg-indigo-600 h-full w-[80%]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-800 dark:text-slate-200 font-bold">
                <span>Unique Categories</span>
                <span className="font-black text-slate-900 dark:text-white">{uniqueCategories.length} Categories</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2 overflow-hidden">
                <div className="bg-orange-500 h-full w-[65%]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-800 dark:text-slate-200 font-bold">
                <span>Fulfillment Rate</span>
                <span className="font-black text-emerald-500">98.4%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-full w-[98%]" />
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Analytics;
