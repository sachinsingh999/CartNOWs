import React, { useEffect, useState } from "react";
import { Wrench, RefreshCw, Mail, Phone, Clock, ShieldCheck, Sparkles } from "lucide-react";

const Maintenance = ({ settings }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const hasToken = !!localStorage.getItem("token");

  // Format and update countdown timer
  useEffect(() => {
    if (!settings?.estimatedReturn) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const returnTime = new Date(settings.estimatedReturn).getTime();
      const difference = returnTime - now;

      if (difference <= 0) {
        setTimeLeft("System returning shortly");
        clearInterval(timer);
        return;
      }

      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      
      let formattedTime = "";
      if (days > 0) formattedTime += `${days}d `;
      formattedTime += `${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
      
      setTimeLeft(formattedTime);
    }, 1000);

    return () => clearInterval(timer);
  }, [settings?.estimatedReturn]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const formattedReturnDate = settings?.estimatedReturn
    ? new Date(settings.estimatedReturn).toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-800 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden select-none">
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-orange-500/10 dark:bg-orange-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl pointer-events-none" />

      {/* Main glassmorphic wrapper */}
      <div className="relative z-10 w-full max-w-xl text-center space-y-8 bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/80 rounded-[32px] p-8 sm:p-12 shadow-2xl">
        
        {/* Brand identity */}
        <div className="flex items-center justify-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Sparkles size={16} />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">CartNOW</span>
        </div>

        {/* Maintenance Animation Illustration */}
        <div className="relative flex justify-center py-4">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-24 w-24 rounded-full border border-dashed border-orange-500/40 dark:border-orange-500/20 animate-spin" style={{ animationDuration: '12s' }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-32 w-32 rounded-full border border-dashed border-indigo-500/20 dark:border-indigo-500/10 animate-spin" style={{ animationDuration: '20s', animationDirection: 'reverse' }} />
          </div>
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-500/10 dark:bg-orange-500/5 text-orange-500 border border-orange-500/20 shadow-inner">
            <Wrench size={32} className="animate-bounce" />
          </div>
        </div>

        {/* Headers */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">
            {settings?.title || "We'll Be Right Back"}
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {settings?.message || "Our team is currently upgrading the platform to provide you with a faster and more secure shopping experience."}
          </p>
        </div>

        {/* Ticker / Return Estimates */}
        {settings?.estimatedReturn && (
          <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-5 space-y-2.5 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <Clock size={12} className="text-indigo-500" />
              <span>Estimated Return Time</span>
            </div>
            <p className="text-sm font-black text-slate-800 dark:text-slate-200">
              {formattedReturnDate}
            </p>
            {timeLeft && (
              <div className="text-lg font-black font-mono tracking-wider bg-indigo-500/10 dark:bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 py-1.5 px-4 rounded-xl border border-indigo-500/10 inline-block">
                {timeLeft}
              </div>
            )}
          </div>
        )}

        {/* User Session Info */}
        {hasToken && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10.5px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 max-w-sm mx-auto">
            <ShieldCheck size={13} className="shrink-0" />
            <span>Your session is safe. Please return shortly.</span>
          </div>
        )}

        {/* Support contacts / Buttons */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={handleRefresh}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-950 dark:bg-orange-600 hover:bg-slate-850 dark:hover:bg-orange-550 text-white text-xs font-black uppercase tracking-wider transition active:scale-95 shadow-md cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Refresh Page</span>
          </button>

          {(settings?.contactEmail || settings?.contactPhone) && (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {settings.contactEmail && (
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 text-xs font-black uppercase tracking-wider transition cursor-pointer"
                >
                  <Mail size={13} />
                  <span>Support Email</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
