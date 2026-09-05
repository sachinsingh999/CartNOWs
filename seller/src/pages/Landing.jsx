import React, { useState, useEffect, useRef } from "react";
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

// Number Counter Utility Component
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
      ease: [0.16, 1, 0.3, 1], // easeOutExpo
      onUpdate: (latest) => {
        setDisplayValue(latest);
      }
    });
    return () => controls.stop();
  }, [value, motionValue, shouldReduceMotion]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString(undefined, {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces
      })}
      {suffix}
    </span>
  );
};


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

  // Animation Refs & Hooks
  const shouldReduceMotion = useReducedMotion();
  const { scrollY, scrollYProgress } = useScroll();

  // Scroll Progress and Parallax Blobs
  const blobY1 = useTransform(scrollY, [0, 1000], [0, -120]);
  const blobY2 = useTransform(scrollY, [0, 1000], [0, 120]);
  const blobY3 = useTransform(scrollY, [0, 1000], [0, -60]);

  const smoothBlobY1 = useSpring(blobY1, { stiffness: 80, damping: 25 });
  const smoothBlobY2 = useSpring(blobY2, { stiffness: 80, damping: 25 });
  const smoothBlobY3 = useSpring(blobY3, { stiffness: 80, damping: 25 });

  // Header Scroll Transitions
  const headerBg = useTransform(
    scrollY,
    [0, 80],
    ["rgba(2, 6, 23, 0)", "rgba(2, 6, 23, 0.75)"]
  );
  const headerBorder = useTransform(
    scrollY,
    [0, 80],
    ["rgba(15, 23, 42, 0)", "rgba(15, 23, 42, 0.8)"]
  );
  const headerBlur = useTransform(
    scrollY,
    [0, 80],
    ["blur(0px)", "blur(12px)"]
  );
  const logoScale = useTransform(scrollY, [0, 80], [1.0, 0.93]);
  const logoSpringScale = useSpring(logoScale, { stiffness: 300, damping: 30 });

  // Hero Dashboard Mockup 3D Tilt Hook
  const mockupRef = useRef(null);
  const mX = useMotionValue(0.5);
  const mY = useMotionValue(0.5);
  const tiltX = useSpring(useTransform(mY, [0, 1], [6, -6]), { stiffness: 150, damping: 25 });
  const tiltY = useSpring(useTransform(mX, [0, 1], [-6, 6]), { stiffness: 150, damping: 25 });

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

  // Interactive Calculator Slider Entry Animation
  const calcRef = useRef(null);
  const isCalcInView = useInView(calcRef, { once: true, amount: 0.3 });
  const [hasAnimatedCalc, setHasAnimatedCalc] = useState(false);

  useEffect(() => {
    if (isCalcInView && !hasAnimatedCalc && !shouldReduceMotion) {
      setHasAnimatedCalc(true);
      const ordersAnim = animate(50, 250, {
        duration: 1.5,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (latest) => setMonthlyOrders(Math.round(latest))
      });
      const valAnim = animate(10, 45, {
        duration: 1.5,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (latest) => setAvgOrderVal(Math.round(latest))
      });
      return () => {
        ordersAnim.stop();
        valAnim.stop();
      };
    }
  }, [isCalcInView, hasAnimatedCalc, shouldReduceMotion]);

  // Roadmap Progress Line linked to scrolling
  const roadmapRef = useRef(null);
  const { scrollYProgress: roadmapScrollProgress } = useScroll({
    target: roadmapRef,
    offset: ["start end", "end center"]
  });
  const smoothRoadmapProgress = useSpring(roadmapScrollProgress, { stiffness: 100, damping: 30 });

  // Variants
  const headlineContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const headlineWord = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const listContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.15 }
    }
  };

  const itemFadeUp = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const cardScaleUp = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 35, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const rowSlideIn = {
    hidden: { opacity: 0, x: shouldReduceMotion ? 0 : -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-orange-500 selection:text-white relative overflow-hidden">
      
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 z-[100] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Background blobs */}
      <motion.div 
        style={{ y: smoothBlobY1 }}
        className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none" 
      />
      <motion.div 
        style={{ y: smoothBlobY2 }}
        className="absolute bottom-[-10%] right-[-10%] h-[550px] w-[550px] rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none" 
      />
      <motion.div 
        style={{ y: smoothBlobY3 }}
        className="absolute top-[40%] right-[10%] h-[400px] w-[400px] rounded-full bg-amber-600/5 blur-[100px] pointer-events-none" 
      />

      {/* Header */}
      <motion.header 
        style={{
          backgroundColor: headerBg,
          backdropFilter: headerBlur,
          WebkitBackdropFilter: headerBlur,
        }}
        className="sticky top-0 z-50 px-6 py-4 transition-colors duration-200 shadow-2xs"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo Brand */}
          <motion.div 
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <Logo className="h-9 sm:h-10 w-32 sm:w-36 text-slate-100 dark:text-white group-hover:scale-105 transition-transform duration-200" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-4"
          >
            <button 
              onClick={() => navigate("/login")}
              className="text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white px-4 py-2.5 rounded-xl transition duration-200"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate("/signup")}
              className="bg-orange-600 hover:bg-orange-700 text-slate-100 dark:text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl transition-all duration-300 shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 active:scale-98 cursor-pointer"
            >
              Start Free Trial
            </button>
          </motion.div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 relative max-w-7xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 text-orange-400 text-xs font-extrabold uppercase tracking-wider mb-6 animate-pulse"
        >
          <Store size={12} />
          <span>Empowering 10,000+ Merchants</span>
        </motion.div>
        
        <motion.h1 
          variants={headlineContainer}
          initial="hidden"
          animate="visible"
          className="text-4xl sm:text-6xl font-black tracking-tight text-slate-100 dark:text-white max-w-4xl mx-auto leading-[1.1]"
        >
          {"Grow your online business with ".split(" ").map((word, i) => (
            <motion.span key={i} variants={headlineWord} className="inline-block mr-[0.25em]">{word}</motion.span>
          ))}
          <motion.span 
            variants={headlineWord}
            className="inline-block bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent"
          >
            CartNOW Merchant Hub
          </motion.span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed"
        >
          The all-in-one backend to showcase products, analyze performance, manage live inventory, and generate digital invoices seamlessly.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button 
            onClick={() => navigate("/signup")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-slate-100 dark:text-white font-black uppercase tracking-wider px-8 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/25 active:scale-98 cursor-pointer"
          >
            <span>Create Seller Account</span>
            <ArrowRight size={16} />
          </button>
          <a
            href="#calculator"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900/50 hover:bg-slate-900/80 text-slate-300 hover:text-white font-bold px-8 py-4 rounded-xl transition duration-300 shadow-xs"
          >
            <span>Calculate Fees</span>
          </a>
        </motion.div>

        {/* Dashboard Preview Mockup */}
        <motion.div 
          ref={mockupRef}
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 80, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 max-w-5xl mx-auto perspective-[1200px]"
        >
          <motion.div 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              rotateX: shouldReduceMotion ? 0 : tiltX,
              rotateY: shouldReduceMotion ? 0 : tiltY,
              transformStyle: "preserve-3d",
            }}
            className="relative rounded-2xl bg-slate-900/40 p-4 md:p-6 shadow-2xl backdrop-blur-sm overflow-hidden group cursor-default"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none" />
            <div className="flex items-center gap-2 pb-4 mb-6">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-xs text-slate-500 font-bold ml-2">CartNOW Merchant Console</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left relative z-0">
              <div className="p-5 rounded-xl bg-slate-900/30 shadow-xs">
                <div className="flex items-center justify-between mb-3 text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Revenue</span>
                  <TrendingUp size={16} className="text-emerald-500" />
                </div>
                <div className="text-2xl font-black text-slate-100 dark:text-white">
                  <AnimatedCounter value={24850} prefix="$" decimalPlaces={2} />
                </div>
                <div className="text-[10px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
                  <span>↑ +12.4%</span>
                  <span className="text-slate-500 font-normal">from last month</span>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/30 shadow-xs">
                <div className="flex items-center justify-between mb-3 text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
                  <ShoppingBag size={16} className="text-orange-500" />
                </div>
                <div className="text-2xl font-black text-slate-100 dark:text-white">
                  <AnimatedCounter value={412} suffix=" Orders" />
                </div>
                <div className="text-[10px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
                  <span>↑ +8.2%</span>
                  <span className="text-slate-500 font-normal">this week</span>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/30 shadow-xs">
                <div className="flex items-center justify-between mb-3 text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Platform Rating</span>
                  <div className="flex gap-0.5 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill="currentColor" />
                    ))}
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-100 dark:text-white">
                  <AnimatedCounter value={4.92} decimalPlaces={2} suffix=" / 5.00" />
                </div>
                <div className="text-[10px] text-slate-400 font-bold mt-1">
                  Based on 2.4k customer reviews
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl p-4 bg-slate-950/40 text-left shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-slate-100 dark:text-white">Live Operations Feed</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <motion.div 
                variants={listContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-3"
              >
                {[
                  { title: "Invoice generated successfully", meta: "Order #2985 • Just now", type: "success" },
                  { title: "Assigned Delivery Agent #482", meta: "Order #2980 • 5 mins ago", type: "info" },
                  { title: "Product 'Summer Linen Dress' stock running low (2 left)", meta: "Inventory Alert • 1 hour ago", type: "warning" }
                ].map((log, i) => (
                  <motion.div 
                    key={i} 
                    variants={rowSlideIn}
                    className="flex justify-between items-center text-xs py-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${ log.type === "success" ? "bg-emerald-500" : log.type === "warning" ? "bg-amber-500" : "bg-blue-500" }`} />
                      <span className="font-semibold text-slate-300">{log.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold">{log.meta}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Grid Section */}
      <section className="py-24 px-6 bg-slate-950/20 relative z-20">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100 dark:text-white">
              Everything you need to sell online
            </h2>
            <p className="mt-4 text-slate-400 font-light">
              Built on enterprise-grade infrastructure to let you focus purely on creating and selling great products.
            </p>
          </motion.div>

          <motion.div 
            variants={listContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
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
                <motion.div 
                  key={idx} 
                  variants={cardScaleUp}
                  whileHover="hover"
                  style={{ transformStyle: "preserve-3d" }}
                  className="p-6 rounded-2xl bg-slate-900/30 hover:bg-slate-900/60 transition-colors duration-300 group cursor-default shadow-xs"
                >
                  <motion.div 
                    variants={{
                      hover: { rotate: shouldReduceMotion ? 0 : 5, scale: 1.1 }
                    }}
                    className={`h-11 w-11 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-5 transition-transform duration-300`}
                  >
                    <Icon size={20} />
                  </motion.div>
                  <h3 className="text-base font-black text-slate-100 dark:text-white">{feature.title}</h3>
                  <p className="mt-3 text-xs leading-relaxed text-slate-400 font-light">
                    {feature.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Interactive Calculator Section */}
      <section id="calculator" ref={calcRef} className="py-24 px-6 relative max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -45 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="text-left"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100 dark:text-white leading-tight">
              Simple pricing. <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">No surprises.</span>
            </h2>
            <p className="mt-4 text-sm text-slate-400 font-light leading-relaxed">
              We align our success directly with yours. No subscription fees, no dynamic pricing tiers, no contract locked limits. You only pay a flat 3.5% processing fee when you make a sale.
            </p>

            <motion.ul 
              variants={listContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mt-8 space-y-4"
            >
              {[
                "Unlimited product listings and variations",
                "Complimentary hosting on Vercel Edge Server",
                "Instant payout setup with no minimum threshold",
                "Fully responsive customer support line"
              ].map((item, i) => (
                <motion.li 
                  key={i} 
                  variants={itemFadeUp}
                  className="flex items-center gap-3 text-xs text-slate-300 font-bold"
                >
                  <span className="flex-shrink-0 h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">✓</span>
                  <span>{item}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Calculator Card */}
          <motion.div 
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 45 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 shadow-xl backdrop-blur-sm relative overflow-hidden text-left"
          >
            <div className="absolute top-0 right-0 h-28 w-28 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-lg font-black text-slate-100 dark:text-white mb-6 flex items-center gap-2">
              <Percent size={18} className="text-orange-500" />
              <span>Earnings Estimator</span>
            </h3>

            {/* Monthly Orders Slider */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300">
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
              <div className="flex justify-between items-center text-xs font-bold text-slate-300">
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
            <motion.div 
              variants={listContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-4 pt-6"
            >
              <motion.div variants={itemFadeUp} className="flex justify-between text-xs text-slate-400">
                <span>Estimated Monthly Revenue</span>
                <span className="font-bold text-slate-200">
                  <AnimatedCounter value={estimatedRevenue} prefix="$" />
                </span>
              </motion.div>
              <motion.div variants={itemFadeUp} className="flex justify-between text-xs text-slate-400">
                <span>Platform Commission (3.5%)</span>
                <span className="font-bold text-red-400">
                  <AnimatedCounter value={platformFee} prefix="-$" decimalPlaces={2} />
                </span>
              </motion.div>
              <motion.div variants={itemFadeUp} className="flex justify-between items-center pt-3">
                <span className="text-sm font-black text-slate-100 dark:text-white">Your Net Payout</span>
                <span className="text-xl font-black text-emerald-400">
                  <AnimatedCounter value={netEarnings} prefix="$" decimalPlaces={2} />
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stepper Roadmap Section */}
      <section ref={roadmapRef} className="py-24 px-6 bg-slate-950/10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100 dark:text-white">
              Launch your shop in minutes
            </h2>
            <p className="mt-4 text-slate-400 font-light">
              No technical or coding setup required. We provide all tools out of the box.
            </p>
          </motion.div>

          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-[52px] left-[15%] right-[15%] h-[2px] bg-slate-900 z-0">
              <motion.div
                style={{ scaleX: shouldReduceMotion ? 0 : smoothRoadmapProgress, transformOrigin: "left" }}
                className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 w-full"
              />
            </div>

            {/* Connecting Line (Mobile) */}
            <div className="block md:hidden absolute left-1/2 top-12 bottom-12 w-[2px] bg-slate-900 -translate-x-1/2 z-0">
              <motion.div
                style={{ scaleY: shouldReduceMotion ? 0 : smoothRoadmapProgress, transformOrigin: "top" }}
                className="w-full bg-gradient-to-b from-orange-500 via-amber-500 to-yellow-500 h-full"
              />
            </div>

            <motion.div 
              variants={listContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10"
            >
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
                <motion.div 
                  key={i} 
                  variants={cardScaleUp}
                  className="flex flex-col items-center md:items-start text-center md:text-left relative p-6 rounded-2xl bg-slate-900/20 backdrop-blur-sm shadow-xs"
                >
                  <motion.span 
                    initial={{ scale: 0.7 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 200, delay: i * 0.15 }}
                    className="text-5xl font-black text-orange-500/25 select-none inline-block"
                  >
                    {step.step}
                  </motion.span>
                  <h3 className="text-lg font-black text-slate-100 dark:text-white mt-4">{step.title}</h3>
                  <p className="mt-3 text-xs leading-relaxed text-slate-400 font-light">
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-extrabold text-center text-slate-100 dark:text-white mb-12"
        >
          Frequently Asked Questions
        </motion.h2>
        <motion.div 
          variants={listContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-4"
        >
          {faqs.map((faq, idx) => (
            <motion.div 
              key={idx} 
              variants={itemFadeUp}
              className="rounded-2xl bg-slate-900/30 overflow-hidden shadow-xs transition-colors duration-200"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-slate-100 dark:text-white transition hover:bg-slate-900/50 cursor-pointer"
              >
                <span>{faq.q}</span>
                <motion.div
                  animate={{ rotate: activeFaq === idx ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="text-slate-400"
                >
                  <ChevronDown size={16} />
                </motion.div>
              </button>
              
              <AnimatePresence initial={false}>
                {activeFaq === idx && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 text-xs leading-relaxed text-slate-400 font-light">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Footer / Portal switcher */}
      <motion.footer 
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-slate-950/80 py-16 px-6 relative z-10 text-center shadow-xs"
      >
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
          
          <div className="flex items-center justify-center">
            <Logo className="h-9 sm:h-10 w-32 sm:w-36 text-slate-100 dark:text-white" />
          </div>

          <p className="text-xs text-slate-500 max-w-md">
            CartNOW Inc. All rights reserved. Registered under standard online merchant licensing guidelines.
          </p>

          <div className="pt-6 w-full max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              Explore CartNOW Platforms
            </p>
            <motion.div 
              variants={listContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex flex-wrap justify-center gap-4"
            >
              <motion.a 
                variants={itemFadeUp}
                href="https://cartnow-seller.vercel.app" 
                className="text-xs font-bold text-slate-400 hover:text-orange-500 transition"
              >
                Seller Hub
              </motion.a>
              <motion.span variants={itemFadeUp} className="text-slate-700 select-none">•</motion.span>
              <motion.a 
                variants={itemFadeUp}
                href="https://cart-now-deliveryagent.vercel.app/" 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs font-bold text-slate-400 hover:text-blue-500 transition"
              >
                Delivery Courier Portal
              </motion.a>
            </motion.div>
          </div>

        </div>
      </motion.footer>

    </div>
  );
};

export default Landing;
