import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Star
} from "lucide-react";
import { backendUrl } from "../../config";

const ShopByBrands = ({ popularBrands = [] }) => {
  const navigate = useNavigate();
  const [countsMap, setCountsMap] = useState({});

  useEffect(() => {
    axios.get(`${backendUrl}/api/product/brands`)
      .then(res => {
        if (res.data.success) {
          const map = {};
          res.data.brands.forEach(b => {
            if (b.name) {
              map[b.name.toLowerCase()] = b.count;
            }
          });
          setCountsMap(map);
        }
      })
      .catch(err => console.error("Failed to load brand counts in ShopByBrands:", err));
  }, []);

  const renderBrandLogo = (brandName, logoUrl, textColorClass) => {
    if (logoUrl && (logoUrl.startsWith("http") || logoUrl.includes("uploads"))) {
      const src = logoUrl.startsWith("http") ? logoUrl : `${backendUrl}/${logoUrl}`;
      return (
        <img
          src={src}
          alt={brandName}
          className="h-12 w-auto max-w-[130px] object-contain transform-gpu"
        />
      );
    }

    const name = brandName.trim();
    const nameLower = name.toLowerCase();

    if (nameLower === "nike") {
      return (
        <svg viewBox="0 0 24 24" className="w-18 h-18 fill-current text-white/90">
          <path d="M21 6.5c-2.3 2.1-6.1 4.9-10.4 6.7-3.7 1.6-6.6 2-7.8 2-.6 0-.8-.1-.8-.3 0-.5.9-1.8 2.6-3.7 1.8-2 3.6-4.2 3.6-5.8 0-.4-.2-.7-.7-.7-.8 0-2.4 1.2-4.4 3.2C1.4 9.1.5 11 .5 12.3c0 2.2 1.9 3.2 5.5 3.2 1.6 0 3.7-.3 6-1 4.7-1.4 9.3-4.3 11.5-6.8.5-.5.2-1.2-.5-1.2z" />
        </svg>
      );
    }
    if (nameLower === "apple") {
      return (
        <svg viewBox="0 0 24 24" className="w-12 h-12 fill-current text-white/90">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.18.66-2.9 1.48-.61.7-1.14 1.83-1.01 2.94 1.11.09 2.23-.55 2.92-1.36z" />
        </svg>
      );
    }
    if (nameLower === "adidas") {
      return (
        <div className="flex flex-col items-center">
          <div className="flex items-end gap-1 mb-0.5">
            <div className="w-2 h-5 bg-white/90 rotate-[25deg] transform origin-bottom rounded-sm" />
            <div className="w-2 h-8 bg-white/90 rotate-[25deg] transform origin-bottom rounded-sm" />
            <div className="w-2 h-11 bg-white/90 rotate-[25deg] transform origin-bottom rounded-sm" />
          </div>
          <span className="text-[8px] font-black tracking-widest text-white/90 uppercase mt-0.5">adidas</span>
        </div>
      );
    }
    if (nameLower === "sony") {
      return (
        <span className="font-serif font-black text-2xl tracking-[0.2em] text-white/95">
          SONY
        </span>
      );
    }
    if (nameLower === "samsung") {
      return (
        <span className="font-sans font-black text-2xl tracking-[0.05em] text-slate-100 dark:text-white italic">
          SAMSUNG
        </span>
      );
    }
    if (nameLower === "jbl") {
      return (
        <div className="flex flex-col items-center">
          <span className="font-sans font-black text-3xl tracking-tight text-orange-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
            JBL
          </span>
          <span className="text-[7px] tracking-widest text-white/60 font-bold uppercase -mt-1">HARMAN</span>
        </div>
      );
    }
    if (nameLower === "boat") {
      return (
        <span className="font-sans font-black text-2xl tracking-tight text-slate-100 dark:text-white">
          bo<span className="text-red-500">At</span>
        </span>
      );
    }
    if (nameLower === "bose") {
      return (
        <span className="font-sans font-semibold text-2xl tracking-[0.18em] text-slate-100 italic">
          BOSE
        </span>
      );
    }
    if (nameLower === "logitech") {
      return (
        <span className="font-sans font-extrabold text-xl text-slate-200 tracking-wider">
          logitech
        </span>
      );
    }
    if (nameLower === "razer") {
      return (
        <span className="font-sans font-extrabold text-xl tracking-[0.25em] text-emerald-400 italic">
          RΛZΞR
        </span>
      );
    }
    if (nameLower === "casio") {
      return (
        <span className="font-mono font-extrabold text-2xl tracking-[0.15em] text-slate-100 dark:text-white italic">
          CASIO
        </span>
      );
    }
    if (nameLower === "puma") {
      return (
        <span className="font-sans font-black text-2xl tracking-widest text-slate-100 dark:text-white uppercase">
          PUMA
        </span>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center p-2 text-center">
        <span className="font-black text-xl tracking-tight text-slate-100 dark:text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
          {name}
        </span>
        <span className={`text-[7px] font-black uppercase tracking-widest mt-0.5 opacity-70 ${textColorClass}`}>
          EST. 2026
        </span>
      </div>
    );
  };

  const brands = (popularBrands || []).slice(0, 8).map((brand, idx) => {
    const presets = [
      {
        subtext: "Premium Quality",
        discount: "40% OFF",
        products: "1,250+ Products",
        rating: "4.9",
        colorClass: "bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800/80 text-white hover:border-slate-700/80",
        shadowClass: "hover:shadow-[0_20px_45px_rgba(71,85,105,0.25)]",
        discountColor: "text-red-500 animate-pulse",
        textColor: "text-slate-400"
      },
      {
        subtext: "Innovative Design",
        discount: "30% OFF",
        products: "1,180+ Products",
        rating: "4.8",
        colorClass: "bg-gradient-to-b from-[#0f172a] to-[#0b0f19] border-blue-950/80 text-white hover:border-blue-900/60",
        shadowClass: "hover:shadow-[0_20px_45px_rgba(59,130,246,0.25)]",
        discountColor: "text-blue-400",
        textColor: "text-blue-300"
      },
      {
        subtext: "Performance First",
        discount: "25% OFF",
        products: "890+ Products",
        rating: "4.7",
        colorClass: "bg-gradient-to-b from-[#1e293b] to-[#0f172a] border-slate-800/80 text-white hover:border-slate-700/80",
        shadowClass: "hover:shadow-[0_20px_45px_rgba(148,163,184,0.15)]",
        discountColor: "text-emerald-400",
        textColor: "text-slate-400"
      },
      {
        subtext: "Create the Future",
        discount: "20% OFF",
        products: "760+ Products",
        rating: "4.6",
        colorClass: "bg-gradient-to-b from-stone-900 to-stone-950 border-stone-800/80 text-white hover:border-stone-700/80",
        shadowClass: "hover:shadow-[0_20px_45px_rgba(234,179,8,0.12)]",
        discountColor: "text-orange-400",
        textColor: "text-stone-400"
      },
      {
        subtext: "Plug Into Nirvana",
        discount: "35% OFF",
        products: "650+ Products",
        rating: "4.7",
        colorClass: "bg-gradient-to-b from-[#3b0764] to-[#1e0533] border-purple-950 text-white hover:border-purple-900/60",
        shadowClass: "hover:shadow-[0_20px_45px_rgba(168,85,247,0.25)]",
        discountColor: "text-purple-400",
        textColor: "text-purple-300"
      },
      {
        subtext: "Forever Faster",
        discount: "20% OFF",
        products: "540+ Products",
        rating: "4.6",
        colorClass: "bg-gradient-to-b from-[#78350f] to-[#451a03] border-amber-950/80 text-white hover:border-amber-900/60",
        shadowClass: "hover:shadow-[0_20px_45px_rgba(245,158,11,0.2)]",
        discountColor: "text-cyan-400",
        textColor: "text-amber-200"
      },
      {
        subtext: "Delighting You Always",
        discount: "15% OFF",
        products: "420+ Products",
        rating: "4.8",
        colorClass: "bg-gradient-to-b from-[#450a0a] to-[#280505] border-red-950 text-white hover:border-red-900",
        shadowClass: "hover:shadow-[0_20px_45px_rgba(239,68,68,0.25)]",
        discountColor: "text-pink-400",
        textColor: "text-red-300"
      },
      {
        subtext: "Smarter Technology",
        discount: "10% OFF",
        products: "380+ Products",
        rating: "4.6",
        colorClass: "bg-gradient-to-b from-[#030712] to-[#000000] border-slate-950 text-white hover:border-slate-800",
        shadowClass: "hover:shadow-[0_20px_45px_rgba(59,130,246,0.15)]",
        discountColor: "text-sky-400",
        textColor: "text-slate-400"
      }
    ];

    const preset = presets[idx % presets.length];

    const countVal = countsMap[brand.name.toLowerCase()] !== undefined
      ? `${countsMap[brand.name.toLowerCase()]} Products`
      : preset.products;

    return {
      name: brand.name,
      subtext: preset.subtext,
      logoUrl: brand.logo,
      discount: preset.discount,
      products: countVal,
      rating: preset.rating,
      colorClass: preset.colorClass,
      shadowClass: preset.shadowClass,
      discountColor: preset.discountColor,
      textColor: preset.textColor
    };
  });

  return (
    <div className="select-none text-left w-full">
      {/* Header section with view all */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50/80 dark:text-blue-300 dark:bg-blue-950/40 px-3.5 py-1.5 rounded-full mb-3 border border-blue-100/30 dark:border-blue-900/30 shadow-sm">
            <ShieldCheck size={11} className="stroke-[2.5]" />
            Trusted Brands
          </span>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Shop By <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Brands</span>
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
            Explore top global brands and their best selling products
          </p>
          <div className="flex items-center gap-1.5 mt-3">
            <div className="w-16 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full" />
            <div className="w-2.5 h-1.5 bg-indigo-500 rounded-full" />
          </div>
        </div>

        <button
          onClick={() => navigate("/brands")}
          className="group px-6 py-3 rounded-full border border-blue-600/20 hover:border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold text-xs flex items-center gap-2 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-blue-500/10 cursor-pointer bg-transparent"
        >
          <span>View All Brands</span>
          <ArrowRight size={14} className="stroke-[2.5] transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>

      {/* Grid of brand cards - with horizontal scroll support on mobile */}
      <div className="flex overflow-x-auto sm:grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-5 pb-5 pt-2 scrollbar-hide snap-x snap-mandatory">
        {brands.map((brand, i) => (
          <div
            key={i}
            onClick={() => navigate(`/brands/${brand.name.toLowerCase()}`)}
            className={`group relative aspect-square border rounded-xl transition-[box-shadow,border-color] duration-300 cursor-pointer overflow-hidden ${brand.colorClass} ${brand.shadowClass} w-[220px] sm:w-auto shrink-0 snap-start transform-gpu`}
          >
            {/* Center: Brand Logo (no background, no scale transition on hover, responsive padding) */}
            <div className="absolute inset-0 flex items-center justify-center p-6 md:p-5 lg:p-4.5 select-none pointer-events-none z-0 transform-gpu">
              {renderBrandLogo(brand.name, brand.logoUrl, brand.textColor)}
            </div>

            {/* Hover Transparent Dark Overlay (No backdrop blur filter) */}
            <div className="absolute inset-0 bg-slate-950/85 dark:bg-slate-950/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 transform-gpu" />

            {/* Top row: Discount (Top Left) & Rating Badge (Top Right) - Flex Container */}
            <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform-gpu">
              <span className={`text-[10.5px] font-black uppercase tracking-widest ${brand.discountColor}`}>
                {brand.discount}
              </span>
              <span className="flex items-center gap-0.5 text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 text-[9.5px] font-extrabold shadow-sm shrink-0">
                <Star size={10} className="fill-current text-amber-400" />
                {brand.rating}
              </span>
            </div>

            {/* Bottom row: Brand Name, Count (Bottom Left) & Arrow (Bottom Right) - Flex Container */}
            <div className="absolute bottom-4 inset-x-4 z-20 flex items-end justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform-gpu">
              <div className="flex flex-col leading-tight text-slate-100 dark:text-white text-left min-w-0">
                <span className="font-black text-xs tracking-tight group-hover:text-blue-400 transition-colors duration-300 truncate">{brand.name}</span>
                <span className={`text-[9px] font-bold mt-0.5 truncate ${brand.textColor}`}>{brand.products}</span>
              </div>
              <div className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 border border-white/5 flex items-center justify-center shadow-sm shrink-0">
                <ChevronRight size={12} className="stroke-[3] text-slate-100 dark:text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopByBrands;
