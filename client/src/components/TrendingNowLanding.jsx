import React, { useState, useEffect, useMemo } from "react";
import { 
  ArrowRight, 
  Sparkles, 
  Flame, 
  Zap, 
  TrendingUp, 
  Eye, 
  Clock, 
  Filter, 
  X, 
  Grid2X2, 
  Grid3X3, 
  LayoutGrid, 
  Search, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ShieldCheck,
  Award
} from "lucide-react";
import ProductCard from "../pages/ProductCard";
import { ProductGridSkeleton } from "./SkeletonLoader";

import heroImg from "../assets/trending_now_hero.jpg";
import mensImg from "../assets/cat_mens_new.jpg";
import womensImg from "../assets/cat_womens_new.jpg";
import footwearImg from "../assets/cat_footwear_new.jpg";
import electronicsImg from "../assets/cat_electronics.jpg";
import jewelryImg from "../assets/cat_jewelry.jpg";
import beautyImg from "../assets/cat_beauty.jpg";
import bagsImg from "../assets/cat_bags_new.jpg";
import accessoriesImg from "../assets/cat_accessories_new.jpg";
import headwearImg from "../assets/cat_headwear_new.jpg";

const TrendingNowLanding = ({
  products = [],
  loading = false,
  navigate,
  meta,
  currentPage,
  itemsPerPage,
  setItemsPerPage,
  setCurrentPage,
  handlePageChange
}) => {
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [gridCols, setGridCols] = useState(4);

  // Live Simulated Shopper Count for Real-Time Hype
  const [activeShoppers, setActiveShoppers] = useState(2480);

  useEffect(() => {
    const shopperInterval = setInterval(() => {
      setActiveShoppers(prev => {
        const delta = Math.floor(Math.random() * 11) - 5;
        return Math.max(2200, prev + delta);
      });
    }, 3000);
    return () => clearInterval(shopperInterval);
  }, []);

  const categories = [
    { id: "Men", label: "Men", image: mensImg },
    { id: "Women", label: "Women", image: womensImg },
    { id: "Footwear", label: "Footwear", image: footwearImg },
    { id: "Electronics", label: "Electronics", image: electronicsImg },
    { id: "Jewelry", label: "Jewelry & Watches", image: jewelryImg },
    { id: "Beauty", label: "Beauty & Care", image: beautyImg },
    { id: "Bags", label: "Bags", image: bagsImg },
    { id: "Accessories", label: "Accessories", image: accessoriesImg },
    { id: "Headwear", label: "Headwear", image: headwearImg }
  ];

  const duplicatedCategories = [...categories, ...categories, ...categories];

  // Dynamic product counts
  const categoryCounts = useMemo(() => {
    const counts = { All: products.length };
    products.forEach((p) => {
      const cat = (p.category || "").toLowerCase();
      const sub = (p.subCategory || "").toLowerCase();
      const name = (p.name || "").toLowerCase();
      const aud = (p.audience || "").toLowerCase();

      if (cat.includes("men") || sub.includes("men") || aud === "men") counts.Men = (counts.Men || 0) + 1;
      if (cat.includes("women") || sub.includes("women") || aud === "women") counts.Women = (counts.Women || 0) + 1;
      if (cat.includes("shoe") || cat.includes("footwear") || cat.includes("sneaker") || sub.includes("shoe")) counts.Footwear = (counts.Footwear || 0) + 1;
      if (cat.includes("electronics") || cat.includes("computer") || sub.includes("tech") || sub.includes("electronics")) counts.Electronics = (counts.Electronics || 0) + 1;
      if (cat.includes("jewel") || cat.includes("watch") || sub.includes("watch") || sub.includes("jewel")) counts.Jewelry = (counts.Jewelry || 0) + 1;
      if (cat.includes("beauty") || cat.includes("skin") || sub.includes("beauty") || sub.includes("skin")) counts.Beauty = (counts.Beauty || 0) + 1;
      if (cat.includes("bag") || sub.includes("bag") || name.includes("bag") || name.includes("backpack")) counts.Bags = (counts.Bags || 0) + 1;
      if (cat.includes("accessory") || sub.includes("accessory")) counts.Accessories = (counts.Accessories || 0) + 1;
      if (cat.includes("hat") || sub.includes("cap") || name.includes("cap") || name.includes("hat") || sub.includes("headwear")) counts.Headwear = (counts.Headwear || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filtering & Sorting Logic
  const processedProducts = useMemo(() => {
    let result = [...products];

    // 1. Category Filter
    if (selectedSubCategory !== "All") {
      const lowerSel = selectedSubCategory.toLowerCase();
      result = result.filter((p) => {
        const cat = (p.category || "").toLowerCase();
        const sub = (p.subCategory || "").toLowerCase();
        const name = (p.name || "").toLowerCase();

        if (lowerSel === "men") return cat.includes("men") || sub.includes("men") || (p.audience || "").toLowerCase() === "men";
        if (lowerSel === "women") return cat.includes("women") || sub.includes("women") || (p.audience || "").toLowerCase() === "women";
        if (lowerSel === "footwear") return cat.includes("shoe") || cat.includes("footwear") || cat.includes("sneaker") || sub.includes("shoe");
        if (lowerSel === "electronics") return cat.includes("electronics") || cat.includes("computer") || sub.includes("tech") || sub.includes("electronics");
        if (lowerSel === "jewelry") return cat.includes("jewel") || cat.includes("watch") || sub.includes("watch") || sub.includes("jewel");
        if (lowerSel === "beauty") return cat.includes("beauty") || cat.includes("skin") || sub.includes("beauty") || sub.includes("skin");
        if (lowerSel === "bags") return cat.includes("bag") || sub.includes("bag") || name.includes("bag") || name.includes("backpack");
        if (lowerSel === "accessories") return cat.includes("accessory") || sub.includes("accessory");
        if (lowerSel === "headwear") return cat.includes("hat") || sub.includes("cap") || name.includes("cap") || name.includes("hat") || sub.includes("headwear");
        return cat.includes(lowerSel) || sub.includes(lowerSel) || name.includes(lowerSel);
      });
    }

    // 2. Search Filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.brand || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q)
      );
    }

    // 3. Quick Chips Filter
    if (quickFilter === "fast") {
      result = result.filter((p) => p.isBestSeller || (p.rating && (p.rating.average || p.rating) >= 4.3));
    } else if (quickFilter === "toprated") {
      result = result.filter((p) => p.rating && (p.rating.average || p.rating) >= 4.5);
    } else if (quickFilter === "sale") {
      result = result.filter((p) => p.originalPrice && p.originalPrice > p.price);
    } else if (quickFilter === "viral") {
      result = result.filter((p) => p.isBestSeller || p.price >= 2000);
    }

    // 4. Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => ((b.rating?.average || b.rating || 0) - (a.rating?.average || a.rating || 0)));
    } else {
      // Default: Popularity / Trending ranking
      result.sort((a, b) => {
        const scoreA = (a.isBestSeller ? 50 : 0) + (a.rating?.average || a.rating || 0) * 10 - a.price * 0.001;
        const scoreB = (b.isBestSeller ? 50 : 0) + (b.rating?.average || b.rating || 0) * 10 - b.price * 0.001;
        return scoreB - scoreA;
      });
    }

    return result;
  }, [products, selectedSubCategory, searchQuery, quickFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(processedProducts.length / itemsPerPage));

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedProducts.slice(start, start + itemsPerPage);
  }, [processedProducts, currentPage, itemsPerPage]);

  const scrollToGrid = () => {
    const el = document.getElementById("trending-grid");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const getGridColsClass = () => {
    if (gridCols === 2) return "grid-cols-1 sm:grid-cols-2";
    if (gridCols === 3) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
    return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 pb-20 font-sans">
      

      {/* FULL WIDTH CONTAINER WITH RESPONSIVE PADDING */}
      <div className="w-full px-3 sm:px-6 lg:px-8 pt-2.5">
        
        {/* 1. EDITORIAL TRENDING HERO SECTION SPLIT IN TWO HALVES (50% LEFT WHITISH-YELLOWISH / 50% RIGHT) */}
        <div className="relative w-full rounded-sm overflow-hidden bg-[#FAF7EE] dark:bg-stone-950 border border-amber-200/70 dark:border-slate-800 shadow-md flex flex-col lg:flex-row items-stretch h-[calc(100vh-230px)] min-h-[460px] max-h-[590px] mb-3">
          
          {/* Left Half (50% Column): Whitish-Yellowish Text Content */}
          <div className="w-full lg:w-1/2 p-6 sm:p-10 lg:p-12 flex flex-col justify-center relative z-10 bg-[#FAF7EE] dark:bg-stone-950 text-slate-900 dark:text-white transition-colors duration-300">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-amber-500/15 border border-amber-500/35 text-amber-900 dark:text-amber-300 text-xs font-bold tracking-wider w-fit mb-3">
              <span>VIRAL SELECTION CAPSULE</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-[0.95] mb-3">
              TRENDING <br />
              <span className="text-amber-600 dark:text-amber-400">
                NOW
              </span>
            </h1>

            <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed max-w-md">
              Most wanted catalog items right now. Curated live from real-time customer views, order velocity & viral ratings.
            </p>

            {/* LIVE VELOCITY HYPEMETER GAUGE */}
            <div className="mt-5 p-3.5 rounded-sm bg-white/90 dark:bg-slate-900/90 border border-amber-200/80 dark:border-slate-800 max-w-xs sm:max-w-sm shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-1.5">
                <span className="text-amber-800 dark:text-amber-400 font-bold">
                  LIVE STOCK VELOCITY
                </span>
                <span className="text-slate-900 dark:text-white font-mono font-bold">98.4% HIGH DEMAND</span>
              </div>

              {/* Animated Heat Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-xs overflow-hidden mb-2">
                <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 animate-pulse w-[98.4%]" />
              </div>

              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-slate-900 dark:text-white font-bold">{activeShoppers}</span> viewing now
                </span>
                <span className="text-amber-700 dark:text-amber-400 font-bold">Dispatching in 24h</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={scrollToGrid}
                className="inline-flex items-center gap-2.5 bg-slate-950 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 text-xs sm:text-sm font-bold uppercase tracking-wider px-7 py-3 rounded-sm transition-all duration-200 shadow-md hover:-translate-y-0.5 cursor-pointer group"
              >
                <span>Explore Trending Drops</span>
                <ArrowRight size={16} className="stroke-[2.5] transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Right Half (50% Column): Full Image Box */}
          <div className="w-full lg:w-1/2 relative h-full min-h-[280px] overflow-hidden bg-slate-900">
            <img
              src={heroImg}
              alt="Trending Now Editorial Lifestyle"
              className="w-full h-full object-cover object-center select-none contrast-[105%] hover:scale-105 transition-transform duration-700 rounded-b-sm lg:rounded-b-none lg:rounded-r-sm"
            />

            {/* Subtle Gradient Overlay on Image edge */}
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-950/60 via-transparent to-transparent pointer-events-none" />

            {/* Floating Glass Circular Stamp */}
            <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 w-26 h-26 sm:w-30 sm:h-30 rounded-full bg-slate-950/85 backdrop-blur-md border border-slate-700/60 flex items-center justify-center shadow-2xl hover:scale-105 transition-transform cursor-pointer z-10">
              <div className="relative w-full h-full flex items-center justify-center">
                <svg className="w-full h-full animate-[spin_20s_linear_infinite]" viewBox="0 0 100 100">
                  <path id="trendingStampPath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
                  <text className="text-[8px] font-bold uppercase tracking-[0.24em] fill-white">
                    <textPath href="#trendingStampPath" startOffset="0%">
                      • HIGH DEMAND • VIRAL SELECTION
                    </textPath>
                  </text>
                </svg>
              </div>
            </div>
          </div>

        </div>

        {/* 2. FRAMELESS CATEGORY ANIMATED TICKER (WITH TOP-TO-BOTTOM SLIDE ENTRANCE) */}
        <div className="mb-5 space-y-2">
          
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">
                Browse By Category ({categories.length} Categories)
              </h3>
            </div>

            {selectedSubCategory !== "All" && (
              <button
                onClick={() => setSelectedSubCategory("All")}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none"
              >
                <X size={13} /> Clear Filter
              </button>
            )}
          </div>

          {/* INFINITE MARQUEE TICKER ANIMATING LEFT TO RIGHT WITH REAL STUDIO PHOTOS */}
          <div className="w-full overflow-hidden relative py-2">
            <div className="absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-slate-50/90 dark:from-slate-950 to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-slate-50/90 dark:from-slate-950 to-transparent pointer-events-none" />

            <div 
              className="flex items-center gap-4 w-max category-marquee-track cursor-pointer"
              style={{
                animation: "marquee-left-to-right 35s linear infinite"
              }}
            >
              {duplicatedCategories.map((cat, idx) => {
                const isActive = selectedSubCategory === cat.id;
                const count = categoryCounts[cat.id] || 0;

                return (
                  <button
                    key={`${cat.id}-${idx}`}
                    onClick={() => {
                      setSelectedSubCategory(cat.id);
                      setCurrentPage(1);
                    }}
                    style={{ animationDelay: `${(idx % categories.length) * 40}ms` }}
                    className={`group relative w-20 h-24 sm:w-24 sm:h-28 rounded-sm overflow-hidden border transition-all duration-300 cursor-pointer shrink-0 text-left animate-slide-from-top ${
                      isActive
                        ? "border-2 border-slate-900 dark:border-white shadow-lg scale-105 ring-2 ring-amber-400/40"
                        : "border-slate-200/90 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-md hover:scale-102"
                    }`}
                  >
                    {/* Full Card Background Image */}
                    <img 
                      src={cat.image} 
                      alt={cat.label} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />

                    {/* High-Contrast Bottom Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />

                    {/* Active State Badge */}
                    {isActive && (
                      <div className="absolute top-1 right-1 px-1 py-0.2 rounded-xs bg-amber-400 text-slate-950 text-[7px] font-black uppercase tracking-wider shadow-md z-20 flex items-center gap-0.5">
                        <span className="w-1 h-1 rounded-full bg-slate-950 animate-ping" />
                        <span>ACTIVE</span>
                      </div>
                    )}

                    {/* Overlay Text Content Box */}
                    <div className="absolute bottom-0 left-0 right-0 p-1.5 z-20 text-white flex flex-col justify-end">
                      <h4 className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider leading-tight text-white drop-shadow-md truncate">
                        {cat.label}
                      </h4>
                      <span className="text-[8px] font-bold text-amber-300 block mt-0.5 drop-shadow-xs">
                        {count} {count === 1 ? "Item" : "Items"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* 3. INTERACTIVE CONTROL TOOLBAR (COMPACT & STICKY TOUCHING NAVBAR) */}
        <div id="trending-grid" className="sticky top-14 sm:top-16 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-sm p-2.5 sm:p-3 mb-6 shadow-md transition-all">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
            
            {/* Left Section: Title + Item Count + Filter Chips */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-0.5">
              <div className="flex items-center gap-2 shrink-0 border-r border-slate-200 dark:border-slate-800 pr-3">
                <h2 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">
                  Trending Drops
                </h2>
                <span className="text-[10px] font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                  {processedProducts.length} Items
                </span>
              </div>

              {/* Quick Filter Chips */}
              <div className="flex items-center gap-1.5 shrink-0">
                {[
                  { id: "all", label: "All Trending" },
                  { id: "fast", label: "Fast Sellers" },
                  { id: "toprated", label: "Top Rated (4.5★+)" },
                  { id: "sale", label: "Mega Savings" },
                  { id: "viral", label: "Viral Picks" }
                ].map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => {
                      setQuickFilter(chip.id);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1 text-[11px] font-semibold rounded-sm transition-all duration-200 cursor-pointer shrink-0 border ${
                      quickFilter === chip.id
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs"
                        : "bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-700/50 hover:bg-slate-200/80 dark:hover:bg-slate-700"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Section: Search, Sort Dropdown & View Switcher */}
            <div className="flex items-center justify-between lg:justify-end gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-slate-800">
              
              {/* Search Field */}
              <div className="relative w-full sm:w-56 md:w-64">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search trending drops..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1 text-[11px] bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white border-none bg-transparent cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-slate-900 dark:text-white text-[11px] font-semibold px-2.5 py-1 rounded-sm focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white cursor-pointer shadow-xs"
                >
                  <option value="popular">Most Popular / Viral First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rating</option>
                </select>
              </div>

              {/* Grid Columns Density Switcher */}
              <div className="hidden sm:flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-2">
                <button
                  onClick={() => setGridCols(2)}
                  title="2 Columns View"
                  className={`p-1 rounded-sm border transition-all cursor-pointer ${
                    gridCols === 2
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs"
                      : "bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 border-slate-200/60 dark:border-slate-700/50 hover:border-slate-400"
                  }`}
                >
                  <Grid2X2 size={13} />
                </button>

                <button
                  onClick={() => setGridCols(3)}
                  title="3 Columns View"
                  className={`p-1 rounded-sm border transition-all cursor-pointer ${
                    gridCols === 3
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs"
                      : "bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 border-slate-200/60 dark:border-slate-700/50 hover:border-slate-400"
                  }`}
                >
                  <Grid3X3 size={13} />
                </button>

                <button
                  onClick={() => setGridCols(4)}
                  title="4 Columns View"
                  className={`p-1 rounded-sm border transition-all cursor-pointer ${
                    gridCols === 4
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs"
                      : "bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 border-slate-200/60 dark:border-slate-700/50 hover:border-slate-400"
                  }`}
                >
                  <LayoutGrid size={13} />
                </button>
              </div>

            </div>

          </div>

        </div>

        {/* 4. PRODUCT GRID SECTION */}
        {loading ? (
          <ProductGridSkeleton count={itemsPerPage} />
        ) : processedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 border border-slate-200/80 dark:border-slate-800 rounded-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-center animate-fade-in my-6 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Trending Drops Match Your Filters</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-1 leading-normal">
              We couldn't find any trending items matching your active category or filter settings.
            </p>
            <button
              onClick={() => {
                setSelectedSubCategory("All");
                setSearchQuery("");
                setQuickFilter("all");
              }}
              className="mt-6 px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-sm cursor-pointer hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-xs"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <>
            <div className={`grid ${getGridColsClass()} gap-5 animate-fade-in`}>
              {paginatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Showing <span className="font-bold text-slate-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span>–
                  <span className="font-bold text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, processedProducts.length)}</span> of{" "}
                  <span className="font-bold text-slate-900 dark:text-white">{processedProducts.length}</span> trending products
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(1)}
                    title="First Page"
                    className="p-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all shadow-xs"
                  >
                    <ChevronsLeft size={15} className="stroke-[2.5]" />
                  </button>

                  <button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    title="Previous Page"
                    className="p-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all shadow-xs"
                  >
                    <ChevronLeft size={15} className="stroke-[2.5]" />
                  </button>

                  <span className="px-3.5 py-1.5 rounded-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white shadow-xs">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    title="Next Page"
                    className="p-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all shadow-xs"
                  >
                    <ChevronRight size={15} className="stroke-[2.5]" />
                  </button>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    title="Last Page"
                    className="p-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all shadow-xs"
                  >
                    <ChevronsRight size={15} className="stroke-[2.5]" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default TrendingNowLanding;
