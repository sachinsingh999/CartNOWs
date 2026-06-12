import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sparkles, ArrowLeft, Heart, RefreshCw, Upload, Image, ArrowRight, Eye, Play, Star, ShieldCheck, Zap, Sliders, CheckCircle2 } from "lucide-react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import useTryOnStore from "../store/tryOnStore";
import TryOnModal from "../components/TryOnModal";
import TryOnHistory from "../components/TryOnHistory";

const TryOnPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { openTryOn } = useTryOnStore();

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCatalogTab, setActiveCatalogTab] = useState("trending"); // trending | new | recommended
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all"); // all | men | women | kids | accessories | footwear

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
    if (!token) {
      toast.error("Please login to enter the AI Try-On Studio.");
      navigate("/login");
      return;
    }

    setLoading(true);
    axios.get(`${backendUrl}/api/product/list?limit=500`)
      .then((res) => {
        if (res.data.success) {
          const fashionItems = res.data.products.filter((p) => {
            const cat = (p.category || "").toLowerCase();
            const sub = (p.subCategory || "").toLowerCase();
            const col = (p.collection || "").toLowerCase();
            return (
              cat.includes("clothing") ||
              cat.includes("fashion") ||
              cat.includes("apparel") ||
              cat.includes("men") ||
              cat.includes("women") ||
              cat.includes("kid") ||
              cat.includes("footwear") ||
              cat.includes("accessories") ||
              cat.includes("watch") ||
              cat.includes("bag") ||
              cat.includes("eyewear") ||
              cat.includes("jewel") ||
              sub.includes("shirt") ||
              sub.includes("trouser") ||
              sub.includes("jacket") ||
              sub.includes("jeans") ||
              sub.includes("dress") ||
              sub.includes("activewear") ||
              sub.includes("blazer") ||
              sub.includes("ethnic") ||
              sub.includes("top") ||
              sub.includes("skirt") ||
              sub.includes("sweater") ||
              sub.includes("coat") ||
              col.includes("men") ||
              col.includes("women")
            );
          });
          const targetId = location.state?.productId;
          if (targetId) {
            let found = res.data.products.find(p => p._id === targetId);
            if (found) {
              if (!fashionItems.some(p => p._id === targetId)) {
                fashionItems.unshift(found);
              }
              setProducts(fashionItems);
              setSelectedProduct(found);
              openTryOn(found._id);
            } else {
              setProducts(fashionItems);
              axios.get(`${backendUrl}/api/product/single/${targetId}`)
                .then(singleRes => {
                  if (singleRes.data.success && singleRes.data.product) {
                    const prod = singleRes.data.product;
                    setProducts(prev => {
                      if (!prev.some(p => p._id === targetId)) {
                        return [prod, ...prev];
                      }
                      return prev;
                    });
                    setSelectedProduct(prod);
                    openTryOn(prod._id);
                  }
                })
                .catch(err => console.log("Failed to fetch target product:", err));
            }
          } else {
            setProducts(fashionItems);
            if (fashionItems.length > 0) {
              setSelectedProduct(fashionItems[0]);
            }
          }
        }
      })
      .catch(() => toast.error("Failed to load catalog"))
      .finally(() => setLoading(false));
  }, [location.state, token, navigate, openTryOn]);

  const handleOpenFittingRoom = (productItem) => {
    setSelectedProduct(productItem);
    openTryOn(productItem._id);
  };

  const filteredProducts = products.filter(p => {
    // 1. Filter by active tab
    if (activeCatalogTab === "trending" && p.price >= 1500) return false;
    if (activeCatalogTab === "new" && p.stock <= 10) return false;

    // 2. Filter by selected category pill
    if (selectedCategoryFilter !== "all") {
      const cat = (p.category || "").toLowerCase();
      if (selectedCategoryFilter === "men") {
        return cat === "men" || cat.includes("men");
      }
      if (selectedCategoryFilter === "women") {
        return cat === "women" || cat.includes("women");
      }
      if (selectedCategoryFilter === "kids") {
        return cat === "kids" || cat.includes("kids") || cat.includes("kid");
      }
      if (selectedCategoryFilter === "accessories") {
        return cat === "accessories" || cat.includes("accessories") || cat.includes("watch") || cat.includes("bag") || cat.includes("eyewear") || cat.includes("jewel");
      }
      if (selectedCategoryFilter === "footwear") {
        return cat === "footwear" || cat.includes("footwear");
      }
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto space-y-12">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-slate-350 transition-all cursor-pointer"
          >
            <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
            <span>Back</span>
          </button>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 animate-pulse">
            <Sparkles size={11} />
            <span>AI fitting room online</span>
          </span>
        </div>

        {/* ABOVE THE FOLD HERO */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/40 p-8 md:p-12 border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="absolute top-[-30%] right-[-10%] w-96 h-96 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-30%] left-[-10%] w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          
          <div className="space-y-6 max-w-xl text-left relative z-10">
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white/80 text-[10px] font-bold uppercase tracking-widest">
              Advanced Generative AI
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              AI Virtual Try-On Studio <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-indigo-300">Try Before You Buy</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold">
              Upload your standing photo and instantly visualize matching outfits using our high-precision AI garment mapping technology.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button 
                onClick={() => {
                  if (selectedProduct) {
                    handleOpenFittingRoom(selectedProduct);
                  } else if (products.length > 0) {
                    handleOpenFittingRoom(products[0]);
                  } else {
                    toast.info("Loading garments... Please select an item from the catalog below.");
                  }
                }}
                className="px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition cursor-pointer active:scale-95"
              >
                Upload Your Photo
              </button>
              <button 
                onClick={() => {
                  if (selectedProduct) {
                    handleOpenFittingRoom(selectedProduct);
                  } else if (products.length > 0) {
                    handleOpenFittingRoom(products[0]);
                  } else {
                    toast.info("Loading garments... Please select an item from the catalog below.");
                  }
                }}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition cursor-pointer active:scale-95"
              >
                Start Virtual Try-On
              </button>
              <button 
                onClick={() => document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" })}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition cursor-pointer active:scale-95"
              >
                Browse Fashion
              </button>
            </div>
          </div>

          {/* Floating Previews Graphic */}
          <div className="relative w-full max-w-[340px] aspect-[4/5] bg-white/[0.03] border border-white/[0.08] rounded-3xl p-4 flex flex-col justify-between overflow-hidden shadow-2xl relative">
            <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow-sm">
              Live Demo
            </div>
            <div className="flex-1 flex items-center justify-center">
              {products[0] ? (
                <img 
                  src={products[0].images?.[0]?.startsWith("http") ? products[0].images[0] : `${backendUrl}/${products[0].images?.[0]}`}
                  className="max-h-56 object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] animate-bounce duration-[4000ms]"
                  alt="" 
                />
              ) : (
                <Sparkles className="text-white/20 h-16 w-16" />
              )}
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-3 rounded-2xl text-[10px] text-white flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center shrink-0">
                <Zap size={14} />
              </div>
              <div className="text-left leading-normal font-semibold">
                <p className="font-extrabold text-white">Instant Outfit Generation</p>
                <p className="text-slate-350 mt-0.5">High-fidelity texture alignment</p>
              </div>
            </div>
          </div>
        </div>

        {/* ONBOARDING FLOW */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {[
              { step: "01", title: "Upload Photo", desc: "Upload a full-body standing photo with clear lighting.", icon: Upload },
              { step: "02", title: "Choose Outfit", desc: "Select any apparel from our dynamic clothing catalog.", icon: Image },
              { step: "03", title: "Generate AI Try-On", desc: "Instantly see the garment fitted on you in high definition.", icon: Sparkles }
            ].map((st, sIdx) => {
              const Icon = st.icon;
              return (
                <div key={sIdx} className="flex gap-4 items-start text-left relative group">
                  <div className="h-10 w-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 border border-orange-500/20 group-hover:scale-105 transition-transform duration-300">
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Step {st.step}</span>
                      <CheckCircle2 size={12} className="text-emerald-500 opacity-60" />
                    </div>
                    <h3 className="font-black text-sm text-slate-800 dark:text-white mt-1 leading-tight">{st.title}</h3>
                    <p className="text-[10.5px] text-slate-400 dark:text-slate-500 mt-1 font-semibold leading-relaxed">{st.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CATALOG SECTION */}
        <div id="catalog-section" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="text-left">
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Fashion Catalog</h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Explore premium styles and click "Try On" to test outfits</p>
            </div>
            
            {/* Catalog tab selector */}
            <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 rounded-xl self-end">
              {[
                { id: "trending", label: "Trending Styles" },
                { id: "new", label: "New Arrivals" },
                { id: "recommended", label: "Recommended" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCatalogTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all duration-200 cursor-pointer ${
                    activeCatalogTab === tab.id
                      ? "bg-white dark:bg-slate-950 text-slate-950 dark:text-slate-100 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 items-center">
            {[
              { id: "all", label: "All Fashion" },
              { id: "men", label: "Men" },
              { id: "women", label: "Women" },
              { id: "kids", label: "Kids" },
              { id: "accessories", label: "Accessories" },
              { id: "footwear", label: "Footwear" }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.id)}
                className={`px-4 py-1.5 rounded-xl text-[9.5px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer border ${
                  selectedCategoryFilter === cat.id
                    ? "bg-slate-950 dark:bg-orange-500 border-slate-950 dark:border-orange-500 text-white shadow-sm"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-350"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 rounded-full border-4 border-slate-250 border-t-orange-500 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {filteredProducts.map((item) => (
                <div 
                  key={item._id}
                  className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900/40 p-3.5 flex flex-col justify-between group shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                >
                  {/* Image frame */}
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900 relative">
                    <img 
                      src={item.images?.[0]?.startsWith("http") ? item.images[0] : `${backendUrl}/${item.images?.[0]}`} 
                      alt={item.name}
                      className="w-full h-full object-contain p-4 transition duration-300 group-hover:scale-103"
                    />
                    <button className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-white/80 dark:bg-slate-950/80 backdrop-blur-xs border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500 active:scale-90 transition cursor-pointer shadow-xs">
                      <Heart size={13} />
                    </button>
                  </div>
                  {/* Item details */}
                  <div className="mt-3.5 space-y-2.5 pb-1 px-0.5 text-left">
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide">{item.category} · {item.collection}</p>
                      <p className="text-xs font-black text-slate-900 dark:text-slate-100 truncate mt-0.5 capitalize">{item.name}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                      <span className="text-xs font-black text-slate-950 dark:text-slate-100">₹{item.price}</span>
                      <button
                        onClick={() => handleOpenFittingRoom(item)}
                        className="px-3.5 py-2 rounded-xl bg-slate-950 dark:bg-indigo-650 hover:bg-slate-900 text-[10px] font-black text-white uppercase tracking-wider transition active:scale-95 cursor-pointer shadow-xs flex items-center gap-1"
                      >
                        <Sparkles size={10} className="animate-pulse" />
                        <span>Try On</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI FEATURES SHOWCASE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "AI Body Fit Analysis", desc: "Calculates precise shoulder, waist, and height proportions from your target model.", icon: Sliders, color: "text-blue-500" },
            { title: "Color Matching & Styling", desc: "Recommends corresponding items and matching accessories for complete looks.", icon: Star, color: "text-amber-500" },
            { title: "Real-Time Generation", desc: "GPU-accelerated pipelines generate fit alignments within seconds.", icon: Zap, color: "text-indigo-500" }
          ].map((feat, fIdx) => {
            const Icon = feat.icon;
            return (
              <div key={fIdx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl flex gap-4 text-left shadow-xs">
                <div className={`h-9 w-9 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-850 ${feat.color}`}>
                  <Icon size={16} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">{feat.title}</h4>
                  <p className="text-[10.5px] font-semibold text-slate-400 dark:text-slate-500 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* PREVIOUS TRY-ONS */}
        <div className="border-t border-slate-200/70 dark:border-slate-800/80 pt-10 text-left space-y-6">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Your Previous Try-On Looks</h2>
          <TryOnHistory token={token} onSelectLook={(look) => {
            const found = products.find(p => p._id === look.productId?._id);
            if (found) {
              handleOpenFittingRoom(found);
            } else {
              toast.error("Garment item no longer available in the catalog.");
            }
          }} />
        </div>

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
