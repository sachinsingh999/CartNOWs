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
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Copy,
  ExternalLink,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const OrdersCardsView = ({
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
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
        <Package size={12} />
        <span>Preparing / Pack</span>
      </span>
    );
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-12 text-center border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <ShoppingBag size={22} />
        </div>
        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">No orders found in card view</p>
        <p className="text-[11px] text-slate-400 mt-1">Try switching status filters or reset your search term.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-left">
      {orders.map((order) => {
        const orderId = order._id || "";
        const orderNum = order.orderNumber || `#${orderId.slice(-8).toUpperCase()}`;
        const items = order.items || [];
        const customerName = `${order.address?.firstName || "Customer"} ${order.address?.lastName || ""}`.trim();
        const customerPhone = order.address?.phone || order.address?.mobile || "N/A";
        const customerStreet = order.address?.street || "";
        const customerCity = order.address?.city || "";
        const customerState = order.address?.state || "";
        const customerPin = order.address?.zipCode || order.address?.zipcode || order.address?.pincode || "";
        const isPaid = (order.paymentStatus || "").toLowerCase() === "paid";
        const status = (order.orderStatus || order.status || "Processing").toLowerCase();
        const isActionLoading = actionLoadingId === orderId;

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
          <motion.div
            key={orderId}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.15 }}
            className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between overflow-hidden"
          >
            {/* Card Top: Header with ID, Date, and Status */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800/60 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-black text-sm text-slate-900 dark:text-slate-100">
                    {orderNum}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(orderId, "Order ID")}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
                    title="Copy Order ID"
                  >
                    <Copy size={12} />
                  </button>
                </div>
                {getStatusBadge(order.orderStatus || order.status)}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{orderDate} at {orderTime}</span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    isPaid
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {isPaid ? "Paid" : "Pending / COD"}
                </span>
              </div>
            </div>

            {/* Card Middle 1: Items Breakdown List */}
            <div className="p-4 space-y-2.5 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Ordered Items ({items.length})
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  {items.reduce((s, i) => s + Number(i.qty || i.quantity || 1), 0)} Total Units
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {items.map((item, idx) => {
                  const name = item.name || item.productName || "Product Item";
                  const image = item.image || item.productImage || item.images?.[0];
                  const price = Number(item.price || item.unitPrice || 0);
                  const qty = Number(item.qty || item.quantity || 1);

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/40"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-10 w-10 rounded-lg bg-white dark:bg-slate-850 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                          {image ? (
                            <img src={image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <Package size={14} className="text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                            {name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Qty: <strong className="text-slate-700 dark:text-slate-300">{qty}</strong>
                            {item.size ? ` • Size: ${item.size}` : ""}
                            {price > 0 ? ` • ₹${price.toFixed(2)}` : ""}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-slate-100 shrink-0">
                        ₹{(price * qty).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Shipping Destination Summary */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/40 text-xs space-y-1 mt-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                  <span>Ship To</span>
                  <span className="text-slate-600 dark:text-slate-300">{customerPhone}</span>
                </div>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                  {customerName}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  {customerStreet ? `${customerStreet}, ` : ""}{customerCity} {customerState} {customerPin}
                </p>
              </div>

              {/* Delivery Agent (if assigned) */}
              {order.deliverymanId && (
                <div className="p-2 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/40 text-[11px] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 font-bold">
                    <Truck size={13} />
                    <span>{order.deliverymanId.name || "Assigned Driver"}</span>
                  </div>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-300 font-semibold">
                    {order.deliverymanId.phone || order.deliverymanId.vehicleType || "Ready"}
                  </span>
                </div>
              )}
            </div>

            {/* Card Bottom: Total Amount & Action Toolbar */}
            <div className="p-4 bg-slate-50/60 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Order Grand Total:</span>
                <span className="text-base font-black text-amber-600 dark:text-amber-400">
                  ₹{(Number(order.amount) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {/* Auto-Accepted: Direct Ready For Pickup */}
                {isReadyToPack && (
                  <>
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={() => onMarkReadyForPickup(orderId)}
                      className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Package size={14} />
                      <span>Ready For Pickup</span>
                    </button>
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={() => onRejectOrder(orderId)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 transition active:scale-95 cursor-pointer disabled:opacity-50"
                      title="Reject Order"
                    >
                      <X size={14} />
                    </button>
                  </>
                )}

                {/* Print Packing Slip */}
                <button
                  type="button"
                  onClick={() => onOpenPackingSlip(order)}
                  className="p-2 rounded-xl bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                  title="Print Packing Slip"
                >
                  <Printer size={15} />
                </button>

                {/* View Details */}
                <button
                  type="button"
                  onClick={() => onOpenDetails(order)}
                  className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500 hover:text-slate-950 text-amber-700 dark:text-amber-400 font-bold text-xs transition cursor-pointer flex items-center gap-1"
                >
                  <Eye size={13} />
                  <span>Inspect</span>
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default OrdersCardsView;
