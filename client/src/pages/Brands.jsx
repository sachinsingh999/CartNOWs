import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { backendUrl } from "../config";
import { cachedGet } from "../utils/apiCache";
import BrandLogo from "../components/BrandLogo";
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
  Check
} from "lucide-react";

// Curated Flagship Brand Partners for the Top Spotlight Carousel
const SPOTLIGHT_BRANDS = [
  { name: "Apple", domain: "apple.com", tag: "Flagship Tech", discount: "Up to 20% Off", badge: "Premium", color: "from-slate-900 to-slate-800 text-white" },
  { name: "Samsung", domain: "samsung.com", tag: "Next-Gen Mobile", discount: "Min. 25% Off", badge: "Trending", color: "from-blue-900 to-indigo-950 text-white" },
  { name: "Nike", domain: "nike.com", tag: "Sport & Style", discount: "Up to 40% Off", badge: "Iconic", color: "from-neutral-900 to-neutral-800 text-white" },
  { name: "Sony", domain: "sony.com", tag: "Audio & Gaming", discount: "Up to 30% Off", badge: "Best Audio", color: "from-purple-950 to-slate-900 text-white" },
  { name: "Adidas", domain: "adidas.com", tag: "Performance Wear", discount: "Min. 35% Off", badge: "Hot Deal", color: "from-zinc-900 to-slate-950 text-white" },
  { name: "boAt", domain: "boat-lifestyle.com", tag: "Bass & Wireless", discount: "Up to 60% Off", badge: "Top Seller", color: "from-red-950 to-slate-900 text-white" }
];

const CATEGORIES = [
  { id: "all", label: "All Stores", icon: Layers },
  { id: "tech", label: "Electronics & Tech", icon: Zap },
  { id: "fashion", label: "Fashion & Apparel", icon: ShoppingBag },
  { id: "audio", label: "Audio & Acoustics", icon: Sparkles },
  { id: "lifestyle", label: "Watches & Lifestyle", icon: Award },
  { id: "beauty", label: "Beauty & Personal", icon: Flame }
];

const ALPHABET = ["ALL", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

const getBrandCategory = (name = "") => {
  const lower = name.toLowerCase();
  if (lower.includes("boat") || lower.includes("jbl") || lower.includes("bose") || lower.includes("sennheiser") || lower.includes("skullcandy") || lower.includes("marshall") || lower.includes("beats")) {
    return "audio";
  }
  if (lower.includes("sony") || lower.includes("apple") || lower.includes("samsung") || lower.includes("dell") || lower.includes("hp") || lower.includes("lenovo") || lower.includes("oppo") || lower.includes("xiaomi") || lower.includes("asus") || lower.includes("acer") || lower.includes("intel") || lower.includes("microsoft") || lower.includes("lg") || lower.includes("philips") || lower.includes("viewsonic") || lower.includes("razer") || lower.includes("steelseries") || lower.includes("syska") || lower.includes("wipro") || lower.includes("google") || lower.includes("motorola") || lower.includes("anker") || lower.includes("noise") || lower.includes("realme") || lower.includes("vivo")) {
    return "tech";
  }
  if (lower.includes("nike") || lower.includes("adidas") || lower.includes("puma") || lower.includes("zara") || lower.includes("uniqlo") || lower.includes("raymond") || lower.includes("reebok") || lower.includes("under armour") || lower.includes("skechers") || lower.includes("gucci") || lower.includes("prada") || lower.includes("h&m") || lower.includes("hm") || lower.includes("levi") || lower.includes("fashion") || lower.includes("campus") || lower.includes("wildcraft")) {
    return "fashion";
  }
  if (lower.includes("titan") || lower.includes("fastrack") || lower.includes("fossil") || lower.includes("seiko") || lower.includes("citizen") || lower.includes("tissot") || lower.includes("casio") || lower.includes("ray-ban") || lower.includes("skagen") || lower.includes("tom ford") || lower.includes("safari") || lower.includes("american tourister")) {
    return "lifestyle";
  }
  if (lower.includes("ordinary") || lower.includes("sugar") || lower.includes("swiss beauty") || lower.includes("wow") || lower.includes("lakme") || lower.includes("l'oreal") || lower.includes("loreal") || lower.includes("nivea") || lower.includes("mamaearth") || lower.includes("bella vita")) {
    return "beauty";
  }
  return "tech"; // default fallback
};

const getCategoryTagLabel = (cat) => {
  switch (cat) {
    case "audio": return "Audio & Sound";
    case "tech": return "Tech & Gadgets";
    case "fashion": return "Fashion & Apparel";
    case "lifestyle": return "Watches & Style";
    case "beauty": return "Beauty & Care";
    default: return "Official Partner";
  }
};

const Brands = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLetter, setSelectedLetter] = useState("ALL");
  const [sortBy, setSortBy] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const [heroBanners, setHeroBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const itemsPerPage = 18;

  // Fetch admin-managed dynamic hero banners
  useEffect(() => {
    cachedGet(`${backendUrl}/api/promo-banners/active?placement=brands_hero`, {}, 60000)
      .then((res) => {
        if (res.data?.success) {
          const list = Array.isArray(res.data.banners) && res.data.banners.length > 0
            ? res.data.banners
            : (res.data.banner ? [res.data.banner] : []);
          setHeroBanners(list);
        }
      })
      .catch((err) => {
        console.warn("Could not load dynamic brands hero banners:", err);
      });
  }, []);

  // Compute active slides
  const slides = useMemo(() => {
    if (heroBanners.length > 0) return heroBanners;
    return [{
      _id: "default_brands_hero",
      tagline: "Authorized Brand Network",
      title: "Shop Official Brand Stores",
      subtitle: "Explore dedicated official partner storefronts with direct manufacturer warranties, exclusive price drops, instant fast dispatch, and verified brand catalogs.",
      discountTag: "100% Genuine Direct from Brand"
    }];
  }, [heroBanners]);

  const totalSlides = slides.length;
  const currentBanner = slides[currentSlide % totalSlides] || slides[0];

  // Auto-advance slideshow every 5 seconds if more than one active banner
  useEffect(() => {
    if (totalSlides <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(timer);
  }, [totalSlides, isHovered]);

  const handlePrevSlide = (e) => {
    e?.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNextSlide = (e) => {
    e?.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/product/brands`);
        if (data.success && Array.isArray(data.brands)) {
          const enriched = data.brands.map(brand => {
            const categoryType = getBrandCategory(brand.name);
            const categoryTag = getCategoryTagLabel(categoryType);
            return {
              ...brand,
              title: brand.name,
              slug: brand.slug || brand.name.toLowerCase().replace(/\s+/g, "-"),
              subtext: brand.slug ? `@${brand.slug}` : "Official Store",
              categoryType,
              categoryTag,
              countNum: brand.count || 0,
              rating: brand.rating || (4.5 + ((brand.name.charCodeAt(0) % 5) / 10)).toFixed(1),
              reviewsCount: 120 + (brand.name.charCodeAt(0) * 7) % 400,
              discount: brand.count && brand.count > 10 ? "Up to 30% Off" : "Authorized Store",
              description: brand.description || `Explore authentic collections directly from the official ${brand.name} brand store with full manufacturer warranty.`
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
  }, [searchQuery, selectedCategory, selectedLetter, sortBy]);

  // Filter & Sort Logic
  const filteredBrands = useMemo(() => {
    let result = brands.filter(b => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        b.title.toLowerCase().includes(q) ||
        b.categoryTag.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (selectedCategory !== "all" && b.categoryType !== selectedCategory) {
        return false;
      }

      if (selectedLetter !== "ALL") {
        const firstLetter = b.title.charAt(0).toUpperCase();
        if (firstLetter !== selectedLetter) return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "name-asc") return a.title.localeCompare(b.title);
      if (sortBy === "name-desc") return b.title.localeCompare(a.title);
      if (sortBy === "items-high") return (b.countNum || 0) - (a.countNum || 0);
      if (sortBy === "rating") return parseFloat(b.rating) - parseFloat(a.rating);
      // "popular" default: items with most products & total views first
      return (b.countNum || 0) - (a.countNum || 0);
    });

    return result;
  }, [brands, searchQuery, selectedCategory, selectedLetter, sortBy]);

  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);

  const paginatedBrands = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBrands.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBrands, currentPage, itemsPerPage]);

  const totalProductCount = useMemo(() => {
    return brands.reduce((sum, b) => sum + (b.countNum || 0), 0);
  }, [brands]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-[#0F172A] dark:text-slate-100 font-sans transition-colors duration-200 text-left pb-16">
      
      {/* ── FULL-WIDTH FLUID CONTAINER ── */}
      <div className="w-full px-2 sm:px-4 lg:px-6 py-4 space-y-4 sm:space-y-5">

        {/* ── SECTION 1: HERO SPOTLIGHT HEADER ── */}
        <div 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative bg-[#020617] text-white rounded-lg p-5 sm:p-7 lg:p-8 border border-slate-800/90 shadow-xl overflow-hidden group"
        >
          {/* Glowing Ambient Mesh Gradients */}
          <div className="absolute top-[-40%] left-[-20%] w-[70%] h-[120%] bg-gradient-to-tr from-blue-600/20 via-indigo-500/15 to-transparent rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[-30%] right-[-10%] w-[60%] h-[100%] bg-gradient-to-bl from-purple-600/20 via-rose-500/10 to-transparent rounded-full blur-[90px] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left Info Column */}
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[9.5px] font-black uppercase tracking-widest bg-blue-500/15 text-blue-400 border border-blue-500/30 rounded-full shadow-2xs">
                  <ShieldCheck size={12} className="stroke-[2.5]" />
                  <span>{currentBanner?.tagline || "Authorized Brand Network"}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9.5px] font-bold text-slate-300 bg-white/5 border border-white/10 rounded-full">
                  <CheckCircle2 size={11} className="text-emerald-400" />
                  <span>{currentBanner?.discountTag || "100% Genuine Direct from Brand"}</span>
                </span>
                {totalSlides > 1 && (
                  <div className="flex items-center gap-1 ml-2">
                    {slides.map((s, idx) => (
                      <button
                        key={s._id || idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentSlide(idx);
                        }}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          idx === currentSlide % totalSlides
                            ? "w-5 bg-blue-400"
                            : "w-1.5 bg-slate-700 hover:bg-slate-500"
                        }`}
                        title={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent transition-all duration-300">
                {currentBanner?.title ? (
                  currentBanner.title
                ) : (
                  <>
                    Shop Official <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Brand Stores</span>
                  </>
                )}
              </h1>

              <p className="text-xs sm:text-sm font-medium text-slate-400 leading-relaxed max-w-2xl transition-all duration-300">
                {currentBanner?.subtitle || "Explore dedicated official partner storefronts with direct manufacturer warranties, exclusive price drops, instant fast dispatch, and verified brand catalogs."}
              </p>
            </div>

            {/* Right Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 shrink-0">
              <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 px-3.5 py-2.5 rounded-md text-left">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Official Stores</div>
                <div className="text-lg sm:text-xl font-extrabold text-white mt-0.5">{brands.length > 0 ? `${brands.length}+` : "80+"}</div>
              </div>

              <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 px-3.5 py-2.5 rounded-md text-left">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Active Items</div>
                <div className="text-lg sm:text-xl font-extrabold text-blue-400 mt-0.5">{totalProductCount > 0 ? `${totalProductCount}+` : "500+"}</div>
              </div>

              <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 px-3.5 py-2.5 rounded-md text-left">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Avg Rating</div>
                <div className="text-lg sm:text-xl font-extrabold text-amber-400 mt-0.5 flex items-center gap-1">
                  <Star size={14} className="fill-amber-400 text-amber-400 stroke-none" />
                  <span>4.9★</span>
                </div>
              </div>

              <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 px-3.5 py-2.5 rounded-md text-left">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Warranty</div>
                <div className="text-lg sm:text-xl font-extrabold text-emerald-400 mt-0.5">Verified</div>
              </div>
            </div>
          </div>

          {/* Featured Flagship Brands Quick Bar */}
          <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0 mr-1 flex items-center gap-1">
              <Sparkles size={11} className="text-amber-400" />
              <span>Flagships:</span>
            </span>
            {SPOTLIGHT_BRANDS.map(sb => (
              <button
                key={sb.name}
                onClick={() => navigate(`/brands/${sb.name.toLowerCase()}`)}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 hover:bg-white/10 border border-white/10 hover:border-blue-400/50 rounded-md text-xs font-bold text-slate-200 transition-all cursor-pointer shrink-0 shadow-2xs hover:scale-102 active:scale-98"
              >
                <BrandLogo
                  brand={sb.name}
                  brandDomain={sb.domain}
                  className="w-4 h-4 bg-transparent border-0 p-0"
                  fallbackText={sb.name.substring(0, 2)}
                />
                <span>{sb.name}</span>
                <span className="text-[9px] font-extrabold text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded-xs border border-blue-500/20">
                  {sb.discount}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── SECTION 2: SEARCH, CATEGORIES & A-Z DIRECTORY TOOLBAR ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-3.5 sm:p-4 rounded-lg shadow-xs space-y-3">
          
          {/* Top Row: Search Input + Sorting */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Live Search Input */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 stroke-[2.5]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search official brands by name (e.g. Sony, Apple, Nike, boAt)..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort Selection & Results Count */}
            <div className="flex items-center gap-2 justify-between md:justify-end">
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-md">
                <ArrowUpDown size={12} className="text-slate-400 stroke-[2.5]" />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                >
                  <option value="popular">Most Popular</option>
                  <option value="items-high">Largest Catalog</option>
                  <option value="rating">Highest Rated</option>
                  <option value="name-asc">Alphabetical (A → Z)</option>
                  <option value="name-desc">Alphabetical (Z → A)</option>
                </select>
              </div>

              <div className="text-xs font-extrabold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-md shrink-0">
                {filteredBrands.length} Brands
              </div>
            </div>
          </div>

          {/* Middle Row: Industry Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              const count = cat.id === "all"
                ? brands.length
                : brands.filter(b => b.categoryType === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold uppercase tracking-wider rounded-md whitespace-nowrap transition-all duration-200 border cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon size={12} className={isActive ? "text-white" : "text-blue-500"} />
                  <span>{cat.label}</span>
                  <span className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-black ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom Row: A-Z Alphabet Quick Filter Directory Bar */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 shrink-0 mr-1.5">
              Filter By Initial:
            </span>
            {ALPHABET.map(letter => {
              const isLetterActive = selectedLetter === letter;
              return (
                <button
                  key={letter}
                  onClick={() => setSelectedLetter(letter)}
                  className={`min-w-[26px] h-[26px] px-1.5 flex items-center justify-center text-[10px] font-black rounded-md transition-all cursor-pointer border ${
                    isLetterActive
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs scale-105"
                      : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400"
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── SECTION 3: FULL-WIDTH BRAND CARDS GRID ── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5 lg:gap-3">
            {Array.from({ length: 18 }).map((_, n) => (
              <div key={n} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 h-[240px] animate-pulse rounded-lg flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 w-1/2 rounded" />
                  <div className="h-24 bg-slate-100 dark:bg-slate-950 w-full rounded-md" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 w-3/4 rounded" />
                </div>
                <div className="h-7 bg-slate-200 dark:bg-slate-800 w-full rounded" />
              </div>
            ))}
          </div>
        ) : filteredBrands.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-center space-y-3"
          >
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 rounded-full shadow-inner">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wide">No Partner Brands Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-sm">
              We couldn't find any brand matching your search criteria. Try clearing search keywords or selecting "ALL" filters.
            </p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedCategory("all"); setSelectedLetter("ALL"); }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-md transition duration-200 border-none cursor-pointer mt-2 shadow-xs"
            >
              Reset All Filters
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            
            {/* Fluid Responsive Grid: 2 cols on mobile, 3 on small tablet, 4 on tablet, 5 on desktop, 6 on wide screens */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5 lg:gap-3">
              {paginatedBrands.map((brand, i) => (
                <motion.div
                  key={brand.slug || brand._id || i}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, delay: (i % 12) * 0.02 }}
                  whileHover={{ y: -3 }}
                  onClick={() => navigate(`/brands/${brand.slug}`)}
                  className="group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 p-3 rounded-lg shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between text-left cursor-pointer select-none"
                >
                  <div>
                    {/* Top Row: Category Tag & Verified Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-xs truncate max-w-[70%]">
                        {brand.categoryTag}
                      </span>

                      <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-amber-500">
                        <Star size={9.5} className="fill-amber-400 text-amber-400 stroke-none" />
                        <span>{brand.rating}</span>
                      </span>
                    </div>

                    {/* Logo Box Container */}
                    <div className="w-full aspect-square rounded-md overflow-hidden bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 relative p-3 flex items-center justify-center group-hover:border-blue-400 dark:group-hover:border-blue-400 group-hover:shadow-xs transition-all duration-200 mb-2.5">
                      
                      {/* Floating Discount Tag if applicable */}
                      {brand.discount && (
                        <span className="absolute top-1 right-1 z-10 px-1.5 py-0.5 rounded-xs text-[7.5px] font-black uppercase tracking-tight bg-blue-600 text-white shadow-2xs leading-none pointer-events-none">
                          {brand.discount}
                        </span>
                      )}

                      <BrandLogo
                        brand={brand.title}
                        brandDomain={brand.domain || brand.brandDomain}
                        className="w-full h-full bg-transparent border-0 shadow-none p-0.5 group-hover:scale-108 transition-transform duration-200"
                        imageClassName="w-full h-full object-contain filter drop-shadow-2xs"
                        fallbackText={brand.title.substring(0, 2).toUpperCase()}
                        fallbackClassName="text-base font-black text-slate-700 dark:text-slate-200"
                      />
                    </div>

                    {/* Brand Name & Handle */}
                    <div className="space-y-0.5">
                      <h3 
                        className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight truncate leading-tight"
                        title={brand.title}
                      >
                        {brand.title}
                      </h3>
                      <p className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 truncate">
                        {brand.subtext}
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom: Catalog count + Direct Action CTA */}
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-[9.5px] font-bold text-slate-500 dark:text-slate-400 truncate">
                      {brand.countNum > 0 ? `${brand.countNum} Products` : "Verified Store"}
                    </span>

                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform duration-200">
                      <span>Visit</span>
                      <ArrowRight size={10} className="stroke-[3]" />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ── PAGINATION CONTROLS ── */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-slate-200/80 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Showing <span className="text-slate-900 dark:text-white font-black">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-slate-900 dark:text-white font-black">{Math.min(currentPage * itemsPerPage, filteredBrands.length)}</span> of <span className="text-slate-900 dark:text-white font-black">{filteredBrands.length}</span> Brands
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition duration-200 flex items-center gap-1"
                  >
                    <ChevronLeft size={13} className="stroke-[3]" />
                    <span>Prev</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(page => {
                      // Only show page numbers close to current page
                      if (totalPages > 7 && Math.abs(page - currentPage) > 2 && page !== 1 && page !== totalPages) {
                        if (Math.abs(page - currentPage) === 3) {
                          return <span key={page} className="px-1 text-slate-400 text-xs">...</span>;
                        }
                        return null;
                      }

                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-7 h-7 text-xs font-bold rounded-md transition duration-200 cursor-pointer border ${
                            currentPage === page
                              ? "bg-blue-600 text-white border-blue-600 shadow-xs"
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
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition duration-200 flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ChevronRight size={13} className="stroke-[3]" />
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
