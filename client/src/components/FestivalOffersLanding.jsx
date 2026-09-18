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
  Tag,
  Gift,
  Copy,
  Check,
  Timer,
  Calculator,
  Coins,
  BadgePercent,
  Sliders,
  ArrowUp
} from "lucide-react";
import ProductCard from "../pages/ProductCard";
import { ProductGridSkeleton } from "./SkeletonLoader";
import { toast } from "react-toastify";
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

const FestivalOffersLanding = ({
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
  const [sortBy, setSortBy] = useState("discount");
  const [gridCols, setGridCols] = useState(4);
  const [copiedCode, setCopiedCode] = useState(null);
  const [heroBanners, setHeroBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  // Interactive Budget & Savings Explorer State
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [userBudget, setUserBudget] = useState(5000);
  const [activeBudgetCap, setActiveBudgetCap] = useState(null);

  // Scroll to top button visibility
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch admin-managed dynamic hero banners
  useEffect(() => {
    cachedGet(`${backendUrl}/api/promo-banners/active?placement=festival_offers_hero`, {}, 60000)
      .then((res) => {
        if (res.data?.success) {
          const list = Array.isArray(res.data.banners) && res.data.banners.length > 0
            ? res.data.banners
            : (res.data.banner ? [res.data.banner] : []);
          setHeroBanners(list);
        }
      })
      .catch((err) => {
        console.warn("Could not load dynamic festival offers hero banners:", err);
      });
  }, []);

  // Compute active slides
  const slides = useMemo(() => {
    if (heroBanners.length > 0) return heroBanners;
    return [{
      _id: "default_festival_offers_hero",
      tagline: "GRAND FESTIVAL SPECIAL • UP TO 70% OFF",
      title: "FESTIVAL OFFERS",
      subtitle: "Unwrap the season's deepest discounts. Handpicked festive fashion, flagship electronics, home makeovers, and luxury gift boxes.",
      discountTag: "88% DEALS CLAIMED",
      ctaText: "Explore Mega Deals",
      linkUrl: "/catalog/collection/festival-offers",
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

  // Live Countdown Timer (Festival Gala Ends In 3 Days)
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 14,
    minutes: 42,
    seconds: 30
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Copy voucher coupon code to clipboard
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const categories = [
    { id: "Fashion", label: "Festive Apparel", image: womensImg },
    { id: "Electronics", label: "Electronics & Audio", image: electronicsImg },
    { id: "Jewelry", label: "Jewelry & Chronos", image: jewelryImg },
    { id: "Footwear", label: "Footwear & Shoes", image: footwearImg },
    { id: "Beauty", label: "Beauty & Fragrances", image: beautyImg },
    { id: "Men", label: "Men's Ethnic & Casuals", image: mensImg },
    { id: "Bags", label: "Handbags & Luggage", image: bagsImg },
    { id: "Accessories", label: "Festive Accessories", image: accessoriesImg },
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

      if (cat.includes("fashion") || cat.includes("women") || cat.includes("men") || sub.includes("wear")) counts.Fashion = (counts.Fashion || 0) + 1;
      if (cat.includes("electronics") || cat.includes("computer") || sub.includes("tech") || sub.includes("electronics")) counts.Electronics = (counts.Electronics || 0) + 1;
      if (cat.includes("jewel") || cat.includes("watch") || sub.includes("watch") || sub.includes("jewel")) counts.Jewelry = (counts.Jewelry || 0) + 1;
      if (cat.includes("shoe") || cat.includes("footwear") || cat.includes("sneaker") || sub.includes("shoe")) counts.Footwear = (counts.Footwear || 0) + 1;
      if (cat.includes("beauty") || cat.includes("skin") || sub.includes("beauty") || sub.includes("skin")) counts.Beauty = (counts.Beauty || 0) + 1;
      if (cat.includes("men") || sub.includes("men") || aud === "men") counts.Men = (counts.Men || 0) + 1;
      if (cat.includes("bag") || sub.includes("bag") || name.includes("bag") || name.includes("backpack")) counts.Bags = (counts.Bags || 0) + 1;
      if (cat.includes("accessory") || sub.includes("accessory")) counts.Accessories = (counts.Accessories || 0) + 1;
      if (cat.includes("hat") || sub.includes("cap") || name.includes("cap") || name.includes("hat") || sub.includes("headwear")) counts.Headwear = (counts.Headwear || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filtering & Sorting Logic
  const processedProducts = useMemo(() => {
    let result = [...products];

    // 0. Active Budget Slider Filter
    if (activeBudgetCap !== null) {
      result = result.filter((p) => p.price <= activeBudgetCap);
    }

    // 1. Category Filter
    if (selectedSubCategory !== "All") {
      const lowerSel = selectedSubCategory.toLowerCase();
      result = result.filter((p) => {
        const cat = (p.category || "").toLowerCase();
        const sub = (p.subCategory || "").toLowerCase();
        const name = (p.name || "").toLowerCase();

        if (lowerSel === "fashion") return cat.includes("fashion") || cat.includes("women") || cat.includes("men") || sub.includes("wear");
        if (lowerSel === "electronics") return cat.includes("electronics") || cat.includes("computer") || sub.includes("tech") || sub.includes("electronics");
        if (lowerSel === "jewelry") return cat.includes("jewel") || cat.includes("watch") || sub.includes("watch") || sub.includes("jewel");
        if (lowerSel === "footwear") return cat.includes("shoe") || cat.includes("footwear") || cat.includes("sneaker") || sub.includes("shoe");
        if (lowerSel === "beauty") return cat.includes("beauty") || cat.includes("skin") || sub.includes("beauty") || sub.includes("skin");
        if (lowerSel === "men") return cat.includes("men") || sub.includes("men") || (p.audience || "").toLowerCase() === "men";
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
    if (quickFilter === "halfprice") {
      result = result.filter((p) => {
        if (!p.originalPrice || p.originalPrice <= p.price) return false;
        const discPct = ((p.originalPrice - p.price) / p.originalPrice) * 100;
        return discPct >= 40;
      });
    } else if (quickFilter === "under999") {
      result = result.filter((p) => p.price <= 999);
    } else if (quickFilter === "flash") {
      result = result.filter((p) => p.isBestSeller || (p.originalPrice && p.originalPrice > p.price));
    } else if (quickFilter === "toprated") {
      result = result.filter((p) => {
        const r = p.averageRating || p.rating?.average || p.rating || 0;
        return r >= 4.5;
      });
    } else if (quickFilter === "luxury") {
      result = result.filter((p) => p.price >= 2000);
    }

    // 4. Sorting Logic
    if (sortBy === "discount") {
      // Biggest discount %
      result.sort((a, b) => {
        const discA = a.originalPrice && a.originalPrice > a.price ? (a.originalPrice - a.price) / a.originalPrice : 0;
        const discB = b.originalPrice && b.originalPrice > b.price ? (b.originalPrice - b.price) / b.originalPrice : 0;
        return discB - discA;
      });
    } else if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "savings") {
      // Absolute currency savings
      result.sort((a, b) => {
        const savA = (a.originalPrice || a.price) - a.price;
        const savB = (b.originalPrice || b.price) - b.price;
        return savB - savA;
      });
    } else if (sortBy === "rating") {
      result.sort((a, b) => {
        const rA = a.averageRating || a.rating?.average || a.rating || 0;
        const rB = b.averageRating || b.rating?.average || b.rating || 0;
        return rB - rA;
      });
    } else {
      // Default: Popularity & discount weight
      result.sort((a, b) => {
        const savA = (a.originalPrice || a.price) - a.price;
        const savB = (b.originalPrice || b.price) - b.price;
        return savB - savA;
      });
    }

    return result;
  }, [products, selectedSubCategory, searchQuery, quickFilter, sortBy, activeBudgetCap]);

  // Extract Top 3 Blockbuster Savings Deals
  const topBlockbusters = useMemo(() => {
    return processedProducts.slice(0, 3);
  }, [processedProducts]);

  const totalPages = Math.max(1, Math.ceil(processedProducts.length / itemsPerPage));

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedProducts.slice(start, start + itemsPerPage);
  }, [processedProducts, currentPage, itemsPerPage]);

  const scrollToGrid = () => {
    const el = document.getElementById("festival-grid");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const getGridColsClass = () => {
    if (gridCols === 2) return "grid-cols-1 sm:grid-cols-2";
    if (gridCols === 3) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
    return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
  };

  // Savings Calculator Computed Values
  const estimatedCashback = Math.round(userBudget * 0.1);
  const estimatedCoupon = userBudget >= 2500 ? 500 : (userBudget >= 1000 ? 150 : 50);
  const packagingValue = 249;
  const totalEstimatedSavings = estimatedCashback + estimatedCoupon + packagingValue;

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 pb-20 font-sans text-left">
      
      {/* FULL WIDTH CONTAINER WITH RESPONSIVE PADDING */}
      <div className="w-full px-3 sm:px-6 lg:px-8 pt-2.5">
        
        {/* 1. EDITORIAL FESTIVAL OFFERS SPLIT HERO SECTION (50% LEFT TEXT / 50% RIGHT FULL IMAGE VIEWER) */}
        <div 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative w-full rounded-sm overflow-hidden bg-[#FFF8F6] dark:bg-stone-950 border border-rose-200/80 dark:border-rose-900/40 shadow-md flex flex-col lg:flex-row items-stretch min-h-[460px] max-h-[620px] mb-4 group"
        >
          {/* Left Half (50% Column): Warm Festive Rose Luxury Text Content */}
          <div className="w-full lg:w-1/2 p-6 sm:p-10 lg:p-12 flex flex-col justify-center relative z-10 bg-[#FFF8F6] dark:bg-stone-950 text-slate-900 dark:text-white transition-colors duration-300">
            
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
                {/* Festival Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-rose-500/15 border border-rose-500/35 text-rose-900 dark:text-rose-300 text-xs font-black tracking-wider w-fit mb-3">
                  <Sparkles size={14} className="text-rose-600 dark:text-rose-400" />
                  <span>{currentBanner?.tagline || "GRAND FESTIVAL SPECIAL • UP TO 70% OFF"}</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-[0.92] mb-3">
                  {currentBanner?.title ? (
                    currentBanner.title
                  ) : (
                    <>
                      FESTIVAL <br />
                      <span className="text-rose-600 dark:text-rose-400">
                        OFFERS
                      </span>
                    </>
                  )}
                </h1>

                <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed max-w-md">
                  {currentBanner?.subtitle || "Unwrap the season's deepest discounts. Handpicked festive fashion, flagship electronics, home makeovers, and luxury gift boxes."}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* LIVE FESTIVAL TIMER & DEALS CLAIMED GAUGE */}
            <div className="mt-5 p-3.5 rounded-sm bg-white/95 dark:bg-slate-900/90 border border-rose-200/90 dark:border-rose-900/50 max-w-xs sm:max-w-md shadow-xs">
              
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-1.5">
                <span className="text-rose-800 dark:text-rose-400 flex items-center gap-1 font-bold">
                  <Timer size={11} className="text-rose-600 dark:text-rose-400 animate-spin" style={{ animationDuration: '6s' }} />
                  MEGA SALE ENDS IN
                </span>
                <span className="text-rose-600 dark:text-rose-400 font-bold">{currentBanner?.discountTag || "88% DEALS CLAIMED"}</span>
              </div>

              {/* Countdown Digits */}
              <div className="flex items-center gap-1.5 text-xs sm:text-base font-black font-mono text-slate-900 dark:text-white mb-2.5">
                <span className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-xs">{String(timeLeft.days).padStart(2, '0')}d</span>
                <span>:</span>
                <span className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-xs">{String(timeLeft.hours).padStart(2, '0')}h</span>
                <span>:</span>
                <span className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-xs">{String(timeLeft.minutes).padStart(2, '0')}m</span>
                <span>:</span>
                <span className="bg-rose-600 text-white px-2 py-0.5 rounded-xs">{String(timeLeft.seconds).padStart(2, '0')}s</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-xs overflow-hidden mb-2">
                <div className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 animate-pulse w-[88%]" />
              </div>

              <div className="flex items-center justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 size={12} /> Instant Bank 10% Cashback
                </span>
                <span className="text-slate-900 dark:text-white font-bold">Free Gift Packaging</span>
              </div>
            </div>

            {/* Slide Counter Dots if multiple active */}
            {totalSlides > 1 && (
              <div className="mt-5 flex items-center gap-1.5">
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
                        ? "w-6 bg-rose-600 dark:bg-rose-400"
                        : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
                    }`}
                    title={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Half (50% Column): FULL IMAGE VIEW (Uncropped, Complete View with Motion Transition) */}
          <div className="w-full lg:w-1/2 relative min-h-[380px] sm:min-h-[440px] lg:min-h-[460px] overflow-hidden bg-slate-950 flex items-end justify-center">
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

            {/* Complete Uncropped Image Container Touching Base */}
            <div className="absolute inset-0 flex items-end justify-center pointer-events-none z-10 pt-2 px-2 sm:px-4 pb-0">
              <AnimatePresence mode="popLayout" custom={direction}>
                <motion.img
                  key={currentBanner?.imageUrl || currentBanner?.images?.[0] || currentSlide}
                  src={currentBanner?.imageUrl || currentBanner?.images?.[0] || heroImg}
                  alt={currentBanner?.title || "Festival Mega Offers"}
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
                  className="w-auto h-full max-h-full max-w-full object-contain object-bottom select-none contrast-[105%] group-hover:scale-[1.02] drop-shadow-2xl transition-transform duration-300"
                />
              </AnimatePresence>
            </div>

            {/* Top Right Festival Discount Ribbon */}
            <div className="absolute top-4 right-4 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xs shadow-lg flex items-center gap-1.5 z-20">
              <Percent size={12} className="stroke-[3]" />
              <span>{currentBanner?.discountTag || "MIN 30% - 70% OFF"}</span>
            </div>

            {/* Floating Glass Circular Stamp (Bottom Right) */}
            <div className="hidden sm:flex absolute bottom-6 right-6 sm:bottom-8 sm:right-8 w-26 h-26 sm:w-30 sm:h-30 rounded-full bg-slate-950/85 backdrop-blur-md border border-rose-500/50 items-center justify-center shadow-2xl hover:scale-105 transition-transform cursor-pointer z-20">
              <div className="relative w-full h-full flex items-center justify-center">
                <svg className="w-full h-full animate-[spin_25s_linear_infinite]" viewBox="0 0 100 100">
                  <path id="festiveStampPath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
                  <text className="text-[7.5px] font-black uppercase tracking-[0.24em] fill-rose-400">
                    <textPath href="#festiveStampPath" startOffset="0%">
                      ★ FESTIVAL MEGA SALE • SPECIAL DEALS • SAVE BIG
                    </textPath>
                  </text>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Gift size={20} className="text-rose-400" />
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

        {/* 2. UNIFIED FESTIVAL SAVINGS & BLOCKBUSTER OFFERS HUB */}
        <div className="mb-6 rounded-sm bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/30 shadow-2xs overflow-hidden">
          
          {/* Section A: 3 Interactive Coupon Vouchers */}
          <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-slate-100 dark:border-slate-800">
            {[
              {
                code: "FESTIVE10",
                title: "Flat 10% Extra Off",
                desc: "On all electronics & appliances above ₹1,999",
                tag: "NO MAX CAP",
                categoryFilter: "Electronics"
              },
              {
                code: "FESTIVE500",
                title: "Instant ₹500 Flat Off",
                desc: "On festive apparel & fashion above ₹2,499",
                tag: "BESTSELLER CODE",
                categoryFilter: "Fashion"
              },
              {
                code: "FREESHIP",
                title: "Express 0₹ Free Delivery",
                desc: "Plus complimentary festive gift packing box",
                tag: "AUTO-APPLIED",
                categoryFilter: null
              }
            ].map((voucher) => (
              <div
                key={voucher.code}
                onClick={() => handleCopyCode(voucher.code)}
                className="p-3 rounded-xs bg-slate-50/70 dark:bg-slate-950/60 border border-rose-200/60 dark:border-rose-900/30 flex items-center justify-between gap-3 hover:border-rose-500 transition-all cursor-pointer group"
              >
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 block font-mono">
                    {voucher.tag}
                  </span>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
                    {voucher.title}
                  </h4>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {voucher.desc}
                  </p>
                  {voucher.categoryFilter && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSubCategory(voucher.categoryFilter);
                        setCurrentPage(1);
                        scrollToGrid();
                      }}
                      className="mt-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
                    >
                      <span>Filter {voucher.categoryFilter}</span>
                      <ArrowRight size={10} />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  className={`px-2.5 py-1.5 rounded-xs border font-mono font-bold text-xs flex items-center gap-1 transition-all shrink-0 ${
                    copiedCode === voucher.code
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 group-hover:bg-rose-600 group-hover:text-white"
                  }`}
                >
                  {copiedCode === voucher.code ? (
                    <>
                      <Check size={12} className="stroke-[3]" />
                      <span>COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>{voucher.code}</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Section B: Festive Savings & Budget Explorer Bar */}
          <div className="p-3 sm:p-4 bg-slate-50/40 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xs bg-rose-600 text-white flex items-center justify-center font-bold shrink-0">
                  <Calculator size={14} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Festive Savings & Budget Explorer
                    </h3>
                    <span className="text-[8.5px] font-extrabold px-1.5 py-0.2 rounded-xs bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40">
                      CALCULATOR
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    Slide your shopping budget to preview savings and 1-click filter deals.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
                className="self-start sm:self-auto text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2.5 py-1 rounded-xs border border-rose-200 dark:border-rose-800/50 transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Sliders size={12} />
                <span>{isCalculatorOpen ? "Hide Explorer" : "Open Budget Explorer"}</span>
              </button>
            </div>

            {/* Interactive Calculator Body */}
            {isCalculatorOpen && (
              <div className="pt-3 mt-3 border-t border-slate-200/70 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center animate-fadeIn">
                {/* Left Column: Budget Slider & Quick Caps */}
                <div className="lg:col-span-7 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Shopping Budget:
                    </span>
                    <span className="text-sm font-black text-rose-600 dark:text-rose-400 font-mono">
                      ₹{userBudget.toLocaleString()}
                    </span>
                  </div>

                  {/* Range Slider */}
                  <input
                    type="range"
                    min="1000"
                    max="50000"
                    step="500"
                    value={userBudget}
                    onChange={(e) => setUserBudget(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-xs appearance-none cursor-pointer accent-rose-600"
                  />

                  {/* Quick Budget Preset Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {[2000, 5000, 10000, 20000, 35000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setUserBudget(amt)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-xs border transition cursor-pointer ${
                          userBudget === amt
                            ? "bg-rose-600 text-white border-rose-600"
                            : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-400"
                        }`}
                      >
                        ₹{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Column: Estimated Total Savings Breakdown */}
                <div className="lg:col-span-5 p-2.5 rounded-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">10% Bank Cashback:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">+₹{estimatedCashback.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Voucher Discount:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">+₹{estimatedCoupon.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Free Gift Packaging:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">+₹{packagingValue}</span>
                  </div>
                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-slate-900 dark:text-white">Estimated Savings:</span>
                    <span className="text-xs font-black text-rose-600 dark:text-rose-400 font-mono">
                      ₹{totalEstimatedSavings.toLocaleString()}
                    </span>
                  </div>

                  <div className="pt-1 flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setActiveBudgetCap(userBudget);
                        setCurrentPage(1);
                        scrollToGrid();
                        toast.info(`Showing festival offers under ₹${userBudget.toLocaleString()}`);
                      }}
                      className="flex-1 py-1 px-2.5 rounded-xs bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <span>Filter Deals Under ₹{userBudget.toLocaleString()}</span>
                      <ArrowRight size={11} />
                    </button>
                    {activeBudgetCap !== null && (
                      <button
                        onClick={() => setActiveBudgetCap(null)}
                        title="Clear budget filter"
                        className="p-1 rounded-xs bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-100 hover:text-rose-600 transition cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section C: Top Blockbuster Deals of the Day */}
          {topBlockbusters.length >= 3 && (
            <div className="p-3 sm:p-4 bg-gradient-to-br from-rose-500/[0.04] via-transparent to-transparent">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-xs bg-rose-600 text-white flex items-center justify-center font-black">
                    <Flame size={14} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white">
                      Blockbuster Deals of the Day
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Highest price-drop discounts with maximum verified savings.
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-flex text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-xs bg-rose-500/15 text-rose-900 dark:text-rose-300">
                  LIMITED STOCK AVAILABLE
                </span>
              </div>

              {/* Showcase Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {topBlockbusters.map((item) => {
                  const savings = (item.originalPrice || item.price) - item.price;
                  const discPct = item.originalPrice && item.originalPrice > item.price
                    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                    : 40;
                  const imageSrc = (item.images && item.images[0]) || (item.image && item.image[0]) || item.image || heroImg;

                  return (
                    <div
                      key={item._id}
                      onClick={() => navigate(`/product/${item._id}`)}
                      className="relative group bg-white dark:bg-slate-900 rounded-xs border border-slate-200 dark:border-slate-800 p-2.5 flex gap-3 items-center hover:border-rose-500/60 transition-all duration-300 cursor-pointer shadow-2xs"
                    >
                      {/* Discount Badge */}
                      <span className="absolute top-2 right-2 px-1.5 py-0.2 rounded-xs text-[8.5px] font-black uppercase tracking-wider bg-rose-600 text-white z-10 flex items-center gap-0.5">
                        <Percent size={9} className="stroke-[3]" />
                        <span>{discPct}% OFF</span>
                      </span>

                      {/* Image */}
                      <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xs overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 relative">
                        <img
                          src={imageSrc}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 pr-10">
                        <span className="text-[9.5px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block truncate">
                          {item.brand || item.category || "Festival Deal"}
                        </span>
                        <h4 className="text-[11px] font-bold text-slate-900 dark:text-white truncate mt-0.5 group-hover:text-rose-600 transition-colors">
                          {item.name}
                        </h4>
                        
                        {/* Price & Savings */}
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                            ₹{item.price?.toLocaleString()}
                          </span>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <span className="text-[9.5px] text-slate-400 line-through">
                              ₹{item.originalPrice?.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {savings > 0 && (
                          <span className="text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                            Save ₹{savings.toLocaleString()} Instant
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 5. FRAMELESS CATEGORY TICKER */}
        <div className="mb-5 space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">
                Festival Offers by Department ({categories.length} Categories)
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
                      scrollToGrid();
                    }}
                    style={{ animationDelay: `${(idx % categories.length) * 40}ms` }}
                    className={`group relative w-20 h-24 sm:w-24 sm:h-28 rounded-sm overflow-hidden border transition-all duration-300 cursor-pointer shrink-0 text-left ${
                      isActive
                        ? "border-2 border-rose-500 shadow-lg scale-105 ring-2 ring-rose-400/40"
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

                    {/* Active Badge */}
                    {isActive && (
                      <div className="absolute top-1 right-1 px-1 py-0.2 rounded-xs bg-rose-500 text-white text-[7px] font-black uppercase tracking-wider shadow-md z-20 flex items-center gap-0.5">
                        <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                        <span>ACTIVE</span>
                      </div>
                    )}

                    {/* Overlay Text */}
                    <div className="absolute bottom-0 left-0 right-0 p-1.5 z-20 text-white flex flex-col justify-end">
                      <h4 className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider leading-tight text-white drop-shadow-md truncate">
                        {cat.label}
                      </h4>
                      <span className="text-[8px] font-bold text-rose-300 block mt-0.5 drop-shadow-xs">
                        {count} {count === 1 ? "Deal" : "Deals"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 6. INTERACTIVE STICKY CONTROL TOOLBAR */}
        <div id="festival-grid" className="sticky top-14 sm:top-16 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-rose-200/80 dark:border-rose-900/40 rounded-sm mb-6 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 transition-all">
          
          {/* Top Row: Title, Deals Count, Search, Sort & View Density */}
          <div className="p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Left: Title & Live Count & Active Filters Indicator */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-xs bg-rose-600 text-white flex items-center justify-center font-bold shrink-0">
                  <Flame size={13} />
                </div>
                <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Festival Deals
                </h2>
              </div>

              <span className="text-[10px] font-black bg-rose-500/15 text-rose-900 dark:text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-xs font-mono uppercase tracking-wider">
                {processedProducts.length} {processedProducts.length === 1 ? "Deal" : "Deals"}
              </span>

              {selectedSubCategory !== "All" && (
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  in <span className="text-rose-600 dark:text-rose-400 font-black">{selectedSubCategory}</span>
                </span>
              )}

              {/* Clear All active filters chip if active */}
              {(quickFilter !== "all" || searchQuery || activeBudgetCap !== null || selectedSubCategory !== "All") && (
                <button
                  onClick={() => {
                    setQuickFilter("all");
                    setSearchQuery("");
                    setActiveBudgetCap(null);
                    setSelectedSubCategory("All");
                    setCurrentPage(1);
                  }}
                  className="text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:underline flex items-center gap-0.5 ml-1 cursor-pointer bg-transparent border-none p-0"
                >
                  <X size={11} /> Reset Filters
                </button>
              )}
            </div>

            {/* Right: Search Input + Sort Select + Density View */}
            <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
              {/* Search Field */}
              <div className="relative flex-1 sm:w-56 md:w-64">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search festival deals..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white border-none bg-transparent cursor-pointer p-0.5"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold px-2.5 py-1.5 rounded-xs focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="discount">Biggest Discount %</option>
                  <option value="savings">Highest Cash Savings</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>

              {/* Grid Columns Density */}
              <div className="hidden sm:flex items-center gap-1 shrink-0 pl-1 border-l border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setGridCols(2)}
                  title="2 Columns View"
                  className={`p-1.5 rounded-xs border transition-all cursor-pointer ${
                    gridCols === 2
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-2xs"
                      : "bg-slate-50 dark:bg-slate-950 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-400"
                  }`}
                >
                  <Grid2X2 size={13} />
                </button>

                <button
                  onClick={() => setGridCols(3)}
                  title="3 Columns View"
                  className={`p-1.5 rounded-xs border transition-all cursor-pointer ${
                    gridCols === 3
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-2xs"
                      : "bg-slate-50 dark:bg-slate-950 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-400"
                  }`}
                >
                  <Grid3X3 size={13} />
                </button>

                <button
                  onClick={() => setGridCols(4)}
                  title="4 Columns View"
                  className={`p-1.5 rounded-xs border transition-all cursor-pointer ${
                    gridCols === 4
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-2xs"
                      : "bg-slate-50 dark:bg-slate-950 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-400"
                  }`}
                >
                  <LayoutGrid size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Row: Quick Filter Chips Ribbon */}
          <div className="px-2.5 sm:px-3 py-2 bg-slate-50/50 dark:bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1 shrink-0">
              Quick Filters:
            </span>
            {[
              { id: "all", label: "All Festival Offers" },
              { id: "halfprice", label: "🏷️ Flat 40%+ Off" },
              { id: "under999", label: "⚡ Under ₹999 Steals" },
              { id: "flash", label: "🔥 Flash Movers" },
              { id: "toprated", label: "★ 4.5★+ Top Rated" },
              { id: "luxury", label: "💎 Luxury Gifts" }
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => {
                  setQuickFilter(chip.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 text-[11px] font-bold rounded-xs transition-all cursor-pointer shrink-0 border whitespace-nowrap ${
                  quickFilter === chip.id
                    ? "bg-rose-600 text-white border-rose-600 shadow-2xs"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-800 hover:text-rose-600"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* 7. PRODUCT GRID SECTION */}
        {loading ? (
          <ProductGridSkeleton count={itemsPerPage} />
        ) : processedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 border border-slate-200/80 dark:border-slate-800 rounded-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-center animate-fade-in my-6 shadow-xs">
            <Gift size={36} className="text-rose-400 mb-2 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Festival Offers Match Your Filter</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-1 leading-normal">
              Try choosing another department, adjusting your budget slider, or clearing active discount filters.
            </p>
            <button
              onClick={() => {
                setSelectedSubCategory("All");
                setSearchQuery("");
                setQuickFilter("all");
                setActiveBudgetCap(null);
              }}
              className="mt-6 px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-rose-600 text-white rounded-sm cursor-pointer hover:bg-rose-700 transition-all shadow-xs"
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
                  <span className="font-bold text-slate-900 dark:text-white">{processedProducts.length}</span> festival offers
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

        {/* 8. FESTIVAL SHOPPING GUARANTEE STRIP */}
        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-3 border-t border-slate-200/80 dark:border-slate-800 pt-8">
          <div className="p-4 rounded-sm bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-sm bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <Gift size={16} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Festive Gift Packing
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Premium packaging and personalized gift cards on checkout.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-sm bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-sm bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={16} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                100% Price Match
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Guaranteed lowest verified price during the festival campaign.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-sm bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-sm bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Zap size={16} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Fast Express Dispatch
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Priority order fulfillment for guaranteed delivery before festival days.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-sm bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-sm bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Easy 7-Day Returns
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Free return pickup with instant refund directly to your source account.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 p-2.5 rounded-sm bg-slate-900 hover:bg-slate-800 text-white shadow-xl cursor-pointer flex items-center justify-center border border-white/20"
          title="Back to Top"
        >
          <ArrowUp size={16} className="stroke-[3]" />
        </button>
      )}

    </div>
  );
};

export default FestivalOffersLanding;
