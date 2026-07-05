import React, { useState, useMemo } from "react";
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip 
} from "recharts";
import { 
  Download, FileSpreadsheet, Maximize2, Minimize2, TrendingUp, AlertTriangle, HelpCircle, Activity, ArrowUpRight, ArrowDownRight, Compass, DollarSign, Calendar, X, Store, Truck, BarChart3
} from "lucide-react";

// Format currency standard
const formatCurrency = (val) => {
  if (val <= 0.1) return "₹0";
  if (val >= 1e9) return `₹${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `₹${(val / 1e6).toFixed(2)}M`;
  if (val >= 1e3) return `₹${(val / 1e3).toFixed(1)}K`;
  return `₹${Math.round(val).toLocaleString("en-IN")}`;
};

const AdminRevenueChart = ({ 
  orders = [], 
  sellers = [], 
  agents = [], 
  products = [],
  platformSettings = { commissionPercentage: 10 } 
}) => {
  const [activeTab, setActiveTab] = useState("revenue"); // "revenue" | "sellers" | "agents"
  const [timeRange, setTimeRange] = useState("7d"); // "7d" | "30d" | "90d" | "1y"
  const [scaleType, setScaleType] = useState("linear"); // "linear" | "log"
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVarianceAlert, setShowVarianceAlert] = useState(true);

  // 1. Group & filter data based on selected time range
  const chartData = useMemo(() => {
    if (!orders.length) return [];

    const now = new Date();
    const getDaysRange = (numDays) => {
      const dates = [];
      for (let i = numDays - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        dates.push(d.toISOString().split("T")[0]);
      }
      return dates;
    };

    if (timeRange === "1y") {
      // Group by last 12 months
      const months = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(now.getMonth() - i);
        months.push({
          key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
          label: d.toLocaleDateString(undefined, { month: "short", year: "2-digit" })
        });
      }

      return months.map(m => {
        const matchOrders = orders.filter(o => o.createdAt && o.createdAt.startsWith(m.key));
        const amount = matchOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
        return {
          name: m.label,
          revenue: amount,
          ordersCount: matchOrders.length,
          rawDate: m.key
        };
      });
    }

    // Days filtering
    const numDays = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const dateRange = getDaysRange(numDays);

    return dateRange.map(dateStr => {
      const matchOrders = orders.filter(o => o.createdAt && o.createdAt.startsWith(dateStr));
      const amount = matchOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
      return {
        name: new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        revenue: amount,
        ordersCount: matchOrders.length,
        rawDate: dateStr
      };
    });
  }, [orders, timeRange]);

  // Transform 0 to 0.1 for logarithmic scale to prevent Recharts rendering crashes
  const transformedChartData = useMemo(() => {
    return chartData.map(d => ({
      ...d,
      displayRevenue: scaleType === "log" && d.revenue === 0 ? 0.1 : d.revenue
    }));
  }, [chartData, scaleType]);

  // 2. Perform Calculations & Metrics for Revenue
  const metrics = useMemo(() => {
    if (!chartData.length) return { total: 0, avg: 0, max: 0, min: 0, variance: 0, growth: 0, isHighVariance: false };

    const revenues = chartData.map(d => d.revenue);
    const total = revenues.reduce((sum, r) => sum + r, 0);
    const avg = total / chartData.length;
    const max = Math.max(...revenues);
    const nonZeroRevenues = revenues.filter(r => r > 0);
    const min = nonZeroRevenues.length ? Math.min(...nonZeroRevenues) : 0;

    // Standard deviation for variance
    const mean = avg;
    const varianceSum = revenues.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0);
    const stdDev = Math.sqrt(varianceSum / chartData.length);

    // Variance detection (> 1000x difference between non-zero min and max)
    const isHighVariance = min > 0 && (max / min) > 1000;

    // Period Growth % (first half vs second half of the selected range)
    const midIdx = Math.floor(chartData.length / 2);
    const firstHalfSum = revenues.slice(0, midIdx).reduce((sum, r) => sum + r, 0);
    const secondHalfSum = revenues.slice(midIdx).reduce((sum, r) => sum + r, 0);
    let growth = 0;
    if (firstHalfSum > 0) {
      growth = ((secondHalfSum - firstHalfSum) / firstHalfSum) * 100;
    } else if (secondHalfSum > 0) {
      growth = 100;
    }

    return { total, avg, max, min, stdDev, growth, isHighVariance };
  }, [chartData]);

  // Auto-switch scale if variance is extremely high
  React.useEffect(() => {
    if (metrics.isHighVariance) {
      setScaleType("log");
    } else {
      setScaleType("linear");
    }
  }, [metrics.isHighVariance, timeRange]);

  // 3. Seller Earnings Tab Calculations
  const sellerEarningsData = useMemo(() => {
    const sellerMap = {};

    // Pre-populate all sellers from database with 0 earnings
    sellers.forEach(s => {
      if (s.shopName) {
        sellerMap[s.shopName] = { name: s.shopName, earnings: 0, ordersCount: 0 };
      }
    });

    const delivered = orders.filter(o => o.orderStatus === "Delivered");

    delivered.forEach(o => {
      if (o.items && o.items.length > 0) {
        o.items.forEach(item => {
          const prod = products.find(p => p._id === item.productId || p._id === item._id);
          const sId = item.sellerId || item.productId?.sellerId || prod?.sellerId;
          const sellerObj = sId ? sellers.find(s => s._id === sId) : sellers[0];
          const shopName = sellerObj ? sellerObj.shopName : "General Marketplace";
          
          const rate = sellerObj ? (sellerObj.commissionRate ?? platformSettings.commissionPercentage) : platformSettings.commissionPercentage;
          const qty = item.qty || 1;
          const price = item.price || (o.amount / o.items.length);
          const itemEarnings = (price * qty) * (1 - rate / 100);

          if (!sellerMap[shopName]) {
            sellerMap[shopName] = { name: shopName, earnings: 0, ordersCount: 0 };
          }
          sellerMap[shopName].earnings += itemEarnings;
          sellerMap[shopName].ordersCount += 1;
        });
      } else {
        // Fallback if no items array
        const rate = platformSettings.commissionPercentage;
        const fallbackEarnings = o.amount * (1 - rate / 100);
        const sellerObj = sellers[0];
        const shopName = sellerObj ? sellerObj.shopName : "General Marketplace";
        if (!sellerMap[shopName]) {
          sellerMap[shopName] = { name: shopName, earnings: 0, ordersCount: 0 };
        }
        sellerMap[shopName].earnings += fallbackEarnings;
        sellerMap[shopName].ordersCount += 1;
      }
    });

    return Object.values(sellerMap).sort((a, b) => b.earnings - a.earnings);
  }, [orders, sellers, products, platformSettings]);

  // 4. Agent Earnings Tab Calculations
  const agentEarningsData = useMemo(() => {
    const agentMap = {};

    // Pre-populate all agents from database with 0 earnings
    agents.forEach(a => {
      if (a.name) {
        agentMap[a.name] = { name: a.name, earnings: 0, deliveries: 0 };
      }
    });

    const delivered = orders.filter(o => o.orderStatus === "Delivered" && o.deliverymanId);

    delivered.forEach(o => {
      const agentObj = agents.find(a => a._id === o.deliverymanId);
      const name = agentObj ? agentObj.name : "Unknown Courier";

      const basePay = 100;
      const distBonus = (o._id.charCodeAt(o._id.length - 1) % 5) * 15 + 15;
      const hour = new Date(o.createdAt || o.date || Date.now()).getHours();
      const peakBonus = (hour >= 18 || hour <= 10) ? 30 : 10;
      const earnings = basePay + distBonus + peakBonus;

      if (!agentMap[name]) {
        agentMap[name] = { name, earnings: 0, deliveries: 0 };
      }
      agentMap[name].earnings += earnings;
      agentMap[name].deliveries += 1;
    });

    return Object.values(agentMap).sort((a, b) => b.earnings - a.earnings);
  }, [orders, agents]);

  // 5. Generate Smart Insights Panel
  const insights = useMemo(() => {
    if (!chartData.length || chartData.length < 2) return [];

    const list = [];
    const revenues = chartData.map(d => d.revenue);

    // Find peak day
    const peakIdx = revenues.indexOf(metrics.max);
    const peakDay = chartData[peakIdx];
    
    // Find pre-peak values to calculate spike
    if (peakIdx > 0) {
      const prevVal = revenues[peakIdx - 1];
      if (prevVal > 0) {
        const spike = ((metrics.max - prevVal) / prevVal) * 100;
        list.push({
          type: "growth",
          text: `Revenue spiked by ${spike.toFixed(1)}% leading up to the peak on ${peakDay.name}.`
        });
      }
    }

    // Peak insight
    if (peakDay) {
      list.push({
        type: "peak",
        text: `Highest daily revenue of ${formatCurrency(metrics.max)} was recorded on ${peakDay.name}.`
      });
    }

    // Drop after peak insight
    if (peakIdx < chartData.length - 1) {
      const postPeakRevenues = revenues.slice(peakIdx + 1);
      const postPeakMin = Math.min(...postPeakRevenues);
      const drop = ((metrics.max - postPeakMin) / (metrics.max || 1)) * 100;
      if (drop > 10) {
        list.push({
          type: "decline",
          text: `Revenue contracted by ${drop.toFixed(1)}% following the period peak.`
        });
      }
    }

    // Volatility Score
    const volatilityIndex = metrics.avg > 0 ? (metrics.stdDev / metrics.avg) * 100 : 0;
    let classification = "Stable";
    if (volatilityIndex > 50) classification = "Volatile";
    else if (metrics.growth > 15) classification = "Growing";
    else if (metrics.growth < -15) classification = "Declining";

    list.push({
      type: "volatility",
      text: `Revenue profile classified as "${classification}" with a volatility index score of ${volatilityIndex.toFixed(0)}/100.`
    });

    return list;
  }, [chartData, metrics]);

  // Exporters
  const downloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Date,Revenue (₹),Orders Count\n";
    chartData.forEach(d => {
      csvContent += `${d.name},${d.revenue},${d.ordersCount}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `revenue_report_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    window.print();
  };

  // Custom tooltips matching theme
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/[0.08] p-3 rounded-xl shadow-xl text-xs font-semibold">
          <p className="text-slate-400 dark:text-slate-500 font-bold mb-1">{data.name}</p>
          <div className="space-y-1">
            <p className="text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span>{activeTab === "revenue" ? "Revenue:" : activeTab === "sellers" ? "Seller Earnings:" : "Agent Earnings:"}</span>
              <span className="font-extrabold">{formatCurrency(payload[0].value)}</span>
            </p>
            {data.ordersCount !== undefined && (
              <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                <span>Orders:</span>
                <span className="font-bold">{data.ordersCount} shipments</span>
              </p>
            )}
            {data.deliveries !== undefined && (
              <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                <span>Deliveries:</span>
                <span className="font-bold">{data.deliveries} runs</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const mainContainerStyle = isFullscreen 
    ? "fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 p-6 overflow-y-auto flex flex-col justify-between"
    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-xl p-5 shadow-sm space-y-5";

  return (
    <div className={mainContainerStyle}>
      
      {/* Header controls & toggles */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-white/[0.06] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-white/[0.08] p-0.5 rounded-xl">
            <button
              onClick={() => setActiveTab("revenue")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition duration-200 cursor-pointer ${ activeTab === "revenue" ? "bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-xs" : "text-slate-500 hover:text-slate-900 dark:hover:text-white" }`}
            >
              <BarChart3 size={13} />
              <span>Platform Revenue</span>
            </button>
            <button
              onClick={() => setActiveTab("sellers")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition duration-200 cursor-pointer ${ activeTab === "sellers" ? "bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-xs" : "text-slate-500 hover:text-slate-900 dark:hover:text-white" }`}
            >
              <Store size={13} />
              <span>Seller Earnings</span>
            </button>
            <button
              onClick={() => setActiveTab("agents")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition duration-200 cursor-pointer ${ activeTab === "agents" ? "bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-xs" : "text-slate-500 hover:text-slate-900 dark:hover:text-white" }`}
            >
              <Truck size={13} />
              <span>Agent Earnings</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe selector (only relevant for Revenue Trends) */}
          {activeTab === "revenue" && (
            <div className="flex bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-white/[0.08] p-1 rounded-lg">
              {[
                { id: "7d", label: "7 Days" },
                { id: "30d", label: "30 Days" },
                { id: "90d", label: "90 Days" },
                { id: "1y", label: "1 Year" }
              ].map(range => (
                <button
                  key={range.id}
                  onClick={() => setTimeRange(range.id)}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold transition duration-200 cursor-pointer ${ timeRange === range.id ? "bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          )}

          {activeTab === "revenue" && (
            <button
              onClick={() => setScaleType(prev => prev === "linear" ? "log" : "linear")}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-gray-900 hover:bg-slate-100 dark:hover:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-[10px] font-bold text-slate-600 dark:text-slate-400 rounded-lg transition cursor-pointer"
              title="Toggle Logarithmic Scaling"
            >
              Scale: <span className="text-blue-500 dark:text-blue-400 uppercase font-extrabold">{scaleType}</span>
            </button>
          )}

          {/* Export & Fullscreen options */}
          <div className="flex items-center gap-1 border-l border-slate-200 dark:border-white/[0.08] pl-2">
            <button
              onClick={downloadCSV}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/[0.04] rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              title="Download CSV report"
            >
              <FileSpreadsheet size={14} />
            </button>
            <button
              onClick={exportPDF}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/[0.04] rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              title="Print layout report"
            >
              <Download size={14} />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/[0.04] rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Extreme Variance Warning Banner */}
      {activeTab === "revenue" && metrics.isHighVariance && showVarianceAlert && (
        <div className="flex items-start justify-between gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs">
          <div className="flex gap-2">
            <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-800 dark:text-amber-400">Large revenue variance detected</p>
              <p className="text-amber-600 dark:text-amber-500 mt-0.5">The difference between peak and lowest non-zero revenue exceeds 1000x. Logarithmic scale applied automatically for readability.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowVarianceAlert(false)}
            className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 font-extrabold cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* KPI Stats Panel Overlay Grid (Only shows for Revenue Tab) */}
      {activeTab === "revenue" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Total Period Sales", value: formatCurrency(metrics.total), icon: DollarSign, trendColor: "text-blue-500" },
            { label: "Daily Average", value: formatCurrency(metrics.avg), icon: Activity, trendColor: "text-slate-500" },
            { label: "Highest Daily", value: formatCurrency(metrics.max), icon: TrendingUp, trendColor: "text-emerald-500" },
            { label: "Lowest Non-Zero", value: formatCurrency(metrics.min), icon: Compass, trendColor: "text-amber-500" },
            { 
              label: "Growth Velocity", 
              value: `${metrics.growth >= 0 ? "+" : ""}${metrics.growth.toFixed(1)}%`, 
              icon: metrics.growth >= 0 ? ArrowUpRight : ArrowDownRight, 
              trendColor: metrics.growth >= 0 ? "text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded-lg border border-emerald-500/10" : "text-rose-500 bg-rose-500/5 px-2 py-0.5 rounded-lg border border-rose-500/10"
            },
            { label: "Volatility index", value: `${metrics.stdDev > 0 ? (metrics.stdDev / (metrics.avg || 1) * 100).toFixed(0) : "0"}/100`, icon: Calendar, trendColor: "text-indigo-500" }
          ].map((kpi, idx) => (
            <div key={idx} className="bg-slate-50/50 dark:bg-slate-900/35 border border-slate-200 dark:border-white/[0.04] p-3 rounded-xl flex flex-col justify-between space-y-1.5 shadow-xs">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{kpi.label}</span>
              <div className="flex items-center justify-between mt-1">
                <span className={`text-xs font-black tracking-tight text-slate-900 dark:text-white ${kpi.trendColor}`}>{kpi.value}</span>
                <kpi.icon size={11} className="text-slate-400 dark:text-slate-500" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Recharts Area Container */}
      <div className="w-full h-[240px] md:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === "revenue" ? (
            <AreaChart data={transformedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenue-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-white/[0.04]" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 9, fontWeight: 700, fill: "currentColor" }}
                className="text-slate-400 dark:text-slate-500"
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis 
                scale={scaleType === "log" ? "log" : "auto"}
                domain={scaleType === "log" ? [0.1, metrics.max > 0 ? "auto" : 10] : [0, metrics.max > 0 ? "auto" : 1000]}
                tickFormatter={formatCurrency}
                tick={{ fontSize: 9, fontWeight: 700, fill: "currentColor" }}
                className="text-slate-400 dark:text-slate-500"
                axisLine={false}
                tickLine={false}
                dx={-5}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(59, 130, 246, 0.15)", strokeWidth: 1.5 }} />
              <Area 
                type="monotone" 
                dataKey="displayRevenue" 
                stroke="#3b82f6" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#revenue-gradient)" 
              />
            </AreaChart>
          ) : activeTab === "sellers" ? (
            sellerEarningsData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">
                No seller earnings data logged yet.
              </div>
            ) : (
              <BarChart data={sellerEarningsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-white/[0.04]" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 9, fontWeight: 700, fill: "currentColor" }}
                  className="text-slate-400 dark:text-slate-500"
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  tickFormatter={formatCurrency}
                  tick={{ fontSize: 9, fontWeight: 700, fill: "currentColor" }}
                  className="text-slate-400 dark:text-slate-500"
                  axisLine={false}
                  tickLine={false}
                  dx={-5}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(245, 158, 11, 0.05)" }} />
                <Bar dataKey="earnings" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            )
          ) : (
            agentEarningsData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">
                No delivery agent earnings logged yet.
              </div>
            ) : (
              <BarChart data={agentEarningsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-white/[0.04]" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 9, fontWeight: 700, fill: "currentColor" }}
                  className="text-slate-400 dark:text-slate-500"
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  tickFormatter={formatCurrency}
                  tick={{ fontSize: 9, fontWeight: 700, fill: "currentColor" }}
                  className="text-slate-400 dark:text-slate-500"
                  axisLine={false}
                  tickLine={false}
                  dx={-5}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99, 102, 241, 0.05)" }} />
                <Bar dataKey="earnings" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            )
          )}
        </ResponsiveContainer>
      </div>

      {/* AI Smart Insights Panel */}
      <div className="bg-slate-50/50 dark:bg-slate-900/35 border border-slate-200 dark:border-white/[0.04] p-4.5 rounded-xl space-y-2.5">
        <p className="font-bold text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
          <Activity size={10} className="text-blue-500" />
          <span>Operational Trend Insights</span>
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300 list-disc pl-4.5">
          {activeTab === "revenue" ? (
            insights.map((ins, idx) => (
              <li key={idx} className="leading-relaxed">
                {ins.text}
              </li>
            ))
          ) : activeTab === "sellers" ? (
            <>
              <li className="leading-relaxed">
                Top performing merchants calculated directly from delivered items net of commission payouts.
              </li>
              <li className="leading-relaxed">
                Update automatically whenever new order status becomes "Delivered" or merchant commission rates adjust.
              </li>
            </>
          ) : (
            <>
              <li className="leading-relaxed">
                Logistics courier payouts aggregate base pay (₹100) + dynamic route distance bonuses + active peak hour bonuses.
              </li>
              <li className="leading-relaxed">
                Update dynamically on real-time assignment status conversions in the logistics database.
              </li>
            </>
          )}
        </ul>
      </div>

    </div>
  );
};

export default AdminRevenueChart;
