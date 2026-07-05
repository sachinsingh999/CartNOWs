import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { backendUrl } from "../config";

const AUTO_SLIDE_MS = 5000;

// ── Default high-end banners shown when admin has created none ────────────────────────
const FALLBACK_BANNERS = [
  {
    _id: "fb1",
    title: "Vanguard Fashion Season",
    subtitle: "Explore the new architectural silhouettes — fresh arrivals weekly.",
    badge: "NEW ARRIVALS",
    discountPercent: 0,
    discountLabel: "",
    bgColor: "#4f46e5",
    textColor: "#ffffff",
    buttonText: "Shop The Collection",
    buttonLink: "/product",
    validTo: "2099-12-31",
  },
  {
    _id: "fb3",
    title: "High-Street Women's Edit",
    subtitle: "The seasonal edit defining fashion, shapes, and color structures.",
    badge: "EXCLUSIVE EDIT",
    discountPercent: 30,
    discountLabel: "Up to 30% off",
    bgColor: "#7c3aed",
    textColor: "#ffffff",
    buttonText: "Shop Women",
    buttonLink: "/product/women",
    validTo: "2099-12-31",
  },
];

const SaleBanners = () => {
  const [sales, setSales] = useState([]);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${backendUrl}/api/sale/active`)
      .then(res => {
        if (res.data.success && res.data.sales.length > 0) {
          setSales(res.data.sales);
        } else {
          setSales(FALLBACK_BANNERS);
        }
      })
      .catch(() => setSales(FALLBACK_BANNERS))
      .finally(() => setLoaded(true));
  }, []);

  // Auto-slide
  useEffect(() => {
    if (sales.length <= 1 || paused) return;
    timerRef.current = setTimeout(() => {
      setCurrent(c => (c + 1) % sales.length);
    }, AUTO_SLIDE_MS);
    return () => clearTimeout(timerRef.current);
  }, [current, sales.length, paused]);

  if (!loaded || sales.length === 0) return null;

  const sale = sales[current];

  const goTo = (i) => {
    clearTimeout(timerRef.current);
    setCurrent(i);
  };
  const prev = () => goTo((current - 1 + sales.length) % sales.length);
  const next = () => goTo((current + 1) % sales.length);

  const msLeft = new Date(sale.validTo) - Date.now();
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
  const showCountdown = daysLeft > 0 && daysLeft <= 30;

  return (
    <section className="pt-8 pb-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        
        {/* Main Banner Card */}
        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200/10 min-h-[160px] md:min-h-[180px] transition-all duration-500 ease-in-out"
          style={{
            backgroundColor: sale.bgColor || "#4f46e5",
            color: sale.textColor || "#ffffff",
          }}
        >
          {/* Dynamic Image Overlay */}
          {sale.image && (
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay pointer-events-none transition-all duration-700"
              style={{ backgroundImage: `url(${sale.image})` }}
            />
          )}

          {/* Luxury Backdrop lighting & pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/10 pointer-events-none" />
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />

          {/* Content Layout */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1fr_auto_auto] items-center gap-6 px-8 py-10 md:px-14">
            
            {/* Left Content Column */}
            <div className="space-y-4 text-left">
              {sale.badge && (
                <span className="inline-block px-3 py-1 text-[9px] font-black tracking-widest uppercase rounded-full bg-white/20 border border-white/20 backdrop-blur-md">
                  {sale.badge}
                </span>
              )}
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight select-none">
                {sale.title}
              </h2>
              {sale.subtitle && (
                <p className="max-w-xl text-xs md:text-sm text-white/80 leading-relaxed font-light">
                  {sale.subtitle}
                </p>
              )}
              
              {/* Countdown Tag */}
              {showCountdown && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-black/30 border border-white/10 text-[11px] font-semibold text-orange-400">
                  <span className="animate-ping h-1.5 w-1.5 rounded-full bg-orange-400 inline-block" />
                  ⏳ LIMITED OFFER: Ends in {daysLeft} day{daysLeft !== 1 ? "s" : ""}
                </div>
              )}
            </div>

            {/* Centre Price Offer Circle */}
            {sale.discountPercent > 0 && (
              <div className="flex flex-col items-center justify-center shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-inner select-none transition-transform duration-300 hover:scale-105">
                <span className="text-3xl md:text-4xl font-black tracking-tighter leading-none">
                  {sale.discountPercent}%
                </span>
                <span className="text-[10px] font-bold tracking-widest uppercase opacity-80 mt-1">
                  OFF
                </span>
                {sale.discountLabel && (
                  <span className="text-[9px] font-medium text-white/70 mt-0.5 text-center px-2 truncate max-w-full">
                    {sale.discountLabel}
                  </span>
                )}
              </div>
            )}

            {/* Right Call To Action Column */}
            <div className="shrink-0 flex flex-col items-center gap-2">
              <button
                onClick={() => navigate(sale.buttonLink || "/product")}
                className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs md:text-sm font-bold tracking-wider uppercase shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                <span>{sale.buttonText || "Discover Now"}</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              {sale.category && (
                <span className="text-[10px] font-semibold tracking-wider uppercase opacity-50 mt-1">
                  In {sale.category}
                </span>
              )}
            </div>

          </div>

          {/* Navigation Chevrons */}
          {sales.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 border border-white/20 text-slate-100 dark:text-white backdrop-blur-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                aria-label="Previous banner"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 border border-white/20 text-slate-100 dark:text-white backdrop-blur-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                aria-label="Next banner"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

        </div>

        {/* Slide Indicator Dots */}
        {sales.length > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            {sales.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all duration-300 border-none p-0 cursor-pointer ${ i === current ? "w-6 bg-indigo-600" : "w-2 bg-slate-300 hover:bg-slate-400" }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default SaleBanners;
