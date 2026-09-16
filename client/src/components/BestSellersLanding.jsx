import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Sparkles, 
  Flame, 
  Zap, 
  TrendingUp, 
  Eye, 
  Clock, 
  Filter, 
  X, 
  Grid2X2, 
  Grid3X3, 
  LayoutGrid, 
  Search, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ShieldCheck,
  Award,
  Crown,
  Star,
  Trophy,
  CheckCircle2,
  ThumbsUp,
  ShoppingBag,
  Percent,
  Tag
} from "lucide-react";
import ProductCard from "../pages/ProductCard";
import { ProductGridSkeleton } from "./SkeletonLoader";
import { backendUrl } from "../config";
import { cachedGet } from "../utils/apiCache";

import heroImg from "../assets/trending_now_hero.webp";
import mensImg from "../assets/cat_mens_new.webp";
import womensImg from "../assets/cat_womens_new.webp";
import footwearImg from "../assets/cat_footwear_new.webp";
import electronicsImg from "../assets/cat_electronics.webp";
import jewelryImg from "../assets/cat_jewelry.webp";
import beautyImg from "../assets/cat_beauty.webp";
import bagsImg from "../assets/cat_bags_new.webp";
import accessoriesImg from "../assets/cat_accessories_new.webp";
import headwearImg from "../assets/cat_headwear_new.webp";

const BestSellersLanding = ({
  products = [],
  loading = false,
  navigate,
  meta,
  currentPage,
  itemsPerPage,
  setItemsPerPage,
  setCurrentPage,
  handlePageChange
}) => {
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState("all");
  const [sortBy, setSortBy] = useState("bestselling");
  const [gridCols, setGridCols] = useState(4);
  const [priceCap, setPriceCap] = useState("all");
  const [heroBanners, setHeroBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  // Fetch admin-managed dynamic hero banners
  useEffect(() => {
    cachedGet(`${backendUrl}/api/promo-banners/active?placement=best_sellers_hero`, {}, 60000)
      .then((res) => {
        if (res.data?.success) {
          const list = Array.isArray(res.data.banners) && res.data.banners.length > 0
            ? res.data.banners
            : (res.data.banner ? [res.data.banner] : []);
          setHeroBanners(list);
        }
      })
      .catch((err) => {
        console.warn("Could not load dynamic best sellers hero banners:", err);
      });
  }, []);

  // Compute active slides
  const slides = useMemo(() => {
    if (heroBanners.length > 0) return heroBanners;
    return [{
      _id: "default_best_sellers_hero",
      tagline: "ALL-TIME HALL OF FAME CAPSULE",
      title: "BEST SELLERS",
      subtitle: "CartNOW's most loved and highly re-ordered catalog items. Verified 5-star customer ratings, massive repeat demand, and all-time record breakers.",
      discountTag: "99.4% VERIFIED",
      ctaText: "Shop All Champions",
      linkUrl: "/catalog/collection/best-sellers",
      imageUrl: heroImg
    }];
  }, [heroBanners]);

  const totalSlides = slides.length;
  const currentBanner = slides[currentSlide % totalSlides] || slides[0];

  // Auto-advance slideshow every 5 seconds if more than one active banner
  useEffect(() => {
    if (totalSlides <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(timer);
  }, [totalSlides, isHovered]);

  const handlePrevSlide = (e) => {
    e?.stopPropagation();
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNextSlide = (e) => {
    e?.stopPropagation();
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  // Live Simulated Orders Counter for Social Proof
  const [recentOrdersCount, setRecentOrdersCount] = useState(142);
  const [liveShoppers, setLiveShoppers] = useState(3840);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveShoppers((prev) => {
        const delta = Math.floor(Math.random() * 15) - 7;
        return Math.max(3200, prev + delta);
      });
      setRecentOrdersCount((prev) => prev + (Math.random() > 0.6 ? 1 : 0));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const categories = [
    { id: "Men", label: "Men's Style", image: mensImg },
    { id: "Women", label: "Women's Fashion", image: womensImg },
    { id: "Footwear", label: "Footwear & Sneakers", image: footwearImg },
    { id: "Electronics", label: "Electronics & Tech", image: electronicsImg },
    { id: "Jewelry", label: "Jewelry & Watches", image: jewelryImg },
    { id: "Beauty", label: "Beauty & Wellness", image: beautyImg },
    { id: "Bags", label: "Bags & Backpacks", image: bagsImg },
    { id: "Accessories", label: "Accessories", image: accessoriesImg },
    { id: "Headwear", label: "Headwear & Caps", image: headwearImg }
  ];

  const duplicatedCategories = [...categories, ...categories, ...categories];

  // Dynamic product counts by category
  const categoryCounts = useMemo(() => {
    const counts = { All: products.length };
    products.forEach((p) => {
      const cat = (p.category || "").toLowerCase();
      const sub = (p.subCategory || "").toLowerCase();
      const name = (p.name || "").toLowerCase();
      const aud = (p.audience || "").toLowerCase();

      if (cat.includes("men") || sub.includes("men") || aud === "men") counts.Men = (counts.Men || 0) + 1;
      if (cat.includes("women") || sub.includes("women") || aud === "women") counts.Women = (counts.Women || 0) + 1;
      if (cat.includes("shoe") || cat.includes("footwear") || cat.includes("sneaker") || sub.includes("shoe")) counts.Footwear = (counts.Footwear || 0) + 1;
      if (cat.includes("electronics") || cat.includes("computer") || sub.includes("tech") || sub.includes("electronics")) counts.Electronics = (counts.Electronics || 0) + 1;
      if (cat.includes("jewel") || cat.includes("watch") || sub.includes("watch") || sub.includes("jewel")) counts.Jewelry = (counts.Jewelry || 0) + 1;
      if (cat.includes("beauty") || cat.includes("skin") || sub.includes("beauty") || sub.includes("skin")) counts.Beauty = (counts.Beauty || 0) + 1;
      if (cat.includes("bag") || sub.includes("bag") || name.includes("bag") || name.includes("backpack")) counts.Bags = (counts.Bags || 0) + 1;
      if (cat.includes("accessory") || sub.includes("accessory")) counts.Accessories = (counts.Accessories || 0) + 1;
      if (cat.includes("hat") || sub.includes("cap") || name.includes("cap") || name.includes("hat") || sub.includes("headwear")) counts.Headwear = (counts.Headwear || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filtering & Ranking Logic
  const processedProducts = useMemo(() => {
    let result = [...products];

    // 1. Category Filter
    if (selectedSubCategory !== "All") {
      const lowerSel = selectedSubCategory.toLowerCase();
      result = result.filter((p) => {
        const cat = (p.category || "").toLowerCase();
        const sub = (p.subCategory || "").toLowerCase();
        const name = (p.name || "").toLowerCase();

        if (lowerSel === "men") return cat.includes("men") || sub.includes("men") || (p.audience || "").toLowerCase() === "men";
        if (lowerSel === "women") return cat.includes("women") || sub.includes("women") || (p.audience || "").toLowerCase() === "women";
        if (lowerSel === "footwear") return cat.includes("shoe") || cat.includes("footwear") || cat.includes("sneaker") || sub.includes("shoe");
        if (lowerSel === "electronics") return cat.includes("electronics") || cat.includes("computer") || sub.includes("tech") || sub.includes("electronics");
        if (lowerSel === "jewelry") return cat.includes("jewel") || cat.includes("watch") || sub.includes("watch") || sub.includes("jewel");
        if (lowerSel === "beauty") return cat.includes("beauty") || cat.includes("skin") || sub.includes("beauty") || sub.includes("skin");
        if (lowerSel === "bags") return cat.includes("bag") || sub.includes("bag") || name.includes("bag") || name.includes("backpack");
        if (lowerSel === "accessories") return cat.includes("accessory") || sub.includes("accessory");
        if (lowerSel === "headwear") return cat.includes("hat") || sub.includes("cap") || name.includes("cap") || name.includes("hat") || sub.includes("headwear");
        return cat.includes(lowerSel) || sub.includes(lowerSel) || name.includes(lowerSel);
      });
    }

    // 2. Search Filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.brand || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q)
      );
    }

    // 3. Quick Filter Chips
    if (quickFilter === "fivestar") {
      result = result.filter((p) => {
        const r = p.averageRating || p.rating?.average || p.rating || 0;
        return r >= 4.5;
      });
    } else if (quickFilter === "highvolume") {
      result = result.filter((p) => p.isBestSeller || p.bestseller || (p.totalSold && p.totalSold >= 50));
    } else if (quickFilter === "discount") {
      result = result.filter((p) => p.originalPrice && p.originalPrice > p.price);
    } else if (quickFilter === "luxury") {
      result = result.filter((p) => p.price >= 2500 || (p.tags && p.tags.includes("luxury")));
    } else if (quickFilter === "under999") {
      result = result.filter((p) => p.price <= 999);
    }

    // 4. Price Cap Filter
    if (priceCap === "under500") {
      result = result.filter((p) => p.price <= 500);
    } else if (priceCap === "500-1500") {
      result = result.filter((p) => p.price >= 500 && p.price <= 1500);
    } else if (priceCap === "above1500") {
      result = result.filter((p) => p.price > 1500);
    }

    // 5. Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => {
        const rA = a.averageRating || a.rating?.average || a.rating || 0;
        const rB = b.averageRating || b.rating?.average || b.rating || 0;
        return rB - rA;
      });
    } else if (sortBy === "discount") {
      result.sort((a, b) => {
        const discA = a.originalPrice && a.originalPrice > a.price ? (a.originalPrice - a.price) / a.originalPrice : 0;
        const discB = b.originalPrice && b.originalPrice > b.price ? (b.originalPrice - b.price) / b.originalPrice : 0;
        return discB - discA;
      });
    } else {
      // Default: Best Selling rank score (isBestSeller flag + sold count + rating)
      result.sort((a, b) => {
        const scoreA = (a.isBestSeller || a.bestseller ? 100 : 0) +
                       (a.totalSold || 0) * 2 +
                       ((a.averageRating || a.rating?.average || a.rating || 4.5) * 10);
        const scoreB = (b.isBestSeller || b.bestseller ? 100 : 0) +
                       (b.totalSold || 0) * 2 +
                       ((b.averageRating || b.rating?.average || b.rating || 4.5) * 10);
        return scoreB - scoreA;
      });
    }

    return result;
  }, [products, selectedSubCategory, searchQuery, quickFilter, priceCap, sortBy]);

  // Extract Top 3 Champions for Podium
  const topPodium = useMemo(() => {
    return processedProducts.slice(0, 3);
  }, [processedProducts]);

  const totalPages = Math.max(1, Math.ceil(processedProducts.length / itemsPerPage));

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedProducts.slice(start, start + itemsPerPage);
  }, [processedProducts, currentPage, itemsPerPage]);

  const scrollToGrid = () => {
    const el = document.getElementById("bestsellers-grid");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const getGridColsClass = () => {
    if (gridCols === 2) return "grid-cols-1 sm:grid-cols-2";
    if (gridCols === 3) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
    return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 pb-20 font-sans text-left">
      
      {/* FULL WIDTH CONTAINER WITH RESPONSIVE PADDING */}
      <div className="w-full px-3 sm:px-6 lg:px-8 pt-2.5">
        
        {/* 1. EDITORIAL BEST SELLERS SPLIT HERO SECTION (50% LEFT TEXT / 50% RIGHT FULL IMAGE VIEWER) */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative w-full rounded-sm overflow-hidden bg-[#FAF7EE] dark:bg-stone-950 border border-amber-200/80 dark:border-amber-900/40 shadow-md flex flex-col lg:flex-row items-stretch min-h-[460px] max-h-[620px] mb-4 group"
        >
          {/* Left Half (50% Column): Warm Ivory Luxury Text Content */}
          <div className="w-full lg:w-1/2 p-6 sm:p-10 lg:p-12 flex flex-col justify-center relative z-10 bg-[#FAF7EE] dark:bg-stone-950 text-slate-900 dark:text-white transition-colors duration-300">
            
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentSlide % totalSlides}
                custom={direction}
                initial={{ opacity: 0, y: direction >= 0 ? 16 : -16, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: direction >= 0 ? -16 : 16, filter: "blur(4px)" }}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col justify-center"
              >
                {/* Crown Pill Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-amber-500/20 border border-amber-500/40 text-amber-900 dark:text-amber-300 text-xs font-black tracking-wider w-fit mb-3">
                  <Crown size={14} className="text-amber-600 dark:text-amber-400 fill-amber-500/30" />
                  <span>{currentBanner?.tagline || "ALL-TIME HALL OF FAME CAPSULE"}</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-[0.92] mb-3">
                  {currentBanner?.title ? (
                    currentBanner.title
                  ) : (
                    <>
                      BEST <br />
                      <span className="text-amber-600 dark:text-amber-400">
                        SELLERS
                      </span>
                    </>
                  )}
                </h1>

                <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed max-w-md">
                  {currentBanner?.subtitle || "CartNOW's most loved and highly re-ordered catalog items. Verified 5-star customer ratings, massive repeat demand, and all-time record breakers."}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* LIVE SOCIAL PROOF & METRICS CARD */}
            <div className="mt-5 p-3.5 rounded-sm bg-white/95 dark:bg-slate-900/90 border border-amber-200/90 dark:border-amber-900/50 max-w-xs sm:max-w-md shadow-xs">
              
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-1.5">
                <span className="text-amber-800 dark:text-amber-400 flex items-center gap-1 font-bold">
                  <Trophy size={11} className="text-amber-600 dark:text-amber-400" />
                  BUYER SATISFACTION SCORE
                </span>
                <span className="text-slate-900 dark:text-white font-mono font-bold">{currentBanner?.discountTag || "99.4% VERIFIED"}</span>
              </div>

              {/* Gold Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-xs overflow-hidden mb-2.5">
                <div className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 w-[99.4%]" />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span><strong className="text-slate-900 dark:text-white font-bold">{liveShoppers}</strong> browsing now</span>
                </div>
                <div className="flex items-center gap-1.5 text-right justify-end">
                  <Flame size={12} className="text-orange-500" />
                  <span><strong className="text-slate-900 dark:text-white font-bold">{recentOrdersCount}</strong> orders today</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (currentBanner?.linkUrl) {
                    if (currentBanner.linkUrl.startsWith("http")) window.location.href = currentBanner.linkUrl;
                    else navigate ? navigate(currentBanner.linkUrl) : scrollToGrid();
                  } else {
                    scrollToGrid();
                  }
                }}
                className="inline-flex items-center gap-2.5 bg-slate-950 hover:bg-slate-800 text-white dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-slate-950 text-xs sm:text-sm font-black uppercase tracking-wider px-7 py-3 rounded-sm transition-all duration-200 shadow-md cursor-pointer group/btn"
              >
                <span>{currentBanner?.ctaText || "Shop All Champions"}</span>
                <ArrowRight size={16} className="stroke-[2.5] transition-transform duration-200 group-hover/btn:translate-x-1" />
              </motion.button>

              {/* Slide Counter Dots if multiple active */}
              {totalSlides > 1 && (
                <div className="flex items-center gap-1.5 ml-2">
                  {slides.map((s, idx) => (
                    <motion.button
                      layout
                      key={s._id || idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDirection(idx > currentSlide % totalSlides ? 1 : -1);
                        setCurrentSlide(idx);
                      }}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        idx === currentSlide % totalSlides
                          ? "w-6 bg-amber-600 dark:bg-amber-400"
                          : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
                      }`}
                      title={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Half (50% Column): FULL IMAGE VIEW (Uncropped, Complete View with Motion Transition) */}
          <div className="w-full lg:w-1/2 relative h-full min-h-[340px] overflow-hidden bg-slate-950 flex items-center justify-center p-2 sm:p-4">
            {/* Ambient Blurred Backdrop with Crossfade */}
            <AnimatePresence mode="popLayout">
              <motion.img
                key={`ambient-${currentBanner?.imageUrl || currentBanner?.images?.[0] || currentSlide}`}
                src={currentBanner?.imageUrl || currentBanner?.images?.[0] || heroImg}
                alt=""
                aria-hidden="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 pointer-events-none select-none"
              />
            </AnimatePresence>

            {/* Sharp, Model Image with Directional Slide & Zoom */}
            <AnimatePresence mode="popLayout" custom={direction}>
              <motion.img
                key={currentBanner?.imageUrl || currentBanner?.images?.[0] || currentSlide}
                src={currentBanner?.imageUrl || currentBanner?.images?.[0] || heroImg}
                alt={currentBanner?.title || "Best Sellers Curated Capsule"}
                custom={direction}
                initial={{ 
                  opacity: 0, 
                  x: direction >= 0 ? 45 : -45, 
                  scale: 0.95,
                  filter: "blur(2px)"
                }}
                animate={{ 
                  opacity: 1, 
                  x: 0, 
                  scale: 1,
                  filter: "blur(0px)"
                }}
                exit={{ 
                  opacity: 0, 
                  x: direction >= 0 ? -45 : 45, 
                  scale: 0.95,
                  filter: "blur(2px)"
                }}
                transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 max-h-full max-w-full w-auto h-auto object-contain object-center select-none contrast-[105%] group-hover:scale-[1.02] drop-shadow-2xl"
              />
            </AnimatePresence>

            {/* Top Right Gold Banner Ribbon */}
            <div className="absolute top-4 right-4 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xs shadow-lg flex items-center gap-1.5 z-20">
              <Star size={12} className="fill-slate-950" />
              <span>{currentBanner?.discountTag || "RANK #1 SELECTION"}</span>
            </div>

            {/* Floating Glass Circular Stamp (Bottom Right) */}
            <div className="hidden sm:flex absolute bottom-6 right-6 sm:bottom-8 sm:right-8 w-26 h-26 sm:w-30 sm:h-30 rounded-full bg-slate-950/85 backdrop-blur-md border border-amber-500/50 items-center justify-center shadow-2xl hover:scale-105 transition-transform cursor-pointer z-20">
              <div className="relative w-full h-full flex items-center justify-center">
                <svg className="w-full h-full animate-[spin_25s_linear_infinite]" viewBox="0 0 100 100">
                  <path id="bestSellerStampPath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
                  <text className="text-[7.5px] font-black uppercase tracking-[0.24em] fill-amber-400">
                    <textPath href="#bestSellerStampPath" startOffset="0%">
                      ★ BEST SELLERS • TOP RATED • HALL OF FAME
                    </textPath>
                  </text>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Crown size={20} className="text-amber-400 fill-amber-400/20" />
                </div>
              </div>
            </div>

            {/* Slideshow Arrow Navigation on Image */}
            {totalSlides > 1 && (
              <div className="absolute top-4 left-4 flex items-center gap-1.5 z-20">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handlePrevSlide}
                  className="w-8 h-8 rounded-full bg-slate-950/80 hover:bg-slate-950 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-md transition cursor-pointer"
                  title="Previous banner"
                >
                  <ChevronLeft size={16} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleNextSlide}
                  className="w-8 h-8 rounded-full bg-slate-950/80 hover:bg-slate-950 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-md transition cursor-pointer"
                  title="Next banner"
                >
                  <ChevronRight size={16} />
                </motion.button>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/80 text-white backdrop-blur-md border border-white/10 ml-1">
                  {(currentSlide % totalSlides) + 1} / {totalSlides}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 2. TOP 3 BEST SELLER PODIUM / CHAMPIONS SPOTLIGHT */}
        {topPodium.length >= 3 && (
          <div className="mb-6 p-4 sm:p-5 rounded-sm bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80 dark:border-amber-900/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-sm bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                  <Trophy size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">
                    Hall of Fame • Top 3 Champions
                  </h3>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    The highest rated & most purchased items across the entire catalog this month.
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-flex text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm bg-amber-500/20 text-amber-900 dark:text-amber-300">
                VERIFIED TOP SELLERS
              </span>
            </div>

            {/* Podium Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {topPodium.map((item, idx) => {
                const rankConfig = [
                  { label: "🥇 #1 CHAMPION", bg: "bg-amber-500 text-slate-950 border-amber-600", medal: "border-amber-400" },
                  { label: "🥈 #2 CUSTOMER FAVORITE", bg: "bg-slate-300 text-slate-950 border-slate-400", medal: "border-slate-300" },
                  { label: "🥉 #3 MOST RE-ORDERED", bg: "bg-amber-700 text-white border-amber-800", medal: "border-amber-700" }
                ][idx] || { label: `#${idx + 1} TOP PICK`, bg: "bg-slate-900 text-white", medal: "border-slate-400" };

                const rating = item.averageRating || item.rating?.average || item.rating || 4.8;
                const imageSrc = (item.images && item.images[0]) || (item.image && item.image[0]) || item.image || heroImg;

                return (
                  <div
                    key={item._id}
                    onClick={() => navigate(`/product/${item._id}`)}
                    className="relative group bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 p-3 flex gap-3.5 items-center hover:border-amber-500/60 dark:hover:border-amber-500/60 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    {/* Rank Badge */}
                    <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-xs text-[9px] font-black uppercase tracking-wider ${rankConfig.bg} shadow-xs z-10`}>
                      {rankConfig.label}
                    </span>

                    {/* Image */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xs overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 relative">
                      <img
                        src={imageSrc}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 pr-12">
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block truncate">
                        {item.brand || item.category || "CartNOW"}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {item.name}
                      </h4>
                      
                      {/* Rating & Sold count */}
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                          <Star size={11} className="fill-amber-500" />
                          {Number(rating).toFixed(1)}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {item.totalSold ? `${item.totalSold}+ sold` : "High Demand"}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          ₹{item.price?.toLocaleString()}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-[10px] text-slate-400 line-through">
                            ₹{item.originalPrice?.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. FRAMELESS CATEGORY TICKER */}
        <div className="mb-5 space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">
                Best Sellers by Category ({categories.length} Categories)
              </h3>
            </div>

            {selectedSubCategory !== "All" && (
              <button
                onClick={() => setSelectedSubCategory("All")}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none"
              >
                <X size={13} /> Clear Filter
              </button>
            )}
          </div>

          {/* INFINITE MARQUEE TICKER */}
          <div className="w-full overflow-hidden relative py-2">
            <div className="absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-slate-50/90 dark:from-slate-950 to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-slate-50/90 dark:from-slate-950 to-transparent pointer-events-none" />

            <div 
              className="flex items-center gap-4 w-max category-marquee-track cursor-pointer"
              style={{ animation: "marquee-left-to-right 35s linear infinite" }}
            >
              {duplicatedCategories.map((cat, idx) => {
                const isActive = selectedSubCategory === cat.id;
                const count = categoryCounts[cat.id] || 0;

                return (
                  <button
                    key={`${cat.id}-${idx}`}
                    onClick={() => {
                      setSelectedSubCategory(cat.id);
                      setCurrentPage(1);
                    }}
                    style={{ animationDelay: `${(idx % categories.length) * 40}ms` }}
                    className={`group relative w-20 h-24 sm:w-24 sm:h-28 rounded-sm overflow-hidden border transition-all duration-300 cursor-pointer shrink-0 text-left animate-slide-from-top ${
                      isActive
                        ? "border-2 border-amber-500 shadow-lg scale-105 ring-2 ring-amber-400/40"
                        : "border-slate-200/90 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-md hover:scale-102"
                    }`}
                  >
                    {/* Background Image */}
                    <img 
                      src={cat.image} 
                      alt={cat.label} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />

                    {/* Active State Badge */}
                    {isActive && (
                      <div className="absolute top-1 right-1 px-1 py-0.2 rounded-xs bg-amber-400 text-slate-950 text-[7px] font-black uppercase tracking-wider shadow-md z-20 flex items-center gap-0.5">
                        <span className="w-1 h-1 rounded-full bg-slate-950 animate-ping" />
                        <span>ACTIVE</span>
                      </div>
                    )}

                    {/* Overlay Text */}
                    <div className="absolute bottom-0 left-0 right-0 p-1.5 z-20 text-white flex flex-col justify-end">
                      <h4 className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider leading-tight text-white drop-shadow-md truncate">
                        {cat.label}
                      </h4>
                      <span className="text-[8px] font-bold text-amber-300 block mt-0.5 drop-shadow-xs">
                        {count} {count === 1 ? "Item" : "Items"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. INTERACTIVE STICKY CONTROL TOOLBAR */}
        <div id="bestsellers-grid" className="sticky top-14 sm:top-16 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-sm p-2.5 sm:p-3 mb-6 shadow-md transition-all">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
            
            {/* Left Section: Title + Item Count + Quick Filter Chips */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-0.5">
              <div className="flex items-center gap-2 shrink-0 border-r border-slate-200 dark:border-slate-800 pr-3">
                <h2 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Crown size={14} className="text-amber-500" />
                  Best Sellers
                </h2>
                <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-sm uppercase tracking-wider font-mono">
                  {processedProducts.length} Items
                </span>
              </div>

              {/* Quick Filter Chips */}
              <div className="flex items-center gap-1.5 shrink-0">
                {[
                  { id: "all", label: "All Best Sellers" },
                  { id: "fivestar", label: "👑 5.0★ Top Rated" },
                  { id: "highvolume", label: "🔥 High Velocity" },
                  { id: "discount", label: "⚡ Mega Savings" },
                  { id: "under999", label: "🏷️ Under ₹999" },
                  { id: "luxury", label: "💎 Luxury Picks" }
                ].map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => {
                      setQuickFilter(chip.id);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1 text-[11px] font-semibold rounded-sm transition-all duration-200 cursor-pointer shrink-0 border ${
                      quickFilter === chip.id
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs"
                        : "bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-700/50 hover:bg-slate-200/80 dark:hover:bg-slate-700"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Section: Search, Price Filter, Sort Dropdown & View Density */}
            <div className="flex items-center justify-between lg:justify-end gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-slate-800">
              
              {/* Search Field */}
              <div className="relative w-full sm:w-52 md:w-60">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search in best sellers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1 text-[11px] bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white border-none bg-transparent cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-slate-900 dark:text-white text-[11px] font-semibold px-2.5 py-1 rounded-sm focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer shadow-xs"
                >
                  <option value="bestselling">Rank: Best Selling First</option>
                  <option value="rating">Highest Rating First</option>
                  <option value="discount">Biggest Discount %</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>

              {/* Grid Columns Density Switcher */}
              <div className="hidden sm:flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-2">
                <button
                  onClick={() => setGridCols(2)}
                  title="2 Columns View"
                  className={`p-1 rounded-sm border transition-all cursor-pointer ${
                    gridCols === 2
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs"
                      : "bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 border-slate-200/60 dark:border-slate-700/50 hover:border-slate-400"
                  }`}
                >
                  <Grid2X2 size={13} />
                </button>

                <button
                  onClick={() => setGridCols(3)}
                  title="3 Columns View"
                  className={`p-1 rounded-sm border transition-all cursor-pointer ${
                    gridCols === 3
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs"
                      : "bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 border-slate-200/60 dark:border-slate-700/50 hover:border-slate-400"
                  }`}
                >
                  <Grid3X3 size={13} />
                </button>

                <button
                  onClick={() => setGridCols(4)}
                  title="4 Columns View"
                  className={`p-1 rounded-sm border transition-all cursor-pointer ${
                    gridCols === 4
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs"
                      : "bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 border-slate-200/60 dark:border-slate-700/50 hover:border-slate-400"
                  }`}
                >
                  <LayoutGrid size={13} />
                </button>
              </div>

            </div>

          </div>

        </div>

        {/* 5. PRODUCT GRID SECTION */}
        {loading ? (
          <ProductGridSkeleton count={itemsPerPage} />
        ) : processedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 border border-slate-200/80 dark:border-slate-800 rounded-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-center animate-fade-in my-6 shadow-xs">
            <Trophy size={36} className="text-amber-400 mb-2 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Best Sellers Match Your Active Filters</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-1 leading-normal">
              We couldn't find any products in the Hall of Fame matching your current search or category selections.
            </p>
            <button
              onClick={() => {
                setSelectedSubCategory("All");
                setSearchQuery("");
                setQuickFilter("all");
                setPriceCap("all");
              }}
              className="mt-6 px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-sm cursor-pointer hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-xs"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <>
            <div className={`grid ${getGridColsClass()} gap-5 animate-fade-in`}>
              {paginatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Showing <span className="font-bold text-slate-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span>–
                  <span className="font-bold text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, processedProducts.length)}</span> of{" "}
                  <span className="font-bold text-slate-900 dark:text-white">{processedProducts.length}</span> best selling products
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(1)}
                    title="First Page"
                    className="p-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all shadow-xs"
                  >
                    <ChevronsLeft size={15} className="stroke-[2.5]" />
                  </button>

                  <button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    title="Previous Page"
                    className="p-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all shadow-xs"
                  >
                    <ChevronLeft size={15} className="stroke-[2.5]" />
                  </button>

                  <span className="px-3.5 py-1.5 rounded-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white shadow-xs">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    title="Next Page"
                    className="p-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all shadow-xs"
                  >
                    <ChevronRight size={15} className="stroke-[2.5]" />
                  </button>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    title="Last Page"
                    className="p-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all shadow-xs"
                  >
                    <ChevronsRight size={15} className="stroke-[2.5]" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* 6. TRUST & VERIFIED GUARANTEE STRIP */}
        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-3 border-t border-slate-200/80 dark:border-slate-800 pt-8">
          <div className="p-4 rounded-sm bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-sm bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Trophy size={16} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Top 1% Hall of Fame
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Selected strictly based on real customer review scores & verified volume.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-sm bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-sm bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={16} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                100% Genuine Quality
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Direct from verified manufacturers with full warranty coverage.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-sm bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-sm bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Zap size={16} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Fast Priority Dispatch
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Best sellers are pre-packaged in regional warehouses for same-day dispatch.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-sm bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-sm bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                7-Day Hassle-Free Returns
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Instant door-step pickup and fast refund if not 100% satisfied.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BestSellersLanding;
