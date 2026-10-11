import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import BrandLogo from "../BrandLogo";
import { getDailyRotatedItems } from "../../utils/dailyRotation";

// Curated Top Global Brands with official domains for pristine logo resolution
const ALL_TOP_BRANDS = [
  { id: "b-apple", name: "Apple", domain: "apple.com", discount: "Up to 20% Off", badge: "Top", subtext: "Official Store" },
  { id: "b-samsung", name: "Samsung", domain: "samsung.com", discount: "Min. 25% Off", badge: "Hot", subtext: "Official Store" },
  { id: "b-sony", name: "Sony", domain: "sony.com", discount: "Up to 30% Off", badge: "Audio", subtext: "Official Store" },
  { id: "b-nike", name: "Nike", domain: "nike.com", discount: "Min. 30% Off", badge: "Trending", subtext: "Official Store" },
  { id: "b-adidas", name: "Adidas", domain: "adidas.com", discount: "Up to 45% Off", badge: "Popular", subtext: "Official Store" },
  { id: "b-puma", name: "Puma", domain: "puma.com", discount: "Min. 35% Off", badge: "Style", subtext: "Official Store" },
  { id: "b-boat", name: "boAt", domain: "boat-lifestyle.com", discount: "Up to 60% Off", badge: "Bass", subtext: "Official Store" },
  { id: "b-jbl", name: "JBL", domain: "jbl.com", discount: "Min. 30% Off", badge: "Sound", subtext: "Official Store" },
  { id: "b-dell", name: "Dell", domain: "dell.com", discount: "Up to 25% Off", badge: "Pro", subtext: "Official Store" },
  { id: "b-hp", name: "HP", domain: "hp.com", discount: "Up to 35% Off", badge: "PC", subtext: "Official Store" },
  { id: "b-lenovo", name: "Lenovo", domain: "lenovo.com", discount: "Min. 30% Off", badge: "Value", subtext: "Official Store" },
  { id: "b-underarmour", name: "Under Armour", domain: "underarmour.com", discount: "Up to 40% Off", badge: "Pro", subtext: "Official Store" },
  { id: "b-oneplus", name: "OnePlus", domain: "oneplus.com", discount: "Min. 20% Off", badge: "Fast", subtext: "Official Store" },
  { id: "b-xiaomi", name: "Xiaomi", domain: "mi.com", discount: "Up to 35% Off", badge: "Top", subtext: "Official Store" },
  { id: "b-titan", name: "Titan", domain: "titan.co.in", discount: "Up to 25% Off", badge: "Classic", subtext: "Official Store" },
  { id: "b-fastrack", name: "Fastrack", domain: "fastrack.in", discount: "Up to 40% Off", badge: "Youth", subtext: "Official Store" },
  { id: "b-fossil", name: "Fossil", domain: "fossil.com", discount: "Up to 35% Off", badge: "Classic", subtext: "Official Store" },
  { id: "b-rayban", name: "Ray-Ban", domain: "ray-ban.com", discount: "Min. 20% Off", badge: "Iconic", subtext: "Official Store" },
  { id: "b-casio", name: "Casio", domain: "casio.com", discount: "Up to 30% Off", badge: "G-Shock", subtext: "Official Store" },
  { id: "b-tourister", name: "American Tourister", domain: "americantourister.com", discount: "Up to 50% Off", badge: "Travel", subtext: "Official Store" }
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
    const scrollAmount = (card?.offsetWidth || 140) * 3 + 24;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    });
  };

  // Daily rotated brand list
  const brandList = useMemo(() => {
    return getDailyRotatedItems(ALL_TOP_BRANDS, "home_shop_by_brands_square");
  }, []);

  return (
    <div className="w-full bg-white dark:bg-slate-900 border-0 rounded-none px-0 sm:px-4.5 lg:px-5 py-3.5 sm:py-4.5 lg:py-5 shadow-none select-none text-left">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5 px-3 sm:px-0">
        <div className="text-left space-y-1">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800/60 rounded-none text-[9px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 shadow-2xs">
              <ShieldCheck size={11} className="stroke-[2.5]" />
              <span>Trusted Brand Stores</span>
            </div>

            <span className="px-2 py-0.5 rounded-none bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
              20 Official Stores
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Shop By Brands</span>
            <span className="h-1.5 w-1.5 rounded-none bg-blue-600 dark:bg-blue-400 animate-pulse" />
          </h2>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/brands")}
            className="px-3 py-1.5 rounded-none border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 shadow-2xs group"
          >
            <span>View All Brands</span>
            <ArrowRight size={12} className="stroke-[2.5] transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* Individual Square Brand Cards Carousel (No Outer Box) */}
      <div className="relative group/carousel">
        {/* Floating Left Button */}
        <button
          onClick={() => handleScroll("left")}
          disabled={!canScrollLeft}
          aria-label="Previous brands"
          className={`hidden sm:flex absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-none bg-white/95 dark:bg-slate-800/95 backdrop-blur-xs border border-slate-200 dark:border-slate-700 shadow-md items-center justify-center text-slate-800 dark:text-white transition-all cursor-pointer ${
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
          className={`hidden sm:flex absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-none bg-white/95 dark:bg-slate-800/95 backdrop-blur-xs border border-slate-200 dark:border-slate-700 shadow-md items-center justify-center text-slate-800 dark:text-white transition-all cursor-pointer ${
            canScrollRight
              ? "hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:scale-105 active:scale-95 opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronRight size={17} className="stroke-[2.5]" />
        </button>

        {/* Horizontal Track of Clean Square Brand Boxes */}
        <div
          ref={scrollContainerRef}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          className="flex gap-2.5 sm:gap-3 md:gap-3.5 overflow-x-auto no-scrollbar scrollbar-none scrollbar-hide [&::-webkit-scrollbar]:hidden pb-1 snap-x snap-mandatory scroll-smooth px-3 sm:px-0"
        >
          {brandList.map((brand) => (
            <div
              key={brand.id}
              onClick={() => {
                navigate(`/brands/${brand.name.toLowerCase()}`);
                toast.info(`Opening ${brand.name} Store! 🏷️`);
              }}
              className="w-[125px] sm:w-[140px] md:w-[155px] aspect-square shrink-0 snap-start bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 p-2 sm:p-2.5 flex flex-col items-center justify-between text-center transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs group select-none relative"
            >
              {/* Mini Feature Badge */}
              {brand.badge && (
                <span className="absolute top-1.5 right-1.5 z-10 px-1.5 py-0.5 rounded-none text-[7px] sm:text-[7.5px] font-black uppercase tracking-tight bg-blue-600 text-white shadow-2xs leading-none pointer-events-none">
                  {brand.badge}
                </span>
              )}

              {/* Brand Logo - Prominently Sized in Square Box */}
              <div className="w-full flex-1 flex items-center justify-center py-1 overflow-hidden">
                <BrandLogo
                  brand={brand.name}
                  brandDomain={brand.domain}
                  className="w-full h-full max-h-16 sm:max-h-20 bg-transparent border-0 shadow-none rounded-none p-1 flex items-center justify-center group-hover:scale-108 transition-transform duration-200"
                  imageClassName="w-full h-full max-h-14 sm:max-h-18 max-w-[85%] sm:max-w-[88%] object-contain filter drop-shadow-2xs mx-auto"
                  fallbackText={brand.name.substring(0, 2).toUpperCase()}
                  fallbackClassName="text-lg sm:text-xl font-black text-slate-700 dark:text-slate-200"
                />
              </div>

              {/* Brand Name & Discount */}
              <div className="w-full pt-1 flex flex-col items-center">
                <span
                  className="text-xs sm:text-[13px] font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate w-full"
                  title={brand.name}
                >
                  {brand.name}
                </span>
                {brand.discount && (
                  <span className="text-[10px] sm:text-[11px] font-bold text-blue-600 dark:text-blue-400 truncate w-full leading-tight">
                    {brand.discount}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopByBrands;
