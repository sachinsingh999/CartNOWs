import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Heart,
  ShoppingCart,
  Eye,
  Star,
  Flame,
  Award,
  TrendingUp,
  Cpu
} from "lucide-react";
import { backendUrl } from "../../config";

const RecommendedProducts = ({ recommended = [], trending = [], topRated = [], newArrivals = [], onQuickView, onAddToCart, onToggleFavorite, wishlist }) => {
  const [activeRecommendedTab, setActiveRecommendedTab] = useState("foryou"); // foryou | trending | rated | arrivals
  const navigate = useNavigate();

  const recommendedFiltered = useMemo(() => {
    if (activeRecommendedTab === "trending") return trending.slice(0, 4);
    if (activeRecommendedTab === "rated") return topRated.slice(0, 4);
    if (activeRecommendedTab === "arrivals") return newArrivals.slice(0, 4);
    return recommended.slice(0, 4); // Default "foryou"
  }, [recommended, trending, topRated, newArrivals, activeRecommendedTab]);

  const tabs = [
    { id: "foryou", label: "For You", icon: Sparkles },
    { id: "trending", label: "Trending", icon: Flame },
    { id: "rated", label: "Top Rated", icon: Award },
    { id: "arrivals", label: "New Arrivals", icon: TrendingUp }
  ];

  const cardCustomDetails = [
    {
      badge: "Best Seller",
      badgeColor: "bg-red-50 dark:bg-red-950/20 text-[#EF4444] border-red-100 dark:border-red-900/30",
      indicator: "👀 145 viewing now",
      match: "95% Match",
      specs: "128GB • 8GB RAM • 5G"
    },
    {
      badge: "Top Rated",
      badgeColor: "bg-blue-50 dark:bg-blue-950/20 text-[#3B82F6] border-blue-100 dark:border-blue-900/30",
      indicator: "🔥 89 sold today",
      match: "92% Match",
      specs: "Spiritual • Hardcover • English"
    },
    {
      badge: "AI Pick",
      badgeColor: "bg-purple-50 dark:bg-purple-950/20 text-[#A855F7] border-purple-100 dark:border-purple-900/30",
      indicator: "👀 67 viewing now",
      match: "90% Match",
      specs: "Men • Winter Collection • Premium"
    },
    {
      badge: "New Arrival",
      badgeColor: "bg-emerald-50 dark:bg-emerald-950/20 text-[#10B981] border-emerald-100 dark:border-emerald-900/30",
      indicator: "🔥 112 sold today",
      match: "88% Match",
      specs: "Women • Fashion • Trendy"
    }
  ];

  return (
    <div className="mb-12 select-none text-left">
      {/* Header section with segmented pill tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-8">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/40 px-3 py-1 rounded-md mb-2">
            <Sparkles size={11} className="stroke-[2.5] text-blue-600 dark:text-blue-400" />
            CARTNOW AI PICKS
          </span>
          
          <h2 className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>Recommended</span>
            <span className="text-blue-600 dark:text-blue-400">For You</span>
            <Sparkles size={18} className="text-blue-600 dark:text-blue-400 animate-pulse fill-blue-50/20" />
          </h2>
          
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1">
            Handpicked items based on your preferences, style & activity.
          </p>

          {/* Chosen by AI banner */}
          <div className="flex items-center gap-2 mt-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900 px-3 py-1.5 rounded-full w-fit">
            <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Cpu size={11} className="stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
              Chosen for you by <span className="text-blue-600 dark:text-blue-400 font-extrabold">CartNow AI</span>
            </span>
          </div>
        </div>

        {/* Capsule Pill Tab Control */}
        <div className="bg-slate-100/80 dark:bg-slate-900/65 p-1.5 rounded-2xl flex gap-1 border border-slate-200/40 dark:border-slate-800/80 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveRecommendedTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-[10.5px] font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer border-none flex items-center gap-2 ${ activeRecommendedTab === tab.id ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md font-black scale-102" : "text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-400" }`}
            >
              {React.createElement(tab.icon, { size: 12, className: "stroke-[2.5]" })}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid of custom cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {recommendedFiltered.map((product, idx) => {
          const detail = cardCustomDetails[idx] || cardCustomDetails[0];
          const isFav = wishlist?.includes(product._id);
          
          // Image parsing
          const imgUrl = product.images?.length
            ? product.images[0]
            : product.image;
          const finalImg = imgUrl?.startsWith("http")
            ? imgUrl
            : `${backendUrl}/${imgUrl}`;

          const originalVal = product.originalPrice || Math.round(product.price * 1.25);
          const discountPercent = Math.max(5, Math.round(((originalVal - product.price) / originalVal) * 100));

          return (
            <div
              key={product._id}
              className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[28px] p-4 flex flex-col justify-between transition-all duration-350 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:-translate-y-1.5 cursor-pointer relative"
              onClick={() => navigate(`/product/${product._id}`)}
            >
              {/* Image Container with floating widgets */}
              <div className="relative w-full aspect-square bg-[#F8FAFC] dark:bg-slate-950/20 rounded-[20px] overflow-hidden flex items-center justify-center p-5 border border-slate-50 dark:border-slate-800/50 shadow-inner">
                {/* Float Badge (Top Left) */}
                <span className={`absolute top-3.5 left-3.5 px-2.5 py-1 text-[8.5px] font-black uppercase tracking-wider border rounded-lg ${detail.badgeColor}`}>
                  {detail.badge}
                </span>

                {/* Favorite Heart (Top Right) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(product._id);
                  }}
                  className="absolute top-3.5 right-3.5 h-8.5 w-8.5 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700/50 cursor-pointer hover:scale-105 active:scale-95 transition-all"
                >
                  <Heart
                    size={13}
                    className={`transition-colors duration-300 stroke-[2.5] ${ isFav ? "text-rose-500 fill-rose-500" : "text-slate-500 dark:text-slate-400" }`}
                  />
                </button>

                {/* Product Image */}
                <img
                  src={finalImg}
                  alt={product.name}
                  loading="lazy"
                  className="max-h-[90%] max-w-[90%] object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                {/* Floating Social/Sold Indicator (Bottom Left) */}
                <span className="absolute bottom-3 left-3 bg-white/95 dark:bg-slate-900/95 text-[9px] font-black px-2.5 py-1 rounded-full shadow-xs border border-slate-100/30 flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                  {detail.indicator}
                </span>
              </div>

              {/* Product Info content */}
              <div className="mt-4 flex-1 flex flex-col justify-between">
                <div>
                  {/* Rating + Match score Row */}
                  <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <Star size={12} className="fill-amber-500 text-amber-500 stroke-none" />
                      <span className="text-slate-800 dark:text-slate-200 font-extrabold">{typeof product.rating === 'object' && product.rating ? product.rating.average || "4.8" : product.rating || "4.8"}</span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        ({product.reviewCount || "350"} reviews)
                      </span>
                    </div>

                    <span className="text-[9.5px] font-black text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-500/10">
                      {detail.match}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-extrabold text-[14px] text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 mt-1">
                    {product.name}
                  </h3>

                  {/* Specifications subtext */}
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 leading-none mt-1 mb-3">
                    {detail.specs}
                  </p>
                </div>

                {/* Price and CTA row */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      Rs. {Number(product.price).toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-slate-400 line-through font-semibold">
                      Rs. {originalVal.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] font-black text-red-500">
                      {discountPercent}% OFF
                    </span>
                  </div>

                  {/* Action buttons (Row) */}
                  <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-slate-100 dark:text-white font-extrabold text-[10px] uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm active:scale-95 border-none"
                    >
                      <ShoppingCart size={11} className="stroke-[2.5]" />
                      <span>Add to Cart</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickView(product);
                      }}
                      className="px-3 py-3 rounded-xl border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-[10px] uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1 transition-all cursor-pointer bg-transparent"
                    >
                      <Eye size={11} className="stroke-[2.5]" />
                      <span>Quick View</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendedProducts;
