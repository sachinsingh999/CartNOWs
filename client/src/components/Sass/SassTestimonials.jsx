import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Quote, Star, ChevronLeft, ChevronRight, Check } from "lucide-react";

const reviewsRow1 = [
  {
    text: "Switched our metrics ingestion pipeline to CartNow SaaS and saw database overhead immediately decrease. The edge handlers work like a charm.",
    author: "Alex Rivers",
    role: "VP of Platform, LinearFlow",
    avatar: "AR",
    rating: 5,
    verified: true
  },
  {
    text: "The SQL sandbox query times are unreal. We are querying 400M events in under 40 milliseconds without database scaling spikes.",
    author: "Elena Rostova",
    role: "Lead Engineer, DevShards",
    avatar: "ER",
    rating: 5,
    verified: true
  },
  {
    text: "Ingest-to-dashboard latency is practically zero. Our product managers now track activation loops in real-time.",
    author: "Marcus Vance",
    role: "Director of Product, CloudScale",
    avatar: "MV",
    rating: 5,
    verified: true
  }
];

const reviewsRow2 = [
  {
    text: "Incredible reliability. We processed 10B telemetry requests during our product launch week without a single drop.",
    author: "Sophia Martinez",
    role: "DevOps Lead, NetCore",
    avatar: "SM",
    rating: 5,
    verified: true
  },
  {
    text: "The integration was simple. The developer SDK is very well documented. Up and running in exactly 3 minutes.",
    author: "Ryan Gallagher",
    role: "CTO, NextGen SaaS",
    avatar: "RG",
    rating: 5,
    verified: true
  },
  {
    text: "Outstanding customer service and edge sandbox custom functions are extremely powerful. Truly next level.",
    author: "Li Na",
    role: "Infrastructure Lead, ByteLoop",
    avatar: "LN",
    rating: 5,
    verified: true
  }
];

const TestimonialCard = ({ rev }) => {
  const starContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const starVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 15 }
    }
  };

  const verifiedVariants = {
    hidden: { x: -15, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }
    }
  };

  return (
    <motion.div
      whileHover={{
        y: -10,
        boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.25)",
        borderColor: "rgba(99, 102, 241, 0.4)"
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20px" }}
      className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-6 rounded-2xl flex flex-col justify-between text-left relative group overflow-hidden w-[290px] sm:w-[350px] shrink-0 transition-colors duration-300"
    >
      {/* Top Accent corner bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-350 ease-out" />
      
      {/* Glow highlight behind card */}
      <div className="absolute inset-0 bg-indigo-500/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div>
        <div className="flex justify-between items-center mb-4">
          <Quote size={18} className="text-indigo-400 opacity-60" />
          
          {/* Animated Stars */}
          <motion.div
            variants={starContainerVariants}
            className="flex gap-0.5"
          >
            {Array.from({ length: rev.rating }).map((_, i) => (
              <motion.div key={i} variants={starVariants}>
                <Star size={11} className="fill-amber-400 text-amber-400" />
              </motion.div>
            ))}
          </motion.div>
        </div>

        <p className="text-slate-400 group-hover:text-slate-100 text-xs sm:text-sm font-medium leading-relaxed italic select-text transition-colors duration-300">
          "{rev.text}"
        </p>
      </div>

      <div className="flex items-center justify-between mt-6 border-t border-white/[0.04] pt-4">
        <div className="flex items-center gap-3">
          {/* Avatar scale interaction */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="h-8.5 w-8.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-black select-none shrink-0"
          >
            {rev.avatar}
          </motion.div>
          <div>
            <h4 className="text-xs font-extrabold text-white tracking-tight leading-none">
              {rev.author}
            </h4>
            <span className="text-[9.5px] text-slate-500 font-bold block mt-1 leading-none">
              {rev.role}
            </span>
          </div>
        </div>

        {/* Sliding Verified Badge */}
        {rev.verified && (
          <motion.div
            variants={verifiedVariants}
            className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/25 rounded-full text-[8px] text-emerald-400 font-black uppercase tracking-wider"
          >
            <Check size={8} className="stroke-[3]" />
            <span>Verified</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const SassTestimonials = () => {
  const containerRef = useRef(null);

  // Offset states for manual button navigation
  const [row1Offset, setRow1Offset] = React.useState(0);
  const [row2Offset, setRow2Offset] = React.useState(0);

  const handleNext = () => {
    const shift = window.innerWidth < 640 ? 314 : 374; // card width + gap
    setRow1Offset(prev => prev - shift);
    setRow2Offset(prev => prev + shift);
  };

  const handlePrev = () => {
    const shift = window.innerWidth < 640 ? 314 : 374;
    setRow1Offset(prev => prev + shift);
    setRow2Offset(prev => prev - shift);
  };

  // Parallax background scroll tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const orb1Y = useTransform(scrollYProgress, [0, 1], [-60, 60]);
  const orb2Y = useTransform(scrollYProgress, [0, 1], [60, -60]);

  const titleText = "What platform leaders say about us.";
  const titleWords = titleText.split(" ");

  const titleContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const wordVariants = {
    hidden: { y: "20px", opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  // Generate 15 static float particles
  const particles = Array.from({ length: 15 });

  return (
    <motion.section
      ref={containerRef}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.9 }}
      className="relative py-20 px-6 sm:px-12 lg:px-20 z-10 border-t border-white/[0.04] overflow-hidden"
    >
      {/* Testimonials Keyframes Style */}
      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee-left {
          animation: marquee-left 40s linear infinite;
        }
        .animate-marquee-right {
          animation: marquee-right 40s linear infinite;
        }
      `}</style>

      {/* Floating Scroll Parallax Orbs */}
      <motion.div
        style={{ y: orb1Y }}
        className="absolute top-[20%] left-[8%] w-[320px] h-[320px] bg-indigo-500/[0.02] rounded-full blur-[100px] pointer-events-none z-0"
      />
      <motion.div
        style={{ y: orb2Y }}
        className="absolute bottom-[15%] right-[8%] w-[380px] h-[380px] bg-purple-500/[0.02] rounded-full blur-[120px] pointer-events-none z-0"
      />

      {/* Background Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {particles.map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-white/10 blur-[1px]"
            style={{
              top: `${(i * 7 + 13) % 100}%`,
              left: `${(i * 13 + 7) % 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              opacity: [0.1, 0.5, 0.1]
            }}
            transition={{
              duration: 8 + (i % 6) * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 text-left">
          <div>
            <h2 className="text-xs uppercase tracking-[0.25em] font-black text-indigo-400">Wall of Feedback</h2>
            
            {/* Word-by-word title reveal */}
            <motion.h2
              variants={titleContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-3 flex flex-wrap gap-x-2.5"
            >
              {titleWords.map((word, idx) => (
                <span key={idx} className="overflow-hidden inline-block py-0.5">
                  <motion.span variants={wordVariants} className="inline-block">
                    {word}
                  </motion.span>
                </span>
              ))}
            </motion.h2>
          </div>

          {/* Decorative Premium Arrows */}
          <div className="flex gap-3 shrink-0">
            <motion.button
              onClick={handlePrev}
              whileHover={{ scale: 1.08, rotate: -6 }}
              whileTap={{ scale: 0.95 }}
              className="h-9 w-9 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg"
            >
              <ChevronLeft size={16} />
            </motion.button>
            <motion.button
              onClick={handleNext}
              whileHover={{ scale: 1.08, rotate: 6 }}
              whileTap={{ scale: 0.95 }}
              className="h-9 w-9 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg"
            >
              <ChevronRight size={16} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Infinite scrolling dual-marquee area */}
      <div className="relative w-full overflow-hidden mt-6 py-4 flex flex-col gap-6 z-10">
        {/* Gradient edge masks */}
        <div className="absolute inset-y-0 left-0 w-20 sm:w-36 bg-gradient-to-r from-[#030712] via-[#030712]/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-20 sm:w-36 bg-gradient-to-l from-[#030712] via-[#030712]/80 to-transparent z-20 pointer-events-none" />

        {/* Row 1 (scrolling left) */}
        <div className="flex overflow-hidden py-1">
          <motion.div
            animate={{ x: row1Offset }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
            className="w-full flex"
          >
            <div className="flex gap-6 w-max animate-marquee-left hover:[animation-play-state:paused]">
              {[...reviewsRow1, ...reviewsRow1].map((rev, idx) => (
                <TestimonialCard key={idx} rev={rev} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Row 2 (scrolling right) */}
        <div className="flex overflow-hidden py-1">
          <motion.div
            animate={{ x: row2Offset }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
            className="w-full flex"
          >
            <div className="flex gap-6 w-max animate-marquee-right hover:[animation-play-state:paused]">
              {[...reviewsRow2, ...reviewsRow2].map((rev, idx) => (
                <TestimonialCard key={idx} rev={rev} />
              ))}
            </div>
          </motion.div>
        </div>

      </div>
    </motion.section>
  );
};
export default SassTestimonials;
