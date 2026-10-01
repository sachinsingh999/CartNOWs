import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Tag, 
  Layers, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Search, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Sliders, 
  Sparkles, 
  ExternalLink, 
  X, 
  Info, 
  FileText, 
  Check, 
  Boxes,
  HelpCircle,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { backendUrl } from "../config";

const Categories = ({ 
  token, 
  products = [], 
  orders = [], 
  loading = false, 
  fetchProducts 
}) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [fetchingCategories, setFetchingCategories] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // "all" | "listed" | "unlisted"
  const [sortBy, setSortBy] = useState("name-asc"); // "name-asc" | "products-desc" | "subcats-desc"

  // Modal for category requirements / template
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState(null);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templateFields, setTemplateFields] = useState([]);
  const [templateSettings, setTemplateSettings] = useState(null);

  // Fetch Marketplace Categories from server
  const fetchMarketplaceCategories = async () => {
    if (!token) return;
    setFetchingCategories(true);
    try {
      const response = await axios.get(`${backendUrl}/api/seller/categories`, {
        headers: { token }
      });
      if (response.data.success) {
        setCategories(response.data.categories || []);
      }
    } catch (err) {
      console.error("Failed to load categories:", err.message);
    } finally {
      setFetchingCategories(false);
    }
  };

  useEffect(() => {
    fetchMarketplaceCategories();
  }, [token]);

  // Aggregate seller store stats per category
  const storeCategoryStats = useMemo(() => {
    const map = {};
    products.forEach(p => {
      const cat = p.category || "General";
      const price = parseFloat(p.price) || 0;
      const stock = parseInt(p.stock, 10) || 0;
      const val = price * stock;

      if (!map[cat]) {
        map[cat] = { productCount: 0, totalUnits: 0, totalValuation: 0, items: [] };
      }
      map[cat].productCount += 1;
      map[cat].totalUnits += stock;
      map[cat].totalValuation += val;
      map[cat].items.push(p);
    });
    return map;
  }, [products]);

  // Extract unique listed categories in store
  const listedCategoriesCount = Object.keys(storeCategoryStats).length;
  const totalMarketplaceCategories = categories.length;

  // Top category by valuation
  const topCategoryByVal = useMemo(() => {
    let topName = "None";
    let maxVal = 0;
    Object.entries(storeCategoryStats).forEach(([cat, stats]) => {
      if (stats.totalValuation > maxVal) {
        maxVal = stats.totalValuation;
        topName = cat;
      }
    });
    return { name: topName, value: maxVal };
  }, [storeCategoryStats]);

  // Combined Category Items with Store Stats
  const processedCategories = useMemo(() => {
    // If categories list from backend is empty, synthesize from products
    let catList = [...categories];
    if (catList.length === 0 && products.length > 0) {
      const uniqueNames = [...new Set(products.map(p => p.category).filter(Boolean))];
      catList = uniqueNames.map(name => ({ _id: name, name, subcategories: [] }));
    }

    let results = catList.map(cat => {
      const stats = storeCategoryStats[cat.name] || { productCount: 0, totalUnits: 0, totalValuation: 0, items: [] };
      const subcats = Array.isArray(cat.subcategories) ? cat.subcategories : [];
      return {
        ...cat,
        productCount: stats.productCount,
        totalUnits: stats.totalUnits,
        totalValuation: stats.totalValuation,
        subcategoriesList: subcats,
        isListedInStore: stats.productCount > 0
      };
    });

    // 1. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      results = results.filter(c => {
        const name = (c.name || "").toLowerCase();
        const desc = (c.description || "").toLowerCase();
        const subNames = c.subcategoriesList.map(s => (typeof s === "string" ? s : s.name || "")).join(" ").toLowerCase();
        return name.includes(q) || desc.includes(q) || subNames.includes(q);
      });
    }

    // 2. Filter type
    if (filterType === "listed") {
      results = results.filter(c => c.isListedInStore);
    } else if (filterType === "unlisted") {
      results = results.filter(c => !c.isListedInStore);
    }

    // 3. Sorting
    results.sort((a, b) => {
      if (sortBy === "name-asc") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "products-desc") return b.productCount - a.productCount;
      if (sortBy === "subcats-desc") return b.subcategoriesList.length - a.subcategoriesList.length;
      if (sortBy === "val-desc") return b.totalValuation - a.totalValuation;
      return 0;
    });

    return results;
  }, [categories, products, storeCategoryStats, searchQuery, filterType, sortBy]);

  // Open Category Requirements & Template Modal
  const handleOpenTemplateModal = async (cat) => {
    setSelectedTemplateCategory(cat);
    setTemplateLoading(true);
    setTemplateFields([]);
    setTemplateSettings(null);

    try {
      const response = await axios.get(`${backendUrl}/api/seller/category/${cat._id}/template`, {
        headers: { token }
      });
      if (response.data.success) {
        setTemplateFields(response.data.fields || []);
        setTemplateSettings(response.data.settings || null);
      }
    } catch (err) {
      console.log("Could not load category template:", err.message);
    } finally {
      setTemplateLoading(false);
    }
  };

  const catalogCoverage = totalMarketplaceCategories > 0 
    ? Math.round((listedCategoriesCount / totalMarketplaceCategories) * 100) 
    : 100;

  return (
    <div className="space-y-2.5 pb-20 text-slate-800 dark:text-slate-100 animate-fadeIn text-left">
      {/* 1. Header Card & Category Directory Overview */}
      <div className="bg-white dark:bg-[#0F172A] rounded-xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Tag size={11} className="text-amber-500" />
                <span>Marketplace Taxonomy</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                {totalMarketplaceCategories} platform categories
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Marketplace Categories Directory
            </h1>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Browse platform category specifications, review required attributes, and expand your catalog coverage.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={fetchMarketplaceCategories}
              disabled={fetchingCategories}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 border border-slate-200/60 dark:border-slate-700/60 transition cursor-pointer"
            >
              <RefreshCw size={13} className={`${fetchingCategories ? "animate-spin text-amber-500" : "text-slate-500"}`} />
              <span>Sync Taxonomy</span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/add-product")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Plus size={14} className="stroke-[3]" />
              <span>Publish in Category</span>
            </button>
          </div>
        </div>

        {/* 2. Four KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
          {/* Card 1: Total Marketplace Categories */}
          <div className="bg-slate-50/70 dark:bg-slate-900/60 rounded-xl p-2.5 sm:p-3 border border-slate-200/60 dark:border-slate-800/70 flex flex-col justify-between transition hover:border-amber-400/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Marketplace Categories
              </span>
              <div className="h-6 w-6 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Layers size={13} />
              </div>
            </div>
            <div className="my-1">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {totalMarketplaceCategories} <span className="text-xs font-bold text-slate-400">Available</span>
              </h3>
            </div>
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-800/50 pt-1">
              <span>Platform Standard</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">CartNOW Catalog</span>
            </div>
          </div>

          {/* Card 2: Store Listed Categories */}
          <div className="bg-slate-50/70 dark:bg-slate-900/60 rounded-xl p-2.5 sm:p-3 border border-slate-200/60 dark:border-slate-800/70 flex flex-col justify-between transition hover:border-emerald-400/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Your Store Coverage
              </span>
              <div className="h-6 w-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={13} />
              </div>
            </div>
            <div className="my-1">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {listedCategoriesCount} <span className="text-xs font-bold text-emerald-500">({catalogCoverage}%)</span>
              </h3>
            </div>
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-800/50 pt-1">
              <span>{products.length} Items Listed</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Active in Store</span>
            </div>
          </div>

          {/* Card 3: Top Value Category */}
          <div className="bg-slate-50/70 dark:bg-slate-900/60 rounded-xl p-2.5 sm:p-3 border border-slate-200/60 dark:border-slate-800/70 flex flex-col justify-between transition hover:border-blue-400/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Top Capital Category
              </span>
              <div className="h-6 w-6 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <DollarSign size={13} />
              </div>
            </div>
            <div className="my-1">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate" title={topCategoryByVal.name}>
                {topCategoryByVal.name}
              </h3>
            </div>
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-800/50 pt-1">
              <span>Valuation</span>
              <span className="text-amber-500 font-bold">₹{topCategoryByVal.value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
            </div>
          </div>

          {/* Card 4: Unlisted Opportunities */}
          <div className="bg-slate-50/70 dark:bg-slate-900/60 rounded-xl p-2.5 sm:p-3 border border-slate-200/60 dark:border-slate-800/70 flex flex-col justify-between transition hover:border-indigo-400/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Expansion Growth
              </span>
              <div className="h-6 w-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <TrendingUp size={13} />
              </div>
            </div>
            <div className="my-1">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {Math.max(0, totalMarketplaceCategories - listedCategoriesCount)} <span className="text-xs font-bold text-slate-400">Open Categories</span>
              </h3>
            </div>
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-800/50 pt-1">
              <span>New Niche Markets</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">Start Listing</span>
            </div>
          </div>
        </div>

        {/* 3. Search & Filter Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category name, subcategories, keywords..."
              className="w-full pl-9 pr-8 py-2 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 border border-slate-200/70 dark:border-slate-800 focus:border-amber-500/60 outline-none transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Filter Pill Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800/90 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 text-[11px] font-bold">
              {[
                { id: "all", label: "All Categories" },
                { id: "listed", label: `Listed in Store (${listedCategoriesCount})` },
                { id: "unlisted", label: "Unlisted" }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterType(tab.id)}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    filterType === tab.id
                      ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 font-black shadow-2xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="bg-slate-100 dark:bg-slate-800/90 px-2 py-1 rounded-lg border border-slate-200/50 dark:border-slate-700/50 text-[11px] font-bold text-slate-700 dark:text-slate-300">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent outline-none cursor-pointer"
              >
                <option value="name-asc" className="dark:bg-slate-900">Name: A to Z</option>
                <option value="products-desc" className="dark:bg-slate-900">Most Products Listed</option>
                <option value="val-desc" className="dark:bg-slate-900">Highest Store Capital</option>
                <option value="subcats-desc" className="dark:bg-slate-900">Most Subcategories</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Category Showcase Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
        {processedCategories.map((cat) => {
          const isListed = cat.isListedInStore;
          const subcats = cat.subcategoriesList || [];

          return (
            <motion.div
              key={cat._id || cat.name}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
              className={`bg-white dark:bg-[#0F172A] rounded-xl p-3 sm:p-4 border transition-all duration-200 flex flex-col justify-between gap-3 ${
                isListed
                  ? "border-slate-200/90 dark:border-slate-800/90 shadow-xs hover:border-amber-400/60"
                  : "border-dashed border-slate-300 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/30 hover:border-slate-400"
              }`}
            >
              {/* Top Row: Category Identity & Status */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                      {cat.image ? (
                        <img src={cat.image} alt="" className="h-full w-full object-cover rounded-xl" />
                      ) : (
                        <Tag size={18} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white truncate" title={cat.name}>
                        {cat.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium line-clamp-1">
                        {cat.description || "Official marketplace category specification"}
                      </p>
                    </div>
                  </div>

                  {/* Store Status Pill */}
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 ${
                    isListed 
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                      : "bg-slate-200/70 dark:bg-slate-800 text-slate-500"
                  }`}>
                    {isListed ? `${cat.productCount} SKUs Listed` : "Unlisted"}
                  </span>
                </div>

                {/* Subcategories preview tags */}
                {subcats.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Subcategories ({subcats.length}):</span>
                    <div className="flex flex-wrap gap-1">
                      {subcats.slice(0, 4).map((sub, idx) => {
                        const sName = typeof sub === "string" ? sub : sub.name || "Subcategory";
                        return (
                          <span key={idx} className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300">
                            {sName}
                          </span>
                        );
                      })}
                      {subcats.length > 4 && (
                        <span className="text-[10px] font-bold text-slate-400 px-1 py-0.2">
                          +{subcats.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Middle Row: Your Store's Live Footprint */}
              {isListed ? (
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400">Inventory Units</span>
                    <p className="font-black text-slate-900 dark:text-white">
                      {cat.totalUnits.toLocaleString("en-IN")} Units
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Locked Capital</span>
                    <p className="font-black text-amber-500 dark:text-amber-400">
                      ₹{cat.totalValuation.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 text-[11px] font-medium text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-500 shrink-0" />
                  <span>Expansion opportunity. You have no products listed here yet.</span>
                </div>
              )}

              {/* Bottom Actions Row */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-1.5">
                {/* View Requirements & Attributes Template */}
                <button
                  type="button"
                  onClick={() => handleOpenTemplateModal(cat)}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition flex items-center gap-1 cursor-pointer"
                  title="View required dynamic attributes & image standards"
                >
                  <Sliders size={12} />
                  <span>Specs Template</span>
                </button>

                {/* Publish Product in this category */}
                <button
                  type="button"
                  onClick={() => navigate(`/add-product?category=${encodeURIComponent(cat.name)}`)}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-black bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-2xs transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={12} className="stroke-[3]" />
                  <span>List Product</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 5. Category Requirements & Specifications Template Modal */}
      <AnimatePresence>
        {selectedTemplateCategory && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
            <div className="bg-white dark:bg-[#0F172A] w-full max-w-2xl rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-left">
              {/* Modal Header */}
              <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/40 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Sliders size={16} />
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      Listing Specifications Template: {selectedTemplateCategory.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Standardized dynamic attributes, requirements, and media constraints.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTemplateCategory(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-4">
                {/* Media Guidelines */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    <Info size={14} className="text-amber-500" />
                    <span>Media & Image Requirements for {selectedTemplateCategory.name}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-300">Min Images:</span>{" "}
                      {templateSettings?.minImages || 3} Photos
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-300">Max Images:</span>{" "}
                      {templateSettings?.maxImages || 10} Photos
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-300">Formats:</span>{" "}
                      JPG, PNG, WEBP
                    </div>
                  </div>
                </div>

                {/* Dynamic Attributes List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Standard Category Specification Fields
                    </h4>
                    <span className="text-[10px] font-bold text-slate-500">
                      {templateFields.length} Attribute Fields Defined
                    </span>
                  </div>

                  {templateLoading ? (
                    <div className="py-8 text-center text-slate-400 space-y-2">
                      <span className="animate-spin h-5 w-5 border-2 border-amber-500 border-t-transparent rounded-full mx-auto inline-block" />
                      <p className="text-xs font-bold">Loading category specifications...</p>
                    </div>
                  ) : templateFields.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                      <FileText size={20} className="mx-auto text-slate-400 mb-1" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Custom Attributes Required</p>
                      <p className="text-[11px] text-slate-400">This category uses standard marketplace fields (Name, Price, Stock, Description, Highlights).</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/80 border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden text-xs">
                      {templateFields.map((field, idx) => (
                        <div key={field._id || idx} className="p-3 bg-white dark:bg-slate-900/40 flex items-start justify-between gap-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-slate-900 dark:text-white">{field.label || field.name}</span>
                              {field.isRequired ? (
                                <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400">
                                  Required
                                </span>
                              ) : (
                                <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                                  Optional
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400">
                              Input Type: <strong>{field.fieldType || "Text"}</strong>
                              {field.placeholder ? ` • Placeholder: "${field.placeholder}"` : ""}
                            </p>
                          </div>

                          {field.selectOptions && field.selectOptions.length > 0 && (
                            <div className="text-right text-[10px] text-slate-400 max-w-[200px] truncate">
                              Options: {field.selectOptions.join(", ")}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedTemplateCategory(null)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const catName = selectedTemplateCategory.name;
                    setSelectedTemplateCategory(null);
                    navigate(`/add-product?category=${encodeURIComponent(catName)}`);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-black text-slate-950 bg-amber-500 hover:bg-amber-400 transition flex items-center gap-1.5"
                >
                  <Plus size={13} className="stroke-[3]" />
                  <span>List Product in {selectedTemplateCategory.name}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Categories;
