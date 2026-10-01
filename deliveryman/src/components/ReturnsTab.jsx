import React from "react";
import { 
  RotateCcw, Phone, CheckCircle2, Box, ArrowRight, MapPin, ShieldCheck, RefreshCw, Sparkles
} from "lucide-react";

const STATUS_ORDER = ["Approved", "Out for Pickup", "Picked Up", "Completed"];

const getStatusLevel = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "approved" || s === "rma created" || s === "pending" || s.includes("initiated") || s.includes("requested")) return 0;
  if (s === "out for pickup" || s.includes("out")) return 1;
  if (s === "picked up" || s.includes("picked")) return 2;
  if (s === "completed" || s === "returned" || s.includes("refund completed") || s.includes("exchange completed")) return 3;
  return 0;
};

const ReturnsTab = ({
  filteredReturnTasks,
  handleReturnStatusChange,
  formatAddress
}) => {
  const isTaskCompleted = (t) => {
    const s = String(t.status || "").toLowerCase();
    return s === "completed" || s === "returned" || s.includes("refund completed") || s.includes("exchange completed");
  };

  const completedCount = filteredReturnTasks.filter(isTaskCompleted).length;
  const pendingCount = filteredReturnTasks.filter(t => !isTaskCompleted(t)).length;

  return (
    <div className="space-y-3.5 text-slate-800 dark:text-slate-200">
      
      {/* Top Header Card */}
      <div className="glass-panel-elevated rounded-md p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border border-slate-200 dark:border-slate-800 border-t-2 border-t-purple-500">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-sm bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
              <RotateCcw size={15} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Doorstep Returns & Exchanges
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Collect approved customer returns and complete reverse logistics with OTP verification.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="glass-card px-3 py-1.5 rounded-sm text-left border border-amber-500/20 bg-amber-500/5">
            <span className="text-[8px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block">Pending Pickups</span>
            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
              {pendingCount} Tasks
            </span>
          </div>

          <div className="glass-card px-3 py-1.5 rounded-sm text-left border border-emerald-500/20 bg-emerald-500/5">
            <span className="text-[8px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">Completed</span>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {completedCount} Done
            </span>
          </div>
        </div>
      </div>

      {/* Returns Tasks List */}
      {filteredReturnTasks.length === 0 ? (
        <div className="rounded-md glass-panel-elevated py-12 px-4 text-center flex flex-col items-center justify-center gap-2 border border-slate-200 dark:border-slate-800">
          <div className="h-10 w-10 rounded-sm bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400">
            <RotateCcw size={20} />
          </div>
          <p className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wide font-mono">No Active Return Pickups</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
            Approved returns or size exchanges in your sector will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReturnTasks.map((task) => {
            const isCompleted = isTaskCompleted(task);
            const currentLevel = getStatusLevel(task.status);
            const returnType = task.returnType || "Refund";

            return (
              <div
                key={task._id}
                className={`rounded-md p-4 transition-all shadow-xs border ${
                  isCompleted
                    ? "glass-panel bg-emerald-500/5 border-emerald-500/30 border-t-2 border-t-emerald-500"
                    : "glass-panel-elevated border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 border-t-2 border-t-purple-500"
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                        {returnType} {returnType === "Refund" ? "(Pickup)" : returnType === "Replacement" ? "(Swap)" : "(Size Exchange)"}
                      </span>

                      {returnType === "Exchange" && (task.exchangeSize || task.exchangeDetails?.requestedSize) && (
                        <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded-sm border border-blue-500/20">
                          Swap: {task.itemSize || "Current"} <ArrowRight size={10} /> Size {task.exchangeSize || task.exchangeDetails?.requestedSize}
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      RMA Ref: <span className="text-slate-800 dark:text-slate-200 font-bold">#{String(task._id).slice(-8).toUpperCase()}</span>
                    </p>
                  </div>

                  {/* Status Selection / Verified Badge */}
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                        <CheckCircle2 size={13} />
                        <span>Completed & Verified</span>
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5 glass-card px-2 py-1 rounded-sm border border-slate-200 dark:border-slate-800">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Status:</span>
                        <select
                          value={STATUS_ORDER.includes(task.status) ? task.status : "Approved"}
                          onChange={(e) => handleReturnStatusChange(task._id, e.target.value)}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm px-2 py-0.5 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                        >
                          {STATUS_ORDER.map((optionStatus, index) => {
                            const isPastLevel = index < currentLevel;
                            return (
                              <option
                                key={optionStatus}
                                value={optionStatus}
                                disabled={isPastLevel}
                                className={isPastLevel ? "text-slate-400 italic" : "font-bold"}
                              >
                                {isPastLevel ? `✓ ${optionStatus}` : optionStatus}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Stepper Bar */}
                <div className="py-3 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between relative max-w-lg mx-auto px-2">
                    <div className="absolute top-2.5 left-4 right-4 h-0.5 bg-slate-200 dark:bg-slate-800 z-0" />
                    <div
                      className="absolute top-2.5 left-4 h-0.5 bg-purple-600 dark:bg-purple-500 transition-all duration-300 z-0"
                      style={{ width: `calc(${currentLevel / 3} * (100% - 32px))` }}
                    />
                    {STATUS_ORDER.map((stepLabel, idx) => {
                      const isStepDone = idx <= currentLevel;
                      return (
                        <div key={stepLabel} className="flex flex-col items-center z-10 relative">
                          <div
                            className={`h-5 w-5 rounded-sm flex items-center justify-center text-[9px] font-mono font-bold border transition-all ${
                              isStepDone
                                ? "bg-purple-600 text-white border-purple-500 shadow-xs"
                                : "bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            {isStepDone ? "✓" : idx + 1}
                          </div>
                          <span
                            className={`text-[8px] font-mono font-bold mt-1 tracking-tight uppercase ${
                              isStepDone ? "text-slate-900 dark:text-white" : "text-slate-400"
                            }`}
                          >
                            {stepLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3 Columns Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs pt-3">
                  <div className="space-y-1 glass-card p-2.5 rounded-sm border border-slate-100 dark:border-slate-800/60">
                    <span className="font-mono font-bold text-[8px] uppercase tracking-widest text-slate-400 block">Item to Pick Up</span>
                    <p className="font-bold text-slate-900 dark:text-white truncate text-xs">{task.itemName}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] font-mono">Size: {task.itemSize || "Standard"} • Qty: {task.quantity || 1}</p>
                  </div>

                  <div className="space-y-1 glass-card p-2.5 rounded-sm border border-slate-100 dark:border-slate-800/60">
                    <span className="font-mono font-bold text-[8px] uppercase tracking-widest text-slate-400 block">Customer & Address</span>
                    {task.orderAddress ? (
                      <>
                        <p className="font-bold text-slate-900 dark:text-white truncate text-xs">{task.orderAddress.firstName} {task.orderAddress.lastName}</p>
                        <p className="text-slate-600 dark:text-slate-400 leading-snug line-clamp-1 text-[10px]">{formatAddress(task.orderAddress)}</p>
                        {task.orderAddress.phone && (
                          <a href={`tel:${task.orderAddress.phone}`} className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-mono font-bold hover:underline text-[10px]">
                            <Phone size={10} />
                            <span>{task.orderAddress.phone}</span>
                          </a>
                        )}
                      </>
                    ) : (
                      <p className="text-slate-400 text-[10px]">Customer address on file</p>
                    )}
                  </div>

                  <div className="space-y-1 glass-card p-2.5 rounded-sm border border-slate-100 dark:border-slate-800/60">
                    <span className="font-mono font-bold text-[8px] uppercase tracking-widest text-slate-400 block">Reason & Doorstep Verification</span>
                    <p className="text-slate-700 dark:text-slate-300 font-medium leading-snug italic text-[10px]">
                      "{task.reason || task.returnReason || "Customer return request"}"
                    </p>
                    <span className="text-[9px] font-mono text-amber-600 dark:text-amber-400 font-bold block pt-0.5">
                      Verify 6-character OTP from customer.
                    </span>
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
