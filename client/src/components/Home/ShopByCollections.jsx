import React from "react";
import { useNavigate } from "react-router-dom";
import electronicsImg from "../../assets/electronics_collection_composite.webp";
import fashionImg from "../../assets/fashion_collection_composite.webp";
import homeImg from "../../assets/home_collection_composite.webp";
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
  Utensils
} from "lucide-react";

const ShopByCollections = ({ trendingCollections = [] }) => {
  const navigate = useNavigate();

  const collections = (trendingCollections || []).slice(0, 3).map((col, idx) => {
    const presets = [
      {
        badge: "Tech Gear",
        badgeIcon: Flame,
        colorClass: "bg-[#F5F3FF] dark:bg-indigo-950/30 border-[#DDD6FE]/30 dark:border-[#4338CA]/20",
        badgeColor: "bg-[#EDE9FE] dark:bg-[#312E81]/60 text-[#7C3AED] dark:text-[#A78BFA]",
        btnGradient: "from-[#7C3AED] to-[#6D28D9] hover:from-[#6D28D9] hover:to-[#5B21B6] shadow-purple-500/10",
        pillsColor: "bg-white/70 dark:bg-slate-900/60 border-[#DDD6FE]/40 dark:border-[#4338CA]/20 text-[#6D28D9] dark:text-[#C084FC] hover:bg-white dark:hover:bg-slate-900",
        tags: [
          { name: "Laptop", icon: Laptop },
          { name: "Phone", icon: Smartphone },
          { name: "Watch", icon: Watch },
          { name: "Earbuds", icon: Headphones },
          { name: "Camera", icon: Camera }
        ],
        fallbackImage: electronicsImg
      },
      {
        badge: "Urban Wear",
        badgeIcon: Shirt,
        colorClass: "bg-[#EFF6FF] dark:bg-[#172554]/30 border-[#BFDBFE]/30 dark:border-[#1E40AF]/20",
        badgeColor: "bg-[#DBEAFE] dark:bg-[#1E3A8A]/60 text-[#2563EB] dark:text-[#60A5FA]",
        btnGradient: "from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] shadow-blue-500/10",
        pillsColor: "bg-white/70 dark:bg-slate-900/60 border-[#BFDBFE]/40 dark:border-[#1E40AF]/20 text-[#1D4ED8] dark:text-[#93C5FD] hover:bg-white dark:hover:bg-slate-900",
        tags: [
          { name: "Shoes", icon: Sparkles },
          { name: "Watch", icon: Watch },
          { name: "Jacket", icon: Shirt },
          { name: "Sunglasses", icon: Glasses },
          { name: "Backpack", icon: Luggage }
        ],
        fallbackImage: fashionImg,
        overlayBadge: { text: "New Arrivals", color: "text-[#2563EB] dark:text-[#60A5FA]" }
      },
      {
        badge: "Cozy Living",
        badgeIcon: Home,
        colorClass: "bg-[#FFF7ED] dark:bg-[#7C2D12]/15 border-[#FFEDD5]/30 dark:border-[#9A3412]/20",
        badgeColor: "bg-[#FFEDD5] dark:bg-[#9A3412]/30 text-[#EA580C] dark:text-[#FDBA74]",
        btnGradient: "from-[#EA580C] to-[#C2410C] hover:from-[#C2410C] hover:to-[#9A3412] shadow-orange-500/10",
        pillsColor: "bg-white/70 dark:bg-slate-900/60 border-[#FFEDD5]/40 dark:border-[#9A3412]/20 text-[#C2410C] dark:text-[#FDBA74] hover:bg-white dark:hover:bg-slate-900",
        tags: [
          { name: "Cookware", icon: Utensils },
          { name: "Air Fryer", icon: Tv },
          { name: "Mixer", icon: ChefHat },
          { name: "Vacuum", icon: Wind },
          { name: "Sofa", icon: Home }
        ],
        fallbackImage: homeImg,
        overlayBadge: { text: "Best Sellers", color: "text-[#EA580C] dark:text-[#FDBA74]" }
      }
    ];

    const preset = presets[idx % presets.length];
    let imageSrc = col.banner;
    if (!imageSrc || !imageSrc.startsWith("http")) {
      imageSrc = preset.fallbackImage;
    }

    return {
      id: col.slug || col._id,
      title: col.name,
      subtitle: col.description || "Explore curated items from this premium collection.",
      badge: preset.badge,
      badgeIcon: preset.badgeIcon,
      colorClass: preset.colorClass,
      badgeColor: preset.badgeColor,
      btnGradient: preset.btnGradient,
      pillsColor: preset.pillsColor,
      tags: preset.tags,
      image: imageSrc,
      overlayBadge: preset.overlayBadge
    };
  });

  return (
    <section className="w-full px-4 sm:px-8 lg:px-12 mb-3 select-none text-left">
      {/* Header with Slider Controls + View All */}
      <div className="flex justify-between items-end mb-6">
        <div className="text-left">
          <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100">Shop By Collections</h2>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1">Handpicked collections, just for you</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/collections")}
            className="px-4 py-2 rounded-full border border-blue-600/30 hover:border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold text-xs flex items-center gap-1.5 hover:bg-blue-50/20 dark:hover:bg-blue-950/10 transition-all cursor-pointer bg-transparent"
          >
            <span>View All</span>
            <ArrowRight size={12} className="stroke-[2.5]" />
          </button>
          <div className="flex gap-2">
            <button className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors shadow-sm cursor-pointer">
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-slate-100 dark:text-white transition-colors shadow-md cursor-pointer">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {collections.map((col) => (
          <div
            key={col.id}
            className={`group rounded-md border p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.03)] hover:-translate-y-1 ${col.colorClass}`}
          >
            {/* Top row: Badge + Favorite */}
            <div className="flex justify-between items-center mb-3">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${col.badgeColor}`}>
                {React.createElement(col.badgeIcon, { size: 10 })}
                {col.badge}
              </span>
              <button className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-colors duration-250 cursor-pointer active:scale-90">
                <Heart size={12} className="stroke-[2.5]" />
              </button>
            </div>

            {/* Heading & description */}
            <div className="mb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">{col.title}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed mt-1 max-w-[270px]">
                {col.subtitle}
              </p>
            </div>

            {/* Tags Pills Row */}
            <div className="flex flex-wrap gap-1.5 mb-3.5">
              {col.tags.map((tag) => (
                <span
                  key={tag.name}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-extrabold border transition-colors cursor-pointer ${col.pillsColor}`}
                >
                  {React.createElement(tag.icon, { size: 10, className: "shrink-0 stroke-[2]" })}
                  {tag.name}
                </span>
              ))}
            </div>

            {/* Image Visual Container */}
            <div className="relative rounded-md overflow-hidden aspect-[16/10] bg-white/50 dark:bg-slate-955/20 p-1.5 mb-4 flex items-center justify-center border border-white/40 dark:border-slate-800/40 shadow-inner">
              <img
                src={col.image}
                alt={col.title}
                loading="lazy"
                className="max-h-[95%] max-w-[95%] object-contain rounded-md transition-transform duration-500 group-hover:scale-105"
              />
              {col.overlayBadge && (
                <span className={`absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 text-[8.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-sm border border-slate-100/50 flex items-center gap-1 ${col.overlayBadge.color}`}>
                  <Sparkles size={9} className="fill-current" />
                  {col.overlayBadge.text}
                </span>
              )}
            </div>

            {/* CTA Button */}
            <button
              onClick={() => navigate(`/collections/${col.id}`)}
              className={`w-full py-3 bg-gradient-to-r ${col.btnGradient} text-slate-100 dark:text-white font-extrabold text-[11px] uppercase tracking-widest rounded-md shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-1.5 border-none cursor-pointer`}
            >
              <ShoppingBag size={12} className="stroke-[2.5]" />
              <span>Shop Collection</span>
              <ArrowRight size={12} className="stroke-[2.5]" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ShopByCollections;
