import React, { useState } from "react";
import { 
  X, 
  Printer, 
  Download, 
  Check, 
  Truck, 
  FileText, 
  Boxes, 
  ShieldCheck, 
  DollarSign,
  Building2,
  Calendar
} from "lucide-react";
import { toast } from "react-toastify";

const RestockPurchaseOrderModal = ({
  poProducts = [],
  seller = {},
  onClose,
  onConfirmRestockOrder,
  isProcessing = false
}) => {
  if (!poProducts || poProducts.length === 0) return null;

  // Initialize order quantities for each product
  const [quantities, setQuantities] = useState(() => {
    const map = {};
    poProducts.forEach(p => {
      const current = parseInt(p.stock, 10) || 0;
      // Default reorder quantity: replenish up to 50 units (min 20)
      map[p._id] = Math.max(20, 50 - current);
    });
    return map;
  });

  const [supplierName, setSupplierName] = useState("National Fast-Logistics & Wholesale Ltd.");
  const [expectedDays, setExpectedDays] = useState(3);
  const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const orderDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const handleQtyChange = (productId, val) => {
    const num = Math.max(1, parseInt(val, 10) || 1);
    setQuantities(prev => ({ ...prev, [productId]: num }));
  };

  // Compute PO Totals
  const totalUnitsOrdered = Object.values(quantities).reduce((sum, q) => sum + q, 0);
  const totalEstimatedCost = poProducts.reduce((sum, p) => {
    const qty = quantities[p._id] || 20;
    const estWholesale = (parseFloat(p.price) || 100) * 0.65; // Estimated 65% cost of goods
    return sum + (qty * estWholesale);
  }, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleConfirmOrder = async () => {
    if (onConfirmRestockOrder) {
      await onConfirmRestockOrder(quantities);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white dark:bg-[#0F172A] w-full max-w-3xl rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-left">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/40 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Truck size={16} />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                Supplier Purchase Order (PO) Slip
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                {poNumber} • Created on {orderDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Print PO Document"
            >
              <Printer size={15} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Document Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-4">
          {/* Top Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Merchant Warehouse Destination</span>
              <p className="font-black text-slate-900 dark:text-white text-sm">
                {seller?.shopName || "CartNOW Partner Warehouse"}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                {seller?.email || "seller@cartnow.in"} • Fulfillment Center Bay #4
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Supplier & Transit Window</span>
              <p className="font-bold text-slate-800 dark:text-slate-200">
                {supplierName}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Estimated Inward Transit: <strong>{expectedDays} business days</strong>
              </p>
            </div>
          </div>

          {/* Items to Order Table */}
          <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/60 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">SKU & Item Name</th>
                  <th className="py-2.5 px-3 text-center">On Hand</th>
                  <th className="py-2.5 px-3 text-center w-28">Order Qty</th>
                  <th className="py-2.5 px-3 text-right">Est. Unit Cost</th>
                  <th className="py-2.5 px-3 text-right pr-3.5">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {poProducts.map((p) => {
                  const qty = quantities[p._id] || 20;
                  const currentStock = parseInt(p.stock, 10) || 0;
                  const estWholesale = (parseFloat(p.price) || 100) * 0.65;
                  const lineTotal = qty * estWholesale;

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                      <td className="py-2.5 px-3">
                        <p className="font-bold text-slate-900 dark:text-white truncate max-w-[220px]" title={p.name}>
                          {p.name}
                        </p>
                        <p className="text-[9px] font-mono text-slate-400">
                          SKU: {p.sku || `#${p._id.slice(-6).toUpperCase()}`}
                        </p>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <span className={`font-black text-xs ${currentStock === 0 ? "text-rose-500" : currentStock < 10 ? "text-amber-500" : "text-slate-600"}`}>
                          {currentStock}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          min="1"
                          value={qty}
                          onChange={(e) => handleQtyChange(p._id, e.target.value)}
                          className="w-20 px-2 py-1 text-center font-black rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-amber-500"
                        />
                      </td>

                      <td className="py-2.5 px-3 text-right font-semibold text-slate-600 dark:text-slate-300">
                        ₹{estWholesale.toFixed(2)}
                      </td>

                      <td className="py-2.5 px-3 text-right pr-3.5 font-black text-slate-900 dark:text-white">
                        ₹{lineTotal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* PO Summary Totals */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-amber-800 dark:text-amber-300">Order Summary</span>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-400">
                {poProducts.length} line items • <strong>{totalUnitsOrdered} total units</strong> requested
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">Estimated PO Value</span>
              <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                ₹{totalEstimatedCost.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </h4>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleConfirmOrder}
            className="px-5 py-2 rounded-lg text-xs font-black text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            {isProcessing ? (
              <span>Updating Warehouse Inventory...</span>
            ) : (
              <>
                <Check size={14} className="stroke-[3]" />
                <span>Receive & Replenish Stock</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestockPurchaseOrderModal;
