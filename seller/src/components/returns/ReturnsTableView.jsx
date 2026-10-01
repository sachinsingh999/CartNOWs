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
  ShieldAlert
} from "lucide-react";
import { toast } from "react-toastify";
import { backendUrl } from "../../config";

const ReturnsTableView = ({
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

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden text-left">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse text-xs min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50/90 dark:bg-slate-900/80 text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-200/70 dark:border-slate-800">
              <th className="py-3 px-4">RMA & Order ID</th>
              <th className="py-3 px-4">Item Details</th>
              <th className="py-3 px-4">Type & Reason</th>
              <th className="py-3 px-4 text-center">Pickup OTP</th>
              <th className="py-3 px-4">Pickup Logistics Agent</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {returns.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                  <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <RotateCcw size={22} />
                  </div>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">No return requests found</p>
                  <p className="text-[11px] text-slate-400 mt-1">Return & exchange requests filed by customers will appear here.</p>
                </td>
              </tr>
            ) : (
              returns.map((request) => {
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
                  <tr
                    key={requestId}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-850/40 transition group cursor-pointer"
                    onClick={() => onOpenDetails(request)}
                  >
                    {/* 1. RMA ID & Order Ref */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-slate-900 dark:text-slate-100 group-hover:text-amber-500 transition-colors">
                          {requestNum}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(requestId, "RMA ID");
                          }}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition"
                          title="Copy Full RMA ID"
                        >
                          <Copy size={11} />
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">
                        Order #{orderRef ? String(orderRef).slice(-8).toUpperCase() : "—"} • {reqDate}
                      </p>
                    </td>

                    {/* 2. Item Details */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                          {itemImg ? (
                            <img src={itemImg} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <Package size={16} className="text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[170px] text-xs">
                            {request.itemName || "Product Item"}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Qty: <strong className="text-slate-700 dark:text-slate-300">{request.quantity || 1}</strong>
                            {request.itemSize ? ` • Size: ${request.itemSize}` : ""}
                            <span className="font-black text-amber-600 dark:text-amber-400 ml-1.5">
                              ₹{(Number(request.amount) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* 3. Return Type & Reason */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.2 rounded text-[9px] font-black uppercase tracking-wider ${
                              userSelectedAction === "Exchange"
                                ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {userSelectedAction}
                          </span>
                          {userSelectedAction === "Exchange" && (request.exchangeSize || request.exchangeDetails?.requestedSize) && (
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                              ➔ Size {request.exchangeSize || request.exchangeDetails?.requestedSize}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                          {request.reason || request.returnReason || "Customer Return"}
                        </p>
                      </div>
                    </td>

                    {/* 4. Verification OTP Code */}
                    <td className="py-3 px-4 text-center">
                      {request.verificationCode && request.status !== "Completed" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono font-black text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                          <KeyRound size={11} className="text-amber-500" />
                          <span>{request.verificationCode}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">—</span>
                      )}
                    </td>

                    {/* 5. Pickup Logistics Agent */}
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={currentDriver}
                        onChange={(e) =>
                          setAssignedDrivers((prev) => ({
                            ...prev,
                            [requestId]: e.target.value
                          }))
                        }
                        className="w-full max-w-[180px] rounded-lg px-2 py-1 text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-none border border-slate-200/60 dark:border-slate-700/60 cursor-pointer"
                      >
                        <option value="">Select Agent...</option>
                        {drivers.map((d) => {
                          const isOriginal = String(d._id) === String(originalDriverId);
                          return (
                            <option key={d._id} value={d._id}>
                              {d.name} {isOriginal ? "★ (Original Driver)" : ""}
                            </option>
                          );
                        })}
                      </select>
                    </td>

                    {/* 6. Status */}
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(request.status)}
                    </td>

                    {/* 7. Action Toolbar */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Pending Decision: Approve / Reject */}
                        {isPendingDecision && (
                          <>
                            <button
                              type="button"
                              onClick={() => onStatusUpdate(requestId, "Approved")}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] shadow-2xs transition active:scale-95 flex items-center gap-1 cursor-pointer"
                              title="Approve return request & dispatch reverse pickup"
                            >
                              <Check size={12} />
                              <span>Approve</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => onStatusUpdate(requestId, "Rejected")}
                              className="px-2 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold text-[11px] transition active:scale-95 cursor-pointer"
                              title="Reject return request"
                            >
                              <X size={12} />
                            </button>
                          </>
                        )}

                        {/* Approved / In Pickup: Process Refund button */}
                        {request.status !== "Requested" && request.status !== "Rejected" && request.status !== "Completed" && (
                          <button
                            type="button"
                            disabled={isRefundProcessing}
                            onClick={() => onProcessRefund(requestId)}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] shadow-2xs transition active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            title={`Process refund of ₹${request.amount} to customer`}
                          >
                            {isRefundProcessing ? (
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <CheckCircle size={12} />
                            )}
                            <span>Process Refund</span>
                          </button>
                        )}

                        {/* Inspect Details */}
                        <button
                          type="button"
                          onClick={() => onOpenDetails(request)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-slate-950 dark:bg-slate-800 dark:hover:bg-amber-400 dark:hover:text-slate-950 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                          title="Inspect Return Details"
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
        <span>Showing {returns.length} RMA requests</span>
        <span className="font-semibold text-slate-600 dark:text-slate-300">CartNOW Reverse Logistics Hub</span>
      </div>
    </div>
  );
};

export default ReturnsTableView;
