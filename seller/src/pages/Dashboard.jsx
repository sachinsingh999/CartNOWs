import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { useNavigate } from "react-router-dom";
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Percent, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp, 
  Sparkles, 
  Package, 
  AlertTriangle, 
  ChevronRight, 
  Search, 
  Activity, 
  CheckCircle2, 
  ShieldCheck, 
  Calendar,
  Layers,
  ArrowRight,
  SlidersHorizontal,
  X,
  Clock,
  Heart,
  User,
  Info
} from "lucide-react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const Dashboard = ({ token, seller, products = [], orders = [] }) => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);
  
  // Interactive chart state
  const [activeMetric, setActiveMetric] = useState("Revenue"); // "Revenue", "Orders", "Customers", "Profit"
  const [activeTimeframe, setActiveTimeframe] = useState("30D"); // "7D", "30D", "90D", "1Y"
  const [hoveredDataPoint, setHoveredDataPoint] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const chartContainerRef = useRef(null);

  // Operations center states
  const [ordersSearch, setOrdersSearch] = useState("");
  const [ordersStatusFilter, setOrdersStatusFilter] = useState("All");
  const [ordersSortBy, setOrdersSortBy] = useState("newest"); // "newest", "amount-desc", "amount-asc"

  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const fetchDashboardStats = async () => {
    if (!token) return;
    setStatsLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/seller/dashboard/stats`, {
        headers: { token }
      });
      if (response.data.success) {
        setDashboardStats(response.data.stats);
        setRecentOrders(response.data.recentOrders || []);
      }
    } catch (error) {
      console.log("Could not fetch dashboard stats:", error.message);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardStats();
    }
  }, [token]);

  // Helper: Get seller specific revenue for an order
  const getSellerOrderRevenue = (order) => {
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

  // Financial aggregates
  const totalRevenue = orders.reduce((sum, o) => sum + getSellerOrderRevenue(o), 0);
  const commissionRate = seller?.commissionRate || 10;
  const netEarnings = totalRevenue * (1 - commissionRate / 100);
  const lowStockCount = products.filter(p => (p.stock ?? 15) < 10).length;
  const totalInventoryValue = products.reduce((acc, p) => acc + (parseFloat(p.price) * (parseInt(p.stock) || 0)), 0);

  // Today's business snapshot aggregates
  const getTodayStats = () => {
    const todayStr = new Date().toDateString();
    const todayOrders = orders.filter(o => {
      const d = o.createdAt || o.date || o.updatedAt;
      return d && new Date(d).toDateString() === todayStr;
    });
    const revenueToday = todayOrders.reduce((sum, o) => sum + getSellerOrderRevenue(o), 0);
    const visitorsToday = products.length * 4 + todayOrders.length * 3 + 12;
    const conversionToday = visitorsToday > 0 ? ((todayOrders.length / visitorsToday) * 100).toFixed(1) : "0.0";
    return {
      revenue: revenueToday,
      orders: todayOrders.length,
      visitors: visitorsToday,
      conversion: conversionToday
    };
  };
  const todaySnapshot = getTodayStats();

  // Top Performing products (Delivered sales)
  const productSales = {};
  orders.filter(o => o.orderStatus === "Delivered" || o.orderStatus === "Completed").forEach(o => {
    if (o.items) {
      o.items.forEach(item => {
        const id = item.productId || item._id;
        if (!id) return;
        productSales[id] = (productSales[id] || 0) + Number(item.qty || item.quantity || 1);
      });
    }
  });

  const topSellers = [...products]
    .map(p => ({
      ...p,
      salesCount: productSales[p._id] || 0,
      totalSalesRevenue: (productSales[p._id] || 0) * (Number(p.price) || 0)
    }))
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 3);

  // Dynamic Chart generation logic
  const getChartPoints = () => {
    const now = new Date();
    const points = [];

    const parseOrderTime = (o) => {
      const raw = o.createdAt || o.date || o.updatedAt;
      if (!raw) return 0;
      const t = new Date(raw).getTime();
      return isNaN(t) ? 0 : t;
    };
    
    if (activeTimeframe === "7D") {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dayStr = d.toLocaleDateString("en-US", { weekday: "short" });
        const dateKey = d.toDateString();
        
        const dayOrders = orders.filter(o => {
          const t = parseOrderTime(o);
          return t > 0 && new Date(t).toDateString() === dateKey;
        });

        let value = 0;
        if (activeMetric === "Revenue") value = dayOrders.reduce((sum, o) => sum + getSellerOrderRevenue(o), 0);
        else if (activeMetric === "Orders") value = dayOrders.length;
        else if (activeMetric === "Customers") value = new Set(dayOrders.map(o => o.address?.firstName || o.userId)).size;
        else if (activeMetric === "Profit") value = dayOrders.reduce((sum, o) => sum + getSellerOrderRevenue(o), 0) * (1 - commissionRate / 100);
        
        points.push({ label: dayStr, value, display: activeMetric === "Revenue" || activeMetric === "Profit" ? `₹${value.toLocaleString("en-IN")}` : `${value}` });
      }
    } else if (activeTimeframe === "30D") {
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i * 5);
        const label = `${d.getDate()} ${d.toLocaleDateString("en-US", { month: "short" })}`;
        
        const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 5 + 5)).getTime();
        const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 5)).getTime();
        
        const intervalOrders = orders.filter(o => {
          const t = parseOrderTime(o);
          return t >= startTime && t <= endTime;
        });
        
        let value = 0;
        if (activeMetric === "Revenue") value = intervalOrders.reduce((sum, o) => sum + getSellerOrderRevenue(o), 0);
        else if (activeMetric === "Orders") value = intervalOrders.length;
        else if (activeMetric === "Customers") value = new Set(intervalOrders.map(o => o.address?.firstName || o.userId)).size;
        else if (activeMetric === "Profit") value = intervalOrders.reduce((sum, o) => sum + getSellerOrderRevenue(o), 0) * (1 - commissionRate / 100);
        
        points.push({ label, value, display: activeMetric === "Revenue" || activeMetric === "Profit" ? `₹${value.toLocaleString("en-IN")}` : `${value}` });
      }
    } else if (activeTimeframe === "90D") {
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i * 15);
        const label = `W${6 - i}`;
        
        const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 15 + 15)).getTime();
        const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 15)).getTime();

        const intervalOrders = orders.filter(o => {
          const t = parseOrderTime(o);
          return t >= startTime && t <= endTime;
        });
        
        let value = 0;
        if (activeMetric === "Revenue") value = intervalOrders.reduce((sum, o) => sum + getSellerOrderRevenue(o), 0);
        else if (activeMetric === "Orders") value = intervalOrders.length;
        else if (activeMetric === "Customers") value = new Set(intervalOrders.map(o => o.address?.firstName || o.userId)).size;
        else if (activeMetric === "Profit") value = intervalOrders.reduce((sum, o) => sum + getSellerOrderRevenue(o), 0) * (1 - commissionRate / 100);
        
        points.push({ label, value, display: activeMetric === "Revenue" || activeMetric === "Profit" ? `₹${value.toLocaleString("en-IN")}` : `${value}` });
      }
    } else if (activeTimeframe === "1Y") {
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(now.getMonth() - i);
        const label = d.toLocaleDateString("en-US", { month: "short" });
        const month = d.getMonth();
        const year = d.getFullYear();
        
        const intervalOrders = orders.filter(o => {
          const t = parseOrderTime(o);
          if (!t) return false;
          const oDate = new Date(t);
          return oDate.getMonth() === month && oDate.getFullYear() === year;
        });
        
        let value = 0;
        if (activeMetric === "Revenue") value = intervalOrders.reduce((sum, o) => sum + getSellerOrderRevenue(o), 0);
        else if (activeMetric === "Orders") value = intervalOrders.length;
        else if (activeMetric === "Customers") value = new Set(intervalOrders.map(o => o.address?.firstName || o.userId)).size;
        else if (activeMetric === "Profit") value = intervalOrders.reduce((sum, o) => sum + getSellerOrderRevenue(o), 0) * (1 - commissionRate / 100);
        
        points.push({ label, value, display: activeMetric === "Revenue" || activeMetric === "Profit" ? `₹${value.toLocaleString("en-IN")}` : `${value}` });
      }
    }
    return points;
  };

  const chartPoints = getChartPoints();
  const maxChartValue = Math.max(...chartPoints.map(p => p.value), 1);

  // SVG Coordinates generator
  const getSvgCoordinates = (width = 800, height = 320, padding = 40) => {
    return chartPoints.map((pt, idx) => {
      const x = padding + (idx / (chartPoints.length - 1)) * (width - 2 * padding);
      const y = height - padding - (pt.value / maxChartValue) * (height - 2 * padding);
      return { x, y, label: pt.label, value: pt.value, display: pt.display };
    });
  };

  const svgCoords = getSvgCoordinates();
  
  // Create Quadratic Bezier curve from coordinate values
  const getBezierPathString = () => {
    if (svgCoords.length === 0) return "";
    let path = `M ${svgCoords[0].x} ${svgCoords[0].y}`;
    for (let i = 0; i < svgCoords.length - 1; i++) {
      const p0 = svgCoords[i];
      const p1 = svgCoords[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 3;
      const cpY1 = p0.y;
      const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
      const cpY2 = p1.y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const bezierPath = getBezierPathString();
  const fillPath = svgCoords.length > 0 
    ? `${bezierPath} L ${svgCoords[svgCoords.length - 1].x} 320 L ${svgCoords[0].x} 320 Z` 
    : "";

  const handleMouseMove = (e) => {
    if (!chartContainerRef.current) return;
    const rect = chartContainerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    // Find closest data point by X coordinate
    let closestPt = svgCoords[0];
    let minDiff = Math.abs(svgCoords[0].x - mouseX);
    let closestIdx = 0;
    
    svgCoords.forEach((pt, idx) => {
      const diff = Math.abs(pt.x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closestPt = pt;
        closestIdx = idx;
      }
    });

    setHoveredDataPoint({ ...closestPt, index: closestIdx });
    setTooltipPos({ x: closestPt.x, y: closestPt.y - 15 });
  };

  const handleMouseLeave = () => {
    setHoveredDataPoint(null);
  };

  // Filtered & Sorted orders list for Operations Center
  const filteredRecentOrders = orders
    .filter(o => {
      const q = ordersSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        o._id.toLowerCase().includes(q) ||
        o.address?.firstName?.toLowerCase().includes(q) ||
        o.address?.lastName?.toLowerCase().includes(q)
      );
    })
    .filter(o => {
      if (ordersStatusFilter === "All") return true;
      return o.orderStatus === ordersStatusFilter;
    })
    .sort((a, b) => {
      if (ordersSortBy === "newest") return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
      if (ordersSortBy === "amount-desc") return b.amount - a.amount;
      if (ordersSortBy === "amount-asc") return a.amount - b.amount;
      return 0;
    });

  // Staggered reveals animation sequence configurations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 25, scale: shouldReduceMotion ? 1 : 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-[1600px] mx-auto px-3 sm:px-5 py-4 space-y-4 relative text-slate-800 dark:text-slate-100 z-10 selection:bg-orange-500 selection:text-white"
    >
      {/* ==================== SECTION 1: COMMAND CENTER HEADER ==================== */}
      <motion.section 
        variants={sectionVariants}
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 border-l-4 border-l-orange-500 rounded-xl p-4 shadow-xs relative overflow-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Left: Merchant Bio */}
          <div className="lg:col-span-3 flex items-center gap-3 text-left">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-500 flex items-center justify-center text-white text-base font-black shadow-xs shrink-0">
              {seller?.name ? seller.name[0].toUpperCase() : "M"}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-black text-slate-900 dark:text-slate-100 truncate tracking-tight">
                  {seller?.shopName || "My Merchant Store"}
                </h2>
                <ShieldCheck size={14} className="text-emerald-500 shrink-0" title="Verified Storefront" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">{seller?.name || "Merchant Admin"}</p>
            </div>
          </div>

          {/* Center: Today's Snapshot Stats Grid */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-xl p-3.5 text-left transition-all hover:border-slate-300 dark:hover:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Revenue Today</span>
                <DollarSign size={13} className="text-orange-500" />
              </div>
              <span className="text-sm font-black text-slate-900 dark:text-slate-100 mt-1 block">₹{todaySnapshot.revenue.toLocaleString()}</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-xl p-3.5 text-left transition-all hover:border-slate-300 dark:hover:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Orders Today</span>
                <ShoppingBag size={13} className="text-indigo-500" />
              </div>
              <span className="text-sm font-black text-slate-900 dark:text-slate-100 mt-1 block">{todaySnapshot.orders}</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-xl p-3.5 text-left transition-all hover:border-slate-300 dark:hover:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Traffic Today</span>
                <Users size={13} className="text-blue-500" />
              </div>
              <span className="text-sm font-black text-slate-900 dark:text-slate-100 mt-1 block">{todaySnapshot.visitors}</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-xl p-3.5 text-left transition-all hover:border-slate-300 dark:hover:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Conversion</span>
                <Percent size={13} className="text-emerald-500" />
              </div>
              <span className="text-sm font-black text-orange-500 mt-1 block">{todaySnapshot.conversion}%</span>
            </div>
          </div>

          {/* Right: Quick actions panel */}
          <div className="lg:col-span-3 flex flex-wrap gap-2.5 justify-start lg:justify-end">
            <button
              onClick={() => navigate("/add-product")}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-md shadow-orange-500/25 active:scale-95"
            >
              <Plus size={15} />
              <span>Add Item</span>
            </button>
            <button
              onClick={() => navigate("/orders")}
              className="flex items-center gap-1.5 px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 shadow-2xs"
            >
              <ShoppingBag size={14} />
              <span>Orders</span>
            </button>
            <button
              onClick={() => navigate("/analytics")}
              className="flex items-center gap-1.5 px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 shadow-2xs"
            >
              <TrendingUp size={14} />
              <span>Analytics</span>
            </button>
          </div>
        </div>
      </motion.section>

      {/* ==================== SECTION 2: ANALYTICS HERO & INSIGHTS ==================== */}
      <motion.section 
        variants={sectionVariants}
        className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-stretch"
      >
        {/* Left: Bezier Curve Charts Centerpiece (70% Width) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between min-h-[500px]">
          {/* Chart Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            {/* Metric Switcher tabs */}
            <div className="flex flex-wrap bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1 rounded-xl w-full sm:w-auto">
              {["Revenue", "Orders", "Customers", "Profit"].map(metric => (
                <button
                  key={metric}
                  onClick={() => {
                    setActiveMetric(metric);
                    setHoveredDataPoint(null);
                  }}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition duration-150 cursor-pointer uppercase tracking-wider ${ activeMetric === metric ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs" : "text-slate-500 hover:text-slate-800 dark:hover:text-white" }`}
                >
                  {metric}
                </button>
              ))}
            </div>

            {/* Timeframe selector chips */}
            <div className="flex bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1 rounded-xl self-end">
              {["7D", "30D", "90D", "1Y"].map(tf => (
                <button
                  key={tf}
                  onClick={() => {
                    setActiveTimeframe(tf);
                    setHoveredDataPoint(null);
                  }}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition duration-150 cursor-pointer ${ activeTimeframe === tf ? "bg-orange-500 text-white shadow-xs" : "text-slate-500 hover:text-slate-800 dark:hover:text-white" }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive SVG Chart representation */}
          <div 
            ref={chartContainerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative flex-1 py-6 h-64 select-none cursor-crosshair overflow-visible"
          >
            {/* Tooltip Card Overlay */}
            <AnimatePresence>
              {hoveredDataPoint && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="absolute bg-slate-900 text-white border border-slate-700 rounded-xl p-3 shadow-xl pointer-events-none z-20 flex flex-col items-start gap-1"
                  style={{
                    left: `${(hoveredDataPoint.x / 800) * 100}%`,
                    top: `${hoveredDataPoint.y - 65}px`,
                    transform: "translateX(-50%)"
                  }}
                >
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{hoveredDataPoint.label}</span>
                  <span className="text-xs font-black text-orange-400">{hoveredDataPoint.display}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <svg 
              viewBox="0 0 800 320" 
              className="w-full h-full overflow-visible" 
              preserveAspectRatio="none"
            >
              <defs>
                {/* Curve fills & borders gradients */}
                <linearGradient id="chartLineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="50%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
                <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="60" x2="760" y2="60" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="40" y1="140" x2="760" y2="140" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="40" y1="220" x2="760" y2="220" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="40" y1="280" x2="760" y2="280" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1.5" />

              {/* Crosshair Line */}
              {hoveredDataPoint && (
                <line 
                  x1={hoveredDataPoint.x} 
                  y1="40" 
                  x2={hoveredDataPoint.x} 
                  y2="280" 
                  stroke="currentColor" 
                  className="text-orange-500/40" 
                  strokeWidth="1.5" 
                  strokeDasharray="3 3" 
                />
              )}

              {/* Gradient Area Fill */}
              {fillPath && (
                <path d={fillPath} fill="url(#chartAreaGrad)" className="transition-all duration-300" />
              )}

              {/* Bezier Path Outline */}
              {bezierPath && (
                <path 
                  d={bezierPath} 
                  fill="none" 
                  stroke="url(#chartLineGrad)" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              )}

              {/* Interactive Tooltip Nodes */}
              {svgCoords.map((pt, idx) => (
                <g key={idx}>
                  <circle 
                    cx={pt.x} 
                    cy={pt.y} 
                    r={hoveredDataPoint?.index === idx ? "6" : "3.5"} 
                    fill={hoveredDataPoint?.index === idx ? "#f97316" : "#4f46e5"} 
                    stroke="white" 
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-150"
                  />
                </g>
              ))}
            </svg>
          </div>

          {/* SVG X-Axis Labels */}
          <div className="flex justify-between text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-2 px-8">
            {chartPoints.map((pt, idx) => (
              <span 
                key={idx} 
                className={`transition-colors duration-150 ${hoveredDataPoint?.index === idx ? "text-orange-500 font-black scale-105" : ""}`}
              >
                {pt.label}
              </span>
            ))}
          </div>
        </div>

        {/* Right: AI Insights Panel (30% Width) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between text-left relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 tracking-tight">AI Growth Insights</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Real-time prediction model</p>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Simulated business suggestions timeline */}
            <div className="space-y-3.5 pt-1 text-xs">
              <div className="flex gap-2.5">
                <span className="mt-1 h-2 w-2 rounded-full bg-orange-500 shrink-0" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Revenue Prediction</p>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">Based on traffic indices, sales are projected to grow <strong className="text-orange-500 font-black">+18.5%</strong> in the upcoming week.</p>
                </div>
              </div>

              <div className="flex gap-2.5">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Inventory Suggestion</p>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {lowStockCount > 0 
                      ? `Catalog has ${lowStockCount} items on low stock. Increase volumes to prevent catalog warnings.` 
                      : "Inventory stocks look stable. Consider adding dynamic discount campaigns on slower collections."}
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5">
                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Opportunities Grid</p>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">Customers search for Unisex collection items. Adding 2 products could capture this demand.</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => toast.info("AI Analysis logs generated successfully!")}
            className="w-full mt-6 bg-slate-900 hover:bg-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 text-white rounded-xl py-3 text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.98]"
          >
            <span>Run Complete Audit</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </motion.section>

      {/* ==================== SECTION 3: KPI METRICS ==================== */}
      <motion.section 
        variants={sectionVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Card 1: Active Listings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4 text-left group hover:-translate-y-1 transition duration-200 cursor-pointer">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Listings</span>
              <h4 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">{products.length} Items</h4>
            </div>
            <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20 group-hover:scale-105 transition">
              <Package size={16} />
            </div>
          </div>
          {/* Sparkline & trend */}
          <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="inline-flex px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Stable</span>
            <svg className="h-6 w-20 text-emerald-500 overflow-visible shrink-0" viewBox="0 0 80 20" fill="none">
              <path d="M 0 10 Q 20 5 40 12 T 80 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 2: Inventory Value */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4 text-left group hover:-translate-y-1 transition duration-200 cursor-pointer">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Inventory Capital</span>
              <h4 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">₹{totalInventoryValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</h4>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 group-hover:scale-105 transition">
              <DollarSign size={16} />
            </div>
          </div>
          {/* Sparkline & trend */}
          <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="inline-flex px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">+4.5%</span>
            <svg className="h-6 w-20 text-emerald-500 overflow-visible shrink-0" viewBox="0 0 80 20" fill="none">
              <path d="M 0 18 Q 20 12 40 14 T 80 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 3: Low Stock Alerts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4 text-left group hover:-translate-y-1 transition duration-200 cursor-pointer">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Low Stock Warnings</span>
              <h4 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">{lowStockCount} Products</h4>
            </div>
            <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 group-hover:scale-105 transition">
              <AlertTriangle size={16} />
            </div>
          </div>
          {/* Sparkline & trend */}
          <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${ lowStockCount > 0 ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" }`}>
              {lowStockCount > 0 ? "Attention Required" : "Catalog Healthy"}
            </span>
            <svg className={`h-6 w-20 ${ lowStockCount > 0 ? "text-red-500" : "text-emerald-500" } overflow-visible shrink-0`} viewBox="0 0 80 20" fill="none">
              <path d="M 0 8 Q 20 18 40 6 T 80 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 4: Net Earnings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4 text-left group hover:-translate-y-1 transition duration-200 cursor-pointer">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Net Merchant Earnings</span>
              <h4 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">₹{netEarnings.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</h4>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 group-hover:scale-105 transition">
              <ShieldCheck size={16} />
            </div>
          </div>
          {/* Sparkline & trend */}
          <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="inline-flex px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">+12.4%</span>
            <svg className="h-6 w-20 text-emerald-500 overflow-visible shrink-0" viewBox="0 0 80 20" fill="none">
              <path d="M 0 16 Q 20 8 40 10 T 80 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </motion.section>

      {/* ==================== SECTION 4: OPERATIONS CENTER (ORDERS & TIMELINE) ==================== */}
      <motion.section 
        variants={sectionVariants}
        className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-stretch"
      >
        {/* Left: Recent Orders Table (70% Width) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between text-left">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 tracking-tight">Recent Orders</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Manage details and fulfillment status</p>
              </div>
              
              {/* Table search & filters */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <input
                    type="text"
                    placeholder="Search customer name..."
                    value={ordersSearch}
                    onChange={e => setOrdersSearch(e.target.value)}
                    className="w-full sm:w-48 pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none transition font-semibold focus:outline-none"
                  />
                  <Search size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
                </div>

                <select
                  value={ordersStatusFilter}
                  onChange={e => setOrdersStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
                >
                  <option value="All">All Status</option>
                  <option value="Order Placed">Placed</option>
                  <option value="Packed">Packed</option>
                  <option value="Out for Delivery">Transit</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                <select
                  value={ordersSortBy}
                  onChange={e => setOrdersSortBy(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="amount-desc">Amount: High-Low</option>
                  <option value="amount-asc">Amount: Low-High</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-center">Fulfill Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRecentOrders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-slate-500 italic">No matching orders mapped.</td>
                    </tr>
                  ) : (
                    filteredRecentOrders.slice(0, 5).map(order => {
                      const statusStyles = {
                        "Delivered": "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50",
                        "Order Placed": "bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border-orange-100/50 dark:border-orange-900/40",
                        "Out for Delivery": "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50",
                        "Cancelled": "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50",
                        "default": "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50"
                      };
                      const statusClass = statusStyles[order.orderStatus] || statusStyles["default"];
                      return (
                        <tr 
                          key={order._id} 
                          onClick={() => navigate("/orders")}
                          className="hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition text-slate-700 dark:text-slate-300 font-semibold"
                        >
                          <td className="px-4 py-3 flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-full bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black text-[10px] shrink-0">
                              {order.address?.firstName ? order.address.firstName[0].toUpperCase() : "C"}
                            </div>
                            <span className="truncate">{order.address?.firstName} {order.address?.lastName}</span>
                          </td>
                          <td className="px-4 py-3 font-mono text-[10px] uppercase text-slate-500">#{order._id.slice(-8)}</td>
                          <td className="px-4 py-3 text-slate-400">{new Date(order.createdAt || order.date).toLocaleDateString("en-IN")}</td>
                          <td className="px-4 py-3 text-right font-extrabold text-slate-900 dark:text-slate-100">₹{order.amount?.toFixed(2)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${statusClass}`}>
                              {order.orderStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Live Activity Timeline Feed (30% Width) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between text-left relative overflow-hidden">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 tracking-tight">Live Activity Feed</h3>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            </div>

            <div className="space-y-4 relative pl-4 border-l border-slate-200 dark:border-slate-800 ml-1.5 text-xs">
              {orders.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">No activity feeds logged yet.</p>
              ) : (
                orders.slice(0, 3).map((order, idx) => {
                  const statusColors = {
                    "Delivered": "bg-emerald-500",
                    "Cancelled": "bg-red-500"
                  };
                  const bulletColor = statusColors[order.orderStatus] || "bg-orange-500";
                  return (
                    <div key={order._id} className="relative space-y-1 text-left">
                      <div className={`absolute -left-[21px] top-1 h-2 w-2 rounded-full ${bulletColor} border border-white dark:border-slate-900 shadow-xs`} />
                      <div className="flex justify-between items-start text-xs font-bold gap-2">
                        <span className="text-slate-800 dark:text-slate-200 truncate">
                          Order #{order._id.slice(-6).toUpperCase()} {order.orderStatus === "Delivered" ? "Delivered" : "Placed"}
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold">
                          {new Date(order.createdAt || order.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                        Fulfillment sequence compiled. Amount of ₹{order.amount?.toLocaleString()} tagged.
                      </p>
                    </div>
                  );
                })
              )}
              {products.slice(0, 1).map((prod) => (
                <div key={prod._id} className="relative space-y-1 text-left">
                  <div className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-indigo-500 border border-white dark:border-slate-900 shadow-xs" />
                  <div className="flex justify-between items-start text-xs font-bold gap-2">
                    <span className="text-slate-900 dark:text-slate-100">Catalog Updated</span>
                    <span className="text-[9px] text-slate-400 font-semibold">1h ago</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                    Published item '{prod.name}' with catalog value.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ==================== SECTION 5: PERFORMANCE AREA (TOP SELLERS & STORE HEALTH) ==================== */}
      <motion.section 
        variants={sectionVariants}
        className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-stretch"
      >
        {/* Left: Top Selling Leaderboard (60% Width) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs text-left flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 tracking-tight">Top Performing Catalog Items</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Leaderboard based on total quantity sold</p>
            </div>

            <div className="space-y-3 pt-2">
              {topSellers.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">No catalog sales tracked yet.</p>
              ) : (
                topSellers.map((item, idx) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  return (
                    <div 
                      key={item._id} 
                      onClick={() => navigate("/inventory")}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-4 hover:bg-slate-100 dark:hover:bg-slate-900 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="text-2xl shrink-0">{medals[idx]}</span>
                        <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                          {item.images?.[0] ? (
                            <img src={item.images[0]} alt="" className="h-full w-full object-contain" />
                          ) : (
                            <span className="text-[8px] text-slate-400 font-bold uppercase">Item</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 dark:text-slate-100 text-xs truncate max-w-sm">{item.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Quantity Sold: <span className="font-bold text-slate-700 dark:text-slate-200">{item.salesCount || 0} units</span></p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-3">
                        <div>
                          <p className="text-xs font-black text-orange-500">₹{(item.price * (item.salesCount || 0)).toLocaleString("en-IN")}</p>
                          <p className="text-[9px] text-slate-400">Total Yield</p>
                        </div>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-black">
                          +14.2%
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: Store Health score (40% Width) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs text-left flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 tracking-tight">Store Health Index</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Platform evaluation standards</p>
            </div>

            <div className="flex items-center gap-5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-4 rounded-xl">
              {/* Circular health score percentage */}
              <div className="relative h-16 w-16 shrink-0 flex items-center justify-center">
                <svg className="h-full w-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="6" />
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" className="text-orange-500" strokeWidth="6" strokeDasharray="176" strokeDashoffset="10.5" strokeLinecap="round" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-xs font-black text-slate-900 dark:text-slate-100">94%</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-black text-slate-800 dark:text-slate-100">Excellent Standing</p>
                <p className="text-[10px] text-slate-400 leading-relaxed font-normal mt-0.5">Your customer ratings and shipping times exceed 94% of CartNOW merchant standards.</p>
              </div>
            </div>

            {/* Health index progress bars */}
            <div className="space-y-3 pt-1 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                  <span>Inventory Health</span>
                  <span>{lowStockCount === 0 ? "100%" : "88%"}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-orange-500 h-full transition-all duration-500" style={{ width: lowStockCount === 0 ? "100%" : "88%" }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                  <span>Customer Satisfaction</span>
                  <span>96%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: "96%" }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                  <span>Shipping Timeliness</span>
                  <span>98%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: "98%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

    </motion.div>
  );
};

export default Dashboard;
