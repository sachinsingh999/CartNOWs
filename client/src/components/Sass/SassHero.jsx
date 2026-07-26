import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const SassHero = () => {
  const shouldReduceMotion = useReducedMotion();
  const titleText = "Next-Generation Analytics for Modern Product Teams";
  const words = titleText.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: shouldReduceMotion ? 0 : 0.1
      }
    }
  };

  const wordVariants = {
    hidden: { y: shouldReduceMotion ? 0 : "40px", opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: shouldReduceMotion ? 0.3 : 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const buttonVariants = {
    hidden: { y: shouldReduceMotion ? 0 : 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: shouldReduceMotion ? 0.3 : 0.6, ease: [0.16, 1, 0.3, 1], delay: shouldReduceMotion ? 0 : 0.8 }
    }
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-12 overflow-hidden z-10 px-6 sm:px-12 lg:px-20 text-center">
      {/* Cinematic Glowing Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={shouldReduceMotion ? {} : {
            y: [0, -25, 0],
            x: [0, 15, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[8%] left-[12%] w-[350px] h-[350px] rounded-full bg-indigo-600/10 blur-[110px]"
        />
        <motion.div
          animate={shouldReduceMotion ? {} : {
            y: [0, 30, 0],
            x: [0, -20, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-[15%] right-[8%] w-[450px] h-[450px] rounded-full bg-purple-600/10 blur-[130px]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60" />
      </div>

      <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10">
        {/* Premium Tagline Badge */}
        <motion.div
          initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95, y: shouldReduceMotion ? 0 : -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0.3 : 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/[0.04] border border-white/[0.08] text-indigo-300 text-[10px] sm:text-xs font-semibold rounded-full shadow-inner select-none mb-6"
        >
          <Sparkles size={11} className="text-indigo-400" />
          <span>V1.0.0 Release: Real-time user metrics reporting</span>
        </motion.div>

        {/* Title Cinematic Reveal */}
        <motion.h1
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[1.1] bg-gradient-to-b from-white via-white to-slate-400 bg-clip-text text-transparent select-text max-w-3xl flex flex-wrap justify-center gap-x-3.5 gap-y-1.5"
        >
          {words.map((word, idx) => (
            <span key={idx} className="overflow-hidden inline-block py-0.5">
              <motion.span variants={wordVariants} className="inline-block">
                {word}
              </motion.span>
            </span>
          ))}
        </motion.h1>

        {/* Subtitle Description */}
        <motion.p
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0.3 : 0.8, ease: "easeOut", delay: shouldReduceMotion ? 0 : 0.6 }}
          className="text-slate-400 font-medium text-sm sm:text-base lg:text-lg max-w-2xl mt-6 select-text leading-relaxed"
        >
          Instantly capture, analyze, and optimize your product growth loops. Built for performance-driven developers and product owners who demand microsecond latency.
        </motion.p>

        {/* CTAs slide-up with staggered timing */}
        <motion.div
          variants={buttonVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap items-center justify-center gap-4 mt-8"
        >
          <motion.button 
            whileHover={shouldReduceMotion ? {} : { scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-white text-slate-950 font-bold text-xs uppercase tracking-widest transition-all duration-300 hover:bg-slate-100 hover:shadow-lg hover:shadow-white/10 active:scale-[0.98] cursor-pointer flex items-center gap-1.5 border-none"
          >
            <span>Start Free Trial</span>
            <ArrowRight size={13} />
          </motion.button>
          <motion.button 
            whileHover={shouldReduceMotion ? {} : { scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-transparent hover:bg-white/[0.04] border border-white/20 text-white font-bold text-xs uppercase tracking-widest transition-all duration-300 active:scale-[0.98] cursor-pointer"
          >
            View Live Demo
          </motion.button>
        </motion.div>
      </div>

      {/* Product Mockup Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 80, scale: shouldReduceMotion ? 1 : 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: shouldReduceMotion ? 0.3 : 0.9, ease: [0.16, 1, 0.3, 1], delay: shouldReduceMotion ? 0 : 0.2 }}
        className="w-full max-w-5xl mx-auto mt-20 relative z-10 px-4"
      >
        {/* Glow overlay */}
        <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 w-[70%] h-[110%] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none z-0" />

        <div className="relative z-10 bg-slate-950/60 backdrop-blur-xl border border-white/[0.08] shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden aspect-[16/10] p-4 flex gap-4">
          {/* Sidebar Mockup */}
          <div className="w-[18%] border-r border-white/[0.06] pr-4 flex flex-col justify-between hidden md:flex select-none">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-indigo-500 rounded-sm" />
                <div className="h-3 w-16 bg-white/20 rounded" />
              </div>
              <div className="space-y-2.5 pt-4">
                <div className="h-3 w-full bg-white/10 rounded-sm" />
                <div className="h-3 w-[85%] bg-white/5 rounded-sm" />
                <div className="h-3 w-[90%] bg-white/5 rounded-sm" />
                <div className="h-3 w-[60%] bg-white/5 rounded-sm" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 bg-white/10 rounded-full" />
              <div className="h-2 w-12 bg-white/20 rounded" />
            </div>
          </div>

          {/* Main Panel Mockup */}
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-center border-b border-white/[0.06] pb-3 select-none">
              <div className="flex items-center gap-3">
                <div className="h-4 w-28 bg-white/15 rounded" />
                <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/25">Live</span>
              </div>
              <div className="flex gap-2">
                <div className="h-5.5 w-12 bg-white/5 border border-white/[0.08] rounded" />
                <div className="h-5.5 w-12 bg-white/5 border border-white/[0.08] rounded" />
              </div>
            </div>

            {/* Dynamic Animated Bars */}
            <div className="flex-1 flex items-end gap-3 pt-8 pb-3 select-none">
              {[55, 38, 76, 48, 65, 82, 58, 72, 42, 63, 85, 52, 68, 78, 44].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: shouldReduceMotion ? 0.3 : 1.1, ease: [0.16, 1, 0.3, 1], delay: shouldReduceMotion ? 0 : i * 0.04 }}
                  className="flex-1 bg-gradient-to-t from-indigo-600 via-indigo-500 to-purple-500 rounded-none relative group"
                >
                  {/* Subtle hover tooltip glow inside mockup */}
                  <div className="absolute top-[-25px] left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 px-1 py-0.5 text-[8px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-none whitespace-nowrap">
                    {h}%
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Analytics Bottom Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/[0.06]">
              <div className="bg-white/[0.02] p-2.5 rounded-none border border-white/[0.04] text-left">
                <div className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Pageviews</div>
                <div className="text-sm font-black text-white mt-1">1,402,192</div>
              </div>
              <div className="bg-white/[0.02] p-2.5 rounded-none border border-white/[0.04] text-left">
                <div className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Growth Loop</div>
                <div className="text-sm font-black text-indigo-400 mt-1">+24.52%</div>
              </div>
              <div className="bg-white/[0.02] p-2.5 rounded-none border border-white/[0.04] text-left">
                <div className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Bounce Rate</div>
                <div className="text-sm font-black text-white mt-1">32.84%</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default SassHero;
