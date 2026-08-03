import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import {
  ShoppingBag, Calendar, Clock, CheckCircle,
  Inbox, AlertTriangle, Search, Filter, RefreshCw,
  TrendingUp, Truck, CheckCircle2, AlertOctagon
} from "lucide-react";

import OrderCard, { getDeadlineInfo } from "../components/OrderCard";
import DetailDrawer from "../components/DetailDrawer";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [datePreset, setDatePreset] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'delivered', 'overdue'

  // Selected Order for drawer
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchAllOrder = async () => {
    if (!token) return;
    setIsRefreshing(true);
    try {
      const res = await axios.post(`${backendUrl}/api/order/list`, {}, { headers: { token } });
      if (res.data.success) {
        setOrders(res.data.orders);
        // Update selected order details inside drawer if open
        if (selectedOrder) {
          const updated = res.data.orders.find(o => o._id === selectedOrder._id);
          if (updated) setSelectedOrder(updated);
        }
      }
      else toast.error(res.data.message);
    } catch (e) { toast.error(e.message); }
    setIsRefreshing(false);
  };

  const fetchDrivers = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${backendUrl}/api/deliveryman/list`, { headers: { token } });
      if (res.data.success) setDrivers(res.data.drivers);
    } catch (e) { console.log(e); }
  };

  const assignHandler = async (orderId, driverId) => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/deliveryman/assign`,
        { orderId, deliverymanId: driverId || null },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        await fetchAllOrder();
      }
      else toast.error(res.data.message);
    } catch (e) { toast.error(e.message); }
  };

  const statusHandler = async (orderId, status) => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/order/status`,
        { orderId, status },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        await fetchAllOrder();
      }
      else toast.error(res.data.message);
    } catch (e) { toast.error(e.message); }
  };

  useEffect(() => {
    if (!token) return;
    fetchAllOrder();
    fetchDrivers();
  }, [token]);

  const handlePreset = (preset) => {
    setDatePreset(preset);
    const now = new Date();
    if (preset === "all")   { setStartDate(""); setEndDate(""); return; }
    if (preset === "today") { const t = now.toISOString().split("T")[0]; setStartDate(t); setEndDate(t); return; }
    if (preset === "week")  { const p = new Date(); p.setDate(now.getDate()-7); setStartDate(p.toISOString().split("T")[0]); setEndDate(now.toISOString().split("T")[0]); return; }
    if (preset === "month") { const p = new Date(); p.setMonth(now.getMonth()-1); setStartDate(p.toISOString().split("T")[0]); setEndDate(now.toISOString().split("T")[0]); return; }
  };

  const filtered = orders
    .filter(o => {
      if (!o.createdAt) return true;
      const d = new Date(o.createdAt);
      if (startDate) { const s = new Date(startDate); s.setHours(0,0,0,0); if (d < s) return false; }
      if (endDate)   { const e = new Date(endDate);   e.setHours(23,59,59,999); if (d > e) return false; }
      return true;
    })
    .filter(o => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase().trim();
      const shortId = o._id.slice(-6).toUpperCase();
      const customerName = `${o.address.firstName} ${o.address.lastName || ""}`.toLowerCase();
      const customerPhone = o.address.phone ? String(o.address.phone) : "";
      const customerEmail = o.address.email ? String(o.address.email).toLowerCase() : "";
      return (
        o._id.toLowerCase().includes(q) ||
        shortId.includes(q.toUpperCase()) ||
        customerName.includes(q) ||
        customerPhone.includes(q) ||
        customerEmail.includes(q)
      );
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const active    = filtered.filter(o => o.orderStatus !== "Delivered");
  const delivered = filtered.filter(o => o.orderStatus === "Delivered");

  // Overdue count for alert
  const overdueActive = active.filter(o => {
    const dl = getDeadlineInfo(o.createdAt, o.orderStatus);
    return dl?.level === "overdue" || dl?.level === "critical";
  });
  const overdueCount = overdueActive.length;

  const totalRevenue = filtered.reduce((acc, o) => acc + o.amount, 0);

  const handleOpenDrawer = (order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  return (
    <div className="flex flex-col md:h-[calc(100vh-120px)] h-auto space-y-6 animate-fadeIn text-slate-800 dark:text-slate-100 pb-4">

      {/* ── Single Consolidated Container: Header, KPI Stats, & Filter Controls ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs space-y-3.5 shrink-0">
        
        {/* Top: Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-slate-950 to-slate-800 dark:from-indigo-600 dark:to-indigo-500 flex items-center justify-center shadow-xs shrink-0">
              <ShoppingBag size={15} className="text-slate-100 dark:text-white" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 leading-none">Dispatch & Operations Control</p>
              <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white mt-0.5">
                Orders Command Center
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {overdueCount > 0 && (
              <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-lg px-3 py-1 shrink-0 animate-pulse">
                <AlertTriangle size={12} className="text-rose-600 dark:text-rose-500" />
                <span className="text-[9px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                  {overdueCount} SLA Overdue
                </span>
              </div>
            )}
            
            <button 
              onClick={fetchAllOrder}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition duration-200 cursor-pointer shadow-xs active:scale-95 disabled:opacity-50 flex items-center justify-center"
              title="Refresh Orders List"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin text-indigo-500" : ""} />
            </button>
          </div>
        </div>

        {/* Middle: KPI Stats Mini Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              key: "all",
              label: "Total Registered",
              val: filtered.length,
              sub: `₹${totalRevenue.toLocaleString()}`,
              icon: TrendingUp,
              color: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/15"
            },
            {
              key: "active",
              label: "Active Dispatches",
              val: active.length,
              sub: "In delivery cycle",
              icon: Truck,
              color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/15"
            },
            {
              key: "delivered",
              label: "Successful Runs",
              val: delivered.length,
              sub: "Delivered to client",
              icon: CheckCircle2,
              color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/15"
            },
            {
              key: "overdue",
              label: "SLA Overdue",
              val: overdueCount,
              sub: "Action required",
              icon: AlertOctagon,
              color: "text-rose-600 dark:text-rose-500 bg-rose-500/10 border-rose-500/15"
            }
          ].map(card => {
            const isSelected = statusFilter === card.key;
            const Icon = card.icon;
            return (
              <div
                key={card.key}
                onClick={() => setStatusFilter(card.key)}
                className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between group relative overflow-hidden ${ isSelected ? "bg-slate-950 border-slate-950 text-slate-100 dark:text-white dark:bg-indigo-600 dark:border-indigo-500 shadow-xs" : "bg-slate-50/70 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700/80" }`}
              >
                {isSelected && (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_120px_at_100%_0%,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
                )}
                <div className="space-y-1 relative z-10 text-left">
                  <span className={`text-[8px] font-black uppercase tracking-widest ${ isSelected ? "text-slate-300 dark:text-indigo-100" : "text-slate-400 dark:text-slate-500" }`}>
                    {card.label}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black tracking-tight">{card.val}</span>
                    <span className={`text-[9px] font-black uppercase tracking-wider ${ isSelected ? "text-slate-300 dark:text-indigo-200" : "text-slate-400 dark:text-slate-500" }`}>
                      {card.sub}
                    </span>
                  </div>
                </div>
                <div className={`p-2 rounded-lg border ${card.color} transition-transform duration-200 group-hover:scale-105 relative z-10`}>
                  <Icon size={14} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom: Control Center Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
          
          {/* Date presets block */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 mr-1">
              <Calendar size={12} />
              <span className="text-[8px] font-black uppercase tracking-widest leading-none">Timeline</span>
            </div>

            <div className="flex flex-wrap items-center gap-0.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 rounded-lg p-0.5">
              {[
                { id: "all", label: "All Time" },
                { id: "today", label: "Today" },
                { id: "week", label: "7 Days" },
                { id: "month", label: "30 Days" },
                { id: "custom", label: "Custom" },
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => p.id === "custom" ? setDatePreset("custom") : handlePreset(p.id)}
                  className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${ datePreset === p.id ? "bg-slate-950 text-slate-100 dark:text-white dark:bg-indigo-600 dark:text-white shadow-xs" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white" }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {datePreset === "custom" && (
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 animate-fadeIn">
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)}
                  className="bg-transparent text-[8px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 outline-none cursor-pointer" 
                />
                <span className="text-slate-400 font-black text-[8px]">→</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={e => setEndDate(e.target.value)}
                  className="bg-transparent text-[8px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 outline-none cursor-pointer" 
                />
                {(startDate || endDate) && (
                  <button 
                    onClick={() => handlePreset("all")} 
                    className="text-[8px] text-rose-500 hover:text-rose-600 font-black uppercase tracking-wider cursor-pointer ml-0.5"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Search Input block */}
          <div className="relative w-full sm:w-80 shrink-0">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 pointer-events-none">
              <Search size={13} />
            </span>
            <input
              type="text"
              placeholder="Search reference ID, client name, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-[11px] rounded-lg border border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 outline-none transition focus:bg-white dark:focus:bg-gray-900 font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            />
          </div>
        </div>
      </div>

      {/* ── Modern Operations Data Table ── */}
      <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl flex flex-col overflow-hidden shadow-xs">
        
        {/* Table Header Section */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/10">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Logistics Manifest</span>
          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
            {filtered.length} Dispatches Found
          </span>
        </div>

        {/* Scrollable Table Viewport */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Inbox size={28} className="text-slate-300 dark:text-slate-700" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">No operational dispatches</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 shadow-[0_1px_0_0_rgba(226,232,240,1)] dark:shadow-[0_1px_0_0_rgba(31,41,55,1)]">
                <tr className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                  <th className="py-3 px-4.5">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Delivery Agent</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4">Order Date</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                {filtered.map((order) => {
                  const shortId = order._id.slice(-6).toUpperCase();
                  const customerName = `${order.address.firstName} ${order.address.lastName || ""}`;
                  const dl = getDeadlineInfo(order.createdAt, order.orderStatus);
                  const isUnassigned = !order.deliverymanId;
                  const isSlaCritical = dl?.level === "overdue" || dl?.level === "critical";

                  // Progress calculation
                  let progress = 10;
                  if (order.orderStatus === "Order Placed") progress = 20;
                  else if (order.orderStatus === "Packed") progress = 40;
                  else if (order.orderStatus === "Shipped") progress = 60;
                  else if (order.orderStatus === "Out for Delivery") progress = 80;
                  else if (order.orderStatus === "Delivered") progress = 100;

                  return (
                    <tr 
                      key={order._id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-900/30 transition duration-150 group/row ${ isSlaCritical ? "bg-rose-500/[0.01] dark:bg-rose-500/[0.005]" : "" }`}
                    >
                      {/* Order ID & SLA Warnings */}
                      <td className="py-2.5 px-4.5">
                        <div className="flex items-center gap-2">
                          <span 
                            onClick={() => handleOpenDrawer(order)}
                            className="font-mono font-black text-[11px] text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition"
                          >
                            #{shortId}
                          </span>
                          {isSlaCritical && (
                            <span className="flex h-1.5 w-1.5 relative" title="SLA Breached / Urgent">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
                            </span>
                          )}
                          {isUnassigned && !isSlaCritical && (
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" title="Needs Agent Assignment" />
                          )}
                        </div>
                      </td>

                      {/* Customer Details */}
                      <td className="py-2.5 px-4 truncate max-w-[150px]">
                        <span className="font-bold text-slate-900 dark:text-slate-200">{customerName}</span>
                      </td>

                      {/* Product details */}
                      <td className="py-2.5 px-4 truncate max-w-[180px]" title={order.items.map(i => `${i.name} (x${i.qty})`).join(", ")}>
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                          {order.items.map(i => `${i.name} (x${i.qty})`).join(", ")}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-2.5 px-4 text-right font-black text-slate-900 dark:text-white">
                        ₹{order.amount.toLocaleString()}
                      </td>

                      {/* Delivery Agent */}
                      <td className="py-2.5 px-4">
                        {(() => {
                          const assignedDriver = drivers.find(d => d._id === order.deliverymanId);
                          if (!assignedDriver) {
                            return (
                              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider">
                                Unassigned
                              </span>
                            );
                          }

                          const status = order.assignmentStatus || "Assigned";
                          const isAwaiting = status === "Assigned";

                          return (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-slate-800 dark:text-slate-200 font-bold">
                                {assignedDriver.name}
                              </span>
                              <span className={`text-[9px] font-black uppercase tracking-wider ${ isAwaiting ? "text-amber-500 animate-pulse" : "text-slate-400 dark:text-slate-500" }`}>
                                {isAwaiting ? "Awaiting Response" : status}
                              </span>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Status Badge */}
                      <td className="py-2.5 px-4">
                        {(() => {
                          let badgeClass = "bg-slate-100 border-slate-200 text-slate-600";
                          if (order.orderStatus === "Order Placed") badgeClass = "bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400";
                          else if (order.orderStatus === "Packed") badgeClass = "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-400";
                          else if (order.orderStatus === "Shipped") badgeClass = "bg-purple-50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/30 text-purple-700 dark:text-purple-400";
                          else if (order.orderStatus === "Out for Delivery") badgeClass = "bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-400";
                          else if (order.orderStatus === "Delivered") badgeClass = "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400";
                          else if (order.orderStatus === "Cancelled") badgeClass = "bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30 text-rose-700 dark:text-rose-500";

                          return (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-widest ${badgeClass}`}>
                              {order.orderStatus}
                            </span>
                          );
                        })()}
                      </td>

                      {/* Progress bar */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2 w-20">
                          <div className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${ order.orderStatus === "Delivered" ? "bg-emerald-500" : "bg-blue-600" }`}
                              style={{ width: `${progress}%` }} 
                            />
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 shrink-0">{progress}%</span>
                        </div>
                      </td>

                      {/* Order Date */}
                      <td className="py-2.5 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-center">
                        <button
                          onClick={() => handleOpenDrawer(order)}
                          className="px-2.5 py-1 bg-white dark:bg-[#1f2937] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 shadow-xs transition active:scale-95 cursor-pointer"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Slide-out Details Drawer ── */}
      <DetailDrawer
        order={selectedOrder}
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setSelectedOrder(null); }}
        drivers={drivers}
        onAssign={assignHandler}
        onStatusUpdate={statusHandler}
      />

    </div>
  );
};

export default Orders;
