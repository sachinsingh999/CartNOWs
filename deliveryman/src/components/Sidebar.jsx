import React from "react";
import Logo from "./Logo";
import { 
  Truck, RotateCcw, Inbox, AlertTriangle, Sun, Moon, 
  LogOut, MapPin, X, ShieldCheck
} from "lucide-react";

const Sidebar = ({
  driver,
  activeTab,
  handleTabClick,
  tabs,
  stats,
  orders,
  theme,
  setTheme,
  logout,
  onToggleDuty,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const activeOrdersCount = orders.filter(
    (o) => o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled"
  ).length;

  const navItems = [
    { 
      id: "my-deliveries", 
      clickId: "my-deliveries", 
      label: "My Deliveries", 
      badge: activeOrdersCount, 
      icon: Truck 
    },
    { 
      id: "available-pool", 
      clickId: "available-pool", 
      label: "Available Pool", 
      badge: tabs.find(t => t.id === "available-pool")?.count || 0,
      icon: Inbox 
    },
    { 
      id: "returns", 
      clickId: "returns", 
      label: "Returns & Swaps", 
      badge: tabs.find(t => t.id === "returns")?.count || 0, 
      icon: RotateCcw 
    },
    { 
      id: "complaints", 
      clickId: "complaints", 
      label: "Disputes & Support", 
      badge: tabs.find(t => t.id === "complaints")?.count || 0, 
      icon: AlertTriangle 
    },
    { 
      id: "profile", 
      clickId: "profile", 
      label: "Sector & Profile", 
      badge: 0, 
      icon: MapPin 
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Container with Fixed Anchor Axis */}
      <aside
        className={`sidebar-transition fixed top-0 left-0 bottom-0 z-50 glass-panel flex flex-col justify-between shadow-2xl lg:shadow-none overflow-hidden select-none border-r border-slate-200 dark:border-slate-800 ${
          isMobileOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed && !isMobileOpen ? "lg:w-16" : "lg:w-64"}`}
      >
        {/* Top Header & Brand */}
        <div className="h-14 px-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 overflow-hidden">
          <div 
            onClick={() => {
              handleTabClick("my-deliveries");
              if (isMobileOpen) setIsMobileOpen(false);
            }}
            className={`sidebar-transition flex items-center cursor-pointer min-w-0 group ${
              isCollapsed && !isMobileOpen ? "w-10" : "w-[220px]"
            }`}
            title="CartNOW Fleet Courier"
          >
            {/* Fixed Logo Slot */}
            <div className="w-10 h-10 flex items-center justify-center shrink-0">
              <Logo variant="icon" className="h-8 w-8 group-hover:scale-105 transition-transform duration-200" />
            </div>
            
            <div className={`sidebar-fade-transition flex flex-col leading-none text-left whitespace-nowrap overflow-hidden ml-2 ${
              isCollapsed && !isMobileOpen ? "opacity-0 max-w-0 pointer-events-none" : "opacity-100 max-w-[170px]"
            }`}>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">CartNOW</span>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Fleet
                </span>
              </div>
              <span className="text-[9px] text-slate-400 font-semibold tracking-wider mt-0.5">
                Dispatch Console
              </span>
            </div>
          </div>

          {isMobileOpen && (
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Center: Navigation Links */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1 no-scrollbar">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <div 
                  key={item.id} 
                  className={`sidebar-transition overflow-hidden ${
                    isCollapsed && !isMobileOpen ? "w-12" : "w-[238px]"
                  }`}
                >
                  <button
                    onClick={() => {
                      handleTabClick(item.clickId);
                      if (isMobileOpen) setIsMobileOpen(false);
                    }}
                    className={`w-full flex items-center h-10 rounded-md font-bold text-xs tracking-wide transition-all duration-150 cursor-pointer relative group ${
                      isActive
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-850/60"
                    }`}
                    title={isCollapsed && !isMobileOpen ? item.label : undefined}
                  >
                    {/* Fixed Icon Slot */}
                    <div className="w-12 h-10 shrink-0 flex items-center justify-center">
                      <Icon size={16} className={isActive ? "text-current" : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"} />
                    </div>

                    <span className={`sidebar-fade-transition whitespace-nowrap text-left ml-1.5 flex-1 overflow-hidden font-extrabold ${
                      isCollapsed && !isMobileOpen ? "opacity-0 max-w-0 pointer-events-none" : "opacity-100 max-w-[150px]"
                    }`}>
                      {item.label}
                    </span>

                    <div className={`sidebar-fade-transition overflow-hidden mr-2.5 ${
                      isCollapsed && !isMobileOpen ? "opacity-0 max-w-0 pointer-events-none" : "opacity-100 max-w-[36px]"
                    }`}>
                      {item.badge > 0 && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                            isActive
                              ? "bg-white/20 dark:bg-slate-900/20 text-current"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>

                    {/* Compact badge indicator dot */}
                    {item.badge > 0 && isCollapsed && !isMobileOpen && (
                      <span className="absolute top-2 left-8 h-1.5 w-1.5 rounded-full bg-blue-600 ring-1 ring-white dark:ring-[#0C101B] animate-pulse" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-slate-200 dark:border-slate-800 space-y-0.5 shrink-0 overflow-hidden">
          <div 
            className={`sidebar-transition overflow-hidden ${
              isCollapsed && !isMobileOpen ? "w-12" : "w-[238px]"
            }`}
          >
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-full flex items-center h-9 rounded-md text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-850/60 transition-colors duration-150 cursor-pointer"
              title={isCollapsed && !isMobileOpen ? (theme === "dark" ? "Light Mode" : "Dark Mode") : undefined}
            >
              <div className="w-12 h-9 shrink-0 flex items-center justify-center">
                {theme === "dark" ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
              </div>
              <span className={`sidebar-fade-transition whitespace-nowrap text-left ml-1.5 overflow-hidden ${
                isCollapsed && !isMobileOpen ? "opacity-0 max-w-0 pointer-events-none" : "opacity-100 max-w-[150px]"
              }`}>
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </span>
            </button>
          </div>

          <div 
            className={`sidebar-transition overflow-hidden ${
              isCollapsed && !isMobileOpen ? "w-12" : "w-[238px]"
            }`}
          >
            <button
              onClick={logout}
              className="w-full flex items-center h-9 rounded-md text-xs font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20 transition-colors duration-150 cursor-pointer"
              title={isCollapsed && !isMobileOpen ? "Sign Out" : undefined}
            >
              <div className="w-12 h-9 shrink-0 flex items-center justify-center">
                <LogOut size={15} />
              </div>
              <span className={`sidebar-fade-transition whitespace-nowrap text-left ml-1.5 overflow-hidden ${
                isCollapsed && !isMobileOpen ? "opacity-0 max-w-0 pointer-events-none" : "opacity-100 max-w-[150px]"
              }`}>
                Sign Out
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
