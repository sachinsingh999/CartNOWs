import React from "react";

const RevenueTrendsChart = ({
  monthlyTrends = [],
  hoveredTrend,
  setHoveredTrend
}) => {
  // Compute SVG point coordinates dynamically
  const maxSales = Math.max(...monthlyTrends.map(m => m.sales), 10);
  
  const points = monthlyTrends.map((t, idx) => {
    const x = idx * (600 / (monthlyTrends.length - 1 || 1));
    // Keep Y-coords between 40 (peak sales) and 170 (zero sales)
    const y = 170 - (t.sales / maxSales) * 130;
    return { x, y };
  });

  // Build Bezier Curve path
  let pathLine = "";
  if (points.length > 0) {
    pathLine = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX1 = prev.x + 50;
      const cpY1 = prev.y;
      const cpX2 = curr.x - 50;
      const cpY2 = curr.y;
      pathLine += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
    }
  }

  const pathArea = pathLine ? `${pathLine} L ${points[points.length - 1].x} 180 L ${points[0].x} 180 Z` : "";

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight">Revenue Trends</h3>
          <p className="text-[11px] text-slate-400 mt-1">Aggregated sales index comparing monthly gross store payouts.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl shadow-sm">
            Monthly Index
          </span>
        </div>
      </div>

      {/* Custom SVG bezier curve chart representation */}
      <div className="relative pt-8 px-2">
        {/* Tooltip Overlay */}
        {hoveredTrend !== null && monthlyTrends[hoveredTrend] && (
          <div 
            className="absolute bg-slate-950 text-slate-100 dark:text-white rounded-xl px-3.5 py-2 text-left shadow-2xl border border-slate-800 pointer-events-none z-10 transition-all duration-150"
            style={{
              left: `${(hoveredTrend / (monthlyTrends.length - 1)) * 80 + 10}%`,
              top: "-15px",
              transform: "translateX(-50%)"
            }}
          >
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
              {monthlyTrends[hoveredTrend].month} Payout
            </p>
            <p className="text-xs font-black text-orange-400 mt-0.5">
              ₹{monthlyTrends[hoveredTrend].sales.toLocaleString("en-IN")}
            </p>
          </div>
        )}

        <div className="h-64 w-full">
          <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <defs>
              {/* Gradient for area fill */}
              <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.00" />
              </linearGradient>
              {/* Gradient for curve line */}
              <linearGradient id="chartLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="50%" stopColor="brand" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
              {/* Glow Filter */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Grid Lines */}
            <line x1="0" y1="40" x2="600" y2="40" stroke="#f8fafc" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="90" x2="600" y2="90" stroke="#f8fafc" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="140" x2="600" y2="140" stroke="#f8fafc" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="180" x2="600" y2="180" stroke="#f1f5f9" strokeWidth="1.5" />

            {/* Bezier Area Path */}
            {pathArea && (
              <path
                d={pathArea}
                fill="url(#chartFill)"
              />
            )}

            {/* Bezier Line Path */}
            {pathLine && (
              <path
                d={pathLine}
                fill="none"
                stroke="url(#chartLineGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                filter="url(#glow)"
              />
            )}

            {/* Interactive Points */}
            {points.map((pt, idx) => (
              <g 
                key={idx} 
                onMouseEnter={() => setHoveredTrend(idx)}
                onMouseLeave={() => setHoveredTrend(null)}
                className="cursor-pointer group/point"
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="8"
                  fill="brand"
                  opacity="0"
                  className="group-hover/point:opacity-20 transition duration-150"
                />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="4.5"
                  fill={hoveredTrend === idx ? "brand" : "#ffffff"}
                  stroke={hoveredTrend === idx ? "#ffffff" : "#4f46e5"}
                  strokeWidth="2.5"
                  className="transition duration-150 shadow"
                />
              </g>
            ))}
          </svg>
        </div>

        {/* Month Labels */}
        <div className="flex justify-between text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-4 px-1">
          {monthlyTrends.map((t, idx) => (
            <span 
              key={idx} 
              className={`transition-all duration-200 cursor-pointer ${hoveredTrend === idx ? "text-orange-500 font-black scale-110" : ""}`}
              onMouseEnter={() => setHoveredTrend(idx)}
              onMouseLeave={() => setHoveredTrend(null)}
            >
              {t.month}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RevenueTrendsChart;
