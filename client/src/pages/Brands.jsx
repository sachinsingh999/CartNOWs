import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { backendUrl } from "../config";
import {
  ShieldCheck,
  Star,
  ChevronRight,
  ArrowRight,
  Sparkles
} from "lucide-react";

const Brands = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const getBrandStyles = (name) => {
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const styles = [
      { colorClass: "bg-slate-900 border-slate-800 text-white", badgeColor: "bg-[#EF4444]", textColor: "text-slate-400" },
      { colorClass: "bg-[#1E3A8A] border-[#1E40AF]/30 text-white", badgeColor: "bg-[#3B82F6]", textColor: "text-blue-200" },
      { colorClass: "bg-[#1E293B] border-slate-800 text-white", badgeColor: "bg-[#10B981]", textColor: "text-slate-400" },
      { colorClass: "bg-slate-950 border-slate-800 text-white", badgeColor: "bg-[#F97316]", textColor: "text-slate-400" },
      { colorClass: "bg-[#991B1B] border-[#B91C1C]/30 text-white", badgeColor: "bg-[#A855F7]", textColor: "text-red-200" },
      { colorClass: "bg-[#D97706] border-[#EA580C]/30 text-white", badgeColor: "bg-[#06B6D4]", textColor: "text-amber-100" },
      { colorClass: "bg-[#7F1D1D] border-red-950 text-white", badgeColor: "bg-[#EC4899]", textColor: "text-red-200" },
      { colorClass: "bg-[#0F172A] border-slate-800 text-white", badgeColor: "bg-[#3B82F6]", textColor: "text-slate-400" }
    ];
    return styles[hash % styles.length];
  };

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/product/brands`);
        if (data.success) {
          const enriched = data.brands.map(brand => {
            const styles = getBrandStyles(brand.name);
            return {
              ...brand,
              logo: brand.name,
              subtext: brand.slug ? `@${brand.slug}` : "Official Store",
              discount: "Authorized",
              products: `${brand.count || 0}+ Products`,
              rating: brand.rating || "4.8",
              img: brand.logo || brand.banner || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80",
              colorClass: styles.colorClass,
              badgeColor: styles.badgeColor,
              textColor: styles.textColor,
              description: brand.description || `Explore products from the official ${brand.name} brand store with full manufacturer warranty.`
            };
          });
          setBrands(enriched);
        }
      } catch (err) {
        console.error("Failed to load brands:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-6 sm:px-12 lg:px-20 py-12 text-left">
      {/* Background Glows */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-80 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header section */}
      <div className="mb-12">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/40 px-3 py-1.5 rounded-lg mb-3">
          <ShieldCheck size={11} className="stroke-[2.5]" />
          Authorized Brand Stores
        </span>
        <h1 className="text-4xl font-black tracking-tight text-slate-800 dark:text-slate-100">
          Official Partners & <span className="text-blue-600 dark:text-blue-400">Brands</span>
        </h1>
        <p className="text-sm font-bold text-slate-500 dark:text-slate-500 mt-2 max-w-[480px]">
          Shop directly from authentic global brands with official warranty, premium support, and exclusive offers.
        </p>
      </div>

      {/* Grid of brands */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="bg-slate-900 border border-slate-800 text-slate-100 dark:text-white rounded-[32px] p-6 h-[390px] animate-pulse flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <div className="h-5 bg-slate-800 rounded w-20" />
                    <div className="h-3 bg-slate-800 rounded w-16" />
                  </div>
                  <div className="h-4 bg-slate-800 rounded w-12" />
                </div>
                <div className="h-28 bg-white/5 rounded-2xl w-full my-4" />
                <div className="h-3 bg-slate-800 rounded w-full mb-2" />
                <div className="h-3 bg-slate-800 rounded w-2/3" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div className="h-3 bg-slate-800 rounded w-16" />
                  <div className="h-3 bg-slate-800 rounded w-16" />
                </div>
                <div className="h-10 bg-white/10 rounded-full w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : brands.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] bg-white dark:bg-slate-900 text-center w-full col-span-full">
          <ShieldCheck size={40} className="text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-black text-slate-800 dark:text-white">No Brands Found</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold max-w-[280px] mt-1">
            Official brand stores will be available soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {brands.map((brand, i) => (
            <motion.div
              key={brand.slug}
              onClick={() => navigate(`/brands/${brand.slug}`)}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className={`group relative flex flex-col justify-between border rounded-[32px] p-6 transition-all duration-350 hover:shadow-xl hover:-translate-y-1.5 cursor-pointer overflow-hidden ${brand.colorClass}`}
            >
              <div>
                {/* Top row: Logo + Discount Badge */}
                <div className="flex justify-between items-start mb-4 z-10">
                  <div className="flex flex-col gap-0.5 leading-tight">
                    <span className="font-black text-base tracking-tight">{brand.logo}</span>
                    <span className={`text-[9px] font-bold ${brand.textColor}`}>{brand.subtext}</span>
                  </div>
                  <span className={`px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider rounded ${brand.badgeColor}`}>
                    {brand.discount}
                  </span>
                </div>

                {/* Cover Banner Image */}
                <div className="w-full aspect-[16/10] flex items-center justify-center my-4 relative overflow-hidden bg-white/5 dark:bg-black/10 rounded-2xl p-2.5">
                  <img
                    src={brand.img}
                    alt={brand.name}
                    className="max-h-[90%] max-w-[90%] object-contain drop-shadow-lg transition-transform duration-500 group-hover:scale-108"
                  />
                </div>

                {/* Brand Description */}
                <p className="text-[11px] font-medium leading-relaxed opacity-80 mt-2 mb-4 line-clamp-2">
                  {brand.description}
                </p>
              </div>

              {/* Bottom info row */}
              <div className="z-10 mt-2 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider mb-4">
                  <span className="opacity-70">{brand.products}</span>
                  <span className="flex items-center gap-0.5 text-amber-400">
                    <Star size={10} className="fill-current text-amber-400 stroke-none" />
                    {brand.rating} Rating
                  </span>
                </div>

                {/* Action Button inside card */}
                <div className="flex justify-between items-center w-full py-2.5 px-4 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                  <span className="text-[10px] font-black tracking-wider uppercase text-slate-100 dark:text-white">Visit Store</span>
                  <ChevronRight size={12} className="stroke-[3] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Brands;
