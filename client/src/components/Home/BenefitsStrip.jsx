import React from "react";
import { Truck, RotateCcw, ShieldCheck, Tag } from "lucide-react";

const BenefitsStrip = () => {
  return (
    <section className="w-full px-6 sm:px-12 lg:px-20 py-8 select-none border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { title: "Free Delivery", desc: "On all orders above ₹499", icon: Truck, iconColor: "text-indigo-500", bgColor: "hover:border-indigo-500/20 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10" },
          { title: "Easy Returns", desc: "No questions asked policy", icon: RotateCcw, iconColor: "text-rose-500", bgColor: "hover:border-rose-500/20 hover:bg-rose-50/20 dark:hover:bg-rose-950/10" },
          { title: "Secure Payments", desc: "Fully protected transactions", icon: ShieldCheck, iconColor: "text-emerald-500", bgColor: "hover:border-emerald-500/20 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10" },
          { title: "Great Offers", desc: "Up to 50% discount on sales", icon: Tag, iconColor: "text-amber-500", bgColor: "hover:border-amber-500/20 hover:bg-amber-50/20 dark:hover:bg-amber-950/10" }
        ].map((item, i) => (
          <div key={i} className={`group flex gap-4 items-center p-4 rounded-[20px] bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850/80 shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-all duration-300 ${item.bgColor}`}>
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-transform duration-300">
              {React.createElement(item.icon, { size: 20, className: `${item.iconColor} shrink-0` })}
            </div>
            <div className="text-left leading-tight">
              <p className="font-extrabold text-sm text-slate-855 dark:text-slate-200">{item.title}</p>
              <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BenefitsStrip;
