import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Store, 
  TrendingUp, 
  Layers, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  BarChart3, 
  Percent, 
  Star, 
  Users, 
  ChevronDown, 
  ChevronRight, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  BadgePercent, 
  FileText, 
  Clock, 
  Sun, 
  Moon, 
  Headphones, 
  Check, 
  Boxes, 
  Compass, 
  Activity, 
  Menu, 
  X, 
  ExternalLink, 
  CreditCard, 
  PackageCheck, 
  Award, 
  MessageSquare, 
  HelpCircle, 
  Smartphone, 
  Search, 
  Sliders, 
  Download, 
  RefreshCw, 
  IndianRupee 
} from "lucide-react";
import Logo from "../components/Logo";
import { useTheme } from "../context/ThemeContext";
import { 
  motion, 
  AnimatePresence, 
  useScroll, 
  useTransform, 
  useSpring, 
  useInView, 
  useReducedMotion, 
  useMotionValue, 
  animate 
} from "framer-motion";

// ============================================================================
// Animated Number Counter Component
// ============================================================================
const AnimatedCounter = ({ value, prefix = "", suffix = "", decimalPlaces = 0 }) => {
  const shouldReduceMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }
    const controls = animate(motionValue, value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        setDisplayValue(latest);
      }
    });
    return () => controls.stop();
  }, [value, motionValue, shouldReduceMotion]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString("en-IN", {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces
      })}
      {suffix}
    </span>
  );
};

// ============================================================================
// Main Landing Component
// ============================================================================
const Landing = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();


  // Active tab in interactive sandbox mockup (overview, orders, matrix, invoice)
  const [activeMockupTab, setActiveMockupTab] = useState("overview");

  // Interactive Calculator State (INR ₹)
  const [monthlyOrders, setMonthlyOrders] = useState(350);
  const [avgOrderVal, setAvgOrderVal] = useState(1250);

  const estimatedRevenue = monthlyOrders * avgOrderVal;
  const cartnowFee = estimatedRevenue * 0.035; // 3.5%
  const traditionalFee = estimatedRevenue * 0.18; // 18% average on legacy marketplaces
  const monthlySavings = traditionalFee - cartnowFee;
  const netEarnings = estimatedRevenue - cartnowFee;
  const annualizedTakeHome = netEarnings * 12;

  // Preset calculator profiles
  const applyPreset = (orders, aov) => {
    setMonthlyOrders(orders);
    setAvgOrderVal(aov);
  };

  // FAQ Accordion & Category Filter State
  const [activeFaqCategory, setActiveFaqCategory] = useState("all");
  const [activeFaq, setActiveFaq] = useState(0);

  const faqData = [
    {
      category: "payouts",
      q: "How fast do I receive payouts for completed and delivered orders?",
      a: "CartNOW settles funds directly into your verified bank account via automated IMPS/NEFT every Tuesday and Friday (T+1 schedule) as soon as the standard customer return window (7 days) concludes. Zero minimum balance thresholds or lock-in periods."
    },
    {
      category: "fees",
      q: "What are the exact merchant fees and commission deductions?",
      a: "CartNOW charges a single, transparent 3.5% flat fee per completed order. There are zero registration fees, zero monthly subscription costs, zero listing charges, and no hidden penalties."
    },
    {
      category: "shipping",
      q: "How does doorstep courier pickup and logistics dispatch work?",
      a: "CartNOW is integrated with automated courier fleets including Delhivery and BlueDart. The moment you mark an order as 'Packed' in your merchant dashboard, the nearest delivery partner is automatically routed to your registered warehouse for doorstep pickup."
    },
    {
      category: "catalog",
      q: "Can I manage complex multi-variant products (Sizes, Colors, Barcodes)?",
      a: "Yes! CartNOW includes an AI-driven Variant Matrix generator and a built-in Monaco JSON code editor. You can generate dozens of SKU combinations with independent stock counts, SKUs, and pricing in seconds, or edit the raw JSON structure directly."
    },
    {
      category: "invoicing",
      q: "Are tax-compliant GST invoices generated automatically?",
      a: "Every purchase automatically compiles a downloadable, GST-compliant digital invoice with verified HSN codes, CGST/SGST/IGST breakdown, and your digital merchant authorization stamp."
    },
    {
      category: "returns",
      q: "How are customer returns and damaged packages managed?",
      a: "Customers submit returns through the buyer app with mandatory photo proof. Our RMA subsystem allows you to inspect, approve, or dispute return claims. Legitimate returns are returned to your doorstep with zero return-penalty charges."
    }
  ];

  const filteredFaqs = activeFaqCategory === "all" 
    ? faqData 
    : faqData.filter(item => item.category === activeFaqCategory);

  // Scroll Progress Hooks
  const { scrollY, scrollYProgress } = useScroll();

  const blobY1 = useTransform(scrollY, [0, 1200], [0, -120]);
  const blobY2 = useTransform(scrollY, [0, 1200], [0, 120]);
  const smoothBlobY1 = useSpring(blobY1, { stiffness: 80, damping: 25 });
  const smoothBlobY2 = useSpring(blobY2, { stiffness: 80, damping: 25 });


  // 3D Tilt Mockup Mouse Interaction Hook
  const mockupRef = useRef(null);
  const mX = useMotionValue(0.5);
  const mY = useMotionValue(0.5);
  const tiltX = useSpring(useTransform(mY, [0, 1], [4, -4]), { stiffness: 140, damping: 24 });
  const tiltY = useSpring(useTransform(mX, [0, 1], [-4, 4]), { stiffness: 140, damping: 24 });

  const handleMouseMove = (e) => {
    if (shouldReduceMotion || !mockupRef.current) return;
    const rect = mockupRef.current.getBoundingClientRect();
    const posX = (e.clientX - rect.left) / rect.width;
    const posY = (e.clientY - rect.top) / rect.height;
    mX.set(posX);
    mY.set(posY);
  };

  const handleMouseLeave = () => {
    mX.set(0.5);
    mY.set(0.5);
  };

  // Scroll to section helper
  const scrollToSection = (id) => {
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 font-sans selection:bg-orange-500 selection:text-white relative overflow-hidden transition-colors duration-200">
      
      {/* ── Scroll Progress Line ── */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 z-[100] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* ── Atmospheric Ambient Lighting & Grid Mesh ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
            backgroundSize: "32px 32px"
          }}
        />
        <motion.div 
          style={{ y: smoothBlobY1 }}
          className="absolute top-[-6%] left-[-10%] h-[600px] w-[600px] rounded-full bg-orange-500/10 dark:bg-orange-600/15 blur-[140px]" 
        />
        <motion.div 
          style={{ y: smoothBlobY2 }}
          className="absolute top-[32%] right-[-10%] h-[650px] w-[650px] rounded-full bg-amber-500/10 dark:bg-indigo-600/15 blur-[150px]" 
        />
        <div className="absolute bottom-[-10%] left-1/4 h-[550px] w-[550px] rounded-full bg-rose-500/5 dark:bg-orange-600/10 blur-[140px]" />
      </div>

      {/* ============================================================ */}
      {/* 1. TOP NAVIGATION BAR (MATCHES DESIGN SYSTEM)                */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-50 w-full h-16 px-4 sm:px-8 flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#070b14]/85 backdrop-blur-xl transition-colors duration-200 shadow-2xs">
        
        {/* Left: Brand Identity & Merchant Pill */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none" 
          onClick={() => navigate("/")}
        >
          <Logo className="h-7 sm:h-8 w-auto" />
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span>MERCHANT</span>
          </span>
        </div>

        {/* Right: Actions Cluster */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Live Network Status Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">Merchant Network Active</span>
            <span className="sm:hidden">Active</span>
          </div>

          {/* Circular Theme Switcher */}
          <button
            onClick={toggleTheme}
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center border border-slate-200/90 dark:border-white/10 bg-slate-100/80 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 hover:border-orange-500/40 transition-all cursor-pointer shadow-2xs"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Sign In Navigation Pill Button */}
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer shadow-2xs"
          >
            <span>Sign In</span>
          </button>

          {/* Apply for Shop Primary CTA Pill Button */}
          <button
            onClick={() => navigate("/signup")}
            className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 active:scale-97 text-white text-xs font-black uppercase tracking-wider px-4 sm:px-5 py-1.5 rounded-full shadow-xs hover:brightness-105 transition-all cursor-pointer"
          >
            <span>APPLY</span>
          </button>

        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. HERO SECTION                                              */}
      {/* ============================================================ */}
      <section className="pt-12 pb-12 sm:pt-16 sm:pb-16 px-4 sm:px-6 relative max-w-7xl mx-auto text-center z-10">
        
        {/* Top Feature Announcement Pill */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-xs font-extrabold uppercase tracking-wider mb-6 cursor-pointer hover:border-orange-500/40 transition"
          onClick={() => scrollToSection("calculator")}
        >
          <Sparkles size={13} />
          <span>CartNOW v2.4 Merchant Network &bull; Flat 3.5% Fee &bull; T+1 Payouts</span>
          <ChevronRight size={13} />
        </motion.div>
        
        {/* Main Hero Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white max-w-5xl mx-auto leading-[1.08]"
        >
          Scale Your Storefront.{" "}
          <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 bg-clip-text text-transparent">
            Automate Fulfillment.
          </span>
        </motion.h1>
        
        {/* Hero Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-sm sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          The unified merchant operating system built for high-velocity Indian commerce. Manage live multi-variant catalogs, auto-dispatch doorstep delivery couriers, and collect guaranteed next-day bank payouts.
        </motion.p>

        {/* Hero CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5"
        >
          <button 
            onClick={() => navigate("/signup")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold uppercase tracking-wider px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-orange-600/30 active:scale-98 cursor-pointer text-xs"
          >
            <span>Start Selling on CartNOW</span>
            <ArrowRight size={15} />
          </button>

          <button
            onClick={() => scrollToSection("calculator")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-bold px-7 py-3.5 rounded-xl transition shadow-xs cursor-pointer text-xs"
          >
            <Percent size={14} className="text-orange-500" />
            <span>Calculate Payout &amp; Savings</span>
          </button>
        </motion.div>

        {/* Live Marketplace Proof Stats Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-4xl mx-auto text-left"
        >
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">₹240 Cr+</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Disbursed to Merchants</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">50,000+</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Active Store Partners</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">99.8%</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Doorstep Pickup SLA</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">T+1</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Direct Bank Settlements</div>
          </div>
        </motion.div>

        {/* Security & Logistics Trust Row */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>256-Bit Bank Encryption</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Truck size={14} className="text-blue-500" />
            <span>Doorstep Courier Pickup</span>
          </span>
          <span className="flex items-center gap-1.5">
            <FileText size={14} className="text-indigo-500" />
            <span>Automated GST Compliance</span>
          </span>
          <span className="flex items-center gap-1.5">
            <IndianRupee size={14} className="text-amber-500" />
            <span>Instant UPI &amp; IMPS Transfers</span>
          </span>
        </div>

        {/* ============================================================ */}
        {/* 3. INTERACTIVE COMMAND CENTER SANDBOX (3D TILT MOCKUP)        */}
        {/* ============================================================ */}
        <div id="command-center" className="scroll-mt-24">
          <motion.div 
            ref={mockupRef}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-14 max-w-5xl mx-auto perspective-[1200px]"
          >
            <motion.div 
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                rotateX: shouldReduceMotion ? 0 : tiltX,
                rotateY: shouldReduceMotion ? 0 : tiltY,
                transformStyle: "preserve-3d",
              }}
              className="relative rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-2xl shadow-slate-900/10 dark:shadow-black/60 backdrop-blur-xl overflow-hidden text-left"
            >
              
              {/* Window Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-bold ml-2">
                    CartNOW Merchant Command Center &bull; Interactive Sandbox
                  </span>
                </div>

                {/* Interactive Sandbox Tab Switchers */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <button
                    onClick={() => setActiveMockupTab("overview")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeMockupTab === "overview" 
                        ? "bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-xs" 
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    📊 Overview
                  </button>
                  <button
                    onClick={() => setActiveMockupTab("orders")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeMockupTab === "orders" 
                        ? "bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-xs" 
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    📦 Orders &amp; Dispatch
                  </button>
                  <button
                    onClick={() => setActiveMockupTab("matrix")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeMockupTab === "matrix" 
                        ? "bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-xs" 
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    ✨ Variant Matrix
                  </button>
                  <button
                    onClick={() => setActiveMockupTab("invoice")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeMockupTab === "invoice" 
                        ? "bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-xs" 
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    🧾 GST Invoicing
                  </button>
                </div>
              </div>

              {/* TAB 1: OVERVIEW SHOWCASE */}
              {activeMockupTab === "overview" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-50/90 dark:bg-slate-950/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Gross Merchandise Value (GMV)
                        </span>
                        <div className="h-7 w-7 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                          <TrendingUp size={15} />
                        </div>
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                        <AnimatedCounter value={184250} prefix="₹" decimalPlaces={2} />
                      </div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
                        <span>↑ +24.8%</span>
                        <span className="text-slate-500 font-normal">vs previous 30 days</span>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50/90 dark:bg-slate-950/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Dispatched Shipments
                        </span>
                        <div className="h-7 w-7 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                          <Truck size={15} />
                        </div>
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                        <AnimatedCounter value={524} suffix=" Packages" />
                      </div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
                        <span>↑ +18.2%</span>
                        <span className="text-slate-500 font-normal">fulfilled on-time</span>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50/90 dark:bg-slate-950/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Merchant Reputation
                        </span>
                        <div className="flex gap-0.5 text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={13} fill="currentColor" />
                          ))}
                        </div>
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                        <AnimatedCounter value={4.94} decimalPlaces={2} suffix=" / 5.0" />
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                        Verified customer rating across 3,840+ reviews
                      </div>
                    </div>
                  </div>

                  {/* 7-Day Velocity Chart Simulation */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <BarChart3 size={14} className="text-orange-500" />
                        <span>Daily Sales Velocity (Last 7 Days)</span>
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                        Average: ₹26,320 / day
                      </span>
                    </div>
                    <div className="grid grid-cols-7 gap-2 items-end h-20 pt-2 px-1">
                      {[
                        { day: "Mon", val: 65, amount: "₹18.2k" },
                        { day: "Tue", val: 82, amount: "₹24.5k" },
                        { day: "Wed", val: 55, amount: "₹15.8k" },
                        { day: "Thu", val: 95, amount: "₹29.1k" },
                        { day: "Fri", val: 88, amount: "₹26.4k" },
                        { day: "Sat", val: 100, amount: "₹34.8k" },
                        { day: "Sun", val: 78, amount: "₹22.9k" },
                      ].map((bar, i) => (
                        <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                          <div 
                            style={{ height: `${bar.val}%` }} 
                            className="w-full rounded-md bg-gradient-to-t from-orange-600 to-amber-500 group-hover:from-orange-500 group-hover:to-amber-400 transition" 
                            title={`${bar.day}: ${bar.amount}`}
                          />
                          <span className="text-[10px] text-slate-500 font-medium">{bar.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: ORDERS & DISPATCH SHOWCASE */}
              {activeMockupTab === "orders" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Active Dispatch Pipeline (Automated Fleet)
                    </span>
                    <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-full">
                      3 Pickups Queued
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                          <th className="py-2">Order ID</th>
                          <th className="py-2">Customer &amp; City</th>
                          <th className="py-2">Item Details</th>
                          <th className="py-2">Amount</th>
                          <th className="py-2">Dispatch Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                        <tr>
                          <td className="py-2.5 font-mono text-orange-600">#ORD-9842</td>
                          <td className="py-2.5">Arjun Mehta &bull; Bengaluru</td>
                          <td className="py-2.5">AeroFlex Sneakers (Size 9, Black)</td>
                          <td className="py-2.5 font-bold font-mono">₹2,890</td>
                          <td className="py-2.5">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-[10px] font-bold border border-blue-200 dark:border-blue-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                              Courier Assigned (Ravi K.)
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-mono text-orange-600">#ORD-9841</td>
                          <td className="py-2.5">Pooja Sharma &bull; Mumbai</td>
                          <td className="py-2.5">Pure Linen Formal Shirt (L, Sky Blue)</td>
                          <td className="py-2.5 font-bold font-mono">₹1,650</td>
                          <td className="py-2.5">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 size={11} />
                              Dispatched &bull; Delhivery
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-mono text-orange-600">#ORD-9840</td>
                          <td className="py-2.5">Rohan Verma &bull; New Delhi</td>
                          <td className="py-2.5">Ergonomic Wireless Mouse (Graphite)</td>
                          <td className="py-2.5 font-bold font-mono">₹999</td>
                          <td className="py-2.5">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-200 dark:border-amber-800">
                              <Clock size={11} />
                              Ready for Pickup
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: VARIANT MATRIX SHOWCASE */}
              {activeMockupTab === "matrix" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between pb-1">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        AeroFlex Pro Running Shoes &bull; AI Matrix Generator
                      </h4>
                      <p className="text-[11px] text-slate-500">6 Multi-Variant Combinations synced across marketplaces</p>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md font-bold">
                      Monaco JSON Synced
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { sku: "AERO-BLK-08", color: "Midnight Black", size: "UK 8", price: "₹2,499", stock: "42 in stock" },
                      { sku: "AERO-BLK-09", color: "Midnight Black", size: "UK 9", price: "₹2,499", stock: "38 in stock" },
                      { sku: "AERO-BLK-10", color: "Midnight Black", size: "UK 10", price: "₹2,499", stock: "15 in stock" },
                      { sku: "AERO-RED-08", color: "Crimson Red", size: "UK 8", price: "₹2,699", stock: "24 in stock" },
                      { sku: "AERO-RED-09", color: "Crimson Red", size: "UK 9", price: "₹2,699", stock: "19 in stock" },
                      { sku: "AERO-RED-10", color: "Crimson Red", size: "UK 10", price: "₹2,699", stock: "8 in stock" },
                    ].map((variant, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-mono text-[10px] text-orange-600 font-bold">{variant.sku}</span>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{variant.stock}</span>
                        </div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">{variant.color} &bull; {variant.size}</div>
                        <div className="text-slate-500 font-mono mt-0.5">{variant.price}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB 4: GST INVOICING SHOWCASE */}
              {activeMockupTab === "invoice" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-3"
                >
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">Tax Invoice #INV-2026-9842</span>
                        <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                          GST Compliant
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">Seller GSTIN: 29ABCDE1234F1Z5 &bull; HSN: 640411</p>
                      <p className="text-[11px] text-slate-500">Digital Signature: Verified SHA-256 e-Sign</p>
                    </div>
                    <div className="text-right sm:border-l sm:pl-6 border-slate-200 dark:border-slate-800">
                      <div className="text-[11px] text-slate-500">Total Invoice Amount</div>
                      <div className="text-lg font-black font-mono text-slate-900 dark:text-white">₹2,890.00</div>
                      <div className="text-[10px] text-emerald-600 font-medium">Includes 18% IGST (₹440.85)</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs px-1 text-slate-500">
                    <span>Generated automatically upon courier pickup verification</span>
                    <button 
                      onClick={() => navigate("/signup")}
                      className="text-orange-600 dark:text-orange-400 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Download size={12} />
                      <span>Download Sample PDF</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Real-time Dispatch Activity Stream */}
              <div className="mt-5 rounded-2xl p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Activity size={14} className="text-orange-500" />
                    <span>Real-Time Operational Dispatch Stream</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Automated Engine</span>
                </div>
                <div className="space-y-2">
                  {[
                    { title: "GST Invoice #INV-8894 generated & signed", meta: "Order #9842 • 12 sec ago", color: "bg-emerald-500" },
                    { title: "Courier Agent Assigned: Delivery Partner Ravi K.", meta: "Order #9841 • 2 mins ago", color: "bg-blue-500" },
                    { title: "Catalog Matrix updated: 6 Size/Color variants synced", meta: "Inventory Sync • 6 mins ago", color: "bg-orange-500" }
                  ].map((log, i) => (
                    <div key={i} className="flex justify-between items-center text-xs py-1 border-b border-slate-200/50 dark:border-slate-800/50 last:border-0">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full ${log.color}`} />
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">{log.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{log.meta}</span>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          </motion.div>
        </div>

      </section>

      {/* ============================================================ */}
      {/* 4. WHY CARTNOW COMPARISON SECTION                            */}
      {/* ============================================================ */}
      <section id="comparison" className="py-20 px-4 sm:px-6 bg-slate-100/50 dark:bg-slate-950/40 border-y border-slate-200/80 dark:border-slate-800/80 relative z-10 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400 block mb-2">
              Unfair Merchant Advantage
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Why leading brands choose CartNOW
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-normal">
              Compare our merchant-first platform economics against legacy e-commerce marketplaces.
            </p>
          </div>

          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
              
              {/* Legacy Marketplaces Side */}
              <div className="p-6 sm:p-8 bg-slate-50/50 dark:bg-slate-950/50 text-left space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Legacy Marketplaces</span>
                  <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
                    High Hidden Costs
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">
                  Heavy commissions &amp; payment holds
                </h3>
                <ul className="space-y-3 pt-2 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold shrink-0">✕</span>
                    <span><strong>15% to 28% Commission</strong> on every single order</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold shrink-0">✕</span>
                    <span><strong>14 to 21 Days Payment Hold</strong> locking up store cash flow</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold shrink-0">✕</span>
                    <span><strong>Listing fees &amp; penalties</strong> for customer returns and cancellations</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold shrink-0">✕</span>
                    <span><strong>Cumbersome Excel CSV uploads</strong> prone to matrix formatting errors</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold shrink-0">✕</span>
                    <span>Slow automated chatbot ticket replies with 48h+ wait times</span>
                  </li>
                </ul>
              </div>

              {/* CartNOW Side */}
              <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 text-left space-y-4 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Logo variant="icon" className="h-5 w-auto" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400">CartNOW Merchant Central</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Merchant-First Economics
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Flat 3.5% fee &amp; T+1 Bank Payouts
                </h3>
                <ul className="space-y-3 pt-2 text-xs text-slate-700 dark:text-slate-200">
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-500 font-bold shrink-0">✓</span>
                    <span><strong>Flat 3.5% Fee</strong> — you retain 96.5% of your sales volume</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-500 font-bold shrink-0">✓</span>
                    <span><strong>Guaranteed T+1 Bank Transfers</strong> every Tuesday and Friday</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-500 font-bold shrink-0">✓</span>
                    <span><strong>Zero Listing Fees</strong> and no unfair return penalties</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-500 font-bold shrink-0">✓</span>
                    <span><strong>AI Variant Matrix &amp; Monaco JSON</strong> for effortless SKU management</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-500 font-bold shrink-0">✓</span>
                    <span><strong>Dedicated WhatsApp &amp; Phone Desk</strong> with &lt;15 min resolution SLA</span>
                  </li>
                </ul>

                <button
                  onClick={() => navigate("/signup")}
                  className="mt-4 w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-md shadow-orange-600/20 cursor-pointer"
                >
                  Join CartNOW &bull; Keep Your Profits
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. 6 CORE SUPERPOWERS (BENTO GRID)                           */}
      {/* ============================================================ */}
      <section id="features" className="py-20 px-4 sm:px-6 relative z-10 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400 block mb-2">
              Engineered for Marketplace Dominance
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Every tool to build, manage, and scale
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-normal">
              Eliminate technical friction. CartNOW automates inventory matrix calculations, courier routing, and taxation compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Boxes,
                title: "Smart AI Catalog & Matrix",
                desc: "Generate full product variations, colors, sizes, and pricing matrix with one click or edit raw data directly via Monaco JSON.",
                color: "text-orange-500",
                bg: "bg-orange-500/10",
                tag: "AI Matrix"
              },
              {
                icon: BadgePercent,
                title: "Next-Day T+1 Bank Payouts",
                desc: "Direct-to-bank settlements every Tuesday and Friday with zero delays, 0% platform lockups, and instant UPI reconciliation.",
                color: "text-emerald-500",
                bg: "bg-emerald-500/10",
                tag: "Fast Settlement"
              },
              {
                icon: Truck,
                title: "Automated Logistics Dispatch",
                desc: "Integrated courier network picks up packages straight from your store. Automated doorstep pickup and live customer GPS tracking.",
                color: "text-blue-500",
                bg: "bg-blue-500/10",
                tag: "Doorstep Pickup"
              },
              {
                icon: FileText,
                title: "Automated GST Invoicing",
                desc: "Generate compliant, signed PDF invoices automatically with dynamic tax breakdowns, HSN coding, and seller digital signatures.",
                color: "text-indigo-500",
                bg: "bg-indigo-500/10",
                tag: "GST Compliant"
              },
              {
                icon: BarChart3,
                title: "Real-Time Revenue Analytics",
                desc: "Track sales velocity, customer cohorts, returns metrics, and top-selling SKUs through modern responsive charts.",
                color: "text-amber-500",
                bg: "bg-amber-500/10",
                tag: "Live Insights"
              },
              {
                icon: Headphones,
                title: "Dedicated Merchant Desk",
                desc: "Direct access to merchant support engineers via phone and WhatsApp with verified sub-15 minute average resolution time.",
                color: "text-rose-500",
                bg: "bg-rose-500/10",
                tag: "24/7 Concierge"
              }
            ].map((f, idx) => {
              const Icon = f.icon;
              return (
                <div 
                  key={idx}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-orange-400 dark:hover:border-orange-500/50 transition-all shadow-xs hover:shadow-md text-left relative"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className={`h-11 w-11 rounded-2xl ${f.bg} ${f.color} flex items-center justify-center`}>
                      <Icon size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{f.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. INTERACTIVE PROFIT & SAVINGS CALCULATOR                   */}
      {/* ============================================================ */}
      <section id="calculator" className="py-20 px-4 sm:px-6 relative max-w-5xl mx-auto z-10 scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 items-center">
          
          <div className="text-left space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400 block">
              Transparent Merchant Economics
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Simple 3.5% fee.{" "}
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                Keep your hard-earned profits.
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              You only pay a simple 3.5% transaction processing fee when an order is completed. We don't charge subscription fees, listing costs, or monthly gateway retainers.
            </p>

            {/* Quick Profile Presets */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Quick Merchant Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset(120, 950)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-600 transition cursor-pointer"
                >
                  🌱 Startup Store (120 orders)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(650, 1800)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-600 transition cursor-pointer"
                >
                  🚀 Growth Brand (650 orders)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(2400, 3200)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-600 transition cursor-pointer"
                >
                  💎 Power Merchant (2,400 orders)
                </button>
              </div>
            </div>

            <ul className="space-y-3 pt-3">
              {[
                "Unlimited product listings and multi-variant combinations",
                "Instant payout settlement with zero minimum threshold",
                "Automated delivery courier pickup from your location",
                "Free cloud catalog hosting with 99.98% uptime SLA"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={2.5} />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Calculator Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden text-left">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <Percent size={16} className="text-orange-500" />
                <span>Monthly Payout &amp; Savings Calculator</span>
              </div>
              <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2.5 py-0.5 rounded-full border border-orange-200 dark:border-orange-800/40">
                3.5% Flat
              </span>
            </div>

            {/* Monthly Orders Slider */}
            <div className="space-y-2 mb-5">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Estimated Monthly Orders</span>
                <span className="text-orange-600 dark:text-orange-400 font-mono font-bold text-sm">{monthlyOrders} orders</span>
              </div>
              <input
                type="range"
                min="50"
                max="5000"
                step="25"
                value={monthlyOrders}
                onChange={(e) => setMonthlyOrders(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            {/* Average Order Value Slider */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Average Order Value (₹ INR)</span>
                <span className="text-orange-600 dark:text-orange-400 font-mono font-bold text-sm">₹{avgOrderVal.toLocaleString("en-IN")}</span>
              </div>
              <input
                type="range"
                min="200"
                max="15000"
                step="50"
                value={avgOrderVal}
                onChange={(e) => setAvgOrderVal(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            {/* Summary Breakdown Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Gross Monthly GMV</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                  <AnimatedCounter value={estimatedRevenue} prefix="₹" />
                </span>
              </div>

              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>CartNOW Fee (3.5%)</span>
                <span className="font-bold text-rose-500 dark:text-rose-400 font-mono">
                  <AnimatedCounter value={cartnowFee} prefix="-₹" decimalPlaces={2} />
                </span>
              </div>

              <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl font-bold">
                <span>Monthly Savings vs Other Marketplaces (18%)</span>
                <span className="font-mono">
                  +<AnimatedCounter value={monthlySavings} prefix="₹" decimalPlaces={0} />
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-white block">
                    Your Net Bank Payout
                  </span>
                  <span className="text-[10px] text-slate-400">Transferred T+1 via IMPS/NEFT</span>
                </div>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  <AnimatedCounter value={netEarnings} prefix="₹" decimalPlaces={2} />
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate("/signup")}
              className="mt-5 w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-md shadow-orange-600/20 cursor-pointer"
            >
              Lock In This 3.5% Rate &bull; Apply Now
            </button>

          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. MERCHANT TESTIMONIALS & SUCCESS STORIES                   */}
      {/* ============================================================ */}
      <section className="py-20 px-4 sm:px-6 bg-slate-100/50 dark:bg-slate-950/40 border-y border-slate-200/80 dark:border-slate-800/80 relative z-10 text-center">
        <div className="max-w-6xl mx-auto">
          
          <div className="max-w-xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400 block mb-1.5">
              Verified Partner Stories
            </span>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Trusted by 50,000+ Indian Brands
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              From local craft artisans to high-velocity D2C power sellers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              {
                store: "The Loom Collective",
                city: "Jaipur, Rajasthan",
                category: "Handloom Fashion & Textiles",
                quote: "CartNOW's variant matrix made listing 400+ saree and kurta variations effortless. Our monthly revenue tripled in just 90 days.",
                metric: "+340% GMV Growth",
                author: "Ananya Rathore",
                role: "Founder & Creative Director"
              },
              {
                store: "Apex Sound & Audio",
                city: "Bengaluru, Karnataka",
                category: "Consumer Electronics",
                quote: "The T+1 payout schedule completely solved our working capital crunch. We never have funds locked up for weeks like on other platforms.",
                metric: "₹42 Lakhs+ Monthly Volume",
                author: "Karthik Nambiar",
                role: "Managing Director"
              },
              {
                store: "PureRoots Botanicals",
                city: "Mumbai, Maharashtra",
                category: "Organic Skincare",
                quote: "Automated doorstep courier pickup saves our warehouse crew 3 hours every day. The delivery partner arrives within 45 mins of marking packed.",
                metric: "99.4% On-Time SLA",
                author: "Dr. Shalini Mehta",
                role: "Co-Founder & Formulator"
              }
            ].map((story, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-0.5 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} fill="currentColor" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                      {story.metric}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic mb-5">
                    "{story.quote}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="font-bold text-slate-900 dark:text-white text-xs">{story.author}</div>
                  <div className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold">{story.store} &bull; {story.city}</div>
                  <div className="text-[10px] text-slate-400">{story.role} &bull; {story.category}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. HOW IT WORKS 3-STEP ROADMAP                               */}
      {/* ============================================================ */}
      <section id="roadmap" className="py-20 px-4 sm:px-6 relative z-10 text-center scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          
          <div className="max-w-xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400 block mb-1.5">
              Frictionless Onboarding
            </span>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Launch in three simple steps
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Start accepting orders within 24 hours with zero technical setup.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              {
                step: "01",
                title: "Register Shop Profile",
                desc: "Fill in your store details, phone number, and bank account for automated payouts.",
                icon: Store,
                badge: "2 Minutes"
              },
              {
                step: "02",
                title: "Publish Products & Matrix",
                desc: "Upload photos, set prices and inventory counts with our automated variant matrix generator.",
                icon: Boxes,
                badge: "AI Powered"
              },
              {
                step: "03",
                title: "Fulfill Orders & Get Paid",
                desc: "Package orders for our doorstep courier pickup and receive automated next-day bank transfers.",
                icon: TrendingUp,
                badge: "T+1 Payouts"
              }
            ].map((s, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs relative"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="text-4xl font-black text-orange-500/20">{s.step}</div>
                  <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-md">
                    {s.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{s.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 9. FREQUENTLY ASKED QUESTIONS (FAQ)                          */}
      {/* ============================================================ */}
      <section id="faq" className="py-20 px-4 sm:px-6 max-w-4xl mx-auto z-10 relative scroll-mt-20">
        <div className="text-center mb-10">
          <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400 block mb-1.5">
            Got Questions?
          </span>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            Everything you need to know about partnering with CartNOW.
          </p>
        </div>

        {/* FAQ Category Filter Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {[
            { id: "all", label: "All Questions" },
            { id: "payouts", label: "Payouts & Transfers" },
            { id: "fees", label: "Commissions & Fees" },
            { id: "shipping", label: "Courier Logistics" },
            { id: "catalog", label: "Catalog & Matrix" },
            { id: "invoicing", label: "GST & Tax Invoices" },
            { id: "returns", label: "Returns Policy" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setActiveFaqCategory(cat.id); setActiveFaq(0); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeFaqCategory === cat.id
                  ? "bg-orange-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-orange-400"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => (
            <div 
              key={idx}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm font-bold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
              >
                <span>{faq.q}</span>
                <ChevronDown 
                  size={16} 
                  className={`text-slate-400 transition-transform duration-200 shrink-0 ${activeFaq === idx ? "rotate-180 text-orange-500" : ""}`} 
                />
              </button>

              <AnimatePresence initial={false}>
                {activeFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 10. BOTTOM CTA CALLOUT BANNER                                */}
      {/* ============================================================ */}
      <section className="py-14 px-4 sm:px-6 relative z-10">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 p-8 sm:p-14 text-white text-center shadow-xl shadow-orange-600/20 relative overflow-hidden">
          
          {/* Ambient Glow Circles */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-extrabold uppercase tracking-wider inline-block">
              Zero Upfront Risk &bull; Instant Storefront Approval
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Ready to scale your e-commerce storefront?
            </h2>
            <p className="text-xs sm:text-sm text-orange-100 leading-relaxed max-w-xl mx-auto">
              Start listing your products today. Free registration, flat 3.5% fee, automated doorstep courier pickup, and dedicated onboarding concierge.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate("/signup")}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-orange-600 hover:bg-orange-50 font-extrabold text-xs uppercase tracking-wider transition shadow-md cursor-pointer active:scale-98"
              >
                Apply for Shop Account
              </button>
              <button
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-orange-800/60 hover:bg-orange-800 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-white/20 active:scale-98"
              >
                Merchant Sign In
              </button>
            </div>

            <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-orange-100/90 font-medium">
              <span>✓ No credit card required</span>
              <span>✓ 0% listing fee</span>
              <span>✓ Instant store setup</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 11. PROFESSIONAL FOOTER                                      */}
      {/* ============================================================ */}
      <footer className="relative z-10 w-full py-12 px-6 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 text-left">
          
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <Logo className="h-7 w-auto" />
            </div>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              India's high-velocity e-commerce merchant platform. Automated fulfillment, catalog variant matrices, and next-day bank transfers.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational &bull; 99.98% SLA</span>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-2.5">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">Platform</div>
            <ul className="space-y-2">
              <li>
                <button onClick={() => scrollToSection("features")} className="hover:text-orange-600 dark:hover:text-orange-400 transition cursor-pointer">
                  AI Variant Matrix
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("command-center")} className="hover:text-orange-600 dark:hover:text-orange-400 transition cursor-pointer">
                  Command Center Sandbox
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("calculator")} className="hover:text-orange-600 dark:hover:text-orange-400 transition cursor-pointer">
                  Earnings &amp; Fee Calculator
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("comparison")} className="hover:text-orange-600 dark:hover:text-orange-400 transition cursor-pointer">
                  Why CartNOW vs Others
                </button>
              </li>
            </ul>
          </div>

          {/* Logistics & Support */}
          <div className="space-y-2.5">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">Merchant Support</div>
            <ul className="space-y-2">
              <li>
                <Link to="/login" className="hover:text-orange-600 dark:hover:text-orange-400 transition">
                  Merchant Portal Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-orange-600 dark:hover:text-orange-400 transition">
                  Apply for Partner Store
                </Link>
              </li>
              <li>
                <a href="mailto:seller-support@cartnow.com" className="hover:text-orange-600 dark:hover:text-orange-400 transition">
                  seller-support@cartnow.com
                </a>
              </li>
              <li>
                <span className="text-[11px] text-slate-400">Merchant Toll-Free: 1800-CART-NOW</span>
              </li>
            </ul>
          </div>

          {/* Security & Compliance */}
          <div className="space-y-2.5">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">Trust &amp; Legal</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              CartNOW Technologies Inc. operates in compliance with RBI e-commerce settlement guidelines and GST rules. All merchant payout transfers are processed via secure 256-bit encrypted banking conduits.
            </p>
            <div className="text-[10px] text-slate-400">
              ISO 27001 Certified &bull; PCI-DSS Level 1 &bull; GSTIN Verified
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>&copy; {new Date().getFullYear()} CartNOW Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <span className="hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer">Merchant Code of Conduct</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
