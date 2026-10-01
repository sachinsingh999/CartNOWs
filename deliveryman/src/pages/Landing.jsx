import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Truck, 
  Clock, 
  MapPin, 
  TrendingUp, 
  ArrowRight, 
  ShieldCheck, 
  IndianRupee, 
  ChevronDown, 
  Sun, 
  Moon,
  Wallet,
  Navigation,
  CheckCircle,
  Inbox,
  Sparkles,
  Zap,
  PhoneCall,
  Activity,
  Layers,
  Award,
  Flame,
  CheckCircle2,
  Navigation2,
  Compass,
  Star,
  Shield,
  Smartphone,
  Check,
  Radio,
  Cpu,
  Terminal,
  Crosshair
} from "lucide-react";
import Logo from "../components/Logo";

const Landing = ({ theme, setTheme }) => {
  const navigate = useNavigate();

  // Interactive Earnings Calculator (INR)
  const [deliveriesPerDay, setDeliveriesPerDay] = useState(18);
  const [avgTip, setAvgTip] = useState(35); // ₹35 avg tip
  
  const baseRatePerDelivery = 80; // ₹80 base commission per delivery
  const dailyEarnings = deliveriesPerDay * (baseRatePerDelivery + avgTip);
  const weeklyEarnings = dailyEarnings * 6; // 6 working days
  const monthlyEarnings = dailyEarnings * 26; // 26 working days

  // Interactive Live Dispatch Simulator State
  const [simulatedAccepted, setSimulatedAccepted] = useState(false);
  const [simulatedStatus, setSimulatedStatus] = useState("Incoming Broadcast");

  const handleSimulateClaim = () => {
    setSimulatedAccepted(true);
    setSimulatedStatus("Package Claimed & En Route");
    setTimeout(() => {
      setSimulatedStatus("Out for Delivery (OTP: 8492)");
    }, 1800);
  };

  const handleResetSimulator = () => {
    setSimulatedAccepted(false);
    setSimulatedStatus("Incoming Broadcast");
  };

  // FAQ state
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "What are the requirements to deliver with CartNOW Courier Hub?",
      a: "You must be at least 18 years old, possess a valid driver's license (or government ID for cyclists/e-bike riders), have access to a reliable vehicle, scooter, or bicycle, and pass a fast identity verification."
    },
    {
      q: "How and when do I get paid?",
      a: "Commissions and tips are deposited weekly directly into your registered bank account or UPI. Customer tips are passed through 100% to you and appear in your earnings ledger immediately after delivery."
    },
    {
      q: "Can I choose my own delivery hours and zone?",
      a: "Yes! There are no minimum shift locks. Simply toggle your status 'Online' in the courier panel whenever you want to accept shipments or claim packages from the live Available Pool."
    },
    {
      q: "How does the Available Shipment Pool work?",
      a: "All unassigned deliveries in your sector are posted in real-time to the public pool. You can review package weight, drop distance, route maps, and estimated commission beforehand and claim them with 1 tap."
    },
    {
      q: "How are return and exchange pickups handled?",
      a: "When a customer requests a return or size exchange, authorized pickups appear in your Returns Desk. You collect the item with an OTP verification code and receive direct reverse logistics payout."
    }
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden text-left">
      
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" 
        style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* ================= 1. ULTRA-SLEEK PRECISION NAVBAR ================= */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#07090e]/90 border-b border-white/10 px-4 sm:px-8 py-3 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-blue-600/10 border border-blue-500/30 flex items-center justify-center rounded-sm">
              <Logo variant="icon" className="h-7 w-7 select-none" />
            </div>
            <div className="flex flex-col text-left leading-none">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight text-white uppercase font-mono">CartNOW</span>
                <span className="px-1.5 py-0.5 rounded-sm text-[8px] font-mono font-bold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  Fleet OS
                </span>
              </div>
              <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider mt-0.5">Courier Hub v4.2</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Online Telemetry Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-bold uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Network Active • 99.8% SLA</span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-sm bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition cursor-pointer"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
            </button>

            <button 
              onClick={() => navigate("/login")}
              className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 hover:text-white px-3.5 py-2 rounded-sm border border-white/15 hover:border-white/30 transition cursor-pointer bg-slate-900/60"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate("/signup")}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold uppercase tracking-wider px-4 sm:px-5 py-2 rounded-sm transition-all shadow-sm active:scale-98 cursor-pointer border border-blue-400/30"
            >
              Join Partner Network
            </button>
          </div>
        </div>
      </header>

      {/* ================= 2. HERO SECTION ================= */}
      <section className="pt-16 sm:pt-24 pb-14 px-4 sm:px-8 relative max-w-7xl mx-auto text-center z-10">
        
        {/* Top Floating Badges */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px] font-mono font-bold uppercase tracking-wider">
            <Radio size={11} className="animate-pulse" />
            <span>Real-Time Hyperlocal Dispatch Engine</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm border border-white/10 bg-slate-900/80 text-slate-300 text-[10px] font-mono font-bold uppercase tracking-wider">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            <span>₹40,000+ Average Monthly Payout</span>
          </span>
        </div>
        
        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.05] uppercase">
          Deliver with CartNOW. <br />
          <span className="text-blue-500">
            Earn Daily. Keep 100% Tips.
          </span>
        </h1>
        
        <p className="mt-5 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
          High-performance courier operating system. Claim unassigned sector parcels, navigate GPS multi-stop routes, collect OTP confirmations, and receive instant weekly payouts.
        </p>

        {/* Primary CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button 
            onClick={() => navigate("/signup")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold uppercase tracking-wider px-7 py-3.5 rounded-sm transition-all shadow-sm active:scale-98 cursor-pointer text-xs border border-blue-400/40"
          >
            <span>Apply as Courier Partner</span>
            <ArrowRight size={14} />
          </button>
          <button
            onClick={() => navigate("/login")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 border border-white/15 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-mono font-bold uppercase tracking-wider px-7 py-3.5 rounded-sm transition shadow-xs text-xs cursor-pointer"
          >
            <Terminal size={14} className="text-blue-400" />
            <span>Launch Dispatch Console</span>
          </button>
        </div>

        {/* ================= 3. LIVE DISPATCH SIMULATOR & INTERACTIVE TERMINAL ================= */}
        <div className="mt-14 relative rounded-md border border-white/15 bg-[#0b0f19] p-4 sm:p-6 shadow-2xl max-w-5xl mx-auto overflow-hidden text-left border-t-2 border-t-blue-500">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="h-2 w-2 rounded-sm bg-rose-500" />
              <span className="h-2 w-2 rounded-sm bg-amber-500" />
              <span className="h-2 w-2 rounded-sm bg-emerald-500" />
              <span className="text-slate-400 font-bold ml-2">CARTNOW_DISPATCH_OS // SECTOR_04_NODE</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-sm flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>STATE: ACTIVE & ON DUTY</span>
              </span>
            </div>
          </div>

          {/* 3 Stats Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
            <div className="p-3.5 rounded-sm border border-white/10 bg-[#0f1422] space-y-1 border-t-2 border-t-emerald-500">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Today's Payout</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-mono font-bold text-white">₹2,070.00</span>
                <span className="text-[9px] font-mono font-bold text-emerald-400">+₹510 Tips</span>
              </div>
              <span className="text-[9px] text-slate-400 font-mono block">18 Deliveries Completed</span>
            </div>
            
            <div className="p-3.5 rounded-sm border border-white/10 bg-[#0f1422] space-y-1 border-t-2 border-t-blue-500">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Active Assignment</span>
              <span className="text-xs font-mono font-bold text-white block truncate">#ORD-2026-20841 (2.4 km)</span>
              <span className="text-[9px] text-slate-400 font-mono flex items-center gap-1">
                <MapPin size={10} className="text-blue-400" />
                <span>Sector 42, Galleria Market</span>
              </span>
            </div>

            <div className="p-3.5 rounded-sm border border-white/10 bg-[#0f1422] space-y-1 border-t-2 border-t-amber-500">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Available Sector Pool</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-mono font-bold text-blue-400">6 Packages</span>
                <span className="text-[9px] font-mono font-bold text-amber-400">⚡ 1.4x Surge</span>
              </div>
              <span className="text-[9px] text-slate-400 font-mono block">Ready for 1-click claim</span>
            </div>
          </div>

          {/* Interactive Dispatch Alert Card (Live Simulator) */}
          <div className="p-4 rounded-sm border border-white/10 bg-[#121827] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-sm bg-blue-500" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <Zap size={13} className="text-blue-400" />
                  Live Dispatch Stream: {simulatedStatus}
                </span>
              </div>

              {simulatedAccepted && (
                <button
                  type="button"
                  onClick={handleResetSimulator}
                  className="text-[9px] font-mono font-bold text-slate-400 hover:text-white underline cursor-pointer"
                >
                  [Reset Simulator]
                </button>
              )}
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-sm bg-[#0b0f19] border border-white/10 shadow-sm">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-white">
                    #ORD-2026-94812
                  </span>
                  <span className="px-1.5 py-0.5 rounded-sm text-[8px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Express 30 Min
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  Green Park Hub <ArrowRight size={10} className="inline mx-1 text-slate-400" /> Sector 15 Residential Block C
                </p>
                <p className="text-[9px] text-slate-400 font-mono">
                  Distance: 2.8 km • Weight: 1.1 kg • Payment: Prepaid Online
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Estimated Payout</span>
                  <span className="text-base font-mono font-bold text-emerald-400">₹145.00</span>
                </div>

                {!simulatedAccepted ? (
                  <button
                    type="button"
                    onClick={handleSimulateClaim}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-sm bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-sm active:scale-98 transition cursor-pointer border border-blue-400/30"
                  >
                    <Zap size={12} />
                    <span>Claim Package</span>
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-sm bg-emerald-600 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
                    <CheckCircle2 size={13} />
                    <span>Claimed & Active</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. INTERACTIVE EARNINGS MATRIX ================= */}
      <section id="calculator" className="py-16 px-4 sm:px-8 relative max-w-6xl mx-auto z-10 border-t border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider">
              <Wallet size={11} />
              <span>Earnings Engine</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight uppercase">
              Know exactly how much <br />
              <span className="text-blue-500">
                you earn every month.
              </span>
            </h2>

            <p className="text-xs text-slate-400 font-normal leading-relaxed">
              Commissions are calculated based on your completed deliveries, travel distance, surge bonuses, and 100% customer tips.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-sm bg-[#0b0f19] border border-white/10 space-y-1">
                <span className="text-[9px] font-mono font-bold uppercase text-slate-400">100% Tips Retained</span>
                <p className="text-xs font-bold text-slate-200">Zero commission cut on all customer tips</p>
              </div>
              <div className="p-3 rounded-sm bg-[#0b0f19] border border-white/10 space-y-1">
                <span className="text-[9px] font-mono font-bold uppercase text-slate-400">Peak Hour Surges</span>
                <p className="text-xs font-bold text-slate-200">Earn up to 1.5x during evening peaks</p>
              </div>
            </div>
          </div>

          {/* Calculator Card */}
          <div className="p-6 rounded-sm border border-white/15 bg-[#0b0f19] shadow-2xl space-y-5 border-t-2 border-t-blue-500">
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
              <h3 className="text-sm font-black text-white flex items-center gap-2 font-mono uppercase">
                <Wallet size={14} className="text-blue-400" />
                <span>Monthly Income Estimator</span>
              </h3>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-blue-500/15 text-blue-400 border border-blue-500/30">
                INR (₹)
              </span>
            </div>

            {/* Slider 1: Deliveries Per Day */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono font-bold">
                <span className="text-slate-400">Daily Deliveries Completed</span>
                <span className="text-blue-400">{deliveriesPerDay} orders / day</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                step="1"
                value={deliveriesPerDay}
                onChange={(e) => setDeliveriesPerDay(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-none appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Slider 2: Average Tip */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono font-bold">
                <span className="text-slate-400">Average Tip per Order</span>
                <span className="text-emerald-400">₹{avgTip} / order</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={avgTip}
                onChange={(e) => setAvgTip(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-none appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Income Counters */}
            <div className="space-y-2 pt-3 border-t border-white/10 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Estimated Daily Income</span>
                <span className="font-bold text-slate-200">₹{dailyEarnings.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Weekly Income (6 Days)</span>
                <span className="font-bold text-slate-200">₹{weeklyEarnings.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-white/10">
                <div>
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider block">Estimated Monthly Payout</span>
                  <span className="text-[9px] text-slate-400">Based on 26 working days</span>
                </div>
                <span className="text-xl font-bold text-emerald-400">
                  ₹{monthlyEarnings.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 5. FEATURES GRID ================= */}
      <section className="py-16 px-4 sm:px-8 border-y border-white/10 bg-[#090d16] relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white uppercase font-mono">
              Engineered for Professional Couriers
            </h2>
            <p className="mt-2 text-xs text-slate-400 font-normal">
              Equipped with real-time GPS telemetry, in-app WebRTC calling, reverse logistics desk, and OTP confirmations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {[
              {
                icon: Navigation,
                title: "Turn-by-Turn Routing",
                desc: "Live OSRM street route polyline with step-by-step navigation instructions.",
                color: "text-blue-400",
                accent: "border-t-blue-500"
              },
              {
                icon: PhoneCall,
                title: "WebRTC Calling & Chat",
                desc: "Live audio and video communication directly within the mission terminal.",
                color: "text-indigo-400",
                accent: "border-t-indigo-500"
              },
              {
                icon: ShieldCheck,
                title: "OTP Verification",
                desc: "6-character cryptographic confirmation ensures zero false delivery disputes.",
                color: "text-emerald-400",
                accent: "border-t-emerald-500"
              },
              {
                icon: Inbox,
                title: "Unassigned Order Pool",
                desc: "Review package weight, sector drop distance, and claim jobs in 1 click.",
                color: "text-amber-400",
                accent: "border-t-amber-500"
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={idx} 
                  className={`p-4 rounded-sm border border-white/10 bg-[#0b0f19] hover:border-white/20 transition duration-200 border-t-2 ${feature.accent}`}
                >
                  <div className={`h-8 w-8 rounded-sm bg-slate-900 border border-white/10 ${feature.color} flex items-center justify-center mb-3`}>
                    <Icon size={16} />
                  </div>
                  <h3 className="text-xs font-bold text-white font-mono uppercase">{feature.title}</h3>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400 font-normal">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 6. FAQ SECTION ================= */}
      <section className="py-16 px-4 sm:px-8 max-w-4xl mx-auto text-left relative z-10">
        <h2 className="text-xl sm:text-2xl font-black text-center text-white mb-8 font-mono uppercase">
          Frequently Asked Questions
        </h2>
        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="rounded-sm border border-white/10 bg-[#0b0f19] overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-slate-200 hover:bg-slate-900/60 cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown 
                  size={14} 
                  className={`text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${ activeFaq === idx ? "transform rotate-180 text-blue-400" : "" }`}
                />
              </button>
              
              <div 
                className={`transition-all duration-200 ease-in-out overflow-hidden ${ activeFaq === idx ? "max-h-40 border-t border-white/10" : "max-h-0" }`}
              >
                <div className="p-3.5 text-xs leading-relaxed text-slate-400 font-normal">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 7. FOOTER ================= */}
      <footer className="border-t border-white/10 bg-[#07090e] py-10 px-4 sm:px-8 text-center relative z-10 font-mono text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <Logo variant="icon" className="h-7 w-7" />
            <span className="font-bold text-white uppercase tracking-wider">CartNOW Fleet OS</span>
          </div>

          <p className="text-[10px] text-slate-500 max-w-md">
            CartNOW Delivery Partner Network. All rights reserved. High-precision logistics dispatch framework.
          </p>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
