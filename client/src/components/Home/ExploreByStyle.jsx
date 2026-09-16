import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

// Transparent Cutout Figures
import cutoutWomens from "../../assets/new_home/cutout_womens.png";
import cutoutMens from "../../assets/new_home/cutout_mens.png";
import cutoutElectronics from "../../assets/new_home/cutout_electronics.png";
import cutoutHome from "../../assets/new_home/cutout_home.png";

const CARDS_DATA = [
  {
    id: "womens-fashion",
    titleLine1: "Women's",
    titleLine2: "Fashion",
    scriptTag1: "Trendy",
    scriptTag2: "Looks",
    scriptAlign: "left",
    scriptColor: "text-[#881337] dark:text-rose-400",
    arrowColor: "#E11D48",
    arrowDirection: "down-right",
    blobBg: "bg-[#FFE4E6] dark:bg-rose-950/40",
    blobBorder: "border-rose-200/60 dark:border-rose-900/40",
    pillBorder: "border-rose-200 dark:border-rose-900/60",
    pillShadow: "shadow-[0_8px_20px_rgba(244,63,94,0.10)]",
    arrowBtnBg: "bg-[#FECDD3] hover:bg-[#FDA4AF] text-[#881337] dark:bg-rose-900/60 dark:text-rose-200",
    image: cutoutWomens,
    imageAlt: "Women's Fashion Model",
    imageScale: "scale-[1.08] translate-y-1",
    link: "/product?category=women"
  },
  {
    id: "mens-apparel",
    titleLine1: "Men's",
    titleLine2: "Apparel",
    scriptTag1: "Style",
    scriptTag2: "Everyday",
    scriptAlign: "left",
    scriptColor: "text-[#1E3A8A] dark:text-blue-400",
    arrowColor: "#2563EB",
    arrowDirection: "down-left",
    blobBg: "bg-[#DBEAFE] dark:bg-blue-950/40",
    blobBorder: "border-blue-200/60 dark:border-blue-900/40",
    pillBorder: "border-blue-200 dark:border-blue-900/60",
    pillShadow: "shadow-[0_8px_20px_rgba(59,130,246,0.10)]",
    arrowBtnBg: "bg-[#BAE6FD] hover:bg-[#93C5FD] text-[#1E3A8A] dark:bg-blue-900/60 dark:text-blue-200",
    image: cutoutMens,
    imageAlt: "Men's Apparel Model",
    imageScale: "scale-[1.05] translate-y-1",
    link: "/product?category=men"
  },
  {
    id: "electronics",
    titleLine1: "Electronics",
    titleLine2: "",
    scriptTag1: "Upgrade",
    scriptTag2: "Your World",
    scriptAlign: "left",
    scriptColor: "text-[#065F46] dark:text-emerald-400",
    arrowColor: "#059669",
    arrowDirection: "down-left",
    blobBg: "bg-[#D1FAE5] dark:bg-emerald-950/40",
    blobBorder: "border-emerald-200/60 dark:border-emerald-900/40",
    pillBorder: "border-emerald-200 dark:border-emerald-900/60",
    pillShadow: "shadow-[0_8px_20px_rgba(16,185,129,0.10)]",
    arrowBtnBg: "bg-[#A7F3D0] hover:bg-[#6EE7B7] text-[#065F46] dark:bg-emerald-900/60 dark:text-emerald-200",
    image: cutoutElectronics,
    imageAlt: "Electronics & Smart Gadgets",
    imageScale: "scale-[1.02] translate-y-2",
    link: "/product?category=electronics"
  },
  {
    id: "home-living",
    titleLine1: "Home &",
    titleLine2: "Living",
    scriptTag1: "A Better",
    scriptTag2: "Home",
    scriptAlign: "right",
    scriptColor: "text-[#92400E] dark:text-amber-400",
    arrowColor: "#D97706",
    arrowDirection: "down-right",
    blobBg: "bg-[#FEF3C7] dark:bg-amber-950/40",
    blobBorder: "border-amber-200/60 dark:border-amber-900/40",
    pillBorder: "border-amber-200 dark:border-amber-900/60",
    pillShadow: "shadow-[0_8px_20px_rgba(245,158,11,0.10)]",
    arrowBtnBg: "bg-[#FDE68A] hover:bg-[#FCD34D] text-[#92400E] dark:bg-amber-900/60 dark:text-amber-200",
    image: cutoutHome,
    imageAlt: "Home & Living Furniture",
    imageScale: "scale-[1.05] translate-y-1",
    link: "/product?category=home"
  }
];

const ExploreByStyle = () => {
  const navigate = useNavigate();
  const [activeDot, setActiveDot] = useState(0);

  return (
    <section 
      aria-label="Explore By Style"
      className="w-full px-2 sm:px-4 lg:px-6 pt-2 pb-3 select-none"
    >
      <div className="relative w-full rounded-2xl border border-[#E4DFFA] dark:border-slate-800 bg-gradient-to-r from-[#F3F0FE] via-[#F8F6FF] to-[#FFFFFF] dark:from-slate-900 dark:via-slate-900 dark:to-slate-850 px-5 sm:px-8 lg:px-10 py-6 sm:py-7 lg:py-8 shadow-[0_4px_24px_rgba(139,92,246,0.06)] transition-all duration-300">
        
        {/* Main 2-Column Grid: Left Text + Right 4 Dynamic Organic Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Left Column: Heading, Subtitle & Explore Button (4 Columns) */}
          <div className="lg:col-span-4 flex flex-col justify-center text-left space-y-3 sm:space-y-3.5 pr-2">
            
            {/* Tagline Indicator Bar */}
            <div className="flex items-center gap-2">
              <span className="w-5 h-[3.5px] bg-[#6366F1] rounded-full inline-block" />
              <span className="text-[11.5px] font-black uppercase tracking-widest text-[#334155] dark:text-slate-300">
                EXPLORE BY STYLE
              </span>
            </div>

            {/* Main Title: "Something for" (Black) + "Every" (Purple Gradient) + " You" (Black) */}
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-[#0F172A] dark:text-white leading-[1.12]">
              <div>Something for</div>
              <div className="flex items-baseline gap-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#D946EF]">
                  Every
                </span>
                <span className="text-[#0F172A] dark:text-white">
                  You
                </span>
              </div>
            </h2>

            {/* Subtitle Description */}
            <p className="text-[13.5px] sm:text-[14.5px] font-medium text-[#64748B] dark:text-slate-400 leading-relaxed max-w-xs">
              From latest trends to everyday essentials, find what fits your lifestyle.
            </p>

            {/* CTA Button with Hand-drawn Doodle Underneath */}
            <div className="pt-2 relative w-fit">
              <button
                type="button"
                onClick={() => navigate("/product")}
                className="px-6 py-3 bg-[#0F172A] dark:bg-white text-white dark:text-slate-900 hover:bg-[#1E293B] dark:hover:bg-slate-100 font-black text-xs uppercase tracking-wider rounded-full flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>Explore All Categories</span>
                <ArrowRight size={14} className="stroke-[3]" />
              </button>

              {/* Exact Purple Doodle Underline Sketch */}
              <div className="absolute -bottom-4 left-3 w-32 h-5 pointer-events-none opacity-80">
                <svg viewBox="0 0 140 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path
                    d="M4 14C32 4 82 22 136 7M16 19C45 9 95 19 126 13"
                    stroke="#8B5CF6"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

          </div>

          {/* Right Column: 4 Real Interactive Organic Fluid Cards (8 Columns) */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 items-end">
            {CARDS_DATA.map((card) => (
              <motion.div
                key={card.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onClick={() => navigate(card.link)}
                className="group relative flex flex-col items-center justify-end cursor-pointer select-none"
              >
                
                {/* 1. Top Handwritten Annotation with Hand-drawn Curved Arrow */}
                <div className="w-full h-9 flex items-center justify-start gap-1 px-1 mb-0.5 relative z-20">
                  {card.arrowDirection === "down-right" ? (
                    <>
                      <div className="flex flex-col leading-none">
                        <span className={`font-handwriting text-[15px] sm:text-[17px] font-bold ${card.scriptColor} leading-none`}>
                          {card.scriptTag1}
                        </span>
                        <span className={`font-handwriting text-[15px] sm:text-[17px] font-bold ${card.scriptColor} leading-none`}>
                          {card.scriptTag2}
                        </span>
                      </div>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="shrink-0 -mt-1">
                        <path
                          d="M3 5C7 10 13 14 18 19M18 19L12 19M18 19L18 13"
                          stroke={card.arrowColor}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col leading-none">
                        <span className={`font-handwriting text-[15px] sm:text-[17px] font-bold ${card.scriptColor} leading-none`}>
                          {card.scriptTag1}
                        </span>
                        <span className={`font-handwriting text-[15px] sm:text-[17px] font-bold ${card.scriptColor} leading-none`}>
                          {card.scriptTag2}
                        </span>
                      </div>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="shrink-0 -mt-1">
                        <path
                          d="M21 5C17 10 11 14 6 19M6 19L12 19M6 19L6 13"
                          stroke={card.arrowColor}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </>
                  )}
                </div>

                {/* 2. Main Card Body Container */}
                <div className="relative w-full h-[190px] sm:h-[215px] lg:h-[235px] flex flex-col justify-end items-center">
                  
                  {/* Organic Fluid SVG Blob Background */}
                  <div className="absolute top-2 inset-x-1 bottom-8 flex items-center justify-center pointer-events-none">
                    <svg
                      viewBox="0 0 200 200"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-full transform transition-transform duration-500 group-hover:scale-105"
                    >
                      <path
                        d="M39.9,-65.7C51.2,-58,59.5,-47.4,66.4,-35.8C73.3,-24.1,78.8,-11.4,78.5,1.2C78.1,13.8,71.8,26.2,63.9,36.8C55.9,47.4,46.3,56.1,35.2,63.1C24.1,70.1,11.5,75.4,-1.8,78.4C-15.1,81.4,-29.7,82.2,-41.7,75.9C-53.7,69.6,-63.1,56.2,-70.5,42.4C-77.9,28.6,-83.3,14.3,-82.9,0.3C-82.5,-13.7,-76.3,-27.4,-67.6,-38.7C-58.9,-50,-47.7,-58.8,-35.5,-66.1C-23.3,-73.4,-10,-79.2,2.3,-83.1C14.6,-87,28.6,-73.4,39.9,-65.7Z"
                        className={`${card.blobBg} transition-colors duration-300`}
                        transform="translate(100 100)"
                      />
                    </svg>
                  </div>

                  {/* Transparent Subject Cutout Figure */}
                  <div className="relative z-10 w-full h-[150px] sm:h-[175px] lg:h-[190px] flex items-end justify-center overflow-visible pointer-events-none mb-4">
                    <img
                      src={card.image}
                      alt={card.imageAlt}
                      className={`w-full h-full object-contain object-bottom ${card.imageScale} transition-transform duration-500 group-hover:scale-110 drop-shadow-md`}
                    />
                  </div>

                  {/* 3. Bottom Pill Card Container */}
                  <div className="relative z-20 w-full -mt-7">
                    <div className={`w-full bg-white dark:bg-slate-850 border ${card.pillBorder} ${card.pillShadow} rounded-2xl py-2 px-3 sm:px-3.5 flex items-center justify-between transition-all duration-300 group-hover:shadow-lg`}>
                      
                      {/* Category Title */}
                      <div className="flex flex-col text-left leading-tight">
                        <span className="text-[12.5px] sm:text-[13.5px] font-black text-[#0F172A] dark:text-white">
                          {card.titleLine1}
                        </span>
                        {card.titleLine2 && (
                          <span className="text-[12.5px] sm:text-[13.5px] font-black text-[#0F172A] dark:text-white">
                            {card.titleLine2}
                          </span>
                        )}
                      </div>

                      {/* Circular Action Arrow Button */}
                      <div className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full ${card.arrowBtnBg} flex items-center justify-center shrink-0 ml-1 transition-transform duration-300 group-hover:scale-110 group-hover:translate-x-0.5 shadow-2xs`}>
                        <ArrowRight size={13} className="stroke-[3]" />
                      </div>

                    </div>
                  </div>

                </div>

              </motion.div>
            ))}
          </div>

        </div>

        {/* Section Bottom Strip: Centered Dots + Right Trust Tagline */}
        <div className="mt-6 pt-3.5 border-t border-slate-200/50 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          
          {/* Centered Pagination Pill Dots */}
          <div className="flex items-center gap-1.5 sm:ml-auto sm:mr-auto">
            {CARDS_DATA.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveDot(i)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  activeDot === i
                    ? "w-6 h-1.5 bg-[#0F172A] dark:bg-white"
                    : "w-1.5 h-1.5 bg-[#CBD5E1] dark:bg-slate-700 hover:bg-[#94A3B8]"
                }`}
                aria-label={`Slide dot ${i + 1}`}
              />
            ))}
          </div>

          {/* Right Trust Tagline */}
          <div className="text-[11.5px] font-semibold text-[#64748B] dark:text-slate-400 tracking-wide">
            <span>Quality Products</span>
            <span className="mx-2.5 text-slate-300 dark:text-slate-700">|</span>
            <span>Great Prices</span>
            <span className="mx-2.5 text-slate-300 dark:text-slate-700">|</span>
            <span>Happy Customers</span>
          </div>

        </div>

      </div>
    </section>
  );
};

export default ExploreByStyle;
