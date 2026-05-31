import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import {
  ShoppingBag, Package, Calendar, Clock, CheckCircle,
  Truck, Inbox, AlarmClock, AlertTriangle, Phone, MapPin,
  X, User, KeyRound
} from "lucide-react";

/* ─────────────────────── Constants ─────────────────────── */
const DELIVERY_DAYS = 7;

/* ─────────────────────── Helpers ──────────────────────── */
const getDeadlineInfo = (createdAt, orderStatus) => {
  if (orderStatus === "Delivered") return null;
  const deadline = new Date(createdAt);
  deadline.setDate(deadline.getDate() + DELIVERY_DAYS);
  const daysLeft = Math.ceil((deadline - Date.now()) / 86400000);
  const dateStr = deadline.toLocaleDateString(undefined, { day: "numeric", month: "short" });
  if (daysLeft < 0)   return { label: `${Math.abs(daysLeft)}d overdue`, dateStr, level: "overdue" };
  if (daysLeft === 0) return { label: "Due today",                       dateStr, level: "critical" };
  if (daysLeft <= 2)  return { label: `${daysLeft}d left`,               dateStr, level: "warning" };
  return                     { label: `${daysLeft}d left`,               dateStr, level: "ok" };
};

const dlStyle = {
  ok:       "bg-emerald-50 text-emerald-700 border-emerald-100",
  warning:  "bg-amber-50  text-amber-700  border-amber-100",
  critical: "bg-rose-50   text-rose-700   border-rose-150",
  overdue:  "bg-rose-100  text-rose-800   border-rose-205",
};

const dlBorder = {
  ok:       "border-l-4 border-l-emerald-500",
  warning:  "border-l-4 border-l-amber-500",
  critical: "border-l-4 border-l-rose-500",
  overdue:  "border-l-4 border-l-rose-600",
};

const statusBadgeStyle = (s) => {
  if (s === "Delivered")          return "bg-emerald-50 text-emerald-700 border-emerald-150";
  if (s === "Out for Delivery" || s === "Shipped") return "bg-indigo-50 text-indigo-705 border-indigo-150";
  if (s === "Packed")             return "bg-amber-50  text-amber-750  border-amber-150";
  return "bg-blue-50 text-blue-705 border-blue-150";
};

const fmtDate = (d) =>
  new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

const fmtTime = (d) =>
  new Date(d).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

/* ─────────────────────── Order Card ─────────────────────── */
const OrderCard = ({ order, drivers, onAssign, onClick }) => {
  const dl = getDeadlineInfo(order.createdAt, order.orderStatus);
  const shortId = order._id.slice(-6).toUpperCase();

  let borderClass = "border-slate-200 hover:border-slate-350";
  if (dl) {
    borderClass = `${dlBorder[dl.level]} border-y-slate-200 border-r-slate-200`;
  }

  const assignedDriverName = drivers.find(d => d._id === order.deliverymanId)?.name;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition duration-200 cursor-pointer flex flex-col justify-between min-h-[140px] relative group ${borderClass}`}
    >
      <div>
        {/* Header line */}
        <div className="flex items-center justify-between gap-1.5">
          <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
            #{shortId}
          </span>
          <span className="text-[10px] font-medium text-slate-400">
            {new Date(order.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </span>
        </div>

        {/* Customer name */}
        <h4 className="font-bold text-sm text-slate-800 mt-2 truncate">
          {order.address.firstName} {order.address.lastName || ""}
        </h4>

        {/* Item preview */}
        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
          {order.items.map(i => `${i.name} (${i.qty})`).join(", ")}
        </p>
      </div>

      {/* Footer line */}
      <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between gap-1.5">
        <span className="font-black text-slate-900 text-sm">₹{order.amount}</span>

        {/* Assigned Driver Indicator */}
        <div onClick={e => e.stopPropagation()} className="flex items-center gap-1">
          {order.orderStatus === "Delivered" ? (
            <span className="text-[10px] text-slate-450 font-semibold max-w-[80px] truncate">
              {assignedDriverName || "—"}
            </span>
          ) : (
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg px-1.5 py-1">
              <User size={10} className="text-slate-400" />
              <select
                value={order.deliverymanId || ""}
                onChange={(e) => onAssign(order._id, e.target.value)}
                className="bg-transparent text-[10px] font-bold text-slate-650 outline-none cursor-pointer max-w-[80px] truncate"
              >
                <option value="">No Driver</option>
                {drivers.map(d => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────── Detail Side Drawer ─────────────────── */
const DetailDrawer = ({ order, isOpen, onClose, drivers, onAssign }) => {
  if (!order) return null;
  const dl = getDeadlineInfo(order.createdAt, order.orderStatus);
  const shortId = order._id.slice(-6).toUpperCase();
  const isDelivered = order.orderStatus === "Delivered";

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 ${isOpen ? "visible" : "invisible pointer-events-none"}`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      {/* Drawer Body */}
      <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}>

        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-450 bg-slate-100 px-2 py-0.5 rounded">
                #{shortId}
              </span>
              <span className="text-xs text-slate-400">{fmtDate(order.createdAt)} at {fmtTime(order.createdAt)}</span>
            </div>
            <h3 className="font-black text-lg text-slate-900 mt-1">Order Details</h3>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable details */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">

          {/* Status pill & deadline badge */}
          <div className="flex flex-wrap gap-2.5 items-center">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusBadgeStyle(order.orderStatus)}`}>
              {order.orderStatus}
            </span>

            {dl && (
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-bold ${dlStyle[dl.level]}`}>
                {dl.level === "overdue" || dl.level === "critical"
                  ? <AlertTriangle size={12} className="shrink-0" />
                  : <AlarmClock size={12} className="shrink-0" />
                }
                Deadline: {dl.label} ({dl.dateStr})
              </span>
            )}
          </div>

          {/* Items */}
          <div className="space-y-2">
            <p className="font-black text-[10px] uppercase tracking-widest text-slate-400">Items ({order.items.length})</p>
            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 space-y-2.5">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{item.name}</p>
                    {item.size && (
                      <p className="text-[10px] text-slate-400 mt-0.5">Size: <span className="font-bold">{item.size}</span></p>
                    )}
                  </div>
                  <span className="font-semibold text-slate-500 whitespace-nowrap ml-2">Qty {item.qty}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Details */}
          <div className="space-y-2">
            <p className="font-black text-[10px] uppercase tracking-widest text-slate-400">Customer Details</p>
            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 text-xs space-y-2.5">
              <div>
                <p className="font-bold text-slate-800">{order.address.firstName} {order.address.lastName || ""}</p>
                {order.address.email && (
                  <p className="text-slate-450 text-[10px] font-semibold mt-0.5">{order.address.email}</p>
                )}
                {order.userId && (
                  <p className="text-[9px] font-mono text-slate-400 mt-1 select-all">User ID: {order.userId}</p>
                )}
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <MapPin size={14} className="mt-0.5 shrink-0 text-slate-400" />
                <p className="leading-relaxed">
                  {order.address.street}, {order.address.city},<br />
                  {order.address.state}, {order.address.country}
                  {order.address.zipcode ? ` - ${order.address.zipcode}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 text-slate-650">
                <Phone size={13} className="text-slate-400 shrink-0" />
                <span className="font-bold">{order.address.phone}</span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="space-y-2">
            <p className="font-black text-[10px] uppercase tracking-widest text-slate-400">Billing & Payment</p>
            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Method:</span>
                <span className="font-extrabold uppercase text-slate-800">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className={`px-2 py-0.5 rounded font-black text-[10px] border uppercase ${
                  String(order.paymentStatus).toLowerCase() === "paid" || order.paymentStatus === true
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : "bg-amber-50 text-amber-700 border-amber-100"
                }`}>
                  {String(order.paymentStatus).toLowerCase() === "paid" || order.paymentStatus === true ? "Paid" : "Pending"}
                </span>
              </div>
              <div className="border-t border-slate-100 pt-2 flex justify-between text-sm">
                <span className="font-bold text-slate-700">Total Amount:</span>
                <span className="font-black text-slate-900">₹{order.amount}</span>
              </div>
            </div>
          </div>

          {/* Delivery Code if present */}
          {order.verificationCode && order.orderStatus !== "Delivered" && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-250 bg-amber-50/50 p-3 text-xs">
              <KeyRound size={14} className="text-amber-600 shrink-0" />
              <div>
                <p className="text-[9px] font-black uppercase text-amber-500">Secure Delivery Code</p>
                <p className="font-mono font-black text-sm tracking-widest text-amber-700 mt-0.5">{order.verificationCode}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer agent assigning (if not delivered) */}
        {!isDelivered && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 block mb-2">Assign Delivery Agent</label>
            <select
              value={order.deliverymanId || ""}
              onChange={(e) => onAssign(order._id, e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold bg-white text-slate-700 outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition"
            >
              <option value="">Unassigned (None)</option>
              {drivers.map(d => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.activeDeliveries || 0} active)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────── Main Page ─────────────────────── */
const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [datePreset, setDatePreset] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Selected Order for drawer
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchAllOrder = async () => {
    if (!token) return;
    try {
      const res = await axios.post(`${backendUrl}/api/order/list`, {}, { headers: { token } });
      if (res.data.success) setOrders(res.data.orders);
      else toast.error(res.data.message);
    } catch (e) { toast.error(e.message); }
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
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(prev => ({ ...prev, deliverymanId: driverId || null }));
        }
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
  const overdueCount = active.filter(o => {
    const dl = getDeadlineInfo(o.createdAt, o.orderStatus);
    return dl?.level === "overdue" || dl?.level === "critical";
  }).length;

  const handleOpenDrawer = (order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] space-y-4">

      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Board View</p>
          <div className="flex items-center gap-2 mt-0.5">
            <ShoppingBag size={18} className="text-slate-900" />
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Orders Board</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {overdueCount > 0 && (
            <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-150 rounded-xl px-3 py-1.5 shrink-0">
              <AlertTriangle size={14} className="text-rose-600 animate-pulse" />
              <span className="text-[11px] font-black text-rose-700">
                {overdueCount} Overdue
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Filter & Search Bar ── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-xs shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          <Calendar size={13} className="text-slate-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1">Date:</span>
          {[
            { id: "all", label: "All Time" },
            { id: "today", label: "Today" },
            { id: "week", label: "7 Days" },
            { id: "month", label: "This Month" },
            { id: "custom", label: "Custom" },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => p.id === "custom" ? setDatePreset("custom") : handlePreset(p.id)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                datePreset === p.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-500 hover:bg-slate-50 border border-slate-100"
              }`}
            >
              {p.label}
            </button>
          ))}

          {datePreset === "custom" && (
            <div className="flex items-center gap-1.5 ml-2">
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-bold outline-none focus:border-slate-900" />
              <span className="text-slate-400 text-[10px] font-black">→</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-bold outline-none focus:border-slate-900" />
              {(startDate || endDate) && (
                <button onClick={() => handlePreset("all")} className="text-[10px] text-slate-400 hover:text-slate-800 font-bold cursor-pointer">
                  Reset
                </button>
              )}
            </div>
          )}
        </div>

        {/* Search input box */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search Order ID / Name / Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 outline-none transition focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-950/5 font-bold"
          />
          <svg className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* ── Kanban Board Columns ── */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">

        {/* 1. In Process Column */}
        <div className="bg-slate-50/50 rounded-2xl border border-slate-200/60 p-4 flex flex-col h-full min-w-0">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock size={13} />
              </div>
              <h3 className="font-extrabold text-sm text-slate-850">In Process</h3>
            </div>
            <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full">
              {active.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {active.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center gap-1.5 text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white/50">
                <Inbox size={20} className="text-slate-300" />
                <span className="text-[11px] font-semibold">No active orders</span>
              </div>
            ) : (
              active.map(order => (
                <OrderCard
                  key={order._id}
                  order={order}
                  drivers={drivers}
                  onAssign={assignHandler}
                  onClick={() => handleOpenDrawer(order)}
                />
              ))
            )}
          </div>
        </div>

        {/* 2. Delivered Column */}
        <div className="bg-slate-50/50 rounded-2xl border border-slate-200/60 p-4 flex flex-col h-full min-w-0">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle size={13} />
              </div>
              <h3 className="font-extrabold text-sm text-slate-850">Delivered</h3>
            </div>
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full">
              {delivered.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {delivered.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center gap-1.5 text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white/50">
                <Inbox size={20} className="text-slate-300" />
                <span className="text-[11px] font-semibold">No delivered orders</span>
              </div>
            ) : (
              delivered.map(order => (
                <OrderCard
                  key={order._id}
                  order={order}
                  drivers={drivers}
                  onAssign={assignHandler}
                  onClick={() => handleOpenDrawer(order)}
                />
              ))
            )}
          </div>
        </div>

      </div>

      {/* ── Slide-out Details Drawer ── */}
      <DetailDrawer
        order={selectedOrder}
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setSelectedOrder(null); }}
        drivers={drivers}
        onAssign={assignHandler}
      />

    </div>
  );
};

export default Orders;
