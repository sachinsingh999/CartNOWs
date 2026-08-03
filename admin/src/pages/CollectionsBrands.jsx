import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import { 
  Award, Plus, Trash2, Check, Sparkles, Image, FileText, Bookmark, ShieldCheck, AlertTriangle, X, RefreshCw, Search, CheckCircle2, Clock
} from "lucide-react";

const CollectionsBrands = ({ token }) => {
  const [activeTab, setActiveTab] = useState("collections"); // "collections" | "brands"
  const [collections, setCollections] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Form states - Collections
  const [colName, setColName] = useState("");
  const [colBanner, setColBanner] = useState("");
  const [colDescription, setColDescription] = useState("");
  const [colStatus, setColStatus] = useState("active");

  // Form states - Brands
  const [brandName, setBrandName] = useState("");
  const [brandLogo, setBrandLogo] = useState("");
  const [brandBanner, setBrandBanner] = useState("");
  const [brandStatus, setBrandStatus] = useState("active");

  const fetchCollections = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/collections`, { headers: { token } });
      if (data.success) {
        setCollections(data.collections);
      }
    } catch {
      toast.error("Failed to load collections");
    }
  };

  const fetchBrands = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/brands`, { headers: { token } });
      if (data.success) {
        setBrands(data.brands);
      }
    } catch {
      toast.error("Failed to load brands");
    }
  };

  const fetchAllData = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchCollections(), fetchBrands()]);
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (token) {
      fetchAllData();
    }
  }, [token]);

  const handleCollectionSubmit = async (e) => {
    e.preventDefault();
    if (!colName.trim()) return toast.error("Collection name is required");
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/collection/create`,
        { name: colName, banner: colBanner, description: colDescription, status: colStatus },
        { headers: { token } }
      );
      if (data.success) {
        toast.success("Collection created successfully");
        setColName("");
        setColBanner("");
        setColDescription("");
        setColStatus("active");
        fetchCollections();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBrandSubmit = async (e) => {
    e.preventDefault();
    if (!brandName.trim()) return toast.error("Brand name is required");
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/brand/create`,
        { name: brandName, logo: brandLogo, banner: brandBanner, status: brandStatus },
        { headers: { token } }
      );
      if (data.success) {
        toast.success("Brand created successfully");
        setBrandName("");
        setBrandLogo("");
        setBrandBanner("");
        setBrandStatus("active");
        fetchBrands();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const approveCollection = async (id) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/collection/update`,
        { id, status: "active" },
        { headers: { token } }
      );
      if (data.success) {
        toast.success("Collection approved");
        fetchCollections();
      }
    } catch {
      toast.error("Failed to approve collection");
    }
  };

  const approveBrand = async (id) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/brand/update`,
        { id, status: "active" },
        { headers: { token } }
      );
      if (data.success) {
        toast.success("Brand approved");
        fetchBrands();
      }
    } catch {
      toast.error("Failed to approve brand");
    }
  };

  const deleteCollection = async (id) => {
    if (!window.confirm("Are you sure you want to remove this collection?")) return;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/collection/delete`,
        { id },
        { headers: { token } }
      );
      if (data.success) {
        toast.success("Collection deleted");
        fetchCollections();
      }
    } catch {
      toast.error("Failed to delete collection");
    }
  };

  const deleteBrand = async (id) => {
    if (!window.confirm("Are you sure you want to remove this brand?")) return;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/brand/delete`,
        { id },
        { headers: { token } }
      );
      if (data.success) {
        toast.success("Brand deleted");
        fetchBrands();
      }
    } catch {
      toast.error("Failed to delete brand");
    }
  };

  // Filter collections & brands reactively
  const filteredCollections = useMemo(() => {
    return collections.filter(c => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const inName = c.name?.toLowerCase().includes(q);
        const inDesc = c.description?.toLowerCase().includes(q);
        return inName || inDesc;
      }
      return true;
    });
  }, [collections, statusFilter, searchQuery]);

  const filteredBrands = useMemo(() => {
    return brands.filter(b => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const inName = b.name?.toLowerCase().includes(q);
        const inSlug = b.slug?.toLowerCase().includes(q);
        return inName || inSlug;
      }
      return true;
    });
  }, [brands, statusFilter, searchQuery]);

  // Analytics counts
  const totalCols = collections.length;
  const totalBrandsCount = brands.length;
  const activeCols = collections.filter(c => c.status === "active").length;
  const pendingCols = collections.filter(c => c.status === "pending").length;
  const activeBrands = brands.filter(b => b.status === "active").length;
  const pendingBrands = brands.filter(b => b.status === "pending").length;

  return (
    <div className="space-y-4 animate-fadeIn text-slate-800 dark:text-slate-100">
      
      {/* ── Single Consolidated Container: Header, Stats & Search Bar ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs space-y-3.5 shrink-0">
        
        {/* Top: Header Row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-indigo-600 dark:bg-indigo-500/10 text-white dark:text-indigo-400 rounded-lg flex items-center justify-center border border-indigo-500/10 shadow-xs shrink-0">
              <Award size={16} />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Curated Collections & Brands</h1>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Manage marketplace collection capsules, brand partnerships, and onboarding suggestions</p>
            </div>
          </div>

          <button
            onClick={fetchAllData}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg text-xs font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RefreshCw size={12} className={isRefreshing ? "animate-spin text-indigo-500" : ""} />
            <span>Refresh Records</span>
          </button>
        </div>

        {/* Middle: Analytics KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Curated Collections", val: totalCols, sub: `${activeCols} active capsules`, icon: Bookmark, color: "text-indigo-500 bg-indigo-500/10" },
            { label: "Marketplace Brands", val: totalBrandsCount, sub: `${activeBrands} partner brands`, icon: Award, color: "text-blue-500 bg-blue-500/10" },
            { label: "Pending Collections", val: pendingCols, sub: "Requires approval", icon: Clock, color: "text-amber-500 bg-amber-500/10" },
            { label: "Pending Brands", val: pendingBrands, sub: "Requires approval", icon: Sparkles, color: "text-emerald-500 bg-emerald-500/10" }
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="p-3 rounded-xl border bg-slate-50/70 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800 flex items-center justify-between group relative overflow-hidden"
              >
                <div className="space-y-1 relative z-10 text-left">
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {card.label}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{card.val}</span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    {card.sub}
                  </span>
                </div>
                <div className={`p-2 rounded-lg border ${card.color} border-slate-200/50 dark:border-slate-800 transition-transform duration-200 group-hover:scale-105 relative z-10`}>
                  <Icon size={14} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom: Tabs, Filter Pills & Search Input */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-0.5">
          {/* Main Module Toggle & Status Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200/80 dark:border-slate-800 flex items-center gap-1">
              <button
                onClick={() => setActiveTab("collections")}
                className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeTab === "collections"
                    ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                }`}
              >
                Collections ({collections.length})
              </button>
              <button
                onClick={() => setActiveTab("brands")}
                className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeTab === "brands"
                    ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                }`}
              >
                Brands ({brands.length})
              </button>
            </div>

            <div className="flex items-center gap-1">
              {[
                { id: "all", label: "All" },
                { id: "active", label: "Active" },
                { id: "pending", label: "Pending" },
                { id: "disabled", label: "Disabled" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-2 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    statusFilter === tab.id 
                      ? "bg-slate-800 dark:bg-slate-700 text-white shadow-xs" 
                      : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative flex items-center w-full sm:w-72 shrink-0">
            <Search size={13} className="absolute left-3 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder={activeTab === "collections" ? "Search collections..." : "Search brands..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-[11px] bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

      </div>

      {/* Main Grid Content */}
      {activeTab === "collections" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Create Collection Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-4 shrink-0 h-fit">
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Plus size={14} className="text-indigo-500" />
              <span>Create Collection Capsule</span>
            </h2>
            <form onSubmit={handleCollectionSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Collection Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Summer Essentials"
                  value={colName}
                  onChange={(e) => setColName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-semibold outline-none transition focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Banner Image URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={colBanner}
                  onChange={(e) => setColBanner(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-semibold outline-none transition focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Description</label>
                <textarea
                  placeholder="Capsule description..."
                  value={colDescription}
                  rows={2}
                  onChange={(e) => setColDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-semibold outline-none transition resize-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Status</label>
                <select
                  value={colStatus}
                  onChange={(e) => setColStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-semibold outline-none transition focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="active">Active (Published)</option>
                  <option value="pending">Pending Approval (Draft)</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black uppercase tracking-wider transition shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Saving..." : "Add Collection"}
              </button>
            </form>
          </div>

          {/* List display */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col min-h-[450px]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Bookmark size={14} className="text-indigo-500" />
                <span>Catalog Collections</span>
              </h2>
              <span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-950 px-2.5 py-1 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 uppercase tracking-widest select-none">
                {filteredCollections.length} Items Listed
              </span>
            </div>

            {filteredCollections.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40">
                <Bookmark size={28} className="text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-500">No matching collections found.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredCollections.map((col) => (
                  <div key={col._id} className="p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                        <Bookmark size={16} />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-xs text-slate-900 dark:text-white">{col.name}</span>
                          <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-md border ${ col.status === "active" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : col.status === "pending" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" : "bg-slate-500/10 text-slate-500 border-slate-500/20" }`}>
                            {col.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[280px]">
                          {col.description || "No description provided."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {col.status === "pending" && (
                        <button
                          onClick={() => approveCollection(col._id)}
                          title="Approve Collection"
                          className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer flex items-center justify-center shadow-xs"
                        >
                          <Check size={12} className="stroke-[3]" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteCollection(col._id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 transition cursor-pointer"
                        title="Delete Collection"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Brand Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-4 shrink-0 h-fit">
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Plus size={14} className="text-indigo-500" />
              <span>Create Brand Partner</span>
            </h2>
            <form onSubmit={handleBrandSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Brand Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Nike, Apple"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-semibold outline-none transition focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Brand Logo URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={brandLogo}
                  onChange={(e) => setBrandLogo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-semibold outline-none transition focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Brand Banner URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={brandBanner}
                  onChange={(e) => setBrandBanner(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-semibold outline-none transition focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Status</label>
                <select
                  value={brandStatus}
                  onChange={(e) => setBrandStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-semibold outline-none transition focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="active">Active (Published)</option>
                  <option value="pending">Pending Approval (Draft)</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black uppercase tracking-wider transition shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Saving..." : "Add Brand"}
              </button>
            </form>
          </div>

          {/* Brand list */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col min-h-[450px]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Award size={14} className="text-indigo-500" />
                <span>Marketplace Partners & Brands</span>
              </h2>
              <span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-950 px-2.5 py-1 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 uppercase tracking-widest select-none">
                {filteredBrands.length} Brands Listed
              </span>
            </div>

            {filteredBrands.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40">
                <Award size={28} className="text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-500">No matching brands found.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredBrands.map((b) => (
                  <div key={b._id} className="p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center text-indigo-500 font-extrabold text-[9px] shrink-0 uppercase">
                        {b.logo ? (
                          <img src={b.logo} alt="" className="h-full w-full object-contain p-0.5 rounded-lg" />
                        ) : (
                          b.name.substring(0, 2)
                        )}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-xs text-slate-900 dark:text-white">{b.name}</span>
                          <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-md border ${ b.status === "active" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : b.status === "pending" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" : "bg-slate-500/10 text-slate-500 border-slate-500/20" }`}>
                            {b.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[280px]">
                          Slug: {b.slug}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {b.status === "pending" && (
                        <button
                          onClick={() => approveBrand(b._id)}
                          title="Approve Brand"
                          className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer flex items-center justify-center shadow-xs"
                        >
                          <Check size={12} className="stroke-[3]" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteBrand(b._id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 transition cursor-pointer"
                        title="Delete Brand"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionsBrands;
