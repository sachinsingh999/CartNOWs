import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { backendUrl } from "../../config";
import BrandLogo from "../BrandLogo";
import { getDailyRotatedItems } from "../../utils/dailyRotation";

// Curated 4 Brand Collections, each featuring exactly 4 brands in a compact 2x2 Matrix
const BRAND_COLLECTIONS = [
  {
    id: "tech_giants",
    title: "Global Tech Giants",
    tag: "Flagship Tech",
    link: "/product?category=Electronics",
    cta: "Explore Tech Brands",
    categoryFilter: "Electronics",
    items: [
      { id: "b-apple", name: "Apple", domain: "apple.com", discount: "Up to 20% Off", badge: "Top", subtext: "Official Store" },
      { id: "b-samsung", name: "Samsung", domain: "samsung.com", discount: "Min. 25% Off", badge: "Hot", subtext: "Official Store" },
      { id: "b-sony", name: "Sony", domain: "sony.com", discount: "Up to 30% Off", badge: "Audio", subtext: "Official Store" },
      { id: "b-hp", name: "HP", domain: "hp.com", discount: "Up to 35% Off", badge: "PC", subtext: "Official Store" }
    ]
  },
  {
    id: "fashion_sport",
    title: "Sportswear & Style",
    tag: "Iconic Style",
    link: "/product?category=Fashion",
    cta: "Explore Fashion Brands",
    categoryFilter: "Fashion",
    items: [
      { id: "b-nike", name: "Nike", domain: "nike.com", discount: "Min. 30% Off", badge: "Trending", subtext: "Official Store" },
      { id: "b-adidas", name: "Adidas", domain: "adidas.com", discount: "Up to 45% Off", badge: "Popular", subtext: "Official Store" },
      { id: "b-puma", name: "Puma", domain: "puma.com", discount: "Min. 35% Off", badge: "Style", subtext: "Official Store" },
      { id: "b-underarmour", name: "Under Armour", domain: "underarmour.com", discount: "Up to 40% Off", badge: "Pro", subtext: "Official Store" }
    ]
  },
  {
    id: "computing_audio",
    title: "Computing & Audio",
    tag: "High Performance",
    link: "/product?category=Electronics",
    cta: "Explore Audio & PC",
    categoryFilter: "Electronics",
    items: [
      { id: "b-dell", name: "Dell", domain: "dell.com", discount: "Up to 25% Off", badge: "Pro", subtext: "Official Store" },
      { id: "b-lenovo", name: "Lenovo", domain: "lenovo.com", discount: "Min. 30% Off", badge: "Value", subtext: "Official Store" },
      { id: "b-boat", name: "boAt", domain: "boat-lifestyle.com", discount: "Up to 60% Off", badge: "Bass", subtext: "Official Store" },
      { id: "b-jbl", name: "JBL", domain: "jbl.com", discount: "Min. 30% Off", badge: "Sound", subtext: "Official Store" }
    ]
  },
  {
    id: "mobile_lifestyle",
    title: "Smartphones & Lifestyle",
    tag: "Next-Gen Mobile",
    link: "/brands",
    cta: "Explore Lifestyle Brands",
    categoryFilter: "All",
    items: [
      { id: "b-oneplus", name: "OnePlus", domain: "oneplus.com", discount: "Min. 20% Off", badge: "Fast", subtext: "Official Store" },
      { id: "b-xiaomi", name: "Xiaomi", domain: "mi.com", discount: "Up to 35% Off", badge: "Top", subtext: "Official Store" },
      { id: "b-titan", name: "Titan", domain: "titan.co.in", discount: "Up to 25% Off", badge: "Classic", subtext: "Official Store" },
      { id: "b-fastrack", name: "Fastrack", domain: "fastrack.in", discount: "Up to 40% Off", badge: "Youth", subtext: "Official Store" }
    ]
  },
  {
    id: "luxury_accessories",
    title: "Luxury & Accessories",
    tag: "Premium Wear",
    link: "/product?category=Accessories",
    cta: "Explore Accessories",
    categoryFilter: "Accessories",
    items: [
      { id: "b-fossil", name: "Fossil", domain: "fossil.com", discount: "Up to 35% Off", badge: "Classic", subtext: "Official Store" },
      { id: "b-rayban", name: "Ray-Ban", domain: "ray-ban.com", discount: "Min. 20% Off", badge: "Iconic", subtext: "Official Store" },
      { id: "b-casio", name: "Casio", domain: "casio.com", discount: "Up to 30% Off", badge: "G-Shock", subtext: "Official Store" },
      { id: "b-tourister", name: "American Tourister", domain: "americantourister.com", discount: "Up to 50% Off", badge: "Travel", subtext: "Official Store" }
    ]
  }
];

const ShopByBrands = ({ popularBrands = [] }) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll bounds to enable/disable floating arrow buttons
  const checkScrollBounds = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    checkScrollBounds();
    el.addEventListener("scroll", checkScrollBounds, { passive: true });
    window.addEventListener("resize", checkScrollBounds);
    return () => {
      el.removeEventListener("scroll", checkScrollBounds);
      window.removeEventListener("resize", checkScrollBounds);
    };
  }, [checkScrollBounds]);

  const handleScroll = (direction) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const card = el.querySelector(".snap-start");
    const scrollAmount = (card?.offsetWidth || 280) + 12;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    });
  };

  // Rotate items daily so the layout stays dynamic
  const brandGroups = useMemo(() => {
    return BRAND_COLLECTIONS.map((group) => ({
      ...group,
      items: getDailyRotatedItems(group.items, group.id)
    }));
  }, []);

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm p-3.5 sm:p-4.5 lg:p-5 shadow-xs transition-shadow duration-300 select-none text-left">
      {/* Section Header (Matching Pick Up Where You Left Off style) */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 mb-4">
        <div className="text-left space-y-1">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800/60 rounded-sm text-[9px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 shadow-2xs">
              <ShieldCheck size={11} className="stroke-[2.5]" />
              <span>Trusted Brand Stores</span>
            </div>

            <span className="px-2 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
              5 Collections • 20 Official Stores
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Shop By Brands</span>
            <span className="h-1.5 w-1.5 rounded-sm bg-blue-600 dark:bg-blue-400 animate-pulse" />
          </h2>

          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Explore authentic products from top official brand stores and verified global partners.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/brands")}
            className="px-3 py-1.5 rounded-sm border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 shadow-2xs group"
          >
            <span>View All Brands</span>
            <ArrowRight size={12} className="stroke-[2.5] transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* 2x2 Matrix Brand Collections in Small Size Carousel */}
      <div className="relative group/carousel">
        {/* Floating Left Button */}
        <button
          onClick={() => handleScroll("left")}
          disabled={!canScrollLeft}
          aria-label="Previous brands"
          className={`hidden sm:flex absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-sm bg-white/95 dark:bg-slate-800/95 backdrop-blur-xs border border-slate-200 dark:border-slate-700 shadow-md items-center justify-center text-slate-800 dark:text-white transition-all cursor-pointer ${
            canScrollLeft
              ? "hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:scale-105 active:scale-95 opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronLeft size={17} className="stroke-[2.5]" />
        </button>

        {/* Floating Right Button */}
        <button
          onClick={() => handleScroll("right")}
          disabled={!canScrollRight}
          aria-label="Next brands"
          className={`hidden sm:flex absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-sm bg-white/95 dark:bg-slate-800/95 backdrop-blur-xs border border-slate-200 dark:border-slate-700 shadow-md items-center justify-center text-slate-800 dark:text-white transition-all cursor-pointer ${
            canScrollRight
              ? "hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:scale-105 active:scale-95 opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronRight size={17} className="stroke-[2.5]" />
        </button>

        {/* Horizontal Track - Mobile Optimized Peek with Smooth Snap */}
        <div
          ref={scrollContainerRef}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          className="flex gap-3 sm:gap-3.5 lg:gap-4 overflow-x-auto no-scrollbar scrollbar-none scrollbar-hide [&::-webkit-scrollbar]:hidden pb-1 snap-x snap-mandatory scroll-smooth"
        >
          {brandGroups.map((group) => (
            <div
              key={group.id}
              className="w-full sm:w-[330px] md:w-[360px] lg:w-[calc((100%-32px)/3)] shrink-0 snap-start bg-slate-50/70 dark:bg-slate-800/50 rounded-sm border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-4 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between select-none"
            >
              {/* Card Header */}
              <div className="mb-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-sm inline-block border border-blue-200/60 dark:border-blue-900/40">
                    {group.tag}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Official Stores
                  </span>
                </div>
                <h3 className="text-sm sm:text-base md:text-[17px] font-black text-slate-950 dark:text-white tracking-tight leading-snug truncate">
                  {group.title}
                </h3>
              </div>

              {/* 4 Inner Brand Boxes in a Compact 2x2 Matrix */}
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mb-3 w-full">
                {group.items.map((brand) => (
                  <div
                    key={brand.id}
                    onClick={() => {
                      navigate(`/brands/${brand.name.toLowerCase()}`);
                      toast.info(`Opening ${brand.name} Store! 🏷️`);
                    }}
                    className="group/item cursor-pointer flex flex-col items-center select-none"
                  >
                    {/* Balanced Logo Box */}
                    <div className="w-full aspect-square rounded-sm overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700/80 relative group-hover/item:border-blue-500 dark:group-hover/item:border-blue-400 group-hover/item:shadow-xs transition-all duration-200 flex items-center justify-center">
                      {/* Mini Feature Badge */}
                      {brand.badge && (
                        <span className="absolute top-1.5 right-1.5 z-10 px-1.5 py-0.5 rounded-sm text-[7.5px] sm:text-[8.5px] font-black uppercase tracking-tight bg-blue-600 text-white shadow-2xs leading-none pointer-events-none">
                          {brand.badge}
                        </span>
                      )}

                      {/* Brand Logo - 100% full size of outer box */}
                      <BrandLogo
                        brand={brand.name}
                        brandDomain={brand.domain}
                        className="w-full h-full bg-transparent border-0 shadow-none rounded-none group-hover/item:scale-105 transition-transform duration-200"
                        imageClassName="w-full h-full object-cover"
                        fallbackText={brand.name.substring(0, 2).toUpperCase()}
                        fallbackClassName="text-base sm:text-lg font-black text-slate-700 dark:text-slate-200"
                      />
                    </div>

                    {/* Brand Name */}
                    <span
                      className="mt-1.5 text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors line-clamp-1 text-center w-full truncate"
                      title={brand.name}
                    >
                      {brand.name}
                    </span>

                    {/* Discount offer */}
                    {brand.discount && (
                      <span className="text-[10px] sm:text-[11px] font-bold text-blue-600 dark:text-blue-400 text-center w-full truncate leading-tight">
                        {brand.discount}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Card Footer Link */}
              <button
                onClick={() => {
                  if (group.link) navigate(group.link);
                }}
                className="group/btn w-full py-2 px-3 rounded-sm bg-white dark:bg-slate-900 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-slate-700 dark:text-slate-200 text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer mt-auto shadow-2xs"
              >
                <span>{group.cta}</span>
                <ArrowRight size={13} className="stroke-[2.5] group-hover/btn:translate-x-1 transition-transform duration-200" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopByBrands;
