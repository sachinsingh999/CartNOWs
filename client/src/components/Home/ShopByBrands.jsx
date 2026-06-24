import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Star
} from "lucide-react";
import { backendUrl } from "../../config";

const ShopByBrands = ({ popularBrands = [] }) => {
  const navigate = useNavigate();

  const brands = (popularBrands || []).slice(0, 8).map((brand, idx) => {
    const presets = [
      {
        subtext: "Premium Quality",
        discount: "40% OFF",
        products: "1,250+ Products",
        rating: "4.9",
        colorClass: "bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800/80 text-white hover:border-slate-700/80",
        shadowClass: "hover:shadow-[0_20px_45px_rgba(71,85,105,0.25)]",
        badgeClass: "bg-red-500 shadow-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.45)] text-white animate-pulse",
        textColor: "text-slate-400",
        fallbackImg: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&auto=format&fit=crop&q=80"
      },
      {
        subtext: "Innovative Design",
        discount: "30% OFF",
        products: "1,180+ Products",
        rating: "4.8",
        colorClass: "bg-gradient-to-b from-[#0f172a] to-[#0b0f19] border-blue-950/80 text-white hover:border-blue-900/60",
        shadowClass: "hover:shadow-[0_20px_45px_rgba(59,130,246,0.25)]",
        badgeClass: "bg-blue-500 shadow-blue-500/50 shadow-[0_0_12px_rgba(59,130,246,0.45)] text-white",
        textColor: "text-blue-300",
        fallbackImg: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&auto=format&fit=crop&q=80"
      },
      {
        subtext: "Performance First",
        discount: "25% OFF",
        products: "890+ Products",
        rating: "4.7",
        colorClass: "bg-gradient-to-b from-[#1e293b] to-[#0f172a] border-slate-800/80 text-white hover:border-slate-700/80",
        shadowClass: "hover:shadow-[0_20px_45px_rgba(148,163,184,0.15)]",
        badgeClass: "bg-emerald-500 shadow-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.45)] text-white",
        textColor: "text-slate-400",
        fallbackImg: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80"
      },
      {
        subtext: "Create the Future",
        discount: "20% OFF",
        products: "760+ Products",
        rating: "4.6",
        colorClass: "bg-gradient-to-b from-stone-900 to-stone-950 border-stone-800/80 text-white hover:border-stone-755/80",
        shadowClass: "hover:shadow-[0_20px_45px_rgba(234,179,8,0.12)]",
        badgeClass: "bg-orange-500 shadow-orange-500/50 shadow-[0_0_12px_rgba(249,115,22,0.45)] text-white",
        textColor: "text-stone-400",
        fallbackImg: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400&auto=format&fit=crop&q=80"
      },
      {
        subtext: "Plug Into Nirvana",
        discount: "35% OFF",
        products: "650+ Products",
        rating: "4.7",
        colorClass: "bg-gradient-to-b from-[#3b0764] to-[#1e0533] border-purple-950/80 text-white hover:border-purple-900/60",
        shadowClass: "hover:shadow-[0_20px_45px_rgba(168,85,247,0.25)]",
        badgeClass: "bg-purple-500 shadow-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.45)] text-white",
        textColor: "text-purple-300",
        fallbackImg: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80"
      },
      {
        subtext: "Forever Faster",
        discount: "20% OFF",
        products: "540+ Products",
        rating: "4.6",
        colorClass: "bg-gradient-to-b from-[#78350f] to-[#451a03] border-amber-950/80 text-white hover:border-amber-900/60",
        shadowClass: "hover:shadow-[0_20px_45px_rgba(245,158,11,0.2)]",
        badgeClass: "bg-cyan-500 shadow-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.45)] text-white",
        textColor: "text-amber-200",
        fallbackImg: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&auto=format&fit=crop&q=80"
      },
      {
        subtext: "Delighting You Always",
        discount: "15% OFF",
        products: "420+ Products",
        rating: "4.8",
        colorClass: "bg-gradient-to-b from-[#450a0a] to-[#280505] border-red-950 text-white hover:border-red-900",
        shadowClass: "hover:shadow-[0_20px_45px_rgba(239,68,68,0.25)]",
        badgeClass: "bg-pink-500 shadow-pink-500/50 shadow-[0_0_12px_rgba(236,72,153,0.45)] text-white",
        textColor: "text-red-300",
        fallbackImg: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&auto=format&fit=crop&q=80"
      },
      {
        subtext: "Smarter Technology",
        discount: "10% OFF",
        products: "380+ Products",
        rating: "4.6",
        colorClass: "bg-gradient-to-b from-[#030712] to-[#000000] border-slate-900 text-white hover:border-slate-800",
        shadowClass: "hover:shadow-[0_20px_45px_rgba(59,130,246,0.15)]",
        badgeClass: "bg-sky-500 shadow-sky-500/50 shadow-[0_0_12px_rgba(56,189,248,0.45)] text-white",
        textColor: "text-slate-400",
        fallbackImg: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&auto=format&fit=crop&q=80"
      }
    ];

    const preset = presets[idx % presets.length];

    let logoElem;
    if (brand.logo && (brand.logo.startsWith("http") || brand.logo.includes("uploads"))) {
      logoElem = (
        <img
          src={brand.logo.startsWith("http") ? brand.logo : `${backendUrl}/${brand.logo}`}
          alt={brand.name}
          className="h-5 object-contain"
        />
      );
    } else {
      logoElem = (
        <span className="font-extrabold text-sm tracking-tight">{brand.name}</span>
      );
    }

    let imageSrc = brand.banner || brand.logo;
    if (!imageSrc || (!imageSrc.startsWith("http") && !imageSrc.includes("uploads"))) {
      imageSrc = preset.fallbackImg;
    } else if (!imageSrc.startsWith("http")) {
      imageSrc = `${backendUrl}/${imageSrc}`;
    }

    return {
      name: brand.name,
      subtext: preset.subtext,
      logo: logoElem,
      discount: preset.discount,
      products: `${brand.count || 0} Products`,
      rating: preset.rating,
      img: imageSrc,
      colorClass: preset.colorClass,
      shadowClass: preset.shadowClass,
      badgeClass: preset.badgeClass,
      textColor: preset.textColor
    };
  });

  return (
    <div className="select-none text-left w-full">
      {/* Header section with view all */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/40 px-3 py-1 rounded-md mb-2">
            <ShieldCheck size={11} className="stroke-[2.5]" />
            TRUSTED BRANDS, PREMIUM QUALITY
          </span>
          <h2 className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">
            Shop By <span className="text-blue-600 dark:text-blue-400">Brands</span>
          </h2>
          <p className="text-xs font-bold text-slate-455 dark:text-slate-500 mt-1.5">
            Explore top global brands and their best selling products
          </p>
          <div className="flex items-center gap-1 mt-2.5">
            <div className="w-12 h-1 bg-blue-600 rounded-full" />
            <div className="w-2 h-1 bg-blue-600 rounded-full" />
          </div>
        </div>

        <button
          onClick={() => navigate("/brands")}
          className="px-5 py-2.5 rounded-full border border-blue-600/30 hover:border-blue-600 text-blue-650 dark:text-blue-400 font-extrabold text-xs flex items-center gap-2 hover:bg-blue-50/20 dark:hover:bg-blue-950/10 transition-all cursor-pointer bg-transparent"
        >
          <span>View All Brands</span>
          <ArrowRight size={14} className="stroke-[2.5]" />
        </button>
      </div>

      {/* Grid of brand cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {brands.map((brand, i) => (
          <div
            key={i}
            onClick={() => navigate(`/brands/${brand.name.toLowerCase()}`)}
            className={`group relative flex flex-col justify-between border rounded-[28px] p-4 transition-all duration-500 hover:-translate-y-2 cursor-pointer overflow-hidden ${brand.colorClass} ${brand.shadowClass}`}
          >
            {/* Top row: Logo + Discount Badge */}
            <div className="flex justify-between items-start mb-2.5 z-10">
              <div className="flex flex-col gap-0.5 leading-tight">
                {brand.logo}
                <span className={`text-[8.5px] font-extrabold tracking-wider ${brand.textColor}`}>{brand.subtext}</span>
              </div>
              <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-full shadow-lg ${brand.badgeClass}`}>
                {brand.discount}
              </span>
            </div>

            {/* Central product image */}
            <div className="w-full aspect-square flex items-center justify-center my-3.5 relative overflow-hidden bg-white/5 dark:bg-black/20 rounded-2xl border border-white/5 p-2.5">
              <img
                src={brand.img}
                alt={brand.name}
                className="max-h-[85%] max-w-[85%] object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)] transition-all duration-500 ease-out group-hover:scale-112 group-hover:-translate-y-2.5 group-hover:rotate-3"
              />
            </div>

            {/* Bottom info */}
            <div className="z-10 mt-1">
              <div className="flex justify-between items-center text-[10.5px] font-extrabold mb-3.5">
                <span className={brand.textColor}>{brand.products}</span>
                <span className="flex items-center gap-0.5 text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  <Star size={10} className="fill-current text-amber-400" />
                  {brand.rating}
                </span>
              </div>

              {/* Action button inside card */}
              <div className="flex justify-between items-center w-full py-2.5 px-4 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 border border-white/5 group-hover:border-white/15">
                <span className="text-[10px] font-black tracking-wider uppercase text-white transition-all duration-300 group-hover:translate-x-0.5">Shop {brand.name}</span>
                <ChevronRight size={12} className="stroke-[3] text-white transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopByBrands;
