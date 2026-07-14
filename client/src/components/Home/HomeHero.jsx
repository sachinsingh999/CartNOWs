import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { backendUrl } from "../../config";
import { cachedGet } from "../../utils/apiCache";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  HelpCircle,
  Sparkles,
  Flame,
  Tag,
  Zap,
  Star,
  Compass,
  Headphones,
  Music,
  Radio,
  Leaf,
  Droplet,
  FlaskConical,
  Award,
  Hourglass,
  LayoutGrid,
  CheckCircle,
  ThumbsUp
} from "lucide-react";

// Import local premium WebP studio campaign photography assets
import womensFashionFallback from "../../assets/brand_asset_womens_fashion.webp";
import mensFashionFallback from "../../assets/brand_asset_mens_fashion.webp";
import sneakersFallback from "../../assets/brand_asset_sneakers.webp";
import electronicsFallback from "../../assets/brand_asset_electronics.webp";
import beautyFallback from "../../assets/brand_asset_beauty.webp";
import accessoriesFallback from "../../assets/brand_asset_accessories.webp";
import sportswearFallback from "../../assets/brand_asset_sportswear.webp";

const HomeHero = ({ onShowDealOfDay, hasActiveDeal }) => {
  const navigate = useNavigate();
  const heroContainerRef = useRef(null);
  
  const [slideIdx, setSlideIdx] = useState(0);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customBanners, setCustomBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showBanners, setShowBanners] = useState(false);
  const [couponCopied, setCouponCopied] = useState(false);

  // Mouse parallax position states
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!heroContainerRef.current) return;
    const { left, top, width, height } = heroContainerRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 25; // Sensitivity divisor
    const y = (e.clientY - top - height / 2) / 25;
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  // Sync theme changes with component state dynamically using a MutationObserver
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const fallbackSlides = [
    {
      imageUrl: womensFashionFallback,
      name: "Women's Luxury Line",
      category: "Women's Fashion",
      tagline: "Timeless Minimalist Tailoring & Modern Silhouettes",
      scaleClass: "scale-[1.0] sm:scale-[1.05] lg:scale-[1.12]"
    },
    {
      imageUrl: mensFashionFallback,
      name: "Men's Premium Edit",
      category: "Men's Fashion",
      tagline: "Structured Modern Classics & Performance Tailoring",
      scaleClass: "scale-[1.0] sm:scale-[1.05] lg:scale-[1.12]"
    },
    {
      imageUrl: sneakersFallback,
      name: "Sneakers Campaign",
      category: "Sneakers",
      tagline: "High-Performance Aesthetics & All-Day Cushioning",
      scaleClass: "scale-[1.0] sm:scale-[1.05] lg:scale-[1.12]"
    },
    {
      imageUrl: electronicsFallback,
      name: "Smart Audio Collection",
      category: "Electronics",
      tagline: "Pure Acoustic Fidelity & Active Hybrid ANC",
      scaleClass: "scale-[0.85] sm:scale-[0.9] lg:scale-[0.95]"
    },
    {
      imageUrl: beautyFallback,
      name: "Advanced Skincare",
      category: "Beauty",
      tagline: "Radiant Cellular Science & Clean Clinical Actives",
      scaleClass: "scale-[0.85] sm:scale-[0.9] lg:scale-[0.95]"
    },
    {
      imageUrl: accessoriesFallback,
      name: "Designer Accents",
      category: "Accessories",
      tagline: "Refined Luxury Silhouettes & Steel Craftsmanship",
      scaleClass: "scale-[0.9] sm:scale-[0.95] lg:scale-[1.02]"
    },
    {
      imageUrl: sportswearFallback,
      name: "High-Active Collection",
      category: "Sportswear",
      tagline: "Engineered Compression Fit & Peak Performance Fiber",
      scaleClass: "scale-[1.0] sm:scale-[1.05] lg:scale-[1.12]"
    }
  ];

  const fallbackSlidesDark = [
    {
      imageUrl: womensFashionFallback,
      name: "Midnight Luxury Line",
      category: "Women's Fashion",
      tagline: "Obsidian Tailoring & Refined Modern Silhouettes",
      scaleClass: "scale-[1.0] sm:scale-[1.05] lg:scale-[1.12]"
    },
    {
      imageUrl: mensFashionFallback,
      name: "Noir Silhouette Edit",
      category: "Men's Fashion",
      tagline: "Dark-Theme Tailored Classics & Heavy Knitwear",
      scaleClass: "scale-[1.0] sm:scale-[1.05] lg:scale-[1.12]"
    },
    {
      imageUrl: sneakersFallback,
      name: "Cyber Sneakers Campaign",
      category: "Sneakers",
      tagline: "Neon Accents. Infinite Speed & Composite Outsoles.",
      scaleClass: "scale-[1.0] sm:scale-[1.05] lg:scale-[1.12]"
    },
    {
      imageUrl: electronicsFallback,
      name: "Obsidian Sound Systems",
      category: "Electronics",
      tagline: "Pure Sound. Zero Outside Noise. Studio Accuracy.",
      scaleClass: "scale-[0.85] sm:scale-[0.9] lg:scale-[0.95]"
    },
    {
      imageUrl: beautyFallback,
      name: "Nocturnal Beauty Edit",
      category: "Beauty",
      tagline: "Midnight Cellular Restoration & Plant Peptides",
      scaleClass: "scale-[0.85] sm:scale-[0.9] lg:scale-[0.95]"
    },
    {
      imageUrl: accessoriesFallback,
      name: "Dark Chrome Accents",
      category: "Accessories",
      tagline: "Refined Full-Grain Leather & Matte Chrome Details",
      scaleClass: "scale-[0.9] sm:scale-[0.95] lg:scale-[1.02]"
    },
    {
      imageUrl: sportswearFallback,
      name: "Neon Activewear Line",
      category: "Sportswear",
      tagline: "Engineered Aerodynamics For Night Performance",
      scaleClass: "scale-[1.0] sm:scale-[1.05] lg:scale-[1.12]"
    }
  ];

  // Fetch campaign slideshow assets and banners from server
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        // Fetch public categories
        try {
          const catRes = await cachedGet(`${backendUrl}/api/product/categories`);
          if (catRes.data?.success) {
            setCategories(catRes.data.categories || []);
          }
        } catch (catErr) {
          console.error("Failed to fetch categories:", catErr);
        }

        // Fetch banners
        let activeBanners = [];
        try {
          const bannerRes = await cachedGet(`${backendUrl}/api/banners`);
          if (bannerRes.data?.success && bannerRes.data?.banners?.length > 0) {
            activeBanners = bannerRes.data.banners;
            setCustomBanners(activeBanners);
          }
        } catch (bannerErr) {
          console.error("Failed to fetch banners:", bannerErr);
        }

        // Fetch cutout assets
        try {
          const response = await cachedGet(`${backendUrl}/api/system/hero-assets`);
          if (response.data?.success && response.data?.assets?.length > 0) {
            const mapped = response.data.assets.map(asset => {
              let scaleClass = "scale-[1.0] sm:scale-[1.05] lg:scale-[1.12]";
              const cat = (asset.category || "").toLowerCase();
              if (cat.includes("electronics") || cat.includes("beauty")) {
                scaleClass = "scale-[0.85] sm:scale-[0.9] lg:scale-[0.95]";
              } else if (cat.includes("accessories")) {
                scaleClass = "scale-[0.9] sm:scale-[0.95] lg:scale-[1.02]";
              }
              return {
                imageUrl: asset.imageUrl.startsWith("http") ? asset.imageUrl : `${backendUrl}${asset.imageUrl}`,
                name: asset.name,
                category: asset.category,
                tagline: asset.tagline,
                scaleClass
              };
            });
            setSlides(mapped);
          } else {
            setSlides(fallbackSlides);
          }
        } catch (cutoutErr) {
          console.error("Failed to load hero assets from backend:", cutoutErr);
          setSlides(fallbackSlides);
        }
      } catch (error) {
        console.error("Critical error fetching hero data:", error);
        setSlides(fallbackSlides);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroData();
  }, []);

  // Compute active slides dynamically to adjust tags and copies under Dark Theme
  const activeSlides = useMemo(() => {
    const baseList = slides.length > 0 ? slides : (isDark ? fallbackSlidesDark : fallbackSlides);
    if (isDark) {
      return baseList.map(slide => {
        let name = slide.name;
        let tagline = slide.tagline;
        const cat = (slide.category || "").toLowerCase();
        if (cat.includes("women")) {
          name = "Midnight Luxury Line";
          tagline = "Obsidian Tailoring & Refined Modern Silhouettes";
        } else if (cat.includes("men")) {
          name = "Noir Silhouette Edit";
          tagline = "Dark-Theme Tailored Classics & Heavy Knitwear";
        } else if (cat.includes("sneakers") || cat.includes("shoes")) {
          name = "Cyber Sneakers Campaign";
          tagline = "Neon Accents. Infinite Speed & Composite Outsoles.";
        } else if (cat.includes("electronics") || cat.includes("sound")) {
          name = "Obsidian Sound Systems";
          tagline = "Pure Sound. Zero Outside Noise. Studio Accuracy.";
        } else if (cat.includes("beauty") || cat.includes("skin")) {
          name = "Nocturnal Beauty Edit";
          tagline = "Midnight Cellular Restoration & Plant Peptides";
        } else if (cat.includes("accessories")) {
          name = "Dark Chrome Accents";
          tagline = "Refined Full-Grain Leather & Matte Chrome Details";
        } else if (cat.includes("sport") || cat.includes("active")) {
          name = "Neon Activewear Line";
          tagline = "Engineered Aerodynamics For Night Performance";
        }
        return { ...slide, name, tagline };
      });
    }
    return baseList;
  }, [slides, isDark]);

  // 10 second banner transition timer
  useEffect(() => {
    if (customBanners.length > 0) {
      setShowBanners(true);
      const timer = setTimeout(() => {
        setShowBanners(false);
      }, 10000);
      return () => clearTimeout(timer);
    } else {
      setShowBanners(false);
    }
  }, [customBanners]);

  // Reset slide index when switching between banner and model modes
  useEffect(() => {
    setSlideIdx(0);
  }, [showBanners]);

  // Auto slide every 6 seconds (6000ms)
  useEffect(() => {
    const totalSlides = showBanners ? customBanners.length : activeSlides.length;
    if (totalSlides <= 1) return;
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % totalSlides);
    }, 6000);
    return () => clearInterval(timer);
  }, [showBanners, customBanners.length, activeSlides.length]);

  const currentSlide = activeSlides[slideIdx] || fallbackSlides[0];

  const handleModelClick = (categoryName) => {
    if (!categoryName) {
      navigate("/products");
      return;
    }
    const foundCat = categories.find(
      (c) => c.name.toLowerCase() === categoryName.toLowerCase()
    );
    if (foundCat) {
      navigate(`/products?categories=${foundCat._id}`);
    } else {
      navigate(`/products?q=${encodeURIComponent(categoryName.toLowerCase())}`);
    }
  };

  const copyCoupon = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText("CARTNOW10");
    setCouponCopied(true);
    setTimeout(() => setCouponCopied(false), 2000);
  };

  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (customBanners.length === 0 || !customBanners[slideIdx]) return;
    const banner = customBanners[slideIdx];
    
    const calculateTime = () => {
      if (!banner.endDate) return null;
      const difference = new Date(banner.endDate) - new Date();
      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    setTimeLeft(calculateTime());
    const timer = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [slideIdx, customBanners]);

  const progressPercent = useMemo(() => {
    if (customBanners.length === 0 || !customBanners[slideIdx]) return 0;
    const banner = customBanners[slideIdx];
    if (!banner.startDate || !banner.endDate) return 0;
    const start = new Date(banner.startDate).getTime();
    const end = new Date(banner.endDate).getTime();
    const now = Date.now();
    if (now >= end) return 100;
    if (now <= start) return 0;
    const total = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / total) * 100);
  }, [slideIdx, customBanners]);

  const currentBanner = customBanners[slideIdx] || customBanners[0];

  const categoryCounts = {
    Men: "1,240",
    Women: "2,810",
    Kids: "920",
    Sneakers: "640",
    Electronics: "890",
    Beauty: "1,450"
  };

  return (
    <div 
      ref={heroContainerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full flex flex-col relative group/hero overflow-hidden"
    >
      {/* Dynamic Cursor Spotlight Effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-0 group-hover/hero:opacity-100 transition-opacity duration-700 z-0"
        style={{
          background: `radial-gradient(800px circle at ${mousePosition.x * 25 + (heroContainerRef.current?.getBoundingClientRect().width || 1200) / 2}px ${mousePosition.y * 25 + (heroContainerRef.current?.getBoundingClientRect().height || 650) / 2}px, rgba(99,102,241,0.06), transparent 50%)`
        }}
      />

      {/* Top Announcement Bar */}
      <div 
        onClick={() => navigate("/products")}
        className="w-full bg-[#0B0F19] dark:bg-[#070A13] border-b border-slate-800/60 py-2.5 px-4 sm:px-8 lg:px-12 flex items-center justify-between text-slate-100 dark:text-white cursor-pointer hover:bg-slate-900/60 transition duration-300 overflow-hidden relative z-20"
      >
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#ff3f6c] animate-pulse" />
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] text-[#ff3f6c] dark:text-[#ff3f6c] select-none">
            MIDNIGHT CAMPAIGN LIVE
          </span>
        </div>

        {/* Scrolling announcement text marquee */}
        <div className="hidden md:flex flex-1 overflow-hidden mx-8 select-none">
          <div className="animate-marquee whitespace-nowrap text-[10px] font-bold text-slate-400 uppercase tracking-widest flex gap-12">
            <span>🔥 CYBER FLASH SEASON IS LIVE: USE COUPON CODE CARTNOW10 FOR 10% OFF</span>
            <span>⚡ OVER 12,410 SHOPPERS TRANSACTING ON THE HUB RIGHT NOW</span>
            <span>📦 FREE DELIVERY ON ALL ORDERS OVER ₹999</span>
            {/* Repeated for seamless marquee loop */}
            <span>🔥 CYBER FLASH SEASON IS LIVE: USE COUPON CODE CARTNOW10 FOR 10% OFF</span>
            <span>⚡ OVER 12,410 SHOPPERS TRANSACTING ON THE HUB RIGHT NOW</span>
            <span>📦 FREE DELIVERY ON ALL ORDERS OVER ₹999</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 select-none">
            <div className="flex -space-x-1.5">
              <img className="inline-block h-5 w-5 rounded-full ring-2 ring-slate-950 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop" alt="" />
              <img className="inline-block h-5 w-5 rounded-full ring-2 ring-slate-950 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop" alt="" />
              <img className="inline-block h-5 w-5 rounded-full ring-2 ring-slate-950 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop" alt="" />
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400">10k+ shopping right now</span>
          </div>
          <ArrowRight size={14} className="text-slate-400 stroke-[2.5]" />
        </div>
      </div>

      <AnimatePresence mode="wait">
      {showBanners && customBanners.length > 0 ? (
        <motion.section
          key="banners"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="relative overflow-visible bg-slate-50 dark:bg-slate-950 text-[#0F172A] dark:text-slate-100 flex items-center justify-center py-16 md:py-24 select-none w-full min-h-[480px] sm:min-h-[550px] lg:min-h-[620px] z-10"
        >
          {/* Main Slider Wrapper */}
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 w-full flex flex-col items-center justify-center relative overflow-visible">
            
            {/* Banner Main Card */}
            <div className={`relative w-full h-[360px] md:h-[400px] rounded-none overflow-visible shadow-2xl flex flex-row items-center border border-slate-200/50 dark:border-white/10 text-slate-100 dark:text-white transition-all duration-500 ${currentBanner.backgroundTheme || 'bg-gradient-to-r from-slate-900 to-indigo-950'}`}>
              
              {/* Glassmorphic sheen layout layers */}
              <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-[1px] rounded-none pointer-events-none" />
              <div className="absolute left-[-20px] top-[10%] w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />

              {/* Left Section (60%) */}
              <div className="w-full lg:w-3/5 h-full flex flex-col justify-center p-8 sm:p-12 z-10 space-y-3 sm:space-y-4 text-left">
                {/* Campaign badge */}
                {currentBanner.badge && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-orange-400 text-[10px] font-black uppercase tracking-widest shadow-sm w-fit animate-pulse">
                    <Flame size={12} className="text-orange-400 fill-orange-400" />
                    <span>{currentBanner.badge}</span>
                  </span>
                )}

                {/* Product brand and name */}
                {currentBanner.productId && (
                  <div className="space-y-0.5">
                    {currentBanner.productId.brand && (
                      <span className="text-[10px] md:text-xs uppercase tracking-widest font-black text-slate-400 block">
                        {currentBanner.productId.brand}
                      </span>
                    )}
                    <h2 
                      onClick={() => navigate(`/product/${currentBanner.productId._id || currentBanner.productId}`)}
                      className="text-sm md:text-base font-extrabold opacity-85 select-text cursor-pointer hover:underline truncate max-w-[90%]"
                    >
                      {currentBanner.productId.name}
                    </h2>
                  </div>
                )}

                {/* Campaign Headings */}
                <div className="space-y-1.5">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight uppercase font-sans drop-shadow-md text-slate-100 dark:text-white">
                    {currentBanner.title}
                  </h1>
                  {currentBanner.subtitle && (
                    <p className="text-[11px] md:text-sm text-slate-300 font-semibold leading-relaxed line-clamp-2 max-w-[95%]">
                      {currentBanner.subtitle}
                    </p>
                  )}
                </div>

                {/* Dynamic Price Display */}
                {currentBanner.productId && (
                  <div className="flex items-center gap-4 flex-wrap pt-0.5">
                    <div className="flex flex-col">
                      <span className="text-[8px] md:text-[9px] uppercase tracking-widest text-slate-400 font-black">Deal Price</span>
                      <span className="text-lg md:text-2xl font-black text-orange-400 select-text">
                        ₹{currentBanner.productId.price}
                      </span>
                    </div>

                    {currentBanner.productId.originalPrice > currentBanner.productId.price && (
                      <>
                        <div className="flex flex-col opacity-60">
                          <span className="text-[8px] md:text-[9px] uppercase tracking-widest text-slate-400 font-black">M.R.P.</span>
                          <span className="text-xs md:text-sm font-bold line-through">₹{currentBanner.productId.originalPrice}</span>
                        </div>
                        <span className="bg-red-500 text-slate-100 dark:text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border border-red-500/20 shadow-md">
                          {Math.round(((currentBanner.productId.originalPrice - currentBanner.productId.price) / currentBanner.productId.originalPrice) * 100)}% OFF
                        </span>
                      </>
                    )}

                    {/* Ratings */}
                    <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-[10px] font-black text-slate-200">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      <span>{currentBanner.productId.averageRating || currentBanner.productId.rating?.average || 4.5}</span>
                      <span className="opacity-60">({currentBanner.productId.reviewCount || currentBanner.productId.rating?.count || 12})</span>
                    </div>
                  </div>
                )}

                {/* Countdown timer & progress bar */}
                {timeLeft && (
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex items-center gap-1.5 bg-black/35 backdrop-blur-xs border border-white/5 px-3 py-1 rounded-xl text-slate-100 dark:text-white">
                      <Hourglass size={12} className="text-orange-400 animate-pulse" />
                      <span className="text-[9px] uppercase tracking-widest font-black mr-1 opacity-70">Ends in:</span>
                      <div className="flex items-center gap-1 text-[11px] font-bold font-mono">
                        <span>{String(timeLeft.days).padStart(2, "0")}d</span>:
                        <span>{String(timeLeft.hours).padStart(2, "0")}h</span>:
                        <span>{String(timeLeft.minutes).padStart(2, "0")}m</span>:
                        <span>{String(timeLeft.seconds).padStart(2, "0")}s</span>
                      </div>
                    </div>
                    
                    {/* Progress Bar showing campaign elapsed time */}
                    <div className="hidden sm:block flex-1 max-w-[120px] h-[3px] bg-white/10 rounded-full overflow-hidden relative">
                      <div 
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-1000"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <div className="pt-2 flex flex-wrap gap-3">
                  {currentBanner.productId && (
                    <button
                      onClick={() => navigate(`/product/${currentBanner.productId._id || currentBanner.productId}`)}
                      className="inline-flex items-center gap-2 sm:gap-2.5 px-6 sm:px-8 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-98 transition text-slate-100 dark:text-white text-[10px] md:text-xs font-black uppercase tracking-widest shadow-md border-none cursor-pointer"
                    >
                      <span>{currentBanner.ctaText || "Shop Now"}</span>
                      <ArrowRight size={13} className="stroke-[3]" />
                    </button>
                  )}
                </div>
              </div>

              {/* Right Section (40%) - Editorial Overflow */}
              <div className="hidden lg:flex w-2/5 h-full relative overflow-visible items-center justify-center">
                {/* Ambient Slogan Label */}
                <span className="absolute text-[80px] xl:text-[100px] font-black text-white/[0.03] uppercase tracking-tighter leading-none select-none pointer-events-none z-0 rotate-[-15deg]">
                  CAMPAIGN
                </span>

                {/* Transparent overflow model image */}
                <img
                  src={currentBanner.modelImage ? (currentBanner.modelImage.startsWith("http") ? currentBanner.modelImage : `${backendUrl}${currentBanner.modelImage}`) : (currentBanner.image ? (currentBanner.image.startsWith("http") ? currentBanner.image : `${backendUrl}${currentBanner.image}`) : "")}
                  alt={currentBanner.title}
                  fetchPriority="high"
                  decoding="sync"
                  style={{
                    WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 8%)",
                  }}
                  className="absolute top-[-70px] md:top-[-90px] xl:top-[-110px] right-[-10px] xl:right-[-20px] h-[135%] md:h-[140%] xl:h-[145%] w-auto object-contain object-bottom select-none z-10 drop-shadow-2xl transition duration-500 hover:scale-[1.03] pointer-events-none"
                />

                {/* Floating catalog item card */}
                {currentBanner.productId && currentBanner.productId.images?.[0] && (
                  <div 
                    onClick={() => navigate(`/product/${currentBanner.productId._id || currentBanner.productId}`)}
                    className="absolute bottom-6 left-[-30px] z-20 bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/[0.08] p-2 rounded-none flex items-center gap-2.5 shadow-xl hover:bg-white/20 dark:hover:bg-slate-900/80 cursor-pointer transition select-none animate-float-slow"
                  >
                    <img 
                      src={currentBanner.productId.images?.[0]?.startsWith("http") ? currentBanner.productId.images[0] : `${backendUrl}/${currentBanner.productId.images?.[0] || ""}`} 
                      alt="" 
                      className="w-9 h-9 object-contain bg-white dark:bg-slate-900 rounded-none p-1 border border-slate-200/50"
                    />
                    <div className="text-slate-100 dark:text-white text-[9px] font-bold tracking-tight pr-1.5 flex flex-col justify-center text-left">
                      <span className="opacity-60 text-[6.5px] uppercase font-black tracking-widest leading-none">Featured Item</span>
                      <span className="leading-tight truncate max-w-[90px] font-black">{currentBanner.productId.name}</span>
                    </div>
                  </div>
                )}

                {/* Floating discount badge */}
                {currentBanner.productId && currentBanner.productId.originalPrice > currentBanner.productId.price && (
                  <div className="absolute top-8 right-10 z-20 bg-orange-500 text-slate-100 dark:text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg border border-white/20 rotate-[12deg] animate-pulse">
                    Save {Math.round(((currentBanner.productId.originalPrice - currentBanner.productId.price) / currentBanner.productId.originalPrice) * 100)}%
                  </div>
                )}
              </div>

              {/* On Mobile / Small screens, show a subtle background image of the model */}
              <div className="absolute inset-0 block lg:hidden z-0 opacity-[0.08] pointer-events-none rounded-none overflow-hidden">
                <img
                  src={currentBanner.modelImage ? (currentBanner.modelImage.startsWith("http") ? currentBanner.modelImage : `${backendUrl}${currentBanner.modelImage}`) : (currentBanner.image ? (currentBanner.image.startsWith("http") ? currentBanner.image : `${backendUrl}${currentBanner.image}`) : "")}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>

            {/* Slide Navigation Dots */}
            <div className="flex justify-center gap-2.5 mt-6 z-20">
              {customBanners.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSlideIdx(i);
                  }}
                  className={`h-2.5 rounded-full transition-all duration-300 ${ slideIdx === i ? "w-8 bg-orange-500 shadow-md" : "w-2.5 bg-slate-300 dark:bg-slate-800 hover:bg-slate-400 dark:hover:bg-slate-700" }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </motion.section>
      ) : (
        <motion.section
          key="models"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden h-auto lg:h-[calc(100vh-var(--navbar-height,80px))] bg-gradient-to-br from-[#FFFFFF] via-[#FCFCFD] to-[#F9F9FB] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-[#0F172A] dark:text-slate-100 flex items-center py-12 select-none w-full min-h-[580px] z-10"
        >
          <style>{`
            @keyframes rotate-slow {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes pulse-slow {
              0%, 100% { opacity: 0.35; transform: scale(1); }
              50% { opacity: 0.7; transform: scale(1.1); }
            }
            @keyframes marquee {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
            @keyframes twinkle {
              0%, 100% { transform: scale(0.5) rotate(0deg); opacity: 0.15; }
              50% { transform: scale(1.3) rotate(180deg); opacity: 0.85; }
            }
            .animate-rotate-slow { animation: rotate-slow 28s linear infinite; }
            .animate-pulse-slow { animation: pulse-slow 5s ease-in-out infinite; }
            .animate-marquee { display: inline-block; animation: marquee 20s linear infinite; }
            .animate-twinkle { animation: twinkle 4s ease-in-out infinite; }
            .animate-twinkle-delayed { animation: twinkle 5s ease-in-out infinite 1.5s; }
          `}</style>

          {/* Ambient Lighting Mesh Gradient Overlay */}
          <div className="absolute top-[10%] right-[15%] w-96 h-96 bg-indigo-500/[0.04] dark:bg-indigo-500/[0.08] rounded-full blur-[140px] pointer-events-none z-0" />
          <div className="absolute bottom-[20%] left-[10%] w-[350px] h-[350px] bg-rose-500/[0.03] dark:bg-rose-500/[0.05] rounded-full blur-[120px] pointer-events-none z-0" />

          {/* Balanced 50/50 Composition Grid */}
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10 relative">

            {/* Left Side Content Area */}
            <div className="flex flex-col space-y-5 lg:space-y-6 text-left max-w-xl mx-auto lg:mx-0 items-start z-10 relative">
              
              {/* Dynamic Headline with reveal animation */}
              <div className="min-h-[140px] md:min-h-[180px] lg:min-h-[220px] flex flex-col justify-center w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={slideIdx}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-3"
                  >
                    {/* Social proof rating */}
                    <div className="flex items-center gap-2 flex-wrap select-none">
                      <div className="flex gap-0.5 text-amber-500">
                        <Star size={11} className="fill-amber-400 text-amber-400" />
                        <Star size={11} className="fill-amber-400 text-amber-400" />
                        <Star size={11} className="fill-amber-400 text-amber-400" />
                        <Star size={11} className="fill-amber-400 text-amber-400" />
                        <Star size={11} className="fill-amber-400 text-amber-400" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        4.9★ rating (45k+ buyers)
                      </span>
                    </div>

                    <span className="text-[9px] sm:text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block select-none">
                      {currentSlide.category}
                    </span>

                    {/* Word-by-word title reveal */}
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.05] tracking-tight text-slate-900 dark:text-white flex flex-wrap gap-x-2.5">
                      {currentSlide.name.split(" ").map((word, wIdx) => (
                        <span key={wIdx} className="overflow-hidden inline-block py-0.5">
                          <motion.span
                            variants={{
                              hidden: { y: "40px", opacity: 0 },
                              visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
                            }}
                            className="inline-block"
                          >
                            {word}
                          </motion.span>
                        </span>
                      ))}
                    </h1>

                    <p className="text-[11.5px] sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed font-semibold mt-1 sm:mt-2">
                      {currentSlide.tagline}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Premium Offer/Coupon Card */}
              <div 
                onClick={copyCoupon}
                className="flex items-center gap-3.5 bg-slate-900/5 dark:bg-slate-900/40 border border-amber-500/20 dark:border-amber-500/10 rounded-2xl px-4 py-3 select-none w-full sm:w-fit text-left hover:border-amber-500/40 transition duration-300 shadow-md cursor-pointer relative group/coupon overflow-hidden"
              >
                {/* Active hover reflection sheen */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/[0.05] to-transparent -translate-x-full group-hover/coupon:translate-x-full transition-transform duration-1000" />
                
                <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/25 shrink-0 flex items-center justify-center">
                  <Award size={18} className="text-amber-500 dark:text-amber-400" />
                </div>
                
                <div className="flex-1 leading-tight pr-2">
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">First Purchase Discount</span>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mt-0.5">
                    Save an extra 10% on your first order.
                  </span>
                </div>
                
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-300 border ${
                    couponCopied 
                      ? "bg-emerald-500 border-emerald-500 text-white" 
                      : "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {couponCopied ? "✓ Copied" : "Copy: CARTNOW10"}
                </button>
              </div>

              {/* Action CTAs with magnetic hover scales */}
              <div className="flex flex-wrap gap-4 items-center w-full">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleModelClick(currentSlide.category)}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest border-none bg-slate-900 dark:bg-[#ff3f6c] text-white hover:bg-slate-800 dark:hover:bg-[#e0355c] cursor-pointer shadow-lg shadow-indigo-500/10 dark:shadow-rose-500/25 transition-all duration-200"
                >
                  <span>Shop Now</span>
                  <ArrowRight size={13} className="stroke-[3]" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/products")}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-transparent text-slate-800 dark:text-white text-xs font-black uppercase tracking-widest border border-slate-300 dark:border-white/20 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer shadow-sm transition-all duration-200"
                >
                  <LayoutGrid size={13} className="stroke-[2.5]" />
                  <span>View Catalog</span>
                </motion.button>
              </div>

              {/* Category count pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1 z-10 w-full justify-start select-none">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 mr-1">Popular Categories:</span>
                {["Men", "Women", "Kids", "Sneakers", "Electronics", "Beauty"].map((tag) => (
                  <motion.button
                    key={tag}
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleModelClick(tag)}
                    className="text-[10.5px] font-bold px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/40 dark:border-slate-800/80 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <span>{tag}</span>
                    <span className="text-[8.5px] opacity-50 font-mono">({categoryCounts[tag]})</span>
                  </motion.button>
                ))}
              </div>

              {/* Slide Navigation Dots */}
              <div className="flex items-center justify-start gap-2.5 pt-2 select-none">
                {activeSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSlideIdx(i);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${slideIdx === i ? "w-8 bg-[#ff3f6c]" : "w-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700" }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-600 pt-5 border-t border-slate-200/40 dark:border-slate-800/80 sm:flex sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-3 select-none">
                <div className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-300 transition-colors duration-250">
                  <ShieldCheck size={14} className="text-emerald-500 stroke-[2.5]" />
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-300 transition-colors duration-250">
                  <Truck size={14} className="text-indigo-500 stroke-[2.5]" />
                  <span>Express Shipping</span>
                </div>
                <div className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-300 transition-colors duration-250">
                  <RotateCcw size={14} className="text-rose-500 stroke-[2.5]" />
                  <span>Easy Returns</span>
                </div>
              </div>
            </div>

            {/* Right Side Product / Model Area */}
            <div className="relative w-full h-full min-h-[350px] sm:min-h-[450px] lg:min-h-[500px] flex items-end justify-center select-none bg-transparent z-10 pointer-events-auto overflow-visible">
              
              {/* Twinkling Gold Stars */}
              <div className="absolute inset-0 pointer-events-none z-0">
                <Sparkles size={16} className="absolute top-[15%] left-[10%] text-amber-400/70 animate-twinkle" />
                <Sparkles size={12} className="absolute top-[35%] right-[5%] text-amber-400/60 animate-twinkle-delayed" />
                <Sparkles size={14} className="absolute bottom-[25%] left-[25%] text-amber-400/50 animate-twinkle" />
              </div>

              {/* Circular Golden Glowing Paths around model */}
              <div className="absolute w-[80%] h-[80%] max-w-[400px] max-h-[400px] rounded-full border border-slate-200/30 dark:border-white/[0.04] pointer-events-none z-0" />
              <div className="absolute w-[95%] h-[95%] max-w-[460px] max-h-[460px] rounded-full border border-dashed border-slate-200/20 dark:border-white/[0.02] pointer-events-none z-0 animate-rotate-slow" />

              {/* Aura Backdrop Circle */}
              <div className="absolute w-[75%] h-[75%] max-w-[380px] max-h-[380px] rounded-full bg-[#3B82F6]/[0.02] dark:bg-indigo-500/[0.03] blur-[30px] z-0" />

              {/* Cross-fading Slideshow Container with Parallax and Float */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={slideIdx}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.04 }}
                  transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 w-full h-full flex items-end justify-center overflow-visible"
                >
                  {/* Floating Model Container (shifted by mouse parallax) */}
                  <motion.div
                    animate={{
                      x: mousePosition.x * 0.8,
                      y: mousePosition.y * 0.8
                    }}
                    transition={{ type: "spring", stiffness: 120, damping: 18 }}
                    className="absolute bottom-0 inset-x-0 h-[88%] w-full flex items-end justify-center select-none cursor-pointer z-10"
                    onClick={() => handleModelClick(currentSlide.category)}
                  >
                    <motion.div
                      animate={{
                        y: [0, -10, 0]
                      }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="h-full w-full flex items-end justify-center"
                    >
                      <img
                        src={currentSlide.imageUrl}
                        alt={currentSlide.name}
                        fetchPriority="high"
                        decoding="sync"
                        style={{
                          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 10%)",
                        }}
                        className={`h-full max-h-full object-contain object-bottom select-none z-10 transition-transform duration-700 ${currentSlide.scaleClass || "scale-100"}`}
                      />
                    </motion.div>
                  </motion.div>

                  {/* Glassmorphic AI recommendation snippet floating on left */}
                  <motion.div
                    animate={{
                      x: mousePosition.x * 1.4 - 15,
                      y: mousePosition.y * 1.4 - 20
                    }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="absolute top-[22%] left-[-15px] bg-white/20 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-white/[0.08] px-3.5 py-2.5 rounded-2xl shadow-xl max-w-[170px] text-left hidden sm:block z-20 pointer-events-none"
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[8.5px] font-black uppercase text-indigo-600 dark:text-indigo-400">
                      <Sparkles size={11} className="fill-indigo-500/20" />
                      <span>AI Choice</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 leading-tight block">
                      Matches trending seasonal aesthetics
                    </span>
                  </motion.div>

                  {/* Glassmorphic review snippet floating on right */}
                  <motion.div
                    animate={{
                      x: mousePosition.x * 1.3 + 15,
                      y: mousePosition.y * 1.3 + 20
                    }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="absolute top-[38%] right-[-15px] bg-white/20 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-white/[0.08] p-3.5 rounded-2xl shadow-xl max-w-[175px] text-left hidden lg:block z-20 pointer-events-none"
                  >
                    <p className="text-[9.5px] text-slate-600 dark:text-slate-300 font-semibold italic leading-relaxed">
                      "Premium build quality. Fits absolutely perfectly."
                    </p>
                    <span className="text-[9px] font-black text-amber-500 dark:text-amber-400 mt-1.5 block">
                      ★ 4.9 Aarav S.
                    </span>
                  </motion.div>

                  {/* Popularity Meter floating at bottom-right */}
                  <motion.div
                    animate={{
                      x: mousePosition.x * 1.1 + 10,
                      y: mousePosition.y * 1.1 + 10
                    }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="absolute bottom-[10%] right-[5%] bg-white/20 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-white/[0.08] p-3 rounded-2xl shadow-xl w-36 text-left hidden sm:block z-20 pointer-events-none"
                  >
                    <div className="flex justify-between items-center text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 mb-1">
                      <span>Demand</span>
                      <span className="text-orange-500">97% High</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="w-[97%] h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full" />
                    </div>
                    <span className="text-[8.5px] font-bold text-slate-500 dark:text-slate-400 mt-1 block">
                      12k+ items sold this week
                    </span>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </motion.section>
      )}
      </AnimatePresence>

      {/* Floating Glassmorphic Deal of the Day Badge */}
      {hasActiveDeal && (
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          animate={{ y: ["-50%", "-55%", "-50%"] }}
          transition={{
            y: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          onClick={onShowDealOfDay}
          className="fixed md:absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center justify-center gap-1.5 p-3 rounded-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-orange-500/30 dark:border-orange-500/20 hover:border-orange-500/60 dark:hover:border-orange-500/40 shadow-lg cursor-pointer transition-all duration-300 select-none group"
          style={{
            boxShadow: "0 0 20px rgba(249, 115, 22, 0.15)",
          }}
        >
          {/* Pulsing glow ring around icon */}
          <div className="relative w-10 h-10 flex items-center justify-center rounded-none bg-orange-500/10 text-orange-500 group-hover:bg-orange-500/20 transition-colors">
            <Flame size={20} className="fill-orange-500/20 animate-pulse" />
            <span className="absolute inset-0 rounded-none border border-orange-500/40 animate-ping opacity-60 pointer-events-none" />
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400">
            Deal
          </span>
        </motion.button>
      )}
    </div>
  );
};

export default HomeHero;
