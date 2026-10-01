import React, { useState } from "react";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  RefreshCw,
  LayoutGrid,
  List,
  DollarSign,
  AlertCircle,
  Sparkles,
  Package,
  Zap,
  FileSpreadsheet,
  FileCode,
  X,
  CreditCard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const OrdersControlPanel = ({
  orders = [],
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  paymentFilter,
  setPaymentFilter,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  onRefresh,
  onExportCSV,
  onExportJSON,
  loading = false,
  totalFilteredCount = 0
}) => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // KPI Calculations
  const totalOrdersCount = orders.length;
  const totalGMV = orders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

  // Auto-accepted orders needing packing and dispatch
  const toPackOrders = orders.filter((o) => {
    const s = (o.orderStatus || o.status || "").toLowerCase();
    return s.includes("placed") || s.includes("process") || s.includes("pending") || s === "accepted";
  });

  const readyForPickupOrders = orders.filter((o) => {
    const s = (o.orderStatus || o.status || "").toLowerCase();
    return s.includes("pickup");
  });

  const inTransitOrders = orders.filter((o) => {
    const s = (o.orderStatus || o.status || "").toLowerCase();
    return s.includes("transit") || s.includes("shipped") || s.includes("out");
  });

  const deliveredOrders = orders.filter((o) => {
    const s = (o.orderStatus || o.status || "").toLowerCase();
    return s.includes("deliver") || s.includes("complete");
  });
  const deliveredRevenue = deliveredOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

  const cancelledOrders = orders.filter((o) => {
    const s = (o.orderStatus || o.status || "").toLowerCase();
    return s.includes("cancel") || s.includes("reject");
  });

  const handleRefreshClick = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const statusTabs = [
    { id: "All", label: "All Orders", count: totalOrdersCount, color: "slate" },
    { id: "To Pack", label: "To Pack & Dispatch", count: toPackOrders.length, color: "amber", alert: toPackOrders.length > 0 },
    { id: "Ready For Pickup", label: "Ready For Pickup", count: readyForPickupOrders.length, color: "indigo" },
    { id: "In Transit", label: "In Transit", count: inTransitOrders.length, color: "sky" },
    { id: "Delivered", label: "Delivered", count: deliveredOrders.length, color: "emerald" },
    { id: "Cancelled", label: "Cancelled", count: cancelledOrders.length, color: "rose" }
  ];

  const isFiltered = searchQuery || statusFilter !== "All" || paymentFilter !== "All" || sortBy !== "newest";

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setPaymentFilter("All");
    setSortBy("newest");
  };

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3 transition-all duration-200 text-left">
      {/* ================= 1. HEADER ROW ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5 text-left">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <ShoppingBag size={11} className="text-amber-500" />
              <span>Customer Orders & Fulfillment Desk</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Zap size={10} className="fill-emerald-500" />
              Auto-Accept Active
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Orders are automatically accepted into your packing queue. Pack your parcels and click <strong>Ready For Pickup</strong> to trigger automated courier handoff.
          </p>
        </div>

        {/* Top Right Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefreshClick}
            disabled={loading || isRefreshing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700/60 transition cursor-pointer active:scale-95 disabled:opacity-50"
            title="Sync latest customer orders from backend"
          >
            <RefreshCw size={13} className={`${isRefreshing || loading ? "animate-spin text-amber-500" : "text-slate-500"}`} />
            <span className="hidden sm:inline">Sync Orders</span>
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

          {/* View Mode Toggle */}
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
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                viewMode === "cards"
                  ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-2xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
              title="Fulfillment Cards View"
            >
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ================= 2. INTEGRATED 4 KPI STATS CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
        {/* Card 1: Total Orders */}
        <div className="bg-slate-50/70 dark:bg-slate-900/60 rounded-xl p-2.5 sm:p-3 border border-slate-200/60 dark:border-slate-800/70 flex flex-col justify-between transition hover:border-amber-400/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Orders
            </span>
            <div className="h-6 w-6 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <ShoppingBag size={13} />
            </div>
          </div>
          <div className="my-1 text-left">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {totalOrdersCount}
            </h3>
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-800/50 pt-1">
            <span>Gross Volume</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              ₹{totalGMV.toLocaleString("en-IN", { minimumFractionDigits: 2 })} GMV
            </span>
          </div>
        </div>

        {/* Card 2: To Pack & Dispatch */}
        <div className="bg-slate-50/70 dark:bg-slate-900/60 rounded-xl p-2.5 sm:p-3 border border-slate-200/60 dark:border-slate-800/70 flex flex-col justify-between transition hover:border-amber-400/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
              {toPackOrders.length > 0 && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />}
              To Pack & Dispatch
            </span>
            <div className="h-6 w-6 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Package size={13} />
            </div>
          </div>
          <div className="my-1 text-left">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {toPackOrders.length}
            </h3>
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-800/50 pt-1">
            <span>Packing Status</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              {toPackOrders.length > 0 ? "Ready for warehouse pickup" : "All packed"}
            </span>
          </div>
        </div>

        {/* Card 3: In Courier Transit */}
        <div className="bg-slate-50/70 dark:bg-slate-900/60 rounded-xl p-2.5 sm:p-3 border border-slate-200/60 dark:border-slate-800/70 flex flex-col justify-between transition hover:border-indigo-400/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
              In Courier Transit
            </span>
            <div className="h-6 w-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Truck size={13} />
            </div>
          </div>
          <div className="my-1 text-left">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {inTransitOrders.length + readyForPickupOrders.length}
            </h3>
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-800/50 pt-1">
            <span>Logistics Route</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">Couriers on the road</span>
          </div>
        </div>

        {/* Card 4: Delivered Gross */}
        <div className="bg-slate-50/70 dark:bg-slate-900/60 rounded-xl p-2.5 sm:p-3 border border-slate-200/60 dark:border-slate-800/70 flex flex-col justify-between transition hover:border-emerald-400/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
              Delivered Gross
            </span>
            <div className="h-6 w-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={13} />
            </div>
          </div>
          <div className="my-1 text-left">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              ₹{deliveredRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </h3>
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-800/50 pt-1">
            <span>Fulfillment Rate</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {deliveredOrders.length} completed orders
            </span>
          </div>
        </div>
      </div>

      {/* ================= 3. INTEGRATED SEARCH & FILTERS ROW ================= */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
        {/* Search & Selectors row */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order #, customer name, phone, city, or product..."
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

          {/* Right Action Selectors: Payment Filter, Sort, Result Count */}
          <div className="flex items-center gap-2 justify-between lg:justify-end flex-wrap shrink-0">
            {/* Payment Filter */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800">
              <CreditCard size={12} className="text-amber-500 shrink-0" />
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="All" className="dark:bg-slate-900">All Payments</option>
                <option value="paid" className="dark:bg-slate-900">Paid</option>
                <option value="pending" className="dark:bg-slate-900">Payment Pending / COD</option>
                <option value="refunded" className="dark:bg-slate-900">Refunded</option>
              </select>
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800">
              <ArrowUpDown size={12} className="text-indigo-500 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="newest" className="dark:bg-slate-900">Newest First</option>
                <option value="oldest" className="dark:bg-slate-900">Oldest First</option>
                <option value="amount_high" className="dark:bg-slate-900">Amount: High to Low</option>
                <option value="amount_low" className="dark:bg-slate-900">Amount: Low to High</option>
                <option value="items_count" className="dark:bg-slate-900">Most Items First</option>
              </select>
            </div>

            {/* Reset Filters button */}
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition cursor-pointer"
              >
                <X size={11} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Carousel Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-0.5 pt-1">
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? "bg-amber-500 text-slate-950 shadow-2xs font-black"
                    : "bg-slate-100/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/80 dark:hover:bg-slate-800"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isActive
                      ? "bg-slate-950/20 text-slate-950"
                      : tab.alert
                      ? "bg-rose-500 text-white"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrdersControlPanel;
