import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import { 
  Award, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles, 
  Image, 
  FileText,
  Bookmark,
  ShieldCheck,
  AlertTriangle,
  X
} from "lucide-react";

const CollectionsBrands = ({ token }) => {
  const [activeTab, setActiveTab] = useState("collections"); // "collections" | "brands"
  const [collections, setCollections] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (token) {
      fetchCollections();
      fetchBrands();
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

  return (
    <div className="space-y-6 text-left">
      {/* Header section */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-600 text-slate-100 dark:text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Award size={20} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Collections & Brands</h1>
            <p className="text-xs text-slate-400">Approve AI suggested curated collections and brands, or create new partners manually.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-white/[0.08] gap-4">
        <button
          onClick={() => setActiveTab("collections")}
          className={`pb-3 text-sm font-extrabold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${ activeTab === "collections" ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400" : "border-transparent text-slate-400 hover:text-slate-600" }`}
        >
          Curated Collections ({collections.length})
        </button>
        <button
          onClick={() => setActiveTab("brands")}
          className={`pb-3 text-sm font-extrabold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${ activeTab === "brands" ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400" : "border-transparent text-slate-400 hover:text-slate-600" }`}
        >
          Marketplace Brands ({brands.length})
        </button>
      </div>

      {activeTab === "collections" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-1.5">
              <Plus size={14} className="text-indigo-500" />
              <span>Create Collection Suggestion</span>
            </h2>
            <form onSubmit={handleCollectionSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Collection Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Work From Home"
                  value={colName}
                  onChange={(e) => setColName(e.target.value)}
                  className="w-full px-4.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] dark:bg-slate-900 text-slate-800 dark:text-white text-xs outline-none transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Banner Image URL</label>
                <input
                  type="text"
                  placeholder="URL link"
                  value={colBanner}
                  onChange={(e) => setColBanner(e.target.value)}
                  className="w-full px-4.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] dark:bg-slate-900 text-slate-800 dark:text-white text-xs outline-none transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</label>
                <textarea
                  placeholder="What is this collection capsule about?"
                  value={colDescription}
                  rows={3}
                  onChange={(e) => setColDescription(e.target.value)}
                  className="w-full px-4.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] dark:bg-slate-900 text-slate-800 dark:text-white text-xs outline-none transition resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Initial Status</label>
                <select
                  value={colStatus}
                  onChange={(e) => setColStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] dark:bg-slate-900 text-slate-800 dark:text-white text-xs outline-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                >
                  <option value="active">Active (Published)</option>
                  <option value="pending">Pending Approval (Draft/Suggestion)</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-slate-100 dark:text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md cursor-pointer"
              >
                {loading ? "Saving..." : "Add Collection"}
              </button>
            </form>
          </div>

          {/* List display */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-800 dark:text-white tracking-tight pb-2 border-b border-slate-100 dark:border-white/[0.06]">
              Catalog Collections
            </h2>

            <div className="divide-y divide-slate-100 dark:divide-white/[0.04] overflow-y-auto max-h-[600px] pr-1">
              {collections.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic py-6 text-center">No collections found.</p>
              ) : (
                collections.map((col) => (
                  <div key={col._id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                        <Bookmark size={16} />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-slate-800 dark:text-white">{col.name}</span>
                          <span className={`px-1.5 py-0.2 text-[8px] font-black uppercase tracking-wider rounded border ${ col.status === "active" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : col.status === "pending" ? "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse" : "bg-slate-500/10 text-slate-500 border-slate-500/20" }`}>
                            {col.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[280px]">
                          {col.description || "No description provided."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {col.status === "pending" && (
                        <button
                          onClick={() => approveCollection(col._id)}
                          title="Approve Collection"
                          className="p-1.5 rounded bg-emerald-500 hover:bg-emerald-600 text-slate-100 dark:text-white transition cursor-pointer flex items-center justify-center"
                        >
                          <Check size={12} className="stroke-[3]" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteCollection(col._id)}
                        className="p-1.5 rounded hover:bg-red-50 text-red-500 transition cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Brand Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-1.5">
              <Plus size={14} className="text-indigo-500" />
              <span>Create Brand Suggestion</span>
            </h2>
            <form onSubmit={handleBrandSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Brand Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Nike, Apple"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-4.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] dark:bg-slate-900 text-slate-800 dark:text-white text-xs outline-none transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Brand Logo URL</label>
                <input
                  type="text"
                  placeholder="Logo URL"
                  value={brandLogo}
                  onChange={(e) => setBrandLogo(e.target.value)}
                  className="w-full px-4.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] dark:bg-slate-900 text-slate-800 dark:text-white text-xs outline-none transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Brand Banner URL</label>
                <input
                  type="text"
                  placeholder="Banner image link"
                  value={brandBanner}
                  onChange={(e) => setBrandBanner(e.target.value)}
                  className="w-full px-4.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] dark:bg-slate-900 text-slate-800 dark:text-white text-xs outline-none transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Initial Status</label>
                <select
                  value={brandStatus}
                  onChange={(e) => setBrandStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] dark:bg-slate-900 text-slate-800 dark:text-white text-xs outline-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                >
                  <option value="active">Active (Published)</option>
                  <option value="pending">Pending Approval (Draft/Suggestion)</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-slate-100 dark:text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md cursor-pointer"
              >
                {loading ? "Saving..." : "Add Brand"}
              </button>
            </form>
          </div>

          {/* Brand list */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-800 dark:text-white tracking-tight pb-2 border-b border-slate-100 dark:border-white/[0.06]">
              Marketplace Partners & Brands
            </h2>

            <div className="divide-y divide-slate-100 dark:divide-white/[0.04] overflow-y-auto max-h-[600px] pr-1">
              {brands.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic py-6 text-center">No brands registered.</p>
              ) : (
                brands.map((b) => (
                  <div key={b._id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center text-indigo-500 font-extrabold text-[9px] shrink-0 uppercase">
                        {b.logo ? (
                          <img src={b.logo} alt="" className="h-full w-full object-contain p-0.5 rounded-lg" />
                        ) : (
                          b.name.substring(0, 2)
                        )}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-slate-800 dark:text-white">{b.name}</span>
                          <span className={`px-1.5 py-0.2 text-[8px] font-black uppercase tracking-wider rounded border ${ b.status === "active" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : b.status === "pending" ? "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse" : "bg-slate-500/10 text-slate-500 border-slate-500/20" }`}>
                            {b.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[280px]">
                          Slug: {b.slug}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {b.status === "pending" && (
                        <button
                          onClick={() => approveBrand(b._id)}
                          title="Approve Brand"
                          className="p-1.5 rounded bg-emerald-500 hover:bg-emerald-600 text-slate-100 dark:text-white transition cursor-pointer flex items-center justify-center"
                        >
                          <Check size={12} className="stroke-[3]" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteBrand(b._id)}
                        className="p-1.5 rounded hover:bg-red-50 text-red-500 transition cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionsBrands;
