import React from "react";
import { motion } from "framer-motion";

const Loader = ({ size = "md", fullPage = false, message = "Loading...", color = "blue" }) => {
  const sizeClasses = {
    xs: "w-6 h-6 border-2",
    sm: "w-8 h-8 border-2.5",
    md: "w-12 h-12 border-3",
    lg: "w-16 h-16 border-4",
    xl: "w-24 h-24 border-[5px]"
  };

  const colors = {
    blue: "border-blue-500 border-t-transparent dark:border-blue-400 dark:border-t-transparent",
    rose: "border-rose-500 border-t-transparent dark:border-rose-400 dark:border-t-transparent",
    amber: "border-amber-500 border-t-transparent dark:border-amber-400 dark:border-t-transparent",
    emerald: "border-emerald-500 border-t-transparent dark:border-emerald-400 dark:border-t-transparent",
    white: "border-white border-t-transparent"
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const colorClass = colors[color] || colors.blue;

  const content = (
    <div className="flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="relative flex items-center justify-center">
        {/* Glow effect backdrop */}
        <div className={`absolute -inset-3 rounded-full blur-xl opacity-20 dark:opacity-35 animate-pulse ${
          color === "rose" ? "bg-rose-500" :
          color === "amber" ? "bg-amber-500" :
          color === "emerald" ? "bg-emerald-500" : "bg-blue-500"
        }`} />
        
        {/* Rotating outer spinner */}
        <motion.div
          className={`rounded-full ${sizeClass} ${colorClass}`}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        />
        
        {/* Inside pulsing dot */}
        <div className={`absolute rounded-full w-2.5 h-2.5 animate-ping ${
          color === "rose" ? "bg-rose-500" :
          color === "amber" ? "bg-amber-500" :
          color === "emerald" ? "bg-emerald-500" : "bg-blue-500"
        }`} />
      </div>

      {message && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-5 text-[10px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400 font-mono animate-pulse"
        >
          {message}
        </motion.p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-50/70 dark:bg-slate-950/70 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;
