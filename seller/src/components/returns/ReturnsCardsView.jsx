import React from "react";
import {
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Eye,
  Check,
  X,
  KeyRound,
  FileText,
  AlertCircle,
  Copy,
  Package,
  ShieldAlert,
  MessageSquare,
  Calendar,
  DollarSign
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { backendUrl } from "../../config";

const ReturnsCardsView = ({
  returns = [],
  drivers = [],
  assignedDrivers = {},
  setAssignedDrivers,
  onOpenDetails,
  onStatusUpdate,
  onProcessRefund,
  processingRefundId = null
}) => {
  const copyToClipboard = (text, label = "RMA ID") => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const getStatusBadge = (statusStr = "Requested") => {
    const s = statusStr.toLowerCase();
    if (s.includes("complete") || s.includes("refund") || s.includes("done")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <CheckCircle size={12} />
          <span>Completed</span>
        </span>
      );
    }
    if (s.includes("pickup") || s.includes("out")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          <Truck size={12} />
          <span>In Pickup</span>
        </span>
      );
    }
    if (s.includes("approved")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <Check size={12} />
          <span>Approved</span>
        </span>
      );
    }
    if (s.includes("reject") || s.includes("cancel")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <XCircle size={12} />
          <span>Rejected</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
        <Clock size={12} />
        <span>Needs Review</span>
      </span>
    );
  };

  if (returns.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-12 text-center border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <RotateCcw size={22} />
        </div>
        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">No return requests found in card view</p>
        <p className="text-[11px] text-slate-400 mt-1">Try switching date presets or reset your search term.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-left">
      {returns.map((request) => {
        const requestId = request._id || "";
        const requestNum = request.requestNumber || `RMA-${requestId.slice(-8).toUpperCase()}`;
        const orderRef = request.orderId?._id || request.orderId || "";
        const userSelectedAction = request.returnType || "Refund";
        const isPendingDecision = ["Requested", "Pending Approval", "Under Review", "Pending"].includes(request.status);
        const originalDriverId = request.orderId?.deliverymanId || request.deliverymanId || "";
        const currentDriver = assignedDrivers[requestId] ?? originalDriverId ?? "";
        const isRefundProcessing = processingRefundId === requestId;

        const reqDate = new Date(request.createdAt || Date.now()).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        });

        const itemImg = request.itemImage?.startsWith("http")
          ? request.itemImage
          : request.itemImage
          ? `${backendUrl}/${request.itemImage}`
          : "";

        return (
          <motion.div
            key={requestId}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.15 }}
            className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between overflow-hidden"
          >
            {/* Card Top: Header with RMA ID, Date, and Status */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800/60 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-black text-sm text-slate-900 dark:text-slate-100">
                    {requestNum}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(requestId, "RMA ID")}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
                    title="Copy RMA ID"
                  >
                    <Copy size={12} />
                  </button>
                </div>
                {getStatusBadge(request.status)}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>Order #{orderRef ? String(orderRef).slice(-8).toUpperCase() : "—"} • {reqDate}</span>
                </span>
                <span
                  className={`px-2 py-0.2 rounded text-[10px] font-black uppercase ${
                    userSelectedAction === "Exchange"
                      ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {userSelectedAction}
                </span>
              </div>
            </div>

            {/* Card Middle: Item Details, Reason, Code & Driver */}
            <div className="p-4 space-y-3 flex-1">
              {/* Product Thumbnail & Specs */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/40">
                <div className="h-12 w-12 rounded-lg bg-white dark:bg-slate-850 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                  {itemImg ? (
                    <img src={itemImg} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Package size={18} className="text-slate-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                    {request.itemName || "Product Item"}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                    <span>Qty: <strong className="text-slate-700 dark:text-slate-300">{request.quantity || 1}</strong></span>
                    {request.itemSize && <span>• Size: <strong>{request.itemSize}</strong></span>}
                    {userSelectedAction === "Exchange" && (request.exchangeSize || request.exchangeDetails?.requestedSize) && (
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                        ➔ New Size: {request.exchangeSize || request.exchangeDetails?.requestedSize}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-black text-amber-600 dark:text-amber-400 mt-0.5">
                    Refund Amount: ₹{(Number(request.amount) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Reason & Feedback */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/40 text-xs space-y-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <FileText size={11} />
                  Return Reason
                </p>
                <p className="text-slate-800 dark:text-slate-200 font-bold text-xs">
                  {request.reason || request.returnReason || "Customer Return"}
                </p>
                {request.feedback && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-0.5">
                    "{request.feedback}"
                  </p>
                )}
              </div>

              {/* Verification Code Box (if active) */}
              {request.verificationCode && request.status !== "Completed" && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold">
                    <KeyRound size={13} className="text-amber-500" />
                    <span>Customer Return OTP</span>
                  </div>
                  <span className="font-mono font-black text-sm tracking-wider text-amber-700 dark:text-amber-400">
                    {request.verificationCode}
                  </span>
                </div>
              )}

              {/* Driver Assignment Dropdown */}
              <div className="space-y-1 text-xs">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Pickup Logistics Agent
                </label>
                <select
                  value={currentDriver}
                  onChange={(e) =>
                    setAssignedDrivers((prev) => ({
                      ...prev,
                      [requestId]: e.target.value
                    }))
                  }
                  className="w-full rounded-xl px-2.5 py-1.5 text-xs font-bold bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800 outline-none"
                >
                  <option value="">Select Agent...</option>
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
            </div>

            {/* Card Bottom: Action Toolbar */}
            <div className="p-4 bg-slate-50/60 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/60 space-y-2">
              <div className="flex items-center gap-2">
                {/* Pending Decision: Approve / Reject */}
                {isPendingDecision && (
                  <>
                    <button
                      type="button"
                      onClick={() => onStatusUpdate(requestId, "Approved")}
                      className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check size={14} />
                      <span>Approve</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onStatusUpdate(requestId, "Rejected")}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 transition active:scale-95 cursor-pointer"
                      title="Reject Request"
                    >
                      <X size={14} />
                    </button>
                  </>
                )}

                {/* Approved / In Pickup: Process Refund button */}
                {request.status !== "Requested" && request.status !== "Rejected" && request.status !== "Completed" && (
                  <button
                    type="button"
                    disabled={isRefundProcessing}
                    onClick={() => onProcessRefund(requestId)}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isRefundProcessing ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle size={14} />
                    )}
                    <span>Process Refund (₹{request.amount})</span>
                  </button>
                )}

                {/* Completed State Badge */}
                {request.status === "Completed" && (
                  <div className="flex-1 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5">
                    <CheckCircle size={14} />
                    <span>Refunded & Completed</span>
                  </div>
                )}

                {/* Inspect Details */}
                <button
                  type="button"
                  onClick={() => onOpenDetails(request)}
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

export default ReturnsCardsView;
