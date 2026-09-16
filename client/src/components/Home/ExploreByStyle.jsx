import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

// Exact Card Assets Cropped from Reference Mockup
import exactCardWomens from "../../assets/new_home/exact_card_womens.png";
import exactCardMens from "../../assets/new_home/exact_card_mens.png";
import exactCardElectronics from "../../assets/new_home/exact_card_electronics.png";
import exactCardHome from "../../assets/new_home/exact_card_home.png";

const CATEGORY_CARDS = [
  {
    id: "womens-fashion",
    title: "Women's Fashion",
    image: exactCardWomens,
    link: "/product?category=women",
    alt: "Trendy Looks - Women's Fashion"
  },
  {
    id: "mens-apparel",
    title: "Men's Apparel",
    image: exactCardMens,
    link: "/product?category=men",
    alt: "Style Everyday - Men's Apparel"
  },
  {
    id: "electronics",
    title: "Electronics",
    image: exactCardElectronics,
    link: "/product?category=electronics",
    alt: "Upgrade Your World - Electronics"
  },
  {
    id: "home-living",
    title: "Home & Living",
    image: exactCardHome,
    link: "/product?category=home",
    alt: "A Better Home - Home & Living"
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
      <div className="relative w-full rounded-2xl border border-[#E4DFFA] dark:border-slate-800 bg-gradient-to-r from-[#F3F0FE] via-[#F8F6FF] to-[#FFFFFF] dark:from-slate-900 dark:via-slate-900 dark:to-slate-850 px-5 sm:px-8 lg:px-10 py-6 sm:py-7 lg:py-8 shadow-[0_4px_24px_rgba(139,92,246,0.05)] transition-all duration-300">
        
        {/* Main 2-Column Grid: Left Text + Right 4 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Left Column: Heading, Subtitle & Explore Button */}
          <div className="lg:col-span-4 flex flex-col justify-center text-left space-y-3 sm:space-y-3.5 pr-2">
            
            {/* Tagline Indicator Bar */}
            <div className="flex items-center gap-2">
              <span className="w-5 h-[3.5px] bg-[#6366F1] rounded-full inline-block" />
              <span className="text-[11px] font-black uppercase tracking-widest text-[#334155] dark:text-slate-300">
                EXPLORE BY STYLE
              </span>
            </div>

            {/* Main Title: "Something for" (Black) + "Every" (Purple Gradient) + " You" (Black) */}
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-black tracking-tight text-[#0F172A] dark:text-white leading-[1.12]">
              <div>Something for</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#D946EF]">
                  Every
                </span>
                <span className="text-[#0F172A] dark:text-white">
                  You
                </span>
              </div>
            </h2>

            {/* Subtitle Description */}
            <p className="text-[13.5px] sm:text-[14px] font-medium text-[#64748B] dark:text-slate-400 leading-relaxed max-w-xs">
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

          {/* Right Column: 4 Exact Category Cards */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-4.5 items-end">
            {CATEGORY_CARDS.map((card) => (
              <motion.div
                key={card.id}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onClick={() => navigate(card.link)}
                className="group relative flex flex-col items-center justify-end cursor-pointer select-none"
              >
                <div className="relative w-full aspect-[165/197] rounded-2xl overflow-hidden drop-shadow-sm group-hover:drop-shadow-md transition-all">
                  <img
                    src={card.image}
                    alt={card.alt}
                    className="w-full h-full object-contain object-bottom"
                  />
                </div>
              </motion.div>
            ))}
          </div>

        </div>

        {/* Section Bottom Strip: Centered Dots + Right Trust Tagline */}
        <div className="mt-5 pt-3.5 border-t border-slate-200/50 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          
          {/* Centered Pagination Pill Dots */}
          <div className="flex items-center gap-1.5 sm:ml-auto sm:mr-auto">
            {CATEGORY_CARDS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveDot(i)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  activeDot === i
                    ? "w-5 h-1.5 bg-[#0F172A] dark:bg-white"
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
