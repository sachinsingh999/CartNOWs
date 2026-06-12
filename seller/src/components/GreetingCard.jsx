import React from "react";

const GreetingCard = ({ seller }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 md:p-8 rounded-3xl text-white shadow-xl border border-slate-800 relative overflow-hidden transition-all duration-350 hover:shadow-2xl hover:shadow-indigo-500/5 group">
      <div className="absolute top-[-50%] right-[-10%] w-72 h-72 rounded-full bg-orange-500/10 blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-500"></div>
      <div className="space-y-1 relative z-10">
        <span className="text-[10px] text-orange-400 font-extrabold uppercase tracking-widest bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-xl shadow-sm">
          Active Store Session
        </span>
        <h2 className="text-2xl md:text-3xl font-black tracking-tight mt-3">
          Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-indigo-300">{seller?.name || "Merchant"}</span>
        </h2>
        <p className="text-xs text-slate-400 max-w-md mt-1.5 font-medium leading-relaxed">
          Monitor shop analytics, adjust inventory, and review recent buyer acquisitions in real-time.
        </p>
      </div>
    </div>
  );
};

export default GreetingCard;
