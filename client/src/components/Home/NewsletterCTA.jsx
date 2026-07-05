import React, { useState } from "react";
import { toast } from "react-toastify";

const NewsletterCTA = () => {
  const [emailSub, setEmailSub] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailSub.trim()) {
      toast.success("Subscribed successfully! Check your inbox for 15% discount coupon. 🎟️");
      setEmailSub("");
    }
  };

  return (
    <section className="w-full px-6 sm:px-12 lg:px-20 py-6 select-none">
      <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-700 to-violet-900 text-slate-100 dark:text-white p-8 sm:p-12 lg:p-16 text-center shadow-xl border border-white/10 flex flex-col items-center gap-4">
        
        {/* Animated Gifts Vector */}
        <div className="absolute top-6 left-8 text-5xl opacity-15 select-none animate-float-1 pointer-events-none">
          🎁
        </div>
        <div className="absolute bottom-6 right-8 text-5xl opacity-15 select-none animate-float-2 pointer-events-none">
          🎉
        </div>

        <span className="text-[9px] font-black tracking-widest text-cyan-300 uppercase bg-white/10 px-3 py-1 rounded-md border border-white/20">
          Newsletter
        </span>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-1">
          Don't Miss Out
        </h2>
        <p className="text-xs sm:text-sm text-white/80 font-bold max-w-md leading-relaxed">
          Subscribe for exclusive offers, premium launch announcements, and 15% discount code.
        </p>

        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full max-w-md mt-4 select-none">
          <input
            type="email"
            value={emailSub}
            onChange={(e) => setEmailSub(e.target.value)}
            placeholder="Enter your email address..."
            required
            className="w-full px-5 py-3.5 bg-white/10 border border-white/25 rounded-2xl text-xs sm:text-sm outline-none placeholder-white/55 font-bold focus:bg-white/15 text-slate-100 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          />
          <button
            type="submit"
            className="px-6 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 text-indigo-950 font-black uppercase text-xs tracking-wider rounded-2xl transition-all shadow-lg shrink-0 cursor-pointer active:scale-95 border-none"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
};

export default NewsletterCTA;
