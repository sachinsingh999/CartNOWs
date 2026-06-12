import React from "react";
import { User, Calendar, MapPin, Package, Clock, ArrowRight, CheckCircle2 } from "lucide-react";

const dlIndicatorColor = {
  ok:       "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]",
  warning:  "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]",
  critical: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]",
  overdue:  "bg-rose-600 shadow-[0_0_12px_rgba(220,38,38,0.5)]",
};

const getStatusProgress = (status) => {
  switch (status) {
    case "Order Placed": return 20;
    case "Packed": return 40;
    case "Shipped": return 60;
    case "Out for Delivery": return 80;
    case "Delivered": return 100;
    default: return 10;
  }
};

const getDeadlineInfo = (dateStr, orderStatus) => {
  if (orderStatus === "Delivered") return null;
  const deadline = new Date(dateStr);
  deadline.setDate(deadline.getDate() + 7);
  const now = new Date();
  const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  const deadlineStr = deadline.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  if (daysLeft < 0)  return { label: `Overdue by ${Math.abs(daysLeft)}d`, sublabel: `Was due ${deadlineStr}`, level: "overdue", dateStr: deadlineStr };
  if (daysLeft === 0) return { label: "Due Today!", sublabel: `Deadline: ${deadlineStr}`, level: "critical", dateStr: deadlineStr };
  if (daysLeft <= 2)  return { label: `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`, sublabel: `Due ${deadlineStr}`, level: "warning", dateStr: deadlineStr };
  return               { label: `${daysLeft} days left`, sublabel: `Due ${deadlineStr}`, level: "ok", dateStr: deadlineStr };
};

const OrderCard = ({ order, drivers, onClick }) => {
  const dl = getDeadlineInfo(order.createdAt, order.orderStatus);
  const shortId = order._id.slice(-6).toUpperCase();
  const progress = getStatusProgress(order.orderStatus);
  const assignedDriverName = drivers.find(d => d._id === order.deliverymanId)?.name;

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-[#151b26] border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-4.5 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[160px] group relative overflow-hidden"
    >
      {/* Accent hover animation strip */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Background glow accent on hover */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_120px_at_100%_0%,rgba(59,130,246,0.06),transparent)] pointer-events-none group-hover:scale-110 transition-transform duration-500" />
      
      <div>
        {/* Header line */}
        <div className="flex items-center justify-between gap-1.5 border-b border-slate-100 dark:border-slate-800/80 pb-2.5 mb-3">
          <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 px-2 py-0.5 rounded-md shadow-xs">
            #{shortId}
          </span>
          <div className="flex items-center gap-2">
            {dl && (
              <span className={`h-2 w-2 rounded-full ${dlIndicatorColor[dl.level]}`} title={`Deadline: ${dl.label}`} />
            )}
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Calendar size={10} />
              {new Date(order.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          </div>
        </div>

        {/* Customer Details */}
        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 truncate">
          {order.address.firstName} {order.address.lastName || ""}
        </h4>

        {/* Item preview */}
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-1 font-medium flex items-center gap-1.5">
          <Package size={12} className="text-slate-400 shrink-0" />
          <span>{order.items.map(i => `${i.name} (x${i.qty})`).join(", ")}</span>
        </p>
      </div>

      {/* Progress Bar representation */}
      <div className="my-3 space-y-1.5">
        <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Clock size={9} />
            {order.orderStatus}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              order.orderStatus === "Delivered" 
                ? "bg-emerald-500" 
                : "bg-blue-600"
            }`}
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>

      {/* Footer line */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1.5 mt-1">
        <span className="font-extrabold text-slate-950 dark:text-white text-base">₹{order.amount}</span>

        {/* Assigned Driver Indicator */}
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 rounded-lg px-2.5 py-1 text-[10px] text-slate-600 dark:text-slate-400 font-bold max-w-[125px] truncate">
          <User size={10} className="text-slate-400 shrink-0" />
          <span className="truncate">{assignedDriverName || "Unassigned"}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
export { getDeadlineInfo };
