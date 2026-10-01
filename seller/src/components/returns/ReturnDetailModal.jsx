import React from "react";
import {
  X,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  KeyRound,
  FileText,
  Copy,
  Package,
  ShieldAlert,
  MessageSquare,
  Calendar,
  DollarSign,
  User,
  MapPin,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { backendUrl } from "../../config";

const ReturnDetailModal = ({
  isOpen,
  onClose,
  request,
  drivers = [],
  assignedDrivers = {},
  setAssignedDrivers,
  onStatusUpdate,
  onProcessRefund,
  isProcessingRefund = false
}) => {
  if (!isOpen || !request) return null;

  const copyToClipboard = (text, label = "RMA ID") => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const requestId = request._id || "";
  const requestNum = request.requestNumber || `RMA-${requestId.slice(-8).toUpperCase()}`;
  const orderRef = request.orderId?._id || request.orderId || "";
  const userSelectedAction = request.returnType || "Refund";
  const isPendingDecision = ["Requested", "Pending Approval", "Under Review", "Pending"].includes(request.status);
  const originalDriverId = request.orderId?.deliverymanId || request.deliverymanId || "";
  const currentDriver = assignedDrivers[requestId] ?? originalDriverId ?? "";
  const originalDriverObj = drivers.find((d) => String(d._id) === String(originalDriverId));

  const reqDate = new Date(request.createdAt || Date.now()).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  const reqTime = new Date(request.createdAt || Date.now()).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const itemImg = request.itemImage?.startsWith("http")
    ? request.itemImage
    : request.itemImage
    ? `${backendUrl}/${request.itemImage}`
    : "";

  const status = (request.status || "Requested").toLowerCase();

  const steps = [
    { label: "Return Requested", desc: "Customer initiated claim", done: true, current: isPendingDecision },
    { label: "Approved by Seller", desc: "Reverse pickup authorized", done: !isPendingDecision && !status.includes("reject"), current: status === "approved" },
    { label: "Reverse Pickup", desc: "Courier collecting item", done: status.includes("pickup") || status.includes("complete"), current: status.includes("pickup") },
    { label: "Refund & Settle", desc: "Amount credited to buyer", done: status.includes("complete"), current: status.includes("complete") }
  ];

  const isRejected = status.includes("reject") || status.includes("cancel");

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

        {/* Modal Sheet */}
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
                <RotateCcw size={20} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 font-mono">
                    {requestNum}
                  </h2>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(requestId, "RMA ID")}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                    title="Copy Full ID"
                  >
                    <Copy size={13} />
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Requested on {reqDate} at {reqTime} • Order #{orderRef ? String(orderRef).slice(-8).toUpperCase() : "—"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-xl bg-slate-200/60 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 custom-scrollbar text-xs">
            {/* Timeline Tracker */}
            {isRejected ? (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center gap-3">
                <XCircle size={24} className="text-rose-600 dark:text-rose-400 shrink-0" />
                <div>
                  <h4 className="font-black text-rose-700 dark:text-rose-300 text-sm">Return Claim Rejected</h4>
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">
                    This return request was reviewed and rejected. No reverse pickup scheduled.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-3">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                  Reverse Logistics Pipeline
                </span>
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
                          <CheckCircle size={13} className="text-emerald-500 shrink-0" />
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

            {/* Product & Claim Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Product Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-3">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                  Returned Item
                </span>
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-xl bg-white dark:bg-slate-850 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                    {itemImg ? (
                      <img src={itemImg} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Package size={20} className="text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-slate-900 dark:text-slate-100 text-sm truncate">
                      {request.itemName || "Product Item"}
                    </h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Qty: <strong className="text-slate-700 dark:text-slate-300">{request.quantity || 1}</strong>
                      {request.itemSize ? ` • Size: ${request.itemSize}` : ""}
                    </p>
                    <p className="text-sm font-black text-amber-600 dark:text-amber-400 mt-1">
                      Refund Amount: ₹{(Number(request.amount) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {/* Return Action Pill */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-500 font-semibold text-[11px]">User Claim Type:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      userSelectedAction === "Exchange"
                        ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {userSelectedAction}
                  </span>
                </div>
                {userSelectedAction === "Exchange" && (request.exchangeSize || request.exchangeDetails?.requestedSize) && (
                  <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    ➔ Replacement Size Requested: {request.exchangeSize || request.exchangeDetails?.requestedSize}
                  </p>
                )}
              </div>

              {/* Reason & Feedback Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <FileText size={12} />
                  Return Reason & Customer Feedback
                </span>
                <div className="space-y-1">
                  <p className="font-black text-slate-900 dark:text-slate-100 text-sm">
                    {request.reason || request.returnReason || "Customer Return Request"}
                  </p>
                  {request.customerDescription && (
                    <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {request.customerDescription}
                    </p>
                  )}
                  {request.feedback && (
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800 text-slate-600 dark:text-slate-300 italic mt-2">
                      "{request.feedback}"
                    </div>
                  )}
                </div>

                {/* Pickup OTP */}
                {request.verificationCode && request.status !== "Completed" && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-amber-700 dark:text-amber-400 font-bold text-[11px] flex items-center gap-1">
                      <KeyRound size={12} />
                      Pickup Verification Code:
                    </span>
                    <span className="font-mono font-black text-sm text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                      {request.verificationCode}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Logistics Driver Assignment */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <Truck size={12} />
                Reverse Pickup Logistics Driver
              </span>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
                <div className="flex-1">
                  <select
                    value={currentDriver}
                    onChange={(e) =>
                      setAssignedDrivers((prev) => ({
                        ...prev,
                        [requestId]: e.target.value
                      }))
                    }
                    className="w-full rounded-xl px-3 py-2 text-xs font-bold bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
                  >
                    <option value="">Select Pickup Agent...</option>
                    {drivers.map((d) => {
                      const isOriginal = String(d._id) === String(originalDriverId);
                      return (
                        <option key={d._id} value={d._id}>
                          {d.name} {isOriginal ? "★ (Original Driver)" : ""} ({d.activeDeliveries || 0} active)
                        </option>
                      );
                    })}
                  </select>
                </div>
                {originalDriverObj && (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                    ✓ Pre-matched with original delivery agent ({originalDriverObj.name})
                  </span>
                )}
              </div>
            </div>

            {/* Admin Warning Note (if present) */}
            {request.adminNote && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 flex items-center gap-1">
                  <ShieldAlert size={12} />
                  Admin Obstacle / Warning Note
                </span>
                <p className="text-slate-800 dark:text-slate-100 font-bold">{request.adminNote}</p>
              </div>
            )}
          </div>

          {/* Modal Bottom Action Footer */}
          <div className="p-4 bg-slate-50/90 dark:bg-slate-900/90 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              Close
            </button>

            <div className="flex items-center gap-2">
              {/* If Pending: Approve / Reject */}
              {isPendingDecision && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onStatusUpdate(requestId, "Rejected");
                      onClose();
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold text-xs transition cursor-pointer"
                  >
                    Reject Claim
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onStatusUpdate(requestId, "Approved");
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Approve Claim</span>
                  </button>
                </>
              )}

              {/* If Approved: Process Refund */}
              {request.status !== "Requested" && request.status !== "Rejected" && request.status !== "Completed" && (
                <button
                  type="button"
                  disabled={isProcessingRefund}
                  onClick={() => {
                    onProcessRefund(requestId);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <CheckCircle size={14} />
                  <span>Process Refund (₹{request.amount}) & Settle</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReturnDetailModal;
