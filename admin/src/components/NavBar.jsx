import React from "react";
import Logo from "./Logo";

const NavBar = ({setToken}) => {
  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200/80 shadow-sm z-30 relative">
      <div className="flex items-center gap-3">
        <div className="relative overflow-hidden h-9 w-9 rounded-xl border border-slate-200 bg-slate-50 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_12px_rgba(249,115,22,0.15)]">
          <Logo
            variant="icon"
            className="h-full w-full p-1 text-slate-800 transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-base font-extrabold text-slate-900 tracking-tight">CartNOW</span>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Control Panel</span>
        </div>
      </div>

      {/* Right logout button */}
      <button 
        onClick={() => setToken("")}
        className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 text-xs font-bold transition shadow-sm hover:shadow active:scale-98"
      >
        Sign Out
      </button>
    </nav>
  );
};

export default NavBar;
