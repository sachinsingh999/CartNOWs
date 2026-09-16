import React, { useEffect, useState, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowLeft,
  Heart,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  ArrowRight,
  Eye,
  Star,
  ShieldCheck,
  Zap,
  Sliders,
  CheckCircle2,
  Search,
  X,
  Layers,
  Camera,
  Compass,
  ShoppingBag,
  TrendingUp,
  Shirt,
  MoveHorizontal,
  ChevronRight,
  Check
} from "lucide-react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import useTryOnStore from "../store/tryOnStore";
import TryOnModal from "../components/TryOnModal";
import TryOnHistory from "../components/TryOnHistory";
import BeforeAfterSlider from "../components/BeforeAfterSlider";

// Real Photorealistic Matching Model Pairs
import tryonDemo1Before from "../assets/tryon_demo1_before.jpg";
import tryonDemo1After from "../assets/tryon_demo1_after.jpg";
import tryonDemo2Before from "../assets/tryon_demo2_before.jpg";
import tryonDemo2After from "../assets/tryon_demo2_after.jpg";
import tryonDemo3Before from "../assets/tryon_demo3_before.jpg";
import tryonDemo3After from "../assets/tryon_demo3_after.jpg";

// Sample Demo showcase models for the Hero & Split-Screen Visualizer
const HERO_DEMO_PRESETS = [
  {
    id: "demo-1",
    name: "Urban Olive Bomber Jacket",
    category: "Outerwear",
    tag: "Streetwear Fit",
    beforeImg: tryonDemo1Before,
    afterImg: tryonDemo1After,
    price: "₹3,499",
    fitScore: "99.4%"
  },
  {
    id: "demo-2",
    name: "Executive Navy Suit Blazer",
    category: "Men Formal",
    tag: "Tailored Fit",
    beforeImg: tryonDemo2Before,
    afterImg: tryonDemo2After,
    price: "₹5,999",
    fitScore: "98.9%"
  },
  {
    id: "demo-3",
    name: "Festive Embroidered Silk Kurti",
    category: "Women Ethnic",
    tag: "Festive Edition",
    beforeImg: tryonDemo3Before,
    afterImg: tryonDemo3After,
    price: "₹2,899",
    fitScore: "99.7%"
  }
];

const TryOnPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { openTryOn } = useTryOnStore();
  const catalogSectionRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCatalogTab, setActiveCatalogTab] = useState("trending"); // trending | new | rating | price_asc | price_desc
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [heroDemoIndex, setHeroDemoIndex] = useState(0);
  const [heroViewMode, setHeroViewMode] = useState("after"); // before | after
  const [favorites, setFavorites] = useState(new Set());

  const token = localStorage.getItem("token") || "";

  const getUserIdFromToken = (t) => {
    if (!t) return null;
    try {
      const payload = t.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.id || decoded._id;
    } catch (e) {
      return null;
    }
  };

  const userId = getUserIdFromToken(token);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${backendUrl}/api/product/list?limit=500`)
      .then((res) => {
        if (res.data.success) {
          const allProds = res.data.products || [];
          const fashionItems = allProds.filter((p) => {
            const cat = (p.category || "").toLowerCase();
            const sub = (p.subCategory || "").toLowerCase();
            const col = (p.collection || "").toLowerCase();
            const name = (p.name || "").toLowerCase();

            // Exclude non-wearable categories explicitly
            if (
              cat.includes("jewel") ||
              cat.includes("necklace") ||
              cat.includes("earring") ||
              cat.includes("electronics") ||
              cat.includes("appliance") ||
              cat.includes("kitchen") ||
              cat.includes("grocery") ||
              cat.includes("beauty") ||
              sub.includes("necklace") ||
              sub.includes("ring") ||
              sub.includes("chopper") ||
              name.includes("necklace") ||
              name.includes("pendant") ||
              name.includes("earring")
            ) {
              return false;
            }

            return (
              cat.includes("clothing") ||
              cat.includes("apparel") ||
              cat.includes("fashion") ||
              sub.includes("shirt") ||
              sub.includes("t-shirt") ||
              sub.includes("trouser") ||
              sub.includes("jacket") ||
              sub.includes("jeans") ||
              sub.includes("dress") ||
              sub.includes("activewear") ||
              sub.includes("blazer") ||
              sub.includes("ethnic") ||
              sub.includes("kurti") ||
              sub.includes("kurta") ||
              sub.includes("saree") ||
              sub.includes("top") ||
              sub.includes("skirt") ||
              sub.includes("sweater") ||
              sub.includes("hoodie") ||
              sub.includes("coat") ||
              name.includes("shirt") ||
              name.includes("jacket") ||
              name.includes("blazer") ||
              name.includes("kurti") ||
              name.includes("dress") ||
              name.includes("suit") ||
              name.includes("top") ||
              name.includes("sweater")
            );
          });

          const usableProducts = fashionItems.length > 0 ? fashionItems : allProds;
          const targetId = location.state?.productId;

          if (targetId) {
            let found = allProds.find((p) => p._id === targetId);
            if (found) {
              if (!usableProducts.some((p) => p._id === targetId)) {
                usableProducts.unshift(found);
              }
              setProducts(usableProducts);
              setSelectedProduct(found);
              if (token) openTryOn(found._id);
            } else {
              setProducts(usableProducts);
              axios
                .get(`${backendUrl}/api/product/single/${targetId}`)
                .then((singleRes) => {
                  if (singleRes.data.success && singleRes.data.product) {
                    const prod = singleRes.data.product;
                    setProducts((prev) => [prod, ...prev.filter((p) => p._id !== targetId)]);
                    setSelectedProduct(prod);
                    if (token) openTryOn(prod._id);
                  }
                })
                .catch((err) => console.log("Failed to fetch target product:", err));
            }
          } else {
            setProducts(usableProducts);
            if (usableProducts.length > 0) {
              setSelectedProduct(usableProducts[0]);
            }
          }
        }
      })
      .catch(() => toast.error("Failed to load fashion catalog"))
      .finally(() => setLoading(false));
  }, [location.state, token, openTryOn]);

  const handleOpenFittingRoom = (productItem) => {
    setSelectedProduct(productItem);
    if (!token) {
      toast.info("Please log in to launch your AI Virtual Fitting Room session.");
      navigate("/login", { state: { from: "/tryon", productId: productItem?._id } });
      return;
    }
    openTryOn(productItem._id);
  };

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.info("Removed from fitting wishlist");
      } else {
        next.add(id);
        toast.success("Saved to fitting wishlist");
      }
      return next;
    });
  };

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // 1. Search Query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const name = (p.name || "").toLowerCase();
          const cat = (p.category || "").toLowerCase();
          const sub = (p.subCategory || "").toLowerCase();
          const col = (p.collection || "").toLowerCase();
          if (!name.includes(q) && !cat.includes(q) && !sub.includes(q) && !col.includes(q)) {
            return false;
          }
        }

        // 2. Category pill filter
        if (selectedCategoryFilter !== "all") {
          const cat = (p.category || "").toLowerCase();
          const sub = (p.subCategory || "").toLowerCase();
          const col = (p.collection || "").toLowerCase();
          const name = (p.name || "").toLowerCase();
          const filter = selectedCategoryFilter.toLowerCase();

          if (filter === "men") return cat.includes("men") || col.includes("men") || sub.includes("men") || name.includes("men");
          if (filter === "women") return cat.includes("women") || col.includes("women") || sub.includes("women") || name.includes("women");
          if (filter === "outerwear") return sub.includes("jacket") || sub.includes("coat") || sub.includes("blazer") || sub.includes("sweater") || name.includes("jacket") || name.includes("blazer");
          if (filter === "ethnic") return sub.includes("ethnic") || cat.includes("ethnic") || sub.includes("kurta") || sub.includes("kurti") || sub.includes("saree") || name.includes("kurti") || name.includes("kurta");
          if (filter === "tops") return sub.includes("shirt") || sub.includes("top") || sub.includes("t-shirt") || name.includes("shirt") || name.includes("top");
          if (filter === "dresses") return sub.includes("dress") || cat.includes("dress") || name.includes("dress") || name.includes("gown");
        }
        return true;
      })
      .sort((a, b) => {
        if (activeCatalogTab === "price_asc") return (a.price || 0) - (b.price || 0);
        if (activeCatalogTab === "price_desc") return (b.price || 0) - (a.price || 0);
        if (activeCatalogTab === "rating") return (b.rating || 4.5) - (a.rating || 4.5);
        if (activeCatalogTab === "new") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        // "trending" default
        return 0;
      });
  }, [products, searchQuery, selectedCategoryFilter, activeCatalogTab]);

  const currentHeroDemo = HERO_DEMO_PRESETS[heroDemoIndex];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] py-4 sm:py-6 px-2 sm:px-4 lg:px-6 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto space-y-6 sm:space-y-8">
        
        {/* TOP STATUS BAR & BREADCRUMBS */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate(-1)}
              className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
              <span>Back</span>
            </button>

            <nav className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              <span className="hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer" onClick={() => navigate("/")}>Home</span>
              <ChevronRight size={11} />
              <span className="text-orange-500 font-bold">AI Studio</span>
              <ChevronRight size={11} />
              <span className="text-slate-700 dark:text-slate-300 font-extrabold">Virtual Fitting Room</span>
            </nav>
          </div>

          {/* Live Status Indicators */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="tracking-wide">AI Neural Mesh V4.2 Online</span>
            </div>

            <div className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400">
              <Zap size={11} />
              <span>GPU Latency ~2.8s</span>
            </div>
          </div>
        </div>

        {/* HERO SHOWCASE STUDIO */}
        <section className="relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/80 border border-slate-800 shadow-xl p-5 sm:p-7 lg:p-8 text-white">
          {/* Ambient Glows */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-orange-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-left">
              
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/20">
                <Sparkles size={12} className="text-orange-400 animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-300">
                  Next-Gen Generative AI Dressing Room
                </span>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]">
                  Try Before You Buy. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-indigo-300">
                    See the Fit Instantly.
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-xl">
                  Experience photorealistic garment draping mapped precisely to your posture and proportions. Zero guesswork, zero size confusion.
                </p>
              </div>

              {/* Feature Chips */}
              <div className="flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300">
                  <CheckCircle2 size={12} className="text-emerald-400" />
                  <span>99.4% Fabric Drape Precision</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300">
                  <ShieldCheck size={12} className="text-indigo-400" />
                  <span>100% Privacy Protected</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300">
                  <Zap size={12} className="text-amber-400" />
                  <span>Real-Time Neural Lighting</span>
                </div>
              </div>

              {/* CTA Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  onClick={() => {
                    if (selectedProduct) {
                      handleOpenFittingRoom(selectedProduct);
                    } else if (products.length > 0) {
                      handleOpenFittingRoom(products[0]);
                    } else {
                      toast.info("Loading catalog items...");
                    }
                  }}
                  className="group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-orange-500/25 transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  <Sparkles size={14} className="animate-pulse" />
                  <span>Launch Fitting Studio</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                </button>

                <button
                  onClick={() => {
                    if (selectedProduct) {
                      handleOpenFittingRoom(selectedProduct);
                    } else if (products.length > 0) {
                      handleOpenFittingRoom(products[0]);
                    } else {
                      toast.info("Select a garment from the catalog below.");
                    }
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  <Camera size={13} />
                  <span>Upload Photo</span>
                </button>

                <button
                  onClick={() => {
                    catalogSectionRef.current?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer"
                >
                  <ShoppingBag size={13} />
                  <span>Browse Outfits ({products.length})</span>
                </button>
              </div>

              {/* Stats Counters Strip */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10 max-w-md">
                <div>
                  <p className="text-lg sm:text-xl font-black text-white">50K+</p>
                  <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Outfits Tested</p>
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-black text-white">4.9 ★</p>
                  <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Fit Accuracy</p>
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-black text-white">&lt; 3.0s</p>
                  <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Render Time</p>
                </div>
              </div>

            </div>

            {/* Right Interactive Visualizer Column */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-[380px] rounded-lg bg-slate-900/80 backdrop-blur-xl border border-white/15 p-4 shadow-xl space-y-3">
                
                {/* Visualizer Top Bar */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9.5px] font-black uppercase tracking-wider text-emerald-400">Live Fit Demo</span>
                  </div>

                  {/* Toggle Mode Button */}
                  <div className="flex p-0.5 rounded-md bg-black/40 border border-white/10 text-[9px] font-black uppercase">
                    <button
                      onClick={() => setHeroViewMode("before")}
                      className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                        heroViewMode === "before" ? "bg-white text-slate-950 font-black shadow" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Original
                    </button>
                    <button
                      onClick={() => setHeroViewMode("after")}
                      className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                        heroViewMode === "after" ? "bg-orange-500 text-white font-black shadow" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      AI Fitted
                    </button>
                  </div>
                </div>

                {/* Model Interactive Canvas */}
                <div className="relative aspect-[3/4] rounded-md overflow-hidden bg-slate-950 border border-white/10 group">
                  <img
                    src={heroViewMode === "after" ? currentHeroDemo.afterImg : currentHeroDemo.beforeImg}
                    alt={currentHeroDemo.name}
                    className="w-full h-full object-cover transition-all duration-300 group-hover:scale-102"
                  />

                  {/* Micro-Badges */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-white/20 text-[8.5px] font-black uppercase tracking-wider text-white">
                    {currentHeroDemo.tag}
                  </div>

                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-emerald-500/80 backdrop-blur-md text-[8.5px] font-black uppercase tracking-wider text-white">
                    Fit: {currentHeroDemo.fitScore}
                  </div>

                  {/* Bottom details strip */}
                  <div className="absolute inset-x-2 bottom-2 p-2.5 rounded bg-slate-950/85 backdrop-blur-md border border-white/15 flex items-center justify-between text-left">
                    <div className="min-w-0 pr-2">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate">{currentHeroDemo.category}</p>
                      <p className="text-[11px] font-black text-white truncate">{currentHeroDemo.name}</p>
                    </div>
                    <span className="text-xs font-black text-orange-400 shrink-0">{currentHeroDemo.price}</span>
                  </div>
                </div>

                {/* Interactive Preset Selectors */}
                <div className="space-y-1.5 text-left">
                  <p className="text-[9.5px] font-black uppercase tracking-wider text-slate-400">Switch Demo Styles:</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {HERO_DEMO_PRESETS.map((preset, idx) => {
                      const isActive = heroDemoIndex === idx;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => {
                            setHeroDemoIndex(idx);
                            setHeroViewMode("after");
                          }}
                          className={`p-1.5 rounded-md text-left border transition-all cursor-pointer ${
                            isActive
                              ? "bg-white/15 border-orange-400 shadow-xs"
                              : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
                          }`}
                        >
                          <p className="text-[8.5px] font-extrabold uppercase truncate text-orange-300">Style 0{idx + 1}</p>
                          <p className="text-[9.5px] font-black truncate text-white mt-0.5">{preset.name.split(" ")[0]} {preset.name.split(" ")[1]}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* 3-STEP HOW IT WORKS JOURNEY */}
        <section className="space-y-3.5 text-left">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-1 border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <div>
              <span className="text-[9.5px] font-black text-orange-500 uppercase tracking-widest">Workflow</span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                How Virtual Try-On Works
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold max-w-sm">
              From upload to photo-realistic render in three fast steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {[
              {
                step: "01",
                title: "Upload Standing Photo",
                desc: "Provide a well-lit full-body or torso picture facing forward. Our AI isolates pose & proportions instantly.",
                icon: Upload,
                badge: "Pose Detection"
              },
              {
                step: "02",
                title: "Select Any Apparel",
                desc: "Pick from 500+ curated items in our catalog: jackets, shirts, ethnic wear, dresses, and streetwear.",
                icon: Shirt,
                badge: "Dynamic Catalog"
              },
              {
                step: "03",
                title: "AI Neural Fitting",
                desc: "Watch the fabric naturally fold, drape, and illuminate according to your posture in ultra-high fidelity.",
                icon: Sparkles,
                badge: "Instant Render"
              }
            ].map((st, sIdx) => {
              const Icon = st.icon;
              return (
                <div
                  key={sIdx}
                  className="group relative rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-2xs hover:border-orange-500/40 dark:hover:border-orange-500/40 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-md bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon size={18} />
                    </div>
                    <span className="text-xl font-black text-slate-200 dark:text-slate-800 group-hover:text-orange-500/30 transition-colors">
                      {st.step}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="inline-block text-[9px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
                      {st.badge}
                    </span>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                      {st.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* LIVE INTERACTIVE BEFORE & AFTER SLIDER SHOWCASE */}
        <section className="rounded-lg bg-gradient-to-br from-slate-100 via-white to-indigo-50/50 dark:from-slate-900/70 dark:via-slate-900/40 dark:to-indigo-950/20 border border-slate-200 dark:border-slate-800/80 p-4 sm:p-6 text-left shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center">
            
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400">
                <MoveHorizontal size={12} />
                <span>Interactive Split-Screen Engine</span>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Seamless Texture & Drape Alignment
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  Drag the slider handle across to inspect how our multi-layer neural pipeline synthesizes shadows, collar creasing, and natural physique contours on the exact same model.
                </p>
              </div>

              {/* Style Presets Selector inside the Slider Showcase */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400">Select Comparison Model:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {HERO_DEMO_PRESETS.map((preset, idx) => {
                    const isActive = heroDemoIndex === idx;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => setHeroDemoIndex(idx)}
                        className={`p-2 rounded-md border text-left transition-all cursor-pointer ${
                          isActive
                            ? "bg-slate-900 dark:bg-orange-500 border-slate-900 dark:border-orange-500 text-white shadow-2xs"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                        }`}
                      >
                        <p className="text-[8.5px] font-bold uppercase opacity-80 truncate">Sample 0{idx + 1}</p>
                        <p className="text-[10px] font-black truncate mt-0.5">{preset.name.split(" ")[1]} {preset.name.split(" ")[2] || preset.name.split(" ")[0]}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="p-2.5 rounded-md bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Physique Geometry Matching</span>
                  </div>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">99.4%</span>
                </div>

                <div className="p-2.5 rounded-md bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Fabric Texture & Wrinkle Realism</span>
                  </div>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">Ultra-HD</span>
                </div>

                <div className="p-2.5 rounded-md bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Ambient Lighting Adaptation</span>
                  </div>
                  <span className="text-xs font-black text-amber-500">100%</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <BeforeAfterSlider
                beforeImage={currentHeroDemo.beforeImg}
                afterImage={currentHeroDemo.afterImg}
                title={`${currentHeroDemo.name} - Fit Comparison`}
              />
            </div>

          </div>
        </section>

        {/* FASHION CATALOG EXPLORER */}
        <section ref={catalogSectionRef} id="catalog-section" className="space-y-4 text-left">
          
          {/* Header & Search Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <span className="text-[9.5px] font-black text-orange-500 uppercase tracking-widest">Curated Apparel</span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                Fashion Catalog & Outfits
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Select any piece to instantly drape it on your photo ({filteredProducts.length} items available)
              </p>
            </div>

            {/* Search Input Box */}
            <div className="w-full md:w-72 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jackets, shirts, dresses..."
                className="w-full pl-9 pr-8 py-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills & Sort Tabs */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
            
            {/* Category Pills */}
            <div className="flex flex-wrap gap-1.5 items-center">
              {[
                { id: "all", label: "All Clothing" },
                { id: "men", label: "Men's Wear" },
                { id: "women", label: "Women's Wear" },
                { id: "outerwear", label: "Jackets & Outerwear" },
                { id: "ethnic", label: "Ethnic & Festive" },
                { id: "tops", label: "Shirts & Tops" },
                { id: "dresses", label: "Dresses" }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryFilter(cat.id)}
                  className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer border ${
                    selectedCategoryFilter === cat.id
                      ? "bg-slate-900 dark:bg-orange-500 border-slate-900 dark:border-orange-500 text-white shadow-2xs"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Sort Tabs */}
            <div className="flex p-0.5 rounded-md bg-slate-200/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[9.5px] font-black uppercase self-end lg:self-auto shrink-0">
              {[
                { id: "trending", label: "Trending" },
                { id: "new", label: "Newest" },
                { id: "rating", label: "Top Rated" },
                { id: "price_asc", label: "Price: Low" },
                { id: "price_desc", label: "Price: High" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCatalogTab(tab.id)}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                    activeCatalogTab === tab.id
                      ? "bg-white dark:bg-slate-950 text-slate-950 dark:text-white shadow-2xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

          </div>

          {/* Catalog Products Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2.5">
              <div className="w-10 h-10 rounded-full border-3 border-slate-200 dark:border-slate-800 border-t-orange-500 animate-spin" />
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Loading Fashion Catalog...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/20 p-8 text-center space-y-3 max-w-md mx-auto">
              <Shirt className="h-8 w-8 text-slate-400 mx-auto" />
              <div>
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">No matching garments found</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Try switching categories or clearing search keywords.</p>
              </div>
              <button
                onClick={() => {
                  setSelectedCategoryFilter("all");
                  setSearchQuery("");
                }}
                className="px-3.5 py-1.5 rounded-md bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-black uppercase cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filteredProducts.map((item) => {
                const isFav = favorites.has(item._id);
                const rawImg = item.bgRemovedImage || item.images?.[0] || item.image || "";
                const imgSrc = rawImg.startsWith("http")
                  ? rawImg
                  : `${backendUrl}/${rawImg.startsWith("/") ? rawImg.slice(1) : rawImg}`;

                return (
                  <div
                    key={item._id}
                    className="group relative rounded-lg border border-slate-200/80 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 p-2.5 flex flex-col justify-between shadow-2xs hover:border-orange-500/50 dark:hover:border-orange-500/50 transition-all duration-200 overflow-hidden"
                  >
                    {/* Image Area */}
                    <div className="aspect-[3/4] rounded-md overflow-hidden bg-slate-100/70 dark:bg-slate-950/80 relative flex items-center justify-center">
                      <img
                        src={imgSrc}
                        alt={item.name}
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=60";
                        }}
                        className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-103"
                      />

                      {/* Wishlist Button */}
                      <button
                        onClick={(e) => toggleFavorite(item._id, e)}
                        className={`absolute top-2 right-2 p-1.5 rounded-md backdrop-blur-md border transition-all cursor-pointer shadow-2xs active:scale-90 ${
                          isFav
                            ? "bg-rose-500 text-white border-rose-500"
                            : "bg-white/80 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500"
                        }`}
                        title="Save to try-on wishlist"
                      >
                        <Heart size={12} fill={isFav ? "currentColor" : "none"} />
                      </button>

                      {/* AI Ready Tag */}
                      <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[7.5px] font-black uppercase tracking-wider text-slate-200">
                        ⚡ AI Mesh Ready
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="mt-2.5 space-y-1.5 text-left px-0.5">
                      <div>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide truncate">
                          {item.category || "Fashion"} · {item.collection || "Collection"}
                        </p>
                        <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 truncate mt-0.5 capitalize">
                          {item.name}
                        </h4>
                      </div>

                      {/* Pricing & Try-On Action CTA */}
                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800/80 gap-1.5">
                        <span className="text-xs font-black text-slate-950 dark:text-white">
                          ₹{item.price}
                        </span>

                        <button
                          onClick={() => handleOpenFittingRoom(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-[9.5px] font-black uppercase tracking-wider shadow-2xs active:scale-95 transition-all cursor-pointer"
                        >
                          <Sparkles size={10} className="animate-pulse" />
                          <span>Try On</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </section>

        {/* AI CAPABILITIES & FIT GUARANTEE PILLARS */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4 text-left">
          {[
            {
              title: "Neural Mesh Drape",
              desc: "Accurately replicates fabric stretch, gravity, and garment wrinkles on any body profile.",
              icon: Sliders,
              color: "text-blue-500",
              bg: "bg-blue-500/10 border-blue-500/20"
            },
            {
              title: "True-To-Scale Sizing",
              desc: "Calculates precise shoulder, torso, and inseam measurements for true size advisory.",
              icon: Star,
              color: "text-amber-500",
              bg: "bg-amber-500/10 border-amber-500/20"
            },
            {
              title: "Complete Style Match",
              desc: "Recommends complementary footwear, bags, and watches to complete your custom fit.",
              icon: Zap,
              color: "text-indigo-500",
              bg: "bg-indigo-500/10 border-indigo-500/20"
            },
            {
              title: "Zero Data Retention",
              desc: "Your photos are processed ephemerally on dedicated secure GPU clusters with 100% privacy.",
              icon: ShieldCheck,
              color: "text-emerald-500",
              bg: "bg-emerald-500/10 border-emerald-500/20"
            }
          ].map((pillar, pIdx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pIdx}
                className="rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-3.5 space-y-2 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className={`w-8 h-8 rounded-md flex items-center justify-center border ${pillar.bg} ${pillar.color}`}>
                  <Icon size={16} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {pillar.title}
                  </h4>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        {/* PREVIOUS TRY-ON OUTFITS / HISTORY */}
        <section className="border-t border-slate-200/80 dark:border-slate-800 pt-6 text-left space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9.5px] font-black text-orange-500 uppercase tracking-widest">Saved Fits</span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                Your Previous Try-On Looks
              </h2>
            </div>
          </div>

          <TryOnHistory
            token={token}
            onSelectLook={(look) => {
              const found = products.find((p) => p._id === look.productId?._id);
              if (found) {
                handleOpenFittingRoom(found);
              } else {
                toast.error("Garment item is no longer available in the catalog.");
              }
            }}
          />
        </section>

      </div>

      {/* Try-On Modal */}
      {selectedProduct && (
        <TryOnModal
          product={selectedProduct}
          token={token}
          userId={userId}
        />
      )}
    </div>
  );
};

export default TryOnPage;
