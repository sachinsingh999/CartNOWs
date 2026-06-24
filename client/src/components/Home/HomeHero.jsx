import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { backendUrl } from "../../config";
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
  Award
} from "lucide-react";

// Import local premium WebP studio campaign photography assets
import womensFashionFallback from "../../assets/brand_asset_womens_fashion.webp";
import mensFashionFallback from "../../assets/brand_asset_mens_fashion.webp";
import sneakersFallback from "../../assets/brand_asset_sneakers.webp";
import electronicsFallback from "../../assets/brand_asset_electronics.webp";
import beautyFallback from "../../assets/brand_asset_beauty.webp";
import accessoriesFallback from "../../assets/brand_asset_accessories.webp";
import sportswearFallback from "../../assets/brand_asset_sportswear.webp";

const HomeHero = () => {
  const navigate = useNavigate();
  const [slideIdx, setSlideIdx] = useState(0);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customBanners, setCustomBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showBanners, setShowBanners] = useState(false);

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
      tagline: "Timeless Minimalist Tailoring",
      scaleClass: "scale-[1.0] sm:scale-[1.05] lg:scale-[1.12]"
    },
    {
      imageUrl: mensFashionFallback,
      name: "Men's Premium Edit",
      category: "Men's Fashion",
      tagline: "Structured Modern Classics",
      scaleClass: "scale-[1.0] sm:scale-[1.05] lg:scale-[1.12]"
    },
    {
      imageUrl: sneakersFallback,
      name: "Sneakers Campaign",
      category: "Sneakers",
      tagline: "High-Performance Silhouettes",
      scaleClass: "scale-[1.0] sm:scale-[1.05] lg:scale-[1.12]"
    },
    {
      imageUrl: electronicsFallback,
      name: "Smart Audio Collection",
      category: "Electronics",
      tagline: "Pure Sound. Zero Noise.",
      scaleClass: "scale-[0.85] sm:scale-[0.9] lg:scale-[0.95]"
    },
    {
      imageUrl: beautyFallback,
      name: "Advanced Skincare",
      category: "Beauty",
      tagline: "Radiant Skin Science",
      scaleClass: "scale-[0.85] sm:scale-[0.9] lg:scale-[0.95]"
    },
    {
      imageUrl: accessoriesFallback,
      name: "Designer Accents",
      category: "Accessories",
      tagline: "Bold Silhouettes, Refined Craft",
      scaleClass: "scale-[0.9] sm:scale-[0.95] lg:scale-[1.02]"
    },
    {
      imageUrl: sportswearFallback,
      name: "High-Active Collection",
      category: "Sportswear",
      tagline: "Engineered For Peak Performance",
      scaleClass: "scale-[1.0] sm:scale-[1.05] lg:scale-[1.12]"
    }
  ];

  const fallbackSlidesDark = [
    {
      imageUrl: womensFashionFallback,
      name: "Midnight Luxury Line",
      category: "Women's Fashion",
      tagline: "Obsidian Tailoring & Modern Silhouette",
      scaleClass: "scale-[1.0] sm:scale-[1.05] lg:scale-[1.12]"
    },
    {
      imageUrl: mensFashionFallback,
      name: "Noir Silhouette Edit",
      category: "Men's Fashion",
      tagline: "Dark-Theme Tailored Classics",
      scaleClass: "scale-[1.0] sm:scale-[1.05] lg:scale-[1.12]"
    },
    {
      imageUrl: sneakersFallback,
      name: "Cyber Sneakers Campaign",
      category: "Sneakers",
      tagline: "Neon Accents. Infinite Speed.",
      scaleClass: "scale-[1.0] sm:scale-[1.05] lg:scale-[1.12]"
    },
    {
      imageUrl: electronicsFallback,
      name: "Obsidian Sound Systems",
      category: "Electronics",
      tagline: "Acoustic Purity. Pure Silence.",
      scaleClass: "scale-[0.85] sm:scale-[0.9] lg:scale-[0.95]"
    },
    {
      imageUrl: beautyFallback,
      name: "Nocturnal Beauty Edit",
      category: "Beauty",
      tagline: "Midnight Restoration Science",
      scaleClass: "scale-[0.85] sm:scale-[0.9] lg:scale-[0.95]"
    },
    {
      imageUrl: accessoriesFallback,
      name: "Dark Chrome Accents",
      category: "Accessories",
      tagline: "Refined Leather & Steel Craft",
      scaleClass: "scale-[0.9] sm:scale-[0.95] lg:scale-[1.02]"
    },
    {
      imageUrl: sportswearFallback,
      name: "Neon Activewear Line",
      category: "Sportswear",
      tagline: "Engineered For Night Workouts",
      scaleClass: "scale-[1.0] sm:scale-[1.05] lg:scale-[1.12]"
    }
  ];

  // Fetch campaign slideshow assets and banners from server
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        // Fetch public categories
        try {
          const catRes = await axios.get(`${backendUrl}/api/product/categories`);
          if (catRes.data?.success) {
            setCategories(catRes.data.categories || []);
          }
        } catch (catErr) {
          console.error("Failed to fetch categories:", catErr);
        }

        // Fetch banners
        let activeBanners = [];
        try {
          const bannerRes = await axios.get(`${backendUrl}/api/banners`);
          if (bannerRes.data?.success && bannerRes.data?.banners?.length > 0) {
            activeBanners = bannerRes.data.banners;
            setCustomBanners(activeBanners);
          }
        } catch (bannerErr) {
          console.error("Failed to fetch banners:", bannerErr);
        }

        // Fetch cutout assets unconditionally to support transition from banner to models slideshow
        try {
          const response = await axios.get(`${backendUrl}/api/system/hero-assets`);
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
          tagline = "Obsidian Tailoring & Modern Silhouette";
        } else if (cat.includes("men")) {
          name = "Noir Silhouette Edit";
          tagline = "Dark-Theme Tailored Classics";
        } else if (cat.includes("sneakers") || cat.includes("shoes")) {
          name = "Cyber Sneakers Campaign";
          tagline = "Neon Accents. Infinite Speed.";
        } else if (cat.includes("electronics") || cat.includes("sound")) {
          name = "Obsidian Sound Systems";
          tagline = "Acoustic Purity. Pure Silence.";
        } else if (cat.includes("beauty") || cat.includes("skin")) {
          name = "Nocturnal Beauty Edit";
          tagline = "Midnight Restoration Science";
        } else if (cat.includes("accessories")) {
          name = "Dark Chrome Accents";
          tagline = "Refined Leather & Steel Craft";
        } else if (cat.includes("sport") || cat.includes("active")) {
          name = "Neon Activewear Line";
          tagline = "Engineered For Night Workouts";
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

  // Auto slide every 5 seconds (5000ms)
  useEffect(() => {
    const totalSlides = showBanners ? customBanners.length : activeSlides.length;
    if (totalSlides <= 1) return;
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(timer);
  }, [showBanners, customBanners.length, activeSlides.length]);

  // Preload all slide images for ultra-smooth lag-free transitions
  useEffect(() => {
    const listToPreload = customBanners.length > 0 ? customBanners : activeSlides;
    if (!listToPreload || listToPreload.length === 0) return;
    
    listToPreload.forEach((slide) => {
      const src = slide.image || slide.imageUrl;
      if (src) {
        const img = new Image();
        img.src = src;
      }
    });
  }, [customBanners, activeSlides]);

  const currentSlide = activeSlides[slideIdx] || fallbackSlides[0];

  const slideBadges = useMemo(() => {
    const cat = (currentSlide.category || "").toLowerCase();
    if (cat.includes("women")) {
      return {
        badge1: { text: "Premium Fit", icon: Sparkles, iconColor: "text-rose-500" },
        badge2: { text: "Trending Now", icon: Flame, iconColor: "text-orange-500" },
        badge3: { text: "50% Off", icon: Tag, iconColor: "text-emerald-500" }
      };
    } else if (cat.includes("men")) {
      return {
        badge1: { text: "Structured Fit", icon: Zap, iconColor: "text-indigo-500" },
        badge2: { text: "New Season", icon: Sparkles, iconColor: "text-purple-500" },
        badge3: { text: "4.9 Rating", icon: Star, iconColor: "text-amber-500" }
      };
    } else if (cat.includes("sneaker") || cat.includes("shoes")) {
      return {
        badge1: { text: "Limited Edition", icon: Compass, iconColor: "text-teal-500" },
        badge2: { text: "Ultra Cushion", icon: Sparkles, iconColor: "text-blue-500" },
        badge3: { text: "High Demand", icon: Flame, iconColor: "text-rose-500" }
      };
    } else if (cat.includes("electr") || cat.includes("audio")) {
      return {
        badge1: { text: "Active ANC", icon: Headphones, iconColor: "text-violet-500" },
        badge2: { text: "Hi-Res Audio", icon: Music, iconColor: "text-pink-500" },
        badge3: { text: "Smart Connect", icon: Radio, iconColor: "text-blue-500" }
      };
    } else if (cat.includes("beauty") || cat.includes("skin")) {
      return {
        badge1: { text: "Organic Extract", icon: Leaf, iconColor: "text-emerald-500" },
        badge2: { text: "Hydration Pro", icon: Droplet, iconColor: "text-cyan-500" },
        badge3: { text: "Derm Tested", icon: FlaskConical, iconColor: "text-purple-500" }
      };
    }
    return {
      badge1: { text: "Fast Shipping", icon: Truck, iconColor: "text-indigo-550" },
      badge2: { text: "Best Seller", icon: Award, iconColor: "text-amber-550" },
      badge3: { text: "Top Rated", icon: Star, iconColor: "text-yellow-550" }
    };
  }, [currentSlide]);

  const handleBannerClick = (categoryIds) => {
    if (categoryIds && categoryIds.length > 0) {
      navigate(`/products?categories=${categoryIds.join(",")}`);
    } else {
      navigate("/products");
    }
  };

  const handleModelClick = (categoryName) => {
    if (!categoryName) {
      navigate("/products");
      return;
    }

    // Find the category _id in the fetched categories list
    const foundCat = categories.find(
      (c) => c.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (foundCat) {
      navigate(`/products?categories=${foundCat._id}`);
    } else {
      // Fallback: search by query string if _id not found
      navigate(`/products?q=${encodeURIComponent(categoryName.toLowerCase())}`);
    }
  };

  const currentBanner = customBanners[slideIdx] || customBanners[0];

  return (
    <AnimatePresence mode="wait">
      {showBanners && customBanners.length > 0 ? (
        <motion.section
          key="banners"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden h-[calc(100vh-var(--navbar-height,80px))] min-h-[480px] sm:min-h-[600px] lg:min-h-[750px] xl:min-h-[850px] bg-slate-900 text-white flex items-center select-none w-full"
        >
          <style>{`
            @keyframes zoom-slow {
              0% { transform: scale(1); }
              100% { transform: scale(1.05); }
            }
            .animate-zoom-slow {
              animation: zoom-slow 8s ease-out forwards;
            }
          `}</style>

          {/* Banner Images Cross-fade */}
          <div className="absolute inset-0 w-full h-full">
            <AnimatePresence>
              <motion.div
                key={slideIdx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                onClick={() => handleBannerClick(currentBanner.categoryIds)}
                className="absolute inset-0 w-full h-full cursor-pointer overflow-hidden group"
              >
                {/* Background Image */}
                <img
                  src={currentBanner.image.startsWith("http") ? currentBanner.image : `${backendUrl}${currentBanner.image}`}
                  alt={currentBanner.title}
                  className="w-full h-full object-cover animate-zoom-slow"
                />

                {/* Gradient Overlay for Legibility */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />

                {/* Overlaid Content */}
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 w-full text-left">
                    <div className="max-w-2xl space-y-4 sm:space-y-6">
                      {/* Category Tags */}
                      <div className="flex flex-wrap gap-2.5 z-10 relative justify-center lg:justify-start">
                        {currentBanner.categoryIds && currentBanner.categoryIds.map(catId => {
                          const found = categories.find(c => c._id === catId);
                          return (
                            <span key={catId} className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-orange-400 border border-white/20 text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-md flex items-center gap-1.5">
                              <Sparkles size={10} className="text-orange-400 animate-pulse" />
                              <span>{found ? found.name : "Category"}</span>
                            </span>
                          );
                        })}
                      </div>

                      {/* Title */}
                      <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.02] tracking-tighter text-white drop-shadow-md z-10 relative text-center lg:text-left"
                      >
                        {currentBanner.title}
                      </motion.h1>

                      {/* Subtitle */}
                      {currentBanner.subtitle && (
                        <motion.p
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                          className="text-xs sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-200 leading-relaxed font-semibold max-w-2xl drop-shadow-sm z-10 relative text-center lg:text-left"
                        >
                          {currentBanner.subtitle}
                        </motion.p>
                      )}

                      {/* CTA Button */}
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="pt-2 sm:pt-4 z-10 relative flex justify-center lg:justify-start"
                      >
                        <span className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-10 py-3 sm:py-4.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-orange-550 to-red-600 hover:from-orange-600 hover:to-red-750 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-500/25 active:scale-98 transition-all duration-300">
                          <span>Shop The Collection</span>
                          <ArrowRight size={14} className="stroke-[3]" />
                        </span>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Cinematic Ambient Glow Backlights */}
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[160px] pointer-events-none z-0" />
          <div className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[140px] pointer-events-none z-0" />

          {/* Indicators / Navigation Dots */}
          <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center gap-3">
            {customBanners.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setSlideIdx(i);
                }}
                className={`h-3 rounded-full transition-all duration-300 ${
                  slideIdx === i 
                    ? "w-10 bg-gradient-to-r from-orange-500 to-red-500 shadow-md" 
                    : "w-3 bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </motion.section>
      ) : (
        <motion.section
          key="models"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden h-[560px] sm:h-[650px] lg:h-[calc(100vh-var(--navbar-height,80px))] bg-gradient-to-br from-[#FFFFFF] via-[#FCFCFD] to-[#F9F9FB] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-[#0F172A] dark:text-slate-100 flex items-center py-10 lg:py-12 select-none w-full"
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
            @keyframes float-orb-1 {
              0%, 100% { transform: translate(0px, 0px) scale(1); }
              33% { transform: translate(40px, -60px) scale(1.1); }
              66% { transform: translate(-30px, 30px) scale(0.9); }
            }
            @keyframes float-orb-2 {
              0%, 100% { transform: translate(0px, 0px) scale(1.05); }
              50% { transform: translate(-50px, 50px) scale(0.9); }
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
            .animate-orb-1 { animation: float-orb-1 12s ease-in-out infinite; }
            .animate-orb-2 { animation: float-orb-2 14s ease-in-out infinite; }
            .animate-marquee { display: inline-block; animation: marquee 24s linear infinite; }
          `}</style>
          {/* Subtle Ambient Lighting Overlay */}
          {isDark ? (
            <>
              <div className="absolute top-[10%] right-[15%] w-96 h-96 bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
              <div className="absolute bottom-[20%] left-[10%] w-[350px] h-[350px] bg-rose-500/5 rounded-full blur-[120px] pointer-events-none" />
            </>
          ) : (
            <>
              <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#7C3AED]/3 dark:bg-[#7C3AED]/2 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-[#3B82F6]/3 dark:bg-[#3B82F6]/1 rounded-full blur-3xl pointer-events-none" />
            </>
          )}

          <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-[45%_55%] gap-8 lg:gap-12 items-center z-10 relative">

            {/* Left Side Content Area */}
            <div className="flex flex-col space-y-5 lg:space-y-6 text-center lg:text-left max-w-xl mx-auto lg:mx-0 items-center lg:items-start z-10 relative">

              {/* Social Proof + Announcement Row */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800 shadow-xs w-fit text-[9px] font-black uppercase tracking-[0.2em] text-[#4F46E5] dark:text-indigo-455">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] dark:bg-indigo-400 animate-pulse" />
                  <span>{isDark ? "Midnight Campaign Live" : "New Campaign Live"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1.5">
                    <img className="inline-block h-5 w-5 rounded-full ring-2 ring-white dark:ring-slate-950" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop" alt="" />
                    <img className="inline-block h-5 w-5 rounded-full ring-2 ring-white dark:ring-slate-950" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop" alt="" />
                    <img className="inline-block h-5 w-5 rounded-full ring-2 ring-white dark:ring-slate-950" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop" alt="" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">10k+ shopping right now</span>
                </div>
              </div>

              {/* Dynamic Headline: updates dynamically per slide */}
              <div className="min-h-[140px] md:min-h-[180px] lg:min-h-[220px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={slideIdx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="space-y-2.5"
                  >
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      {currentSlide.category}
                    </span>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.05] tracking-tight text-slate-900 dark:text-white">
                      {currentSlide.name}
                    </h1>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed font-medium mt-3">
                      {currentSlide.tagline}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* First Purchase Promo Banner */}
              <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-500/10 to-indigo-500/5 border border-emerald-500/20 dark:border-emerald-500/30 rounded-2xl px-4 py-2.5 select-none w-fit mx-auto lg:mx-0 text-left">
                <span className="text-xs animate-bounce">🎉</span>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">First Purchase Offer</span>
                  <span className="text-[10.5px] font-bold text-slate-505 dark:text-slate-350">Get extra 10% off with coupon code <span className="font-mono bg-emerald-500/20 text-emerald-700 dark:text-emerald-350 px-1.5 py-0.5 rounded font-black border border-emerald-500/25">CARTNOW10</span></span>
                </div>
              </div>

              {/* Action CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-center lg:justify-start w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleModelClick(currentSlide.category)}
                  className="inline-flex items-center justify-center gap-2.5 px-6 xl:px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer border-none bg-slate-900 text-white dark:bg-[#ff3f6c] dark:text-white hover:bg-slate-800 dark:hover:bg-[#e0355c] shadow-lg shadow-indigo-500/10 dark:shadow-rose-500/20"
                >
                  <span>Shop Now</span>
                  <ArrowRight size={14} className="stroke-[2.5]" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/products")}
                  className="inline-flex items-center justify-center gap-2 px-6 xl:px-8 py-3 rounded-xl bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-205 text-xs font-bold uppercase tracking-widest border border-slate-200/80 dark:border-slate-800 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition-all"
                >
                  <span>View Catalog</span>
                </motion.button>
              </div>

              {/* Quick Shop Category Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 pt-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 mr-1.5">Shop Popular:</span>
                {["Men", "Women", "Kids", "Sneakers", "Electronics", "Beauty"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => navigate(`/product?q=${tag.toLowerCase()}`)}
                    className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/80 transition cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Indicators / Dots */}
              <div className="flex items-center justify-center lg:justify-start gap-2.5 pt-2">
                {activeSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSlideIdx(i);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${slideIdx === i
                        ? "w-8 bg-[#ff3f6c] dark:bg-[#ff3f6c]"
                        : "w-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-350 dark:hover:bg-slate-700"
                      }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-555 pt-5 border-t border-slate-200/50 dark:border-slate-800/80 sm:flex sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-3">
                <div className="flex items-center gap-2 hover:text-slate-855 dark:hover:text-slate-300 transition-colors duration-250">
                  <ShieldCheck size={14} className="text-emerald-500 stroke-[2.5]" />
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2 hover:text-slate-855 dark:hover:text-slate-300 transition-colors duration-250">
                  <Truck size={14} className="text-indigo-500 stroke-[2.5]" />
                  <span>Express Shipping</span>
                </div>
                <div className="flex items-center gap-2 hover:text-slate-855 dark:hover:text-slate-300 transition-colors duration-250">
                  <RotateCcw size={14} className="text-rose-500 stroke-[2.5]" />
                  <span>Easy Returns</span>
                </div>
              </div>
            </div>

            {/* Right Side Luxury Slideshow Component */}
            <div className="absolute lg:relative inset-0 lg:inset-auto w-full h-full lg:h-[85%] xl:h-[90%] flex items-end justify-center select-none bg-transparent opacity-40 dark:opacity-20 lg:opacity-100 z-0 pointer-events-none lg:pointer-events-auto">

              {/* Ambient Glow Backlight behind the model (Clean and Minimalist) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
                {/* Elegant Studio Aura Backdrop Circle */}
                <div className="absolute w-[80%] h-[80%] max-w-[420px] max-h-[420px] rounded-full border border-slate-200/40 dark:border-slate-800/40 bg-white/5 dark:bg-slate-900/5 backdrop-blur-[2px] z-0" />

                <AnimatePresence>
                  <motion.div
                    key={slideIdx}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.95 }}
                    exit={{ scale: 1.05, opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute w-[90%] h-[90%] rounded-full blur-[80px] animate-pulse-slow z-0"
                    style={{
                      background: isDark
                        ? `radial-gradient(circle, ${currentSlide.category?.toLowerCase().includes("women") ? "rgba(236,72,153,0.3)" :
                          currentSlide.category?.toLowerCase().includes("men") ? "rgba(59,130,246,0.3)" :
                            currentSlide.category?.toLowerCase().includes("sneaker") ? "rgba(20,184,166,0.3)" :
                              currentSlide.category?.toLowerCase().includes("electr") ? "rgba(245,158,11,0.3)" :
                                currentSlide.category?.toLowerCase().includes("beauty") ? "rgba(168,85,247,0.3)" :
                                  currentSlide.category?.toLowerCase().includes("access") ? "rgba(16,185,129,0.3)" :
                                    "rgba(239,68,68,0.3)"
                        } 0%, transparent 70%)`
                        : `radial-gradient(circle, ${currentSlide.category?.toLowerCase().includes("women") ? "rgba(236,72,153,0.18)" :
                          currentSlide.category?.toLowerCase().includes("men") ? "rgba(59,130,246,0.18)" :
                            currentSlide.category?.toLowerCase().includes("sneaker") ? "rgba(20,184,166,0.18)" :
                              currentSlide.category?.toLowerCase().includes("electr") ? "rgba(245,158,11,0.18)" :
                                currentSlide.category?.toLowerCase().includes("beauty") ? "rgba(168,85,247,0.18)" :
                                  currentSlide.category?.toLowerCase().includes("access") ? "rgba(16,185,129,0.18)" :
                                    "rgba(239,68,68,0.18)"
                        } 0%, transparent 70%)`
                    }}
                  />
                </AnimatePresence>
              </div>

              {/* Cross-fading Slideshow Container with Premium Entrance and Floating Animation */}
              <div className="absolute inset-0 w-full h-full flex items-end justify-center">
                <AnimatePresence>
                  <motion.div
                    key={slideIdx}
                    initial={{ opacity: 0, y: 40, scale: 0.92, rotate: -1 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, y: -20, scale: 1.03, rotate: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => handleModelClick(currentSlide.category)}
                    className="absolute bottom-0 inset-x-0 h-[92%] w-full flex items-end justify-center select-none cursor-pointer z-10"
                  >
                    <motion.div
                      animate={{
                        y: [0, -10, 0],
                        rotate: [0, 0.5, -0.5, 0]
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
                        style={{
                          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 12%)",
                          WebkitMaskComposite: "source-in",
                          maskComposite: "intersect"
                        }}
                        className={`h-full max-h-full object-contain object-bottom select-none z-10 transition-transform duration-700 ${currentSlide.scaleClass || "scale-100"}`}
                      />
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
};

export default HomeHero;
