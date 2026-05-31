import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { 
  BarChart3, 
  DollarSign, 
  ShoppingBag, 
  Box, 
  ClipboardList, 
  RotateCcw, 
  MessageSquare, 
  TrendingUp, 
  ArrowRight,
  Clock,
  User
} from "lucide-react";

const Dashboard = ({ token }) => {
  const [data, setData] = useState({
    products: [],
    orders: [],
    returns: [],
    support: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;
      try {
        const [prodRes, orderRes, returnRes, supportRes] = await Promise.all([
          axios.get(`${backendUrl}/api/product/list`),
          axios.post(`${backendUrl}/api/order/list`, {}, { headers: { token } }),
          axios.post(`${backendUrl}/api/service/returns/admin/list`, {}, { headers: { token } }),
          axios.post(`${backendUrl}/api/service/help/admin/list`, {}, { headers: { token } }),
        ]);

        setData({
          products: prodRes.data.success ? prodRes.data.products : [],
          orders: orderRes.data.success ? orderRes.data.orders : [],
          returns: returnRes.data.success ? returnRes.data.returns : [],
          support: supportRes.data.success ? supportRes.data.helpRequests : [],
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to load dashboard metrics");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="h-10 bg-slate-200/60 rounded-xl w-48"></div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3">
              <div className="h-6 bg-slate-100 rounded w-16"></div>
              <div className="h-8 bg-slate-200 rounded w-24"></div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-white border border-slate-200/80 rounded-2xl p-5"></div>
          <div className="h-72 bg-white border border-slate-200/80 rounded-2xl p-5"></div>
        </div>
      </div>
    );
  }

  // calculations
  const totalRevenue = data.orders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
  const totalOrdersCount = data.orders.length;
  const aov = totalOrdersCount > 0 ? (totalRevenue / totalOrdersCount).toFixed(0) : 0;
  const totalProductsCount = data.products.length;
  
  // Pending actions (returns requested + support open)
  const pendingReturns = data.returns.filter((r) => r.status === "Requested").length;
  const openSupport = data.support.filter((s) => s.status === "Open").length;
  const pendingTasks = pendingReturns + openSupport;

  // Order Fulfillment rate
  const completedOrders = data.orders.filter((o) => o.orderStatus === "Delivered").length;
  const fulfillmentRate = totalOrdersCount > 0 ? Math.round((completedOrders / totalOrdersCount) * 100) : 0;

  // Calculate Daily Sales (Last 7 Days) for SVG line chart
  const getLast7Days = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }
    return dates;
  };

  const last7Dates = getLast7Days();
  const salesByDate = last7Dates.map((dateStr) => {
    const dayOrders = data.orders.filter((o) => {
      if (!o.createdAt) return false;
      return o.createdAt.startsWith(dateStr);
    });
    const amount = dayOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
    return {
      date: new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      amount
    };
  });

  const maxSalesAmount = Math.max(...salesByDate.map((d) => d.amount), 1000);

  // SVG Line Chart coordinates calculations
  const chartWidth = 500;
  const chartHeight = 160;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;

  const points = salesByDate.map((d, i) => {
    const x = paddingLeft + (i * graphWidth) / 6;
    const y = chartHeight - paddingBottom - (d.amount / maxSalesAmount) * graphHeight;
    return { x, y, amount: d.amount, date: d.date };
  });

  let linePath = "";
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ");
  }

  const areaPath = linePath 
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`
    : "";

  // Category inventories count
  const categoryCounts = {};
  data.products.forEach((p) => {
    if (p.category) {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    }
  });
  const categoryStats = Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const maxCategoryCount = Math.max(...categoryStats.map((c) => c.count), 1);

  // Circular gauge calculations
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (fulfillmentRate / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-450">
          Executive Summary
        </p>
        <div className="flex items-center gap-2.5 mt-1">
          <BarChart3 size={22} className="text-slate-900" />
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h2>
        </div>
      </div>

      {/* Top Indicators Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Earnings</p>
            <p className="text-2xl font-black text-slate-900 mt-1">₹{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="h-11 w-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100 shadow-inner">
            <DollarSign size={20} />
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Orders</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalOrdersCount}</p>
          </div>
          <div className="h-11 w-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 shadow-inner">
            <ShoppingBag size={20} />
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Average Order Value</p>
            <p className="text-2xl font-black text-slate-900 mt-1">₹{Number(aov).toLocaleString()}</p>
          </div>
          <div className="h-11 w-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100 shadow-inner">
            <TrendingUp size={20} />
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Actions</p>
            <p className={`text-2xl font-black mt-1 ${pendingTasks > 0 ? "text-rose-600" : "text-slate-900"}`}>{pendingTasks}</p>
          </div>
          <div className={`h-11 w-11 rounded-xl flex items-center justify-center border shadow-inner ${
            pendingTasks > 0 
              ? "bg-rose-50 text-rose-600 border-rose-100 animate-pulse" 
              : "bg-slate-50 text-slate-600 border-slate-100"
          }`}>
            <Clock size={20} />
          </div>
        </div>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Sales Line Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Revenue Trend (Last 7 Days)</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 uppercase font-bold tracking-wider">Dynamic sales volume graph</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
              Live updates
            </span>
          </div>

          <div className="relative w-full overflow-hidden">
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(15, 23, 42)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="rgb(15, 23, 42)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                const y = paddingTop + ratio * graphHeight;
                const value = Math.round(maxSalesAmount * (1 - ratio));
                return (
                  <g key={index}>
                    <line 
                      x1={paddingLeft} 
                      y1={y} 
                      x2={chartWidth - paddingRight} 
                      y2={y} 
                      stroke="rgba(226, 232, 240, 0.8)" 
                      strokeWidth="1" 
                      strokeDasharray="4"
                    />
                    <text 
                      x={paddingLeft - 10} 
                      y={y + 4} 
                      textAnchor="end" 
                      className="text-[9px] font-bold fill-slate-400"
                    >
                      ₹{value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
                    </text>
                  </g>
                );
              })}

              {/* Shaded Area Under Line */}
              {areaPath && <path d={areaPath} fill="url(#chart-gradient)" />}

              {/* Main Line Stroke */}
              {linePath && (
                <path 
                  d={linePath} 
                  fill="none" 
                  stroke="rgb(15, 23, 42)" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              )}

              {/* Data points */}
              {points.map((p, i) => (
                <g key={i} className="group cursor-pointer">
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r="4" 
                    fill="white" 
                    stroke="rgb(15, 23, 42)" 
                    strokeWidth="2" 
                    className="transition duration-150 group-hover:r-5"
                  />
                  {/* Tooltip on hover */}
                  <text 
                    x={p.x} 
                    y={p.y - 10} 
                    textAnchor="middle" 
                    className="text-[8px] font-extrabold fill-slate-800 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900"
                  >
                    ₹{p.amount}
                  </text>
                  
                  {/* X Axis Labels */}
                  <text 
                    x={p.x} 
                    y={chartHeight - 10} 
                    textAnchor="middle" 
                    className="text-[9px] font-bold fill-slate-400"
                  >
                    {p.date}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Circular fulfillment & Categories Bar Panel */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Fulfillment Rate</h3>
            <p className="text-[10px] text-slate-400 mt-0.5 uppercase font-bold tracking-wider">Completed vs. Active orders</p>
          </div>

          <div className="flex items-center justify-around gap-4 py-2">
            {/* SVG circular progress ring */}
            <div className="relative flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90 overflow-visible">
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  stroke="rgba(241, 245, 249, 0.9)"
                  strokeWidth="7"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  stroke="rgb(15, 23, 42)"
                  strokeWidth="7"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-xl font-black text-slate-900 tracking-tight">{fulfillmentRate}%</span>
                <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Rate</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="text-xs text-slate-600 space-y-1.5 pl-2">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-950"></span>
                <span className="font-medium text-slate-500">Delivered:</span>
                <span className="font-bold text-slate-900">{completedOrders}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-200"></span>
                <span className="font-medium text-slate-500">Processing:</span>
                <span className="font-bold text-slate-900">{totalOrdersCount - completedOrders}</span>
              </div>
            </div>
          </div>

          {/* Categories Stats summary */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Inventory Categories</p>
            {categoryStats.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No products added yet.</p>
            ) : (
              <div className="space-y-2.5">
                {categoryStats.map((stat, i) => {
                  const percentage = Math.round((stat.count / maxCategoryCount) * 100);
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{stat.name}</span>
                        <span className="font-medium text-slate-450">{stat.count} products</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-slate-900 rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Feeds Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Orders Feed */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Orders</h3>
            <Link 
              to="/orders" 
              className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition"
            >
              View All <ArrowRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {data.orders.slice(0, 4).length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4">No recent orders.</p>
            ) : (
              data.orders.slice(0, 4).map((order) => (
                <div key={order._id} className="py-3 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800">
                      {order.address?.firstName} {order.address?.lastName || ""}
                    </p>
                    <p className="text-slate-450 font-medium">
                      {order.items?.length || 0} items · {order.paymentMethod.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-slate-900">₹{order.amount}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Support Tickets Feed */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Active Inquiries</h3>
            <Link 
              to="/support" 
              className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition"
            >
              Help Desk <ArrowRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {data.support.slice(0, 4).length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4">No active inquiries.</p>
            ) : (
              data.support.slice(0, 4).map((ticket) => (
                <div key={ticket._id} className="py-3 flex items-start justify-between text-xs gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-bold text-slate-800 truncate">{ticket.subject}</p>
                    <p className="text-slate-450 font-medium truncate flex items-center gap-1">
                      <User size={11} className="text-slate-400" />
                      {ticket.name} · {ticket.category}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border self-center shrink-0 ${
                    ticket.status === "Resolved" 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                      : ticket.status === "In Progress" 
                        ? "bg-amber-50 text-amber-700 border-amber-100" 
                        : "bg-rose-50 text-rose-700 border-rose-100"
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
