import React, { useState, useMemo } from "react";
import { 
  Boxes, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  RefreshCw, 
  Download, 
  FileSpreadsheet, 
  FileCode,
  ShieldAlert,
  Zap,
  Clock,
  PieChart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const InventoryHeaderKPIs = ({
  products = [],
  orders = [],
  loading = false,
  onRefresh,
  onExportCSV,
  onExportJSON,
  onOpenBatchPO
}) => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Compute live warehouse stats
  const totalProducts = products.length;
  const totalStockUnits = products.reduce((sum, p) => sum + (parseInt(p.stock, 10) || 0), 0);
  
  const totalInventoryCapital = products.reduce((sum, p) => {
    const price = parseFloat(p.price) || 0;
    const stock = parseInt(p.stock, 10) || 0;
    return sum + (price * stock);
  }, 0);

  const outOfStockCount = products.filter(p => (parseInt(p.stock, 10) || 0) === 0).length;
  const lowStockCount = products.filter(p => {
    const s = parseInt(p.stock, 10) || 0;
    return s > 0 && s < 10;
  }).length;
  const healthyStockCount = products.filter(p => (parseInt(p.stock, 10) || 0) >= 10).length;
  const criticalItemsCount = outOfStockCount + lowStockCount;

  // Category Capital Allocation Breakdown
  const categoryAllocation = useMemo(() => {
    const map = {};
    products.forEach(p => {
      const cat = p.category || "General";
      const val = (parseFloat(p.price) || 0) * (parseInt(p.stock, 10) || 0);
      const units = parseInt(p.stock, 10) || 0;
      if (!map[cat]) map[cat] = { category: cat, value: 0, units: 0 };
      map[cat].value += val;
      map[cat].units += units;
    });

    return Object.values(map)
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);
  }, [products]);

  const handleRefreshClick = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const healthScore = totalProducts > 0 ? Math.round((healthyStockCount / totalProducts) * 100) : 100;

  return (
    <div className="space-y-2.5">
      {/* 1. Header Card */}
      <div className="bg-white dark:bg-[#0F172A] rounded-xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all">
        <div className="space-y-0.5 text-left">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Boxes size={11} className="text-amber-500" />
              <span>Warehouse Replenishment Hub</span>
            </span>
            {criticalItemsCount > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 animate-pulse">
                <AlertTriangle size={10} />
                <span>{criticalItemsCount} SKUs Need Restocking</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 size={10} />
                <span>All Stock Optimized</span>
              </span>
            )}
          </div>
          <h1 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Warehouse Stock & Replenishment Desk
          </h1>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Monitor SKU runout velocity, trigger supplier purchase orders, and audit locked inventory assets.
          </p>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap">
          {/* Refresh */}
          <button
            type="button"
            onClick={handleRefreshClick}
            disabled={loading || isRefreshing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700/60 transition cursor-pointer active:scale-95 disabled:opacity-50"
            title="Sync inventory stock"
          >
            <RefreshCw size={13} className={`${isRefreshing || loading ? "animate-spin text-amber-500" : "text-slate-500"}`} />
            <span className="hidden sm:inline">Sync Stock</span>
          </button>

          {/* Export Report */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700/60 transition cursor-pointer"
            >
              <Download size={13} className="text-amber-500" />
              <span>Export Audit</span>
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
                    className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-1 z-40 text-left"
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
                      <span>Export Stock CSV</span>
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
                      <span>Export Inventory JSON</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Supplier PO Generator Trigger */}
          <button
            type="button"
            onClick={onOpenBatchPO}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Zap size={14} className="fill-slate-950" />
            <span>Generate Supplier PO</span>
          </button>
        </div>
      </div>

      {/* 2. Warehouse KPI Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2">
        {/* Card 1: Total Warehouse Stock on Hand */}
        <div className="bg-white dark:bg-[#0F172A] rounded-xl p-2.5 sm:p-3 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition hover:border-amber-400/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Stock Units
            </span>
            <div className="h-7 w-7 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Boxes size={14} />
            </div>
          </div>
          <div className="my-1 text-left">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {totalStockUnits.toLocaleString("en-IN")} <span className="text-xs font-bold text-slate-400">Units</span>
            </h3>
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60 pt-1 mt-0.5">
            <span>Across {totalProducts} SKUs</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">Live Warehouse</span>
          </div>
        </div>

        {/* Card 2: Total Inventory Capital */}
        <div className="bg-white dark:bg-[#0F172A] rounded-xl p-2.5 sm:p-3 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition hover:border-emerald-400/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Locked Capital
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
            <span>Physical Assets</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Valuation Base</span>
          </div>
        </div>

        {/* Card 3: Urgent Restock Requirements */}
        <div className="bg-white dark:bg-[#0F172A] rounded-xl p-2.5 sm:p-3 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition hover:border-rose-400/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Restock Urgency
            </span>
            <div className={`h-7 w-7 rounded-md ${criticalItemsCount > 0 ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 border-rose-200/50" : "bg-emerald-50 text-emerald-600 border-emerald-200/50"} border flex items-center justify-center`}>
              {criticalItemsCount > 0 ? <ShieldAlert size={14} /> : <CheckCircle2 size={14} />}
            </div>
          </div>
          <div className="my-1 text-left">
            <div className="flex items-baseline gap-1.5">
              <h3 className={`text-lg sm:text-xl font-black ${criticalItemsCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"} tracking-tight`}>
                {criticalItemsCount} <span className="text-xs font-bold text-slate-400">SKUs</span>
              </h3>
              {criticalItemsCount > 0 && (
                <span className="text-[10px] font-extrabold text-rose-500">Action Required</span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold border-t border-slate-100 dark:border-slate-800/60 pt-1 mt-0.5">
            <span className="text-rose-500">{outOfStockCount} Out of Stock</span>
            <span className="text-amber-500 font-bold">{lowStockCount} Low Stock</span>
          </div>
        </div>

        {/* Card 4: Inventory Health Index */}
        <div className="bg-white dark:bg-[#0F172A] rounded-xl p-2.5 sm:p-3 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition hover:border-indigo-400/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Stock Buffer Health
            </span>
            <div className="h-7 w-7 rounded-md bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <TrendingUp size={14} />
            </div>
          </div>
          <div className="my-1 text-left">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {healthScore}% <span className="text-xs font-bold text-emerald-500">Optimal</span>
            </h3>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex my-0.5">
            <div style={{ width: `${healthScore}%` }} className="bg-emerald-500 h-full" />
            <div style={{ width: `${totalProducts > 0 ? (criticalItemsCount / totalProducts) * 100 : 0}%` }} className="bg-rose-500 h-full" />
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 pt-0.5 border-t border-slate-100 dark:border-slate-800/60">
            <span className="text-emerald-500 font-bold">{healthyStockCount} In Safe Buffer</span>
            <span>Min Buffer: 10</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryHeaderKPIs;
