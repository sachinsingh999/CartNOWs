import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import aboutHeroIllustration from "../assets/about_hero_illustration.png";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ShoppingBag, 
  ArrowRight, 
  Truck, 
  ShieldCheck, 
  CreditCard, 
  Star, 
  MapPin, 
  MessageSquare, 
  RotateCcw, 
  Gift, 
  Zap, 
  Search, 
  Sliders, 
  Ticket, 
  Layout, 
  ShieldAlert, 
  Cpu, 
  Award, 
  Users, 
  Database, 
  Globe, 
  Lock, 
  Mail, 
  Phone, 
  Clock, 
  Send, 
  Sparkles, 
  Check,
  Code,
  Heart,
  X
} from "lucide-react";

// Helper components for scroll animations
const FadeInWhenVisible = ({ children, delay = 0, y = 30 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
};

const outfitDemo = [
  { image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop", name: "Classic Casual Shirt", price: "₹ 999.00", category: "Men's Wear" },
  { image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=300&auto=format&fit=crop", name: "Floral Summer Dress", price: "₹ 1,624.00", category: "Women's Wear" },
  { image: "https://images.unsplash.com/photo-1496345875659-11f7dd282d1d?q=80&w=300&auto=format&fit=crop", name: "Modern Denim Jeans", price: "₹ 1,299.00", category: "Unisex Fashion" }
];

const About = () => {
  // Testimonials state
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  
  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState(null);

  // AI Outfit swapper state
  const [outfitIdx, setOutfitIdx] = useState(0);
  const [scanPulse, setScanPulse] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setScanPulse(true);
      setTimeout(() => {
        setOutfitIdx((prev) => (prev + 1) % outfitDemo.length);
      }, 700);
      setTimeout(() => {
        setScanPulse(false);
      }, 1400);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Auto-slide testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handlePrevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300 overflow-hidden relative">
      
      {/* Background Animated Blobs */}
      <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-indigo-400/10 dark:bg-indigo-650/5 rounded-full blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-purple-400/10 dark:bg-purple-650/5 rounded-full blur-[120px] pointer-events-none" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-1/4 left-10 w-[350px] h-[350px] bg-emerald-400/10 dark:bg-emerald-650/5 rounded-full blur-[90px] pointer-events-none" />

      {/* ──────────────────────────────────────────────────────────
          SECTION 1 — HERO
          ────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-wider"
            >
              <Sparkles size={13} className="animate-pulse" />
              <span>Next-Gen E-Commerce</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white"
            >
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                CartNow
              </span>
            </motion.h1>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl sm:text-2xl font-black text-slate-700 dark:text-slate-300"
            >
              Fast. Secure. Smart Shopping Experience.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-semibold max-w-xl"
            >
              CartNow is a modern MERN Stack e-commerce platform that delivers a fast, secure, and seamless shopping experience for customers while providing powerful tools for sellers and administrators.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <Link
                to="/product"
                className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-lg shadow-indigo-500/20 dark:shadow-indigo-900/40 flex items-center gap-2 group border-none"
              >
                <span>Shop Now</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#our-story"
                className="px-8 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-xs"
              >
                Learn More
              </a>
            </motion.div>
          </div>

          {/* Right Visual Column (Premium Layered E-Commerce Artwork Illustration) */}
          <div className="lg:col-span-6 relative w-full aspect-square max-w-[480px] flex items-center justify-center select-none">
            
            {/* Background glowing rings */}
            <div className="absolute w-[90%] h-[90%] rounded-full bg-indigo-500/5 dark:bg-indigo-650/5 border border-indigo-500/10 dark:border-indigo-500/5 animate-pulse z-0" />
            
            {/* Central Element: E-Commerce Visual Card */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="w-[85%] aspect-square bg-gradient-to-tr from-white to-slate-50 dark:from-slate-900 dark:to-slate-850 rounded-[40px] border border-slate-200/50 dark:border-slate-800 shadow-2xl flex items-center justify-center p-2 relative z-10 overflow-hidden"
            >
              <img 
                src={aboutHeroIllustration} 
                alt="CartNow Premium Shopping Illustration" 
                className="w-full h-full object-cover rounded-[32px]"
              />

              {/* Glowing label overlay inside the central card */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-650/90 backdrop-blur-md text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-md">
                Fast. Secure. Smart.
              </div>
            </motion.div>

            {/* Floating Card 1: Vibrant Glassmorphic credit card */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute top-[6%] -left-[4%] bg-gradient-to-br from-indigo-500/95 to-purple-650/95 backdrop-blur-md rounded-2xl p-4 shadow-xl w-36 aspect-[1.58/1] text-left border border-white/20 z-20"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-[7px] tracking-widest text-white/70 uppercase font-black font-semibold">Secure Checkout</span>
                <Lock size={10} className="text-white/80" />
              </div>
              <div className="space-y-1 mt-2">
                <span className="text-[7px] text-white/50 block font-bold">CARD NUMBER</span>
                <span className="text-[10px] font-black text-white tracking-widest block font-semibold">•••• •••• •••• 9840</span>
              </div>
            </motion.div>

            {/* Floating Card 2: AI Try-on fitting badge */}
            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }}
              className="absolute bottom-[6%] -left-[2%] bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-200/50 dark:border-slate-800 rounded-2xl p-3 shadow-lg flex items-center gap-2.5 z-20 cursor-pointer"
            >
              <div className="h-8 w-8 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div className="text-left">
                <h4 className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Scanning Sizing</h4>
                <p className="text-[10px] font-black text-slate-900 dark:text-white mt-0.5">Fit Match 99.4% [OK]</p>
              </div>
            </motion.div>

            {/* Floating Card 3: Wishlist Heart Bubble */}
            <motion.div
              animate={{ y: [0, -18, 0], scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 4.8, ease: "easeInOut" }}
              className="absolute top-[8%] -right-[2%] bg-gradient-to-tr from-pink-500 to-rose-500 rounded-full h-11 w-11 flex items-center justify-center shadow-lg border border-white/20 z-20"
            >
              <Heart size={16} className="text-white fill-white" />
            </motion.div>

            {/* Floating Card 4: Discount Badge overlay */}
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut" }}
              className="absolute bottom-[8%] -right-[2%] bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl px-4 py-2.5 shadow-xl border border-white/10 z-20 text-center"
            >
              <span className="text-[8px] font-black uppercase tracking-wider block text-white/80">Special Deal</span>
              <span className="text-[13px] font-black tracking-tighter block mt-0.5">50% OFF</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 2 — OUR STORY
          ────────────────────────────────────────────────────────── */}
      <section id="our-story" className="py-24 px-6 max-w-5xl mx-auto text-center">
        <FadeInWhenVisible>
          <div className="text-center mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-500">Platform Journey</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-1 text-slate-900 dark:text-white">Our Story</h2>
          </div>

          <div className="relative bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-slate-850 rounded-[32px] p-8 md:p-12 shadow-xl text-left overflow-hidden select-none">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative z-10">
              {/* Left Column: Visual Tech Terminal Widget */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 shadow-lg font-mono text-[11px] text-indigo-400 space-y-2 relative overflow-hidden select-none min-h-[260px] flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-2 text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                    <span>CartNow Platform DevLog</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> live</span>
                  </div>
                  <div className="space-y-1.5 flex-1 leading-normal">
                    <p className="text-slate-505"># Initializing stack deployment...</p>
                    <p className="text-slate-100"><span className="text-indigo-500">$</span> git init cartnow-platform</p>
                    <p className="text-slate-400">&gt; Setup React + Express controllers ... [DONE]</p>
                    <p className="text-slate-400">&gt; Encrypt authentication with bcrypt & JWT ... [SECURE]</p>
                    <p className="text-slate-400">&gt; Mount Cloudinary media delivery networks ... [OK]</p>
                    <p className="text-emerald-400">&gt; Integrate Stripe & Razorpay payment sandbox ... [ACTIVE]</p>
                    <p className="text-[#a5a9ff] font-bold">&gt; Deploy AI Try-On face-mapping module ... [READY]</p>
                  </div>
                  <div className="border-t border-slate-900 pt-2.5 text-slate-500 text-[9px] flex justify-between">
                    <span>Active Version: v2.4.0</span>
                    <span>Load: 0.04ms</span>
                  </div>
                </div>
              </div>

              {/* Right Column: MileStones Narrative */}
              <div className="lg:col-span-7 space-y-6 flex flex-col justify-center">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-indigo-500" />
                  Engineering a Frictionless Experience
                </h3>
                
                <div className="space-y-4">
                  <div className="relative pl-6 border-l-2 border-indigo-500/30">
                    <div className="absolute -left-2 top-1 w-3.5 h-3.5 rounded-full bg-indigo-600 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                    <h4 className="text-xs font-black uppercase text-indigo-550 tracking-wider">The Mission</h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold leading-relaxed mt-1">
                      Traditional shopping channels suffer from layout fatigue and slow transaction times. CartNow was founded to build a zero-latency web catalog that serves results instantly. We focus on lightweight MERN architecture, responsive rendering, and premium animations.
                    </p>
                  </div>

                  <div className="relative pl-6 border-l-2 border-indigo-500/30">
                    <div className="absolute -left-2 top-1 w-3.5 h-3.5 rounded-full bg-purple-650 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                    <h4 className="text-xs font-black uppercase text-purple-500 tracking-wider">The Innovation</h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold leading-relaxed mt-1">
                      We developed an Amazon-style product discount card slider with interactive frame peeking, a self-service address and returns workflow, and dynamic courier dispatch maps. We are actively developing AI visual fitting systems to bring brick-and-mortar sizing confidence right to the browser.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeInWhenVisible>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 3 — WHY CHOOSE CARTNOW
          ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <FadeInWhenVisible>
          <div className="text-center mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-500">Value Proposition</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-1 text-slate-900 dark:text-white">Why Choose CartNow</h2>
          </div>
        </FadeInWhenVisible>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyChooseItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-850 p-6 rounded-2xl shadow-sm text-left relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
              <div className="h-11 w-11 bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0 mb-4">
                {item.icon}
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 4 — HOW IT WORKS
          ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-slate-100/50 dark:bg-slate-900/10 border-y border-slate-200/50 dark:border-slate-900">
        <div className="max-w-7xl mx-auto">
          <FadeInWhenVisible>
            <div className="text-center mb-20">
              <span className="text-xs font-black uppercase tracking-widest text-indigo-500">Process Flow</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mt-1 text-slate-900 dark:text-white">How It Works</h2>
            </div>
          </FadeInWhenVisible>

          {/* Desktop Stepper Timeline Layout */}
          <div className="hidden lg:grid grid-cols-5 gap-6 relative select-none">
            {/* Horizontal connect line */}
            <div className="absolute top-1/2 left-[10%] right-[10%] h-[1px] bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0" />
            
            {howItWorksSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative z-10 flex flex-col items-center text-center space-y-4"
              >
                <div className={`h-16 w-16 rounded-full ${step.bgColor} ${step.color} flex items-center justify-center shadow-lg border border-slate-105 dark:border-slate-800`}>
                  {step.icon}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Step {index + 1}</span>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{step.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[160px] leading-relaxed font-semibold">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile Vertical Timeline Layout */}
          <div className="lg:hidden space-y-8 max-w-md mx-auto text-left relative pl-8">
            <div className="absolute left-[28px] top-4 bottom-4 w-[1px] bg-slate-200 dark:bg-slate-800" />
            {howItWorksSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative flex gap-4 items-start"
              >
                <div className={`absolute -left-8 h-8 w-8 rounded-full ${step.bgColor} ${step.color} flex items-center justify-center shadow-md border border-slate-100 dark:border-slate-800 -translate-x-1.5`}>
                  {React.cloneElement(step.icon, { size: 14 })}
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-indigo-500">Step {index + 1}</span>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">{step.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed font-semibold">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 5 — FEATURES
          ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <FadeInWhenVisible>
          <div className="text-center mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-500">Feature Blueprint</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-1 text-slate-900 dark:text-white">Built-in Features</h2>
          </div>
        </FadeInWhenVisible>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {featuresList.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
              whileHover={{ scale: 1.02 }}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-850 flex items-start gap-4 shadow-2xs text-left"
            >
              <div className="h-9 w-9 bg-indigo-500/10 text-indigo-500 rounded-lg flex items-center justify-center shrink-0">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">{feature.title}</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal font-semibold">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 6 — TECHNOLOGY STACK
          ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-slate-100/50 dark:bg-slate-900/10 border-y border-slate-200/50 dark:border-slate-900">
        <div className="max-w-7xl mx-auto">
          <FadeInWhenVisible>
            <div className="text-center mb-16">
              <span className="text-xs font-black uppercase tracking-widest text-indigo-500">Under The Hood</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mt-1 text-slate-900 dark:text-white">Technology Stack</h2>
            </div>
          </FadeInWhenVisible>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {techStack.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-850 p-6 rounded-2xl text-left flex flex-col justify-between shadow-2xs group relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 ${tech.bgGlow} rounded-full blur-2xl pointer-events-none opacity-20`} />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-black">{tech.category}</span>
                    <span className="text-indigo-500">{tech.logo}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">{tech.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed font-semibold">{tech.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 7 — OUR NUMBERS
          ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {statNumbers.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              className="bg-white dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-850 p-6 sm:p-8 rounded-[24px] text-center shadow-xs flex flex-col items-center justify-center gap-1.5 select-none"
            >
              <span className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">{stat.value}</span>
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 8 — SECURITY
          ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-emerald-500/5 border-y border-emerald-500/10">
        <div className="max-w-7xl mx-auto">
          <FadeInWhenVisible>
            <div className="text-center mb-16">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-500">Fully Protected</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mt-1 text-slate-900 dark:text-white">Security Infrastructure</h2>
            </div>
          </FadeInWhenVisible>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {securityItems.map((sec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="bg-white dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-855 p-6 rounded-2xl text-center flex flex-col items-center gap-3.5 shadow-2xs hover:border-emerald-500/30 transition duration-300"
              >
                <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                  {sec.icon}
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{sec.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal font-semibold">{sec.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 9 — CUSTOMER TESTIMONIALS
          ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-4xl mx-auto text-center relative">
        <FadeInWhenVisible>
          <div className="text-center mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-500">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-1 text-slate-900 dark:text-white">What Our Customers Say</h2>
          </div>
        </FadeInWhenVisible>

        {/* Testimonials Carousel Wrapper */}
        <div className="relative min-h-[220px] flex items-center justify-center bg-white/70 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-850 rounded-[32px] p-6 sm:p-10 shadow-xl overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="space-y-4 flex flex-col items-center"
            >
              {/* Rating stars */}
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-350 italic font-semibold leading-relaxed max-w-2xl">
                "{testimonials[activeTestimonial].review}"
              </p>

              {/* Identity details */}
              <div className="flex items-center gap-3 pt-3">
                <img
                  src={testimonials[activeTestimonial].avatar}
                  alt={testimonials[activeTestimonial].name}
                  className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                />
                <div className="text-left">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">{testimonials[activeTestimonial].name}</h4>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{testimonials[activeTestimonial].role}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel Arrows */}
          <button
            onClick={handlePrevTestimonial}
            className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 rounded-full flex items-center justify-center shadow-xs border-none cursor-pointer text-slate-600 dark:text-slate-300"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleNextTestimonial}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 rounded-full flex items-center justify-center shadow-xs border-none cursor-pointer text-slate-600 dark:text-slate-300"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 10 — FAQ
          ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-3xl mx-auto">
        <FadeInWhenVisible>
          <div className="text-center mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-500">Support Center</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-1 text-slate-900 dark:text-white">Frequently Asked Questions</h2>
          </div>
        </FadeInWhenVisible>

        <div className="space-y-4">
          {faqItems.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-850 rounded-2xl shadow-2xs overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-5 text-left border-none bg-transparent cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 dark:text-slate-500 transition-transform duration-300 ${isOpen ? "rotate-180 text-indigo-550" : ""}`}
                  />
                </button>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-5 pb-5 pt-1 text-xs leading-relaxed font-semibold text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-850">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 11 — CONTACT
          ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <FadeInWhenVisible>
          <div className="text-center mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-500">Get In Touch</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-1 text-slate-900 dark:text-white">Contact Our Team</h2>
          </div>
        </FadeInWhenVisible>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch select-none">
          {/* Info Card List */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-850 p-6 rounded-2xl flex items-start gap-4 shadow-2xs"
              >
                <div className="h-10 w-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center shrink-0">
                  {info.icon}
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{info.label}</h3>
                  <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">{info.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Quick Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-855 rounded-[32px] p-6 sm:p-8 shadow-md"
          >
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Send A Quick Message</h3>
            
            <form onSubmit={(e) => { e.preventDefault(); alert("Message sent! We'll reply within 24 hours."); }} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 dark:focus:border-indigo-600 text-xs font-black text-slate-800 dark:text-slate-100 outline-none transition"
                />
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-555 dark:focus:border-indigo-600 text-xs font-black text-slate-800 dark:text-slate-100 outline-none transition"
                />
              </div>
              <input
                type="text"
                required
                placeholder="Subject Topic"
                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 dark:focus:border-indigo-600 text-xs font-black text-slate-800 dark:text-slate-100 outline-none transition"
              />
              <textarea
                required
                rows={4}
                placeholder="Write message details..."
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 dark:focus:border-indigo-600 text-xs font-black text-slate-800 dark:text-slate-100 outline-none resize-none transition"
              />
              <button
                type="submit"
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center gap-2 border-none shadow-xs"
              >
                <Send size={13} />
                <span>Send Message</span>
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 12 — CALL TO ACTION
          ────────────────────────────────────────────────────────── */}
      <section className="py-16 px-6 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-tr from-indigo-900 to-slate-900 border border-slate-800 rounded-[36px] py-16 px-6 sm:px-12 shadow-2xl overflow-hidden select-none"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative z-10 max-w-xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Ready to start shopping?</h2>
            <p className="text-xs sm:text-sm text-slate-400 font-semibold leading-relaxed">
              Explore thousands of curated products, apply exclusive coupons, and unlock virtual Try-On sizing controls instantly.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/product"
                className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-lg shadow-indigo-600/25 border-none"
              >
                Explore Products
              </Link>
              <Link
                to="/signup"
                className="px-8 py-3.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 border border-white/20"
              >
                Create Account
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
};

// ──────────────────────────────────────────────────────────
// DATA ARRAYS
// ──────────────────────────────────────────────────────────

const whyChooseItems = [
  {
    icon: <Truck size={20} />,
    title: "Fast Delivery",
    description: "Orders processed in 2 hours with real-time courier matching logistics."
  },
  {
    icon: <ShieldCheck size={20} />,
    title: "Secure Payments",
    description: "Fully PCI-DSS compliant checkout layer protects all sensitive transactions."
  },
  {
    icon: <CreditCard size={20} />,
    title: "Multiple Payments",
    description: "Checkout cleanly using credit cards, Stripe, net banking, or Razorpay."
  },
  {
    icon: <Star size={20} />,
    title: "Product Reviews",
    description: "Verified customer reviews and rating breakdowns for confident shopping."
  },
  {
    icon: <MapPin size={20} />,
    title: "Live Order Tracking",
    description: "Interactive real-time map updates track your courier route visually."
  },
  {
    icon: <MessageSquare size={20} />,
    title: "Real-time Chat",
    description: "Direct secure channel to message sellers and support instantly."
  },
  {
    icon: <RotateCcw size={20} />,
    title: "Easy Returns",
    description: "Self-service 30-day returns with automatic refund execution."
  },
  {
    icon: <Gift size={20} />,
    title: "Daily Deals",
    description: "Vibrant flash discounts, admin custom coupons, and special deals daily."
  }
];

const howItWorksSteps = [
  {
    icon: <Search size={22} className="stroke-[2.5]" />,
    bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
    color: "text-indigo-650 dark:text-indigo-400",
    title: "Browse Products",
    description: "Discover curated items using smart tags, dynamic search filters, and AI guides."
  },
  {
    icon: <ShoppingBag size={22} className="stroke-[2.5]" />,
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    color: "text-purple-650 dark:text-purple-400",
    title: "Add To Cart",
    description: "Adjust sizing configurations, check stock counts, and pool items safely in cart."
  },
  {
    icon: <CreditCard size={22} className="stroke-[2.5]" />,
    bgColor: "bg-violet-100 dark:bg-violet-900/30",
    color: "text-violet-650 dark:text-violet-400",
    title: "Secure Checkout",
    description: "Apply coupon codes, pay with verified gateways, and save invoice PDFs."
  },
  {
    icon: <MapPin size={22} className="stroke-[2.5]" />,
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    color: "text-amber-650 dark:text-amber-400",
    title: "Track Order",
    description: "Receive dispatch updates and watch live courier movement details."
  },
  {
    icon: <Check size={22} className="stroke-[2.5]" />,
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    color: "text-emerald-650 dark:text-emerald-400",
    title: "Delivered",
    description: "Receive product safely, review items, and trigger feedback reviews."
  }
];

const featuresList = [
  { icon: <Sparkles size={16} />, title: "AI Recommendations", description: "Smart system matches product options based on view history." },
  { icon: <Heart size={16} />, title: "Wishlist Management", description: "Save products to personal lists for quick purchasing later." },
  { icon: <Search size={16} />, title: "Advanced Search", description: "Vibrant query autocomplete scans thousands of records instantly." },
  { icon: <Sliders size={16} />, title: "Smart Filters", description: "Slice listings dynamically by cost, reviews, brands, or location." },
  { icon: <Ticket size={16} />, title: "Coupons & Discounts", description: "Admin creates custom coupon rules with automatic Cart application." },
  { icon: <Layout size={16} />, title: "Seller Dashboard", description: "Structured space for merchants to control stock and fulfill orders." },
  { icon: <Sliders size={16} />, title: "Admin Control Hub", description: "Fully control site assets, order records, and categories taxonomies." },
  { icon: <MapPin size={16} />, title: "Live Order Tracking", description: "Visual map widgets with live courier location indicators." },
  { icon: <Award size={16} />, title: "Invoice Generation", description: "Download formatted PDF receipts for completed checkouts instantly." },
  { icon: <Lock size={16} />, title: "Secure Authentication", description: "Cryptographically secure passwords with JWT sessions." },
  { icon: <Globe size={16} />, title: "Responsive Design", description: "Clean UI wraps automatically on mobile, tablet, and desktops." },
  { icon: <Database size={16} />, title: "Cloud Image Upload", description: "Rapid image caching using integrated Cloudinary optimization." }
];

const techStack = [
  {
    category: "Frontend",
    logo: <Cpu size={24} />,
    name: "React.js",
    description: "Powers our modular SPA rendering logic and state engines snappy.",
    bgGlow: "bg-blue-500"
  },
  {
    category: "Backend",
    logo: <Code size={24} />,
    name: "Node.js",
    description: "Asynchronous runtime executing REST APIs smoothly.",
    bgGlow: "bg-emerald-500"
  },
  {
    category: "Server Framework",
    logo: <Database size={24} />,
    name: "Express.js",
    description: "Highly light server handler routes requests with low latency.",
    bgGlow: "bg-slate-500"
  },
  {
    category: "Database",
    logo: <Globe size={24} />,
    name: "MongoDB",
    description: "Scalable document storage holds products catalog schemas securely.",
    bgGlow: "bg-green-500"
  },
  {
    category: "Styling System",
    logo: <Sliders size={24} />,
    name: "Tailwind CSS",
    description: "Engineers our modern typography, dark accents, and glass layers.",
    bgGlow: "bg-cyan-500"
  },
  {
    category: "Authentication",
    logo: <Lock size={24} />,
    name: "JSON Web Tokens",
    description: "Stateless security keeps customer login credentials encrypted.",
    bgGlow: "bg-rose-500"
  },
  {
    category: "Asset Storage",
    logo: <Database size={24} />,
    name: "Cloudinary API",
    description: "Compresses and delivers product images over CDN locations.",
    bgGlow: "bg-sky-500"
  },
  {
    category: "Payment Core",
    logo: <CreditCard size={24} />,
    name: "Stripe & Razorpay",
    description: "Frictionless checkout gateway handles UPI and card payments securely.",
    bgGlow: "bg-indigo-500"
  }
];

const statNumbers = [
  { value: "50+", label: "Sellers" },
  { value: "10,000+", label: "Products" },
  { value: "5,000+", label: "Happy Customers" },
  { value: "98%", label: "Positive Reviews" }
];

const securityItems = [
  { icon: <Lock size={18} />, title: "SSL Encryption", description: "All web connections tunnel over high-grade SSL layer protocols." },
  { icon: <ShieldCheck size={18} />, title: "Secure Auth", description: "Bcrypt hash structures keep customer credentials fully unreadable." },
  { icon: <CreditCard size={18} />, title: "Protected Pay", description: "Checkout connects via sandbox gateways bypassing local server database logs." },
  { icon: <ShieldAlert size={18} />, title: "Data Privacy", description: "Full user control to manage browser cookies and account data storage." },
  { icon: <Users size={18} />, title: "Verified Sellers", description: "Merchants go through background checks before authorization." }
];

const testimonials = [
  {
    name: "Amit Sharma",
    role: "Verified Shopper",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
    review: "The delivery is shockingly fast. Ordered a casual shirt and it arrived at my door within 24 hours. The real-time tracker update was extremely precise!"
  },
  {
    name: "Priya Patel",
    role: "Pro Customer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
    review: "I love the CartNow AI Assistant chat box. It recommended two books based on my library view history, and both were spot on. Premium interface indeed."
  },
  {
    name: "Rohan Das",
    role: "Merchant Seller",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
    review: "Moving my boutique shop onto CartNow increased my sales significantly. The seller interface makes adding dynamic catalog rules and viewing revenue split charts simple."
  }
];

const faqItems = [
  {
    question: "How long does delivery take?",
    answer: "Delivery timelines depend on location. Metro orders are processed and shipped within 2-3 hours and typically arrive within 24-48 hours. Rural locations take between 3-5 business days."
  },
  {
    question: "Can I return products?",
    answer: "Yes, CartNow provides an easy self-service return dashboard. Simply open your Completed Order, select Return Items, and request a dispatch agent pickup within 30 days."
  },
  {
    question: "Is Cash on Delivery available?",
    answer: "Yes, COD is supported alongside digital gateways (Stripe/Razorpay credit card and UPI transactions) based on your account verified address logs."
  },
  {
    question: "How do refunds work?",
    answer: "Once our courier partners verify the return items at pickup, refunds are processed instantly. Funds will reflect in your source wallet/card database logs within 2-3 business days."
  },
  {
    question: "How can sellers join?",
    answer: "Sellers can apply to join the platform by navigating to the Seller Registration portal, submitting their business tax logs, and setting up their merchant accounts within 24 hours."
  }
];

const contactInfo = [
  { icon: <Mail size={18} />, label: "Email Support", value: "support@cartnow.com" },
  { icon: <Phone size={18} />, label: "Call Helpline", value: "+91 98765 43210" },
  { icon: <MapPin size={18} />, label: "HQ Location", value: "Tech Hub, Sector 62, Noida, India" },
  { icon: <Clock size={18} />, label: "Support Hours", value: "24/7 Mon - Sun Helpline" }
];

export default About;
