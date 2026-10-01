import React from "react";
import {
  ShoppingBag,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Eye,
  Printer,
  Check,
  X,
  Send,
  Phone,
  MapPin,
  ChevronRight,
  ShieldCheck,
  User,
  Copy,
  Zap
} from "lucide-react";
import { toast } from "react-toastify";

const OrdersTableView = ({
  orders = [],
  onOpenDetails,
  onOpenPackingSlip,
  onRejectOrder,
  onMarkReadyForPickup,
  actionLoadingId = null
}) => {
  const copyToClipboard = (text, label = "Order ID") => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const getStatusBadge = (statusStr = "Processing") => {
    const s = statusStr.toLowerCase();
    if (s.includes("deliver") || s.includes("complete")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 size={12} />
          <span>Delivered</span>
        </span>
      );
    }
    if (s.includes("pickup")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          <Package size={12} />
          <span>Ready For Pickup</span>
        </span>
      );
    }
    if (s.includes("transit") || s.includes("shipped") || s.includes("out")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
          <Truck size={12} />
          <span>In Transit</span>
        </span>
      );
    }
    if (s.includes("cancel") || s.includes("reject")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <XCircle size={12} />
          <span>Cancelled</span>
        </span>
      );
    }
    // Default auto-accepted packing state
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
        <Package size={12} />
        <span>Preparing / Pack</span>
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden text-left">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse text-xs min-w-[950px]">
          <thead>
            <tr className="bg-slate-50/90 dark:bg-slate-900/80 text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-200/70 dark:border-slate-800">
              <th className="py-3 px-4">Order ID & Date</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Items Ordered</th>
              <th className="py-3 px-4 text-right">Amount & Pay</th>
              <th className="py-3 px-4 text-center">Fulfillment Status</th>
              <th className="py-3 px-4">Delivery Courier</th>
              <th className="py-3 px-4 text-right">Dispatch Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                  <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <ShoppingBag size={22} />
                  </div>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">No orders matching your criteria</p>
                  <p className="text-[11px] text-slate-400 mt-1">Try resetting the status filter or clearing your search keywords.</p>
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const orderId = order._id || "";
                const orderNum = order.orderNumber || `#${orderId.slice(-8).toUpperCase()}`;
                const items = order.items || [];
                const firstItem = items[0] || {};
                const customerName = `${order.address?.firstName || "Customer"} ${order.address?.lastName || ""}`.trim();
                const customerPhone = order.address?.phone || order.address?.mobile || "—";
                const customerCity = order.address?.city || order.address?.state || "India";
                const isPaid = (order.paymentStatus || "").toLowerCase() === "paid";
                const status = (order.orderStatus || order.status || "Processing").toLowerCase();
                const isActionLoading = actionLoadingId === orderId;

                // Needs dispatch action: Any order that hasn't been marked ready for pickup yet
                const isReadyToPack =
                  !status.includes("pickup") &&
                  !status.includes("transit") &&
                  !status.includes("shipped") &&
                  !status.includes("deliver") &&
                  !status.includes("cancel") &&
                  !status.includes("reject");

                const orderDate = new Date(order.createdAt || order.date || Date.now()).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric"
                });
                const orderTime = new Date(order.createdAt || order.date || Date.now()).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit"
                });

                return (
                  <tr
                    key={orderId}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-850/40 transition group cursor-pointer"
                    onClick={() => onOpenDetails(order)}
                  >
                    {/* 1. Order ID & Date */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-slate-900 dark:text-slate-100 group-hover:text-amber-500 transition-colors">
                          {orderNum}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(orderId, "Order ID");
                          }}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition"
                          title="Copy Full ID"
                        >
                          <Copy size={11} />
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">
                        {orderDate} • {orderTime}
                      </p>
                    </td>

                    {/* 2. Customer Information */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-xs shrink-0">
                          {customerName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[130px] text-xs">
                            {customerName}
                          </p>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate">
                            <MapPin size={10} className="shrink-0" />
                            <span>{customerCity}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 3. Items Ordered */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {/* Primary Image Thumbnail */}
                        <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                          {firstItem.image || firstItem.productImage || firstItem.images?.[0] ? (
                            <img
                              src={firstItem.image || firstItem.productImage || firstItem.images?.[0]}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package size={14} className="text-slate-400" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[160px] text-xs">
                            {firstItem.name || firstItem.productName || "Product Item"}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {items.length > 1 ? (
                              <span className="font-bold text-amber-600 dark:text-amber-400">
                                +{items.length - 1} more ({items.reduce((s, i) => s + Number(i.qty || i.quantity || 1), 0)} units total)
                              </span>
                            ) : (
                              <span>Qty: <strong>{firstItem.qty || firstItem.quantity || 1}</strong> {firstItem.size ? `• Size: ${firstItem.size}` : ""}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* 4. Amount & Payment Status */}
                    <td className="py-3 px-4 text-right">
                      <p className="font-black text-slate-900 dark:text-slate-100 text-xs">
                        ₹{(Number(order.amount) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </p>
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider mt-0.5 ${
                          isPaid
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {isPaid ? "Paid" : "Pending / COD"}
                      </span>
                    </td>

                    {/* 5. Fulfillment Status */}
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(order.orderStatus || order.status)}
                    </td>

                    {/* 6. Delivery Courier */}
                    <td className="py-3 px-4">
                      {order.deliverymanId ? (
                        <div className="text-left space-y-0.5">
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-[11px] truncate max-w-[120px]">
                            {order.deliverymanId.name || "Assigned Courier"}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {order.deliverymanId.phone || order.deliverymanId.vehicleType || "Dispatch Active"}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">
                          {status.includes("pickup") ? "Assigning agent..." : "Auto-assigned at pickup"}
                        </span>
                      )}
                    </td>

                    {/* 7. Action Buttons */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Auto-Accepted: Direct Ready for Pickup action */}
                        {isReadyToPack && (
                          <>
                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() => onMarkReadyForPickup(orderId)}
                              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] shadow-2xs transition active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                              title="Parcel packed - Call courier for pickup"
                            >
                              <Package size={13} />
                              <span>Ready For Pickup</span>
                            </button>

                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() => onRejectOrder(orderId)}
                              className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 transition active:scale-95 cursor-pointer disabled:opacity-50"
                              title="Cancel / Reject Order"
                            >
                              <X size={13} />
                            </button>
                          </>
                        )}

                        {/* Print Packing Slip */}
                        <button
                          type="button"
                          onClick={() => onOpenPackingSlip(order)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                          title="Print Packing Slip & Shipping Manifest"
                        >
                          <Printer size={13} />
                        </button>

                        {/* View Order Modal */}
                        <button
                          type="button"
                          onClick={() => onOpenDetails(order)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-slate-950 dark:bg-slate-800 dark:hover:bg-amber-400 dark:hover:text-slate-950 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                          title="Inspect Order Details"
                        >
                          <Eye size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Count */}
      <div className="p-3 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span>Showing {orders.length} order entries</span>
        <span className="font-semibold text-slate-600 dark:text-slate-300">CartNOW Real-time Fulfillment Desk</span>
      </div>
    </div>
  );
};

export default OrdersTableView;
