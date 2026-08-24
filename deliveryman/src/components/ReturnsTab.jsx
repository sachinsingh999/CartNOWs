import React from "react";
import { RotateCcw, Phone, CheckCircle2, Truck, ShieldCheck, MapPin, Box, ArrowRight } from "lucide-react";

const STATUS_ORDER = ["Approved", "Out for Pickup", "Picked Up", "Completed"];

const getStatusLevel = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "approved" || s === "rma created" || s === "pending") return 0;
  if (s === "out for pickup") return 1;
  if (s === "picked up") return 2;
  if (s === "completed") return 3;
  return 0;
};

const ReturnsTab = ({
  filteredReturnTasks,
  handleReturnStatusChange,
  formatAddress
}) => {
  return (
    <div className="space-y-6">
      {/* Header Summary Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="font-black text-base text-slate-900 dark:text-white tracking-tight">Assigned Return Actions</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Manage doorstep reverse logistics, replacements, and size exchanges</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black px-3 py-1 rounded-xl border border-emerald-500/20">
            {filteredReturnTasks.filter(t => t.status === "Completed").length} Completed
          </span>
          <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black px-3 py-1 rounded-xl border border-blue-500/20">
            {filteredReturnTasks.filter(t => t.status !== "Completed").length} Pending
          </span>
        </div>
      </div>

      {filteredReturnTasks.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-gray-900 py-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-3 shadow-xs border border-slate-200/80 dark:border-slate-800/80">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <RotateCcw size={22} className="text-slate-500" />
          </div>
          <div>
            <p className="font-extrabold text-sm text-slate-700 dark:text-slate-300">No active return tasks assigned</p>
            <p className="text-slate-500 mt-1 font-medium">Approved refunds, exchanges, or replacements for your delivery zone will appear here.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredReturnTasks.map((task) => {
            const isCompleted = task.status === "Completed";
            const currentLevel = getStatusLevel(task.status);
            const returnType = task.returnType || "Refund";

            return (
              <div
                key={task._id}
                className={`rounded-2xl p-6 transition-all duration-300 shadow-sm border ${
                  isCompleted
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/40 dark:border-emerald-500/30 ring-1 ring-emerald-500/20"
                    : "bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800/80 hover:shadow-md"
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className={`rounded-xl px-3 py-1 text-xs font-black uppercase tracking-wider ${
                        returnType === "Refund"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : returnType === "Replacement"
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                          : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                      }`}>
                        Task Type: {returnType} {returnType === "Refund" ? "(Pickup Only)" : returnType === "Replacement" ? "(Pickup & Replace)" : "(Pickup & Exchange)"}
                      </span>

                      {returnType === "Exchange" && (task.exchangeSize || task.exchangeDetails?.requestedSize) && (
                        <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 rounded-xl px-3 py-1 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1">
                          Swap: {task.itemSize || "Current"} <ArrowRight size={12} /> Size {task.exchangeSize || task.exchangeDetails?.requestedSize}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-1">
                      Task Reference: <span className="font-mono font-black text-slate-900 dark:text-white">#{String(task._id).slice(-8).toUpperCase()}</span>
                    </p>
                  </div>

                  {/* Status Selection / Verified Green Badge */}
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-sm">
                        <CheckCircle2 size={16} />
                        <span>✓ Completed & OTP Verified</span>
                      </span>
                    ) : (
                      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-2">Update Status:</span>
                        <select
                          value={task.status === "RMA Created" ? "Approved" : task.status}
                          onChange={(e) => handleReturnStatusChange(task._id, e.target.value)}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-extrabold text-slate-900 dark:text-white outline-none cursor-pointer transition focus:ring-2 focus:ring-emerald-500"
                        >
                          {STATUS_ORDER.map((optionStatus, index) => {
                            const isPastLevel = index < currentLevel;
                            return (
                              <option
                                key={optionStatus}
                                value={optionStatus}
                                disabled={isPastLevel}
                                className={isPastLevel ? "text-slate-400 italic bg-slate-100" : "font-bold text-slate-900"}
                              >
                                {isPastLevel ? `✓ ${optionStatus} (Done)` : optionStatus}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Stepper Bar */}
                <div className="py-4 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between relative">
                    <div className="absolute top-2.5 left-4 right-4 h-0.5 bg-slate-200 dark:bg-slate-800 z-0" />
                    <div
                      className="absolute top-2.5 left-4 h-0.5 bg-emerald-500 transition-all duration-500 z-0"
                      style={{ width: `calc(${currentLevel / 3} * (100% - 32px))` }}
                    />
                    {STATUS_ORDER.map((stepLabel, idx) => {
                      const isStepDone = idx <= currentLevel;
                      return (
                        <div key={stepLabel} className="flex flex-col items-center z-10 relative">
                          <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${
                            isStepDone
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                              : "bg-white dark:bg-slate-900 text-slate-400 border-slate-300 dark:border-slate-700"
                          }`}>
                            {isStepDone ? "✓" : idx + 1}
                          </div>
                          <span className={`text-[10px] font-extrabold uppercase mt-1 tracking-tight ${
                            isStepDone ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400 dark:text-slate-600"
                          }`}>
                            {stepLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3-Column Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-700 dark:text-slate-300 pt-4">
                  
                  {/* Returned Product Details */}
                  <div className="space-y-2 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                    <p className="font-black text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                      <Box size={13} className="text-indigo-600" />
                      <span>Returned Item</span>
                    </p>
                    <p className="font-black text-slate-900 dark:text-white text-sm truncate">{task.itemName}</p>
                    <p className="text-slate-500 dark:text-slate-400 font-bold">Size: {task.itemSize || "—"} · Qty: {task.quantity}</p>
                    <p className="font-black text-emerald-600 dark:text-emerald-400 mt-2 text-sm">Value: ₹{task.amount?.toLocaleString("en-IN")}</p>
                  </div>

                  {/* Customer Address */}
                  <div className="space-y-2 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                    <p className="font-black text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                      <MapPin size={13} className="text-rose-600" />
                      <span>Customer Address</span>
                    </p>
                    {task.orderAddress ? (
                      <>
                        <p className="font-black text-slate-900 dark:text-white">{task.orderAddress.firstName} {task.orderAddress.lastName}</p>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                          {formatAddress(task.orderAddress)}
                        </p>
                        <a
                          href={`tel:${task.orderAddress.phone}`}
                          className="inline-flex items-center gap-1.5 mt-2 font-black text-blue-600 dark:text-blue-400 hover:underline transition"
                        >
                          <Phone size={13} />
                          <span>{task.orderAddress.phone}</span>
                        </a>
                      </>
                    ) : (
                      <p className="text-slate-500 font-medium">Address details unavailable</p>
                    )}
                  </div>

                  {/* Task Reason & Verification Note */}
                  <div className="space-y-2 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                    <p className="font-black text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-purple-600" />
                      <span>Claim Reason & Instructions</span>
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-bold">
                      {task.reason || task.returnReason || "Customer Return Request"}
                    </p>
                    <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg text-[11px] text-amber-700 dark:text-amber-400 font-bold mt-2">
                      Doorstep OTP verification required for final collection.
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReturnsTab;
