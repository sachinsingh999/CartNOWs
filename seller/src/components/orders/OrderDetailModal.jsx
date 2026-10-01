import React from "react";
import {
  X,
  ShoppingBag,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Printer,
  Copy,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  ShieldCheck,
  User,
  AlertCircle,
  ExternalLink,
  Check,
  XCircle,
  ChevronRight,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const OrderDetailModal = ({
  isOpen,
  onClose,
  order,
  onRejectOrder,
  onMarkReadyForPickup,
  onOpenPackingSlip,
  actionLoading = false
}) => {
  if (!isOpen || !order) return null;

  const copyToClipboard = (text, label = "Text") => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const orderId = order._id || "";
  const orderNum = order.orderNumber || `#${orderId.slice(-8).toUpperCase()}`;
  const items = order.items || [];
  const status = (order.orderStatus || order.status || "Processing").toLowerCase();
  const isPaid = (order.paymentStatus || "").toLowerCase() === "paid";

  const customerName = `${order.address?.firstName || "Customer"} ${order.address?.lastName || ""}`.trim();
  const customerPhone = order.address?.phone || order.address?.mobile || "N/A";
  const customerEmail = order.address?.email || order.userId?.email || "customer@cartnow.in";
  const street = order.address?.street || "";
  const city = order.address?.city || "";
  const state = order.address?.state || "";
  const pin = order.address?.zipCode || order.address?.zipcode || order.address?.pincode || "";

  const orderDate = new Date(order.createdAt || order.date || Date.now()).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  const orderTime = new Date(order.createdAt || order.date || Date.now()).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });

  // Calculate timeline steps with auto-accept
  const steps = [
    { label: "Placed & Auto-Accepted", desc: "Ready for warehouse packing", done: true, current: !status.includes("pickup") && !status.includes("transit") && !status.includes("deliver") && !status.includes("cancel") },
    { label: "Ready For Pickup", desc: "Courier dispatched", done: status.includes("pickup") || status.includes("transit") || status.includes("shipped") || status.includes("deliver"), current: status.includes("pickup") },
    { label: "In Transit", desc: "Courier on route", done: status.includes("transit") || status.includes("shipped") || status.includes("deliver"), current: status.includes("transit") || status.includes("shipped") },
    { label: "Delivered", desc: "Handed over to buyer", done: status.includes("deliver"), current: status.includes("deliver") }
  ];

  const isCancelled = status.includes("cancel") || status.includes("reject");
  const isReadyToPack = !status.includes("pickup") && !status.includes("transit") && !status.includes("shipped") && !status.includes("deliver") && !isCancelled;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl bg-white dark:bg-[#0F172A] rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-left z-10"
        >
          {/* Top Modal Header */}
          <div className="p-4 sm:p-5 bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <ShoppingBag size={20} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 font-mono">
                    {orderNum}
                  </h2>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(orderId, "Full Order ID")}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                    title="Copy MongoDB Order ID"
                  >
                    <Copy size={13} />
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Placed on {orderDate} at {orderTime}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onOpenPackingSlip(order);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
              >
                <Printer size={14} />
                <span>Packing Slip</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 rounded-xl bg-slate-200/60 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Modal Scrollable Content */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 custom-scrollbar text-xs">
            {/* Fulfillment Status Progress Tracker */}
            {isCancelled ? (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center gap-3">
                <XCircle size={24} className="text-rose-600 dark:text-rose-400 shrink-0" />
                <div>
                  <h4 className="font-black text-rose-700 dark:text-rose-300 text-sm">Order Cancelled / Rejected</h4>
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">
                    This order was cancelled and is no longer active for fulfillment.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                    Fulfillment Status Tracker
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                    <Zap size={11} className="fill-emerald-500" />
                    Auto-Accepted
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {steps.map((step, i) => (
                    <div
                      key={step.label}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        step.current
                          ? "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-400 font-bold"
                          : step.done
                          ? "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold"
                          : "bg-white dark:bg-slate-850 border-slate-200/60 dark:border-slate-800 text-slate-400"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        {step.done ? (
                          <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                        ) : step.current ? (
                          <Clock size={13} className="text-amber-500 shrink-0 animate-pulse" />
                        ) : (
                          <span className="h-3 w-3 rounded-full border border-slate-400 flex items-center justify-center text-[8px] font-mono">
                            {i + 1}
                          </span>
                        )}
                        <span className="text-[11px] font-black truncate">{step.label}</span>
                      </div>
                      <p className="text-[9px] opacity-75 truncate">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customer & Courier Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer & Shipping Address */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <MapPin size={12} />
                  Shipping Destination
                </span>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-slate-100 text-sm">
                    {customerName}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {street && <span>{street}, </span>}
                    {city && <span>{city}, </span>}
                    {state && <span>{state} </span>}
                    {pin && <strong>{pin}</strong>}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap items-center gap-3 text-[11px]">
                  <a
                    href={`tel:${customerPhone}`}
                    className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    <Phone size={12} />
                    <span>{customerPhone}</span>
                  </a>
                  {customerEmail && (
                    <span className="text-slate-500 truncate max-w-[180px]">
                      {customerEmail}
                    </span>
                  )}
                </div>
              </div>

              {/* Delivery Courier Assignment */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <Truck size={12} />
                  Assigned Delivery Agent
                </span>
                {order.deliverymanId ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-slate-900 dark:text-slate-100 text-sm">
                        {order.deliverymanId.name || "Delivery Partner"}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black">
                        Active Assignment
                      </span>
                    </div>
                    <div className="space-y-0.5 text-slate-600 dark:text-slate-300">
                      <p>Phone: <strong className="text-slate-900 dark:text-slate-100">{order.deliverymanId.phone || "—"}</strong></p>
                      <p>Vehicle: <strong className="text-slate-900 dark:text-slate-100">{order.deliverymanId.vehicleType || "Motorcycle / Van"}</strong></p>
                    </div>
                  </div>
                ) : (
                  <div className="py-3 text-slate-400 space-y-1">
                    <p className="font-bold text-slate-700 dark:text-slate-300">Automated Courier Assignment</p>
                    <p className="text-[11px]">
                      Clicking <strong>"Ready For Pickup"</strong> will automatically assign and notify the nearest delivery courier to collect your parcel.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Ordered Items Table */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                Line Items Breakdown ({items.length} distinct products)
              </span>
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/90 dark:bg-slate-900/80 text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Item</th>
                      <th className="py-2.5 px-3">Attributes</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {items.map((item, idx) => {
                      const name = item.name || item.productName || "Product Item";
                      const image = item.image || item.productImage || item.images?.[0];
                      const price = Number(item.price || item.unitPrice || 0);
                      const qty = Number(item.qty || item.quantity || 1);
                      const total = price * qty;

                      return (
                        <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/40">
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="h-10 w-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                                {image ? (
                                  <img src={image} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <Package size={16} className="text-slate-400" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-black text-slate-900 dark:text-slate-100 text-xs truncate max-w-xs">
                                  {name}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  SKU: {item.sku || `#ITM-${idx + 1}`}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">
                            {item.size && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 mr-1">
                                Size: {item.size}
                              </span>
                            )}
                            {item.color && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                Color: {item.color}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-800 dark:text-slate-200">
                            ₹{price.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-center font-black text-slate-900 dark:text-slate-100">
                            {qty}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-slate-900 dark:text-slate-100">
                            ₹{total.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary & Payment Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Payment Details */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <CreditCard size={12} />
                  Payment Metadata
                </span>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Method:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">{order.paymentMethod || "Online"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Status:</span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-black uppercase ${
                      isPaid ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}>
                      {isPaid ? "Paid" : "Pending / COD"}
                    </span>
                  </div>
                  {order.paymentId && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Transaction ID:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{order.paymentId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Total Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                  Financial Settlement
                </span>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Items Subtotal:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    ₹{(Number(order.subtotal || order.amount) || 0).toFixed(2)}
                  </span>
                </div>
                {Number(order.tax) > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>GST / Taxes:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      ₹{Number(order.tax).toFixed(2)}
                    </span>
                  </div>
                )}
                {Number(order.shippingFee) > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Shipping Fee:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      ₹{Number(order.shippingFee).toFixed(2)}
                    </span>
                  </div>
                )}
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>Discount:</span>
                    <span>-₹{Number(order.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-700 dark:text-slate-200">Grand Total:</span>
                  <span className="font-black text-amber-600 dark:text-amber-400 text-base">
                    ₹{(Number(order.amount) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Bottom Action Footer */}
          <div className="p-4 bg-slate-50/90 dark:bg-slate-900/90 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onOpenPackingSlip(order)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs text-slate-700 dark:text-slate-200 transition cursor-pointer"
            >
              <Printer size={14} />
              <span>Print Packing Slip</span>
            </button>

            <div className="flex items-center gap-2">
              {/* Ready to Pack -> Direct Ready For Pickup */}
              {isReadyToPack && (
                <>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => {
                      onRejectOrder(orderId);
                      onClose();
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold text-xs transition cursor-pointer disabled:opacity-50"
                  >
                    Reject Order
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => {
                      onMarkReadyForPickup(orderId);
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Package size={14} />
                    <span>Mark Ready For Pickup</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OrderDetailModal;
