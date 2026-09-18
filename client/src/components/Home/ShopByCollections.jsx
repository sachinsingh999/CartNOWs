import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getOptimizedImageUrl } from "../../utils/imageOptimizer";
import electronicsImg from "../../assets/electronics_collection_composite.webp";
import fashionImg from "../../assets/fashion_collection_composite.webp";
import homeImg from "../../assets/home_collection_composite.webp";
import beautyImg from "../../assets/brand_asset_beauty.webp";
import newArrivalsHero from "../../assets/new_arrivals_hero.webp";
import trendingHero from "../../assets/trending_now_hero.webp";
import sneakersImg from "../../assets/brand_asset_sneakers.webp";
import accessoriesImg from "../../assets/brand_asset_accessories.webp";
import mensFashionImg from "../../assets/brand_asset_mens_fashion_new.webp";
import jewelryImg from "../../assets/cat_jewelry.webp";
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
  Zap,
  Layers,
  Gem,
  Radio,
  Activity,
  Compass
} from "lucide-react";

const ShopByCollections = ({ trendingCollections = [] }) => {
  const navigate = useNavigate();
  const [likedCollections, setLikedCollections] = useState({});
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

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
      category: "trending",
      badge: "Just Released",
      badgeIcon: Sparkles,
      defaultTitle: "New Arrivals",
      defaultDesc: "Fresh weekly drops & modern aesthetics straight from verified designer catalogs.",
      badgeClass: "bg-emerald-600/85 text-white border-emerald-400/40 backdrop-blur-md",
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
      category: "trending",
      badge: "Hall of Fame",
      badgeIcon: Crown,
      defaultTitle: "Best Sellers",
      defaultDesc: "CartNOW's all-time most loved products, 5-star customer favorites & record breakers.",
      badgeClass: "bg-amber-600/85 text-white border-amber-400/40 backdrop-blur-md",
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
      category: "trending",
      badge: "Viral Selection",
      badgeIcon: Flame,
      defaultTitle: "Trending Now",
      defaultDesc: "High demand items curated live from real-time customer views & viral order velocity.",
      badgeClass: "bg-blue-600/85 text-white border-blue-400/40 backdrop-blur-md",
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
      category: "deals",
      badge: "Mega Savings",
      badgeIcon: Percent,
      defaultTitle: "Mega Deals & Offers",
      defaultDesc: "Exclusive festive discounts, bundle savings & verified blockbuster deals up to 60% off.",
      badgeClass: "bg-pink-600/85 text-pink-100 border-pink-400/40 backdrop-blur-md",
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
    },
    {
      id: "electronics",
      category: "tech",
      badge: "Cyber Innovations",
      badgeIcon: Laptop,
      defaultTitle: "Next-Gen Tech",
      defaultDesc: "Flagship laptops, studio headphones, gaming monitors & pro workstation accessories.",
      badgeClass: "bg-indigo-600/85 text-indigo-100 border-indigo-400/40 backdrop-blur-md",
      btnClass: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_4px_14px_rgba(79,70,229,0.35)]",
      tagClass: "bg-indigo-950/70 hover:bg-indigo-900/90 text-indigo-200 border-indigo-500/40 hover:border-indigo-300",
      glowGradient: "bg-indigo-900/30",
      tags: [
        { name: "Laptops", icon: Laptop },
        { name: "Audio", icon: Headphones },
        { name: "Mobiles", icon: Smartphone },
        { name: "Displays", icon: Tv },
        { name: "Gadgets", icon: Zap }
      ],
      fallbackImage: electronicsImg
    },
    {
      id: "fashion",
      category: "fashion",
      badge: "Haute Couture",
      badgeIcon: Shirt,
      defaultTitle: "Streetwear & Luxury",
      defaultDesc: "Curated oversized drops, premium fabrics, runway silhouettes & modern streetwear.",
      badgeClass: "bg-rose-600/85 text-rose-100 border-rose-400/40 backdrop-blur-md",
      btnClass: "bg-rose-600 hover:bg-rose-500 text-white shadow-[0_4px_14px_rgba(225,29,72,0.35)]",
      tagClass: "bg-rose-950/70 hover:bg-rose-900/90 text-rose-200 border-rose-500/40 hover:border-rose-300",
      glowGradient: "bg-rose-900/30",
      tags: [
        { name: "Oversized Fits", icon: Shirt },
        { name: "Denims", icon: Zap },
        { name: "Outerwear", icon: Sparkles },
        { name: "Sneakers", icon: Zap },
        { name: "Runway", icon: Crown }
      ],
      fallbackImage: mensFashionImg
    },
    {
      id: "sports",
      category: "lifestyle",
      badge: "Performance Pro",
      badgeIcon: Zap,
      defaultTitle: "Sneakers & Athletics",
      defaultDesc: "High-rebound runners, limited edition kicks, training activewear & outdoor gear.",
      badgeClass: "bg-cyan-600/85 text-cyan-100 border-cyan-400/40 backdrop-blur-md",
      btnClass: "bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_4px_14px_rgba(8,145,178,0.35)]",
      tagClass: "bg-cyan-950/70 hover:bg-cyan-900/90 text-cyan-200 border-cyan-500/40 hover:border-cyan-300",
      glowGradient: "bg-cyan-900/30",
      tags: [
        { name: "Limited Kicks", icon: Zap },
        { name: "React Cushions", icon: Activity },
        { name: "Gym Fit", icon: Shirt },
        { name: "Activewear", icon: Feather },
        { name: "Trail Shoes", icon: Compass }
      ],
      fallbackImage: sneakersImg
    },
    {
      id: "home",
      category: "lifestyle",
      badge: "Interior Luxe",
      badgeIcon: Home,
      defaultTitle: "Modern Home & Decor",
      defaultDesc: "Scandinavian aesthetics, ergonomic furniture, ambient smart lighting & culinary tools.",
      badgeClass: "bg-orange-600/85 text-orange-100 border-orange-400/40 backdrop-blur-md",
      btnClass: "bg-orange-600 hover:bg-orange-500 text-white shadow-[0_4px_14px_rgba(234,88,12,0.35)]",
      tagClass: "bg-orange-950/70 hover:bg-orange-900/90 text-orange-200 border-orange-500/40 hover:border-orange-300",
      glowGradient: "bg-orange-900/30",
      tags: [
        { name: "Smart Kitchen", icon: ChefHat },
        { name: "Decor", icon: Sparkles },
        { name: "Lamps", icon: Zap },
        { name: "Furniture", icon: Home },
        { name: "Dining", icon: Utensils }
      ],
      fallbackImage: homeImg
    },
    {
      id: "beauty",
      category: "lifestyle",
      badge: "Pure Botanical",
      badgeIcon: Droplet,
      defaultTitle: "Clean Beauty & Glow",
      defaultDesc: "Clinical dermatologist peptides, gentle organic hydration, perfumes & radiant skincare.",
      badgeClass: "bg-teal-600/85 text-teal-100 border-teal-400/40 backdrop-blur-md",
      btnClass: "bg-teal-600 hover:bg-teal-500 text-white shadow-[0_4px_14px_rgba(13,148,136,0.35)]",
      tagClass: "bg-teal-950/70 hover:bg-teal-900/90 text-teal-200 border-teal-500/40 hover:border-teal-300",
      glowGradient: "bg-teal-900/30",
      tags: [
        { name: "Serums", icon: Droplet },
        { name: "Hydration", icon: Sparkles },
        { name: "French Scents", icon: Feather },
        { name: "Sun Shields", icon: Star },
        { name: "Glow Care", icon: Heart }
      ],
      fallbackImage: beautyImg
    },
    {
      id: "accessories",
      category: "fashion",
      badge: "Timeless Craft",
      badgeIcon: Watch,
      defaultTitle: "Chrono & Fine Jewelry",
      defaultDesc: "Automatic sapphire chronographs, Italian leather wallets, designer eyewear & gold pieces.",
      badgeClass: "bg-purple-600/85 text-purple-100 border-purple-400/40 backdrop-blur-md",
      btnClass: "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_4px_14px_rgba(147,51,234,0.35)]",
      tagClass: "bg-purple-950/70 hover:bg-purple-900/90 text-purple-200 border-purple-500/40 hover:border-purple-300",
      glowGradient: "bg-purple-900/30",
      tags: [
        { name: "Sapphire Watch", icon: Watch },
        { name: "Fine Gold", icon: Gem },
        { name: "Eyewear", icon: Glasses },
        { name: "Leather", icon: Luggage },
        { name: "Jewelry", icon: Sparkles }
      ],
      fallbackImage: accessoriesImg
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
      category: preset.category,
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

  const displayedCollections = activeTab === "all"
    ? collections
    : collections.filter((c) => c.category === activeTab);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [displayedCollections]);

  const handleScroll = (direction) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.75;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    });
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm p-3.5 sm:p-4.5 lg:p-5 shadow-xs transition-colors duration-200 select-none text-left">
      {/* Section Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
        <div className="text-left space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/60 rounded-sm text-[9px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 shadow-2xs">
              <Sparkles size={11} className="stroke-[2.5]" />
              <span>CURATED COLLECTIONS</span>
            </div>

            <span className="px-2 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
              {collections.length} Lifestyle Hubs
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Shop By Collections</span>
            <span className="h-1.5 w-1.5 rounded-sm bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
          </h2>

          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Handpicked lifestyle & seasonal curations, tailored for you.
          </p>
        </div>

        {/* Action Button & Navigation Controls */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          <div className="hidden sm:flex items-center gap-1 bg-slate-50 dark:bg-slate-950 p-0.5 rounded-sm border border-slate-200 dark:border-slate-800">
            {[
              { id: "all", label: "All" },
              { id: "trending", label: "Trending" },
              { id: "tech", label: "Tech" },
              { id: "fashion", label: "Fashion" },
              { id: "lifestyle", label: "Lifestyle" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
                  }
                }}
                className={`px-2.5 py-1 rounded-xs text-[10px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate("/collections")}
            className="px-3 py-1.5 rounded-sm border border-slate-300 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white text-slate-800 dark:text-slate-200 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 shadow-2xs group"
          >
            <span>View All</span>
            <ArrowRight size={12} className="stroke-[2.5] transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* Collections Carousel inside the box */}
      <div className="relative group/carousel">
        {/* Floating Left Button */}
        <button
          onClick={() => handleScroll("left")}
          disabled={!canScrollLeft}
          aria-label="Previous collections"
          className={`hidden sm:flex absolute -left-2 sm:-left-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-sm bg-white/95 dark:bg-slate-800/95 backdrop-blur-xs border border-slate-200 dark:border-slate-700 shadow-md items-center justify-center text-slate-800 dark:text-white transition-all cursor-pointer ${
            canScrollLeft
              ? "hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:scale-105 active:scale-95 opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronLeft size={18} className="stroke-[2.5]" />
        </button>

        {/* Floating Right Button */}
        <button
          onClick={() => handleScroll("right")}
          disabled={!canScrollRight}
          aria-label="Next collections"
          className={`hidden sm:flex absolute -right-2 sm:-right-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-sm bg-white/95 dark:bg-slate-800/95 backdrop-blur-xs border border-slate-200 dark:border-slate-700 shadow-md items-center justify-center text-slate-800 dark:text-white transition-all cursor-pointer ${
            canScrollRight
              ? "hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:scale-105 active:scale-95 opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronRight size={18} className="stroke-[2.5]" />
        </button>

        {/* Collections Cards Container (Responsive Smooth Horizontal Carousel) */}
        <div
          ref={scrollContainerRef}
          className="w-full flex gap-2.5 sm:gap-3 lg:gap-3.5 overflow-x-auto no-scrollbar scrollbar-none scroll-smooth snap-x snap-mandatory py-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {displayedCollections.map((col) => {
            const isLiked = !!likedCollections[col.id];
            return (
              <div
                key={col.id}
                onClick={() => navigate(`/collections/${col.id}`)}
                className="group relative w-[86vw] sm:w-[calc(50%-8px)] lg:w-[calc(25%-10.5px)] min-h-[385px] sm:min-h-[405px] rounded-sm border border-slate-300/80 dark:border-slate-800 overflow-hidden flex flex-col justify-between p-3.5 sm:p-4 transition-all duration-300 hover:shadow-xl hover:border-slate-400 dark:hover:border-slate-600 hover:-translate-y-1 cursor-pointer text-left select-none bg-slate-950 snap-start shrink-0"
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
      </div>
    </div>
  );
};

export default ShopByCollections;

