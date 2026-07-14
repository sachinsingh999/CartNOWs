import React from "react";
import { motion } from "framer-motion";
import Counter from "./Counter";

const stats = [
  {
    value: 99.98,
    suffix: "%",
    label: "Platform Uptime",
    desc: "SLA backed globally distributed API gateway node availability."
  },
  {
    value: 480,
    suffix: "M+",
    label: "Monthly Events",
    desc: "Telemetry requests processed and indexed by our time-series engine."
  },
  {
    value: 840,
    prefix: "$",
    suffix: "k",
    label: "ARR Saved",
    desc: "Saved by active engineering teams by reducing analytics overhead."
  },
  {
    value: 12,
    suffix: "ms",
    label: "P95 Ingestion",
    desc: "Average network response latency at the closest edge region server."
  }
];

const SassStats = () => {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const statVariants = {
    hidden: { opacity: 0, scale: 0.98, y: 15 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section className="relative py-20 px-6 sm:px-12 lg:px-20 z-10 border-t border-white/[0.04] bg-[#070a13]/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              variants={statVariants}
              className="text-left border-l border-white/[0.08] pl-6 py-2 select-none relative group"
            >
              {/* Highlight background lines */}
              <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-indigo-500 scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-350 ease-[0.16,1,0.3,1]" />

              <div className="text-4xl sm:text-5xl font-black text-white tracking-tight flex items-baseline gap-1">
                <Counter
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                />
              </div>

              <h4 className="text-sm font-extrabold text-slate-200 mt-3.5 tracking-tight uppercase">
                {stat.label}
              </h4>
              
              <p className="text-slate-400 text-xs mt-2.5 leading-relaxed font-medium">
                {stat.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SassStats;
