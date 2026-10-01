import React, { useState } from "react";
import { 
  Package, 
  DollarSign, 
  AlertTriangle, 
  Plus, 
  Download, 
  RefreshCw, 
  TrendingUp, 
  CheckCircle2, 
  Boxes,
  FileSpreadsheet,
  FileCode
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ProductsHeaderKPIs = ({ 
  products = [], 
  loading = false, 
  onRefresh, 
  onExportCSV, 
  onExportJSON, 
  navigate 
}) => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Compute live KPI analytics
  const totalProducts = products.length;
  const categoriesCount = new Set(products.map(p => p.category).filter(Boolean)).size;
  
  const totalInventoryCapital = products.reduce((sum, p) => {
    const price = parseFloat(p.price) || 0;
    const stock = parseInt(p.stock, 10) || 0;
    return sum + (price * stock);
  }, 0);

  const totalStockUnits = products.reduce((sum, p) => sum + (parseInt(p.stock, 10) || 0), 0);

  const healthyStockCount = products.filter(p => (parseInt(p.stock, 10) || 0) >= 10).length;
  const lowStockCount = products.filter(p => {
    const s = parseInt(p.stock, 10) || 0;
    return s > 0 && s < 10;
  }).length;
  const outOfStockCount = products.filter(p => (parseInt(p.stock, 10) || 0) === 0).length;

  const avgSellingPrice = totalProducts > 0 
    ? products.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0) / totalProducts 
    : 0;

  const healthyPercentage = totalProducts > 0 ? Math.round((healthyStockCount / totalProducts) * 100) : 100;

  const handleRefreshClick = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <div className="space-y-2.5">
      {/* 1. Header Row */}
      <div className="bg-white dark:bg-[#0F172A] rounded-xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Boxes size={11} className="text-amber-500" />
              <span>Inventory & Catalog Hub</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {totalProducts} listings active
            </span>
          </div>
          <h1 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Product Catalog Management
          </h1>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Control marketplace listings, pricing, live warehouse inventory, and visual assets.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefreshClick}
            disabled={loading || isRefreshing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700/60 transition cursor-pointer active:scale-95 disabled:opacity-50"
            title="Refresh product list"
          >
            <RefreshCw size={13} className={`${isRefreshing || loading ? "animate-spin text-amber-500" : "text-slate-500"}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700/60 transition cursor-pointer"
            >
              <Download size={13} className="text-amber-500" />
              <span>Export</span>
            </button>

            <AnimatePresence>
              {isExportOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsExportOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.96 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-1 z-40 text-left"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setIsExportOpen(false);
                        if (onExportCSV) onExportCSV();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition flex items-center gap-2 cursor-pointer"
                    >
                      <FileSpreadsheet size={14} className="text-emerald-500" />
                      <span>Export as CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsExportOpen(false);
                        if (onExportJSON) onExportJSON();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition flex items-center gap-2 cursor-pointer"
                    >
                      <FileCode size={14} className="text-blue-500" />
                      <span>Export as JSON</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Add Product CTA */}
          <button
            type="button"
            onClick={() => navigate("/add-product")}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Plus size={14} className="stroke-[3]" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* 2. Four KPI Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2">
        {/* Card 1: Active Listings */}
        <div className="bg-white dark:bg-[#0F172A] rounded-xl p-2.5 sm:p-3 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition hover:border-amber-400/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Listings
            </span>
            <div className="h-7 w-7 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Package size={14} />
            </div>
          </div>
          <div className="my-1 text-left">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {totalProducts} <span className="text-xs font-bold text-slate-400">SKUs</span>
            </h3>
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60 pt-1 mt-0.5">
            <span>{categoriesCount} Categories</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">{totalStockUnits} Total Units</span>
          </div>
        </div>

        {/* Card 2: Inventory Capital Valuation */}
        <div className="bg-white dark:bg-[#0F172A] rounded-xl p-2.5 sm:p-3 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition hover:border-emerald-400/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Inventory Value
            </span>
            <div className="h-7 w-7 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/50 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <DollarSign size={14} />
            </div>
          </div>
          <div className="my-1 text-left">
            <h3 className="text-lg sm:text-xl font-black text-amber-500 dark:text-amber-400 tracking-tight">
              ₹{totalInventoryCapital.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </h3>
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60 pt-1 mt-0.5">
            <span>Capital Locked</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">In-stock Assets</span>
          </div>
        </div>

        {/* Card 3: Stock Health Status */}
        <div className="bg-white dark:bg-[#0F172A] rounded-xl p-2.5 sm:p-3 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition hover:border-blue-400/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Stock Health
            </span>
            <div className={`h-7 w-7 rounded-md ${healthyPercentage >= 80 ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600" : "bg-amber-50 dark:bg-amber-950/40 text-amber-600"} border border-slate-200/50 dark:border-slate-800 flex items-center justify-center`}>
              <CheckCircle2 size={14} />
            </div>
          </div>
          <div className="my-1 text-left">
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {healthyPercentage}%
              </h3>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                Healthy
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex my-0.5">
            <div style={{ width: `${healthyPercentage}%` }} className="bg-emerald-500 h-full" title="Healthy Stock" />
            <div style={{ width: `${totalProducts > 0 ? (lowStockCount / totalProducts) * 100 : 0}%` }} className="bg-amber-500 h-full" title="Low Stock" />
            <div style={{ width: `${totalProducts > 0 ? (outOfStockCount / totalProducts) * 100 : 0}%` }} className="bg-rose-500 h-full" title="Out of Stock" />
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 pt-0.5">
            <span className="text-emerald-600 dark:text-emerald-400">{healthyStockCount} Good</span>
            <span className="text-amber-500">{lowStockCount} Low</span>
            <span className="text-rose-500">{outOfStockCount} OOS</span>
          </div>
        </div>

        {/* Card 4: Average Catalog Price */}
        <div className="bg-white dark:bg-[#0F172A] rounded-xl p-2.5 sm:p-3 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition hover:border-indigo-400/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Avg Selling Price
            </span>
            <div className="h-7 w-7 rounded-md bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <TrendingUp size={14} />
            </div>
          </div>
          <div className="my-1 text-left">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              ₹{Math.round(avgSellingPrice).toLocaleString("en-IN")}
            </h3>
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60 pt-1 mt-0.5">
            <span>Per SKU Mean</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">Standard Catalog</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsHeaderKPIs;
