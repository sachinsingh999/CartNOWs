import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowRight,
  ChevronRight,
  Star,
  ShoppingBag,
  Watch,
  Sparkles,
  Home,
  ShoppingCart,
  Smartphone,
  Headphones,
  BookOpen,
  Shirt,
  Baby,
  Footprints,
  Apple
} from "lucide-react";
import { backendUrl } from "../../config";
import { cachedGet } from "../../utils/apiCache";

// Import premium background-free assets
import electronicsFallback from "../../assets/brand_asset_electronics_new.webp";
import mensFashionFallback from "../../assets/brand_asset_mens_fashion_new.webp";
import womensFashionFallback from "../../assets/brand_asset_womens_fashion_new.webp";
import groceriesFallback from "../../assets/brand_asset_groceries.webp";
import kidsFallback from "../../assets/brand_asset_kids.webp";
import booksFallback from "../../assets/brand_asset_books.webp";
import fashionFallback from "../../assets/brand_asset_fashion_new.webp";
import beautyFallback from "../../assets/brand_asset_beauty.webp";
import accessoriesFallback from "../../assets/brand_asset_accessories.webp";
import sportswearFallback from "../../assets/brand_asset_sportswear.webp";
import sneakersFallback from "../../assets/brand_asset_sneakers.webp";

/* ─────────────── Helper Functions ─────────────── */
const getCategoryIcon = (catName) => {
  const name = (catName || "").toLowerCase().trim();
  if (name.includes("electronic") || name.includes("gadget") || name.includes("tech")) return Headphones;
  if (name.includes("men") || name === "mens") return Shirt;
  if (name.includes("women") || name === "womens") return ShoppingBag;
  if (name.includes("kid") || name.includes("baby") || name.includes("toy")) return Baby;
  if (name.includes("shoe") || name.includes("footwear") || name.includes("sneaker")) return Footprints;
  if (name.includes("beauty") || name.includes("cosmetic") || name.includes("makeup") || name.includes("care")) return Sparkles;
  if (name.includes("grocer") || name.includes("food") || name.includes("fresh")) return Apple;
  if (name.includes("book") || name.includes("read")) return BookOpen;
  if (name.includes("home") || name.includes("decor") || name.includes("furniture")) return Home;
  if (name.includes("accessor") || name.includes("jewelry") || name.includes("watch")) return Watch;
  return Sparkles;
};

const getShortName = (catName) => {
  const name = (catName || "").trim();
  const lower = name.toLowerCase();
  if (lower.includes("men's fashion") || lower === "men" || lower === "mens") return "Men";
  if (lower.includes("women's fashion") || lower === "women" || lower === "womens") return "Women";
  if (lower.includes("kids' fashion") || lower === "kids" || lower === "kid" || lower === "baby") return "Kids";
  if (lower.includes("sneaker") || lower.includes("shoe") || lower.includes("footwear")) return "Sneakers";
  if (lower.includes("electronic") || lower.includes("gadget") || lower.includes("tech")) return "Electronics";
  if (lower.includes("beauty") || lower.includes("cosmetic") || lower.includes("care")) return "Beauty";
  if (lower.includes("grocer") || lower.includes("food")) return "Groceries";
  return name;
};

const TopCategories = ({ popularCategories = [] }) => {
  const navigate = useNavigate();
  const [countsMap, setCountsMap] = useState({});

  useEffect(() => {
    cachedGet(`${backendUrl}/api/product/categories`)
      .then(res => {
        if (res.data.success) {
          const map = {};
          res.data.categories.forEach(c => {
            if (c.name) {
              map[c.name.toLowerCase()] = c.count;
            }
          });
          setCountsMap(map);
        }
      })
      .catch(err => console.error("Failed to load category counts in TopCategories:", err));
  }, []);

  const categories = (popularCategories || []).slice(0, 8).map((cat, idx) => {
    const presets = [
      {
        bgClass: "bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20",
        iconColor: "text-blue-500",
        textColor: "text-blue-600 dark:text-blue-400",
        btnBg: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-500",
        shadowColor: "hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20",
        glowClass: "bg-blue-400/10 dark:bg-blue-400/10",
        borderGlow: "group-hover:border-blue-500/30 dark:group-hover:border-blue-400/30",
        fallbackImg: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80"
      },
      {
        bgClass: "bg-gradient-to-br from-rose-500/10 to-pink-500/10 dark:from-rose-500/20 dark:to-pink-500/20",
        iconColor: "text-rose-500",
        textColor: "text-rose-600 dark:text-rose-400",
        btnBg: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white dark:group-hover:bg-rose-500",
        shadowColor: "hover:shadow-rose-500/10 dark:hover:shadow-rose-500/20",
        glowClass: "bg-rose-400/10 dark:bg-rose-400/10",
        borderGlow: "group-hover:border-rose-500/30 dark:group-hover:border-rose-400/30",
        fallbackImg: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&auto=format&fit=crop&q=80"
      },
      {
        bgClass: "bg-gradient-to-br from-purple-500/10 to-violet-500/10 dark:from-purple-500/20 dark:to-violet-500/20",
        iconColor: "text-purple-500",
        textColor: "text-purple-600 dark:text-purple-400",
        btnBg: "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white dark:group-hover:bg-purple-500",
        shadowColor: "hover:shadow-purple-500/10 dark:hover:shadow-purple-500/20",
        glowClass: "bg-purple-400/10 dark:bg-purple-400/10",
        borderGlow: "group-hover:border-purple-500/30 dark:group-hover:border-purple-400/30",
        fallbackImg: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=200&auto=format&fit=crop&q=80"
      },
      {
        bgClass: "bg-gradient-to-br from-orange-500/10 to-amber-500/10 dark:from-orange-500/20 dark:to-amber-500/20",
        iconColor: "text-orange-500",
        textColor: "text-orange-600 dark:text-orange-400",
        btnBg: "bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 group-hover:bg-orange-600 group-hover:text-white dark:group-hover:bg-orange-500",
        shadowColor: "hover:shadow-orange-500/10 dark:hover:shadow-orange-500/20",
        glowClass: "bg-orange-400/10 dark:bg-orange-400/10",
        borderGlow: "group-hover:border-orange-500/30 dark:group-hover:border-orange-400/30",
        fallbackImg: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&auto=format&fit=crop&q=80"
      },
      {
        bgClass: "bg-gradient-to-br from-emerald-500/10 to-green-500/10 dark:from-emerald-500/20 dark:to-green-500/20",
        iconColor: "text-emerald-500",
        textColor: "text-emerald-600 dark:text-emerald-400",
        btnBg: "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white dark:group-hover:bg-emerald-500",
        shadowColor: "hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/20",
        glowClass: "bg-emerald-400/10 dark:bg-emerald-400/10",
        borderGlow: "group-hover:border-emerald-500/30 dark:group-hover:border-emerald-400/30",
        fallbackImg: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&auto=format&fit=crop&q=80"
      },
      {
        bgClass: "bg-gradient-to-br from-lime-500/10 to-emerald-500/10 dark:from-lime-500/20 dark:to-emerald-500/20",
        iconColor: "text-lime-500",
        textColor: "text-lime-600 dark:text-lime-400",
        btnBg: "bg-lime-50 dark:bg-lime-950/40 text-lime-600 dark:text-lime-400 group-hover:bg-lime-600 group-hover:text-white dark:group-hover:bg-lime-500",
        shadowColor: "hover:shadow-lime-500/10 dark:hover:shadow-lime-500/20",
        glowClass: "bg-lime-400/10 dark:bg-lime-400/10",
        borderGlow: "group-hover:border-lime-500/30 dark:group-hover:border-lime-400/30",
        fallbackImg: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80"
      },
      {
        bgClass: "bg-gradient-to-br from-teal-500/10 to-cyan-500/10 dark:from-teal-500/20 dark:to-cyan-500/20",
        iconColor: "text-teal-500",
        textColor: "text-teal-600 dark:text-teal-400",
        btnBg: "bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 group-hover:bg-teal-600 group-hover:text-white dark:group-hover:bg-teal-500",
        shadowColor: "hover:shadow-teal-500/10 dark:hover:shadow-teal-500/20",
        glowClass: "bg-teal-400/10 dark:bg-teal-400/10",
        borderGlow: "group-hover:border-teal-500/30 dark:group-hover:border-teal-400/30",
        fallbackImg: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&auto=format&fit=crop&q=80"
      },
      {
        bgClass: "bg-gradient-to-br from-orange-500/10 to-yellow-500/10 dark:from-orange-500/20 dark:to-yellow-500/20",
        iconColor: "text-orange-500",
        textColor: "text-orange-600 dark:text-orange-400",
        btnBg: "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 group-hover:bg-orange-600 group-hover:text-white dark:group-hover:bg-orange-500",
        shadowColor: "hover:shadow-orange-500/10 dark:hover:shadow-orange-500/20",
        glowClass: "bg-orange-400/10 dark:bg-orange-400/10",
        borderGlow: "group-hover:border-orange-500/30 dark:group-hover:border-orange-400/30",
        fallbackImg: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80"
      }
    ];

    const preset = presets[idx % presets.length];

    const getFallbackImage = (catName) => {
      const name = (catName || "").toLowerCase().trim();
      if (name.includes("electronic")) return electronicsFallback;
      if (name === "men" || name.includes("men's") || name.includes("mens")) return mensFashionFallback;
      if (name === "women" || name.includes("women's") || name.includes("womens")) return womensFashionFallback;
      if (name.includes("grocer") || name === "food") return groceriesFallback;
      if (name.includes("kid") || name.includes("baby")) return kidsFallback;
      if (name.includes("beauty") || name.includes("cosmetic")) return beautyFallback;
      if (name.includes("accessor")) return accessoriesFallback;
      if (name.includes("sport") || name.includes("active") || name.includes("wear")) return sportswearFallback;
      if (name.includes("shoe") || name.includes("footwear") || name.includes("sneaker")) return sneakersFallback;
      if (name.includes("book")) return booksFallback;
      if (name.includes("fashion") || name.includes("cloth")) return fashionFallback;
      
      return preset.fallbackImg;
    };

    const finalIcon = getCategoryIcon(cat.name);
    const shortName = getShortName(cat.name);

    let imageSrc = cat.bannerImage || cat.icon;
    if (!imageSrc || (!imageSrc.startsWith("http") && !imageSrc.includes("uploads"))) {
      imageSrc = getFallbackImage(cat.name);
    } else if (!imageSrc.startsWith("http")) {
      imageSrc = `${backendUrl}/${imageSrc}`;
    }

    const countVal = countsMap[cat.name.toLowerCase()] !== undefined
      ? `${countsMap[cat.name.toLowerCase()]} Products`
      : "Popular Category";

    return {
      name: cat.name,
      shortName: shortName,
      count: countVal,
      img: imageSrc,
      bgClass: preset.bgClass,
      icon: finalIcon,
      iconColor: preset.iconColor,
      textColor: preset.textColor,
      btnBg: preset.btnBg,
      shadowColor: preset.shadowColor,
      glowClass: preset.glowClass,
      borderGlow: preset.borderGlow
    };
  });

  return (
    <div className="select-none text-left w-full">
      {/* Header section with view all */}
      <div className="flex justify-between items-end gap-4 mb-6 px-1 sm:px-0">
        <div>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            <span className="sm:hidden uppercase text-lg tracking-wider">Shop Popular</span>
            <span className="hidden sm:inline">Top <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Categories</span></span>
          </h2>
          <p className="hidden sm:block text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
            Shop from our most popular collections
          </p>
          <div className="hidden sm:flex items-center gap-1.5 mt-3">
            <div className="w-16 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full" />
            <div className="w-2.5 h-1.5 bg-indigo-500 rounded-full" />
          </div>
        </div>

        <button
          onClick={() => navigate("/categories")}
          className="group flex items-center gap-1 text-xs font-extrabold text-[#F43F5E] dark:text-[#FB7185] hover:underline cursor-pointer sm:px-6 sm:py-3 sm:rounded-full sm:border sm:border-blue-600/20 sm:hover:border-blue-600 sm:text-blue-600 sm:dark:text-blue-400 sm:hover:bg-blue-600 sm:hover:text-white sm:dark:hover:bg-blue-500 sm:dark:hover:text-white sm:shadow-sm sm:hover:shadow-md sm:transition-all sm:duration-300 sm:bg-transparent"
        >
          <span className="sm:hidden">View all</span>
          <span className="hidden sm:inline">View All Categories</span>
          <ArrowRight size={13} className="stroke-[2.5] transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>

      {/* Grid of capsule cards - with horizontal scroll support on mobile */}
      <div className="flex overflow-x-auto sm:grid sm:grid-cols-4 lg:grid-cols-8 gap-4 sm:gap-5 pb-5 pt-2 scrollbar-hide snap-x snap-mandatory">
        {categories.map((cat, i) => (
          <div
            key={i}
            onClick={() => navigate(`/categories/${cat.name.toLowerCase()}`)}
            className={`group relative aspect-[2/3] sm:aspect-square flex flex-col justify-between bg-slate-900/90 dark:bg-slate-950/80 sm:bg-white sm:dark:bg-slate-900 border border-slate-800/80 dark:border-slate-800/80 sm:border-slate-200 sm:dark:border-slate-800 rounded-2xl sm:rounded-[28px] transition-[box-shadow,border-color] duration-300 cursor-pointer shadow-sm hover:shadow-xl ${cat.borderGlow} ${cat.shadowColor} w-[105px] sm:w-auto shrink-0 snap-start overflow-hidden transform-gpu`}
          >
            {/* Background Gradient Glow (Persists on Desktop) */}
            <div className={`absolute inset-0 ${cat.bgClass} opacity-80 z-0 transition-opacity duration-500 group-hover:opacity-100 hidden sm:block`} />
            
            {/* Center Image: Fitted nicely inside top-middle section, transparent bg */}
            <div className="absolute inset-x-0 top-0 h-[68%] sm:h-full w-full flex items-center justify-center p-2.5 sm:p-0 z-0 select-none pointer-events-none overflow-hidden rounded-t-2xl sm:rounded-[28px] transform-gpu">
              <img
                src={cat.img}
                alt={cat.name}
                loading="lazy"
                decoding="async"
                className="max-h-full max-w-full sm:w-full sm:h-full object-contain sm:object-cover rounded-t-2xl sm:rounded-[28px]"
              />
            </div>

            {/* Hover Transparent Dark Overlay (Desktop only) */}
            <div className="absolute inset-0 bg-slate-950/75 dark:bg-slate-950/85 opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 z-10 hidden sm:block transform-gpu" />
            
            {/* Mobile Bottom Shade Gradient (Mobile only for text readability) */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent z-10 sm:hidden" />

            {/* Desktop-only: Floating Icon (Fades in on hover) */}
            <div className="absolute top-4 left-4 z-20 opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 hidden sm:block transform-gpu">
              <div className="w-7.5 h-7.5 rounded-full bg-white/95 dark:bg-slate-900/95 shadow-md flex items-center justify-center">
                {React.createElement(cat.icon, { size: 13, className: `${cat.iconColor} stroke-[2.5]` })}
              </div>
            </div>

            {/* Desktop-only: Content Text & Chevron */}
            <div className="absolute inset-x-4 bottom-4 z-20 flex justify-between items-end gap-2 opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex transform-gpu">
              <div className="flex flex-col leading-tight text-slate-100 dark:text-white min-w-0">
                <span className="font-black text-[13px] tracking-tight truncate">
                  {cat.name}
                </span>
                <span className="block text-[9.5px] font-bold mt-0.5 text-slate-300 truncate">
                  {cat.count}
                </span>
              </div>
              
              {/* Round action arrow button */}
              <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center shadow-md shrink-0 ${cat.btnBg}`}>
                <ChevronRight size={13} className="stroke-[2.5]" />
              </div>
            </div>

            {/* Mobile-only Label Layer (Always Visible, centered at bottom) */}
            <div className="absolute inset-x-1 bottom-3.5 z-20 flex flex-col items-center gap-1.5 text-center select-none pointer-events-none sm:hidden">
              <div className="text-white/80">
                {React.createElement(cat.icon, { size: 14, className: "stroke-[2.5]" })}
              </div>
              <span className="text-[11px] font-black tracking-wide text-slate-100 dark:text-white">
                {cat.shortName}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopCategories;
