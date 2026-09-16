import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOptimizedImageUrl } from "../../utils/imageOptimizer";
import electronicsImg from "../../assets/electronics_collection_composite.webp";
import fashionImg from "../../assets/fashion_collection_composite.webp";
import homeImg from "../../assets/home_collection_composite.webp";
import beautyImg from "../../assets/brand_asset_beauty.webp";
import newArrivalsHero from "../../assets/new_arrivals_hero.webp";
import trendingHero from "../../assets/trending_now_hero.webp";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  ShoppingBag,
  ArrowRight,
  Laptop,
  Smartphone,
  Watch,
  Headphones,
  Camera,
  Shirt,
  Glasses,
  Luggage,
  Sparkles,
  Flame,
  ChefHat,
  Tv,
  Wind,
  Home,
  Utensils,
  Feather,
  Droplet,
  Crown,
  Star,
  Percent,
  Zap
} from "lucide-react";

const ShopByCollections = ({ trendingCollections = [] }) => {
  const navigate = useNavigate();
  const [likedCollections, setLikedCollections] = useState({});

  const toggleLike = (id, e) => {
    e.stopPropagation();
    setLikedCollections((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const cleanDescription = (title, desc, fallback) => {
    if (!desc || desc.includes("custom collection of hot-trending items")) {
      return fallback;
    }
    return desc;
  };

  const presets = [
    {
      id: "new-arrivals",
      badge: "Just Released",
      badgeIcon: Sparkles,
      defaultTitle: "New Arrivals",
      defaultDesc: "Fresh weekly drops & modern aesthetics straight from verified designer catalogs.",
      badgeClass: "bg-emerald-600/80 text-white border-emerald-400/40 backdrop-blur-md",
      btnClass: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_4px_14px_rgba(5,150,105,0.35)]",
      tagClass: "bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-200 border-emerald-500/40 hover:border-emerald-300",
      glowGradient: "bg-emerald-900/30",
      tags: [
        { name: "Fresh Drops", icon: Sparkles },
        { name: "Sneakers", icon: Zap },
        { name: "Apparel", icon: Shirt },
        { name: "Watches", icon: Watch },
        { name: "Bags", icon: Luggage }
      ],
      fallbackImage: newArrivalsHero
    },
    {
      id: "best-sellers",
      badge: "Hall of Fame",
      badgeIcon: Crown,
      defaultTitle: "Best Sellers",
      defaultDesc: "CartNOW's all-time most loved products, 5-star customer favorites & record breakers.",
      badgeClass: "bg-amber-600/80 text-white border-amber-400/40 backdrop-blur-md",
      btnClass: "bg-amber-600 hover:bg-amber-500 text-white shadow-[0_4px_14px_rgba(217,119,6,0.35)]",
      tagClass: "bg-amber-950/70 hover:bg-amber-900/90 text-amber-200 border-amber-500/40 hover:border-amber-300",
      glowGradient: "bg-amber-900/30",
      tags: [
        { name: "5.0★ Rated", icon: Star },
        { name: "Top Tech", icon: Laptop },
        { name: "Viral Picks", icon: Flame },
        { name: "Audio", icon: Headphones },
        { name: "Mobiles", icon: Smartphone }
      ],
      fallbackImage: trendingHero
    },
    {
      id: "trending-now",
      badge: "Viral Selection",
      badgeIcon: Flame,
      defaultTitle: "Trending Now",
      defaultDesc: "High demand items curated live from real-time customer views & viral order velocity.",
      badgeClass: "bg-blue-600/80 text-white border-blue-400/40 backdrop-blur-md",
      btnClass: "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)]",
      tagClass: "bg-blue-950/70 hover:bg-blue-900/90 text-blue-200 border-blue-500/40 hover:border-blue-300",
      glowGradient: "bg-blue-900/30",
      tags: [
        { name: "Hot Drops", icon: Flame },
        { name: "Footwear", icon: Zap },
        { name: "Streetwear", icon: Shirt },
        { name: "Beauty", icon: Sparkles },
        { name: "Eyewear", icon: Glasses }
      ],
      fallbackImage: fashionImg
    },
    {
      id: "festival-offers",
      badge: "Mega Savings",
      badgeIcon: Percent,
      defaultTitle: "Mega Deals & Offers",
      defaultDesc: "Exclusive festive discounts, bundle savings & verified blockbuster deals up to 60% off.",
      badgeClass: "bg-pink-600/80 text-pink-100 border-pink-400/40 backdrop-blur-md",
      btnClass: "bg-pink-600 hover:bg-pink-500 text-white shadow-[0_4px_14px_rgba(219,39,119,0.35)]",
      tagClass: "bg-pink-950/70 hover:bg-pink-900/90 text-pink-200 border-pink-500/40 hover:border-pink-300",
      glowGradient: "bg-pink-900/30",
      tags: [
        { name: "Min 40% Off", icon: Percent },
        { name: "Kitchen", icon: Utensils },
        { name: "Home Living", icon: Home },
        { name: "Gadgets", icon: Tv },
        { name: "Beauty", icon: Droplet }
      ],
      fallbackImage: homeImg
    }
  ];

  const collections = presets.map((preset, idx) => {
    const col = trendingCollections && trendingCollections[idx] ? trendingCollections[idx] : null;
    let imageSrc = col?.banner;
    if (!imageSrc || !imageSrc.startsWith("http")) {
      imageSrc = preset.fallbackImage;
    } else {
      imageSrc = getOptimizedImageUrl(imageSrc, { width: 600, quality: 80 });
    }

    const title = preset.defaultTitle;
    const subtitle = cleanDescription(title, col?.description, preset.defaultDesc);

    return {
      id: preset.id,
      title,
      subtitle,
      badge: preset.badge,
      badgeIcon: preset.badgeIcon,
      badgeClass: preset.badgeClass,
      btnClass: preset.btnClass,
      tagClass: preset.tagClass,
      glowGradient: preset.glowGradient,
      tags: preset.tags,
      image: imageSrc
    };
  });

  const scrollContainer = (dir) => {
    const el = document.getElementById("collections-grid-container");
    if (el) {
      const scrollAmount = dir === "left" ? -340 : 340;
      el.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="w-full px-2 sm:px-4 lg:px-6 pt-1 pb-1 select-none text-left">
      {/* Header with Slider Controls + View All */}
      <div className="flex justify-between items-end mb-3.5 sm:mb-4">
        <div className="text-left">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Shop By Collections</span>
            <span className="h-1.5 w-1.5 rounded-sm bg-blue-600 dark:bg-blue-400 animate-pulse" />
          </h2>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
            Handpicked lifestyle & seasonal curations, tailored for you
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => navigate("/collections")}
            className="px-3 sm:px-3.5 py-1.5 rounded-sm border border-slate-300 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white text-slate-800 dark:text-slate-200 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 shadow-2xs"
          >
            <span>View All</span>
            <ArrowRight size={12} className="stroke-[2.5]" />
          </button>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => scrollContainer("left")}
              aria-label="Previous collection"
              className="w-8 h-8 rounded-sm bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
            >
              <ChevronLeft size={15} className="stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => scrollContainer("right")}
              aria-label="Next collection"
              className="w-8 h-8 rounded-sm bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
            >
              <ChevronRight size={15} className="stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Collections Grid / Full-Bleed Image Background Cards */}
      <div
        id="collections-grid-container"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 lg:gap-2.5"
      >
        {collections.map((col) => {
          const isLiked = !!likedCollections[col.id];
          return (
            <div
              key={col.id}
              onClick={() => navigate(`/collections/${col.id}`)}
              className="group relative min-h-[380px] sm:min-h-[410px] rounded-sm border border-slate-300/80 dark:border-slate-800 overflow-hidden flex flex-col justify-between p-3.5 sm:p-4 transition-all duration-300 hover:shadow-2xl hover:border-slate-400 dark:hover:border-slate-600 hover:-translate-y-1 cursor-pointer text-left select-none bg-slate-950"
            >
              {/* Full Cover Background Image */}
              <img
                src={col.image}
                alt={col.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
              />

              {/* Multi-Stop Gradient Overlays for High Legibility & Atmosphere */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/30 pointer-events-none" />
              <div className={`absolute inset-0 opacity-20 group-hover:opacity-35 transition-opacity duration-300 pointer-events-none ${col.glowGradient}`} />

              {/* Top Row: Floating Badge + Heart Wishlist Button */}
              <div className="relative z-10 flex justify-between items-center">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[9.5px] font-black uppercase tracking-wider backdrop-blur-md border shadow-md ${col.badgeClass}`}>
                  {React.createElement(col.badgeIcon, { size: 10, className: "stroke-[2.5]" })}
                  <span>{col.badge}</span>
                </span>
                <button
                  type="button"
                  onClick={(e) => toggleLike(col.id, e)}
                  aria-label="Add to favorites"
                  className="w-7.5 h-7.5 rounded-sm bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white hover:text-rose-400 hover:border-rose-400/50 shadow-md flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95"
                >
                  <Heart
                    size={13}
                    className={`stroke-[2.5] transition-transform duration-200 ${isLiked ? "fill-rose-500 text-rose-500 scale-110" : ""}`}
                  />
                </button>
              </div>

              {/* Bottom Content Area */}
              <div className="relative z-10 flex flex-col gap-2.5">
                {/* Heading & description */}
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-tight group-hover:text-blue-300 transition-colors drop-shadow-md truncate">
                    {col.title}
                  </h3>
                  <p className="text-[11px] sm:text-[11.5px] text-slate-200/90 font-medium leading-snug mt-1 line-clamp-2 drop-shadow">
                    {col.subtitle}
                  </p>
                </div>

                {/* Category Tags Pills Row */}
                <div className="flex flex-wrap gap-1">
                  {col.tags.map((tag) => (
                    <button
                      key={tag.name}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product?search=${encodeURIComponent(tag.name)}`);
                      }}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[9.5px] font-black uppercase tracking-wider backdrop-blur-md border shadow-sm transition-all duration-150 cursor-pointer ${col.tagClass}`}
                    >
                      {React.createElement(tag.icon, { size: 9, className: "shrink-0 stroke-[2.5]" })}
                      <span>{tag.name}</span>
                    </button>
                  ))}
                </div>

                {/* Full-width CTA Button matching bottom card */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/collections/${col.id}`);
                  }}
                  className={`w-full py-2.5 ${col.btnClass} font-black text-[11px] uppercase tracking-widest rounded-sm transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-lg active:scale-[0.99] mt-0.5`}
                >
                  <ShoppingBag size={13} className="stroke-[2.5]" />
                  <span>Shop Collection</span>
                  <ArrowRight size={13} className="stroke-[2.5] transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ShopByCollections;
