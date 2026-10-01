import React from "react";
import { AlertTriangle, Package, ArrowRight, ShieldCheck } from "lucide-react";

const InventoryAlertsCard = ({ 
  products = [], 
  navigate, 
  onOpenRestockModal 
}) => {
  const lowStockItems = products.filter(p => (Number(p.stock) || 0) < 10);

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-xl p-2.5 sm:p-3 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between text-left relative overflow-hidden transition-all duration-200">
      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5">
            <div className={`p-1 rounded-md ${
              lowStockItems.length > 0 
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" 
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}>
              <AlertTriangle size={14} />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-tight">
                Inventory Alerts
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                {lowStockItems.length} items require stock attention
              </p>
            </div>
          </div>

          <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
            lowStockItems.length > 0 
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" 
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          }`}>
            {lowStockItems.length > 0 ? "Action Needed" : "Optimal"}
          </span>
        </div>

        {/* Low Stock Items List */}
        <div className="space-y-1.5 pt-0.5">
          {lowStockItems.length === 0 ? (
            <div className="py-4 text-center text-slate-400 space-y-1">
              <ShieldCheck size={22} className="mx-auto text-emerald-500 mb-1" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Stock Levels Healthy</p>
              <p className="text-[10px] text-slate-400">All products have sufficient inventory on hand.</p>
            </div>
          ) : (
            lowStockItems.slice(0, 3).map((item) => {
              const stock = Number(item.stock) || 0;
              const isOut = stock === 0;
              const progressPct = Math.min((stock / 10) * 100, 100);

              return (
                <div 
                  key={item._id}
                  className="p-1.5 sm:p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 flex flex-col gap-1 transition hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="h-6 w-6 rounded-md bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                        {item.images?.[0] ? (
                          <img src={item.images[0]} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Package size={12} className="text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-slate-100 text-[11px] truncate max-w-[130px]">
                          {item.name}
                        </p>
                        <p className={`text-[9px] font-extrabold ${isOut ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"}`}>
                          {isOut ? "Out of Stock (0 left)" : `Only ${stock} units left`}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenRestockModal ? onOpenRestockModal(item) : navigate("/inventory")}
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-2xs transition cursor-pointer shrink-0"
                    >
                      Restock
                    </button>
                  </div>

                  {/* Stock Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${isOut ? "bg-rose-500" : "bg-amber-500"}`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <button
        type="button"
        onClick={() => navigate("/inventory")}
        className="w-full mt-2 py-1 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
      >
        <span>Manage Full Warehouse Stock</span>
        <ArrowRight size={13} />
      </button>
    </div>
  );
};

export default InventoryAlertsCard;
