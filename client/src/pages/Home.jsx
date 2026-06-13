import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../config";
import ProductCard from "./ProductCard";

import {
  getViewed, getTopCategories, getRecommended, isReturningUser,
} from "../utils/engagement";
import { getAverageRating } from "../utils/productRatings";
import { ArrowRight, Sparkles, TrendingUp, Compass, ShoppingBag, RotateCcw, ShieldCheck } from "lucide-react";

// ─── Premium dynamic hero configs per top-category ────────────────────────────────────
const HERO_CONFIG = {
  Men: {
    bg: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=1400",
    greeting: "Welcome Back, Style Connoisseur",
    tag: "CURATED JUST FOR YOU",
    headline: "Architectural Lines. Tailored Fit.",
    sub: "Explore premium men's knitwear, technical overshirts, and luxury casuals curated based on your preferences.",
    cta: "Explore Men's Wear",
    ctaPath: "/product/men",
  },
  Women: {
    bg: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400",
    greeting: "Welcome Back, Trendsetter",
    tag: "HANDPICKED FOR YOU",
    headline: "The Modern Female Narrative.",
    sub: "Elevate your daily wear with contemporary cuts, elegant silhouettes, and luxurious materials.",
    cta: "Explore Women's Wear",
    ctaPath: "/product/women",
  },
  Kids: {
    bg: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=1400",
    greeting: "Welcome Back, Parent",
    tag: "LITTLE SELECTIONS",
    headline: "Pure Comfort. Playful Designs.",
    sub: "Premium materials engineered for active kids. High durability, absolute safety, and vibrant energy.",
    cta: "Explore Kids' Wear",
    ctaPath: "/product/kid",
  },
  default: {
    bg: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1400",
    greeting: "Discover CartNOW",
    tag: "NEW HORIZONS",
    headline: "Elevating Everyday Essentials.",
    sub: "A curated collection of modern apparel, lifestyle accessories, and interactive fashion designed around you.",
    cta: "Browse The Collection",
    ctaPath: "/product",
  },
};

const CAT_CARDS = [
  { name: "Men", path: "/product/men", image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600", color: "from-slate-900/90 to-slate-900/60" },
  { name: "Women", path: "/product/women", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600", color: "from-purple-950/90 to-purple-950/60" },
  { name: "Kids", path: "/product/kid", image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600", color: "from-emerald-950/90 to-emerald-950/60" },
];

// ─── Premium Section Header Component ───
const SectionHead = ({ eyebrow, title, sub, action, onAction }) => (
  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 text-left">
    <div className="space-y-1">
      <span className="text-[10px] font-black tracking-widest text-indigo-650 dark:text-indigo-400 uppercase block">
        {eyebrow}
      </span>
      <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">
        {title}
      </h2>
      {sub && (
        <p className="text-xs md:text-sm text-slate-400 dark:text-slate-500 font-medium">
          {sub}
        </p>
      )}
    </div>
    {action && (
      <button
        onClick={onAction}
        className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-205 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 active:scale-95 transition-all duration-200 rounded-xl cursor-pointer shadow-sm"
      >
        <span>{action}</span>
        <ArrowRight size={13} />
      </button>
    )}
  </div>
);

// ─── Mini Trending Row Component ───
const TrendCard = ({ product, rank, navigate }) => {
  const src = product.images?.[0] || product.image || "";
  const imgSrc = src.startsWith("http") ? src : `${backendUrl}/${src}`;
  const rating = getAverageRating(product);
  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      className="flex items-center gap-4 p-3 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-150/80 dark:border-slate-800 hover:border-indigo-500/20 dark:hover:border-indigo-500/20 hover:shadow-md hover:translate-x-1 transition-all duration-300 cursor-pointer text-left"
    >
      <span className={`text-xl font-black min-w-[28px] text-center ${rank <= 3 ? "text-indigo-650 dark:text-indigo-400" : "text-slate-300 dark:text-slate-700"
        }`}>
        #{rank}
      </span>
      <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-950 overflow-hidden flex-shrink-0 border border-slate-100 dark:border-slate-800/80 p-1 flex items-center justify-center">
        <img src={imgSrc} alt={product.name} className="max-w-full max-h-full object-contain" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm text-slate-905 dark:text-slate-100 truncate">
          {product.name}
        </h4>
        <div className="flex items-center gap-3 mt-1 text-xs">
          <span className="font-extrabold text-slate-900 dark:text-slate-100">
            ₹{Number(product.price).toLocaleString("en-IN")}
          </span>
          {rating > 0 && (
            <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-405 font-semibold">
              ★ {rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Engagement metadata
  const returning = isReturningUser();
  const recentlyViewed = getViewed().slice(0, 10);
  const topCats = getTopCategories(1);
  // Setup dynamic slides carousel (preferred category/gender starts first)
  const slides = useMemo(() => {
    const fav = (topCats[0] && HERO_CONFIG[topCats[0]]) ? topCats[0] : "default";
    const keys = ["Men", "Women", "Kids", "default"];
    const sortedKeys = [fav, ...keys.filter(k => k !== fav)];
    return sortedKeys.map(k => ({ ...HERO_CONFIG[k], key: k }));
  }, [topCats]);

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000); // 10 seconds rotation
    return () => clearInterval(interval);
  }, [slides]);

  const hero = slides[currentSlide];

  useEffect(() => {
    axios.get(`${backendUrl}/api/product/list`)
      .then(res => { if (res.data.success) setAllProducts(res.data.products); })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const recommended = useMemo(() => getRecommended(allProducts, 8), [allProducts]);

  const trending = useMemo(() =>
    [...allProducts]
      .filter(p => p.stock > 0)
      .sort((a, b) => getAverageRating(b) - getAverageRating(a))
      .slice(0, 5),
    [allProducts]
  );

  const newArrivals = useMemo(() => [...allProducts].slice(-4).reverse(), [allProducts]);

  return (
    <div className="bg-[#f8fafc] dark:bg-slate-950 min-h-screen text-slate-750 dark:text-slate-300 font-sans pb-16 transition-colors duration-300">

      <section className="relative h-[calc(100vh-76px)] min-h-[600px] w-full overflow-hidden flex items-center">
        {/* Background Images Cross-Fade */}
        {slides.map((slide, idx) => (
          <div
            key={slide.key}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-opacity duration-1000 ease-in-out"
            style={{
              backgroundImage: `url(${slide.bg})`,
              opacity: idx === currentSlide ? 1 : 0,
              zIndex: idx === currentSlide ? 1 : 0
            }}
          />
        ))}
        {/* Soft Radial Gradient Lighting */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/50 to-transparent dark:from-slate-950/95 dark:via-slate-950/60 z-10" />

        <div className="relative z-20 mx-auto max-w-7xl px-6 w-full text-left">
          <div className="max-w-xl md:max-w-2xl space-y-6">

            {/* Tag / Badge */}
            <div className="inline-flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 text-[9px] font-black tracking-widest text-indigo-300 bg-indigo-500/10 border border-indigo-400/20 backdrop-blur-md rounded-full">
                <Sparkles size={11} className="animate-pulse" />
                {hero.tag}
              </span>
              {returning && (
                <span className="inline-flex items-center gap-1 px-3 py-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-400/20 backdrop-blur-md rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  RETURNING MEMBER
                </span>
              )}
            </div>

            {/* Greeting */}
            {returning && (
              <p className="text-slate-300/80 text-sm md:text-base font-semibold tracking-wide uppercase">
                {hero.greeting}
              </p>
            )}

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-sm select-none">
              {hero.headline}
            </h1>

            {/* Sub description */}
            <p className="text-sm md:text-base text-slate-300 leading-relaxed font-light">
              {hero.sub}
            </p>

            {/* Action CTAs */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => navigate(hero.ctaPath)}
                className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-900 text-xs md:text-sm font-bold tracking-wider uppercase hover:shadow-lg hover:shadow-white/10 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                <span>{hero.cta}</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate("/product")}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs md:text-sm font-bold tracking-wider uppercase backdrop-blur-md transition-all duration-200 cursor-pointer"
              >
                Browse All
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Co-Shop Invite Banner */}


      {/* ══ RECENTLY VIEWED (Returning user strip) ══ */}
      {returning && recentlyViewed.length > 0 && (
        <section className="pt-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHead
              eyebrow="CONTINUE BROWSING"
              title="Recently Viewed Items"
              sub="Pick up where you left off"
              action="View Catalog"
              onAction={() => navigate("/product")}
            />
            {/* Scroll strip */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              {recentlyViewed.map((p) => {
                const src = p.image?.startsWith("http") ? p.image : `${backendUrl}/${p.image}`;
                return (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/product/${p.id}`)}
                    className="flex-shrink-0 w-36 bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-2.5 hover:shadow-md dark:hover:shadow-slate-950/80 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer text-left group"
                  >
                    <div className="h-28 rounded-xl bg-slate-50 dark:bg-slate-950 overflow-hidden flex items-center justify-center p-2 mb-2">
                      <img src={src} alt={p.name} className="max-w-full max-h-full object-contain group-hover:scale-102 transition-transform duration-300" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 min-h-[32px] leading-tight">
                      {p.name}
                    </p>
                    <p className="text-xs font-extrabold text-indigo-650 dark:text-indigo-400 mt-1">
                      ₹{Number(p.price).toLocaleString("en-IN")}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ══ RECOMMENDATIONS GRID ══ */}
      {recommended.length > 0 && (
        <section className="pt-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHead
              eyebrow={returning ? "INSPIRED BY YOUR TASTES" : "OUR LATEST SELECTIONS"}
              title={returning ? "Recommended For You" : "Featured Store Picks"}
              sub={returning && topCats.length > 0 ? `Curated selections in ${topCats.join(", ")}` : undefined}
              action="See All Products"
              onAction={() => navigate("/product")}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {recommended.map(p => <ProductCard key={p._id} product={p} compact />)}
            </div>
          </div>
        </section>
      )}

      {/* ══ CATEGORY SELECTION CARDS ══ */}
      <section className="pt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHead eyebrow="CURATED COLLECTIONS" title="Browse By Category" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CAT_CARDS.map(cat => (
              <div
                key={cat.name}
                onClick={() => navigate(cat.path)}
                className="group relative h-64 md:h-72 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} z-10 transition-opacity duration-300`} />

                <div className="absolute bottom-5 left-5 z-20 text-left">
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 block mb-1">
                    COLLECTION
                  </span>
                  <h3 className="text-2xl font-black text-white tracking-tight leading-none">
                    {cat.name}
                  </h3>
                </div>

                {topCats[0] === cat.name && (
                  <div className="absolute top-4 right-4 z-20 px-2.5 py-1 text-[9px] font-bold text-white bg-indigo-600/90 dark:bg-indigo-755/90 border border-white/10 backdrop-blur-md rounded-full shadow-sm">
                    Favorite Category ♥
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ AI STYLIST SPOTLIGHT (WIDESCREEN PROMO) ══ */}
      <section className="pt-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 p-8 md:p-12 shadow-2xl flex flex-col lg:flex-row items-center gap-10">
            {/* Background glowing effects */}
            <div className="absolute right-1/4 top-1/4 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
            <div className="absolute left-1/3 bottom-10 w-96 h-96 rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />

            {/* Left Content */}
            <div className="relative z-10 flex-1 space-y-6 text-left">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 text-[9px] font-black tracking-widest text-indigo-300 bg-indigo-500/10 border border-indigo-400/20 rounded-full">
                <Sparkles size={11} className="text-orange-400" />
                AI STYLIST SPOTLIGHT
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                New Architectural Silhouettes
              </h2>
              <p className="text-sm md:text-base text-slate-300 leading-relaxed font-light">
                Explore our fresh arrivals weekly, handpicked by CartNOW's generative fashion engine to coordinate modern geometry, elevated fabrics, and everyday comfort.
              </p>
              <div>
                <button
                  onClick={() => navigate("/product")}
                  className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-900 text-xs md:text-sm font-bold tracking-wider uppercase shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 cursor-pointer"
                >
                  <span>Shop The Collection</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right Curated Products Cards (Horizontal Grid) */}
            <div className="relative z-10 w-full lg:w-auto shrink-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {newArrivals.slice(0, 2).map((p) => {
                const src = p.images?.[0] || p.image || "";
                const imgSrc = src.startsWith("http") ? src : `${backendUrl}/${src}`;
                return (
                  <div key={p._id} className="w-full sm:w-60 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-left shadow-lg">
                    <div className="h-32 rounded-xl bg-white/95 overflow-hidden flex items-center justify-center p-2 mb-3">
                      <img
                        src={imgSrc}
                        alt={p.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <h4 className="font-bold text-xs text-white line-clamp-1">
                      {p.name}
                    </h4>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-extrabold text-sm text-indigo-300">
                        ₹{Number(p.price).toLocaleString("en-IN")}
                      </span>
                      <button
                        onClick={() => navigate(`/product/${p._id}`)}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider transition-all cursor-pointer"
                      >
                        View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══ TRENDING + NEW SPLIT GRID ══ */}
      <section className="pt-12 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* Column 1: Trending Now */}
            <div className="space-y-4">
              <SectionHead eyebrow="MOST WANTED" title="Trending Items" sub="Highest rated and most popular picks" />
              <div className="flex flex-col gap-3">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-20 w-full bg-slate-100 dark:bg-slate-900/40 rounded-2xl animate-pulse border border-slate-205/50 dark:border-slate-800" />
                  ))
                ) : (
                  trending.map((p, i) => <TrendCard key={p._id} product={p} rank={i + 1} navigate={navigate} />)
                )}
              </div>
            </div>

            {/* Column 2: New Arrivals */}
            <div className="space-y-4">
              <SectionHead eyebrow="JUST RELEASED" title="New Arrivals" action="See All" onAction={() => navigate("/product")} />
              <div className="grid grid-cols-2 gap-4">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-56 w-full bg-slate-100 dark:bg-slate-900/40 rounded-2xl animate-pulse border border-slate-205/50 dark:border-slate-800" />
                  ))
                ) : (
                  newArrivals.map(p => <ProductCard key={p._id} product={p} compact />)
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══ TRUST PILLARS STRIP ══ */}
      <section className="pt-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <ShoppingBag size={22} className="text-indigo-650 dark:text-indigo-405" />, title: "Polished Checkout Flow", desc: "Cart items, instant guest storage, and simple order placement options." },
              { icon: <Compass size={22} className="text-indigo-650 dark:text-indigo-405" />, title: "Generative AI Try-On", desc: "Preview garment fits instantly on preset model rosters or personal photo uploads." },
              { icon: <RotateCcw size={22} className="text-indigo-650 dark:text-indigo-405" />, title: "Reverse Logistics Desks", desc: "Return packages easily with active progress bar steppers and notes loggers." },
            ].map((f, i) => (
              <div key={i} className="flex gap-4 p-5 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm text-left items-start hover:shadow dark:hover:shadow-slate-950 transition-shadow duration-300">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/50">
                  {f.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{f.title}</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
