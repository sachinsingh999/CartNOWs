import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Swords,
  Flame,
  ThumbsUp,
  Sparkles,
  CheckCircle2,
  ShoppingCart,
  Eye,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  ShieldCheck,
  Star,
  Crown,
  Check
} from "lucide-react";
import { toast } from "react-toastify";

/* Curated 1v1 Product Duels */
const DUELS = [
  {
    id: "duel_audio",
    tabLabel: "ANC Audio Titans",
    category: "Flagship Audio",
    title: "Flagship Studio ANC Crown: Sony vs Apple",
    subtitle: "Battle of ultimate sound isolation, acoustics, and comfort. Which one takes your daily playlist?",
    totalVotesBase: 12480,
    contenderA: {
      id: "duel_sony_xm5",
      name: "Sony WH-1000XM5 Studio Wireless",
      brand: "Sony",
      price: 26990,
      originalPrice: 34990,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
      votesRatio: 0.64, // 64%
      badge: "Shopper's Value Favorite",
      tagline: "30h ANC • LDAC Hi-Res Audio",
      specs: [
        { label: "Battery Life", value: "30 Hours ANC On", winner: true },
        { label: "Weight", value: "250g (Ultra-Light)", winner: true },
        { label: "Codecs", value: "LDAC Hi-Res + DSEE", winner: true },
        { label: "Multipoint", value: "2 Devices Seamless", winner: false }
      ]
    },
    contenderB: {
      id: "duel_airpods_max",
      name: "Apple AirPods Max Spatial Audio",
      brand: "Apple",
      price: 49900,
      originalPrice: 59900,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80",
      votesRatio: 0.36, // 36%
      badge: "Build Quality King",
      tagline: "Stainless Steel • Spatial Audio",
      specs: [
        { label: "Battery Life", value: "20 Hours Spatial On", winner: false },
        { label: "Weight", value: "384g (Stainless Steel)", winner: false },
        { label: "Codecs", value: "Apple Computational H1", winner: false },
        { label: "Multipoint", value: "Apple Ecosystem Auto", winner: true }
      ]
    }
  },
  {
    id: "duel_sneakers",
    tabLabel: "Sneaker Supremacy",
    category: "Footwear & Streetwear",
    title: "Streetwear Cushion Clash: Nike vs Adidas",
    subtitle: "Air-Sole responsiveness vs Continental energy return. Pick your weapon for 20,000 daily steps.",
    totalVotesBase: 14820,
    contenderA: {
      id: "duel_nike_pulse",
      name: "Nike Air Max Pulse Runner",
      brand: "Nike",
      price: 9995,
      originalPrice: 13995,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
      votesRatio: 0.53, // 53%
      badge: "Street Style Icon",
      tagline: "Point-Loaded Air • Urban Fit",
      specs: [
        { label: "Cushioning", value: "Point-Loaded Air Chamber", winner: true },
        { label: "Upper", value: "Breathable Layered Mesh", winner: false },
        { label: "Traction", value: "Waffle Rubber Outsole", winner: false },
        { label: "Weight", value: "295g Agile", winner: true }
      ]
    },
    contenderB: {
      id: "duel_adidas_boost",
      name: "Adidas Ultraboost Light 23",
      brand: "Adidas",
      price: 11999,
      originalPrice: 17999,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80",
      votesRatio: 0.47, // 47%
      badge: "Marathon Comfort",
      tagline: "Light BOOST • Continental Grip",
      specs: [
        { label: "Cushioning", value: "30% Lighter Light BOOST", winner: false },
        { label: "Upper", value: "Primeknit+ Forged Fit", winner: true },
        { label: "Traction", value: "Continental™ Natural Rubber", winner: true },
        { label: "Weight", value: "305g Endurance", winner: false }
      ]
    }
  },
  {
    id: "duel_smartwatch",
    tabLabel: "Smartwatch Titan",
    category: "Wearables & Health",
    title: "Health Telemetry Titan: Samsung vs Apple",
    subtitle: "Sapphire glass & bioelectrical impedance vs Precision S9 Double Tap. Which wrist companion wins?",
    totalVotesBase: 10930,
    contenderA: {
      id: "duel_samsung_watch",
      name: "Samsung Galaxy Watch 6 Pro",
      brand: "Samsung",
      price: 18499,
      originalPrice: 29999,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
      votesRatio: 0.49, // 49%
      badge: "Body Composition Pro",
      tagline: "Sapphire Glass • 40h Battery",
      specs: [
        { label: "Display", value: "Sapphire Crystal AMOLED", winner: true },
        { label: "Health", value: "BIA Body Fat + ECG + BP", winner: true },
        { label: "Battery", value: "Up to 40 Hours", winner: true },
        { label: "Bezel", value: "Rotating Physical Crown", winner: true }
      ]
    },
    contenderB: {
      id: "duel_apple_watch",
      name: "Apple Watch Series 9 GPS",
      brand: "Apple",
      price: 38900,
      originalPrice: 44900,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80",
      votesRatio: 0.51, // 51%
      badge: "Gesture Magic S9",
      tagline: "2000 Nits • Double Tap Gesture",
      specs: [
        { label: "Display", value: "2000 Nits Edge-to-Edge", winner: false },
        { label: "Health", value: "ECG + Oxygen + Temp Sensor", winner: false },
        { label: "Battery", value: "18-36h Low Power Mode", winner: false },
        { label: "Gesture", value: "Double Tap Hands-Free", winner: true }
      ]
    }
  }
];

const ProductDuel = ({ onQuickView, onAddToCart }) => {
  const navigate = useNavigate();
  const [activeDuelId, setActiveDuelId] = useState("duel_audio");
  const [userVotes, setUserVotes] = useState({});

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("cartnow_duel_votes") || "{}");
      setUserVotes(saved);
    } catch (e) {}
  }, []);

  const currentDuel = useMemo(() => {
    return DUELS.find((d) => d.id === activeDuelId) || DUELS[0];
  }, [activeDuelId]);

  const votedContender = userVotes[currentDuel.id];

  // Dynamic vote calculations with user interaction
  const voteStats = useMemo(() => {
    let baseVotesA = Math.round(currentDuel.totalVotesBase * currentDuel.contenderA.votesRatio);
    let baseVotesB = Math.round(currentDuel.totalVotesBase * currentDuel.contenderB.votesRatio);

    if (votedContender === "A") baseVotesA += 1;
    if (votedContender === "B") baseVotesB += 1;

    const total = baseVotesA + baseVotesB;
    const percentA = Math.round((baseVotesA / total) * 100);
    const percentB = 100 - percentA;

    return { total, votesA: baseVotesA, votesB: baseVotesB, percentA, percentB };
  }, [currentDuel, votedContender]);

  const handleCastVote = (choice) => {
    const updated = { ...userVotes, [currentDuel.id]: choice };
    setUserVotes(updated);
    try {
      localStorage.setItem("cartnow_duel_votes", JSON.stringify(updated));
    } catch (e) {}

    const contenderName = choice === "A" ? currentDuel.contenderA.name : currentDuel.contenderB.name;
    toast.success(`🎉 Voted for ${contenderName}!`);
  };

  const handleAddToCartContender = (contender) => {
    if (onAddToCart) {
      onAddToCart({
        _id: contender.id,
        name: contender.name,
        price: contender.price,
        originalPrice: contender.originalPrice,
        images: [contender.image],
        category: currentDuel.category,
        brand: contender.brand,
        stock: 30
      }, 1, "Standard");
    } else {
      toast.success(`Added ${contender.name} to cart! 🛍️`);
      navigate("/cart");
    }
  };

  const handleQuickViewContender = (contender) => {
    if (onQuickView) {
      onQuickView({
        _id: contender.id,
        name: contender.name,
        price: contender.price,
        originalPrice: contender.originalPrice,
        images: [contender.image],
        category: currentDuel.category,
        brand: contender.brand,
        rating: contender.rating,
        description: `Featured Duel Contender: ${contender.name}. Engineered for premium performance and backed by official brand warranty.`,
        stock: 30
      });
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm p-3.5 sm:p-4.5 lg:p-5 shadow-xs select-none text-left transition-colors duration-200">
      
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
        <div className="text-left space-y-1">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-800/60 rounded-sm text-[9px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-300 shadow-2xs">
              <Swords size={11} className="stroke-[2.5]" />
              <span>COMMUNITY DUEL</span>
            </div>

            <span className="px-2 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
              1v1 Head-to-Head
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>This or That? The Ultimate Showdown</span>
            <span className="h-1.5 w-1.5 rounded-sm bg-rose-600 dark:bg-rose-400 animate-pulse" />
          </h2>

          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Vote for your favorite gear, see what {voteStats.total.toLocaleString("en-IN")} shoppers prefer, and unlock verified duel pricing.
          </p>
        </div>

        {/* Top Right Action */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          <button
            onClick={() => navigate("/product")}
            className="px-3 py-1.5 rounded-sm border border-slate-300 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white text-slate-800 dark:text-slate-200 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 shadow-2xs"
          >
            <span>All Showdowns</span>
            <ArrowRight size={12} className="stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Dedicated Filter Tabs Strip (Horizontal scrollable) */}
      <div 
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        className="w-full flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden pb-2.5 pt-0.5 mb-4 border-b border-slate-100 dark:border-slate-800/80"
      >
        {DUELS.map((duel) => {
          const isActive = activeDuelId === duel.id;
          const userChoice = userVotes[duel.id];

          return (
            <motion.button
              key={duel.id}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveDuelId(duel.id)}
              className={`px-3 py-1.5 rounded-sm text-[10.5px] font-black uppercase tracking-wider border transition-colors duration-150 cursor-pointer shadow-2xs flex items-center gap-1.5 shrink-0 select-none ${
                isActive
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs"
                  : "bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-700 hover:border-slate-400 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              <Swords size={12} className={isActive ? "text-rose-400 dark:text-rose-600" : "text-slate-400"} />
              <span>{duel.tabLabel}</span>
              {userChoice && (
                <span className="text-[8.5px] px-1 py-0.2 rounded-sm font-bold bg-emerald-500 text-white">
                  VOTED
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Live Animated Vote Ratio Progress Bar */}
      <div className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-sm p-3 mb-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-black">
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
            {voteStats.percentA >= voteStats.percentB && (
              <Crown size={12} className="text-amber-500 fill-amber-400" />
            )}
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>{currentDuel.contenderA.brand} ({voteStats.percentA}%)</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-bold">
            <Flame size={12} className="text-amber-500" />
            <span>{voteStats.total.toLocaleString("en-IN")} Shoppers Voted</span>
          </div>

          <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
            <span>{currentDuel.contenderB.brand} ({voteStats.percentB}%)</span>
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            {voteStats.percentB > voteStats.percentA && (
              <Crown size={12} className="text-amber-500 fill-amber-400" />
            )}
          </div>
        </div>

        {/* Dual Progress Meter */}
        <div className="relative w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-sm overflow-hidden flex shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${voteStats.percentA}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full bg-blue-600 relative"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${voteStats.percentB}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full bg-purple-600 relative"
          />
        </div>
      </div>

      {/* 2-Contender Head-to-Head Arena Grid with Center "VS" Emblem */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 relative">
        
        {/* Center Floating "VS" Emblem (Desktop/Tablet) */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-slate-950 dark:bg-slate-900 border-2 border-white dark:border-slate-700 shadow-xl flex items-center justify-center text-white font-black text-xs tracking-wider ring-4 ring-slate-200/60 dark:ring-slate-800/80">
            <span className="text-white font-black">VS</span>
          </div>
        </div>

        {/* Contender A Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className={`relative bg-white dark:bg-slate-900 border rounded-sm p-4 flex flex-col justify-between transition-all duration-200 ${
            votedContender === "A"
              ? "border-blue-500 dark:border-blue-400 shadow-md ring-2 ring-blue-500/20"
              : "border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          <div>
            {/* Top Badge & Status */}
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-black text-[9px] uppercase tracking-wider rounded-sm">
                {currentDuel.contenderA.badge}
              </span>

              {votedContender === "A" && (
                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-sm">
                  <CheckCircle2 size={11} className="stroke-[3]" />
                  Your Pick
                </span>
              )}
            </div>

            {/* Product Image & Main Details */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 mb-3.5">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-sm overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 shrink-0">
                <img
                  src={currentDuel.contenderA.image}
                  alt={currentDuel.contenderA.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1 text-center sm:text-left">
                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                  {currentDuel.contenderA.brand}
                </span>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white line-clamp-2 leading-tight">
                  {currentDuel.contenderA.name}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                  {currentDuel.contenderA.tagline}
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-2 mt-1.5">
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    ₹{currentDuel.contenderA.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs line-through text-slate-400">
                    ₹{currentDuel.contenderA.originalPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                    {Math.round(((currentDuel.contenderA.originalPrice - currentDuel.contenderA.price) / currentDuel.contenderA.originalPrice) * 100)}% OFF
                  </span>
                </div>
              </div>
            </div>

            {/* Key Specs Breakdown Table */}
            <div className="space-y-1.5 py-2.5 my-2 border-y border-slate-100 dark:border-slate-800/80 text-xs">
              {currentDuel.contenderA.specs.map((spec, i) => (
                <div key={i} className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">{spec.label}</span>
                  <div className="flex items-center gap-1">
                    <span className="font-black text-slate-800 dark:text-slate-200">{spec.value}</span>
                    {spec.winner && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Leading Spec" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 mt-2">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCastVote("A")}
              className={`flex-1 py-2 px-3 rounded-sm font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                votedContender === "A"
                  ? "bg-blue-600 text-white shadow-blue-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-blue-600 hover:text-white"
              }`}
            >
              <ThumbsUp size={13} className="stroke-[2.5]" />
              <span>{votedContender === "A" ? `Voted (${voteStats.percentA}%)` : `Vote ${currentDuel.contenderA.brand}`}</span>
            </motion.button>

            <button
              type="button"
              onClick={() => handleAddToCartContender(currentDuel.contenderA)}
              title="Add to Cart"
              className="py-2 px-3 rounded-sm bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 font-black text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              <ShoppingCart size={13} className="stroke-[2.5]" />
              <span>Buy</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickViewContender(currentDuel.contenderA)}
              title="Quick View"
              className="w-8 h-8 rounded-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 transition-colors"
            >
              <Eye size={13} className="stroke-[2.5]" />
            </button>
          </div>
        </motion.div>

        {/* Contender B Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className={`relative bg-white dark:bg-slate-900 border rounded-sm p-4 flex flex-col justify-between transition-all duration-200 ${
            votedContender === "B"
              ? "border-purple-500 dark:border-purple-400 shadow-md ring-2 ring-purple-500/20"
              : "border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          <div>
            {/* Top Badge & Status */}
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-black text-[9px] uppercase tracking-wider rounded-sm">
                {currentDuel.contenderB.badge}
              </span>

              {votedContender === "B" && (
                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-sm">
                  <CheckCircle2 size={11} className="stroke-[3]" />
                  Your Pick
                </span>
              )}
            </div>

            {/* Product Image & Main Details */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 mb-3.5">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-sm overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 shrink-0">
                <img
                  src={currentDuel.contenderB.image}
                  alt={currentDuel.contenderB.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1 text-center sm:text-left">
                <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                  {currentDuel.contenderB.brand}
                </span>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white line-clamp-2 leading-tight">
                  {currentDuel.contenderB.name}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                  {currentDuel.contenderB.tagline}
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-2 mt-1.5">
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    ₹{currentDuel.contenderB.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs line-through text-slate-400">
                    ₹{currentDuel.contenderB.originalPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                    {Math.round(((currentDuel.contenderB.originalPrice - currentDuel.contenderB.price) / currentDuel.contenderB.originalPrice) * 100)}% OFF
                  </span>
                </div>
              </div>
            </div>

            {/* Key Specs Breakdown Table */}
            <div className="space-y-1.5 py-2.5 my-2 border-y border-slate-100 dark:border-slate-800/80 text-xs">
              {currentDuel.contenderB.specs.map((spec, i) => (
                <div key={i} className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">{spec.label}</span>
                  <div className="flex items-center gap-1">
                    <span className="font-black text-slate-800 dark:text-slate-200">{spec.value}</span>
                    {spec.winner && (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" title="Leading Spec" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 mt-2">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCastVote("B")}
              className={`flex-1 py-2 px-3 rounded-sm font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                votedContender === "B"
                  ? "bg-purple-600 text-white shadow-purple-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-purple-600 hover:text-white"
              }`}
            >
              <ThumbsUp size={13} className="stroke-[2.5]" />
              <span>{votedContender === "B" ? `Voted (${voteStats.percentB}%)` : `Vote ${currentDuel.contenderB.brand}`}</span>
            </motion.button>

            <button
              type="button"
              onClick={() => handleAddToCartContender(currentDuel.contenderB)}
              title="Add to Cart"
              className="py-2 px-3 rounded-sm bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 font-black text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              <ShoppingCart size={13} className="stroke-[2.5]" />
              <span>Buy</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickViewContender(currentDuel.contenderB)}
              title="Quick View"
              className="w-8 h-8 rounded-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 transition-colors"
            >
              <Eye size={13} className="stroke-[2.5]" />
            </button>
          </div>
        </motion.div>

      </div>

    </div>
  );
};

export default ProductDuel;
