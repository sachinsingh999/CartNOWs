import React, { useState, useEffect } from "react";
import { 
  Bell, Sun, Moon, LogOut, User, Menu, Clock, ChevronRight, ShieldAlert, MapPin, Star
} from "lucide-react";

const Navbar = ({
  driver,
  activeTab,
  handleTabClick,
  stats,
  orders,
  theme,
  setTheme,
  showNotifications,
  setShowNotifications,
  showProfileMenu,
  setShowProfileMenu,
  notificationsList,
  logout,
  onToggleDuty,
  isCollapsed,
  setIsCollapsed,
  setIsMobileOpen
}) => {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const getPageMeta = (tab) => {
    switch (tab) {
      case "my-deliveries":
        return { title: "Deliveries Console", subtitle: "Active assignments and route dispatch" };
      case "available-pool":
        return { title: "Shipment Pool", subtitle: "Unassigned packages in your sector" };
      case "returns":
        return { title: "Returns & Exchanges", subtitle: "Reverse logistics pickups and swaps" };
      case "complaints":
        return { title: "Disputes & Support", subtitle: "Incident reports and agent tickets" };
      case "profile":
        return { title: "Sector & Profile", subtitle: "GPS radius and account credentials" };
      default:
        return { title: "Operations Console", subtitle: "Courier dispatch operations" };
    }
  };

  const pageMeta = getPageMeta(activeTab);

  return (
    <header className="w-full h-14 glass-panel sticky top-0 z-30 transition-colors flex items-center shrink-0 border-b border-slate-200 dark:border-slate-800">
      <div className="w-full max-w-[1700px] mx-auto px-3 sm:px-5 h-full flex items-center justify-between gap-3">
        
        {/* Left Section: Sidebar Toggles + Breadcrumb */}
        <div className="flex items-center gap-2.5">
          {/* Mobile Sidebar Menu Toggle */}
          <button
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className="lg:hidden p-1.5 rounded-md bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            aria-label="Toggle Navigation Sidebar"
          >
            <Menu size={15} />
          </button>

          {/* Desktop Sidebar Collapse / Expand Toggle */}
          {setIsCollapsed && (
            <button
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="hidden lg:flex items-center justify-center p-1.5 rounded-md bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <Menu size={14} />
            </button>
          )}

          <div className="text-left">
            <h1 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {pageMeta.title}
            </h1>
            <p className="text-[9px] text-slate-400 font-semibold tracking-wide hidden sm:block">
              {pageMeta.subtitle}
            </p>
          </div>
        </div>

        {/* Right Section: Time, Duty Switch, Notifications, Theme Toggle, Profile */}
        <div className="flex items-center gap-2">
          
          {/* Digital Clock */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-2 py-1 text-slate-500">
            <Clock size={11} className="text-blue-500" />
            <span className="font-mono text-[10px] font-bold text-slate-700 dark:text-slate-200">{currentTime}</span>
          </div>

          {/* On Duty Status Live Button */}
          {onToggleDuty && (
            <button
              onClick={onToggleDuty}
              className={`relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition cursor-pointer border ${
                stats.isOnline
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-200/60"
              }`}
            >
              <span className="relative flex h-1.5 w-1.5">
                {stats.isOnline && (
                  <span className="beacon-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${stats.isOnline ? "bg-emerald-500" : "bg-slate-400"}`} />
              </span>
              <span className="hidden md:inline">{stats.isOnline ? "On Duty" : "Off Duty"}</span>
            </button>
          )}

          {/* Dark / Light Mode Switcher */}
          {setTheme && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-1.5 rounded-md bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} />}
            </button>
          )}

          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 rounded-md bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition relative cursor-pointer"
              title="Notifications"
            >
              <Bell size={13} />
              {notificationsList.length > 0 && (
                <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-blue-600 ring-1 ring-white dark:ring-[#0C101B] animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#0C101B] border border-slate-200 dark:border-slate-800 rounded-md shadow-xl z-50 text-slate-800 dark:text-slate-200 p-3 space-y-2 animate-in fade-in duration-100">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Live Dispatch Alerts
                    </span>
                    <span className="text-[8px] font-black text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                      {notificationsList.length} Active
                    </span>
                  </div>
                  {notificationsList.length === 0 ? (
                    <div className="py-5 text-center text-slate-400 text-xs">
                      <p className="font-bold">All queues clear</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">No pending notifications</p>
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-[240px] overflow-y-auto no-scrollbar">
                      {notificationsList.map((notif) => {
                        const NotifIcon = notif.icon;
                        return (
                          <div
                            key={notif.id}
                            className="p-2 rounded-md border border-slate-100 bg-slate-50/70 dark:border-slate-800/80 dark:bg-slate-900/50 text-xs flex gap-2 hover:bg-slate-100/70 transition"
                          >
                            <div className="h-6 w-6 rounded bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/20">
                              <NotifIcon size={11} />
                            </div>
                            <div className="min-w-0 flex-1 text-left">
                              <p className="font-black text-slate-800 dark:text-slate-200 text-[10px]">{notif.title}</p>
                              <p className="text-[9px] text-slate-400 mt-0.5 leading-snug">{notif.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Courier Profile Avatar & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-1.5 p-1 pl-1.5 pr-2 rounded-md bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition cursor-pointer select-none"
            >
              <div className="h-6 w-6 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-[10px] shrink-0">
                {driver?.name ? driver.name.split(" ").map(n=>n[0]).join("").toUpperCase() : <User size={11} />}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="text-[10px] font-black text-slate-900 dark:text-white truncate max-w-[80px]">
                  {driver?.name?.split(" ")[0] || "Agent"}
                </span>
                <span className="text-[8px] font-bold text-amber-500 flex items-center gap-0.5 mt-0.5">
                  <Star size={8} className="fill-amber-400 text-amber-400" />
                  {driver?.rating ? Number(driver.rating).toFixed(1) : "5.0"}
                </span>
              </div>
            </button>

            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0C101B] border border-slate-200 dark:border-slate-800 rounded-md shadow-xl z-50 text-slate-800 dark:text-slate-200 p-2 space-y-1 animate-in fade-in duration-100">
                  <div className="px-2.5 py-2 text-left border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">{driver?.name || "Courier Partner"}</p>
                    <p className="text-[9px] text-slate-400 truncate mt-0.5">{driver?.email || "courier@cartnow.com"}</p>
                    <div className="mt-1.5 flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800/80 rounded text-[8px] font-bold text-slate-600 dark:text-slate-300">
                      <span>Sector: {driver?.deliveryZone || "General Sector"}</span>
                    </div>
                  </div>

                  <div className="py-0.5 space-y-0.5">
                    <button
                      onClick={() => {
                        handleTabClick("profile");
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left text-xs font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900 transition cursor-pointer"
                    >
                      <User size={12} className="text-slate-400" />
                      <span>Profile & GPS Sector</span>
                    </button>

                    <button
                      onClick={() => {
                        handleTabClick("complaints");
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left text-xs font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900 transition cursor-pointer"
                    >
                      <ShieldAlert size={12} className="text-slate-400" />
                      <span>Disputes & Tickets</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-0.5" />

                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left text-xs font-black text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20 transition cursor-pointer"
                  >
                    <LogOut size={12} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
