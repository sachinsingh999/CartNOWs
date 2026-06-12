import React, { useState } from "react";
import { 
  X, MapPin, Phone, KeyRound, AlertTriangle, AlarmClock, UserPlus, CreditCard, ShieldCheck, CheckCircle2, Circle, ArrowUpRight, Activity
} from "lucide-react";
import { getDeadlineInfo } from "./OrderCard";

const dlStyle = {
  ok:       "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  warning:  "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  critical: "bg-rose-500/10 text-rose-600 dark:text-rose-450 border-rose-500/20",
  overdue:  "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25",
};

const statusBadgeStyle = (s) => {
  if (s === "Delivered")          return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  if (s === "Out for Delivery" || s === "Shipped") return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
  if (s === "Packed")             return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
  return "bg-blue-500/10 text-blue-650 dark:text-blue-400 border-blue-500/20";
};

const fmtDate = (d) =>
  new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

const fmtTime = (d) =>
  new Date(d).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

const ORDER_STEPS = ["Order Placed", "Packed", "Shipped", "Out for Delivery", "Delivered"];

const OrderTimeline = ({ currentStatus }) => {
  const currentIndex = ORDER_STEPS.indexOf(currentStatus);

  return (
    <div className="space-y-4 bg-slate-50 dark:bg-slate-900/40 p-4.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80">
      <p className="font-bold text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500">Order Progress Timeline</p>
      <div className="relative pl-6 space-y-4">
        {/* Timeline bar */}
        <div className="absolute left-2 top-2 bottom-2 w-[1px] bg-slate-200 dark:bg-slate-800" />
        
        {ORDER_STEPS.map((step, idx) => {
          const isCompleted = idx <= currentIndex;
          const isActive = idx === currentIndex;
          return (
            <div 
              key={step} 
              className={`flex items-center gap-3 text-xs font-semibold relative`}
            >
              <span className={`absolute left-[-22px] h-3 w-3 rounded-full border flex items-center justify-center transition-all ${
                isCompleted 
                  ? "bg-blue-600 border-blue-600 text-white shadow-xs" 
                  : "bg-white dark:bg-[#111827] border-slate-300 dark:border-slate-800"
              }`}>
                {isCompleted && <span className="h-1 w-1 rounded-full bg-white" />}
              </span>
              <span className={`transition-colors ${
                isActive 
                  ? "text-blue-600 dark:text-blue-400 font-bold" 
                  : isCompleted 
                    ? "text-slate-800 dark:text-slate-200" 
                    : "text-slate-400 dark:text-slate-500 font-medium"
              }`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DetailDrawer = ({ order, isOpen, onClose, drivers, onAssign, onStatusUpdate }) => {
  if (!order) return null;
  const dl = getDeadlineInfo(order.createdAt, order.orderStatus);
  const shortId = order._id.slice(-6).toUpperCase();
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const currentIndex = ORDER_STEPS.indexOf(order.orderStatus);
  const nextStatus = currentIndex < ORDER_STEPS.length - 1 ? ORDER_STEPS[currentIndex + 1] : null;

  const handleAdvanceStatus = async (statusToSet) => {
    if (!onStatusUpdate) return;
    setUpdatingStatus(true);
    await onStatusUpdate(order._id, statusToSet);
    setUpdatingStatus(false);
  };

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 ${isOpen ? "visible" : "invisible pointer-events-none"}`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      {/* Drawer Body */}
      <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-white dark:bg-[#151b26] shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-out border-l border-slate-200/80 dark:border-slate-800/85 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>

        {/* Header */}
        <div className="p-4.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-md shadow-xs">
                #{shortId}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold">{fmtDate(order.createdAt)} at {fmtTime(order.createdAt)}</span>
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1.5 tracking-tight">Order Details</h3>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-400 hover:text-slate-800 dark:hover:text-white transition duration-200 cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable details */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5.5 custom-scrollbar">

          {/* Status pill & deadline badge */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${statusBadgeStyle(order.orderStatus)}`}>
              {order.orderStatus}
            </span>

            {dl && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${dlStyle[dl.level]}`}>
                {dl.level === "overdue" || dl.level === "critical"
                  ? <AlertTriangle size={11} className="shrink-0" />
                  : <AlarmClock size={11} className="shrink-0" />
                }
                {dl.label}
              </span>
            )}
          </div>

          {/* Order Timeline Visual Representation */}
          <OrderTimeline currentStatus={order.orderStatus} />

          {/* Deliveryman Assignment Info (Read-only) */}
          <div className="space-y-2">
            <p className="font-bold text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <UserPlus size={11} />
              <span>Assigned Delivery Agent</span>
            </p>
            <div className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-350">
              {(() => {
                const assignedDriver = drivers.find(driver => driver._id === order.deliverymanId);
                return assignedDriver 
                  ? `${assignedDriver.name} (${assignedDriver.deliveryZone || "Central"})` 
                  : "Unassigned";
              })()}
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2">
            <p className="font-bold text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500">Items ({order.items.length})</p>
            <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 space-y-3 font-semibold">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-xs border-b border-slate-100 dark:border-slate-800/60 last:border-0 pb-2.5 last:pb-0">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-200">{item.name}</p>
                    {item.size && (
                      <p className="text-[10px] text-slate-400 mt-1">Size: <span className="font-bold text-slate-600 dark:text-slate-300">{item.size}</span></p>
                    )}
                  </div>
                  <span className="font-bold text-slate-550 dark:text-slate-400 whitespace-nowrap ml-2">Qty {item.qty}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Details */}
          <div className="space-y-2">
            <p className="font-bold text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500">Customer Details</p>
            <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 text-xs space-y-3 font-semibold">
              <div>
                <p className="font-bold text-slate-950 dark:text-white text-sm">{order.address.firstName} {order.address.lastName || ""}</p>
                {order.address.email && (
                  <p className="text-slate-400 text-[10px] font-bold mt-0.5">{order.address.email}</p>
                )}
                {order.userId && (
                  <p className="text-[9px] font-mono text-slate-500 mt-1 select-all">User ID: {order.userId}</p>
                )}
              </div>
              <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                <MapPin size={13} className="mt-0.5 shrink-0 text-slate-405" />
                <p className="leading-relaxed font-bold">
                  {order.address.street}, {order.address.city},<br />
                  {order.address.state}, {order.address.country}
                  {order.address.zipcode ? ` - ${order.address.zipcode}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-350">
                <Phone size={13} className="text-slate-400 shrink-0" />
                <span className="font-bold text-slate-800 dark:text-slate-200">{order.address.phone}</span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="space-y-2">
            <p className="font-bold text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500">Billing & Payment</p>
            <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 text-xs space-y-3 font-semibold">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <CreditCard size={13} />
                  Method:
                </span>
                <span className="font-bold uppercase text-slate-800 dark:text-white">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Status:</span>
                <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] border uppercase ${
                  String(order.paymentStatus).toLowerCase() === "paid" || order.paymentStatus === true
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-450 border-amber-500/20"
                }`}>
                  {String(order.paymentStatus).toLowerCase() === "paid" || order.paymentStatus === true ? "Paid" : "Pending"}
                </span>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 flex justify-between text-sm items-center">
                <span className="font-bold text-slate-700 dark:text-slate-300">Total Amount:</span>
                <span className="font-extrabold text-slate-950 dark:text-white text-base">₹{order.amount}</span>
              </div>
            </div>
          </div>

          {/* Delivery Code if present */}
          {order.verificationCode && order.orderStatus !== "Delivered" && (
            <div className="flex items-center gap-3 rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 text-xs">
              <KeyRound size={16} className="text-amber-500 shrink-0" />
              <div>
                <p className="text-[9px] font-bold uppercase text-amber-500 tracking-wider">Secure Delivery Verification Code</p>
                <p className="font-mono font-bold text-base tracking-widest text-amber-600 dark:text-amber-400 mt-1">{order.verificationCode}</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DetailDrawer;
export { statusBadgeStyle };
