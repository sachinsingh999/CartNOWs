import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { backendUrl } from "../config";
import {
  ShieldCheck,
  Star,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Sparkles,
  Search,
  CheckCircle,
  Zap,
  Award,
  ShoppingBag,
  X
} from "lucide-react";

const Brands = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const getBrandStyles = (name = "") => {
    const lower = name.toLowerCase();
    if (lower.includes("sony") || lower.includes("apple") || lower.includes("samsung") || lower.includes("dell") || lower.includes("hp") || lower.includes("oppo") || lower.includes("xiaomi")) {
      return {
        cardBorder: "border-blue-100 dark:border-blue-900/40 hover:border-blue-300 dark:hover:border-blue-700",
        badgeBg: "bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40",
        btnGradient: "from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
        tag: "Tech & Electronics"
      };
    }
    if (lower.includes("nike") || lower.includes("adidas") || lower.includes("puma") || lower.includes("fashion") || lower.includes("zara")) {
      return {
        cardBorder: "border-rose-100 dark:border-rose-900/40 hover:border-rose-300 dark:hover:border-rose-700",
        badgeBg: "bg-rose-50 dark:bg-rose-950/70 text-[#ff3f6c] dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40",
        btnGradient: "from-[#ff3f6c] to-rose-600 hover:from-rose-600 hover:to-rose-700",
        tag: "Fashion & Footwear"
      };
    }
    return {
      cardBorder: "border-purple-100 dark:border-purple-900/40 hover:border-purple-300 dark:hover:border-purple-700",
      badgeBg: "bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40",
      btnGradient: "from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700",
      tag: "Global Partner"
    };
  };

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/product/brands`);
        if (data.success && Array.isArray(data.brands)) {
          const enriched = data.brands.map(brand => {
            const styles = getBrandStyles(brand.name);
            return {
              ...brand,
              title: brand.name,
              slug: brand.slug || brand.name.toLowerCase().replace(/\s+/g, "-"),
              subtext: brand.slug ? `@${brand.slug}` : "Official Partner",
              discount: "Authorized",
              countNum: brand.count || 0,
              rating: brand.rating || "4.8",
              img: brand.logo || brand.banner || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80",
              styles: styles,
              description: brand.description || `Explore authentic items directly from the official ${brand.name} brand store with verified manufacturer warranty.`
            };
          });
          setBrands(enriched);
        }
      } catch (err) {
        console.error("Failed to load brands:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const filteredBrands = useMemo(() => {
    return brands.filter(b => {
      const matchesSearch = 
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.styles.tag.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === "all") return true;
      if (selectedCategory === "tech" && b.styles.tag.includes("Tech")) return true;
      if (selectedCategory === "fashion" && b.styles.tag.includes("Fashion")) return true;

      return true;
    });
  }, [brands, searchQuery, selectedCategory]);

  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);

  const paginatedBrands = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBrands.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBrands, currentPage, itemsPerPage]);

  const totalProductCount = useMemo(() => {
    return brands.reduce((sum, b) => sum + (b.countNum || 0), 0);
  }, [brands]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-[#0F172A] dark:text-slate-100 px-4 sm:px-8 lg:px-16 py-10 transition-colors duration-200 text-left">
      
      {/* Ambient Background Blur Blobs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-blue-500/[0.03] dark:bg-blue-500/[0.08] rounded-none blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-96 right-1/4 w-96 h-96 bg-indigo-500/[0.03] dark:bg-indigo-500/[0.06] rounded-none blur-[140px] pointer-events-none z-0" />

      {/* Main Content Wrapper */}
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">

        {/* UNIFIED HERO HEADER CARD (TITLE, BADGES, STATS, SEARCH & FILTERS IN A SINGLE CONTAINER) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 rounded-xs shadow-sm space-y-6">
          
          {/* Top Section: Title & Subtitle + Stats */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-3 max-w-2xl">
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40 rounded-xs">
                  <ShieldCheck size={12} className="stroke-[2.5]" />
                  <span>AUTHORIZED BRAND STORES</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xs">
                  <Zap size={11} className="text-amber-500 fill-amber-500" />
                  <span>100% Authentic</span>
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-slate-900 dark:text-white uppercase">
                Shop By <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 bg-clip-text text-transparent">Brands</span>
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                Explore official partner storefronts with direct manufacturer warranties, exclusive price drops, and verified brand catalogs.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3 shrink-0">
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 px-4 py-3 rounded-xs text-center sm:text-left">
                <div className="text-[9.5px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Global Brands</div>
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">{brands.length} Stores</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 px-4 py-3 rounded-xs text-center sm:text-left">
                <div className="text-[9.5px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Products</div>
                <div className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5">{totalProductCount > 0 ? `${totalProductCount}+` : "250+"}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 px-4 py-3 rounded-xs text-center sm:text-left">
                <div className="text-[9.5px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Warranty</div>
                <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">Verified</div>
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
                placeholder="Search official brands by name or industry..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xs text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition duration-200"
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
                { id: "all", label: "All Partner Brands" },
                { id: "tech", label: "Tech & Electronics" },
                { id: "fashion", label: "Fashion & Lifestyle" }
              ].map(pill => (
                <button
                  key={pill.id}
                  onClick={() => setSelectedCategory(pill.id)}
                  className={`px-3.5 py-2 text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 border cursor-pointer rounded-xs ${
                    selectedCategory === pill.id
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* BRANDS GRID SECTION WITH CRISP SHARP CARDS */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 h-[340px] animate-pulse rounded-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 w-1/3 rounded-xs" />
                  <div className="h-28 bg-slate-100 dark:bg-slate-950 w-full rounded-xs" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 w-full rounded-xs" />
                </div>
                <div className="h-9 bg-slate-200 dark:bg-slate-800 w-full rounded-xs" />
              </div>
            ))}
          </div>
        ) : filteredBrands.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-xs bg-white dark:bg-slate-900 text-center space-y-3"
          >
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 rounded-xs">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide">No Matching Brands Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold max-w-sm">
              We couldn't find any partner brand matching "<span className="text-slate-800 dark:text-white font-bold">{searchQuery}</span>".
            </p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xs transition duration-200 border-none cursor-pointer mt-2"
            >
              Reset Filters
            </button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {paginatedBrands.map((brand, i) => (
                <motion.div
                  key={brand.slug || i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  whileHover={{ y: -3 }}
                  className={`group border p-5 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-xl rounded-xs relative overflow-hidden bg-white dark:bg-slate-900 text-slate-900 dark:text-white ${brand.styles.cardBorder}`}
                >
                  <div>
                    {/* Top Row: Category Tag Badge & Rating */}
                    <div className="flex justify-between items-center mb-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[9.5px] font-black uppercase tracking-wider rounded-none ${brand.styles.badgeBg}`}>
                        <Award size={11} className="stroke-[2.5]" />
                        <span>{brand.styles.tag}</span>
                      </span>

                      <span className="flex items-center gap-1 text-[9.5px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-none">
                        <Star size={10} className="fill-current text-amber-500" />
                        <span>{brand.rating}</span>
                      </span>
                    </div>

                    {/* Brand Title & Handle */}
                    <div className="mb-3 text-left">
                      <h2 
                        onClick={() => navigate(`/brands/${brand.slug}`)}
                        className="text-xl font-black text-slate-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors tracking-tight uppercase"
                      >
                        {brand.title}
                      </h2>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block mt-0.5">
                        {brand.subtext}
                      </span>
                    </div>

                    {/* Brand Banner / Logo Image Box (Sharp Corners) */}
                    <div 
                      onClick={() => navigate(`/brands/${brand.slug}`)}
                      className="relative rounded-none overflow-hidden aspect-[16/10] bg-slate-50 dark:bg-[#0B0F19] p-3 mb-3 flex items-center justify-center border border-slate-200/80 dark:border-slate-800 cursor-pointer group/img"
                    >
                      <img
                        src={brand.img}
                        alt={brand.title}
                        loading="lazy"
                        className="max-h-[90%] max-w-[90%] object-contain rounded-none transition-transform duration-500 group-hover/img:scale-105"
                      />
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed line-clamp-2 mb-4 text-left">
                      {brand.description}
                    </p>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-3.5 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Catalog</span>
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                        {brand.countNum > 0 ? `${brand.countNum}+ Items` : "15+ Items"}
                      </span>
                    </div>

                    <button
                      onClick={() => navigate(`/brands/${brand.slug}`)}
                      className={`px-4 py-2 bg-gradient-to-r ${brand.styles.btnGradient} text-white font-black text-[10px] uppercase tracking-wider rounded-xs transition-all flex items-center gap-1.5 border-none cursor-pointer shadow-xs hover:shadow-md`}
                    >
                      <span>Visit Store</span>
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
                  Showing <span className="text-slate-900 dark:text-white font-black">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-slate-900 dark:text-white font-black">{Math.min(currentPage * itemsPerPage, filteredBrands.length)}</span> of <span className="text-slate-900 dark:text-white font-black">{filteredBrands.length}</span> Brands
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
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
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

export default Brands;
