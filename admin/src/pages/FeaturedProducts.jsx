import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../config";
import {
  Sparkles,
  Search,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  ArrowUpRight,
  TrendingUp,
  Tag,
  Star,
  Eye,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List as ListIcon,
  Zap,
  ArrowUpDown,
  Percent,
  SlidersHorizontal,
  RefreshCw,
  Power
} from "lucide-react";

const FeaturedProducts = ({ token }) => {
  const [featuredList, setFeaturedList] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Filter & Search states
  const [activeTab, setActiveTab] = useState("all"); // "all" | "live" | "scheduled" | "paused"
  const [tableSearch, setTableSearch] = useState("");
  const [viewMode, setViewMode] = useState("table"); // "table" | "grid"
  const [autoplaySpeed, setAutoplaySpeed] = useState(5);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewActiveIndex, setPreviewActiveIndex] = useState(0);

  // Form Fields
  const [selectedProductId, setSelectedProductId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [priority, setPriority] = useState(10);
  const [discount, setDiscount] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Fetch featured products
  const fetchFeatured = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/product/featured/admin`, {
        headers: { token }
      });
      if (res.data?.success) {
        setFeaturedList(res.data.products || []);
      }
    } catch (err) {
      console.error("Error fetching featured products:", err);
      toast.error(err.response?.data?.message || "Failed to load featured products");
    } finally {
      setLoading(false);
    }
  };

  // Fetch full catalog for product selector
  const fetchCatalog = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/product/list?limit=100`);
      if (res.data?.success) {
        setCatalog(res.data.products || []);
      }
    } catch (err) {
      console.error("Error fetching catalog:", err);
    }
  };

  useEffect(() => {
    fetchFeatured();
    fetchCatalog();
  }, [token]);

  // Helper: compute promotion status
  const getPromoStatus = (item) => {
    if (!item.isFeatured) {
      return { label: "Paused", state: "paused", color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700" };
    }
    const now = new Date();
    if (item.featuredStartDate && new Date(item.featuredStartDate) > now) {
      return { label: "Scheduled", state: "scheduled", color: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800/60" };
    }
    if (item.featuredEndDate && new Date(item.featuredEndDate) < now) {
      return { label: "Expired", state: "paused", color: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800/60" };
    }
    return { label: "Live", state: "live", color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60" };
  };

  // Metrics computation
  const stats = useMemo(() => {
    const liveItems = featuredList.filter(p => getPromoStatus(p).state === "live");
    const scheduledItems = featuredList.filter(p => getPromoStatus(p).state === "scheduled");
    const pausedItems = featuredList.filter(p => getPromoStatus(p).state === "paused");

    const totalDiscounts = featuredList.reduce((acc, curr) => acc + (curr.featuredDiscount || 0), 0);
    const avgDiscount = featuredList.length > 0 ? Math.round(totalDiscounts / featuredList.length) : 0;

    return {
      total: featuredList.length,
      liveCount: liveItems.length,
      scheduledCount: scheduledItems.length,
      pausedCount: pausedItems.length,
      avgDiscount
    };
  }, [featuredList]);

  // Filter queue by active tab and search query
  const filteredQueue = useMemo(() => {
    return featuredList.filter(item => {
      const status = getPromoStatus(item);
      
      // Tab filter
      if (activeTab === "live" && status.state !== "live") return false;
      if (activeTab === "scheduled" && status.state !== "scheduled") return false;
      if (activeTab === "paused" && status.state !== "paused") return false;

      // Search query filter
      if (tableSearch.trim()) {
        const q = tableSearch.toLowerCase().trim();
        const nameMatch = item.name?.toLowerCase().includes(q);
        const catMatch = item.category?.toLowerCase().includes(q);
        const brandMatch = item.brand?.toLowerCase().includes(q);
        return nameMatch || catMatch || brandMatch;
      }

      return true;
    });
  }, [featuredList, activeTab, tableSearch]);

  // Filter catalog for search dropdown in modal
  const filteredCatalog = useMemo(() => {
    if (!searchQuery.trim()) return catalog.slice(0, 15);
    const q = searchQuery.toLowerCase();
    return catalog.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
    ).slice(0, 15);
  }, [catalog, searchQuery]);

  const openAddModal = () => {
    setEditingItem(null);
    setSelectedProductId("");
    setSearchQuery("");
    setPriority(10);
    setDiscount(0);
    setStartDate("");
    setEndDate("");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setSelectedProductId(item._id);
    setSearchQuery(item.name || "");
    setPriority(item.featuredPriority || 0);
    setDiscount(item.featuredDiscount || 0);
    setStartDate(item.featuredStartDate ? item.featuredStartDate.split("T")[0] : "");
    setEndDate(item.featuredEndDate ? item.featuredEndDate.split("T")[0] : "");
    setIsActive(Boolean(item.isFeatured));
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedProductId) {
      toast.warning("Please select a product from the catalog");
      return;
    }

    setSaving(true);
    try {
      const res = await axios.put(
        `${backendUrl}/api/product/featured/${selectedProductId}`,
        {
          isFeatured: isActive,
          featuredPriority: Number(priority) || 0,
          featuredDiscount: Number(discount) || 0,
          featuredStartDate: startDate ? new Date(startDate).toISOString() : null,
          featuredEndDate: endDate ? new Date(endDate).toISOString() : null
        },
        { headers: { token } }
      );

      if (res.data?.success) {
        toast.success(res.data.message || "Featured showcase updated successfully");
        setIsModalOpen(false);
        fetchFeatured();
      } else {
        toast.error(res.data?.message || "Failed to update featured product");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.response?.data?.message || "Error saving featured product");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const newStatus = !item.isFeatured;
      const res = await axios.put(
        `${backendUrl}/api/product/featured/${item._id}`,
        {
          isFeatured: newStatus,
          featuredPriority: item.featuredPriority || 0,
          featuredDiscount: item.featuredDiscount || 0,
          featuredStartDate: item.featuredStartDate || null,
          featuredEndDate: item.featuredEndDate || null
        },
        { headers: { token } }
      );

      if (res.data?.success) {
        toast.success(newStatus ? "Activated in carousel" : "Paused from carousel");
        setFeaturedList((prev) =>
          prev.map((p) => (p._id === item._id ? { ...p, isFeatured: newStatus } : p))
        );
      }
    } catch (err) {
      toast.error("Failed to toggle status");
    }
  };

  const handlePriorityChange = async (item, delta) => {
    const newPriority = Math.max(0, (item.featuredPriority || 0) + delta);
    try {
      const res = await axios.put(
        `${backendUrl}/api/product/featured/${item._id}`,
        {
          isFeatured: item.isFeatured,
          featuredPriority: newPriority,
          featuredDiscount: item.featuredDiscount || 0,
          featuredStartDate: item.featuredStartDate || null,
          featuredEndDate: item.featuredEndDate || null
        },
        { headers: { token } }
      );

      if (res.data?.success) {
        setFeaturedList((prev) =>
          prev
            .map((p) => (p._id === item._id ? { ...p, featuredPriority: newPriority } : p))
            .sort((a, b) => (b.featuredPriority || 0) - (a.featuredPriority || 0))
        );
      }
    } catch (err) {
      toast.error("Failed to update priority");
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Remove this product from the featured showcase carousel?")) return;
    try {
      const res = await axios.put(
        `${backendUrl}/api/product/featured/${id}`,
        { isFeatured: false },
        { headers: { token } }
      );

      if (res.data?.success) {
        toast.success("Removed from featured carousel");
        setFeaturedList((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (err) {
      toast.error("Failed to remove product");
    }
  };

  const selectedProductObj = catalog.find((p) => p._id === selectedProductId);

  // Live products for preview modal
  const liveFeaturedProducts = useMemo(() => {
    return featuredList.filter(p => p.isFeatured);
  }, [featuredList]);

  return (
    <div className="w-full space-y-3.5 select-none font-sans text-slate-800 dark:text-slate-100 animate-fadeIn">
      
      {/* ── UNIFIED HERO CONTROL & METRICS CARD ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden transition-all">
        
        {/* Top Header Row */}
        <div className="p-3.5 sm:p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r from-orange-500/[0.03] via-transparent to-transparent">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-sm shadow-orange-500/20 shrink-0">
                <Sparkles size={16} className="stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Featured Showcase Carousel
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                    Live Deal
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-500 dark:text-slate-400">
                  Control single-product showcase deals highlighted prominently on the CartNOW homepage.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {liveFeaturedProducts.length > 0 && (
              <button
                onClick={() => {
                  setPreviewActiveIndex(0);
                  setShowPreviewModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <Eye size={13} />
                <span>Live Preview</span>
              </button>
            )}

            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-sm shadow-orange-500/20 transition-all cursor-pointer border-none hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={14} className="stroke-[2.5]" />
              <span>Feature a Product</span>
            </button>
          </div>
        </div>

        {/* Integrated KPI Metrics Strip (Compact) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 dark:divide-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          
          {/* KPI 1: Live */}
          <div className="p-2.5 sm:p-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Live in Carousel
                </span>
                {stats.liveCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </div>
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                {stats.liveCount} <span className="text-[11px] font-medium text-slate-400">Active</span>
              </div>
            </div>
          </div>

          {/* KPI 2: Total Queue */}
          <div className="p-2.5 sm:p-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
              <TrendingUp size={16} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Total in Queue
              </span>
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                {stats.total} <span className="text-[11px] font-medium text-slate-400">Products</span>
              </div>
            </div>
          </div>

          {/* KPI 3: Avg Discount */}
          <div className="p-2.5 sm:p-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Percent size={15} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Avg. Promo Discount
              </span>
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                {stats.avgDiscount > 0 ? `${stats.avgDiscount}%` : "Dynamic"}
              </div>
            </div>
          </div>

          {/* KPI 4: Autoplay Interval */}
          <div className="p-2.5 sm:p-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
              <Clock size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Rotation Interval
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <select
                  value={autoplaySpeed}
                  onChange={(e) => setAutoplaySpeed(Number(e.target.value))}
                  className="bg-transparent text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer border-b border-dashed border-slate-300 dark:border-slate-700 pb-0.5"
                >
                  <option value={3} className="dark:bg-slate-900 text-slate-800 dark:text-white">3 Seconds</option>
                  <option value={5} className="dark:bg-slate-900 text-slate-800 dark:text-white">5 Seconds (Default)</option>
                  <option value={7} className="dark:bg-slate-900 text-slate-800 dark:text-white">7 Seconds</option>
                  <option value={10} className="dark:bg-slate-900 text-slate-800 dark:text-white">10 Seconds</option>
                </select>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── FILTER TABS, SEARCH & VIEW MODE SWITCHER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-0.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-x-auto scrollbar-hide">
          {[
            { id: "all", label: "All Items", count: stats.total },
            { id: "live", label: "Live", count: stats.liveCount, dot: "bg-emerald-500" },
            { id: "scheduled", label: "Scheduled", count: stats.scheduledCount, dot: "bg-amber-500" },
            { id: "paused", label: "Paused / Expired", count: stats.pausedCount, dot: "bg-slate-400" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${
                  isActive
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent"
                }`}
              >
                {tab.dot && <span className={`w-1.5 h-1.5 rounded-full ${tab.dot}`} />}
                <span>{tab.label}</span>
                <span className={`text-[9.5px] px-1.5 py-0.2 rounded-md ${
                  isActive
                    ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900 font-black"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Search and View Toggles */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Search queue..."
              className="pl-7.5 pr-2.5 py-1 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-orange-500 shadow-2xs w-40 sm:w-48"
            />
            {tableSearch && (
              <button
                onClick={() => setTableSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-none"
              >
                <X size={11} />
              </button>
            )}
          </div>

          {/* View mode toggle */}
          <div className="flex items-center p-0.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <button
              onClick={() => setViewMode("table")}
              title="Table View"
              className={`p-1 rounded-md cursor-pointer transition border-none ${
                viewMode === "table"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                  : "text-slate-400 hover:text-slate-600 bg-transparent"
              }`}
            >
              <ListIcon size={14} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              title="Grid Card View"
              className={`p-1 rounded-md cursor-pointer transition border-none ${
                viewMode === "grid"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                  : "text-slate-400 hover:text-slate-600 bg-transparent"
              }`}
            >
              <LayoutGrid size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── QUEUE LISTING / CARDS ── */}
      {loading ? (
        <div className="p-10 text-center text-slate-400 animate-pulse bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-orange-500" />
          <span className="text-xs">Loading featured showcase queue...</span>
        </div>
      ) : filteredQueue.length === 0 ? (
        <div className="p-10 text-center space-y-2.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <AlertCircle size={20} />
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">
            No products found
          </h3>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            {tableSearch ? "No items in the queue match your search filter." : "No products are currently in this queue status."}
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1 text-xs font-bold text-orange-500 hover:underline cursor-pointer bg-transparent border-none mt-1"
          >
            <Plus size={12} />
            <span>Feature a product now</span>
          </button>
        </div>
      ) : viewMode === "table" ? (
        
        /* ── TABLE VIEW ── */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-[9.5px] font-black tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 pl-4">Priority</th>
                  <th className="py-2.5 px-3">Product Details</th>
                  <th className="py-2.5 px-3">Pricing</th>
                  <th className="py-2.5 px-3">Promo Deal</th>
                  <th className="py-2.5 px-3">Schedule</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                {filteredQueue.map((item) => {
                  const status = getPromoStatus(item);
                  const firstImg = item.images?.[0] || "/favicon.png";

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition group">
                      
                      {/* Priority Rank & Quick Reorder */}
                      <td className="py-2.5 px-3 pl-4">
                        <div className="flex items-center gap-1.5">
                          <span className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 font-black text-[11px] flex items-center justify-center border border-orange-500/20">
                            #{item.featuredPriority || 0}
                          </span>
                          <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handlePriorityChange(item, 1)}
                              title="Increase Priority"
                              className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-orange-500 flex items-center justify-center text-[9px] cursor-pointer border-none"
                            >
                              ▲
                            </button>
                            <button
                              onClick={() => handlePriorityChange(item, -1)}
                              title="Decrease Priority"
                              className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-orange-500 flex items-center justify-center text-[9px] cursor-pointer border-none"
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Product details */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={firstImg}
                            alt={item.name}
                            className="w-9 h-9 object-contain bg-slate-50 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200/60 dark:border-slate-700 shrink-0 shadow-2xs"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/favicon.png";
                            }}
                          />
                          <div className="min-w-0 max-w-[280px]">
                            <span className="font-bold text-slate-900 dark:text-white block truncate text-xs">
                              {item.name}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400 mt-0.5">
                              <span className="font-medium text-slate-500 dark:text-slate-400">{item.category || "General"}</span>
                              {item.brand && <span>• {item.brand}</span>}
                              {item.averageRating > 0 && (
                                <span className="inline-flex items-center gap-0.5 text-amber-500 font-bold ml-0.5">
                                  <Star size={9} className="fill-amber-400 text-amber-400" />
                                  {item.averageRating.toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-900 dark:text-white block text-xs">
                          ₹{item.price?.toLocaleString()}
                        </span>
                        {item.originalPrice > item.price && (
                          <span className="text-[10px] text-slate-400 line-through">
                            ₹{item.originalPrice?.toLocaleString()}
                          </span>
                        )}
                      </td>

                      {/* Discount Deal */}
                      <td className="py-2.5 px-3">
                        {item.featuredDiscount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold text-[11px] border border-orange-500/20">
                            <Tag size={10} />
                            {item.featuredDiscount}% OFF
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Standard Price</span>
                        )}
                      </td>

                      {/* Dates */}
                      <td className="py-2.5 px-3 text-[11px]">
                        {item.featuredStartDate || item.featuredEndDate ? (
                          <div className="space-y-0.5">
                            <span className="block text-slate-700 dark:text-slate-300 font-medium">
                              {item.featuredStartDate ? new Date(item.featuredStartDate).toLocaleDateString() : "Immediate"}
                            </span>
                            <span className="block text-slate-400 text-[9.5px]">
                              until {item.featuredEndDate ? new Date(item.featuredEndDate).toLocaleDateString() : "Indefinite"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">Always Active</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider border ${status.color}`}>
                          {status.state === "live" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                          {status.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 pr-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleToggleActive(item)}
                            title={item.isFeatured ? "Pause from carousel" : "Enable in carousel"}
                            className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                              item.isFeatured
                                ? "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                                : "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500 shadow-xs"
                            }`}
                          >
                            <Power size={11} />
                          </button>
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition cursor-pointer border-none bg-transparent"
                            title="Edit deal settings"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleRemove(item._id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer border-none bg-transparent"
                            title="Remove from carousel"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (

        /* ── VISUAL CARD GRID VIEW ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredQueue.map((item) => {
            const status = getPromoStatus(item);
            const firstImg = item.images?.[0] || "/favicon.png";

            return (
              <div
                key={item._id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
              >
                {/* Card Top: Image + Badges */}
                <div className="relative p-3.5 pb-2 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 flex items-center justify-center min-h-[130px]">
                  
                  {/* Priority badge */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-black shadow-xs">
                      #{item.featuredPriority || 0}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border shadow-2xs ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  <img
                    src={firstImg}
                    alt={item.name}
                    className="w-20 h-20 object-contain transition-transform group-hover:scale-105 duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/favicon.png";
                    }}
                  />

                  {/* Discount tag overlay */}
                  {item.featuredDiscount > 0 && (
                    <div className="absolute bottom-2 left-2.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500 text-white font-black text-[9.5px] shadow-sm">
                        <Tag size={9} />
                        {item.featuredDiscount}% OFF
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10.5px] font-bold text-orange-500 uppercase tracking-wider">
                      {item.category || "General"} {item.brand ? `• ${item.brand}` : ""}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                      {item.name}
                    </h3>
                  </div>

                  <div className="flex items-baseline justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-sm font-black text-slate-900 dark:text-white block">
                        ₹{item.price?.toLocaleString()}
                      </span>
                      {item.originalPrice > item.price && (
                        <span className="text-[10px] text-slate-400 line-through">
                          ₹{item.originalPrice?.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Schedule timing */}
                    <div className="text-right text-[9.5px] text-slate-400">
                      {item.featuredStartDate ? (
                        <span>{new Date(item.featuredStartDate).toLocaleDateString()} - {item.featuredEndDate ? new Date(item.featuredEndDate).toLocaleDateString() : "Indefinite"}</span>
                      ) : (
                        <span>Always Active</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleActive(item)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                      item.isFeatured
                        ? "bg-slate-200/80 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                        : "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500"
                    }`}
                  >
                    <Power size={11} />
                    <span>{item.isFeatured ? "Pause" : "Enable"}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition cursor-pointer border-none bg-transparent"
                      title="Edit Deal"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleRemove(item._id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer border-none bg-transparent"
                      title="Remove"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── LIVE HOMEPAGE PREVIEW MODAL ── */}
      {showPreviewModal && liveFeaturedProducts.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-500/10 text-orange-500 rounded-lg">
                  <Sparkles size={14} />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    Homepage Live Carousel Preview
                  </h3>
                  <span className="text-[10px] text-slate-400 block">
                    Simulating slide {previewActiveIndex + 1} of {liveFeaturedProducts.length}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer bg-transparent border-none"
              >
                <X size={16} />
              </button>
            </div>

            {/* Simulated Homepage Showcase Card */}
            <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-50 via-white to-orange-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-orange-950/20">
              {(() => {
                const current = liveFeaturedProducts[previewActiveIndex] || liveFeaturedProducts[0];
                const currentImg = current?.images?.[0] || "/favicon.png";

                return (
                  <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-lg flex flex-col sm:flex-row items-center gap-4">
                    {/* Left Details */}
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-black">
                        <Sparkles size={10} />
                        <span>FEATURED SHOWCASE DEAL</span>
                      </div>

                      <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white line-clamp-2">
                        {current.name}
                      </h2>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {current.shortDescription || current.description || "Limited time promotional deal featured directly on CartNOW."}
                      </p>

                      <div className="flex items-baseline gap-2 pt-0.5">
                        <span className="text-lg font-black text-slate-900 dark:text-white">
                          ₹{current.price?.toLocaleString()}
                        </span>
                        {current.originalPrice > current.price && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{current.originalPrice?.toLocaleString()}
                          </span>
                        )}
                        {current.featuredDiscount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-md bg-rose-500 text-white text-[10px] font-black">
                            {current.featuredDiscount}% OFF
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        className="px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition cursor-pointer border-none inline-flex items-center gap-1.5"
                      >
                        <span>Shop Deal Now</span>
                        <ArrowUpRight size={12} />
                      </button>
                    </div>

                    {/* Right Product Image */}
                    <div className="w-32 h-32 shrink-0 flex items-center justify-center p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                      <img
                        src={currentImg}
                        alt=""
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Slider Controls */}
              <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setPreviewActiveIndex((prev) => (prev > 0 ? prev - 1 : liveFeaturedProducts.length - 1))}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>

                {/* Dot indicators */}
                <div className="flex items-center gap-1">
                  {liveFeaturedProducts.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPreviewActiveIndex(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer border-none ${
                        previewActiveIndex === idx
                          ? "w-5 bg-orange-500"
                          : "w-1.5 bg-slate-200 dark:bg-slate-700"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setPreviewActiveIndex((prev) => (prev < liveFeaturedProducts.length - 1 ? prev + 1 : 0))}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD / EDIT FEATURE MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-500/10 text-orange-500 rounded-lg">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {editingItem ? "Edit Featured Deal Settings" : "Feature a Product in Carousel"}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Configure showcase priority, discount, and scheduling.
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer bg-transparent border-none"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-3.5 sm:p-4 space-y-3">
              
              {/* Product Search & Catalog Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Select Product from Catalog *
                </label>
                <div className="relative mb-1.5">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search product name, category, brand..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-orange-500 transition shadow-2xs"
                  />
                </div>

                {/* Dropdown Options */}
                <div className="max-h-36 overflow-y-auto border border-slate-200/80 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 scrollbar-hide shadow-inner">
                  {filteredCatalog.map((p) => (
                    <div
                      key={p._id}
                      onClick={() => {
                        setSelectedProductId(p._id);
                        setSearchQuery(p.name);
                      }}
                      className={`p-2 flex items-center gap-2.5 cursor-pointer text-xs transition ${
                        selectedProductId === p._id
                          ? "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <img
                        src={p.images?.[0] || "/favicon.png"}
                        alt=""
                        className="w-7 h-7 object-contain bg-slate-100 dark:bg-slate-800 rounded-md p-0.5 shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/favicon.png";
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <span className="truncate block text-xs">{p.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{p.category || "General"}</span>
                      </div>
                      <span className="font-black text-xs text-slate-700 dark:text-slate-300 shrink-0">₹{p.price?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority & Promotional Discount */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Priority Rank #
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    placeholder="e.g. 10"
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-orange-500 shadow-2xs font-bold"
                  />
                  <span className="text-[9.5px] text-slate-400 mt-0.5 block">Higher = displayed first</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Special Promo Discount %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="e.g. 25"
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-orange-500 shadow-2xs font-bold"
                  />
                  <span className="text-[9.5px] text-slate-400 mt-0.5 block">0 = uses standard discount</span>
                </div>
              </div>

              {/* Start Date & End Date Scheduling */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-orange-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    End Date (Expiry)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-orange-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* Active Toggle Switch */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Activate in Carousel Immediately
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Product will immediately enter the live rotation queue.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-orange-500 rounded cursor-pointer accent-orange-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer border-none bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-sm shadow-orange-500/20 transition cursor-pointer border-none flex items-center gap-1.5"
                >
                  {saving ? "Saving..." : "Save to Carousel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedProducts;
