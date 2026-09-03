import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { backendUrl } from "../config";
import { cachedGet } from "../utils/apiCache";
import { CollectionsSkeleton } from "../components/SkeletonLoader";
import {
  Sparkles,
  ArrowRight,
  Flame,
  Shirt,
  Home,
  Laptop,
  GraduationCap,
  Gem,
  ShoppingBag,
  Award,
  Search,
  CheckCircle,
  Filter,
  Star,
  Zap,
  Tag,
  Package,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  X
} from "lucide-react";
import electronicsImg from "../assets/electronics_collection_composite.webp";
import fashionImg from "../assets/fashion_collection_composite.webp";
import homeImg from "../assets/home_collection_composite.webp";

const Collections = () => {
  const navigate = useNavigate();
  const [rawCollections, setRawCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const imageFallbackMap = {
    electronics: electronicsImg,
    fashion: fashionImg,
    home: homeImg
  };

  const getCollectionStyles = (name = "") => {
    const lower = name.toLowerCase();
    if (lower.includes("tech") || lower.includes("electro")) {
      return {
        colorClass: "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-indigo-100 dark:border-indigo-900/40 hover:border-indigo-300 dark:hover:border-indigo-700",
        badgeColor: "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40",
        btnGradient: "from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800",
        badgeIcon: Laptop,
        categoryTag: "Tech & Electronics"
      };
    }
    if (lower.includes("fashion") || lower.includes("wear") || lower.includes("lifestyle")) {
      return {
        colorClass: "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-rose-100 dark:border-rose-900/40 hover:border-rose-300 dark:hover:border-rose-700",
        badgeColor: "bg-rose-50 dark:bg-rose-950/70 text-[#ff3f6c] dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40",
        btnGradient: "from-[#ff3f6c] to-rose-600 hover:from-rose-600 hover:to-rose-700",
        badgeIcon: Shirt,
        categoryTag: "Fashion & Lifestyle"
      };
    }
    if (lower.includes("home") || lower.includes("living") || lower.includes("decor")) {
      return {
        colorClass: "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-amber-100 dark:border-amber-900/40 hover:border-amber-300 dark:hover:border-amber-700",
        badgeColor: "bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40",
        btnGradient: "from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
        badgeIcon: Home,
        categoryTag: "Home & Living"
      };
    }
    if (lower.includes("beauty") || lower.includes("glow") || lower.includes("skin")) {
      return {
        colorClass: "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-teal-100 dark:border-teal-900/40 hover:border-teal-300 dark:hover:border-teal-700",
        badgeColor: "bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/40",
        btnGradient: "from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700",
        badgeIcon: Sparkles,
        categoryTag: "Skincare & Beauty"
      };
    }
    if (lower.includes("sport") || lower.includes("sneaker") || lower.includes("active")) {
      return {
        colorClass: "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-cyan-100 dark:border-cyan-900/40 hover:border-cyan-300 dark:hover:border-cyan-700",
        badgeColor: "bg-cyan-50 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/40",
        btnGradient: "from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800",
        badgeIcon: Zap,
        categoryTag: "Sports & Footwear"
      };
    }
    if (lower.includes("new") || lower.includes("arrival")) {
      return {
        colorClass: "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-emerald-100 dark:border-emerald-900/40 hover:border-emerald-300 dark:hover:border-emerald-700",
        badgeColor: "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40",
        btnGradient: "from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700",
        badgeIcon: Sparkles,
        categoryTag: "Fresh Drops (7 Days)"
      };
    }
    return {
      colorClass: "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-purple-100 dark:border-purple-900/40 hover:border-purple-300 dark:hover:border-purple-700",
      badgeColor: "bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40",
      btnGradient: "from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700",
      badgeIcon: Award,
      categoryTag: "Curated Special"
    };
  };

  const getCollectionImage = (col) => {
    if (col.banner && col.banner.trim() !== "" && !col.banner.includes("photo-1511556532299")) {
      return col.banner;
    }

    const slug = (col.slug || col.name || "").toLowerCase();

    if (slug.includes("gaming") || slug.includes("gamer")) {
      return "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80";
    }
    if (slug.includes("festiv") || slug.includes("offer") || slug.includes("deal") || slug.includes("sale")) {
      return "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80";
    }
    if (slug.includes("best") || slug.includes("trend") || slug.includes("top")) {
      return "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80";
    }
    if (slug.includes("electro") || slug.includes("tech") || slug.includes("gadget")) {
      return electronicsImg;
    }
    if (slug.includes("fashion") || slug.includes("wear") || slug.includes("cloth") || slug.includes("style")) {
      return fashionImg;
    }
    if (slug.includes("home") || slug.includes("decor") || slug.includes("living") || slug.includes("furniture")) {
      return homeImg;
    }
    if (slug.includes("beauty") || slug.includes("skin") || slug.includes("glow") || slug.includes("cosmetic")) {
      return "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80";
    }
    if (slug.includes("sport") || slug.includes("sneaker") || slug.includes("shoe") || slug.includes("active")) {
      return "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80";
    }
    if (slug.includes("accessory") || slug.includes("watch") || slug.includes("luxur")) {
      return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";
    }

    if (col.sampleProducts && col.sampleProducts.length > 0) {
      const firstProdImg = col.sampleProducts[0]?.images?.[0] || col.sampleProducts[0]?.image;
      if (firstProdImg) return firstProdImg;
    }

    return "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&auto=format&fit=crop&q=80";
  };

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const { data } = await cachedGet(`${backendUrl}/api/product/collections`);
        if (data.success && Array.isArray(data.collections)) {
          setRawCollections(data.collections);
        }
      } catch (err) {
        console.error("Failed to load collections:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  // Format enriched collections
  const collections = useMemo(() => {
    return rawCollections.map(col => {
      const styles = getCollectionStyles(col.name);
      return {
        ...col,
        title: col.name,
        slug: col.slug || col.name.toLowerCase().replace(/\s+/g, "-"),
        subtitle: col.description || "Curated capsule of high quality verified products.",
        countNum: col.count || 0,
        badge: col.name,
        badgeIcon: styles.badgeIcon,
        categoryTag: styles.categoryTag,
        colorClass: styles.colorClass,
        badgeColor: styles.badgeColor,
        btnGradient: styles.btnGradient,
        image: getCollectionImage(col),
        sampleProducts: col.sampleProducts || [],
        trending: (col.count || 0) >= 0
      };
    });
  }, [rawCollections]);

  // Filter collections based on search query and category filter pill
  const filteredCollections = useMemo(() => {
    return collections.filter(col => {
      const matchesSearch = 
        col.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        col.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (col.categoryTag && col.categoryTag.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedFilter === "all") return true;
      if (selectedFilter === "electronics" && col.categoryTag.includes("Tech")) return true;
      if (selectedFilter === "fashion" && col.categoryTag.includes("Fashion")) return true;
      if (selectedFilter === "home" && col.categoryTag.includes("Home")) return true;
      if (selectedFilter === "beauty" && col.categoryTag.includes("Beauty")) return true;
      if (selectedFilter === "sports" && col.categoryTag.includes("Sports")) return true;

      return true;
    });
  }, [collections, searchQuery, selectedFilter]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedFilter]);

  const totalPages = Math.ceil(filteredCollections.length / itemsPerPage);

  const paginatedCollections = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCollections.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCollections, currentPage, itemsPerPage]);

  const totalProductCount = useMemo(() => {
    return collections.reduce((sum, col) => sum + (col.countNum || 0), 0);
  }, [collections]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-[#0F172A] dark:text-slate-100 px-4 sm:px-8 lg:px-16 py-10 transition-colors duration-200 text-left">
      
      {/* Dynamic Ambient Background Blur Blobs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-purple-500/[0.03] dark:bg-purple-500/[0.08] rounded-none blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-96 right-1/4 w-96 h-96 bg-rose-500/[0.03] dark:bg-rose-500/[0.06] rounded-none blur-[140px] pointer-events-none z-0" />

      {/* Main Content Wrapper */}
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">

        {/* UNIFIED HERO HEADER CARD (TITLE, BADGES, STATS, SEARCH & FILTERS IN A SINGLE CONTAINER) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 rounded-xs shadow-sm space-y-6">
          {/* Top Section: Title & Subtitle + Stats */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-3 max-w-2xl">
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40 rounded-xs">
                  <Award size={12} className="stroke-[2.5]" />
                  <span>OFFICIAL CURATED CAPSULES</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xs">
                  <Zap size={11} className="text-amber-500 fill-amber-500" />
                  <span>Updated Daily</span>
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-slate-900 dark:text-white uppercase">
                Shop By <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-600 bg-clip-text text-transparent">Collections</span>
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                Explore handpicked product capsules engineered for style, innovation, and performance. Find verified items tailored to your lifestyle.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3 shrink-0">
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 px-4 py-3 rounded-xs text-center sm:text-left">
                <div className="text-[9.5px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Capsules</div>
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">{collections.length} Live</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 px-4 py-3 rounded-xs text-center sm:text-left">
                <div className="text-[9.5px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Products</div>
                <div className="text-base sm:text-lg font-black text-purple-600 dark:text-purple-400 mt-0.5">{totalProductCount > 0 ? `${totalProductCount}+` : "120+"}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 px-4 py-3 rounded-xs text-center sm:text-left">
                <div className="text-[9.5px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Shipping</div>
                <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">Express</div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Search & Category Filter Pills */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 stroke-[2.5]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search collections by name or category..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xs text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500 transition duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {[
                { id: "all", label: "All Collections" },
                { id: "electronics", label: "Electronics" },
                { id: "fashion", label: "Fashion" },
                { id: "home", label: "Home" },
                { id: "beauty", label: "Beauty" },
                { id: "sports", label: "Sports" }
              ].map(pill => (
                <button
                  key={pill.id}
                  onClick={() => setSelectedFilter(pill.id)}
                  className={`px-3.5 py-2 text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 border cursor-pointer rounded-xs ${
                    selectedFilter === pill.id
                      ? "bg-[#ff3f6c] text-white border-[#ff3f6c] shadow-xs"
                      : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* COLLECTIONS GRID SECTION WITH CRISP SHARP CORNER CARDS */}
        {loading ? (
          <CollectionsSkeleton />
        ) : filteredCollections.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-xs bg-white dark:bg-slate-900 text-center space-y-3"
          >
            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 rounded-xs">
              <ShoppingBag size={28} />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide">No Matching Collections Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold max-w-sm">
              We couldn't find any collection matching "<span className="text-slate-800 dark:text-white font-bold">{searchQuery}</span>". Try clearing your search or filters.
            </p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedFilter("all"); }}
              className="px-5 py-2.5 bg-[#ff3f6c] hover:bg-[#e0355c] text-white text-xs font-black uppercase tracking-widest rounded-xs transition duration-200 border-none cursor-pointer mt-2"
            >
              Reset Filters
            </button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedCollections.map((col, i) => (
                <motion.div
                  key={col.slug || i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  whileHover={{ y: -3 }}
                  className={`group border p-5 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-xl rounded-xs relative overflow-hidden ${col.colorClass}`}
                >
                  <div>
                    {/* Top Row: Category Tag Badge & Trending Indicator */}
                    <div className="flex justify-between items-center mb-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[9.5px] font-black uppercase tracking-wider rounded-none ${col.badgeColor}`}>
                        {React.createElement(col.badgeIcon, { size: 12 })}
                        <span>{col.categoryTag || col.badge}</span>
                      </span>

                      {col.trending && (
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 border border-red-500/20 px-2.5 py-0.5 rounded-none">
                          <Flame size={11} className="fill-current animate-pulse" />
                          <span>Trending</span>
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div className="mb-4 text-left">
                      <h2 
                        onClick={() => navigate(`/collections/${col.slug}`)}
                        className="text-xl font-black text-slate-900 dark:text-white cursor-pointer hover:text-[#ff3f6c] dark:hover:text-[#ff3f6c] transition-colors tracking-tight uppercase"
                      >
                        {col.title}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed mt-1.5 line-clamp-2">
                        {col.subtitle}
                      </p>
                    </div>

                    {/* Main Composite Image Banner (Sharp Corners) */}
                    <div 
                      onClick={() => navigate(`/collections/${col.slug}`)}
                      className="relative rounded-none overflow-hidden aspect-[16/10] bg-slate-50 dark:bg-[#0B0F19] p-3 mb-4 flex items-center justify-center border border-slate-200/80 dark:border-slate-800 cursor-pointer group/img"
                    >
                      <img
                        src={col.image}
                        alt={col.title}
                        loading="lazy"
                        className="max-h-[95%] max-w-[95%] object-contain rounded-none transition-transform duration-500 group-hover/img:scale-105"
                      />

                      {/* Gradient Overlay Sheen */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>

                    {/* SAMPLE PRODUCTS MINI THUMBNAIL GALLERY (Sharp Corners) */}
                    {col.sampleProducts && col.sampleProducts.length > 0 && (
                      <div className="mb-4 bg-slate-50/80 dark:bg-[#0B0F19] p-2.5 border border-slate-200/80 dark:border-slate-800 rounded-none">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-1.5 text-left">
                          Featured Sample Items:
                        </span>
                        <div className="grid grid-cols-4 gap-2">
                          {col.sampleProducts.slice(0, 4).map((p, pIdx) => (
                            <div
                              key={p._id || pIdx}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/product/${p._id}`);
                              }}
                              title={p.name}
                              className="aspect-square bg-white dark:bg-slate-900 p-1 border border-slate-200/80 dark:border-slate-800 hover:border-[#ff3f6c] cursor-pointer flex flex-col items-center justify-center transition duration-200 rounded-none relative group/thumb shadow-2xs"
                            >
                              <img
                                src={p.images?.[0] || p.image || col.image}
                                alt={p.name}
                                className="w-full h-full object-contain"
                              />
                              {p.price && (
                                <div className="absolute bottom-0 inset-x-0 bg-slate-950/90 text-white text-[7.5px] font-black text-center py-0.5 truncate opacity-0 group-hover/thumb:opacity-100 transition duration-200 rounded-none">
                                  ₹{p.price}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Footer (Sharp Corners) */}
                  <div className="pt-4 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Available</span>
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                        {col.countNum > 0 ? `${col.countNum}+ Items` : "12+ Items"}
                      </span>
                    </div>

                    <button
                      onClick={() => navigate(`/collections/${col.slug}`)}
                      className={`px-5 py-2.5 bg-gradient-to-r ${col.btnGradient} text-white font-black text-[10px] uppercase tracking-wider rounded-xs transition-all flex items-center gap-2 border-none cursor-pointer shadow-xs hover:shadow-md`}
                    >
                      <ShoppingBag size={12} className="stroke-[2.5]" />
                      <span>Shop Collection</span>
                      <ArrowRight size={11} className="stroke-[3]" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200/80 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Showing <span className="text-slate-900 dark:text-white font-black">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-slate-900 dark:text-white font-black">{Math.min(currentPage * itemsPerPage, filteredCollections.length)}</span> of <span className="text-slate-900 dark:text-white font-black">{filteredCollections.length}</span> Collections
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="px-3.5 py-2 text-xs font-black uppercase tracking-wider bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition duration-200 flex items-center gap-1"
                  >
                    <ChevronLeft size={14} className="stroke-[3]" />
                    <span>Prev</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 text-xs font-black rounded-xs transition duration-200 cursor-pointer border ${
                          currentPage === page
                            ? "bg-[#ff3f6c] text-white border-[#ff3f6c] shadow-xs"
                            : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="px-3.5 py-2 text-xs font-black uppercase tracking-wider bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition duration-200 flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ChevronRight size={14} className="stroke-[3]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Collections;
