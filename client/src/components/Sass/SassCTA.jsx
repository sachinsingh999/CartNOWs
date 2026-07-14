import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const SassCTA = () => {
  return (
    <section className="relative py-24 px-6 sm:px-12 lg:px-20 z-10 border-t border-white/[0.04] overflow-hidden text-center">
      {/* Dynamic Animated Gradient Mesh Overlay */}
      <div className="absolute inset-0 bg-[#070a13]/40 z-0" />
      
      {/* Background moving blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] rounded-full bg-indigo-600/[0.08] blur-[130px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -40, 0],
            y: [0, 40, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-[-20%] right-[20%] w-[600px] h-[600px] rounded-full bg-purple-600/[0.08] blur-[150px]"
        />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center">
        {/* Animated Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight select-text max-w-2xl"
        >
          Scale your metrics pipeline with confidence.
        </motion.h2>

        {/* Animated Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="text-slate-400 text-sm sm:text-base font-medium leading-relaxed max-w-xl mt-5 select-text"
        >
          Start capturing product growth data today. Join thousands of high-performing builders who trust us to power their analytics telemetry.
        </motion.p>

        {/* Action button with continuous breathing glow pulse effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="mt-9"
        >
          <button className="relative group px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white font-extrabold text-xs uppercase tracking-widest transition-all duration-300 hover:scale-[1.03] active:scale-98 cursor-pointer flex items-center gap-2 rounded-none border-none shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:shadow-[0_0_35px_rgba(99,102,241,0.45)]">
            <span>Get Started For Free</span>
            <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default SassCTA;
