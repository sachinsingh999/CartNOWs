import React from "react";
import { Truck, RotateCcw, ShieldCheck, Headphones, Sparkles } from "lucide-react";

const BENEFITS = [
  {
    title: "Secure Checkout",
    desc: "100% Protected & Encrypted",
    icon: ShieldCheck,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-800/50",
    hoverBorder: "hover:border-emerald-500/40 hover:shadow-emerald-500/5",
    badge: "SSL Encrypted",
  },
  {
    title: "Express Shipping",
    desc: "Fast delivery to your doorstep",
    icon: Truck,
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200/60 dark:border-blue-800/50",
    hoverBorder: "hover:border-blue-500/40 hover:shadow-blue-500/5",
    badge: "Tracked Orders",
  },
  {
    title: "Easy Returns",
    desc: "Hassle-free 7-day policy",
    icon: RotateCcw,
    iconColor: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200/60 dark:border-rose-800/50",
    hoverBorder: "hover:border-rose-500/40 hover:shadow-rose-500/5",
    badge: "Quick Refund",
  },
  {
    title: "24/7 Live Support",
    desc: "Dedicated help anytime",
    icon: Headphones,
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-800/50",
    hoverBorder: "hover:border-amber-500/40 hover:shadow-amber-500/5",
    badge: "Always Here",
  },
];

const BenefitsStrip = () => {
  return (
    <section className="w-full px-3 sm:px-6 lg:px-8 py-3 sm:py-4 select-none">
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-4">
        {BENEFITS.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className={`group relative flex items-center gap-3.5 p-3.5 sm:p-4 rounded-none bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-default ${item.hoverBorder}`}
            >
              {/* Icon Container with soft tint & border */}
              <div
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-none flex items-center justify-center shrink-0 border shadow-2xs group-hover:scale-105 transition-transform duration-300 ${item.iconBg}`}
              >
                <Icon size={20} className={`${item.iconColor} stroke-[2.2]`} />
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between gap-1">
                  <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate tracking-tight">
                    {item.title}
                  </p>
                </div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate leading-tight">
                  {item.desc}
                </p>
                <span className="inline-block mt-1 text-[9.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                  {item.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default BenefitsStrip;
