import React, { useState } from "react";
import {
  RotateCcw,
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
  Package,
  Calendar,
  Layers,
  FileSpreadsheet,
  FileCode,
  X,
  CornerDownLeft,
  ShieldCheck,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ReturnsControlPanel = ({
  returns = [],
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  datePreset,
  setDatePreset,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onRefresh,
  onExportCSV,
  onExportJSON,
  loading = false,
  totalFilteredCount = 0
}) => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Compute live RMA metrics
  const totalReturnsCount = returns.length;
  const totalRMAValue = returns.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const pendingRequests = returns.filter((r) => {
    const s = (r.status || "").toLowerCase();
    return s.includes("request") || s.includes("pending") || s.includes("review");
  });

  const activePickupReturns = returns.filter((r) => {
    const s = (r.status || "").toLowerCase();
    return s.includes("pickup") || s.includes("transit") || s.includes("approved");
  });

  const completedReturns = returns.filter((r) => {
    const s = (r.status || "").toLowerCase();
    return s.includes("complete") || s.includes("refunded") || s.includes("done");
  });
  const completedRefundValue = completedReturns.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const rejectedReturns = returns.filter((r) => {
    const s = (r.status || "").toLowerCase();
    return s.includes("reject") || s.includes("cancel");
  });

  const handleRefreshClick = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handlePresetChange = (preset) => {
    setDatePreset(preset);
    const now = new Date();
    if (preset === "all") {
      setStartDate("");
      setEndDate("");
    } else if (preset === "today") {
      const todayStr = now.toISOString().split("T")[0];
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === "week") {
      const lastWeek = new Date();
      lastWeek.setDate(now.getDate() - 7);
      setStartDate(lastWeek.toISOString().split("T")[0]);
      setEndDate(now.toISOString().split("T")[0]);
    } else if (preset === "month") {
      const lastMonth = new Date();
      lastMonth.setMonth(now.getMonth() - 1);
      setStartDate(lastMonth.toISOString().split("T")[0]);
      setEndDate(now.toISOString().split("T")[0]);
    }
  };

  const statusTabs = [
    { id: "All", label: "All RMAs", count: totalReturnsCount },
    { id: "Pending", label: "Needs Review", count: pendingRequests.length, alert: pendingRequests.length > 0 },
    { id: "In Pickup", label: "Approved / In Pickup", count: activePickupReturns.length },
    { id: "Completed", label: "Completed & Refunded", count: completedReturns.length },
    { id: "Rejected", label: "Rejected / Cancelled", count: rejectedReturns.length }
  ];

  const isFiltered =
    searchQuery ||
    statusFilter !== "All" ||
    typeFilter !== "All" ||
    sortBy !== "newest" ||
    datePreset !== "all" ||
    startDate ||
    endDate;

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setTypeFilter("All");
    setSortBy("newest");
    setDatePreset("all");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3 transition-all duration-200 text-left">
      {/* ================= 1. HEADER ROW ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5 text-left">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <RotateCcw size={11} className="text-amber-500" />
              <span>Reverse Logistics & RMA Desk</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck size={10} className="text-emerald-500" />
              Buyer Protection Enabled
            </span>
          </div>
          <h1 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Customer Return & Exchange Requests
          </h1>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Process return authorizations, approve exchange size replacements, assign reverse pickup drivers, and issue instant buyer refunds.
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
            title="Refresh RMA Requests"
          >
            <RefreshCw size={13} className={`${isRefreshing || loading ? "animate-spin text-amber-500" : "text-slate-500"}`} />
            <span className="hidden sm:inline">Refresh RMA Desk</span>
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
              title="RMA Cards View"
            >
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ================= 2. INTEGRATED 4 KPI STATS CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
        {/* Card 1: Total RMAs */}
        <div className="bg-slate-50/70 dark:bg-slate-900/60 rounded-xl p-2.5 sm:p-3 border border-slate-200/60 dark:border-slate-800/70 flex flex-col justify-between transition hover:border-amber-400/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Returns
            </span>
            <div className="h-6 w-6 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <CornerDownLeft size={13} />
            </div>
          </div>
          <div className="my-1 text-left">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {totalReturnsCount}
            </h3>
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-800/50 pt-1">
            <span>Claimed Total</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              ₹{totalRMAValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Card 2: Needs Review */}
        <div className="bg-slate-50/70 dark:bg-slate-900/60 rounded-xl p-2.5 sm:p-3 border border-slate-200/60 dark:border-slate-800/70 flex flex-col justify-between transition hover:border-amber-400/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
              {pendingRequests.length > 0 && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />}
              Needs Review
            </span>
            <div className="h-6 w-6 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Clock size={13} />
            </div>
          </div>
          <div className="my-1 text-left">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {pendingRequests.length}
            </h3>
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-800/50 pt-1">
            <span>Decision Queue</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              {pendingRequests.length > 0 ? "Awaiting approval" : "All reviewed"}
            </span>
          </div>
        </div>

        {/* Card 3: Reverse Pickup / Transit */}
        <div className="bg-slate-50/70 dark:bg-slate-900/60 rounded-xl p-2.5 sm:p-3 border border-slate-200/60 dark:border-slate-800/70 flex flex-col justify-between transition hover:border-indigo-400/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
              Reverse Pickup
            </span>
            <div className="h-6 w-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Truck size={13} />
            </div>
          </div>
          <div className="my-1 text-left">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {activePickupReturns.length}
            </h3>
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-800/50 pt-1">
            <span>Courier Dispatch</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">In transit to hub</span>
          </div>
        </div>

        {/* Card 4: Completed & Refunded */}
        <div className="bg-slate-50/70 dark:bg-slate-900/60 rounded-xl p-2.5 sm:p-3 border border-slate-200/60 dark:border-slate-800/70 flex flex-col justify-between transition hover:border-emerald-400/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
              Completed & Refunded
            </span>
            <div className="h-6 w-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={13} />
            </div>
          </div>
          <div className="my-1 text-left">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {completedReturns.length}
            </h3>
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-800/50 pt-1">
            <span>Settled Value</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              ₹{completedRefundValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })} Refunded
            </span>
          </div>
        </div>
      </div>

      {/* ================= 3. INTEGRATED SEARCH, DATE PRESETS & FILTERS ================= */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
        {/* Row A: Search Box + Type Filter + Sorting */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, Item Name, Customer Name, Verification Code, Reason..."
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

          {/* Right Selectors: Return Type, Sort & Reset */}
          <div className="flex items-center gap-2 justify-between lg:justify-end flex-wrap shrink-0">
            {/* Return Type Filter */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800">
              <Layers size={12} className="text-amber-500 shrink-0" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="All" className="dark:bg-slate-900">All Return Types</option>
                <option value="Refund" className="dark:bg-slate-900">Refund</option>
                <option value="Exchange" className="dark:bg-slate-900">Exchange / Size Swap</option>
                <option value="Replacement" className="dark:bg-slate-900">Replacement</option>
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
              </select>
            </div>

            {/* Reset Filters */}
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

        {/* Row B: Date Filter Presets + Custom Date Range */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/40 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
              <Calendar size={12} /> Period:
            </span>
            {[
              { id: "all", label: "All Time" },
              { id: "today", label: "Today" },
              { id: "week", label: "Last 7 Days" },
              { id: "month", label: "This Month" },
              { id: "custom", label: "Custom Range" }
            ].map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  if (preset.id === "custom") {
                    setDatePreset("custom");
                  } else {
                    handlePresetChange(preset.id);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition cursor-pointer ${
                  datePreset === preset.id
                    ? "bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs"
                    : "bg-slate-100/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {datePreset === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg bg-slate-100 dark:bg-slate-900 px-2 py-1 text-[10px] font-bold text-slate-800 dark:text-white outline-none border border-slate-200 dark:border-slate-800"
              />
              <span className="text-[10px] text-slate-400 font-bold">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg bg-slate-100 dark:bg-slate-900 px-2 py-1 text-[10px] font-bold text-slate-800 dark:text-white outline-none border border-slate-200 dark:border-slate-800"
              />
            </div>
          )}

          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-auto">
            Showing <strong className="text-slate-900 dark:text-slate-100">{totalFilteredCount}</strong> of {totalReturnsCount} returns
          </div>
        </div>

        {/* Row C: Status Filter Carousel Tabs */}
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

export default ReturnsControlPanel;
