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
  Crown,
  X,
  Truck,
  ShieldCheck,
  RotateCcw,
  ArrowUpDown,
  Layers,
  Heart,
  Grid
} from "lucide-react";

// Default typography/theme slide when no admin poster banner is active yet
const DEFAULT_COLLECTIONS_POSTER_SLIDE = {
  _id: "default_admin_poster",
  tagline: "OFFICIAL CURATED CAPSULES",
  title: "Curated Collections",
  subtitle: "Explore handpicked product capsules engineered for style, innovation, and performance. Find verified items tailored to your lifestyle.",
  discountTag: "ADMIN CURATED",
  ctaText: "Explore Collections",
  linkUrl: "/collections",
  displayMode: "overlay",
  theme: "dark",
  bgColor: "#090d16",
  images: [],
  showPerks: true
};

const Collections = () => {
  const navigate = useNavigate();
  const [rawCollections, setRawCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [heroBanners, setHeroBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // 1. Fetch dynamic hero poster banners controlled by Admin (placement: collections_hero)
  useEffect(() => {
    cachedGet(`${backendUrl}/api/promo-banners/active?placement=collections_hero`, {}, 60000)
      .then((res) => {
        if (res.data?.success) {
          const list = Array.isArray(res.data.banners) && res.data.banners.length > 0
            ? res.data.banners
            : (res.data.banner ? [res.data.banner] : []);
          setHeroBanners(list);
        }
      })
      .catch((err) => {
        console.warn("Could not load dynamic collections hero banners:", err);
      });
  }, []);

  // 2. Compute active poster slides (Admin-configured banner or Clean default slide)
  const slides = useMemo(() => {
    if (heroBanners.length > 0) {
      const flattened = [];
      heroBanners.forEach((b, bIdx) => {
        const rawImgs = Array.isArray(b.images) && b.images.length > 0
          ? b.images
          : (b.imageUrl ? [b.imageUrl] : []);

        const normalizedImages = rawImgs
          .filter((img) => img && typeof img === "string" && img.trim() !== "")
          .map((img) => (img.startsWith("http") ? img : `${backendUrl}/${img}`));

        if (b.displayMode === "full_image" && normalizedImages.length > 0) {
          normalizedImages.forEach((img, imgIdx) => {
            flattened.push({
              _id: `${b._id || bIdx}_${imgIdx}`,
              title: b.title,
              subtitle: b.subtitle,
              tagline: b.tagline,
              discountTag: b.discountTag,
              ctaText: b.ctaText,
              linkUrl: b.linkUrl,
              displayMode: "full_image",
              imageUrl: img,
              images: [img],
              theme: b.theme || "dark",
              bgColor: b.bgColor || "#020617",
              showPerks: b.showPerks !== false
            });
          });
        } else {
          flattened.push({
            _id: b._id || `banner_${bIdx}`,
            title: b.title || "Curated Collections",
            subtitle: b.subtitle || "Explore handpicked capsules engineered for style, innovation, and performance.",
            tagline: b.tagline || "OFFICIAL CURATED CAPSULES",
            discountTag: b.discountTag || "ADMIN CURATED",
            ctaText: b.ctaText || "Explore Collections",
            linkUrl: b.linkUrl || "/collections",
            displayMode: b.displayMode || "overlay",
            theme: b.theme || "dark",
            bgColor: b.bgColor || "#020617",
            images: normalizedImages,
            showPerks: b.showPerks !== false
          });
        }
      });
      return flattened.length > 0 ? flattened : [DEFAULT_COLLECTIONS_POSTER_SLIDE];
    }
    return [DEFAULT_COLLECTIONS_POSTER_SLIDE];
  }, [heroBanners]);

  const totalSlides = slides.length;
  const currentBanner = slides[currentSlide % totalSlides] || slides[0];

  // Auto-advance slideshow every 5 seconds (paused on hover)
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

  // 3. Fetch product collections from backend
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

  const getCollectionStyles = (name = "") => {
    const lower = name.toLowerCase();
    if (lower.includes("tech") || lower.includes("electro") || lower.includes("gadget") || lower.includes("phone")) {
      return {
        colorClass: "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600",
        badgeColor: "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40",
        btnGradient: "from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800",
        badgeIcon: Laptop,
        categoryTag: "Tech & Electronics"
      };
    }
    if (lower.includes("fashion") || lower.includes("wear") || lower.includes("lifestyle") || lower.includes("cloth") || lower.includes("style")) {
      return {
        colorClass: "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200/90 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-600",
        badgeColor: "bg-rose-50 dark:bg-rose-950/70 text-[#ff3f6c] dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40",
        btnGradient: "from-[#ff3f6c] to-rose-600 hover:from-rose-600 hover:to-rose-700",
        badgeIcon: Shirt,
        categoryTag: "Fashion & Lifestyle"
      };
    }
    if (lower.includes("home") || lower.includes("living") || lower.includes("decor") || lower.includes("kitchen")) {
      return {
        colorClass: "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200/90 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600",
        badgeColor: "bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40",
        btnGradient: "from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
        badgeIcon: Home,
        categoryTag: "Home & Living"
      };
    }
    if (lower.includes("beauty") || lower.includes("glow") || lower.includes("skin") || lower.includes("cosmetic")) {
      return {
        colorClass: "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200/90 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600",
        badgeColor: "bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/40",
        btnGradient: "from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700",
        badgeIcon: Sparkles,
        categoryTag: "Skincare & Beauty"
      };
    }
    if (lower.includes("sport") || lower.includes("sneaker") || lower.includes("active") || lower.includes("fitness")) {
      return {
        colorClass: "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200/90 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-600",
        badgeColor: "bg-cyan-50 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/40",
        btnGradient: "from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800",
        badgeIcon: Zap,
        categoryTag: "Sports & Footwear"
      };
    }
    if (lower.includes("new") || lower.includes("arrival") || lower.includes("drop")) {
      return {
        colorClass: "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200/90 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600",
        badgeColor: "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40",
        btnGradient: "from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700",
        badgeIcon: Sparkles,
        categoryTag: "Fresh Drops (7 Days)"
      };
    }
    if (lower.includes("best") || lower.includes("seller") || lower.includes("top-rated") || lower.includes("festiv") || lower.includes("offer")) {
      return {
        colorClass: "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200/90 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600",
        badgeColor: "bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40",
        btnGradient: "from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
        badgeIcon: Crown,
        categoryTag: "All-Time Best Sellers"
      };
    }
    return {
      colorClass: "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200/90 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600",
      badgeColor: "bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40",
      btnGradient: "from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700",
      badgeIcon: Award,
      categoryTag: "Curated Special"
    };
  };

  const getCollectionImage = (col) => {
    // 1. Image or banner configured by Admin on collection
    if (col.banner && typeof col.banner === "string" && col.banner.trim() !== "" && !col.banner.includes("photo-1511556532299")) {
      return col.banner.startsWith("http") ? col.banner : `${backendUrl}/${col.banner}`;
    }
    if (col.image && typeof col.image === "string" && col.image.trim() !== "" && !col.image.includes("photo-1511556532299")) {
      return col.image.startsWith("http") ? col.image : `${backendUrl}/${col.image}`;
    }

    // 2. Real product image from products in this collection (managed by admin/sellers in DB)
    if (col.sampleProducts && col.sampleProducts.length > 0) {
      const firstProdImg = col.sampleProducts[0]?.images?.[0] || col.sampleProducts[0]?.image;
      if (firstProdImg && typeof firstProdImg === "string" && firstProdImg.trim() !== "") {
        return firstProdImg.startsWith("http") ? firstProdImg : `${backendUrl}/${firstProdImg}`;
      }
    }

    return null;
  };

  // Format enriched collections
  const collections = useMemo(() => {
    return rawCollections.map((col) => {
      const styles = getCollectionStyles(col.name);
      return {
        ...col,
        title: col.name,
        slug: col.slug || col.name.toLowerCase().replace(/\s+/g, "-"),
        subtitle: col.description || "Curated capsule of high quality verified products.",
        countNum: col.count || (col.sampleProducts?.length ? col.sampleProducts.length * 4 : 12),
        badge: col.name,
        badgeIcon: styles.badgeIcon,
        categoryTag: styles.categoryTag,
        colorClass: styles.colorClass,
        badgeColor: styles.badgeColor,
        btnGradient: styles.btnGradient,
        image: getCollectionImage(col),
        sampleProducts: col.sampleProducts || [],
        trending: true
      };
    });
  }, [rawCollections]);

  // Filter collections based on search query and category filter pill
  const filteredCollections = useMemo(() => {
    let result = collections.filter((col) => {
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

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "items-high") return (b.countNum || 0) - (a.countNum || 0);
      if (sortBy === "name-asc") return a.title.localeCompare(b.title);
      if (sortBy === "name-desc") return b.title.localeCompare(a.title);
      // popular (default)
      return (b.countNum || 0) - (a.countNum || 0);
    });

    return result;
  }, [collections, searchQuery, selectedFilter, sortBy]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedFilter, sortBy]);

  const totalPages = Math.ceil(filteredCollections.length / itemsPerPage);

  const paginatedCollections = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCollections.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCollections, currentPage, itemsPerPage]);

  const totalProductCount = useMemo(() => {
    return collections.reduce((sum, col) => sum + (col.countNum || 0), 0);
  }, [collections]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-[#0F172A] dark:text-slate-100 font-sans transition-colors duration-200 text-left pb-16">
      
      {/* ── FULL-WIDTH FLUID CONTAINER ── */}
      <div className="w-full px-2 sm:px-4 lg:px-6 py-4 space-y-4 sm:space-y-5">

        {/* ═══════════════════════════════════════════════════════════════════
            1. DYNAMIC ADMIN-CONTROLLED HERO POSTER BANNER SLIDESHOW
        ═══════════════════════════════════════════════════════════════════ */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative w-full rounded-sm overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-sm transition-all duration-300 group"
          style={{ backgroundColor: currentBanner?.bgColor || "#020617" }}
        >
          {/* Glowing Ambient Mesh Gradients */}
          <div className="absolute top-[-40%] left-[-20%] w-[70%] h-[120%] bg-gradient-to-tr from-purple-600/20 via-indigo-500/15 to-transparent rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[-30%] right-[-10%] w-[60%] h-[100%] bg-gradient-to-bl from-rose-600/20 via-amber-500/10 to-transparent rounded-full blur-[90px] pointer-events-none" />

          {/* Slideshow Previous / Next Chevron Navigation */}
          {totalSlides > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-sm bg-slate-900/80 backdrop-blur-md border border-slate-700 text-white hover:bg-white hover:text-slate-900 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md active:scale-95"
                title="Previous Poster"
                aria-label="Previous Slide"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                type="button"
                onClick={handleNextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-sm bg-slate-900/80 backdrop-blur-md border border-slate-700 text-white hover:bg-white hover:text-slate-900 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md active:scale-95"
                title="Next Poster"
                aria-label="Next Slide"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* Slide Content with Framer Motion AnimatePresence */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner?._id || currentSlide}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="relative z-10 w-full"
            >
              {currentBanner?.displayMode === "full_image" && (currentBanner.imageUrl || currentBanner.images?.[0]) ? (
                /* Mode A: Full Image Poster Uploaded by Admin */
                <div 
                  onClick={() => currentBanner.linkUrl && navigate(currentBanner.linkUrl)}
                  className="relative w-full h-[220px] sm:h-[280px] md:h-[340px] lg:h-[380px] cursor-pointer overflow-hidden flex items-center justify-center"
                >
                  <img
                    src={currentBanner.imageUrl || currentBanner.images?.[0]}
                    alt={currentBanner.title || "Collections Poster"}
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/20" />
                  
                  <div className="absolute bottom-6 left-6 sm:left-10 z-20 space-y-1.5 text-left max-w-2xl text-white">
                    {currentBanner.tagline && (
                      <span className="inline-block px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest bg-amber-500 text-slate-950 rounded-xs">
                        {currentBanner.tagline}
                      </span>
                    )}
                    <h2 className="text-xl sm:text-3xl font-black uppercase tracking-tight leading-none text-white drop-shadow-md">
                      {currentBanner.title}
                    </h2>
                    {currentBanner.subtitle && (
                      <p className="text-xs sm:text-sm text-slate-200 font-medium line-clamp-2 drop-shadow-xs">
                        {currentBanner.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                /* Mode B: Rich Responsive 2-Column Poster (Default & Overlay mode) */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-5 sm:p-8 lg:p-10 min-h-[260px] sm:min-h-[300px] lg:min-h-[340px]">
                  
                  {/* Left Column: Taglines, Title, Subtitle, CTA Button & Perks */}
                  <div className="lg:col-span-7 xl:col-span-7 space-y-3 sm:space-y-4 text-left z-20">
                    {/* Badge Chips & Slide Indicator */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[9.5px] font-black uppercase tracking-widest bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xs shadow-2xs">
                        <Award size={12} className="stroke-[2.5]" />
                        <span>{currentBanner?.tagline || "OFFICIAL CURATED CAPSULES"}</span>
                      </span>

                      {currentBanner?.discountTag && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9.5px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 rounded-xs">
                          <Zap size={11} className="text-amber-400 fill-amber-400" />
                          <span>{currentBanner.discountTag}</span>
                        </span>
                      )}

                      {totalSlides > 1 && (
                        <div className="flex items-center gap-1.5 ml-2">
                          <span className="text-[10px] font-bold text-slate-400">
                            {(currentSlide % totalSlides) + 1} / {totalSlides}
                          </span>
                          <div className="flex items-center gap-1 ml-1">
                            {slides.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentSlide(idx);
                                }}
                                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                  idx === currentSlide % totalSlides
                                    ? "w-4 bg-purple-400"
                                    : "w-1.5 bg-slate-700 hover:bg-slate-500"
                                }`}
                                title={`Slide ${idx + 1}`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white uppercase transition-all duration-300">
                      {currentBanner?.title ? (
                        currentBanner.title
                      ) : (
                        <>
                          Shop By <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-rose-400 bg-clip-text text-transparent">Collections</span>
                        </>
                      )}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xs sm:text-sm font-medium text-slate-300 leading-relaxed max-w-2xl transition-all duration-300">
                      {currentBanner?.subtitle || "Explore handpicked product capsules engineered for style, innovation, and performance. Find verified items tailored to your lifestyle."}
                    </p>

                    {/* CTA Button & Trust Perks */}
                    <div className="flex flex-wrap items-center gap-4 pt-1">
                      <button
                        onClick={() => {
                          if (currentBanner?.linkUrl) {
                            navigate(currentBanner.linkUrl);
                          }
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white text-xs font-black uppercase tracking-wider rounded-xs shadow-md active:scale-98 transition-all cursor-pointer border-none"
                      >
                        <ShoppingBag size={14} className="stroke-[2.5]" />
                        <span>{currentBanner?.ctaText || "Explore Collections"}</span>
                        <ArrowRight size={13} className="stroke-[3]" />
                      </button>

                      {currentBanner?.showPerks !== false && (
                        <div className="hidden sm:flex items-center gap-3 text-[10.5px] font-bold text-slate-400">
                          <span className="flex items-center gap-1 text-slate-300">
                            <CheckCircle size={12} className="text-emerald-400" />
                            <span>100% Genuine</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-300">
                            <Truck size={12} className="text-blue-400" />
                            <span>Express Dispatch</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-300">
                            <RotateCcw size={12} className="text-amber-400" />
                            <span>7-Day Return</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Visual Composite Graphic / Model Poster Cutout */}
                  <div className="lg:col-span-5 xl:col-span-5 relative flex items-center justify-center min-h-[180px] sm:min-h-[220px] lg:min-h-[260px]">
                    
                    {/* Floating Glassmorphic Badges */}
                    <div className="absolute -top-2 right-4 z-20 bg-slate-900/80 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-sm shadow-md text-left flex items-center gap-2">
                      <Crown size={14} className="text-amber-400" />
                      <div>
                        <div className="text-[8px] font-black uppercase tracking-wider text-slate-400">Live Capsules</div>
                        <div className="text-xs font-black text-white">{collections.length} Curations</div>
                      </div>
                    </div>

                    <div className="absolute -bottom-2 left-4 z-20 bg-slate-900/80 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-sm shadow-md text-left flex items-center gap-2">
                      <Flame size={14} className="text-rose-400 animate-pulse" />
                      <div>
                        <div className="text-[8px] font-black uppercase tracking-wider text-slate-400">Verified Stock</div>
                        <div className="text-xs font-black text-emerald-400">Fast Shipping</div>
                      </div>
                    </div>

                    {/* Main Image Banner Visual Showcase (Admin-Uploaded Images Only) */}
                    <div className="relative w-full h-[200px] sm:h-[240px] lg:h-[270px] flex items-center justify-center p-2">
                      {currentBanner?.images && currentBanner.images.length > 0 ? (
                        <div className="flex items-center justify-center gap-3 w-full h-full">
                          {currentBanner.images.slice(0, 3).map((imgUrl, i) => (
                            <img
                              key={i}
                              src={imgUrl}
                              alt={currentBanner.title || "Poster visual"}
                              className={`max-h-full object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-105 ${
                                i === 0 ? "z-10 scale-105" : "opacity-80 scale-95 hidden sm:block"
                              }`}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center rounded-sm bg-white/5 border border-white/10 backdrop-blur-md">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-500/30 to-indigo-500/30 border border-purple-400/30 flex items-center justify-center text-purple-300 mb-2.5">
                            <Sparkles size={28} />
                          </div>
                          <div className="text-xs font-black uppercase tracking-wider text-white">Curated Capsule Showcase</div>
                          <div className="text-[10.5px] font-medium text-slate-300 mt-0.5 max-w-xs">Verified authentic brands & exclusive catalog drops</div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            2. QUICK METRICS STRIP
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-3 sm:p-3.5 rounded-sm shadow-xs flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-sm bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/40 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <Layers size={18} />
            </div>
            <div>
              <span className="text-[9.5px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block">Live Capsules</span>
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-none mt-0.5 block">{collections.length} Curations</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-3 sm:p-3.5 rounded-sm shadow-xs flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-sm bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Package size={18} />
            </div>
            <div>
              <span className="text-[9.5px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block">Curated Products</span>
              <span className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400 leading-none mt-0.5 block">{totalProductCount > 0 ? `${totalProductCount}+` : "250+"} Items</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-3 sm:p-3.5 rounded-sm shadow-xs flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-sm bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Star size={18} className="fill-amber-400 text-amber-400" />
            </div>
            <div>
              <span className="text-[9.5px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block">Customer Rating</span>
              <span className="text-base sm:text-lg font-black text-amber-500 dark:text-amber-400 leading-none mt-0.5 block">4.9 ★ Rated</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-3 sm:p-3.5 rounded-sm shadow-xs flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-sm bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Truck size={18} />
            </div>
            <div>
              <span className="text-[9.5px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block">Dispatch Mode</span>
              <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 leading-none mt-0.5 block">Express Delivery</span>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            3. SEARCH, CATEGORIES & SORT TOOLBAR
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-3 sm:p-4 rounded-sm shadow-xs space-y-3">
          
          {/* Top Row: Search Input + Sorting */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Live Search Input */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 stroke-[2.5]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search collections by capsule name, style, or category..."
                className="w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500 transition duration-200"
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
            <div className="flex items-center gap-2 justify-between md:justify-end shrink-0">
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-sm">
                <ArrowUpDown size={12} className="text-slate-400 stroke-[2.5]" />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                >
                  <option value="popular">Most Popular</option>
                  <option value="items-high">Largest Catalog</option>
                  <option value="name-asc">Alphabetical (A → Z)</option>
                  <option value="name-desc">Alphabetical (Z → A)</option>
                </select>
              </div>

              <div className="text-xs font-extrabold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-sm shrink-0">
                {filteredCollections.length} Capsules
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
            {[
              { id: "all", label: "All Collections" },
              { id: "fashion", label: "Fashion & Wardrobe" },
              { id: "electronics", label: "Tech & Gadgets" },
              { id: "home", label: "Home & Living" },
              { id: "beauty", label: "Beauty & Glow" },
              { id: "sports", label: "Sports & Footwear" }
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => setSelectedFilter(pill.id)}
                className={`px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 border cursor-pointer rounded-sm ${
                  selectedFilter === pill.id
                    ? "bg-[#ff3f6c] text-white border-[#ff3f6c] shadow-xs"
                    : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            4. COLLECTIONS CARDS GRID SECTION
        ═══════════════════════════════════════════════════════════════════ */}
        {loading ? (
          <CollectionsSkeleton />
        ) : filteredCollections.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-sm bg-white dark:bg-slate-900 text-center space-y-3"
          >
            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 rounded-sm">
              <ShoppingBag size={28} />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide">No Matching Capsules Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold max-w-sm">
              We couldn't find any collection matching "<span className="text-slate-800 dark:text-white font-bold">{searchQuery}</span>". Try clearing your search or filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedFilter("all");
              }}
              className="px-5 py-2.5 bg-[#ff3f6c] hover:bg-[#e0355c] text-white text-xs font-black uppercase tracking-widest rounded-sm transition duration-200 border-none cursor-pointer mt-2"
            >
              Reset Filters
            </button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {paginatedCollections.map((col, i) => (
                <motion.div
                  key={col.slug || i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  whileHover={{ y: -3 }}
                  className={`group border p-5 flex flex-col justify-between transition-all duration-300 shadow-xs hover:shadow-md rounded-sm relative overflow-hidden ${col.colorClass}`}
                >
                  <div>
                    {/* Top Row: Category Tag Badge & Trending Indicator */}
                    <div className="flex justify-between items-center mb-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9.5px] font-black uppercase tracking-wider rounded-xs ${col.badgeColor}`}>
                        {React.createElement(col.badgeIcon, { size: 12 })}
                        <span>{col.categoryTag || col.badge}</span>
                      </span>

                      {col.trending && (
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-rose-500/10 text-[#ff3f6c] dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-xs">
                          <Flame size={11} className="fill-current animate-pulse" />
                          <span>Trending</span>
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div className="mb-3.5 text-left">
                      <h2
                        onClick={() => navigate(`/collections/${col.slug}`)}
                        className="text-lg sm:text-xl font-black text-slate-900 dark:text-white cursor-pointer hover:text-[#ff3f6c] dark:hover:text-[#ff3f6c] transition-colors tracking-tight uppercase"
                      >
                        {col.title}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1 line-clamp-2">
                        {col.subtitle}
                      </p>
                    </div>

                    {/* Main Collection Image (Admin configured / Product visual / Clean category card) */}
                    {col.image ? (
                      <div
                        onClick={() => navigate(`/collections/${col.slug}`)}
                        className="relative rounded-sm overflow-hidden aspect-[16/10] bg-slate-50 dark:bg-slate-950 p-3 mb-3.5 flex items-center justify-center border border-slate-200/80 dark:border-slate-800 cursor-pointer group/img"
                      >
                        <img
                          src={col.image}
                          alt={col.title}
                          loading="lazy"
                          className="max-h-[92%] max-w-[92%] object-contain transition-transform duration-500 group-hover/img:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </div>
                    ) : (
                      <div
                        onClick={() => navigate(`/collections/${col.slug}`)}
                        className="relative rounded-sm overflow-hidden aspect-[16/10] bg-slate-50 dark:bg-slate-950/80 p-4 mb-3.5 flex flex-col items-center justify-center border border-slate-200/80 dark:border-slate-800 cursor-pointer group/img text-center"
                      >
                        <div className="w-12 h-12 rounded-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-xs mb-2 transition-transform duration-300 group-hover/img:scale-110">
                          {React.createElement(col.badgeIcon, { size: 24 })}
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">{col.title}</span>
                        <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">Explore Capsule</span>
                      </div>
                    )}

                    {/* Featured Sample Products Mini Deck */}
                    {col.sampleProducts && col.sampleProducts.length > 0 && (
                      <div className="mb-3.5 bg-slate-50/80 dark:bg-slate-950 p-2 border border-slate-200/80 dark:border-slate-800 rounded-sm">
                        <span className="text-[8.5px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-1 text-left">
                          Featured in Capsule:
                        </span>
                        <div className="grid grid-cols-4 gap-1.5">
                          {col.sampleProducts.slice(0, 4).map((p, pIdx) => {
                            const pImg = p.images?.[0] || p.image;
                            const fullImgUrl = pImg ? (pImg.startsWith("http") ? pImg : `${backendUrl}/${pImg}`) : null;
                            return (
                              <div
                                key={p._id || pIdx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/product/${p._id}`);
                                }}
                                title={p.name}
                                className="aspect-square bg-white dark:bg-slate-900 p-1 border border-slate-200/80 dark:border-slate-800 hover:border-[#ff3f6c] cursor-pointer flex flex-col items-center justify-center transition duration-200 rounded-xs relative group/thumb shadow-2xs"
                              >
                                {fullImgUrl ? (
                                  <img
                                    src={fullImgUrl}
                                    alt={p.name}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <Package size={14} className="text-slate-400" />
                                )}
                                {p.price && (
                                  <div className="absolute bottom-0 inset-x-0 bg-slate-950/90 text-white text-[7.5px] font-black text-center py-0.5 truncate opacity-0 group-hover/thumb:opacity-100 transition duration-200">
                                    ₹{p.price}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-3.5 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex flex-col text-left">
                      <span className="text-[8.5px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Available</span>
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                        {col.countNum > 0 ? `${col.countNum}+ Items` : "12+ Items"}
                      </span>
                    </div>

                    <button
                      onClick={() => navigate(`/collections/${col.slug}`)}
                      className={`px-4 py-2 bg-gradient-to-r ${col.btnGradient} text-white font-black text-[10px] uppercase tracking-wider rounded-sm transition-all flex items-center gap-1.5 border-none cursor-pointer shadow-xs hover:shadow-md active:scale-98`}
                    >
                      <ShoppingBag size={12} className="stroke-[2.5]" />
                      <span>Shop Capsule</span>
                      <ArrowRight size={11} className="stroke-[3]" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200/80 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Showing <span className="text-slate-900 dark:text-white font-black">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-slate-900 dark:text-white font-black">{Math.min(currentPage * itemsPerPage, filteredCollections.length)}</span> of <span className="text-slate-900 dark:text-white font-black">{filteredCollections.length}</span> Collections
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="px-3.5 py-1.5 text-xs font-black uppercase tracking-wider bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition duration-200 flex items-center gap-1"
                  >
                    <ChevronLeft size={14} className="stroke-[3]" />
                    <span>Prev</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 text-xs font-black rounded-sm transition duration-200 cursor-pointer border ${
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
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    className="px-3.5 py-1.5 text-xs font-black uppercase tracking-wider bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition duration-200 flex items-center gap-1"
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
