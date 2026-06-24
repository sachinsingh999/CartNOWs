import React from "react";
import { useNavigate } from "react-router-dom";
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
  Headphones
} from "lucide-react";
import { backendUrl } from "../../config";

const TopCategories = ({ popularCategories = [] }) => {
  const navigate = useNavigate();

  const categories = (popularCategories || []).slice(0, 8).map((cat, idx) => {
    const presets = [
      {
        bgClass: "bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20",
        icon: Star,
        iconColor: "text-blue-500",
        textColor: "text-blue-600 dark:text-blue-400",
        btnBg: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-500",
        shadowColor: "hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20",
        glowClass: "bg-blue-400/20 dark:bg-blue-400/10",
        fallbackImg: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80"
      },
      {
        bgClass: "bg-gradient-to-br from-rose-500/10 to-pink-500/10 dark:from-rose-500/20 dark:to-pink-500/20",
        icon: ShoppingBag,
        iconColor: "text-rose-500",
        textColor: "text-rose-600 dark:text-rose-400",
        btnBg: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white dark:group-hover:bg-rose-500",
        shadowColor: "hover:shadow-rose-500/10 dark:hover:shadow-rose-500/20",
        glowClass: "bg-rose-400/20 dark:bg-rose-400/10",
        fallbackImg: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&auto=format&fit=crop&q=80"
      },
      {
        bgClass: "bg-gradient-to-br from-purple-500/10 to-violet-500/10 dark:from-purple-500/20 dark:to-violet-500/20",
        icon: Watch,
        iconColor: "text-purple-500",
        textColor: "text-purple-600 dark:text-purple-400",
        btnBg: "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white dark:group-hover:bg-purple-500",
        shadowColor: "hover:shadow-purple-500/10 dark:hover:shadow-purple-500/20",
        glowClass: "bg-purple-400/20 dark:bg-purple-400/10",
        fallbackImg: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=200&auto=format&fit=crop&q=80"
      },
      {
        bgClass: "bg-gradient-to-br from-orange-500/10 to-amber-500/10 dark:from-orange-500/20 dark:to-amber-500/20",
        icon: Sparkles,
        iconColor: "text-orange-500",
        textColor: "text-orange-600 dark:text-orange-400",
        btnBg: "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 group-hover:bg-orange-600 group-hover:text-white dark:group-hover:bg-orange-500",
        shadowColor: "hover:shadow-orange-500/10 dark:hover:shadow-orange-500/20",
        glowClass: "bg-orange-400/20 dark:bg-orange-400/10",
        fallbackImg: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&auto=format&fit=crop&q=80"
      },
      {
        bgClass: "bg-gradient-to-br from-emerald-500/10 to-green-500/10 dark:from-emerald-500/20 dark:to-green-500/20",
        icon: Home,
        iconColor: "text-emerald-500",
        textColor: "text-emerald-600 dark:text-emerald-400",
        btnBg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white dark:group-hover:bg-emerald-500",
        shadowColor: "hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/20",
        glowClass: "bg-emerald-400/20 dark:bg-emerald-400/10",
        fallbackImg: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&auto=format&fit=crop&q=80"
      },
      {
        bgClass: "bg-gradient-to-br from-lime-500/10 to-emerald-500/10 dark:from-lime-500/20 dark:to-emerald-500/20",
        icon: ShoppingCart,
        iconColor: "text-lime-500",
        textColor: "text-lime-600 dark:text-lime-450",
        btnBg: "bg-lime-50 dark:bg-lime-950/40 text-lime-600 dark:text-lime-400 group-hover:bg-lime-600 group-hover:text-white dark:group-hover:bg-lime-500",
        shadowColor: "hover:shadow-lime-500/10 dark:hover:shadow-lime-500/20",
        glowClass: "bg-lime-400/20 dark:bg-lime-400/10",
        fallbackImg: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80"
      },
      {
        bgClass: "bg-gradient-to-br from-teal-500/10 to-cyan-500/10 dark:from-teal-500/20 dark:to-cyan-500/20",
        icon: Smartphone,
        iconColor: "text-teal-500",
        textColor: "text-teal-650 dark:text-teal-400",
        btnBg: "bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 group-hover:bg-teal-600 group-hover:text-white dark:group-hover:bg-teal-500",
        shadowColor: "hover:shadow-teal-500/10 dark:hover:shadow-teal-500/20",
        glowClass: "bg-teal-400/20 dark:bg-teal-400/10",
        fallbackImg: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&auto=format&fit=crop&q=80"
      },
      {
        bgClass: "bg-gradient-to-br from-orange-500/10 to-yellow-500/10 dark:from-orange-500/20 dark:to-yellow-500/20",
        icon: Headphones,
        iconColor: "text-orange-500",
        textColor: "text-orange-600 dark:text-orange-400",
        btnBg: "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 group-hover:bg-orange-600 group-hover:text-white dark:group-hover:bg-orange-500",
        shadowColor: "hover:shadow-orange-500/10 dark:hover:shadow-orange-500/20",
        glowClass: "bg-orange-400/20 dark:bg-orange-400/10",
        fallbackImg: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80"
      }
    ];

    const preset = presets[idx % presets.length];

    let imageSrc = cat.bannerImage || cat.icon;
    if (!imageSrc || (!imageSrc.startsWith("http") && !imageSrc.includes("uploads"))) {
      imageSrc = preset.fallbackImg;
    } else if (!imageSrc.startsWith("http")) {
      imageSrc = `${backendUrl}/${imageSrc}`;
    }

    return {
      name: cat.name,
      count: "Popular Category",
      img: imageSrc,
      bgClass: preset.bgClass,
      icon: preset.icon,
      iconColor: preset.iconColor,
      textColor: preset.textColor,
      btnBg: preset.btnBg,
      shadowColor: preset.shadowColor,
      glowClass: preset.glowClass
    };
  });

  return (
    <div className="select-none text-left">
      {/* Header section with view all */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">
            Top <span className="text-blue-600 dark:text-blue-400">Categories</span>
          </h2>
          <p className="text-xs font-bold text-slate-450 dark:text-slate-500 mt-1.5">
            Shop from our most popular categories
          </p>
          <div className="flex items-center gap-1 mt-2.5">
            <div className="w-12 h-1 bg-blue-600 rounded-full" />
            <div className="w-2 h-1 bg-blue-600 rounded-full" />
          </div>
        </div>

        <button
          onClick={() => navigate("/categories")}
          className="px-5 py-2.5 rounded-full border border-blue-600/30 hover:border-blue-600 text-blue-650 dark:text-blue-400 font-extrabold text-xs flex items-center gap-2 hover:bg-blue-50/20 dark:hover:bg-blue-950/10 transition-all cursor-pointer bg-transparent"
        >
          <span>View All Categories</span>
          <ArrowRight size={14} className="stroke-[2.5]" />
        </button>
      </div>

      {/* Grid of capsule cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        {categories.map((cat, i) => (
          <div
            key={i}
            onClick={() => navigate(`/categories/${cat.name.toLowerCase()}`)}
            className={`group flex flex-col items-center bg-white/70 dark:bg-slate-900/75 backdrop-blur-md border border-slate-100 dark:border-slate-800/80 rounded-[38px] p-4 transition-all duration-500 hover:border-transparent hover:-translate-y-2 cursor-pointer shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] ${cat.shadowColor}`}
          >
            {/* Soft oval backdrop with top-right floating badge */}
            <div className={`relative w-full aspect-[5/6] rounded-[28px] overflow-hidden flex items-center justify-center transition-all duration-500 ${cat.bgClass}`}>
              {/* Blur-glow aura in the background */}
              <div className={`absolute -inset-2 rounded-[28px] ${cat.glowClass} opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 group-hover:scale-110`} />
              
              {/* Floating icon badge */}
              <div className="absolute top-2.5 right-2.5 w-6.5 h-6.5 rounded-full bg-white/95 dark:bg-slate-900/95 shadow-md flex items-center justify-center z-10 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                {React.createElement(cat.icon, { size: 12, className: `${cat.iconColor} stroke-[2.5]` })}
              </div>
              
              <img
                src={cat.img}
                alt={cat.name}
                className="max-h-[75%] max-w-[75%] object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-[1.12] z-10"
              />
            </div>

            {/* Labels */}
            <div className="text-center mt-4.5 mb-3 leading-tight flex flex-col items-center">
              <span className="text-[13px] font-black text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                {cat.name}
              </span>
              <span className={`block text-[10px] font-bold mt-1.5 px-2.5 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800/40 group-hover:bg-transparent transition-all duration-300 ${cat.textColor}`}>
                {cat.count}
              </span>
            </div>

            {/* Round action arrow button */}
            <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm ${cat.btnBg} group-hover:scale-110 group-hover:shadow-md`}>
              <ChevronRight size={15} className="stroke-[2.5] transition-transform duration-300 group-hover:translate-x-0.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopCategories;
