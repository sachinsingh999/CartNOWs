import React from "react";
import Logo from "./Logo";
import { 
  Bell, Settings, ShieldAlert, Sun, Moon, LogOut, User, Sparkles
} from "lucide-react";

const Navbar = ({
  driver,
  activeTab,
  handleTabClick,
  tabs,
  stats,
  orders,
  theme,
  setTheme,
  showNotifications,
  setShowNotifications,
  showProfileMenu,
  setShowProfileMenu,
  notificationsList,
  logout
}) => {
  return (
    <header className="w-full bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-30 shadow-sm transition-all duration-300">
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-6">
        
        {/* Left Section: Logo & Compact Navigation Tabs */}
        <div className="flex items-center gap-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 shrink-0 group cursor-pointer">
            <div className="relative h-9 w-9 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900 flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
              <Logo variant="icon" className="h-full w-full p-1.5 text-slate-800 dark:text-white" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
              </span>
            </div>
            <div className="flex flex-col leading-none hidden sm:flex">
              <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight group-hover:text-blue-500 transition-colors duration-200">CartNOW</span>
              <span className="text-[9px] text-blue-550 dark:text-blue-400 font-extrabold uppercase mt-0.5 tracking-wider">Courier</span>
            </div>
          </div>

          <div className="hidden lg:block w-[1px] h-6 bg-slate-200 dark:bg-slate-800" />

          {/* Desktop Navigation Tabs */}
          <div className="hidden lg:flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.clickId)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-extrabold text-[10px] uppercase tracking-wider transition-all duration-300 cursor-pointer whitespace-nowrap border ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-blue-500/10 scale-105"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white border-transparent hover:scale-102"
                  }`}
                >
                  <Icon size={12} className={`stroke-[2.5] ${isActive ? "animate-pulse" : ""}`} />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[9px] font-black tracking-tight transition-all duration-300 ${isActive ? "bg-white/20 text-white" : "bg-slate-100 border border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-405"}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Middle Section: Integrated Real-Time Metrics (Glassmorphic Card) */}
        <div className="hidden xl:flex items-center gap-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl px-4 py-2 hover:border-slate-350 dark:hover:border-slate-700/80 transition-all duration-300">
          <div className="text-left">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Today's Commission</p>
            <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              ₹{stats.totalEarnings?.toFixed(2)}
              <Sparkles size={10} className="text-emerald-500" />
            </p>
          </div>
          <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800" />
          <div className="text-left">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Active Shipments</p>
            <p className="text-xs font-black text-blue-600 dark:text-blue-400 mt-1">
              {orders.filter(o => o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled").length} Packages
            </p>
          </div>
        </div>

        {/* Right Section: Actions & Agent Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-slate-900 dark:border-slate-850 dark:text-slate-300 dark:hover:text-white transition-all duration-200 relative cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
            >
              <Bell size={13} className={notificationsList.length > 0 ? "animate-bounce" : ""} />
              {notificationsList.length > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 text-slate-800 dark:text-slate-200 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Dispatch Alerts</span>
                    <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase bg-blue-500/10 px-2 py-0.5 rounded-md">
                      {notificationsList.length} New
                    </span>
                  </div>
                  {notificationsList.length === 0 ? (
                    <p className="text-[10px] text-slate-500 py-4 text-center">No active operational alerts.</p>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar">
                      {notificationsList.map((notif) => {
                        const NotifIcon = notif.icon;
                        return (
                          <div key={notif.id} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800/80 dark:bg-slate-950/40 text-xs flex gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition duration-150">
                            <div className="h-7 w-7 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center shrink-0 text-slate-505 dark:text-slate-400 shadow-sm border border-slate-200/50 dark:border-slate-800">
                              <NotifIcon size={12} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-slate-800 dark:text-slate-200 text-[10px]">{notif.title}</p>
                              <p className="text-[9px] text-slate-505 dark:text-slate-400 mt-0.5 leading-normal">{notif.desc}</p>
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

          {/* Profile Circle Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="relative h-9 w-9 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center font-extrabold text-xs text-slate-800 dark:text-slate-200 border border-slate-305 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 cursor-pointer select-none shadow-sm hover:scale-105 active:scale-95"
            >
              {driver?.name ? driver.name[0].toUpperCase() : "A"}
              <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-slate-950 ${stats.isOnline ? "bg-emerald-500" : "bg-slate-500"}`} />
            </button>

            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-800 rounded-2xl shadow-2xl z-50 text-slate-800 dark:text-slate-200 p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User Info Header */}
                  <div className="px-3 py-2.5 text-left border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">{driver?.name}</p>
                    <p className="text-[9px] text-slate-500 font-semibold mt-0.5 uppercase tracking-wider">{driver?.email}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-[8px] font-black rounded-md text-blue-600 dark:text-blue-400">
                      {driver?.deliveryZone || "Zone A-2"}
                    </span>
                  </div>

                  {/* Action Items */}
                  <div className="py-1">
                    {/* Theme Toggle option */}
                    <button
                      onClick={() => {
                        setTheme(theme === "dark" ? "light" : "dark");
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-[11px] font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
                        <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                      </span>
                    </button>

                    {/* Settings option */}
                    <button
                      onClick={() => {
                        handleTabClick("profile");
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-[11px] font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition cursor-pointer"
                    >
                      <Settings size={13} />
                      <span>Settings & Zone</span>
                    </button>

                    {/* Emergency SOS option */}
                    <button
                      onClick={() => {
                        toast.error("SOS Emergency Alert sent to Dispatch!");
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-[11px] font-black text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition cursor-pointer"
                    >
                      <ShieldAlert size={13} />
                      <span>Emergency SOS</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                  {/* Sign Out option */}
                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-[11px] font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-455 dark:hover:bg-rose-950/20 transition cursor-pointer"
                  >
                    <LogOut size={13} />
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
