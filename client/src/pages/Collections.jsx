import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { backendUrl } from "../config";
import {
  Sparkles,
  ArrowRight,
  Flame,
  Shirt,
  Home,
  Laptop,
  GraduationCap,
  Gem,
  ShoppingBag,
  Award
} from "lucide-react";
import electronicsImg from "../assets/electronics_collection_composite.png";
import fashionImg from "../assets/fashion_collection_composite.png";
import homeImg from "../assets/home_collection_composite.png";

const Collections = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  const getCollectionStyles = (name) => {
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const styles = [
      {
        colorClass: "bg-[#F5F3FF] dark:bg-[#1E1B4B]/30 border-[#DDD6FE]/30 dark:border-[#4338CA]/20",
        badgeColor: "bg-[#EDE9FE] dark:bg-[#312E81]/60 text-[#7C3AED] dark:text-[#A78BFA]",
        btnGradient: "from-[#7C3AED] to-[#6D28D9]",
        badgeIcon: Flame
      },
      {
        colorClass: "bg-[#EFF6FF] dark:bg-[#172554]/30 border-[#BFDBFE]/30 dark:border-[#1E40AF]/20",
        badgeColor: "bg-[#DBEAFE] dark:bg-[#1E3A8A]/60 text-[#2563EB] dark:text-[#60A5FA]",
        btnGradient: "from-[#2563EB] to-[#1D4ED8]",
        badgeIcon: Shirt
      },
      {
        colorClass: "bg-[#FFF7ED] dark:bg-[#7C2D12]/15 border-[#FFEDD5]/30 dark:border-[#9A3412]/20",
        badgeColor: "bg-[#FFEDD5] dark:bg-[#9A3412]/30 text-[#EA580C] dark:text-[#FDBA74]",
        btnGradient: "from-[#EA580C] to-[#C2410C]",
        badgeIcon: Home
      },
      {
        colorClass: "bg-[#FFF1F2] dark:bg-[#4C0519]/25 border-pink-100 dark:border-pink-900/30",
        badgeColor: "bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400",
        btnGradient: "from-rose-500 to-rose-600",
        badgeIcon: Sparkles
      },
      {
        colorClass: "bg-[#F0FDFA] dark:bg-[#115E59]/20 border-teal-100 dark:border-teal-900/30",
        badgeColor: "bg-teal-100 dark:bg-teal-950 text-teal-650 dark:text-teal-400",
        btnGradient: "from-teal-500 to-teal-600",
        badgeIcon: GraduationCap
      },
      {
        colorClass: "bg-[#FFFDF5] dark:bg-[#451a03]/25 border-amber-100 dark:border-amber-900/30",
        badgeColor: "bg-amber-150 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
        btnGradient: "from-amber-500 to-amber-600",
        badgeIcon: Gem
      }
    ];
    return styles[hash % styles.length];
  };

  const imageFallbackMap = {
    electronics: electronicsImg,
    fashion: fashionImg,
    home: homeImg
  };

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/product/collections`);
        if (data.success) {
          const enriched = data.collections.map(col => {
            const styles = getCollectionStyles(col.name);
            const fallbackImage = imageFallbackMap[col.slug?.toLowerCase()] || "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=400&auto=format&fit=crop&q=80";
            return {
              ...col,
              title: col.name,
              subtitle: col.description || "Curated collection of high quality products.",
              count: `${col.count || 0}+ Items`,
              badge: col.name,
              badgeIcon: styles.badgeIcon,
              colorClass: styles.colorClass,
              badgeColor: styles.badgeColor,
              btnGradient: styles.btnGradient,
              image: col.banner || fallbackImage,
              trending: col.count > 0
            };
          });
          setCollections(enriched);
        }
      } catch (err) {
        console.error("Failed to load collections:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-6 sm:px-12 lg:px-20 py-12 text-left">
      {/* Glow blobs */}
      <div className="absolute top-20 left-1/3 w-96 h-96 bg-purple-400/5 dark:bg-purple-650/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-80 right-1/4 w-96 h-96 bg-rose-400/5 dark:bg-rose-650/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header section */}
      <div className="mb-12">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-purple-650 bg-purple-50 dark:text-purple-300 dark:bg-purple-950/40 px-3 py-1.5 rounded-lg mb-3">
          <Award size={11} className="stroke-[2.5]" />
          Curated Catalogues
        </span>
        <h1 className="text-4xl font-black tracking-tight text-slate-800 dark:text-slate-100">
          Shop By <span className="text-purple-650 dark:text-purple-400">Collections</span>
        </h1>
        <p className="text-sm font-bold text-slate-450 dark:text-slate-500 mt-2 max-w-[480px]">
          Discover tailored capsules built for specific lifestyles, aesthetics, and high-performance requirements.
        </p>
      </div>

      {/* Grid of collections */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(n => (
            <div key={n} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[32px] p-5 h-[340px] animate-pulse flex flex-col justify-between">
              <div>
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-24 mb-4" />
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-full w-48 mb-2" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-64 mb-6" />
                <div className="h-28 bg-slate-100 dark:bg-slate-950/20 rounded-[20px] w-full" />
              </div>
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] bg-white dark:bg-slate-900 text-center">
          <ShoppingBag size={40} className="text-slate-350 dark:text-slate-650 mb-3" />
          <h3 className="text-base font-black text-slate-800 dark:text-white">No Collections Found</h3>
          <p className="text-xs text-slate-450 dark:text-slate-500 font-bold max-w-[280px] mt-1">
            Check back later for curated catalogues.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((col, i) => (
          <motion.div
            key={col.slug}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className={`group rounded-[32px] border p-5 flex flex-col justify-between transition-all duration-350 hover:shadow-xl hover:-translate-y-1.5 ${col.colorClass}`}
          >
            <div>
              {/* Top row: Badge + Trending */}
              <div className="flex justify-between items-center mb-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${col.badgeColor}`}>
                  {React.createElement(col.badgeIcon, { size: 10 })}
                  {col.badge}
                </span>

                {col.trending && (
                  <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 px-2.5 py-0.5 rounded-full">
                    <Flame size={10} className="fill-current" />
                    Trending
                  </span>
                )}
              </div>

              {/* Title & subtitle */}
              <div className="mb-4">
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">{col.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed mt-1">
                  {col.subtitle}
                </p>
              </div>

              {/* Image visual container */}
              <div className="relative rounded-[20px] overflow-hidden aspect-[16/10] bg-white/50 dark:bg-slate-950/20 p-2 mb-4 flex items-center justify-center border border-white/40 dark:border-slate-800/40 shadow-inner">
                <img
                  src={col.image}
                  alt={col.title}
                  loading="lazy"
                  className="max-h-[95%] max-w-[95%] object-contain rounded-xl transition-transform duration-500 group-hover:scale-103"
                />
              </div>
            </div>

            {/* Bottom action bar */}
            <div className="pt-4 border-t border-slate-200/40 dark:border-slate-800/40 flex items-center justify-between">
              <span className="text-xs font-black text-slate-450 dark:text-slate-500">{col.count} Products</span>
              <button
                onClick={() => navigate(`/collections/${col.slug}`)}
                className={`px-4 py-2.5 bg-gradient-to-r ${col.btnGradient} text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl hover:shadow-lg transition-all flex items-center gap-1.5 border-none cursor-pointer`}
              >
                <ShoppingBag size={11} className="stroke-[2.5]" />
                <span>Shop Collection</span>
                <ArrowRight size={10} className="stroke-[2.5]" />
              </button>
            </div>
          </motion.div>
        ))}
        </div>
      )}
    </div>
  );
};

export default Collections;
