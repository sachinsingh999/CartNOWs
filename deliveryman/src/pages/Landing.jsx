import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Truck, 
  Clock, 
  MapPin, 
  TrendingUp, 
  ArrowRight, 
  ShieldCheck, 
  DollarSign, 
  ChevronDown, 
  Sun, 
  Moon,
  Wallet,
  Navigation,
  CheckCircle,
  Inbox
} from "lucide-react";
import Logo from "../components/Logo";

const Landing = ({ theme, setTheme }) => {
  const navigate = useNavigate();

  // Interactive Earnings Calculator
  const [deliveriesPerDay, setDeliveriesPerDay] = useState(15);
  const [avgTip, setAvgTip] = useState(3.5);
  
  const baseRatePerDelivery = 4.5; // $4.50 base rate
  const dailyEarnings = deliveriesPerDay * (baseRatePerDelivery + avgTip);
  const weeklyEarnings = dailyEarnings * 5; // 5 working days
  const monthlyEarnings = dailyEarnings * 22; // 22 working days

  // FAQ state
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "What are the requirements to deliver with CartNOW?",
      a: "You must be at least 18 years old, possess a valid driver's license (or government ID for cyclists), have access to a reliable vehicle, scooter, or bicycle, and pass a basic background screening."
    },
    {
      q: "How and when do I get paid?",
      a: "Earnings are deposited weekly directly into your bank account. Tips are passed through 100% to you and are visible in your earnings tab immediately after delivery completion."
    },
    {
      q: "Can I choose my own working hours?",
      a: "Yes! There are no minimum hours or shift locks. Simply toggle your status online in the courier panel whenever you want to accept shipments from the available pool."
    },
    {
      q: "How does the Available Shipment Pool work?",
      a: "All unassigned deliveries in your zone are posted to the public pool. You can review package weight, distance, and earnings beforehand and claim them with a single tap."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200 relative overflow-hidden">
      
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/5 dark:bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[550px] w-[550px] rounded-full bg-[#10B981]/5 dark:bg-[#10B981]/5 blur-[130px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-900 px-6 py-4 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center shadow-sm">
              <Logo variant="icon" className="h-6 w-6 text-slate-800 dark:text-white" />
            </div>
            <div className="flex flex-col text-left leading-none">
              <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">CartNOW</span>
              <span className="text-[10px] text-blue-600 dark:text-indigo-400 font-black uppercase tracking-wider mt-0.5">Courier Hub</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-300 dark:hover:text-white transition shadow-sm cursor-pointer"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            <button 
              onClick={() => navigate("/login")}
              className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-4 py-2.5 rounded-xl transition"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate("/signup")}
              className="bg-blue-600 hover:bg-blue-700 text-slate-100 dark:text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl transition-all duration-300 shadow-md shadow-blue-500/10 active:scale-98 cursor-pointer"
            >
              Apply Now
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 relative max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-indigo-400 text-xs font-extrabold uppercase tracking-wider mb-6">
          <Truck size={12} />
          <span>Flexible courier opportunities</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.1]">
          Deliver with CartNOW, <br />
          <span className="bg-gradient-to-r from-blue-600 to-emerald-500 dark:from-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent">Earn on Your Schedule</span>
        </h1>
        <p className="mt-6 text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
          Claim unassigned orders from the live delivery pool, map optimal routes, track your tips, and manage your earnings directly from a sleek dashboard.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => navigate("/signup")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-slate-100 dark:text-white font-black uppercase tracking-wider px-8 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/15 active:scale-98 cursor-pointer"
          >
            <span>Apply to be a Partner</span>
            <ArrowRight size={16} />
          </button>
          <a
            href="#calculator"
            className="w-full sm:w-auto flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold px-8 py-4 rounded-xl transition duration-300 shadow-sm"
          >
            <span>Calculate Earnings</span>
          </a>
        </div>

        {/* Courier Panel Preview Mockup */}
        <div className="mt-16 relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 p-4 md:p-6 shadow-2xl backdrop-blur-md max-w-4xl mx-auto overflow-hidden text-left">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800/80 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-xs text-slate-400 font-bold ml-2">Courier Console</span>
            </div>
            <span className="text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg">
              Status: Active Online
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Today's Balance</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white block mt-1.5">$118.50</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">Includes $48.00 in tips</span>
            </div>
            
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Assigned Delivery</span>
              <span className="text-sm font-black text-slate-900 dark:text-white block mt-2 truncate">Package #980A (2.4 km)</span>
              <span className="text-[10px] text-slate-500 font-bold mt-1 block flex items-center gap-1">
                <MapPin size={10} className="text-blue-500" />
                <span>Downtown Storefront</span>
              </span>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Pending Pool Shipments</span>
              <span className="text-2xl font-black text-blue-600 dark:text-indigo-400 block mt-1.5">6 Packages</span>
              <span className="text-[10px] text-slate-500 font-bold mt-1 block">Available in your current zone</span>
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Inbox size={14} className="text-blue-500" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Active Pool Preview</span>
            </div>
            <div className="space-y-2.5">
              {[
                { route: "Uptown Hub → Central Park West", payout: "$14.20", dist: "3.2 km", weight: "1.2 kg" },
                { route: "SOHO Merchant → Tribeca Plaza", payout: "$18.50", dist: "4.8 km", weight: "0.8 kg" },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs p-3 border border-slate-200 dark:border-slate-800/60 rounded-xl bg-white dark:bg-slate-950/50">
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.route}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{item.dist} • {item.weight}</span>
                  </div>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">{item.payout}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-24 px-6 border-y border-slate-200 dark:border-slate-900 bg-slate-100/30 dark:bg-slate-950/20 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Built for flexibility and transparency
            </h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400 font-light">
              Join the delivery network designed with couriers in mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Clock,
                title: "Flexible Shifts",
                desc: "Work whenever you want. Log on for an hour or a full day. You have complete control.",
                color: "text-blue-500",
                bg: "bg-blue-500/10"
              },
              {
                icon: Wallet,
                title: "Weekly Direct Payouts",
                desc: "Get paid straight to your bank account every single week. No complex wait lists.",
                color: "text-emerald-500",
                bg: "bg-emerald-500/10"
              },
              {
                icon: Navigation,
                title: "Intelligent Nav Route",
                desc: "Get automated step-by-step route directions optimized for multi-drop delivery flows.",
                color: "text-indigo-500",
                bg: "bg-indigo-500/10"
              },
              {
                icon: ShieldCheck,
                title: "100% Tips Passed",
                desc: "Every single cent of client tips goes straight to you. We take zero commissions on tips.",
                color: "text-emerald-500",
                bg: "bg-emerald-500/10"
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={idx} 
                  className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow transition duration-300 group"
                >
                  <div className={`h-11 w-11 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-light">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Earnings Calculator Section */}
      <section id="calculator" className="py-24 px-6 relative max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <div className="text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Know exactly how much <span className="bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-indigo-400 dark:to-indigo-500 bg-clip-text text-transparent">you can earn.</span>
            </h2>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 font-light leading-relaxed">
              Earnings are calculated based on your claimed delivery counts, distance, and tips. Use our interactive estimator to see your potential gross revenue.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                "Keep 100% of customer tips",
                "Earn extra bonuses during high-demand peaks",
                "Dedicated partner-support agent channels",
                "Accident insurance coverage while delivering"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 font-bold">
                  <span className="flex-shrink-0 h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Calculator Card */}
          <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-xl backdrop-blur-sm relative overflow-hidden text-left">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <DollarSign size={18} className="text-blue-500" />
              <span>Earnings Calculator</span>
            </h3>

            {/* Daily Deliveries */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>Deliveries Completed Per Day</span>
                <span className="text-blue-600 dark:text-indigo-400">{deliveriesPerDay} deliveries</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                step="1"
                value={deliveriesPerDay}
                onChange={(e) => setDeliveriesPerDay(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Average Tip Per Delivery */}
            <div className="space-y-3 mb-8">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>Average Tip Per Delivery</span>
                <span className="text-blue-600 dark:text-indigo-400">${avgTip}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={avgTip}
                onChange={(e) => setAvgTip(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Calculations Grid */}
            <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Estimated Daily Income</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">${dailyEarnings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Estimated Weekly Income (5 Days)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">${weeklyEarnings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800/40">
                <span className="text-sm font-black text-slate-900 dark:text-white">Estimated Monthly Income</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">${monthlyEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stepper Roadmap Section */}
      <section className="py-24 px-6 border-t border-slate-200 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Get started in three steps
            </h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400 font-light">
              Become an active courier partner within 24 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Apply Online",
                desc: "Fill in the basic driver profile, select your transport mode, and upload copy of driver's license."
              },
              {
                step: "02",
                title: "Verification Review",
                desc: "Our vetting team will review your application and documents, approving your portal credentials."
              },
              {
                step: "03",
                title: "Start Earning",
                desc: "Log in, switch status to Online, claim shipment packages from the pool, and collect payouts."
              }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center md:items-start text-center md:text-left p-6 rounded-2xl bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800">
                <span className="text-5xl font-black text-blue-500/20 dark:text-indigo-500/25 select-none">{step.step}</span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-4">{step.title}</h3>
                <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-light">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-extrabold text-center text-slate-900 dark:text-white mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 overflow-hidden transition"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-100/50 dark:hover:bg-slate-900/30 cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown 
                  size={16} 
                  className={`text-slate-400 transition-transform duration-300 ${ activeFaq === idx ? "transform rotate-180 text-blue-500" : "" }`}
                />
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${ activeFaq === idx ? "max-h-40 border-t border-slate-200 dark:border-slate-800/40" : "max-h-0" }`}
              >
                <div className="p-5 text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-light">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-slate-50 dark:bg-slate-950/80 py-16 px-6 relative z-10 text-center">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
          
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
              <Logo variant="icon" className="h-5 w-5 text-slate-800 dark:text-white" />
            </div>
            <div className="flex flex-col text-left leading-none">
              <span className="text-sm font-black text-slate-900 dark:text-white">CartNOW</span>
              <span className="text-[9px] text-blue-600 dark:text-indigo-400 font-black uppercase tracking-wider mt-0.5">Courier Hub</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 max-w-md">
            CartNOW Inc. All rights reserved. Registered under standard third-party courier partner frameworks.
          </p>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-900 w-full max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              Explore CartNOW Platforms
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="https://cartnow-seller.vercel.app" 
                className="text-xs font-bold text-slate-400 hover:text-orange-500 transition"
              >
                Seller Hub
              </a>
              <span className="text-slate-700 dark:text-slate-700 select-none">•</span>
              <a 
                href="https://cart-now-deliveryagent.vercel.app/" 
                className="text-xs font-bold text-slate-400 hover:text-blue-500 transition"
              >
                Delivery Courier Portal
              </a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default Landing;
