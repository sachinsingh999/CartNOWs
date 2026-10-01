import React from "react";
import { 
  AlertTriangle, 
  ShieldCheck, 
  Zap, 
  Package, 
  ArrowRight, 
  Clock, 
  Plus, 
  Check, 
  Truck
} from "lucide-react";
import { motion } from "framer-motion";

const UrgentRestockQueue = ({
  products = [],
  onQuickRestock,
  restockUpdatingId = null,
  onOpenSinglePO
}) => {
  // Filter products needing urgent replenishment (< 10 units)
  const lowStockItems = products
    .filter(p => (parseInt(p.stock, 10) || 0) < 10)
    .sort((a, b) => (parseInt(a.stock, 10) || 0) - (parseInt(b.stock, 10) || 0));

  if (lowStockItems.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0F172A] rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div className="text-left">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
              Warehouse Replenishment Queue Clean
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              All active product listings currently satisfy minimum safety buffers (10+ units).
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          Zero Stockout Risk
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-xl p-3 sm:p-4 border border-rose-200/60 dark:border-rose-900/40 shadow-xs space-y-3 text-left transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/60 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <AlertTriangle size={14} className="stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Urgent Restock Action Queue</span>
              <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-rose-500 text-white">
                {lowStockItems.length} SKUs Critical
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">
              Items at imminent risk of stockout. Replenish inventory directly or issue supplier purchase orders.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of urgent items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {lowStockItems.slice(0, 6).map((item) => {
          const stock = parseInt(item.stock, 10) || 0;
          const isOut = stock === 0;
          const isExtreme = stock > 0 && stock < 5;
          const isUpdating = restockUpdatingId === item._id;

          const imageSrc = item.images?.[0] || item.image?.[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120";

          return (
            <div
              key={item._id}
              className={`rounded-xl p-2.5 sm:p-3 border transition-all flex flex-col justify-between gap-2.5 ${
                isOut 
                  ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50" 
                  : isExtreme
                  ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-900/50"
                  : "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800"
              }`}
            >
              {/* Top Row: Thumbnail + Info */}
              <div className="flex items-start gap-2.5">
                <div className="h-12 w-12 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shrink-0 shadow-2xs">
                  <img src={imageSrc} alt="" className="h-full w-full object-cover" />
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                      isOut 
                        ? "bg-rose-500 text-white" 
                        : isExtreme 
                        ? "bg-amber-500 text-slate-950" 
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}>
                      {isOut ? "OUT OF STOCK (0)" : isExtreme ? `CRITICAL (${stock} LEFT)` : `LOW BUFFER (${stock})`}
                    </span>
                    <span className="text-[10px] font-black text-amber-500 dark:text-amber-400">
                      ₹{parseFloat(item.price || 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate" title={item.name}>
                    {item.name}
                  </h4>

                  <p className="text-[9px] font-mono text-slate-400">
                    SKU: {item.sku || "UNASSIGNED"} • {item.category || "General"}
                  </p>
                </div>
              </div>

              {/* Action Buttons: 1-Click Replenishment */}
              <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-500">Quick Add:</span>
                  {[20, 50, 100].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      disabled={isUpdating}
                      onClick={() => onQuickRestock(item._id, stock + qty)}
                      className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-white dark:bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition cursor-pointer shadow-2xs"
                      title={`Add +${qty} units to stock`}
                    >
                      +{qty}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => onOpenSinglePO && onOpenSinglePO(item)}
                  className="px-2.5 py-1 rounded-md text-[10px] font-black bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-2xs transition flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Truck size={11} />
                  <span>PO Slip</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UrgentRestockQueue;
