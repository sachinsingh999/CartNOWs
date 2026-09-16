import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Flame,
  Truck,
  CheckCircle2,
  RotateCcw,
  Zap
} from "lucide-react";

// Hero Images
import exactHeroModels from "../../assets/new_home/exact_hero_models.png";
import heroModelsCollage from "../../assets/new_home/hero_models_collage.jpg";
import heroSlide1 from "../../assets/hero_slide_1.webp";
import heroSlide2 from "../../assets/hero_slide_2.webp";
import heroSlide3 from "../../assets/hero_slide_3.webp";

const SLIDES = [
  {
    id: "elevate-everyday",
    badge: "✨ THE SEASON'S MUST-HAVE COLLECTION",
    titlePrefix: "Elevate ",
    titleHighlight: "Your Everyday",
    subtitle: "Discover styles and fragrances made to make every moment unforgettable.",
    primaryCtaText: "Shop Electronics",
    primaryCtaLink: "/product?category=electronics",
    discountBadge: "UP TO 50% OFF",
    tooltipText: "THE SEASON'S MUST-HAVE COLLECTION - Elevate Your Everyday",
    festiveBadge: "FESTIVAL OFFER",
    image: exactHeroModels,
    imageAlt: "Fashion Models Elevate Your Everyday Collection",
    bgGradient: "from-[#F0EDFF] via-[#F4F1FF] to-[#FAF8FF] dark:from-slate-900 dark:via-purple-950/30 dark:to-slate-900",
    pillHighlightColor: "from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400"
  },
  {
    id: "tech-extravaganza",
    badge: "⚡ NEW SMART TECH & GADGETS",
    titlePrefix: "Upgrade ",
    titleHighlight: "Your Digital Life",
    subtitle: "Immersive audio, flagship wearables & cutting-edge electronics at unbeatable festival prices.",
    primaryCtaText: "Shop Tech Deals",
    primaryCtaLink: "/product?category=electronics",
    discountBadge: "FLAT 45% OFF",
    tooltipText: "FLAGSHIP GADGETS - Premium Sound & Tech",
    festiveBadge: "MEGA TECH DEAL",
    image: heroSlide1,
    imageAlt: "Smart Tech & Wearables",
    bgGradient: "from-[#EFF6FF] via-[#F0F9FF] to-[#F8FAFC] dark:from-slate-900 dark:via-sky-950/30 dark:to-slate-900",
    pillHighlightColor: "from-sky-600 via-blue-600 to-indigo-600 dark:from-sky-400 dark:via-blue-400 dark:to-indigo-400"
  },
  {
    id: "festive-couture",
    badge: "💎 FESTIVE & CELEBRATION READY",
    titlePrefix: "Shine In ",
    titleHighlight: "Pure Elegance",
    subtitle: "Curated wedding collections, luxury silks, and breathtaking styles tailored for you.",
    primaryCtaText: "Explore Fashion",
    primaryCtaLink: "/product?category=fashion",
    discountBadge: "UP TO 60% OFF",
    tooltipText: "ROYAL ETHNIC & OCCASION WEAR",
    festiveBadge: "SPECIAL EDITION",
    image: heroSlide2,
    imageAlt: "Festive Fashion Collection",
    bgGradient: "from-[#FFF1F2] via-[#FFF5F5] to-[#FAF8FF] dark:from-slate-900 dark:via-rose-950/30 dark:to-slate-900",
    pillHighlightColor: "from-rose-600 via-pink-600 to-purple-600 dark:from-rose-400 dark:via-pink-400 dark:to-purple-400"
  }
];

const PanoramicHeroBanner = ({ homepageData = {} }) => {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayRef = useRef(null);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIdx((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIdx((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    autoPlayRef.current = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [nextSlide, isPaused]);

  const currentSlide = SLIDES[currentIdx];

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? "3%" : "-3%",
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
    },
    exit: (dir) => ({
      x: dir > 0 ? "-3%" : "3%",
      opacity: 0,
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
    })
  };

  return (
    <section 
      aria-label="Main Hero Campaign"
      className="w-full px-2 sm:px-4 lg:px-6 pt-2 pb-1.5 select-none"
    >
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className={`relative w-full rounded-sm border border-slate-200/90 dark:border-slate-800 bg-gradient-to-r ${currentSlide.bgGradient} overflow-hidden shadow-2xs transition-colors duration-500`}
      >
        {/* Left and Right Navigation Chevrons */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-sm bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all shadow-sm cursor-pointer"
        >
          <ChevronLeft size={18} className="stroke-[2.5]" />
        </button>

        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-sm bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all shadow-sm cursor-pointer"
        >
          <ChevronRight size={18} className="stroke-[2.5]" />
        </button>

        {/* Carousel Content */}
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentSlide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full min-h-[360px] sm:min-h-[420px] lg:min-h-[440px] grid grid-cols-1 lg:grid-cols-12 items-center px-4 sm:px-8 lg:px-12 py-6 lg:py-4 gap-6 lg:gap-4"
          >
            {/* Left Content Area (Columns 1-6) */}
            <div className="lg:col-span-6 flex flex-col justify-center text-left z-20 space-y-3.5 sm:space-y-4 max-w-xl pl-6 sm:pl-8 lg:pl-4">
              
              {/* Season Collection Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 dark:bg-sky-950/60 border border-sky-200/80 dark:border-sky-800/60 rounded-sm text-[10.5px] sm:text-[11.5px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 shadow-2xs w-fit">
                <Sparkles size={13} className="text-amber-500 fill-amber-400 stroke-[2.5]" />
                <span>{currentSlide.badge}</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                <span>{currentSlide.titlePrefix}</span>
                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${currentSlide.pillHighlightColor}`}>
                  {currentSlide.titleHighlight}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed max-w-md">
                {currentSlide.subtitle}
              </p>

              {/* CTA Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => navigate(currentSlide.primaryCtaLink)}
                  className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm rounded-sm shadow-md flex items-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span>{currentSlide.primaryCtaText}</span>
                  <ArrowRight size={14} className="stroke-[3]" />
                </button>

                <div className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-amber-50/95 dark:bg-amber-950/60 border border-amber-300/90 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 font-black text-[11px] sm:text-xs uppercase tracking-wider rounded-sm flex items-center gap-1.5 shadow-2xs">
                  <Flame size={13} className="text-rose-500 fill-rose-500" />
                  <span>{currentSlide.discountBadge}</span>
                </div>
              </div>

              {/* Trust Guarantees Strip */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2 text-slate-700 dark:text-slate-300 text-[10.5px] sm:text-xs font-bold border-t border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center gap-1.5">
                  <Truck size={13} className="text-blue-600 dark:text-blue-400 stroke-[2.5]" />
                  <span>Free Express Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                  <span>100% Authentic Quality</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RotateCcw size={13} className="text-purple-600 dark:text-purple-400 stroke-[2.5]" />
                  <span>Easy 7-Day Returns</span>
                </div>
              </div>

              {/* Capsule Slide Indicator at bottom-left */}
              <div className="pt-2 flex items-center gap-2">
                <div className="inline-flex items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-full px-2 py-1 gap-1.5 shadow-2xs">
                  {SLIDES.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setDirection(idx > currentIdx ? 1 : -1);
                        setCurrentIdx(idx);
                      }}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`transition-all duration-300 rounded-full cursor-pointer ${
                        currentIdx === idx
                          ? "w-6 h-1.5 bg-blue-600 dark:bg-blue-400"
                          : "w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
                      }`}
                    />
                  ))}
                </div>
              </div>

            </div>

            {/* Right Graphic Collage (Columns 7-12) */}
            <div className="lg:col-span-6 relative flex items-center justify-center lg:justify-end h-full min-h-[280px] sm:min-h-[340px] lg:min-h-[400px]">
              
              {/* Floating Dark Glassmorphism Tooltip Badge */}
              <div className="absolute top-2 sm:top-4 right-8 sm:right-16 z-20 hidden sm:flex items-center gap-2 bg-slate-900/85 text-white backdrop-blur-md px-3.5 py-1.5 rounded-sm text-[10px] sm:text-[11px] font-bold shadow-lg border border-white/10 animate-bounce">
                <Sparkles size={11} className="text-amber-400" />
                <span>{currentSlide.tooltipText}</span>
              </div>

              {/* Floating Golden Festive Offer Seal Badge */}
              <div className="absolute top-6 sm:top-10 right-2 sm:right-6 z-20 flex flex-col items-center justify-center bg-gradient-to-br from-amber-400 via-rose-500 to-purple-600 text-white p-2 rounded-full w-14 h-14 sm:w-16 sm:h-16 shadow-lg border-2 border-white/80 animate-pulse">
                <span className="text-[7.5px] font-black uppercase tracking-wider leading-none text-amber-200">SPECIAL</span>
                <span className="text-[9px] sm:text-[10px] font-black uppercase text-center leading-tight">FESTIVAL</span>
                <span className="text-[8px] font-black uppercase tracking-wide leading-none text-yellow-300">OFFER</span>
              </div>

              {/* Models Image with smooth blending */}
              <div className="relative w-full max-w-[620px] h-[260px] sm:h-[340px] lg:h-[390px] flex items-end justify-center lg:justify-end overflow-hidden">
                <img
                  src={currentSlide.image}
                  alt={currentSlide.imageAlt}
                  className="w-full h-full object-contain object-bottom drop-shadow-md transform transition-transform duration-700 hover:scale-[1.02]"
                />
              </div>

            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default PanoramicHeroBanner;
