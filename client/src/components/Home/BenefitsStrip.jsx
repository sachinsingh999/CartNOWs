import React from "react";
import { Truck, RotateCcw, ShieldCheck, Headphones } from "lucide-react";

const BenefitsStrip = () => {
  return (
    <section className="w-full px-4 sm:px-8 lg:px-12 py-2 sm:py-4 select-none border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {[
          { title: "Secure Checkout", desc: "100% protected", icon: ShieldCheck, iconColor: "text-emerald-500", bgColor: "hover:border-emerald-500/20 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10" },
          { title: "Express Shipping", desc: "Fast delivery", icon: Truck, iconColor: "text-blue-500", bgColor: "hover:border-blue-500/20 hover:bg-blue-50/20 dark:hover:bg-indigo-950/10" },
          { title: "Easy Returns", desc: "Hassle free", icon: RotateCcw, iconColor: "text-rose-500", bgColor: "hover:border-rose-500/20 hover:bg-rose-50/20 dark:hover:bg-rose-950/10" },
          { title: "24/7 Support", desc: "We're here", icon: Headphones, iconColor: "text-amber-500", bgColor: "hover:border-amber-500/20 hover:bg-amber-50/20 dark:hover:bg-amber-950/10" }
        ].map((item, i) => (
          <div key={i} className={`group flex gap-2.5 sm:gap-4 items-center p-3 sm:p-4 rounded-none bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-all duration-300 ${item.bgColor}`}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 dark:bg-slate-900 rounded-none flex items-center justify-center shadow-xs border border-slate-100 dark:border-slate-800 shrink-0 group-hover:scale-105 transition-transform duration-300">
              {React.createElement(item.icon, { size: 16, className: `${item.iconColor} shrink-0` })}
            </div>
            <div className="text-left leading-tight min-w-0">
              <p className="font-extrabold text-[11px] sm:text-sm text-slate-800 dark:text-slate-200 truncate">{item.title}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5 truncate">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BenefitsStrip;
