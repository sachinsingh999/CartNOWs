import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { backendUrl } from "../config";
import { cachedGet } from "../utils/apiCache";
import BrandLogo from "../components/BrandLogo";
import BrandAdBanner from "../components/BrandAdBanner";
import {
  ShieldCheck,
  Star,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Sparkles,
  Search,
  CheckCircle2,
  Zap,
  Award,
  ShoppingBag,
  X,
  Flame,
  Layers,
  ArrowUpDown,
  Compass,
  Store,
  TrendingUp,
  PackageCheck,
  Truck,
  RotateCcw,
  SlidersHorizontal,
  ExternalLink
} from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "All Stores", icon: Layers },
  { id: "tech", label: "Tech & Electronics", icon: Zap },
  { id: "fashion", label: "Fashion & Apparel", icon: ShoppingBag },
  { id: "audio", label: "Audio & Acoustics", icon: Sparkles },
  { id: "lifestyle", label: "Watches & Style", icon: Award },
  { id: "beauty", label: "Beauty & Personal", icon: Flame },
  { id: "sports", label: "Sports & Fitness", icon: Compass }
];

const getBrandCategory = (name = "") => {
  const lower = name.toLowerCase();
  if (lower.includes("boat") || lower.includes("jbl") || lower.includes("bose") || lower.includes("sennheiser") || lower.includes("skullcandy") || lower.includes("marshall") || lower.includes("beats")) {
    return "audio";
  }
  if (lower.includes("sony") || lower.includes("apple") || lower.includes("samsung") || lower.includes("dell") || lower.includes("hp") || lower.includes("lenovo") || lower.includes("oppo") || lower.includes("xiaomi") || lower.includes("asus") || lower.includes("acer") || lower.includes("intel") || lower.includes("microsoft") || lower.includes("lg") || lower.includes("philips") || lower.includes("viewsonic") || lower.includes("razer") || lower.includes("steelseries") || lower.includes("syska") || lower.includes("wipro") || lower.includes("google") || lower.includes("motorola") || lower.includes("anker") || lower.includes("noise") || lower.includes("realme") || lower.includes("vivo")) {
    return "tech";
  }
  if (lower.includes("nike") || lower.includes("adidas") || lower.includes("puma") || lower.includes("zara") || lower.includes("uniqlo") || lower.includes("raymond") || lower.includes("reebok") || lower.includes("under armour") || lower.includes("skechers") || lower.includes("gucci") || lower.includes("prada") || lower.includes("h&m") || lower.includes("hm") || lower.includes("levi") || lower.includes("fashion") || lower.includes("campus") || lower.includes("wildcraft") || lower.includes("biba")) {
    return "fashion";
  }
  if (lower.includes("titan") || lower.includes("fastrack") || lower.includes("fossil") || lower.includes("seiko") || lower.includes("citizen") || lower.includes("tissot") || lower.includes("casio") || lower.includes("ray-ban") || lower.includes("skagen") || lower.includes("tom ford") || lower.includes("safari") || lower.includes("american tourister") || lower.includes("jewels") || lower.includes("jewelry")) {
    return "lifestyle";
  }
  if (lower.includes("ordinary") || lower.includes("sugar") || lower.includes("swiss beauty") || lower.includes("wow") || lower.includes("lakme") || lower.includes("l'oreal") || lower.includes("loreal") || lower.includes("nivea") || lower.includes("mamaearth") || lower.includes("bella vita")) {
    return "beauty";
  }
  if (lower.includes("yonex") || lower.includes("decathlon") || lower.includes("speedo") || lower.includes("spalding") || lower.includes("wilson") || lower.includes("head")) {
    return "sports";
  }
  return "tech";
};

const getCategoryTagLabel = (cat) => {
  switch (cat) {
    case "audio": return "Audio & Sound";
    case "tech": return "Tech & Gadgets";
    case "fashion": return "Fashion & Apparel";
    case "lifestyle": return "Watches & Style";
    case "beauty": return "Beauty & Care";
    case "sports": return "Sports & Fitness";
    default: return "Official Store";
  }
};

const Brands = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18;

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/product/brands`);
        if (data.success && Array.isArray(data.brands)) {
          const enriched = data.brands.map((brand) => {
            const categoryType = getBrandCategory(brand.name);
            const categoryTag = getCategoryTagLabel(categoryType);
            const rawCount = brand.count || 0;
            return {
              ...brand,
              title: brand.name,
              slug: brand.slug || brand.name.toLowerCase().replace(/\s+/g, "-"),
              subtext: brand.slug ? `@${brand.slug}` : "Official Store",
              categoryType,
              categoryTag,
              countNum: rawCount,
              rating: brand.rating || (4.6 + ((brand.name.charCodeAt(0) % 4) / 10)).toFixed(1),
              reviewsCount: 150 + (brand.name.charCodeAt(0) * 9) % 500,
              discount: rawCount > 10 ? "Up to 30% Off" : (rawCount > 0 ? "Official Partner" : "Direct Store"),
              description: brand.description || `Browse certified authentic collections from ${brand.name} with complete manufacturer assurance.`
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

  // Reset page whenever search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy]);

  // Keyboard shortcut (Cmd+K / Ctrl+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter & Sort Logic
  const filteredBrands = useMemo(() => {
    let result = brands.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        b.title.toLowerCase().includes(q) ||
        b.categoryTag.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (selectedCategory !== "all" && b.categoryType !== selectedCategory) {
        return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "name-asc") return a.title.localeCompare(b.title);
      if (sortBy === "name-desc") return b.title.localeCompare(a.title);
      if (sortBy === "items-high") return (b.countNum || 0) - (a.countNum || 0);
      if (sortBy === "rating") return parseFloat(b.rating) - parseFloat(a.rating);
      return (b.countNum || 0) - (a.countNum || 0);
    });

    return result;
  }, [brands, searchQuery, selectedCategory, sortBy]);

  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);

  const paginatedBrands = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBrands.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBrands, currentPage, itemsPerPage]);

  const totalProductCount = useMemo(() => {
    return brands.reduce((sum, b) => sum + (b.countNum || 0), 0);
  }, [brands]);

  const activeFiltersCount = (selectedCategory !== "all" ? 1 : 0) + (searchQuery ? 1 : 0);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("popular");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-[#0F172A] dark:text-slate-100 font-sans transition-colors duration-200 text-left pb-16 select-none">
      
      {/* ── FULL-WIDTH FLUID CONTAINER ── */}
      <div className="w-full px-3 sm:px-5 lg:px-6 py-2.5 space-y-3.5">

        {/* ── SECTION: FEATURED BRAND ADVERTISING & CAMPAIGN BANNER ── */}
        <BrandAdBanner />

        {/* ── SECTION 3: SEARCH & CATEGORIES TOOLBAR ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-2 sm:p-2.5 rounded-sm shadow-2xs space-y-1.5">
          
          {/* Top Row: Search Input + Sorting */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-1.5">
            
            {/* Live Search Input */}
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 stroke-[2.5]" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search official brands by name (e.g. Sony, Apple, Nike, boAt)... (⌘K)"
                className="w-full pl-9 pr-9 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Sort Selection & Results Count */}
            <div className="flex items-center gap-1.5 justify-between md:justify-end">
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded-sm">
                <ArrowUpDown size={11} className="text-slate-400 stroke-[2.5]" />
                <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-[11px] font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                >
                  <option value="popular">Most Popular</option>
                  <option value="items-high">Largest Catalog</option>
                  <option value="rating">Highest Rated</option>
                  <option value="name-asc">Alphabetical (A → Z)</option>
                  <option value="name-desc">Alphabetical (Z → A)</option>
                </select>
              </div>

              <div className="text-[11px] font-black text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-sm shrink-0 border border-slate-200 dark:border-slate-700">
                {filteredBrands.length} Brands
              </div>
            </div>
          </div>

          {/* Bottom Row: Industry Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none no-scrollbar">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              const count = cat.id === "all"
                ? brands.length
                : brands.filter((b) => b.categoryType === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-sm whitespace-nowrap transition-all duration-150 border cursor-pointer shadow-2xs ${
                    isActive
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs"
                      : "bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon size={11} className={isActive ? "text-blue-400 dark:text-blue-600" : "text-blue-500"} />
                  <span>{cat.label}</span>
                  <span className={`text-[8.5px] px-1 py-0.2 rounded-sm font-black ${
                    isActive ? "bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Filter Badges Bar */}
          {activeFiltersCount > 0 && (
            <div className="pt-1 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1.5 flex-wrap">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400">Filters:</span>
                
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-sm text-[9.5px] font-bold">
                    <span>"{searchQuery}"</span>
                    <X size={9} className="cursor-pointer hover:text-blue-900" onClick={() => setSearchQuery("")} />
                  </span>
                )}

                {selectedCategory !== "all" && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-sm text-[9.5px] font-bold">
                    <span>{CATEGORIES.find((c) => c.id === selectedCategory)?.label}</span>
                    <X size={9} className="cursor-pointer hover:text-blue-900" onClick={() => setSelectedCategory("all")} />
                  </span>
                )}
              </div>

              <button
                onClick={handleResetFilters}
                className="text-[9.5px] font-black text-rose-600 hover:text-rose-700 uppercase tracking-wider cursor-pointer underline"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* ── SECTION 4: BRAND CARDS GRID ── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 sm:gap-2">
            {Array.from({ length: 18 }).map((_, n) => (
              <div key={n} className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-2.5 h-[200px] animate-pulse rounded-sm flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="h-2.5 bg-slate-200 dark:bg-slate-800 w-1/2 rounded-sm" />
                  <div className="h-20 bg-slate-100 dark:bg-slate-950 w-full rounded-sm" />
                  <div className="h-2.5 bg-slate-200 dark:bg-slate-800 w-3/4 rounded-sm" />
                </div>
                <div className="h-6 bg-slate-200 dark:bg-slate-800 w-full rounded-sm" />
              </div>
            ))}
          </div>
        ) : filteredBrands.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-sm bg-white dark:bg-slate-900 text-center space-y-2"
          >
            <div className="w-11 h-11 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 rounded-sm shadow-inner">
              <ShieldCheck size={22} />
            </div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide">No Partner Brands Found</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium max-w-sm">
              We couldn't find any brand matching your search criteria. Try clearing search keywords or selecting "ALL" filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-sm transition duration-200 border-none cursor-pointer mt-1 shadow-2xs"
            >
              Reset All Filters
            </button>
          </motion.div>
        ) : (
          <div className="space-y-2">
            
            {/* Fluid Responsive Grid: 2 cols on mobile, 3 on small tablet, 4 on tablet, 5 on desktop, 6 on wide screens */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 sm:gap-2">
              {paginatedBrands.map((brand, i) => (
                <motion.div
                  key={brand.slug || brand._id || i}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15, delay: (i % 12) * 0.01 }}
                  whileHover={{ y: -2 }}
                  onClick={() => navigate(`/brands/${brand.slug}`)}
                  className="group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 p-2 sm:p-2.5 rounded-sm shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between text-left cursor-pointer select-none"
                >
                  <div>
                    {/* Top Row: Category Tag & Rating */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[8.5px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.2 rounded-sm truncate max-w-[70%]">
                        {brand.categoryTag}
                      </span>

                      <span className="inline-flex items-center gap-0.5 text-[8.5px] font-black text-amber-500">
                        <Star size={8.5} className="fill-amber-400 text-amber-400 stroke-none" />
                        <span>{brand.rating}</span>
                      </span>
                    </div>

                    {/* Logo Box Container */}
                    <div className="w-full aspect-square rounded-sm overflow-hidden bg-slate-50/50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 relative p-2 flex items-center justify-center group-hover:border-blue-400 dark:group-hover:border-blue-400 transition-all duration-200 mb-1.5">
                      
                      {/* Floating Discount Tag if applicable */}
                      {brand.discount && (
                        <span className="absolute top-1 right-1 z-10 px-1 py-0.2 rounded-sm text-[7px] font-black uppercase tracking-tight bg-blue-600 text-white shadow-2xs leading-none pointer-events-none">
                          {brand.discount}
                        </span>
                      )}

                      <BrandLogo
                        brand={brand.title}
                        brandDomain={brand.domain || brand.brandDomain}
                        className="w-full h-full bg-transparent border-0 shadow-none p-0.5 group-hover:scale-106 transition-transform duration-200"
                        imageClassName="w-full h-full object-contain filter drop-shadow-2xs"
                        fallbackText={brand.title.substring(0, 2).toUpperCase()}
                        fallbackClassName="text-sm font-black text-slate-700 dark:text-slate-200"
                      />
                    </div>

                    {/* Brand Name & Handle */}
                    <div className="space-y-0.2">
                      <h3 
                        className="text-xs sm:text-[13px] font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight truncate leading-tight"
                        title={brand.title}
                      >
                        {brand.title}
                      </h3>
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 truncate">
                        {brand.subtext}
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom: Catalog count + Direct Action CTA */}
                  <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate">
                      {brand.countNum > 0 ? `${brand.countNum} Items` : "Store"}
                    </span>

                    <span className="inline-flex items-center gap-0.5 text-[9.5px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform duration-200">
                      <span>Visit</span>
                      <ArrowRight size={9} className="stroke-[3]" />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ── PAGINATION CONTROLS ── */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Showing <span className="text-slate-900 dark:text-white font-black">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-slate-900 dark:text-white font-black">{Math.min(currentPage * itemsPerPage, filteredBrands.length)}</span> of <span className="text-slate-900 dark:text-white font-black">{filteredBrands.length}</span> Brands
                </div>

                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage((prev) => Math.max(prev - 1, 1));
                      window.scrollTo({ top: 200, behavior: "smooth" });
                    }}
                    className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition duration-200 flex items-center gap-0.5 shadow-2xs"
                  >
                    <ChevronLeft size={11} className="stroke-[3]" />
                    <span>Prev</span>
                  </button>

                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => {
                      if (totalPages > 7 && Math.abs(page - currentPage) > 2 && page !== 1 && page !== totalPages) {
                        if (Math.abs(page - currentPage) === 3) {
                          return <span key={page} className="px-0.5 text-slate-400 text-[10px]">...</span>;
                        }
                        return null;
                      }

                      return (
                        <button
                          key={page}
                          onClick={() => {
                            setCurrentPage(page);
                            window.scrollTo({ top: 200, behavior: "smooth" });
                          }}
                          className={`w-6 h-6 text-[11px] font-black rounded-sm transition duration-200 cursor-pointer border shadow-2xs ${
                            currentPage === page
                              ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                      window.scrollTo({ top: 200, behavior: "smooth" });
                    }}
                    className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition duration-200 flex items-center gap-0.5 shadow-2xs"
                  >
                    <span>Next</span>
                    <ChevronRight size={11} className="stroke-[3]" />
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
