import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Store, 
  TrendingUp, 
  Layers, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  DollarSign, 
  Truck, 
  BarChart3, 
  Percent, 
  Star,
  Users,
  ChevronDown
} from "lucide-react";
import Logo from "../components/Logo";

const Landing = () => {
  const navigate = useNavigate();
  
  // Interactive Calculator State
  const [monthlyOrders, setMonthlyOrders] = useState(250);
  const [avgOrderVal, setAvgOrderVal] = useState(45);
  
  const estimatedRevenue = monthlyOrders * avgOrderVal;
  const platformFee = estimatedRevenue * 0.035; // 3.5%
  const netEarnings = estimatedRevenue - platformFee;

  // FAQ State
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "How fast do I get paid?",
      a: "Payouts are processed automatically every Friday directly to your registered bank account once the delivered order's return period (7 days) expires."
    },
    {
      q: "What are the merchant commission fees?",
      a: "CartNOW charges a flat 3.5% commission fee per successful transaction. There are no hidden setup costs, monthly subscriptions, or listing fees."
    },
    {
      q: "Can I manage inventory across multiple warehouse locations?",
      a: "Yes! The CartNOW Seller Hub allows you to track and manage multi-location inventory, assign stock priority, and monitor real-time stock alerts."
    },
    {
      q: "How does shipping work?",
      a: "CartNOW integrates with the CartNOW Delivery Courier network. Once you mark a package as packed, our assigned delivery agent picks it up from your warehouse."
    }
  ];

  return (
    <div className="min-h-screen bg-[#090D1A] text-slate-100 font-sans selection:bg-orange-500 selection:text-white relative overflow-hidden">
      
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[550px] w-[550px] rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-[40%] right-[10%] h-[400px] w-[400px] rounded-full bg-amber-600/5 blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#090D1A]/70 border-b border-slate-900 px-6 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 p-[1px] shadow-lg shadow-orange-500/20">
              <div className="h-full w-full bg-[#090D1A] rounded-xl flex items-center justify-center">
                <Logo variant="icon" className="h-6 w-6 text-orange-500" />
              </div>
            </div>
            <div className="flex flex-col text-left leading-none">
              <span className="text-base font-black tracking-tight text-white">CartNOW</span>
              <span className="text-[10px] text-orange-500 font-black uppercase tracking-wider mt-0.5">Seller Hub</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/login")}
              className="text-xs font-bold uppercase tracking-wider text-slate-350 hover:text-white px-4 py-2.5 rounded-xl transition duration-200"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate("/signup")}
              className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl transition-all duration-300 shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 active:scale-98 cursor-pointer"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 relative max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/5 text-orange-400 text-xs font-extrabold uppercase tracking-wider mb-6 animate-pulse">
          <Store size={12} />
          <span>Empowering 10,000+ Merchants</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
          Grow your online business with <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent">CartNOW Merchant Hub</span>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
          The all-in-one backend to showcase products, analyze performance, manage live inventory, and generate digital invoices seamlessly.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => navigate("/signup")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-wider px-8 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/25 active:scale-98 cursor-pointer"
          >
            <span>Create Seller Account</span>
            <ArrowRight size={16} />
          </button>
          <a
            href="#calculator"
            className="w-full sm:w-auto flex items-center justify-center gap-2 border border-slate-800 bg-slate-900/30 hover:bg-slate-900/60 hover:border-slate-700 text-slate-350 hover:text-white font-bold px-8 py-4 rounded-xl transition duration-300"
          >
            <span>Calculate Fees</span>
          </a>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="mt-16 relative rounded-2xl border border-slate-800 bg-[#0F1424]/40 p-4 md:p-6 shadow-2xl backdrop-blur-sm max-w-5xl mx-auto overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-t from-[#090D1A] via-transparent to-transparent z-10" />
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800/80 mb-6">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="text-xs text-slate-500 font-bold ml-2">CartNOW Merchant Console</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left relative z-0">
            <div className="p-5 rounded-xl border border-slate-800/50 bg-slate-900/20">
              <div className="flex items-center justify-between mb-3 text-slate-450">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Revenue</span>
                <TrendingUp size={16} className="text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-white">$24,850.00</div>
              <div className="text-[10px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
                <span>↑ +12.4%</span>
                <span className="text-slate-550 font-normal">from last month</span>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-slate-800/50 bg-slate-900/20">
              <div className="flex items-center justify-between mb-3 text-slate-450">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
                <ShoppingBag size={16} className="text-orange-500" />
              </div>
              <div className="text-2xl font-black text-white">412 Orders</div>
              <div className="text-[10px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
                <span>↑ +8.2%</span>
                <span className="text-slate-550 font-normal">this week</span>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-slate-800/50 bg-slate-900/20">
              <div className="flex items-center justify-between mb-3 text-slate-450">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Platform Rating</span>
                <div className="flex gap-0.5 text-amber-500">
                  <Star size={12} fill="currentColor" />
                  <Star size={12} fill="currentColor" />
                  <Star size={12} fill="currentColor" />
                  <Star size={12} fill="currentColor" />
                  <Star size={12} fill="currentColor" />
                </div>
              </div>
              <div className="text-2xl font-black text-white">4.92 / 5.00</div>
              <div className="text-[10px] text-slate-400 font-bold mt-1">
                Based on 2.4k customer reviews
              </div>
            </div>
          </div>

          <div className="mt-6 border border-slate-800/60 rounded-xl p-4 bg-slate-950/40 text-left">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-white">Live Operations Feed</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div className="space-y-3">
              {[
                { title: "Invoice generated successfully", meta: "Order #2985 • Just now", type: "success" },
                { title: "Assigned Delivery Agent #482", meta: "Order #2980 • 5 mins ago", type: "info" },
                { title: "Product 'Summer Linen Dress' stock running low (2 left)", meta: "Inventory Alert • 1 hour ago", type: "warning" }
              ].map((log, i) => (
                <div key={i} className="flex justify-between items-center text-xs py-2 border-b border-slate-900/60 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      log.type === "success" ? "bg-emerald-500" : log.type === "warning" ? "bg-amber-500" : "bg-blue-500"
                    }`} />
                    <span className="font-semibold text-slate-300">{log.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold">{log.meta}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="py-24 px-6 border-y border-slate-900 bg-slate-950/20 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Everything you need to sell online
            </h2>
            <p className="mt-4 text-slate-400 font-light">
              Built on enterprise-grade infrastructure to let you focus purely on creating and selling great products.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                desc: "Monitor your conversions, average order values, and check your growth curves in real-time.",
                color: "text-orange-500",
                bg: "bg-orange-500/10"
              },
              {
                icon: Layers,
                title: "Inventory Control",
                desc: "Prevent oversells with precise multi-variant inventory control, automated alert levels, and batch edits.",
                color: "text-amber-500",
                bg: "bg-amber-500/10"
              },
              {
                icon: Truck,
                title: "Integrated Shipments",
                desc: "Instant courier assignments, tracking status synchronization, and handoff workflows.",
                color: "text-emerald-500",
                bg: "bg-emerald-500/10"
              },
              {
                icon: ShieldCheck,
                title: "Digital Invoices",
                desc: "Keep records neat. Automated dynamic PDF invoice generation for both customer sales and vendor records.",
                color: "text-blue-500",
                bg: "bg-blue-500/10"
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={idx} 
                  className="p-6 rounded-2xl border border-slate-800/80 bg-[#0F1424]/20 hover:border-slate-700/80 hover:bg-[#0F1424]/40 transition-all duration-300 group"
                >
                  <div className={`h-11 w-11 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="text-base font-black text-white">{feature.title}</h3>
                  <p className="mt-3 text-xs leading-relaxed text-slate-400 font-light">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Calculator Section */}
      <section id="calculator" className="py-24 px-6 relative max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <div className="text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Simple pricing. <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">No surprises.</span>
            </h2>
            <p className="mt-4 text-sm text-slate-400 font-light leading-relaxed">
              We align our success directly with yours. No subscription fees, no dynamic pricing tiers, no contract locked limits. You only pay a flat 3.5% processing fee when you make a sale.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                "Unlimited product listings and variations",
                "Complimentary hosting on Vercel Edge Server",
                "Instant payout setup with no minimum threshold",
                "Fully responsive customer support line"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-xs text-slate-350 font-bold">
                  <span className="flex-shrink-0 h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Calculator Card */}
          <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-[#0F1424]/40 shadow-xl backdrop-blur-sm relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 h-28 w-28 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
              <Percent size={18} className="text-orange-500" />
              <span>Earnings Estimator</span>
            </h3>

            {/* Monthly Orders Slider */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-xs font-bold text-slate-350">
                <span>Estimated Monthly Orders</span>
                <span className="text-orange-400">{monthlyOrders} orders</span>
              </div>
              <input
                type="range"
                min="50"
                max="2000"
                step="50"
                value={monthlyOrders}
                onChange={(e) => setMonthlyOrders(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            {/* Average Order Value Slider */}
            <div className="space-y-3 mb-8">
              <div className="flex justify-between items-center text-xs font-bold text-slate-350">
                <span>Average Order Value (USD)</span>
                <span className="text-orange-400">${avgOrderVal}</span>
              </div>
              <input
                type="range"
                min="10"
                max="250"
                step="5"
                value={avgOrderVal}
                onChange={(e) => setAvgOrderVal(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            {/* Result Grid */}
            <div className="space-y-4 pt-6 border-t border-slate-800/80">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Estimated Monthly Revenue</span>
                <span className="font-bold text-slate-200">${estimatedRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Platform Commission (3.5%)</span>
                <span className="font-bold text-red-400">-${platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-800/40">
                <span className="text-sm font-black text-white">Your Net Payout</span>
                <span className="text-xl font-black text-emerald-400">${netEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stepper Roadmap Section */}
      <section className="py-24 px-6 border-t border-slate-900 bg-slate-950/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Launch your shop in minutes
            </h2>
            <p className="mt-4 text-slate-400 font-light">
              No technical or coding setup required. We provide all tools out of the box.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              {
                step: "01",
                title: "Register & Profile Setup",
                desc: "Create your seller credentials, specify your store brand identity, and bank account details."
              },
              {
                step: "02",
                title: "Upload & Organize Products",
                desc: "Publish product profiles, upload images, specify size variants, and set inventory counts."
              },
              {
                step: "03",
                title: "Receive Orders & Grow",
                desc: "Monitor live notifications, package orders for our assigned couriers, and collect payouts."
              }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center md:items-start text-center md:text-left relative p-6 rounded-2xl bg-[#0F1424]/20 border border-slate-900">
                <span className="text-5xl font-black text-orange-500/25 select-none">{step.step}</span>
                <h3 className="text-lg font-black text-white mt-4">{step.title}</h3>
                <p className="mt-3 text-xs leading-relaxed text-slate-400 font-light">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-extrabold text-center text-white mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="rounded-2xl border border-slate-800/80 bg-[#0F1424]/20 overflow-hidden transition"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-white transition hover:bg-slate-900/30 cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown 
                  size={16} 
                  className={`text-slate-400 transition-transform duration-300 ${
                    activeFaq === idx ? "transform rotate-180 text-orange-500" : ""
                  }`}
                />
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  activeFaq === idx ? "max-h-40 border-t border-slate-800/40" : "max-h-0"
                }`}
              >
                <div className="p-5 text-xs leading-relaxed text-slate-400 font-light">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer / Portal switcher */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-16 px-6 relative z-10 text-center">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
          
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl border border-slate-800 bg-[#090D1A] flex items-center justify-center">
              <Logo variant="icon" className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col text-left leading-none">
              <span className="text-sm font-black text-white">CartNOW</span>
              <span className="text-[9px] text-orange-500 font-black uppercase tracking-wider mt-0.5">Seller Hub</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 max-w-md">
            CartNOW Inc. All rights reserved. Registered under standard online merchant licensing guidelines.
          </p>

          <div className="pt-6 border-t border-slate-900 w-full max-w-2xl">
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
              <span className="text-slate-700 select-none">•</span>
              <a 
                href="https://cart-now-deliveryagent.vercel.app/" 
                target="_blank" 
                rel="noreferrer" 
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
