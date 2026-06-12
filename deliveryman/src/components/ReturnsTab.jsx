import React from "react";
import { RotateCcw, Phone } from "lucide-react";

const ReturnsTab = ({
  filteredReturnTasks,
  handleReturnStatusChange,
  formatAddress
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Assigned Return Actions</h3>
        <span className="bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-405 dark:text-blue-400 text-[9px] font-black px-2.5 py-1 rounded-xl shadow-sm">
          {filteredReturnTasks.filter(t => t.status !== "Completed").length} Pending Return Tasks
        </span>
      </div>

      {filteredReturnTasks.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] py-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400">
            <RotateCcw size={18} className="text-slate-550 animate-spin-slow" />
          </div>
          <div>
            <p className="font-extrabold text-slate-700 dark:text-slate-300">No return requests active</p>
            <p className="text-slate-500 mt-1 font-medium">Exchanges or refund pickup tasks scheduled for your zone will show up here.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReturnTasks.map((task) => (
            <div key={task._id} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-all duration-300">
              
              {/* Return task header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-md px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-sm">
                      Type: {task.returnType}
                    </span>
                    {task.returnType === "Exchange" && task.exchangeSize && (
                      <span className="bg-slate-50 dark:bg-slate-900 text-slate-705 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                        Swap Size: {task.itemSize || "—"} → {task.exchangeSize}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-505 dark:text-slate-400 mt-2 font-medium">
                    Task Ref: <span className="font-mono font-bold text-slate-900 dark:text-white">#{task._id.slice(-6).toUpperCase()}</span>
                  </p>
                </div>

                {/* Return Task Status selection */}
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Task Status:</span>
                  {task.status === "Completed" ? (
                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl px-3 py-1 text-xs font-black shadow-sm">
                      ✓ Completed
                    </span>
                  ) : (
                    <select
                      value={task.status}
                      onChange={(e) => handleReturnStatusChange(task._id, e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer focus:border-blue-600 transition"
                    >
                      <option value="Approved">Approved</option>
                      <option value="Out for Pickup">Out for Pickup</option>
                      <option value="Picked Up">Picked Up</option>
                      <option value="Completed">Completed</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Details row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-700 dark:text-slate-300">
                {/* Product */}
                <div className="space-y-2 bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80">
                  <p className="font-black text-[9px] uppercase tracking-widest text-slate-450 dark:text-slate-500">Returned Item</p>
                  <p className="font-black text-slate-900 dark:text-white text-sm">{task.itemName}</p>
                  <p className="text-slate-550 dark:text-slate-400 font-semibold">Size: {task.itemSize || "—"} · Qty: {task.quantity}</p>
                  <p className="font-black text-slate-900 dark:text-slate-200 mt-2 text-sm">Value: ₹{task.amount}</p>
                </div>

                {/* Customer Address */}
                <div className="space-y-2 bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80">
                  <p className="font-black text-[9px] uppercase tracking-widest text-slate-450 dark:text-slate-500">Customer Address</p>
                  {task.orderAddress ? (
                    <>
                      <p className="font-black text-slate-900 dark:text-white">{task.orderAddress.firstName} {task.orderAddress.lastName}</p>
                      <p className="text-slate-650 dark:text-slate-400 leading-relaxed font-semibold">
                        {formatAddress(task.orderAddress)}
                      </p>
                      <a
                        href={`tel:${task.orderAddress.phone}`}
                        className="inline-flex items-center gap-1.5 mt-2 font-black text-blue-600 dark:text-blue-400 hover:underline transition"
                      >
                        <Phone size={11} />
                        <span>{task.orderAddress.phone}</span>
                      </a>
                    </>
                  ) : (
                    <p className="text-slate-500 font-medium">Address details unavailable</p>
                  )}
                </div>

                {/* Instructions */}
                <div className="space-y-2 bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80">
                  <p className="font-black text-[9px] uppercase tracking-widest text-slate-450 dark:text-slate-500">Task Notes</p>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                    <span className="font-black text-slate-450 dark:text-slate-500 block text-[9px] uppercase tracking-wider mb-0.5">Reason:</span> {task.reason}
                  </p>
                  {task.adminNote && (
                    <div className="bg-blue-500/5 dark:bg-slate-950 border border-blue-500/10 dark:border-slate-800 p-2.5 rounded-lg text-[11px] text-slate-600 dark:text-slate-400 font-semibold mt-2.5">
                      <span className="font-black block text-[8px] uppercase text-blue-600 dark:text-blue-500 tracking-wider mb-0.5">Admin Note:</span>
                      {task.adminNote}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReturnsTab;
