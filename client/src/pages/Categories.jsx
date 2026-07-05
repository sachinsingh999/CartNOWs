import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { backendUrl } from "../config";
import {
  Search,
  ArrowRight,
  TrendingUp,
  Star,
  ShoppingBag,
  Watch,
  Sparkles,
  Home,
  ShoppingCart,
  Smartphone,
  Headphones,
  BookOpen,
  Gamepad2,
  Gem,
  Tv,
  Layers,
  ArrowUpDown
} from "lucide-react";

const Categories = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default"); // default | alphabetical
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/product/categories`);
        if (data.success) {
          const enriched = data.categories.map(cat => {
            const styles = getCategoryStyles(cat.name);
            const iconKey = (cat.icon || "layers").toLowerCase();
            const IconComponent = iconMap[iconKey] || Layers;
            return {
              ...cat,
              icon: IconComponent,
              bgClass: styles.bg,
              iconColor: styles.iconColor,
              growth: cat.growth || "+12%",
              img: cat.bannerImage || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80",
              count: cat.count || 0
            };
          });
          setCategories(enriched);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const iconMap = {
    star: Star,
    shoppingbag: ShoppingBag,
    watch: Watch,
    sparkles: Sparkles,
    home: Home,
    shoppingcart: ShoppingCart,
    smartphone: Smartphone,
    headphones: Headphones,
    bookopen: BookOpen,
    gamepad2: Gamepad2,
    gem: Gem,
    tv: Tv,
    layers: Layers
  };

  const getCategoryStyles = (name) => {
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const styles = [
      { bg: "bg-[#EFF6FF] dark:bg-[#1E3A8A]/20 border-blue-100 dark:border-blue-900/30", text: "text-[#3B82F6] dark:text-[#60A5FA]", iconColor: "text-[#3B82F6]" },
      { bg: "bg-[#FFF1F2] dark:bg-[#881337]/20 border-rose-100 dark:border-rose-900/30", text: "text-[#F43F5E] dark:text-[#FB7185]", iconColor: "text-[#F43F5E]" },
      { bg: "bg-[#FAF5FF] dark:bg-[#581C87]/20 border-purple-100 dark:border-purple-900/30", text: "text-[#A855F7] dark:text-[#C084FC]", iconColor: "text-[#A855F7]" },
      { bg: "bg-[#FFF7ED] dark:bg-[#7C2D12]/15 border-orange-100 dark:border-orange-900/30", text: "text-[#F97316] dark:text-[#FDBA74]", iconColor: "text-[#F97316]" },
      { bg: "bg-[#F0FDF4] dark:bg-[#064E3B]/20 border-emerald-100 dark:border-emerald-900/30", text: "text-[#22C55E] dark:text-[#4ADE80]", iconColor: "text-[#22C55E]" },
      { bg: "bg-[#F7FEE7] dark:bg-[#365314]/20 border-lime-100 dark:border-lime-900/30", text: "text-[#84CC16] dark:text-[#A3E635]", iconColor: "text-[#84CC16]" },
      { bg: "bg-[#F0FDFA] dark:bg-[#115E59]/20 border-teal-100 dark:border-teal-900/30", text: "text-[#0D9488] dark:text-[#2DD4BF]", iconColor: "text-[#0D9488]" }
    ];
    return styles[hash % styles.length];
  };

  const filteredCategories = useMemo(() => {
    let result = categories.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (sortBy === "alphabetical") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "count") {
      result.sort((a, b) => b.count - a.count);
    }
    return result;
  }, [categories, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-6 sm:px-12 lg:px-20 py-12 text-left">
      {/* Glow effects */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-400/10 dark:bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header section */}
      <div className="relative mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/40 px-3 py-1.5 rounded-lg mb-3">
            <Layers size={11} className="stroke-[2.5]" />
            Department Directory
          </span>
          <h1 className="text-4xl font-black tracking-tight text-slate-800 dark:text-slate-100">
            Browse All <span className="text-blue-600 dark:text-blue-400">Categories</span>
          </h1>
          <p className="text-sm font-bold text-slate-400 dark:text-slate-500 mt-2 max-w-[480px]">
            Explore our curated departments offering high-quality essentials, trending collections, and luxury products.
          </p>
        </div>

        {/* Search and Sort controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            />
          </div>

          {/* Sort selection */}
          <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <ArrowUpDown size={14} className="text-slate-400 dark:text-slate-500 mr-2" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none outline-none cursor-pointer pr-1"
            >
              <option value="default">Default Sort</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="count">Product Count</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of categories */}
      {filteredCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] bg-white dark:bg-slate-900 text-center">
          <Layers size={40} className="text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-black text-slate-800 dark:text-white">No Categories Found</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold max-w-[280px] mt-1">
            We couldn't find any category matching "{searchQuery}".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCategories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              onClick={() => navigate(`/categories/${cat.slug}`)}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-5 flex flex-col justify-between transition-all duration-350 hover:shadow-xl hover:-translate-y-1.5 cursor-pointer relative overflow-hidden"
            >
              {/* Card visual blob */}
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

              <div>
                {/* Header row: Badge + Icon */}
                <div className="flex justify-between items-center mb-4">
                  <div className={`p-2.5 rounded-[16px] flex items-center justify-center ${cat.bgClass}`}>
                    {React.createElement(cat.icon, { size: 16, className: cat.iconColor })}
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <TrendingUp size={10} />
                    {cat.growth}
                  </span>
                </div>

                {/* Cover Image Container */}
                <div className="w-full aspect-[16/10] bg-slate-50 dark:bg-slate-950/40 rounded-[20px] overflow-hidden flex items-center justify-center p-3 mb-4 border border-slate-100/50 dark:border-slate-800/30 shadow-inner">
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="max-h-[90%] max-w-[90%] object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>

              {/* Text content & link */}
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs font-bold text-slate-400 mt-1">
                  {cat.count.toLocaleString()} Products Available
                </p>

                {/* Footer action link */}
                <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <span>Explore Department</span>
                  <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;
