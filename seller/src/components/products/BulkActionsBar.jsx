import React, { useState } from "react";
import { 
  X, 
  Trash2, 
  Boxes, 
  DollarSign, 
  Percent, 
  Check, 
  AlertTriangle,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BulkActionsBar = ({
  selectedCount = 0,
  onClearSelection,
  onBulkStockUpdate,
  onBulkPriceAdjust,
  onBulkDelete,
  isProcessing = false
}) => {
  const [activeModal, setActiveModal] = useState(null); // null | "stock" | "price" | "delete"
  const [stockAdjustment, setStockAdjustment] = useState({ mode: "set", value: 10 });
  const [priceAdjustment, setPriceAdjustment] = useState({ percent: 10, type: "discount" });

  if (selectedCount === 0) return null;

  return (
    <>
      {/* Floating Bottom Bar */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 dark:bg-slate-950/95 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md flex items-center gap-3 sm:gap-4 flex-wrap max-w-xl w-[94%]"
      >
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-black text-amber-400">
            {selectedCount} Selected
          </span>
        </div>

        <div className="h-4 w-[1px] bg-slate-700 hidden sm:block" />

        <div className="flex items-center gap-1.5 flex-1 justify-center sm:justify-start flex-wrap">
          {/* Bulk Stock */}
          <button
            type="button"
            onClick={() => setActiveModal("stock")}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
          >
            <Boxes size={12} className="text-amber-400" />
            <span>Set Stock</span>
          </button>

          {/* Bulk Price Adjust */}
          <button
            type="button"
            onClick={() => setActiveModal("price")}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
          >
            <Percent size={12} className="text-emerald-400" />
            <span>Adjust Price</span>
          </button>

          {/* Bulk Delete */}
          <button
            type="button"
            onClick={() => setActiveModal("delete")}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 transition cursor-pointer"
          >
            <Trash2 size={12} className="text-rose-400" />
            <span>Delete</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClearSelection}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          title="Clear Selection"
        >
          <X size={15} />
        </button>
      </motion.div>

      {/* Bulk Stock Modal */}
      {activeModal === "stock" && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F172A] w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Bulk Update Stock ({selectedCount} items)
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                {[
                  { id: "set", label: "Set Exact" },
                  { id: "add", label: "Add (+)" },
                  { id: "subtract", label: "Subtract (-)" }
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setStockAdjustment({ ...stockAdjustment, mode: m.id })}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${
                      stockAdjustment.mode === m.id
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-black"
                        : "border-slate-200 dark:border-slate-800 text-slate-500"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Stock Value (Units)
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockAdjustment.value}
                  onChange={(e) => setStockAdjustment({ ...stockAdjustment, value: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3 py-2 text-sm font-black rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={async () => {
                  if (onBulkStockUpdate) {
                    await onBulkStockUpdate(stockAdjustment);
                  }
                  setActiveModal(null);
                }}
                className="flex-1 py-2 text-xs font-black rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition"
              >
                {isProcessing ? "Updating..." : "Apply Stock"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Price Adjust Modal */}
      {activeModal === "price" && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F172A] w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Bulk Price Adjustment ({selectedCount} items)
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPriceAdjustment({ ...priceAdjustment, type: "discount" })}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${
                    priceAdjustment.type === "discount"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-black"
                      : "border-slate-200 dark:border-slate-800 text-slate-500"
                  }`}
                >
                  Apply Discount (-%)
                </button>
                <button
                  type="button"
                  onClick={() => setPriceAdjustment({ ...priceAdjustment, type: "markup" })}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${
                    priceAdjustment.type === "markup"
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 font-black"
                      : "border-slate-200 dark:border-slate-800 text-slate-500"
                  }`}
                >
                  Apply Markup (+%)
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Percentage (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={priceAdjustment.percent}
                  onChange={(e) => setPriceAdjustment({ ...priceAdjustment, percent: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm font-black rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={async () => {
                  if (onBulkPriceAdjust) {
                    await onBulkPriceAdjust(priceAdjustment);
                  }
                  setActiveModal(null);
                }}
                className="flex-1 py-2 text-xs font-black rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition"
              >
                {isProcessing ? "Updating..." : "Update Prices"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {activeModal === "delete" && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F172A] w-full max-w-sm rounded-2xl border border-rose-200 dark:border-rose-900/60 p-4 space-y-3.5 shadow-2xl text-left">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertTriangle size={18} />
              <h3 className="text-sm font-black">
                Delete {selectedCount} Products?
              </h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              This will permanently remove the selected listings from your marketplace catalog. This action cannot be undone.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={async () => {
                  if (onBulkDelete) {
                    await onBulkDelete();
                  }
                  setActiveModal(null);
                }}
                className="flex-1 py-2 text-xs font-black rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition"
              >
                {isProcessing ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkActionsBar;
