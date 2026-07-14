import React from "react";
import { motion } from "framer-motion";
import { Activity, Shield, Zap, Cpu, BarChart, Users } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Analytics",
    desc: "Ingest and process web events at speeds that feel like a local script. View metrics updated in real-time.",
    glow: "group-hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]",
    border: "group-hover:border-indigo-500/50"
  },
  {
    icon: Shield,
    title: "Hardened Security",
    desc: "SOC2 compliant event telemetry with row-level encryption and custom domain verification workflows.",
    glow: "group-hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]",
    border: "group-hover:border-purple-500/50"
  },
  {
    icon: Activity,
    title: "Reliable Ingestion",
    desc: "Failover protection nodes process millions of API calls a second without dropping a single payload.",
    glow: "group-hover:shadow-[0_0_30px_rgba(236,72,153,0.2)]",
    border: "group-hover:border-pink-500/50"
  },
  {
    icon: Cpu,
    title: "Edge Compute",
    desc: "Run edge actions directly on payload receipt to map custom fields, trigger webhooks, or filter events.",
    glow: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]",
    border: "group-hover:border-blue-500/50"
  },
  {
    icon: BarChart,
    title: "Advanced Queries",
    desc: "Search, filter, and segment your product metrics with our lightning-fast declarative SQL database builder.",
    glow: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]",
    border: "group-hover:border-emerald-500/50"
  },
  {
    icon: Users,
    title: "Collaborative Dashboards",
    desc: "Build secure workspaces and share views, metrics, and alerts across teammates in seconds.",
    glow: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]",
    border: "group-hover:border-amber-500/50"
  }
];

const SassFeatures = () => {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12
      }
    }
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section className="relative py-20 px-6 sm:px-12 lg:px-20 z-10 border-t border-white/[0.04]">
      {/* Background radial accent */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/[0.02] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs uppercase tracking-[0.25em] font-black text-indigo-400">Features Checklist</h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-3">
            Engineered for high-performing product builders.
          </p>
          <p className="text-sm sm:text-base text-slate-400 font-medium mt-4">
            Zero bloat, pure utility. Features optimized to give your engineering and marketing teams maximum leverage.
          </p>
        </div>

        {/* Staggered features grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className={`group relative bg-slate-950/40 backdrop-blur-md border border-white/[0.06] p-6 rounded-none transition-[border-color,box-shadow] duration-300 ${feat.glow} ${feat.border}`}
            >
              {/* Feature Icon */}
              <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-none w-fit text-indigo-400 group-hover:text-white transition-colors duration-300">
                <feat.icon size={20} className="stroke-[1.5]" />
              </div>

              {/* Title & Description */}
              <h3 className="text-lg font-bold text-white mt-5 tracking-tight">{feat.title}</h3>
              <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed mt-2.5">
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SassFeatures;
