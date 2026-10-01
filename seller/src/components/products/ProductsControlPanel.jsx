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
  FileCode,
  Search,
  LayoutGrid,
  List,
  X,
  ArrowUpDown,
  Layers,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ProductsControlPanel = ({
  products = [],
  loading = false,
  onRefresh,
  onExportCSV,
  onExportJSON,
  navigate,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  stockFilter,
  setStockFilter,
  priceRangeFilter,
  setPriceRangeFilter,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  rowsPerPage,
  setRowsPerPage,
  categories = [],
  totalFilteredCount = 0,
  totalProductsCount = 0,
  onResetFilters
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

  const isFiltered = searchQuery || categoryFilter !== "All" || stockFilter !== "All" || priceRangeFilter !== "All" || sortBy !== "newest";

  const priceRanges = [
    { id: "All", label: "All Prices" },
    { id: "under500", label: "Under ₹500" },
    { id: "500to2000", label: "₹500 - ₹2,000" },
    { id: "2000to5000", label: "₹2,000 - ₹5,000" },
    { id: "above5000", label: "₹5,000 & Above" }
  ];

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3 transition-all duration-200">
      {/* ================= 1. HEADER ROW ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5 text-left">
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

        {/* Action Controls */}
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

      {/* ================= 2. INTEGRATED 4 KPI STATS CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
        {/* Card 1: Active Listings */}
        <div className="bg-slate-50/70 dark:bg-slate-900/60 rounded-xl p-2.5 sm:p-3 border border-slate-200/60 dark:border-slate-800/70 flex flex-col justify-between transition hover:border-amber-400/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Listings
            </span>
            <div className="h-6 w-6 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Package size={13} />
            </div>
          </div>
          <div className="my-1 text-left">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {totalProducts} <span className="text-xs font-bold text-slate-400">SKUs</span>
            </h3>
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-800/50 pt-1">
            <span>{categoriesCount} Categories</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">{totalStockUnits} Total Units</span>
          </div>
        </div>

        {/* Card 2: Inventory Value */}
        <div className="bg-slate-50/70 dark:bg-slate-900/60 rounded-xl p-2.5 sm:p-3 border border-slate-200/60 dark:border-slate-800/70 flex flex-col justify-between transition hover:border-emerald-400/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Inventory Value
            </span>
            <div className="h-6 w-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <DollarSign size={13} />
            </div>
          </div>
          <div className="my-1 text-left">
            <h3 className="text-base sm:text-lg font-black text-amber-500 dark:text-amber-400 tracking-tight">
              ₹{totalInventoryCapital.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </h3>
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-800/50 pt-1">
            <span>Capital Locked</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">In-stock Assets</span>
          </div>
        </div>

        {/* Card 3: Stock Health */}
        <div className="bg-slate-50/70 dark:bg-slate-900/60 rounded-xl p-2.5 sm:p-3 border border-slate-200/60 dark:border-slate-800/70 flex flex-col justify-between transition hover:border-blue-400/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Stock Health
            </span>
            <div className={`h-6 w-6 rounded-md ${healthyPercentage >= 80 ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"} border border-slate-200/50 dark:border-slate-800 flex items-center justify-center`}>
              <CheckCircle2 size={13} />
            </div>
          </div>
          <div className="my-1 text-left">
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {healthyPercentage}%
              </h3>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                Healthy
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex my-0.5">
            <div style={{ width: `${healthyPercentage}%` }} className="bg-emerald-500 h-full" title="Healthy Stock" />
            <div style={{ width: `${totalProducts > 0 ? (lowStockCount / totalProducts) * 100 : 0}%` }} className="bg-amber-500 h-full" title="Low Stock" />
            <div style={{ width: `${totalProducts > 0 ? (outOfStockCount / totalProducts) * 100 : 0}%` }} className="bg-rose-500 h-full" title="Out of Stock" />
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 pt-0.5 border-t border-slate-200/50 dark:border-slate-800/50">
            <span className="text-emerald-600 dark:text-emerald-400">{healthyStockCount} Good</span>
            <span className="text-amber-500">{lowStockCount} Low</span>
            <span className="text-rose-500">{outOfStockCount} OOS</span>
          </div>
        </div>

        {/* Card 4: Avg Selling Price */}
        <div className="bg-slate-50/70 dark:bg-slate-900/60 rounded-xl p-2.5 sm:p-3 border border-slate-200/60 dark:border-slate-800/70 flex flex-col justify-between transition hover:border-indigo-400/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Avg Selling Price
            </span>
            <div className="h-6 w-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <TrendingUp size={13} />
            </div>
          </div>
          <div className="my-1 text-left">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              ₹{Math.round(avgSellingPrice).toLocaleString("en-IN")}
            </h3>
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-800/50 pt-1">
            <span>Per SKU Mean</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">Standard Catalog</span>
          </div>
        </div>
      </div>

      {/* ================= 3. INTEGRATED SEARCH & FILTERS ROW ================= */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
        {/* Search & View Mode row */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, SKU, brand, tags, category..."
              className="w-full pl-9 pr-8 py-2 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 border border-slate-200/70 dark:border-slate-800 focus:border-amber-500/60 dark:focus:border-amber-500/60 focus:bg-white dark:focus:bg-slate-950 outline-none transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Right Action Switchers: View Mode, Results Count */}
          <div className="flex items-center gap-2 justify-between lg:justify-end flex-wrap shrink-0">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Showing <strong className="text-slate-900 dark:text-slate-100">{totalFilteredCount}</strong> of {totalProductsCount} items
            </div>

            {/* View Mode Toggle (Table / Grid) */}
            <div className="flex bg-slate-100 dark:bg-slate-800/90 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md transition cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-2xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
                title="Table View (Data Grid)"
              >
                <List size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-2xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
                title="Grid View (Showcase Cards)"
              >
                <LayoutGrid size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Multi-Filter Selectors & Sort */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5">
          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800">
            <Layers size={12} className="text-amber-500 shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="All" className="dark:bg-slate-900">All Categories</option>
              {categories.filter(c => c !== "All").map(cat => (
                <option key={cat} value={cat} className="dark:bg-slate-900">{cat}</option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800">
            <Boxes size={12} className="text-emerald-500 shrink-0" />
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="All" className="dark:bg-slate-900">All Stock Levels</option>
              <option value="Healthy" className="dark:bg-slate-900">Healthy Stock (10+)</option>
              <option value="Low Stock" className="dark:bg-slate-900">Low Stock (&lt; 10)</option>
              <option value="Out of Stock" className="dark:bg-slate-900">Out of Stock (0)</option>
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800">
            <DollarSign size={12} className="text-amber-500 shrink-0" />
            <select
              value={priceRangeFilter}
              onChange={(e) => setPriceRangeFilter(e.target.value)}
              className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              {priceRanges.map(pr => (
                <option key={pr.id} value={pr.id} className="dark:bg-slate-900">{pr.label}</option>
              ))}
            </select>
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800 ml-auto">
            <ArrowUpDown size={12} className="text-indigo-500 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="newest" className="dark:bg-slate-900">Sort: Newest First</option>
              <option value="name-asc" className="dark:bg-slate-900">Name: A to Z</option>
              <option value="name-desc" className="dark:bg-slate-900">Name: Z to A</option>
              <option value="price-asc" className="dark:bg-slate-900">Price: Low to High</option>
              <option value="price-desc" className="dark:bg-slate-900">Price: High to Low</option>
              <option value="stock-asc" className="dark:bg-slate-900">Stock: Low to High</option>
              <option value="stock-desc" className="dark:bg-slate-900">Stock: High to Low</option>
            </select>
          </div>

          {/* Rows per page */}
          <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-50 dark:bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800">
            <span>Show:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value) || 20)}
              className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value={10} className="dark:bg-slate-900">10</option>
              <option value={20} className="dark:bg-slate-900">20</option>
              <option value={50} className="dark:bg-slate-900">50</option>
              <option value={100} className="dark:bg-slate-900">100</option>
            </select>
          </div>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition cursor-pointer"
            >
              <X size={11} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsControlPanel;
