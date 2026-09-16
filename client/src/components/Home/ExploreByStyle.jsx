import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";

// Category Card Assets
import cardWomensFashion from "../../assets/new_home/card_womens_fashion.jpg";
import cardMensApparel from "../../assets/new_home/card_mens_apparel.jpg";
import cardElectronics from "../../assets/new_home/card_electronics.jpg";
import cardHomeLiving from "../../assets/new_home/card_home_living.jpg";

const CATEGORY_CARDS = [
  {
    id: "womens-fashion",
    title: "Women's Fashion",
    scriptTag: "Trendy Looks",
    image: cardWomensFashion,
    link: "/product?category=women",
    blobColor: "fill-[#FCE7F3] dark:fill-rose-950/40",
    buttonBg: "bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300",
    arrowColor: "text-rose-600 dark:text-rose-400",
    scriptColor: "text-rose-600 dark:text-rose-400",
    arrowDoodleColor: "#F43F5E",
    borderPill: "border-rose-100 dark:border-rose-900/50"
  },
  {
    id: "mens-apparel",
    title: "Men's Apparel",
    scriptTag: "Style Everyday",
    image: cardMensApparel,
    link: "/product?category=men",
    blobColor: "fill-[#DBEAFE] dark:fill-blue-950/40",
    buttonBg: "bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300",
    arrowColor: "text-blue-600 dark:text-blue-400",
    scriptColor: "text-blue-600 dark:text-blue-400",
    arrowDoodleColor: "#3B82F6",
    borderPill: "border-blue-100 dark:border-blue-900/50"
  },
  {
    id: "electronics",
    title: "Electronics",
    scriptTag: "Upgrade Your World",
    image: cardElectronics,
    link: "/product?category=electronics",
    blobColor: "fill-[#D1FAE5] dark:fill-emerald-950/40",
    buttonBg: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300",
    arrowColor: "text-emerald-600 dark:text-emerald-400",
    scriptColor: "text-emerald-600 dark:text-emerald-400",
    arrowDoodleColor: "#10B981",
    borderPill: "border-emerald-100 dark:border-emerald-900/50"
  },
  {
    id: "home-living",
    title: "Home & Living",
    scriptTag: "A Better Home",
    image: cardHomeLiving,
    link: "/product?category=home",
    blobColor: "fill-[#FEF3C7] dark:fill-amber-950/40",
    buttonBg: "bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300",
    arrowColor: "text-amber-600 dark:text-amber-400",
    scriptColor: "text-amber-600 dark:text-amber-400",
    arrowDoodleColor: "#F59E0B",
    borderPill: "border-amber-100 dark:border-amber-900/50"
  }
];

const ExploreByStyle = () => {
  const navigate = useNavigate();
  const [activeDot, setActiveDot] = useState(0);

  return (
    <section 
      aria-label="Explore By Style"
      className="w-full px-2 sm:px-4 lg:px-6 py-2 select-none"
    >
      <div className="relative w-full rounded-sm border border-slate-200/90 dark:border-slate-800 bg-gradient-to-r from-[#F4F1FE] via-[#F8F6FF] to-[#FFFFFF] dark:from-slate-900 dark:via-slate-900 dark:to-slate-850 p-4 sm:p-6 lg:p-7 shadow-2xs transition-colors duration-300">
        
        {/* Main Grid: Left Banner Text + Right 4 Organic Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Left Column: Heading & CTA (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col justify-center text-left space-y-3 sm:space-y-4 pr-2">
            
            {/* Tagline Strip */}
            <div className="flex items-center gap-2">
              <span className="w-5 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full inline-block" />
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                EXPLORE BY STYLE
              </span>
            </div>

            {/* Main Title */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              <span>Something for </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 dark:from-purple-400 dark:via-indigo-400 dark:to-blue-400">
                Every You
              </span>
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm">
              From latest trends to everyday essentials, find what fits your lifestyle.
            </p>

            {/* CTA Button with Doodle Underneath */}
            <div className="pt-2 relative w-fit">
              <button
                type="button"
                onClick={() => navigate("/product")}
                className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-black text-xs uppercase tracking-wider rounded-full flex items-center gap-2 shadow-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>Explore All Categories</span>
                <ArrowRight size={14} className="stroke-[3]" />
              </button>

              {/* Decorative Hand-drawn Purple Doodle Scribble */}
              <div className="absolute -bottom-4 left-4 w-28 h-4 pointer-events-none opacity-80">
                <svg viewBox="0 0 120 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path
                    d="M3 10C25 4 60 14 115 6M12 14C35 8 75 16 105 11"
                    stroke="#8B5CF6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

          </div>

          {/* Right Column: 4 Organic Fluid Shape Cards (8 Cols) */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
            {CATEGORY_CARDS.map((card, idx) => (
              <motion.div
                key={card.id}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onClick={() => navigate(card.link)}
                className="group relative flex flex-col items-center cursor-pointer select-none"
              >
                {/* Handwritten Tag + Curved Arrow Annotation */}
                <div className="w-full flex items-center justify-start gap-1 mb-1 pl-2">
                  <span className={`font-handwriting text-base sm:text-lg font-bold ${card.scriptColor} transform -rotate-3`}>
                    {card.scriptTag}
                  </span>
                  <svg width="20" height="18" viewBox="0 0 24 24" fill="none" className="transform rotate-12 shrink-0">
                    <path
                      d="M6 4C10 9 14 14 16 19M16 19L11 18M16 19L18 14"
                      stroke={card.arrowDoodleColor}
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* Card Main Body with Organic Blob Background & Model Cutout */}
                <div className="relative w-full aspect-[4/5] flex items-center justify-center overflow-hidden rounded-2xl">
                  
                  {/* Organic Fluid SVG Blob */}
                  <svg
                    viewBox="0 0 200 200"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`absolute inset-0 w-full h-full ${card.blobColor} transition-transform duration-500 group-hover:scale-110`}
                  >
                    <path
                      d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.5,90,-16.3,87.6,-1.4C85.1,13.5,77.7,27.1,68.9,38.9C60.1,50.8,49.9,60.9,37.8,68.7C25.7,76.5,12.8,81.9,-0.6,83C-14.1,84.1,-28.1,80.7,-40.8,73.4C-53.5,66.1,-64.8,54.8,-73.2,41.7C-81.5,28.5,-86.8,14.3,-86.2,0.3C-85.7,-13.6,-79.2,-27.2,-70.6,-38.7C-61.9,-50.2,-51.1,-59.6,-38.8,-67.7C-26.4,-75.8,-13.2,-82.7,1.1,-84.6C15.5,-86.5,30.9,-83.5,44.7,-76.4Z"
                      transform="translate(100 100)"
                    />
                  </svg>

                  {/* Cutout Product / Model Image */}
                  <img
                    src={card.image}
                    alt={card.title}
                    className="relative z-10 w-full h-full object-cover object-center transform transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Bottom Attached Pill Button */}
                  <div className="absolute bottom-2 inset-x-2 z-20">
                    <div className={`w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border ${card.borderPill} rounded-full py-1.5 px-3 flex items-center justify-between shadow-sm group-hover:shadow-md transition-shadow`}>
                      <span className="text-[11px] sm:text-xs font-black text-slate-800 dark:text-white truncate">
                        {card.title}
                      </span>
                      <div className={`w-6 h-6 rounded-full ${card.buttonBg} flex items-center justify-center shrink-0 ml-1 transition-transform group-hover:translate-x-0.5`}>
                        <ArrowRight size={12} className={`${card.arrowColor} stroke-[3]`} />
                      </div>
                    </div>
                  </div>

                </div>

              </motion.div>
            ))}
          </div>

        </div>

        {/* Section Bottom Strip: Carousel Dots & Trust Tagline */}
        <div className="mt-5 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          
          {/* Centered Pagination Dots */}
          <div className="flex items-center gap-1.5 sm:ml-auto sm:mr-auto">
            {CATEGORY_CARDS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveDot(i)}
                className={`transition-all duration-300 rounded-full ${
                  activeDot === i
                    ? "w-5 h-1.5 bg-slate-900 dark:bg-white"
                    : "w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
                }`}
                aria-label={`Slide dot ${i + 1}`}
              />
            ))}
          </div>

          {/* Right Trust Tagline */}
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wide">
            <span>Quality Products</span>
            <span className="mx-2 text-slate-300 dark:text-slate-700">|</span>
            <span>Great Prices</span>
            <span className="mx-2 text-slate-300 dark:text-slate-700">|</span>
            <span>Happy Customers</span>
          </div>

        </div>

      </div>
    </section>
  );
};

export default ExploreByStyle;
