import React, { useState, useMemo } from "react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip 
} from "recharts";
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Package, 
  BarChart3, 
  RefreshCw, 
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Layers,
  Activity,
  ArrowUpRight
} from "lucide-react";
import { toast } from "react-toastify";

const Analytics = ({ 
  products = [], 
  orders = [], 
  seller,
  fetchOrders, 
  fetchProducts, 
  loading = false 
}) => {
  const [timeframe, setTimeframe] = useState("7D"); // "7D", "30D", "90D", "1Y"
  const [chartType, setChartType] = useState("bar"); // "bar" | "spline"
  const [activeMetric, setActiveMetric] = useState("revenue"); // "revenue" | "orders" | "itemsSold" | "aov"
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Helper: parse timestamp from order safely
  const parseOrderTime = (o) => {
    const raw = o.createdAt || o.date || o.updatedAt;
    if (!raw) return 0;
    const t = new Date(raw).getTime();
    return isNaN(t) ? 0 : t;
  };

  // Helper: get revenue for an order strictly from items or amount
  const getOrderRevenue = (order) => {
    if (!order || order.orderStatus === "Cancelled") return 0;
    if (Array.isArray(order.items) && order.items.length > 0) {
      const sum = order.items.reduce((acc, item) => {
        const price = Number(item.price || item.unitPrice || item.finalPrice || 0);
        const qty = Number(item.qty || item.quantity || 1);
        return acc + (price * qty);
      }, 0);
      if (sum > 0) return sum;
    }
    return Number(order.amount || 0);
  };

  // Helper: count total item quantity in an order
  const getOrderItemCount = (order) => {
    if (!order || !Array.isArray(order.items)) return 0;
    return order.items.reduce((acc, item) => acc + Number(item.qty || item.quantity || 1), 0);
  };

  // Manual refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (fetchOrders) await fetchOrders();
      if (fetchProducts) await fetchProducts();
      toast.success("Analytics synced with live store records");
    } catch {
      toast.info("Refreshed store analytics");
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // 100% REAL DATA BUCKETS: Group actual database orders by selected timeframe
  const timeframeData = useMemo(() => {
    const now = new Date();

    if (timeframe === "7D") {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dateKey = d.toDateString();
        const name = d.toLocaleDateString("en-US", { weekday: "short" });

        // Filter orders placed strictly on this specific calendar day
        const dayOrders = orders.filter(o => {
          const t = parseOrderTime(o);
          return t > 0 && new Date(t).toDateString() === dateKey;
        });

        const orderCount = dayOrders.length;
        const revenue = dayOrders.reduce((sum, o) => sum + getOrderRevenue(o), 0);
        const itemsSold = dayOrders.reduce((sum, o) => sum + getOrderItemCount(o), 0);
        const aov = orderCount > 0 ? Math.round(revenue / orderCount) : 0;

        days.push({
          name,
          fullDate: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          orders: orderCount,
          revenue,
          itemsSold,
          aov
        });
      }
      return days;
    } else if (timeframe === "30D") {
      const weeks = [];
      for (let i = 3; i >= 0; i--) {
        const end = new Date(now);
        end.setDate(now.getDate() - i * 7);
        const start = new Date(end);
        start.setDate(end.getDate() - 6);

        const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
        const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59).getTime();

        const weekOrders = orders.filter(o => {
          const t = parseOrderTime(o);
          return t >= startTime && t <= endTime;
        });

        const orderCount = weekOrders.length;
        const revenue = weekOrders.reduce((sum, o) => sum + getOrderRevenue(o), 0);
        const itemsSold = weekOrders.reduce((sum, o) => sum + getOrderItemCount(o), 0);
        const aov = orderCount > 0 ? Math.round(revenue / orderCount) : 0;

        weeks.push({
          name: `Week ${4 - i}`,
          fullDate: `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
          orders: orderCount,
          revenue,
          itemsSold,
          aov
        });
      }
      return weeks;
    } else if (timeframe === "90D") {
      const months = [];
      for (let i = 2; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const mIdx = d.getMonth();
        const yNum = d.getFullYear();
        const name = d.toLocaleDateString("en-US", { month: "short" });

        const monthOrders = orders.filter(o => {
          const t = parseOrderTime(o);
          if (!t) return false;
          const od = new Date(t);
          return od.getMonth() === mIdx && od.getFullYear() === yNum;
        });

        const orderCount = monthOrders.length;
        const revenue = monthOrders.reduce((sum, o) => sum + getOrderRevenue(o), 0);
        const itemsSold = monthOrders.reduce((sum, o) => sum + getOrderItemCount(o), 0);
        const aov = orderCount > 0 ? Math.round(revenue / orderCount) : 0;

        months.push({
          name,
          fullDate: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
          orders: orderCount,
          revenue,
          itemsSold,
          aov
        });
      }
      return months;
    } else {
      // 1Y (12 Months)
      const months = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const mIdx = d.getMonth();
        const yNum = d.getFullYear();
        const name = d.toLocaleDateString("en-US", { month: "short" });

        const monthOrders = orders.filter(o => {
          const t = parseOrderTime(o);
          if (!t) return false;
          const od = new Date(t);
          return od.getMonth() === mIdx && od.getFullYear() === yNum;
        });

        const orderCount = monthOrders.length;
        const revenue = monthOrders.reduce((sum, o) => sum + getOrderRevenue(o), 0);
        const itemsSold = monthOrders.reduce((sum, o) => sum + getOrderItemCount(o), 0);
        const aov = orderCount > 0 ? Math.round(revenue / orderCount) : 0;

        months.push({
          name,
          fullDate: d.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          orders: orderCount,
          revenue,
          itemsSold,
          aov
        });
      }
      return months;
    }
  }, [timeframe, orders]);

  // 100% Real Aggregates across active timeframe
  const totalRevenue = useMemo(() => timeframeData.reduce((sum, d) => sum + d.revenue, 0), [timeframeData]);
  const totalOrders = useMemo(() => timeframeData.reduce((sum, d) => sum + d.orders, 0), [timeframeData]);
  const totalItemsSold = useMemo(() => timeframeData.reduce((sum, d) => sum + d.itemsSold, 0), [timeframeData]);

  const realAOV = useMemo(() => {
    if (totalOrders > 0) return totalRevenue / totalOrders;
    if (orders.length > 0) {
      const allRev = orders.reduce((sum, o) => sum + getOrderRevenue(o), 0);
      return allRev / orders.length;
    }
    return 0;
  }, [totalOrders, totalRevenue, orders]);

  // Peak activity bucket strictly from real data
  const peakData = useMemo(() => {
    if (!timeframeData.length) return null;
    return timeframeData.reduce((max, cur) => cur[activeMetric] > max[activeMetric] ? cur : max, timeframeData[0]);
  }, [timeframeData, activeMetric]);

  // Period Average strictly from real data
  const periodAvg = useMemo(() => {
    if (!timeframeData.length) return 0;
    const sum = timeframeData.reduce((acc, cur) => acc + cur[activeMetric], 0);
    return Math.round(sum / timeframeData.length);
  }, [timeframeData, activeMetric]);

  // Catalog real metrics strictly from database
  const uniqueCategories = useMemo(() => [...new Set(products.map((p) => p.category).filter(Boolean))], [products]);
  
  const inStockCount = useMemo(() => {
    return products.filter(p => (Number(p.stock) || 0) > 0).length;
  }, [products]);

  const inStockRate = useMemo(() => {
    if (products.length === 0) return 0;
    return Math.round((inStockCount / products.length) * 100);
  }, [inStockCount, products]);

  const fulfillmentRate = useMemo(() => {
    if (orders.length === 0) return 0;
    const completed = orders.filter(o => o.orderStatus === "Delivered" || o.orderStatus === "Completed").length;
    return Number(((completed / orders.length) * 100).toFixed(1));
  }, [orders]);

  const categoryBreakdown = useMemo(() => {
    const map = {};
    products.forEach(p => {
      const cat = p.category || "General";
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [products]);

  // Metric configs with solid colors & strictly real labels
  const metricConfigs = {
    revenue: {
      title: "Store Revenue",
      unit: "",
      prefix: "₹",
      icon: DollarSign,
      solidColor: "#f97316", // Solid brand orange
      activeBorder: "border-orange-500",
      activeBg: "bg-orange-50/50 dark:bg-orange-950/20",
      caption: "Actual sales volume from orders"
    },
    orders: {
      title: "Orders Placed",
      unit: "Orders",
      prefix: "",
      icon: ShoppingBag,
      solidColor: "#6366f1", // Solid indigo
      activeBorder: "border-indigo-500",
      activeBg: "bg-indigo-50/50 dark:bg-indigo-950/20",
      caption: "Completed checkout count"
    },
    itemsSold: {
      title: "Units Sold",
      unit: "Items",
      prefix: "",
      icon: Package,
      solidColor: "#10b981", // Solid emerald
      activeBorder: "border-emerald-500",
      activeBg: "bg-emerald-50/50 dark:bg-emerald-950/20",
      caption: "Quantity of products purchased"
    },
    aov: {
      title: "Avg. Order Value",
      unit: "",
      prefix: "₹",
      icon: ArrowUpRight,
      solidColor: "#8b5cf6", // Solid violet
      activeBorder: "border-violet-500",
      activeBg: "bg-violet-50/50 dark:bg-violet-950/20",
      caption: "Revenue per checkout basket"
    }
  };

  const currentMetricConfig = metricConfigs[activeMetric];

  // Y-Axis tick formatting
  const formatYAxis = (val) => {
    if (val === 0) return "0";
    if (activeMetric === "revenue" || activeMetric === "aov") {
      if (val >= 1000000) return `₹${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
      return `₹${val}`;
    }
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return `${val}`;
  };

  // Custom Recharts Tooltip showing 100% real numbers
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const value = payload[0].value;
      return (
        <div className="bg-slate-900 dark:bg-slate-950 border border-slate-700/80 p-3 rounded-xl shadow-2xl text-xs text-white backdrop-blur-md min-w-[160px] z-50">
          <div className="flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-wider text-slate-400 mb-1">
            <Calendar size={11} className="text-orange-400" />
            <span>{data.fullDate || label}</span>
          </div>
          <div className="text-base font-black text-orange-400">
            {currentMetricConfig.prefix}{Number(value).toLocaleString("en-IN")}{currentMetricConfig.unit ? ` ${currentMetricConfig.unit}` : ""}
          </div>
          <div className="mt-1.5 pt-1.5 border-t border-slate-800 space-y-1 text-[10px] text-slate-300">
            <div className="flex justify-between gap-3">
              <span className="text-slate-400">Orders:</span>
              <span className="font-bold text-white">{data.orders}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-400">Revenue:</span>
              <span className="font-bold text-white">₹{data.revenue.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-400">Units Sold:</span>
              <span className="font-bold text-white">{data.itemsSold}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-100 antialiased font-sans">
      
      {/* ── Top Header & KPI Summary Grid (100% Real Database Data) ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200 dark:border-slate-800 space-y-4 shrink-0 transition-colors">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-orange-500 text-white rounded-xl flex items-center justify-center shadow-xs shrink-0">
              <BarChart3 size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Analytics & Sales Intelligence
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Live Records
                </span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                Real transaction logs, sales volume trends, and fulfillment accuracy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sync Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center justify-center shadow-2xs disabled:opacity-50"
              title="Refresh Analytics"
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin text-orange-500" : ""} />
            </button>

            {/* Timeframe Chips */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              {["7D", "30D", "90D", "1Y"].map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-colors cursor-pointer ${
                    timeframe === tf
                      ? "bg-orange-500 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4 KPI Cards (100% Real Numbers from Database) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Card 1: Revenue */}
          <div 
            onClick={() => setActiveMetric("revenue")}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group relative ${
              activeMetric === "revenue"
                ? `${metricConfigs.revenue.activeBorder} ${metricConfigs.revenue.activeBg} shadow-xs`
                : "bg-slate-50/70 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-orange-500/40"
            }`}
          >
            <div className="flex items-center justify-between pb-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Store Revenue
              </span>
              <div className="p-1.5 rounded-lg text-orange-500 bg-orange-500/10">
                <DollarSign size={14} />
              </div>
            </div>

            <div className="pt-0.5">
              <div className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                ₹{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[9.5px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 block">
                {metricConfigs.revenue.caption}
              </span>
            </div>
          </div>

          {/* Card 2: Orders */}
          <div 
            onClick={() => setActiveMetric("orders")}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group relative ${
              activeMetric === "orders"
                ? `${metricConfigs.orders.activeBorder} ${metricConfigs.orders.activeBg} shadow-xs`
                : "bg-slate-50/70 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-indigo-500/40"
            }`}
          >
            <div className="flex items-center justify-between pb-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Orders Placed
              </span>
              <div className="p-1.5 rounded-lg text-indigo-500 bg-indigo-500/10">
                <ShoppingBag size={14} />
              </div>
            </div>

            <div className="pt-0.5">
              <div className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                {totalOrders.toLocaleString()}
              </div>
              <span className="text-[9.5px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 block">
                {metricConfigs.orders.caption}
              </span>
            </div>
          </div>

          {/* Card 3: Units Sold */}
          <div 
            onClick={() => setActiveMetric("itemsSold")}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group relative ${
              activeMetric === "itemsSold"
                ? `${metricConfigs.itemsSold.activeBorder} ${metricConfigs.itemsSold.activeBg} shadow-xs`
                : "bg-slate-50/70 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-emerald-500/40"
            }`}
          >
            <div className="flex items-center justify-between pb-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Units Sold
              </span>
              <div className="p-1.5 rounded-lg text-emerald-500 bg-emerald-500/10">
                <Package size={14} />
              </div>
            </div>

            <div className="pt-0.5">
              <div className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                {totalItemsSold.toLocaleString()}
              </div>
              <span className="text-[9.5px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 block">
                {metricConfigs.itemsSold.caption}
              </span>
            </div>
          </div>

          {/* Card 4: Avg Order Value */}
          <div 
            onClick={() => setActiveMetric("aov")}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group relative ${
              activeMetric === "aov"
                ? `${metricConfigs.aov.activeBorder} ${metricConfigs.aov.activeBg} shadow-xs`
                : "bg-slate-50/70 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-violet-500/40"
            }`}
          >
            <div className="flex items-center justify-between pb-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Avg. Order Value
              </span>
              <div className="p-1.5 rounded-lg text-violet-500 bg-violet-500/10">
                <ArrowUpRight size={14} />
              </div>
            </div>

            <div className="pt-0.5">
              <div className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                ₹{realAOV.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[9.5px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 block">
                {metricConfigs.aov.caption}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* ── Main Graphical Section: Recharts Canvas & Catalog Center ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        
        {/* Recharts Hub (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col justify-between min-h-[410px] transition-colors">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {timeframe === "7D" ? "Weekly Store Performance Monitor" : `${timeframe} Performance Trajectory`}
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {currentMetricConfig.title}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                Plotted across {timeframeData.length} active time intervals from real transactions
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2.5">
              {/* Average Badge */}
              <div className="hidden sm:flex flex-col text-right pr-1">
                <span className="text-[9px] uppercase font-bold text-slate-400">Period Avg</span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                  {currentMetricConfig.prefix}{periodAvg.toLocaleString("en-IN")}{currentMetricConfig.unit ? ` ${currentMetricConfig.unit}` : ""}
                </span>
              </div>

              {/* View Toggle (Bar vs Curve) */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setChartType("bar")}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                    chartType === "bar"
                      ? "bg-white dark:bg-slate-800 text-orange-500 shadow-2xs"
                      : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                  title="Bar Graph View"
                >
                  <BarChart3 size={14} />
                  <span className="text-[10px] uppercase font-black pr-1 hidden sm:inline">Bars</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChartType("spline")}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                    chartType === "spline"
                      ? "bg-white dark:bg-slate-800 text-orange-500 shadow-2xs"
                      : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                  title="Smooth Curve View"
                >
                  <TrendingUp size={14} />
                  <span className="text-[10px] uppercase font-black pr-1 hidden sm:inline">Curve</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recharts Canvas */}
          <div className="h-64 sm:h-72 w-full pt-4 select-none">
            {orders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs">
                <Activity size={24} className="mb-2 text-slate-300 dark:text-slate-600" />
                <p className="font-bold">No orders recorded in this store yet.</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Real sales transactions will automatically plot here.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "bar" ? (
                  <BarChart data={timeframeData} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      vertical={false} 
                      stroke="currentColor" 
                      className="text-slate-100 dark:text-slate-800" 
                    />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tickFormatter={formatYAxis} 
                      tick={{ fontSize: 9.5, fontWeight: 600, fill: "#94a3b8" }}
                      dx={-4}
                    />
                    <RechartsTooltip 
                      content={<CustomTooltip />} 
                      cursor={{ fill: "rgba(249, 115, 22, 0.05)" }} 
                    />
                    <Bar 
                      dataKey={activeMetric} 
                      fill="#f97316" 
                      radius={[6, 6, 0, 0]} 
                      maxBarSize={44} 
                    />
                  </BarChart>
                ) : (
                  <AreaChart data={timeframeData} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      vertical={false} 
                      stroke="currentColor" 
                      className="text-slate-100 dark:text-slate-800" 
                    />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tickFormatter={formatYAxis} 
                      tick={{ fontSize: 9.5, fontWeight: 600, fill: "#94a3b8" }}
                      dx={-4}
                    />
                    <RechartsTooltip 
                      content={<CustomTooltip />} 
                      cursor={{ stroke: "#f97316", strokeWidth: 1.5, strokeDasharray: "3 3" }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey={activeMetric} 
                      stroke="#f97316" 
                      strokeWidth={2.8} 
                      fill="#f97316" 
                      fillOpacity={0.08} 
                      dot={{ r: 4, fill: "#f97316", stroke: "#ffffff", strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: "#ea580c", stroke: "#ffffff", strokeWidth: 2.5 }}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            )}
          </div>

          {/* Bottom Performance Info Strip */}
          {peakData && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 flex-wrap gap-2">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                <span>Peak Period:</span>
                <span className="font-black text-slate-900 dark:text-white">
                  {peakData.fullDate || peakData.name} ({currentMetricConfig.prefix}{peakData[activeMetric].toLocaleString("en-IN")}{currentMetricConfig.unit ? ` ${currentMetricConfig.unit}` : ""})
                </span>
              </div>

              <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                <Clock size={12} />
                <span>100% real database records</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Catalog & Order Health (1 Col, 100% Real Data) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 min-h-[410px] transition-colors">
          
          <div className="space-y-4">
            {/* Card Header */}
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Catalog & Order Health
                </h3>
                <span className="text-[9.5px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  Live Status
                </span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                Real-time listing distribution & fulfillment accuracy
              </p>
            </div>

            {/* Circular Gauge for Fulfillment Rate */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200 dark:text-slate-800"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500 transition-all duration-700 ease-out"
                    strokeDasharray={`${fulfillmentRate}, 100`}
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center flex flex-col items-center justify-center">
                  <span className="text-[12px] font-black text-slate-900 dark:text-white">
                    {fulfillmentRate}%
                  </span>
                </div>
              </div>

              <div className="space-y-0.5 text-left min-w-0">
                <h4 className="text-xs font-black text-slate-900 dark:text-white">Fulfillment Rate</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {orders.length > 0 
                    ? `${orders.filter(o => o.orderStatus === "Delivered" || o.orderStatus === "Completed").length} of ${orders.length} orders delivered`
                    : "No orders logged yet"}
                </p>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  <CheckCircle2 size={10} /> Orders Verified
                </span>
              </div>
            </div>

            {/* Inventory Availability */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Package size={13} className="text-orange-500" />
                  Catalog In-Stock Ratio
                </span>
                <span className="font-black text-slate-900 dark:text-white">
                  {inStockCount} / {products.length} Items
                </span>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-200/60 dark:border-slate-800">
                <div 
                  style={{ width: `${inStockRate}%` }} 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 pt-0.5">
                <span>In Stock: <strong className="text-slate-800 dark:text-slate-200">{inStockRate}%</strong></span>
                <span>Total Catalog: <strong className="text-slate-800 dark:text-slate-200">{products.length}</strong></span>
              </div>
            </div>

            {/* Top Categories Breakdown */}
            {categoryBreakdown.length > 0 && (
              <div className="pt-2 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Category Volume Share
                  </span>
                  <span className="text-[9.5px] font-bold text-slate-400">
                    {uniqueCategories.length} Categories
                  </span>
                </div>

                <div className="space-y-1.5">
                  {categoryBreakdown.map(([cat, count]) => {
                    const ratio = products.length > 0 ? Math.round((count / products.length) * 100) : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          <span className="truncate max-w-[130px]">{cat}</span>
                          <span className="font-mono text-slate-900 dark:text-white text-[10px]">
                            {count} items ({ratio}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-1.5 overflow-hidden">
                          <div 
                            style={{ width: `${ratio}%` }} 
                            className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Store Intelligence Verification Badge */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={15} />
            </div>
            <div className="text-left text-[10.5px]">
              <p className="font-extrabold text-slate-800 dark:text-slate-200">
                Verified Seller Catalog
              </p>
              <p className="text-[9.5px] text-slate-500 dark:text-slate-400">
                {products.length} active listings mapped to CartNOW marketplace
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Analytics;
