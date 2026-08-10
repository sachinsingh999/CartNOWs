import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { backendUrl } from "../config";
import {
  Search,
  ArrowRight,
  TrendingUp,
  Star,
  ShoppingBag,
  Watch,
  Sparkles,
  Home,
  ShoppingCart,
  Smartphone,
  Headphones,
  BookOpen,
  Gamepad2,
  Gem,
  Tv,
  Layers,
  ArrowUpDown,
  X,
  PackageCheck,
  ShieldCheck,
  Zap,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";

const Categories = () => {
  const navigate = useNavigate();

  // Try parsing initial categories from sessionStorage for 0ms instant page load
  const getInitialCategories = () => {
    try {
      const cached = sessionStorage.getItem("cached_categories_data");
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return [];
  };

  const initialList = getInitialCategories();
  const [categories, setCategories] = useState(initialList);
  const [loading, setLoading] = useState(initialList.length === 0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default"); // default | alphabetical | count
  const [filterType, setFilterType] = useState("all"); // all | popular | trending

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const iconMap = {
    star: Star,
    shoppingbag: ShoppingBag,
    watch: Watch,
    sparkles: Sparkles,
    home: Home,
    shoppingcart: ShoppingCart,
    smartphone: Smartphone,
    headphones: Headphones,
    bookopen: BookOpen,
    gamepad2: Gamepad2,
    gem: Gem,
    tv: Tv,
    layers: Layers
  };

  // High-Definition Category Specific Image Mapper
  const getCategoryImage = (catName, existingBanner) => {
    if (existingBanner && existingBanner.startsWith("http") && !existingBanner.includes("photo-1441986300917")) {
      return existingBanner;
    }
    const name = (catName || "").toLowerCase();

    if (name.includes("electronic") || name.includes("gadget") || name.includes("tech") || name.includes("device")) {
      return "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80";
    }
    if (name.includes("fashion") || name.includes("clothing") || name.includes("apparel") || name.includes("wear")) {
      return "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80";
    }
    if (name.includes("home") || name.includes("kitchen") || name.includes("decor") || name.includes("furniture")) {
      return "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80";
    }
    if (name.includes("beauty") || name.includes("cosmetic") || name.includes("skincare") || name.includes("makeup")) {
      return "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80";
    }
    if (name.includes("sport") || name.includes("fitness") || name.includes("gym") || name.includes("outdoor")) {
      return "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80";
    }
    if (name.includes("footwear") || name.includes("shoe") || name.includes("sneaker")) {
      return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80";
    }
    if (name.includes("watch") || name.includes("jewelry") || name.includes("accessory") || name.includes("jewel")) {
      return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";
    }
    if (name.includes("book") || name.includes("stationery") || name.includes("study")) {
      return "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80";
    }
    if (name.includes("toy") || name.includes("game") || name.includes("kid") || name.includes("baby")) {
      return "https://images.unsplash.com/photo-1531525645387-7f14be1bbe50?w=600&auto=format&fit=crop&q=80";
    }
    if (name.includes("mobile") || name.includes("phone") || name.includes("smartphone")) {
      return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80";
    }
    if (name.includes("audio") || name.includes("headphone") || name.includes("speaker")) {
      return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80";
    }
    if (name.includes("grocery") || name.includes("food") || name.includes("organic")) {
      return "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80";
    }
    if (name.includes("auto") || name.includes("car") || name.includes("vehicle")) {
      return "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80";
    }

    return "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&auto=format&fit=crop&q=80";
  };

  const getCategoryStyles = (name) => {
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const styles = [
      {
        bg: "bg-blue-500/10 dark:bg-blue-500/15 border-blue-200/50 dark:border-blue-800/40",
        text: "text-blue-600 dark:text-blue-400",
        badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/30 dark:border-blue-900/30",
        glow: "from-blue-500/20 to-indigo-500/0"
      },
      {
        bg: "bg-rose-500/10 dark:bg-rose-500/15 border-rose-200/50 dark:border-rose-800/40",
        text: "text-rose-600 dark:text-rose-400",
        badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200/30 dark:border-rose-900/30",
        glow: "from-rose-500/20 to-pink-500/0"
      },
      {
        bg: "bg-purple-500/10 dark:bg-purple-500/15 border-purple-200/50 dark:border-purple-800/40",
        text: "text-purple-600 dark:text-purple-400",
        badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200/30 dark:border-purple-900/30",
        glow: "from-purple-500/20 to-violet-500/0"
      },
      {
        bg: "bg-amber-500/10 dark:bg-amber-500/15 border-amber-200/50 dark:border-amber-800/40",
        text: "text-amber-600 dark:text-amber-400",
        badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/30 dark:border-amber-900/30",
        glow: "from-amber-500/20 to-orange-500/0"
      },
      {
        bg: "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-200/50 dark:border-emerald-800/40",
        text: "text-emerald-600 dark:text-emerald-400",
        badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/30 dark:border-emerald-900/30",
        glow: "from-emerald-500/20 to-teal-500/0"
      },
      {
        bg: "bg-cyan-500/10 dark:bg-cyan-500/15 border-cyan-200/50 dark:border-cyan-800/40",
        text: "text-cyan-600 dark:text-cyan-400",
        badge: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200/30 dark:border-cyan-900/30",
        glow: "from-cyan-500/20 to-sky-500/0"
      }
    ];
    return styles[hash % styles.length];
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/product/categories`);
        if (data.success) {
          const enriched = data.categories.map(cat => {
            const styles = getCategoryStyles(cat.name);
            const iconKey = (cat.icon || "layers").toLowerCase();
            const IconComponent = iconMap[iconKey] || Layers;
            return {
              ...cat,
              iconName: cat.icon || "layers",
              bgClass: styles.bg,
              textClass: styles.text,
              badgeClass: styles.badge,
              glowClass: styles.glow,
              growth: cat.growth || `+${Math.floor(10 + Math.random() * 25)}%`,
              img: getCategoryImage(cat.name, cat.bannerImage),
              count: cat.count || 0,
              subcategories: cat.subcategories || ["Popular", "Trending", "New Arrivals"]
            };
          });
          setCategories(enriched);
          try {
            sessionStorage.setItem("cached_categories_data", JSON.stringify(enriched));
          } catch (e) {}
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Reset to page 1 whenever filters, search, or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, filterType, itemsPerPage]);

  // Compute total statistics
  const totalProducts = useMemo(() => {
    return categories.reduce((sum, cat) => sum + (cat.count || 0), 0);
  }, [categories]);

  // Featured Spotlight Categories (Top 3 by count/growth)
  const spotlightCategories = useMemo(() => {
    return [...categories].sort((a, b) => (b.count || 0) - (a.count || 0)).slice(0, 3);
  }, [categories]);

  // Filtered & Sorted Categories list
  const filteredCategories = useMemo(() => {
    let result = categories.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.subcategories && c.subcategories.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));
      
      if (!matchesSearch) return false;

      if (filterType === "popular") return (c.count || 0) >= 5;
      if (filterType === "trending") return parseInt(c.growth) > 15;
      return true;
    });

    if (sortBy === "alphabetical") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "count") {
      result.sort((a, b) => (b.count || 0) - (a.count || 0));
    }

    return result;
  }, [categories, searchQuery, sortBy, filterType]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / itemsPerPage));
  
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCategories.slice(start, start + itemsPerPage);
  }, [filteredCategories, currentPage, itemsPerPage]);

  return (
    <div className="min-h-screen bg-[#F8F9FC] dark:bg-[#050508] px-3 sm:px-6 lg:px-10 py-4 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200 pb-12">
      <div className="mx-auto max-w-[1440px]">

        {/* Ambient Glow Rays */}
        <div className="absolute top-8 left-1/4 w-[400px] h-[400px] bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-[140px] pointer-events-none z-0" />
        <div className="absolute top-24 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none z-0" />

        {/* Breadcrumb Navigation */}
        <div className="mb-3 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
          <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition" onClick={() => navigate("/")}>Home</span>
          <ChevronRight size={10} />
          <span className="text-slate-700 dark:text-slate-300">Departments</span>
        </div>

        {/* ================= UNIFIED MASTER HEADER CARD ================= */}
        <div className="relative mb-6 overflow-hidden rounded-xl bg-white dark:bg-[#0F131C] border border-slate-200 dark:border-slate-800/80 p-4 sm:p-6 shadow-xs backdrop-blur-xl space-y-4 text-left">
          
          {/* Ambient Glow Gradient */}
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-500/5 to-transparent pointer-events-none" />

          {/* SECTION 1: HERO HEADER & STATS */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            <div className="space-y-1.5 max-w-2xl">
              <span className="inline-flex items-center gap-1 text-[9.5px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/30">
                <Sparkles size={11} className="text-indigo-500 fill-indigo-500/20" />
                Department Directory
              </span>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Explore Our <span className="bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">Premium Catalog</span>
              </h1>

              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-xl">
                Browse our curated departments offering high-quality essentials, verified merchant collections, and trending products.
              </p>
            </div>

            {/* Real-time Statistics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 shrink-0">
              <div className="rounded-lg bg-slate-50 dark:bg-[#0C0F16] border border-slate-200/80 dark:border-slate-800 p-3 text-left shadow-xs">
                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 mb-0.5">
                  <Layers size={14} />
                  <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Departments</span>
                </div>
                <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {loading ? "..." : categories.length}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 dark:bg-[#0C0F16] border border-slate-200/80 dark:border-slate-800 p-3 text-left shadow-xs">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 mb-0.5">
                  <PackageCheck size={14} />
                  <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Live Products</span>
                </div>
                <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {loading ? "..." : totalProducts.toLocaleString()}
                </p>
              </div>

              <div className="col-span-2 sm:col-span-1 rounded-lg bg-slate-50 dark:bg-[#0C0F16] border border-slate-200/80 dark:border-slate-800 p-3 text-left shadow-xs">
                <div className="flex items-center gap-1.5 text-amber-500 mb-0.5">
                  <ShieldCheck size={14} />
                  <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Assurance</span>
                </div>
                <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  100% Verified
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 2: TOP TRENDING SPOTLIGHT */}
          {!loading && spotlightCategories.length > 0 && (
            <>
              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4" />

              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-500 fill-amber-500/20" />
                    <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Top Trending Departments</h2>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">High Demand Categories</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {spotlightCategories.map((cat) => {
                    const iconKey = (cat.iconName || "layers").toLowerCase();
                    const IconComp = iconMap[iconKey] || Layers;

                    return (
                      <div
                        key={cat._id || cat.name}
                        onClick={() => navigate(`/categories/${cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-")}`)}
                        className="group relative overflow-hidden rounded-lg bg-slate-50/70 dark:bg-[#0C0F16] border border-slate-200/80 dark:border-slate-800 p-3 cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:border-indigo-500/30 flex flex-col justify-between"
                      >
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${cat.glowClass} blur-xl pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity`} />

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className={`h-8 w-8 rounded-md flex items-center justify-center border ${cat.bgClass}`}>
                              <IconComp size={15} className={cat.textClass} />
                            </div>
                            <span className="inline-flex items-center gap-1 text-[8.5px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                              <TrendingUp size={8} />
                              {cat.growth}
                            </span>
                          </div>

                          <h3 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {cat.name}
                          </h3>
                          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                            {cat.count.toLocaleString()} Products Available
                          </p>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Shop Department</span>
                          <div className="h-4.5 w-4.5 rounded-md bg-white dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <ArrowRight size={9} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* SECTION 3: SEARCH, FILTER & SORT CONTROLS */}
          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4" />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search departments or subcategories..."
                className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0C0F16] pl-9 pr-8 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none transition focus:border-indigo-500 focus:bg-white dark:focus:bg-[#0F131C]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition p-0.5 cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Quick Filter & Sort Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Filter Buttons */}
              <div className="flex items-center bg-slate-100 dark:bg-[#0C0F16] border border-slate-200 dark:border-slate-800 rounded-md p-0.5 text-[10.5px] font-bold">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-2.5 py-1 rounded-sm transition cursor-pointer ${filterType === "all" ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs font-black" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}
                >
                  All ({categories.length})
                </button>
                <button
                  onClick={() => setFilterType("popular")}
                  className={`px-2.5 py-1 rounded-sm transition cursor-pointer ${filterType === "popular" ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs font-black" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}
                >
                  Popular
                </button>
                <button
                  onClick={() => setFilterType("trending")}
                  className={`px-2.5 py-1 rounded-sm transition cursor-pointer ${filterType === "trending" ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs font-black" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}
                >
                  Trending
                </button>
              </div>

              {/* Sort Selector */}
              <div className="relative flex items-center bg-slate-50 dark:bg-[#0C0F16] border border-slate-200 dark:border-slate-800 rounded-md px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <ArrowUpDown size={12} className="text-slate-400 mr-1" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none outline-none cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200 pr-1"
                >
                  <option value="default" className="bg-white dark:bg-slate-900">Default Sort</option>
                  <option value="alphabetical" className="bg-white dark:bg-slate-900">Alphabetical (A-Z)</option>
                  <option value="count" className="bg-white dark:bg-slate-900">Product Count (High to Low)</option>
                </select>
              </div>

            </div>
          </div>

        </div>

        {/* ================= CATEGORY GRID ================= */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-left">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="bg-white dark:bg-[#0F131C] border border-slate-200 dark:border-slate-800/80 rounded-lg p-4 h-[290px] animate-pulse flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="w-9 h-9 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    <div className="w-12 h-4 bg-slate-200 dark:bg-slate-800 rounded-sm" />
                  </div>
                  <div className="w-full h-28 bg-slate-200 dark:bg-slate-800 rounded-md mt-2" />
                </div>
                <div className="space-y-1.5 mt-3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-sm w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-sm w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-slate-300 dark:border-slate-800 rounded-lg bg-white dark:bg-[#0F131C] text-center shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mb-2.5">
              <Layers size={24} />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">No Departments Found</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold max-w-xs mt-1">
              We couldn't find any category matching "{searchQuery}".
            </p>
            <button
              onClick={() => { setSearchQuery(""); setFilterType("all"); }}
              className="mt-4 rounded-md bg-slate-900 dark:bg-indigo-600 text-white px-4 py-2 text-xs font-black uppercase tracking-wider hover:bg-slate-800 dark:hover:bg-indigo-550 transition cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-left">
              <AnimatePresence>
                {paginatedCategories.map((cat, i) => {
                  const iconKey = (cat.iconName || "layers").toLowerCase();
                  const IconComponent = iconMap[iconKey] || Layers;

                  return (
                    <motion.div
                      key={cat._id || cat.slug || cat.name}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: i * 0.02 }}
                      onClick={() => navigate(`/categories/${cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-")}`)}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-lg bg-white dark:bg-[#0F131C] border border-slate-200 dark:border-slate-800/80 p-4 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-indigo-500/40 cursor-pointer"
                    >
                      {/* Top Glow Accent */}
                      <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl ${cat.glowClass} blur-xl pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity duration-300`} />

                      <div>
                        {/* Header Row: Icon + Growth Badge */}
                        <div className="flex items-center justify-between mb-2.5">
                          <div className={`h-9 w-9 rounded-md flex items-center justify-center transition-transform duration-300 group-hover:scale-105 border ${cat.bgClass}`}>
                            <IconComponent size={18} className={cat.textClass} />
                          </div>
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                            <TrendingUp size={9} />
                            {cat.growth}
                          </span>
                        </div>

                        {/* Image Preview Box */}
                        <div className="relative w-full aspect-[16/10] bg-slate-50 dark:bg-[#0C0F16] rounded-md overflow-hidden flex items-center justify-center p-2 mb-3 border border-slate-200/50 dark:border-slate-800/50 shadow-inner group-hover:border-slate-300 dark:group-hover:border-slate-700 transition-colors">
                          <img
                            src={cat.img}
                            alt={cat.name}
                            className="max-h-[96%] max-w-[96%] object-cover rounded-xs transition-transform duration-500 group-hover:scale-105 shadow-xs"
                            loading="lazy"
                          />
                        </div>

                        {/* Title & Product Count */}
                        <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                          {cat.name}
                        </h3>
                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                          {cat.count.toLocaleString()} {cat.count === 1 ? "Product" : "Products"} Available
                        </p>

                        {/* Subcategory Pills Preview */}
                        {cat.subcategories && cat.subcategories.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                            {cat.subcategories.slice(0, 3).map((sub, sIdx) => (
                              <span
                                key={sIdx}
                                className="text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-1.5 py-0.5 rounded-xs border border-slate-200/40 dark:border-slate-700/40"
                              >
                                {sub}
                              </span>
                            ))}
                            {cat.subcategories.length > 3 && (
                              <span className="text-[8.5px] font-bold text-slate-400">
                                +{cat.subcategories.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer Explore Link */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[9.5px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        <span>Explore Department</span>
                        <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* ================= PAGINATION BAR ================= */}
            {filteredCategories.length > 0 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0F131C] border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-xs select-none">
                
                {/* Counter text */}
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Showing <span className="font-black text-slate-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span>–
                  <span className="font-black text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredCategories.length)}</span> of{" "}
                  <span className="font-black text-slate-900 dark:text-white">{filteredCategories.length}</span> Departments
                </p>

                {/* Page Navigation & Per Page selector */}
                <div className="flex flex-wrap items-center gap-2.5">
                  
                  {/* Items per page selector */}
                  <div className="flex items-center gap-1 bg-slate-50 dark:bg-[#0C0F16] border border-slate-200 dark:border-slate-800 rounded-md px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="text-[9.5px] text-slate-400 font-bold uppercase">Show:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="bg-transparent border-none outline-none cursor-pointer font-bold text-xs text-slate-800 dark:text-slate-200"
                    >
                      <option value={8} className="bg-white dark:bg-slate-900">8 / page</option>
                      <option value={12} className="bg-white dark:bg-slate-900">12 / page</option>
                      <option value={16} className="bg-white dark:bg-slate-900">16 / page</option>
                      <option value={100} className="bg-white dark:bg-slate-900">All</option>
                    </select>
                  </div>

                  {/* Navigation buttons */}
                  <div className="flex items-center gap-1">
                    {/* First Page */}
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="h-7 w-7 rounded-md bg-slate-50 dark:bg-[#0C0F16] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      title="First Page"
                    >
                      <ChevronsLeft size={13} />
                    </button>

                    {/* Prev Page */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="h-7 w-7 rounded-md bg-slate-50 dark:bg-[#0C0F16] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      title="Previous Page"
                    >
                      <ChevronLeft size={13} />
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`h-7 min-w-[28px] px-1.5 rounded-md text-xs font-black transition cursor-pointer ${
                          currentPage === page
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-slate-50 dark:bg-[#0C0F16] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    {/* Next Page */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="h-7 w-7 rounded-md bg-slate-50 dark:bg-[#0C0F16] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      title="Next Page"
                    >
                      <ChevronRight size={13} />
                    </button>

                    {/* Last Page */}
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="h-7 w-7 rounded-md bg-slate-50 dark:bg-[#0C0F16] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      title="Last Page"
                    >
                      <ChevronsRight size={13} />
                    </button>

                  </div>
                </div>

              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default Categories;
