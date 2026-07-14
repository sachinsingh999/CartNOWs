import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const slides = [
  {
    title: "Ingestion Dashboard",
    category: "Monitoring",
    desc: "Monitor activation rates, network latencies, and active growth loop variables from a unified UI.",
    accent: "from-indigo-600 to-purple-600"
  },
  {
    title: "SQL Query Sandbox",
    category: "Analytics",
    desc: "Write complex time-series queries directly in our sandbox compiler with microsecond execution times.",
    accent: "from-purple-600 to-pink-600"
  },
  {
    title: "Telemetry SDK Integration",
    category: "Developer SDKs",
    desc: "Drop our multi-platform event tracking script into your app in under five minutes with type safety.",
    accent: "from-pink-600 to-rose-600"
  },
  {
    title: "Collaborative Workspaces",
    category: "Teams",
    desc: "Set granular permissions, manage shared alerts, and stream custom views in active team rooms.",
    accent: "from-rose-600 to-orange-600"
  }
];

const SassShowcase = () => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef
  });

  // Map vertical scroll progress to horizontal translation
  // We have 4 slides. To scroll through them, translating from 0% to -65% works perfectly.
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-62%"]);

  return (
    <div ref={targetRef} className="relative h-[300vh] z-10 border-t border-white/[0.04] bg-[#030712]">
      {/* Sticky Scroll container */}
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
        {/* Sticky Header Section */}
        <div className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-20 mb-10 w-full text-left">
          <h2 className="text-xs uppercase tracking-[0.25em] font-black text-purple-400">Interactive Tour</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white mt-3 tracking-tight">
            See the builder workflow in action.
          </p>
          <p className="text-slate-400 text-sm mt-3 font-medium max-w-xl leading-relaxed">
            Scroll down to walk through our core platform tools. Hover over showcase modules to interact with key layouts.
          </p>
        </div>

        {/* Horizontal Slides Row */}
        <div className="flex overflow-hidden relative">
          <motion.div style={{ x }} className="flex gap-8 px-6 sm:px-12 lg:px-20 w-max">
            {slides.map((slide, idx) => {
              // We map horizontal position or simple transforms for each card
              return (
                <div
                  key={idx}
                  className="w-[85vw] sm:w-[45vw] lg:w-[35vw] shrink-0 h-[48vh] bg-slate-950 border border-white/[0.06] p-8 flex flex-col justify-between rounded-none relative overflow-hidden group select-none"
                >
                  {/* Subtle dynamic corner gradient glow */}
                  <div className={`absolute top-0 right-0 w-[50%] h-[50%] bg-gradient-to-br ${slide.accent} opacity-[0.03] blur-[40px] pointer-events-none`} />

                  <div className="text-left">
                    <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400">
                      {slide.category}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-white mt-2.5 tracking-tight">
                      {slide.title}
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm mt-2.5 leading-relaxed font-medium">
                      {slide.desc}
                    </p>
                  </div>

                  {/* Interactive Graphic Representation */}
                  <motion.div
                    whileHover={{ scale: 1.015 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-[55%] bg-slate-900 border border-white/[0.04] relative flex items-center justify-center overflow-hidden rounded-none mt-4"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff02_1px,transparent_1px)] [background-size:12px_12px]" />
                    
                    {/* Render abstract geometric canvas element */}
                    <div className={`h-16 w-16 rounded-full bg-gradient-to-tr ${slide.accent} blur-xl opacity-20 group-hover:scale-125 transition-transform duration-500`} />
                    <div className="absolute w-[85%] h-[1px] bg-white/[0.04]" />
                    <div className="absolute h-[85%] w-[1px] bg-white/[0.04]" />
                    
                    {/* Aesthetic mock layout items */}
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-[8px] font-mono text-slate-500">
                      <span>TELEMETRY_ENGINE // V1</span>
                      <span>ACTIVE_SHARD // 02</span>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SassShowcase;
