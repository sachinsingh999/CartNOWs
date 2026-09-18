import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { backendUrl } from "../../config";
import { cachedGet, getSyncCachedData } from "../../utils/apiCache";
import { getOptimizedImageUrl } from "../../utils/imageOptimizer";
import {
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Star
} from "lucide-react";

import techHeroPerson from "../../assets/new_home/tech_hero_person.webp";

const SLIDE_DURATION = 6500; // 6.5s per slide

// Category partner brand lists for bottom brand strip
const CATEGORY_BRANDS = {
  tech: ["Apple", "Samsung", "Sony", "boAt", "JBL", "Bose", "Dell", "HP", "Lenovo"],
  fashion: ["Zara", "H&M", "Nike", "Puma", "Levi's", "Adidas", "Tommy Hilfiger", "Calvin Klein"],
  beauty: ["L'Oréal", "MAC", "Estée Lauder", "Clinique", "Forest Essentials", "Nykaa", "Maybelline"],
  luxury: ["Rolex", "Fossil", "Titan", "Casio", "Seiko", "Tissot", "Garmin", "Apple Watch"],
  footwear: ["Nike", "Adidas", "Puma", "New Balance", "Asics", "Under Armour", "Skechers"],
  fitness: ["Garmin", "Fitbit", "Under Armour", "Decathlon", "Cultsport", "Reebok", "Puma"],
  home: ["IKEA", "D'Decor", "Philips", "Dyson", "Home Centre", "Spaces", "Bombay Dyeing"],
  kids: ["Lego", "Hot Wheels", "Barbie", "Fisher-Price", "Hamleys", "Chicco", "Disney"]
};

// Animation variants for smooth slide transitions
const slideVariants = {
  enter: (direction) => ({
    opacity: 0,
    x: direction > 0 ? 35 : -35,
    scale: 0.985
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  exit: (direction) => ({
    opacity: 0,
    x: direction > 0 ? -35 : 35,
    scale: 0.985,
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1]
    }
  })
};

// Theme configuration generator based on banner text & category
const getBannerTheme = (banner) => {
  if (!banner) {
    return getDefaultTechTheme();
  }

  const text = `${banner.title || ""} ${banner.subtitle || ""} ${banner.tagline || ""} ${banner.category || ""}`.toLowerCase();

  // 1. Fashion / Apparel
  if (
    text.includes("fashion") ||
    text.includes("apparel") ||
    text.includes("clothing") ||
    text.includes("style") ||
    text.includes("dress") ||
    text.includes("collection") ||
    text.includes("season") ||
    text.includes("wear") ||
    text.includes("women") ||
    text.includes("men")
  ) {
    return {
      category: "fashion",
      headlineSolid: "text-slate-950 dark:text-white",
      headlineGradient: "from-violet-600 via-purple-600 to-pink-600 dark:from-violet-400 dark:via-purple-300 dark:to-pink-300",
      ctaGradient: "from-violet-600 via-indigo-600 to-purple-700 hover:from-violet-500 hover:to-purple-600",
      ctaShadow: "shadow-[0_4px_16px_rgba(124,58,237,0.3)] hover:shadow-[0_8px_24px_rgba(124,58,237,0.45)]",
      eyebrowBadge: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-400/40 dark:border-purple-500/30",
      eyebrowDot: "bg-purple-500",
      brands: CATEGORY_BRANDS.fashion,
      chips: [
        { icon: Sparkles, label: "Curated Styles" },
        { icon: Star, label: "4.9/5 Rated" },
        { icon: ShieldCheck, label: "100% Authentic" },
        { icon: Sparkles, label: "Easy Returns" }
      ]
    };
  }

  // 2. Beauty / Skincare / Cosmetics
  if (
    text.includes("beauty") ||
    text.includes("skin") ||
    text.includes("cosmetic") ||
    text.includes("glow") ||
    text.includes("fragrance") ||
    text.includes("perfume")
  ) {
    return {
      category: "beauty",
      headlineSolid: "text-slate-950 dark:text-white",
      headlineGradient: "from-rose-600 via-pink-600 to-purple-600 dark:from-rose-400 dark:via-pink-300 dark:to-purple-300",
      ctaGradient: "from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-pink-500",
      ctaShadow: "shadow-[0_4px_16px_rgba(244,63,94,0.3)] hover:shadow-[0_8px_24px_rgba(244,63,94,0.45)]",
      eyebrowBadge: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-400/40 dark:border-rose-500/30",
      eyebrowDot: "bg-rose-500",
      brands: CATEGORY_BRANDS.beauty,
      chips: [
        { icon: Sparkles, label: "100% Vegan" },
        { icon: CheckCircle2, label: "Dermatologist Tested" },
        { icon: ShieldCheck, label: "100% Genuine" },
        { icon: Sparkles, label: "Easy Returns" }
      ]
    };
  }

  // 3. Watches / Luxury / Jewellery
  if (
    text.includes("watch") ||
    text.includes("jewel") ||
    text.includes("gold") ||
    text.includes("chrono") ||
    text.includes("luxury")
  ) {
    return {
      category: "luxury",
      headlineSolid: "text-slate-950 dark:text-white",
      headlineGradient: "from-amber-600 via-orange-600 to-yellow-600 dark:from-amber-400 dark:via-orange-300 dark:to-yellow-300",
      ctaGradient: "from-amber-600 via-orange-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500",
      ctaShadow: "shadow-[0_4px_16px_rgba(217,119,6,0.3)] hover:shadow-[0_8px_24px_rgba(217,119,6,0.45)]",
      eyebrowBadge: "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-400/40 dark:border-amber-500/30",
      eyebrowDot: "bg-amber-500",
      brands: CATEGORY_BRANDS.luxury,
      chips: [
        { icon: Sparkles, label: "Swiss Precision" },
        { icon: ShieldCheck, label: "Sapphire Glass" },
        { icon: CheckCircle2, label: "100% Genuine" },
        { icon: Sparkles, label: "2-Yr Warranty" }
      ]
    };
  }

  // Default: Smart Tech / Electronics
  return getDefaultTechTheme();
};

const getDefaultTechTheme = () => ({
  category: "tech",
  headlineSolid: "text-slate-950 dark:text-white",
  headlineGradient: "from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-300 dark:to-violet-400",
  ctaGradient: "from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500",
  ctaShadow: "shadow-[0_4px_16px_rgba(79,70,229,0.3)] hover:shadow-[0_8px_24px_rgba(79,70,229,0.45)]",
  eyebrowBadge: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-400/40 dark:border-indigo-500/30",
  eyebrowDot: "bg-indigo-500",
  brands: CATEGORY_BRANDS.tech,
  chips: [
    { icon: Zap, label: "Next-Gen Tech" },
    { icon: Star, label: "4.9/5 Rated" },
    { icon: ShieldCheck, label: "100% Genuine" },
    { icon: Sparkles, label: "Easy Returns" }
  ]
});

// Smart CTA button label
const getSmartCtaText = (banner) => {
  if (!banner) return "Shop Now";
  const cta = (banner.ctaText || "").trim();
  if (cta) return cta.replace(/→/g, "").trim() || "Shop Now";
  return "Shop Now";
};

// Smart destination URL
const getSmartLink = (banner) => {
  if (!banner) return "/product?category=electronics";
  const link = (banner.linkUrl || "").trim();
  if (link) return link;
  return "/product?category=electronics";
};

// Helper to safely format image URLs uploaded by Admin
const getAdminBannerImages = (b) => {
  if (!b) return [];
  const rawList = b.images && Array.isArray(b.images) && b.images.length > 0
    ? b.images
    : (b.imageUrl ? [b.imageUrl] : []);

  const validImages = rawList.filter(
    (img) => img && typeof img === "string" && img.trim() !== "" && !img.includes("favicon")
  );

  return validImages.map((img) => {
    const trimmed = img.trim();
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("data:") ||
      trimmed.startsWith("blob:")
    ) {
      return getOptimizedImageUrl(trimmed, { width: 1000, quality: 85 }) || trimmed;
    }
    const rawUrl = `${backendUrl}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
    return getOptimizedImageUrl(rawUrl, { width: 1000, quality: 85 }) || rawUrl;
  });
};

const TechAdBanner = () => {
  const navigate = useNavigate();

  // Instant SWR state initialization from sessionStorage / memory cache
  const cachedBanners = useMemo(() => {
    const cached = getSyncCachedData(`${backendUrl}/api/promo-banners/active`, {});
    if (cached?.success) {
      const list = Array.isArray(cached.banners) && cached.banners.length > 0
        ? cached.banners
        : (cached.banner ? [cached.banner] : []);
      return list.filter((b) => b && b.isActive !== false);
    }
    return [];
  }, []);

  const [banners, setBanners] = useState(() => cachedBanners);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const touchStartXRef = useRef(null);
  const touchEndXRef = useRef(null);

  const handleTouchStart = (e) => {
    if (e.targetTouches && e.targetTouches[0]) {
      touchStartXRef.current = e.targetTouches[0].clientX;
    }
  };

  const handleTouchMove = (e) => {
    if (e.targetTouches && e.targetTouches[0]) {
      touchEndXRef.current = e.targetTouches[0].clientX;
    }
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    if (distance > 45) {
      handleNext();
    } else if (distance < -45) {
      handlePrev();
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // Fetch promotional banners from backend
  useEffect(() => {
    let isMounted = true;
    const fetchActiveBanners = async () => {
      try {
        const res = await cachedGet(`${backendUrl}/api/promo-banners/active`, {}, 30000);
        if (isMounted && res?.data?.success) {
          const list = Array.isArray(res.data.banners) && res.data.banners.length > 0
            ? res.data.banners
            : (res.data.banner ? [res.data.banner] : []);
          
          const activeList = list.filter(b => b && b.isActive !== false);
          setBanners(activeList);
        }
      } catch (err) {
        console.error("Failed to load active promo banners:", err);
      }
    };

    fetchActiveBanners();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeBanners = banners.length > 0 ? banners : [
    {
      _id: "default_fallback_banner",
      title: "Upgrade Your Digital Life",
      subtitle: "Top brands. Latest flagship gadgets. Unbeatable prices.",
      tagline: "TECH FOR A BETTER TOMORROW",
      discountTag: "UP TO 50% OFF",
      ctaText: "Shop Electronics",
      linkUrl: "/product?category=electronics",
      imageUrl: techHeroPerson,
      images: [techHeroPerson],
      isActive: true
    }
  ];

  const totalBanners = activeBanners.length;
  const currentBanner = activeBanners[currentIndex % totalBanners] || activeBanners[0];
  const theme = getBannerTheme(currentBanner);

  // Get exact images uploaded by the admin for this banner
  const adminImages = getAdminBannerImages(currentBanner);
  const hasAdminImages = adminImages.length > 0;
  const displayImages = hasAdminImages ? adminImages : [techHeroPerson];

  // Auto-slide interval timer
  useEffect(() => {
    if (totalBanners <= 1 || isPaused) {
      clearInterval(progressIntervalRef.current);
      return;
    }

    setProgress(0);
    const intervalTime = 50;
    const step = (intervalTime / SLIDE_DURATION) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setDirection(1);
          setCurrentIndex((current) => (current + 1) % totalBanners);
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(progressIntervalRef.current);
  }, [totalBanners, isPaused, currentIndex]);

  const handlePrev = useCallback((e) => {
    if (e) e.stopPropagation();
    setProgress(0);
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + totalBanners) % totalBanners);
  }, [totalBanners]);

  const handleNext = useCallback((e) => {
    if (e) e.stopPropagation();
    setProgress(0);
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % totalBanners);
  }, [totalBanners]);

  const handleDotClick = (idx, e) => {
    if (e) e.stopPropagation();
    if (idx === currentIndex) return;
    setProgress(0);
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  const targetLink = getSmartLink(currentBanner);
  const title = currentBanner.title || "Upgrade Your Digital Life";
  const subtitle = currentBanner.subtitle || "Top brands. Latest flagship gadgets. Unbeatable prices.";
  const tagline = currentBanner.tagline || "TECH FOR A BETTER TOMORROW";
  const discountTag = currentBanner.discountTag || "UP TO 50% OFF";
  const smartCtaText = getSmartCtaText(currentBanner);

  // Split headline: solid prefix + luminous gradient highlight
  const titleWords = title.split(" ").filter(Boolean);
  let firstPart = "Upgrade Your";
  let highlightPart = "Digital Life";

  if (titleWords.length >= 3) {
    firstPart = titleWords.slice(0, -2).join(" ");
    highlightPart = titleWords.slice(-2).join(" ");
  } else if (titleWords.length === 2) {
    firstPart = titleWords[0];
    highlightPart = titleWords[1];
  } else if (titleWords.length === 1) {
    firstPart = "";
    highlightPart = titleWords[0];
  }

  const handlePrimaryAction = (e) => {
    if (e) e.stopPropagation();
    if (!targetLink) return;
    if (targetLink.startsWith("http://") || targetLink.startsWith("https://")) {
      window.open(targetLink, "_blank", "noopener,noreferrer");
    } else {
      navigate(targetLink);
    }
  };

  return (
    <section className="w-full px-2 sm:px-4 lg:px-6 py-0.5 sm:py-1 select-none">
      {/* ═════════════════════════════════════════════════════════════
          SHARP-CORNER RESPONSIVE CAMPAIGN CARD
          ═════════════════════════════════════════════════════════════ */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="group relative w-full max-w-[1600px] mx-auto rounded-none overflow-hidden cursor-pointer shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_36px_rgba(0,0,0,0.08)] transition-all duration-500 border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900"
        role="region"
        aria-label={title}
      >
        {/* Dynamic Card Body Container (Compact & Widescreen Balanced) */}
        <div className="relative w-full overflow-hidden min-h-[300px] min-[400px]:min-h-[320px] sm:min-h-[360px] md:min-h-[400px] lg:min-h-[430px] xl:min-h-[440px] flex flex-col justify-between">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentBanner._id || currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              onClick={handlePrimaryAction}
              className="absolute inset-0 w-full h-full overflow-hidden"
            >
              {/* ═════════════════════════════════════════════════════════════
                  CLEAN SOLID MINIMAL BACKGROUND (NO EDGE COLOR GRADIENTS)
                  ═════════════════════════════════════════════════════════════ */}
              <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none">
                {/* 1. Base Clean Solid Canvas */}
                <div className="absolute inset-0 bg-[#F9FAFC] dark:bg-[#0B0D17]" />

                {/* 2. Subtle Neutral Dotted Matrix (Top-Left) */}
                <svg className="absolute top-4 left-6 w-20 h-14 opacity-25 dark:opacity-15 text-slate-400 dark:text-slate-700" viewBox="0 0 96 64" fill="currentColor">
                  {[0, 16, 32, 48, 64, 80].map((x) =>
                    [0, 16, 32, 48].map((y) => (
                      <circle key={`tl-${x}-${y}`} cx={x + 6} cy={y + 6} r="1.5" />
                    ))
                  )}
                </svg>

                {/* 3. Subtle Neutral Dotted Matrix (Bottom-Right) */}
                <svg className="absolute bottom-12 right-10 w-24 h-16 opacity-25 dark:opacity-15 text-slate-400 dark:text-slate-700" viewBox="0 0 112 72" fill="currentColor">
                  {[0, 16, 32, 48, 64, 80, 96].map((x) =>
                    [0, 16, 32, 48].map((y) => (
                      <circle key={`br-${x}-${y}`} cx={x + 6} cy={y + 6} r="1.5" />
                    ))
                  )}
                </svg>
              </div>

              {/* ═════════════════════════════════════════════════════════════
                  MAIN 2-COLUMN SPLIT: BALANCED RESPONSIVE SIDE-BY-SIDE
                  ═════════════════════════════════════════════════════════════ */}
              <div className="relative z-10 w-full h-full flex flex-row items-center justify-between px-3.5 sm:px-8 md:px-10 lg:px-12 pt-3.5 sm:pt-6 md:pt-7 pb-10 sm:pb-14 lg:pb-14">
                
                {/* ── LEFT COLUMN: CAMPAIGN EDITORIAL & ACTIONS ── */}
                <div className="relative z-20 w-[58%] min-[480px]:w-[54%] sm:w-[50%] lg:w-[44%] text-left flex flex-col justify-center pointer-events-auto pr-2 sm:pr-4">
                  
                  {/* Eyebrow Pill Badge (Sharp Corner) */}
                  <div className="inline-flex items-center gap-1 mb-1 sm:mb-2 w-fit">
                    <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-none text-[9px] min-[400px]:text-[9.5px] sm:text-[11px] font-black tracking-wider uppercase backdrop-blur-md border shadow-2xs transition-all ${theme.eyebrowBadge} bg-white/80 dark:bg-slate-800/80`}>
                      {/* Live Pulsating LED */}
                      <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${theme.eyebrowDot}`} />
                        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 ${theme.eyebrowDot}`} />
                      </span>
                      <Sparkles size={11} className="shrink-0 hidden min-[380px]:inline-block" />
                      <span className="truncate max-w-[140px] min-[400px]:max-w-[180px] sm:max-w-none">{tagline}</span>
                    </span>
                  </div>

                  {/* High-Impact Headline */}
                  <h2 className={`text-base min-[380px]:text-lg min-[440px]:text-xl sm:text-2xl md:text-3xl lg:text-[36px] xl:text-[40px] font-black tracking-tight leading-[1.1] sm:leading-[1.08] ${theme.headlineSolid} line-clamp-2`}>
                    {firstPart ? <span className="mr-1.5 sm:mr-2">{firstPart}</span> : null}
                    <span className={`bg-gradient-to-r ${theme.headlineGradient} bg-clip-text text-transparent drop-shadow-2xs`}>
                      {highlightPart}
                    </span>
                  </h2>

                  {/* Subtitle */}
                  <p className="text-[10px] min-[380px]:text-[11px] sm:text-[13px] md:text-sm font-medium text-slate-600 dark:text-slate-300 line-clamp-1 min-[480px]:line-clamp-2 mt-1 sm:mt-2 max-w-lg leading-relaxed">
                    {subtitle}
                  </p>

                  {/* 3–4 Compact Feature Chips (Sharp Corners) */}
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1.5 sm:mt-3">
                    {theme.chips.map((chip, cIdx) => {
                      const IconComponent = chip.icon;
                      const isExtraOnMobile = cIdx >= 2;
                      return (
                        <span
                          key={cIdx}
                          className={`${isExtraOnMobile ? "hidden sm:inline-flex" : "inline-flex"} items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-none text-[8.5px] min-[380px]:text-[9.5px] sm:text-[11px] font-bold bg-white/85 dark:bg-slate-800/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 shadow-2xs hover:scale-105 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-default`}
                        >
                          <IconComponent size={11} className="text-indigo-600 dark:text-indigo-400 stroke-[2.5]" />
                          <span>{chip.label}</span>
                        </span>
                      );
                    })}
                  </div>

                  {/* Action CTA Button (Sharp Corners) */}
                  <div className="flex items-center gap-1.5 sm:gap-3.5 mt-2 min-[380px]:mt-2.5 sm:mt-4.5">
                    {/* Primary CTA */}
                    <button
                      type="button"
                      onClick={handlePrimaryAction}
                      className={`inline-flex items-center gap-1 sm:gap-2 px-3.5 min-[380px]:px-4.5 sm:px-6 py-1.5 min-[380px]:py-2 sm:py-3 rounded-none bg-gradient-to-r ${theme.ctaGradient} text-white font-black text-[10px] min-[380px]:text-[11.5px] sm:text-[13px] ${theme.ctaShadow} hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer group/btn shrink-0`}
                    >
                      <span>{smartCtaText}</span>
                      <ArrowRight size={13} className="stroke-[2.5] group-hover/btn:translate-x-1.5 transition-transform duration-300" />
                    </button>
                  </div>

                  {/* Campaign Carousel Navigation Controls (Sharp Corners) */}
                  <div className="flex items-center gap-1.5 sm:gap-2.5 mt-2 min-[380px]:mt-2.5 sm:mt-5">
                    {/* Square Prev/Next Buttons */}
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <button
                        type="button"
                        onClick={handlePrev}
                        aria-label="Previous Campaign"
                        className="w-6 h-6 min-[380px]:w-7 min-[380px]:h-7 sm:w-9 sm:h-9 rounded-none bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-slate-950 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md flex items-center justify-center transition-all duration-300 cursor-pointer active:scale-90"
                      >
                        <ChevronLeft size={14} className="stroke-[2.5]" />
                      </button>

                      <button
                        type="button"
                        onClick={handleNext}
                        aria-label="Next Campaign"
                        className="w-6 h-6 min-[380px]:w-7 min-[380px]:h-7 sm:w-9 sm:h-9 rounded-none bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-slate-950 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md flex items-center justify-center transition-all duration-300 cursor-pointer active:scale-90"
                      >
                        <ChevronRight size={14} className="stroke-[2.5]" />
                      </button>
                    </div>

                    {/* Active Campaign Progress Indicator (Sharp Edges) */}
                    <div className="flex items-center gap-1 sm:gap-1.5 bg-white/85 dark:bg-slate-800/85 backdrop-blur-md px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-none border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
                      {activeBanners.map((b, idx) => {
                        const isActive = idx === currentIndex;
                        const isPassed = idx < currentIndex;

                        return (
                          <button
                            key={b._id || idx}
                            type="button"
                            onClick={(e) => handleDotClick(idx, e)}
                            aria-label={`Slide ${idx + 1}`}
                            className="relative h-1 sm:h-1.5 rounded-none overflow-hidden cursor-pointer transition-all duration-300 border-none p-0 bg-slate-200 dark:bg-slate-700"
                            style={{ width: isActive ? "18px" : "5px" }}
                          >
                            <div
                              className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-none transition-all duration-100"
                              style={{
                                width: isActive ? `${progress}%` : isPassed ? "100%" : "0%"
                              }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* ── RIGHT COLUMN: 3D DYNAMIC ADMIN PRODUCT STAGE ── */}
                <div className="relative w-[42%] min-[480px]:w-[46%] sm:w-[50%] lg:w-[56%] h-full flex items-end justify-center pointer-events-none z-10 overflow-visible">
                  
                  {/* Stage Floor Reflection Line */}
                  <div className="absolute bottom-1 right-1/4 w-3/5 h-3 sm:h-4 bg-black/10 dark:bg-black/40 blur-md sm:blur-lg rounded-full pointer-events-none" />

                  {/* Sharp Geometric "UP TO 50% OFF" Badge (Top Right) */}
                  <div className="absolute top-1 sm:top-2 right-0 sm:right-3 z-30 pointer-events-auto">
                    <div className="relative group/discount px-2 sm:px-3.5 py-1 sm:py-2 rounded-none bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 text-white shadow-[0_4px_16px_rgba(245,158,11,0.35)] flex flex-col items-center justify-center text-center -rotate-3 hover:rotate-0 transition-transform duration-500 font-black leading-tight border border-white/50 backdrop-blur-md cursor-pointer">
                      <div className="flex items-center gap-0.5 sm:gap-1">
                        <Flame size={11} className="fill-white animate-pulse" />
                        <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-extrabold opacity-95">Save</span>
                      </div>
                      <span className="text-[10px] min-[380px]:text-[11px] sm:text-xs md:text-sm font-black mt-0.5">{discountTag.replace("UP TO", "").trim() || "50% OFF"}</span>
                    </div>
                  </div>

                  {/* Floating Micro Label: Top Left (Sharp Corners) */}
                  <div className="hidden min-[600px]:flex items-center gap-1 absolute top-2 left-2 sm:left-4 z-30 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-2.5 py-1 rounded-none border border-white/80 dark:border-slate-700/80 shadow-md text-[10.5px] font-extrabold text-slate-800 dark:text-slate-100 animate-bounce" style={{ animationDuration: "5s" }}>
                    <Sparkles size={11} className="text-indigo-600 dark:text-indigo-400" />
                    <span>Latest Arrivals</span>
                  </div>

                  {/* ═════════════════════════════════════════════════════════════
                      DYNAMIC ADMIN IMAGES SHOWCASE (RENDERED FROM ADMIN PANEL)
                      ═════════════════════════════════════════════════════════════ */}
                  <div className="relative z-20 w-full h-full flex items-end justify-center pb-0.5">
                    
                    {/* Primary Hero Image Uploaded by Admin */}
                    {displayImages[0] && (
                      <div className="relative z-20 max-h-[190px] min-[380px]:max-h-[210px] min-[440px]:max-h-[235px] sm:max-h-[270px] md:max-h-[310px] lg:max-h-[340px] xl:max-h-[360px] w-full flex items-end justify-center transition-transform duration-700 hover:scale-105">
                        <img
                          src={displayImages[0]}
                          alt={title}
                          className="max-h-[190px] min-[380px]:max-h-[210px] min-[440px]:max-h-[235px] sm:max-h-[270px] md:max-h-[310px] lg:max-h-[340px] xl:max-h-[360px] w-auto max-w-full object-contain object-bottom select-none drop-shadow-[0_12px_28px_rgba(0,0,0,0.20)] dark:drop-shadow-[0_16px_36px_rgba(0,0,0,0.6)]"
                          loading="eager"
                          fetchPriority="high"
                          decoding="async"
                          onError={(e) => {
                            e.target.src = techHeroPerson;
                          }}
                        />
                      </div>
                    )}

                    {/* Secondary Image 1 (If Admin uploaded 2+ images - Bottom/Mid Right) */}
                    {displayImages.length >= 2 && displayImages[1] && (
                      <div className="hidden md:block absolute right-2 lg:right-6 bottom-1 sm:bottom-2 z-25 max-w-[150px] lg:max-w-[210px] xl:max-w-[240px] max-h-[180px] lg:max-h-[240px] xl:max-h-[270px] transition-transform duration-500 hover:-translate-y-2 group/sec1">
                        {/* Floating "Trending" Badge attached to Image 1 */}
                        <div className="absolute -top-3 right-2 z-30 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-2.5 py-0.5 rounded-none border border-white/90 dark:border-slate-700/90 shadow-md text-[10px] font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                          <Flame size={11} className="text-orange-500 fill-orange-500 animate-pulse" />
                          <span>Trending</span>
                        </div>
                        <img
                          src={displayImages[1]}
                          alt={`${title} 2`}
                          className="w-auto h-auto max-h-[180px] lg:max-h-[240px] xl:max-h-[270px] object-contain drop-shadow-[0_16px_30px_rgba(0,0,0,0.20)]"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    {/* Secondary Image 2 (If Admin uploaded 3+ images - Bottom/Mid Left) */}
                    {displayImages.length >= 3 && displayImages[2] && (
                      <div className="hidden lg:block absolute left-1 lg:left-4 bottom-1 sm:bottom-2 z-25 max-w-[150px] lg:max-w-[180px] xl:max-w-[210px] max-h-[190px] lg:max-h-[220px] xl:max-h-[250px] transition-transform duration-500 hover:-translate-y-2 group/sec2">
                        {/* Floating "Top Rated 4.9" Badge attached to Image 2 */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-30 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-2.5 py-0.5 rounded-none border border-white/90 dark:border-slate-700/90 shadow-md text-[10px] font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1 whitespace-nowrap">
                          <Star size={11} className="text-amber-500 fill-amber-500" />
                          <span>Top Rated 4.9</span>
                        </div>
                        <img
                          src={displayImages[2]}
                          alt={`${title} 3`}
                          className="w-auto h-auto max-h-[190px] lg:max-h-[220px] xl:max-h-[250px] object-contain drop-shadow-[0_16px_30px_rgba(0,0,0,0.18)]"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    {/* Secondary Image 3 (If Admin uploaded 4+ images - Top Right) */}
                    {displayImages.length >= 4 && displayImages[3] && (
                      <div className="hidden xl:block absolute right-14 xl:right-18 top-2 sm:top-4 z-15 max-w-[140px] xl:max-w-[170px] max-h-[160px] xl:max-h-[190px] opacity-95 transition-transform duration-500 hover:-translate-y-2">
                        <img
                          src={displayImages[3]}
                          alt={`${title} 4`}
                          className="w-auto h-auto max-h-[160px] xl:max-h-[190px] object-contain drop-shadow-[0_14px_24px_rgba(0,0,0,0.18)]"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    )}

                  </div>

                </div>

              </div>

              {/* ═════════════════════════════════════════════════════════════
                  BOTTOM BRAND STRIP (SLIM GLASS / WHITE FLOATING BAR)
                  ═════════════════════════════════════════════════════════════ */}
              <div className="absolute bottom-0 left-0 right-0 z-20 w-full px-3 sm:px-8 py-1.5 sm:py-2.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between overflow-x-auto scrollbar-none">
                <div className="flex items-center gap-1 text-[9.5px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 mr-2 sm:mr-3">
                  <Sparkles size={10} className="text-indigo-500" />
                  <span>Featured Brands</span>
                </div>

                <div className="flex items-center gap-3 min-[380px]:gap-4 sm:gap-6 md:gap-8 overflow-x-auto scrollbar-none">
                  {theme.brands.map((brandName, bIdx) => (
                    <span
                      key={bIdx}
                      className="text-[10.5px] sm:text-xs md:text-[13px] font-extrabold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors tracking-wide shrink-0 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product?search=${encodeURIComponent(brandName)}`);
                      }}
                    >
                      {brandName}
                    </span>
                  ))}
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default TechAdBanner;
