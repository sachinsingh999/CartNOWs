import React, { useState } from "react";
import {
  Star,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  RefreshCw,
  LayoutGrid,
  List,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Calendar,
  FileSpreadsheet,
  FileCode,
  X,
  CornerDownRight,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronUp,
  ThumbsUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ReviewsControlPanel = ({
  reviews = [],
  searchQuery,
  setSearchQuery,
  starFilter,
  setStarFilter,
  replyFilter,
  setReplyFilter,
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
  const [showRatingBreakdown, setShowRatingBreakdown] = useState(false);

  // Compute live metrics
  const totalReviewsCount = reviews.length;
  const avgRating =
    totalReviewsCount > 0
      ? reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / totalReviewsCount
      : 0;

  const needsReplyCount = reviews.filter((r) => !r.reply || !r.reply.trim()).length;
  const repliedCount = reviews.filter((r) => r.reply && r.reply.trim()).length;
  const responseRate = totalReviewsCount > 0 ? Math.round((repliedCount / totalReviewsCount) * 100) : 100;

  const positiveReviews = reviews.filter((r) => (Number(r.rating) || 0) >= 4);
  const positiveRate = totalReviewsCount > 0 ? Math.round((positiveReviews.length / totalReviewsCount) * 100) : 100;

  const criticalReviews = reviews.filter((r) => (Number(r.rating) || 0) <= 2);

  // Distribution counts for 5, 4, 3, 2, 1 stars
  const starCounts = {
    5: reviews.filter((r) => Number(r.rating) === 5).length,
    4: reviews.filter((r) => Number(r.rating) === 4).length,
    3: reviews.filter((r) => Number(r.rating) === 3).length,
    2: reviews.filter((r) => Number(r.rating) === 2).length,
    1: reviews.filter((r) => Number(r.rating) === 1).length
  };

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

  const isFiltered =
    searchQuery ||
    starFilter !== "all" ||
    replyFilter !== "all" ||
    sortBy !== "newest" ||
    datePreset !== "all" ||
    startDate ||
    endDate;

  const handleResetFilters = () => {
    setSearchQuery("");
    setStarFilter("all");
    setReplyFilter("all");
    setSortBy("newest");
    setDatePreset("all");
    setStartDate("");
    setEndDate("");
  };

  const starTabs = [
    { id: "all", label: "All Reviews", count: totalReviewsCount },
    { id: "5", label: "5 Stars", count: starCounts[5] },
    { id: "4", label: "4 Stars", count: starCounts[4] },
    { id: "3", label: "3 Stars", count: starCounts[3] },
    { id: "2", label: "2 Stars", count: starCounts[2] },
    { id: "1", label: "1 Star", count: starCounts[1] }
  ];

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3 transition-all duration-200 text-left">
      {/* ================= 1. HEADER ROW ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5 text-left">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Star size={11} className="fill-amber-400 text-amber-500" />
              <span>Customer Reviews & Reputation Desk</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Sparkles size={10} className="text-indigo-500" />
              {responseRate}% Response Rate
            </span>
          </div>
          <h1 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Customer Product Reviews & Feedback
          </h1>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Inspect buyer feedback, track product satisfaction ratings, and publish official merchant responses.
          </p>
        </div>

        {/* Top Right Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap">
          {/* Rating Breakdown Toggle */}
          <button
            type="button"
            onClick={() => setShowRatingBreakdown(!showRatingBreakdown)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700/60 transition cursor-pointer"
            title="Toggle Rating Distribution Chart"
          >
            <TrendingUp size={13} className="text-amber-500" />
            <span className="hidden sm:inline">Rating Analytics</span>
            {showRatingBreakdown ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefreshClick}
            disabled={loading || isRefreshing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700/60 transition cursor-pointer active:scale-95 disabled:opacity-50"
            title="Refresh Reviews"
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

          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800/90 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                viewMode === "cards"
                  ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-2xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
              title="Cards View"
            >
              <LayoutGrid size={15} />
            </button>
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
          </div>
        </div>
      </div>

      {/* ================= 2. LIVE KPIS ROW (4 Integrated Cards) ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
        {/* KPI 1: Overall Average Rating */}
        <div className="bg-slate-50/70 dark:bg-slate-900/50 rounded-lg p-2.5 border border-slate-200/40 dark:border-slate-800/40 space-y-1">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
            <span className="text-[10px] font-black uppercase tracking-wider">Average Rating</span>
            <Award size={13} className="text-amber-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                {avgRating > 0 ? avgRating.toFixed(1) : "0.0"}
              </span>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={11}
                    className={i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-700"}
                  />
                ))}
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400">{totalReviewsCount} Total</span>
          </div>
        </div>

        {/* KPI 2: Needs Reply / Unanswered */}
        <div
          onClick={() => setReplyFilter(replyFilter === "unanswered" ? "all" : "unanswered")}
          className={`rounded-lg p-2.5 border transition cursor-pointer space-y-1 ${
            replyFilter === "unanswered"
              ? "bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/20"
              : "bg-slate-50/70 dark:bg-slate-900/50 border-slate-200/40 dark:border-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-850/50"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
            <span className="text-[10px] font-black uppercase tracking-wider">Needs Reply</span>
            {needsReplyCount > 0 && <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />}
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
              {needsReplyCount}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {repliedCount} Replied
            </span>
          </div>
        </div>

        {/* KPI 3: Positive Sentiment (4-5 Stars) */}
        <div
          onClick={() => setStarFilter(starFilter === "5" ? "all" : "5")}
          className={`rounded-lg p-2.5 border transition cursor-pointer space-y-1 ${
            starFilter === "5" || starFilter === "4"
              ? "bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/20"
              : "bg-slate-50/70 dark:bg-slate-900/50 border-slate-200/40 dark:border-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-850/50"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
            <span className="text-[10px] font-black uppercase tracking-wider">Positive (4-5★)</span>
            <ThumbsUp size={13} className="text-emerald-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {positiveRate}%
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {positiveReviews.length} Reviews
            </span>
          </div>
        </div>

        {/* KPI 4: Critical Reviews (1-2 Stars) */}
        <div
          onClick={() => setStarFilter(starFilter === "1" ? "all" : "1")}
          className={`rounded-lg p-2.5 border transition cursor-pointer space-y-1 ${
            starFilter === "1" || starFilter === "2"
              ? "bg-rose-500/10 border-rose-500/40 ring-1 ring-rose-500/20"
              : "bg-slate-50/70 dark:bg-slate-900/50 border-slate-200/40 dark:border-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-850/50"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
            <span className="text-[10px] font-black uppercase tracking-wider">Critical (1-2★)</span>
            <AlertCircle size={13} className={criticalReviews.length > 0 ? "text-rose-500" : "text-slate-400"} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-black text-rose-600 dark:text-rose-400 font-mono">
              {criticalReviews.length}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {criticalReviews.length > 0 ? "Needs Review" : "Zero Issues"}
            </span>
          </div>
        </div>
      </div>

      {/* ================= 3. COLLAPSIBLE RATING DISTRIBUTION BREAKDOWN ================= */}
      <AnimatePresence>
        {showRatingBreakdown && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-slate-50/80 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-black text-slate-700 dark:text-slate-300">
                <span>Rating Breakdown & Sentiment Distribution</span>
                <span className="text-slate-400 font-normal">Click any bar to filter</span>
              </div>

              <div className="space-y-1.5 text-xs font-semibold">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = starCounts[stars] || 0;
                  const pct = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
                  const isSelected = starFilter === String(stars);

                  return (
                    <div
                      key={stars}
                      onClick={() => setStarFilter(isSelected ? "all" : String(stars))}
                      className={`flex items-center gap-2.5 px-2 py-1 rounded-lg cursor-pointer transition ${
                        isSelected
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black"
                          : "hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <div className="flex items-center gap-1 w-14 shrink-0 font-mono text-[11px]">
                        <span>{stars}</span>
                        <Star size={11} className="fill-amber-400 text-amber-400" />
                      </div>

                      <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            stars >= 4
                              ? "bg-emerald-500"
                              : stars === 3
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="w-16 text-right font-mono text-[10px] text-slate-500 shrink-0">
                        {count} ({pct}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= 4. SEARCH, FILTERS & DATE PRESETS ROW ================= */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
        {/* Search Bar */}
        <div className="md:col-span-5 relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product, customer, or comment..."
            className="w-full pl-7 pr-7 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 rounded-lg text-slate-800 dark:text-white font-medium outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Response Status Filter */}
        <div className="md:col-span-2">
          <select
            value={replyFilter}
            onChange={(e) => setReplyFilter(e.target.value)}
            className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 rounded-lg text-slate-700 dark:text-slate-300 font-bold outline-none focus:border-amber-500 transition cursor-pointer"
          >
            <option value="all">All Feedback</option>
            <option value="unanswered">Needs Reply</option>
            <option value="replied">Replied</option>
          </select>
        </div>

        {/* Sorting Dropdown */}
        <div className="md:col-span-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 rounded-lg text-slate-700 dark:text-slate-300 font-bold outline-none focus:border-amber-500 transition cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating_high">Highest Rating (5★)</option>
            <option value="rating_low">Lowest Rating (1★)</option>
          </select>
        </div>

        {/* Date Filter Presets */}
        <div className="md:col-span-3 flex items-center gap-1 bg-slate-50 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
          {[
            { id: "all", label: "All" },
            { id: "today", label: "Today" },
            { id: "week", label: "7 Days" },
            { id: "month", label: "Month" }
          ].map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePresetChange(preset.id)}
              className={`flex-1 py-1 text-[10px] font-black uppercase rounded-md transition cursor-pointer ${
                datePreset === preset.id
                  ? "bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================= 5. RATING FILTER TABS CAROUSEL ================= */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          {starTabs.map((tab) => {
            const isActive = starFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStarFilter(tab.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition cursor-pointer ${
                  isActive
                    ? "bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs"
                    : "bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab.id !== "all" && (
                  <Star size={11} className={isActive ? "fill-white text-white dark:fill-slate-950 dark:text-slate-950" : "fill-amber-400 text-amber-400"} />
                )}
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                    isActive
                      ? "bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Summary & Reset */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold text-slate-400 font-mono">
            {totalFilteredCount} of {totalReviewsCount} reviews
          </span>
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
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

export default ReviewsControlPanel;
