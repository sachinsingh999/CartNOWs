import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { backendUrl } from "../config";
import aboutHeroIllustration from "../assets/about_hero_illustration.webp";
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
  Store,
  Navigation,
  ExternalLink,
  CheckCircle2,
  TrendingUp,
  Layers
} from "lucide-react";

// Silky Smooth Custom Cubic Bezier Easing
const smoothEase = [0.22, 1, 0.36, 1];

// Helper component for ultra-smooth scroll reveals with GPU acceleration and spring entry
const FadeInWhenVisible = ({ children, delay = 0, y = 30, scale = 0.98 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y, scale }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, margin: "-40px" }}
      transition={{
        type: "spring",
        stiffness: 65,
        damping: 18,
        mass: 0.9,
        delay
      }}
      className="transform-gpu"
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

  // Contact form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Auto-slide testimonials smoothly
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Direct email dispatch via FormSubmit service to sachin9909.singh@gmail.com
      await fetch("https://formsubmit.co/ajax/sachin9909.singh@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          _subject: `[CartNow Support Inquiry] ${formData.subject || "General Inquiry"}`,
          message: formData.message,
          _captcha: "false"
        })
      });
    } catch (err) {
      console.warn("Direct FormSubmit send error:", err);
    }

    try {
      // 2. Save inquiry to CartNow database
      await axios.post(`${backendUrl}/api/system/contact`, formData);
    } catch (err) {
      console.warn("Backend database save notification:", err.message);
    }

    setContactSubmitted(true);
    setIsSubmitting(false);

    setTimeout(() => {
      setContactSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 6000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070A13] text-slate-800 dark:text-slate-200 transition-colors duration-500 overflow-hidden relative scroll-smooth">
      
      {/* Silky Glowing Ambient Radial Light Orbs */}
      <div className="absolute top-12 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none animate-pulse" style={{ animationDuration: "8s" }} />
      <div className="absolute top-1/3 right-1/4 w-[550px] h-[550px] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: "10s", animationDelay: "2s" }} />
      <div className="absolute bottom-1/4 left-10 w-[400px] h-[400px] bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-[110px] pointer-events-none animate-pulse" style={{ animationDuration: "9s", animationDelay: "4s" }} />

      {/* ──────────────────────────────────────────────────────────
          SECTION 1 — HERO HEADER
          ────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex items-center justify-center pt-24 pb-16 px-6 sm:px-12 lg:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          
          {/* Left Hero Text Column */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: smoothEase }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-amber-500/10 border border-indigo-500/20 dark:border-indigo-400/20 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-wider shadow-2xs"
            >
              <Sparkles size={14} className="animate-spin text-amber-500" style={{ animationDuration: "6s" }} />
              <span>THE NEXT-GEN E-COMMERCE ECOSYSTEM</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: smoothEase }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]"
            >
              Reimagining Shopping with <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 dark:from-indigo-400 dark:via-purple-400 dark:to-amber-400 bg-clip-text text-transparent">
                Speed, AI & Trust
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: smoothEase }}
              className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-xl"
            >
              CartNow is an ultra-modern e-commerce platform built to make online shopping effortless, transparent, and intelligent. From instant search filters to AI virtual fitting, we bridge the gap between merchants, buyers, and delivery partners.
            </motion.p>

            {/* Quick Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: smoothEase }}
              className="flex flex-wrap items-center gap-4 pt-2 select-none"
            >
              <Link
                to="/product"
                className="px-7 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 active:scale-95 shadow-lg shadow-indigo-500/25 flex items-center gap-2 group cursor-pointer border-none"
              >
                <span>Explore Catalog</span>
                <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300 stroke-[2.5]" />
              </Link>
              
              <a
                href="#ecosystem"
                className="px-7 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 active:scale-95 shadow-2xs flex items-center gap-2"
              >
                <span>Explore Portals</span>
                <Layers size={14} className="text-amber-500" />
              </a>
            </motion.div>

            {/* Key Value Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="pt-4 flex flex-wrap items-center gap-6 text-xs font-bold text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800/80"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-500" />
                <span>Zero Latency APIs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-500" />
                <span>Live Courier Tracking</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-500" />
                <span>AI Sizing Fit</span>
              </div>
            </motion.div>
          </div>

          {/* Right Visual Column (Clean Large Standalone PNG Image with Gentle Levitation) */}
          <div className="lg:col-span-6 flex items-center justify-center select-none mx-auto w-full max-w-[640px] py-2">
            <motion.img 
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1, y: [0, -12, 0] }}
              transition={{ 
                opacity: { duration: 0.8, ease: smoothEase },
                scale: { duration: 0.8, ease: smoothEase },
                y: { repeat: Infinity, duration: 6, ease: "easeInOut" }
              }}
              src={aboutHeroIllustration} 
              alt="CartNow Premium Shopping Illustration" 
              className="w-full h-auto max-h-[640px] object-contain drop-shadow-2xl hover:scale-[1.03] transition-transform duration-500 ease-out"
            />
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 2 — THE CARTNOW ECOSYSTEM (APP, SELLER, DELIVERYMAN)
          ────────────────────────────────────────────────────────── */}
      <section id="ecosystem" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-200/80 dark:border-slate-800/80">
        <FadeInWhenVisible>
          <div className="text-center mb-14">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Integrated Platform Hubs</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-1 text-slate-900 dark:text-white">Our 3-Pillar Ecosystem</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold max-w-xl mx-auto mt-2">
              CartNow connects shoppers, merchant sellers, and delivery logistics agents in real-time.
            </p>
          </div>
        </FadeInWhenVisible>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
          {/* Ecosystem Portal 1: Customer Storefront */}
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, margin: "-40px" }}
            transition={{ type: "spring", stiffness: 70, damping: 18, mass: 0.9, delay: 0 }}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-7 shadow-sm text-left flex flex-col justify-between relative group transition-colors duration-300 transform-gpu"
          >
            <div>
              <div className="h-12 w-12 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0 mb-5 border border-indigo-500/20">
                <ShoppingBag size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block">FOR SHOPPERS</span>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white mt-1">Customer Storefront</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed mt-2.5">
                Browse thousands of products across fashion, electronics, and home. Enjoy AI fitting tools, instant cart checkout, and live courier tracking.
              </p>
            </div>
            <div className="pt-6">
              <Link
                to="/product"
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors group-hover:translate-x-1 duration-300"
              >
                <span>Shop Catalog Now</span>
                <ArrowRight size={14} className="stroke-[2.5]" />
              </Link>
            </div>
          </motion.div>

          {/* Ecosystem Portal 2: Seller Hub */}
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, margin: "-40px" }}
            transition={{ type: "spring", stiffness: 70, damping: 18, mass: 0.9, delay: 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-7 shadow-sm text-left flex flex-col justify-between relative group transition-colors duration-300 transform-gpu"
          >
            <div>
              <div className="h-12 w-12 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center shrink-0 mb-5 border border-amber-500/20">
                <Store size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 block">FOR MERCHANTS</span>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white mt-1">Seller Dashboard</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed mt-2.5">
                Manage stock inventories, track revenue analytics, fulfill customer orders, and publish new product listings in seconds.
              </p>
            </div>
            <div className="pt-6">
              <a
                href="https://cartnow-seller.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors group-hover:translate-x-1 duration-300"
              >
                <span>Visit Seller Portal</span>
                <ExternalLink size={14} className="stroke-[2.5]" />
              </a>
            </div>
          </motion.div>

          {/* Ecosystem Portal 3: Delivery Agent Hub */}
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, margin: "-40px" }}
            transition={{ type: "spring", stiffness: 70, damping: 18, mass: 0.9, delay: 0.2 }}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-7 shadow-sm text-left flex flex-col justify-between relative group transition-colors duration-300 transform-gpu"
          >
            <div>
              <div className="h-12 w-12 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shrink-0 mb-5 border border-emerald-500/20">
                <Navigation size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block">FOR LOGISTICS</span>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white mt-1">Delivery Agent Portal</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed mt-2.5">
                Accept delivery assignments, get optimized GPS route directions, update order statuses live, and deliver packages with digital signatures.
              </p>
            </div>
            <div className="pt-6">
              <a
                href="https://cart-now-deliveryagent.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors group-hover:translate-x-1 duration-300"
              >
                <span>Visit Delivery Portal</span>
                <ExternalLink size={14} className="stroke-[2.5]" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 2.5 — JOIN OUR PARTNER NETWORK (SELLER & DELIVERY MAN CARDS)
          ────────────────────────────────────────────────────────── */}
      <section id="join-partners" className="py-16 px-6 max-w-7xl mx-auto border-t border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
        <FadeInWhenVisible>
          <div className="text-center mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Partner Opportunities</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight mt-1 text-slate-900 dark:text-white">Grow & Earn With CartNow</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold max-w-xl mx-auto mt-2">
              Whether you are a merchant looking to scale sales or a driver seeking flexible earnings, join our expanding network today.
            </p>
          </div>
        </FadeInWhenVisible>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 select-none">
          {/* Card 1: Join as Seller (Slides in from Left - Spring Physics) */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-40px" }}
            transition={{
              type: "spring",
              stiffness: 70,
              damping: 18,
              mass: 0.9
            }}
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-amber-500/60 dark:hover:border-amber-500/60 rounded-2xl p-8 sm:p-10 text-slate-900 dark:text-white shadow-xl flex flex-col justify-between relative overflow-hidden group text-left transition-colors duration-300 transform-gpu"
          >
            {/* Corner accent bar */}
            <div className="absolute top-0 left-0 w-20 h-1 bg-amber-500" />

            <div className="space-y-6">
              {/* Header Badge & Tag */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10.5px] font-black uppercase tracking-widest rounded-lg">
                  <Store size={14} className="text-amber-600 dark:text-amber-400" />
                  <span>Merchant Network</span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  0% Onboarding Fee
                </span>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-sans">
                  Join as a Merchant Seller
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold leading-relaxed mt-3">
                  Reach thousands of active shoppers daily. List your store catalog, run automated discount campaigns, track real-time revenue analytics, and scale your business effortlessly.
                </p>
              </div>

              {/* Feature Items List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <CheckCircle2 size={16} className="text-amber-500 dark:text-amber-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Instant Store Onboarding</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <CheckCircle2 size={16} className="text-amber-500 dark:text-amber-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Live Inventory & Analytics</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <CheckCircle2 size={16} className="text-amber-500 dark:text-amber-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Weekly Direct Payouts</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <CheckCircle2 size={16} className="text-amber-500 dark:text-amber-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">24/7 Merchant Support</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-8 flex flex-wrap items-center gap-3">
              <a
                href="https://cartnow-seller.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 active:scale-98 shadow-md inline-flex items-center gap-2 cursor-pointer border-none"
              >
                <span>Register as Seller</span>
                <ArrowRight size={14} className="stroke-[3]" />
              </a>
              <a
                href="https://cartnow-seller.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 border border-slate-300 dark:border-slate-700 inline-flex items-center gap-2"
              >
                <span>Seller Portal</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </motion.div>

          {/* Card 2: Join as Delivery Man (Slides in from Right - Spring Physics) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-40px" }}
            transition={{
              type: "spring",
              stiffness: 70,
              damping: 18,
              mass: 0.9,
              delay: 0.08
            }}
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 rounded-2xl p-8 sm:p-10 text-slate-900 dark:text-white shadow-xl flex flex-col justify-between relative overflow-hidden group text-left transition-colors duration-300 transform-gpu"
          >
            {/* Corner accent bar */}
            <div className="absolute top-0 left-0 w-20 h-1 bg-emerald-500" />

            <div className="space-y-6">
              {/* Header Badge & Tag */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10.5px] font-black uppercase tracking-widest rounded-lg">
                  <Truck size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Logistics Fleet</span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  Flexible Hours
                </span>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-sans">
                  Join as a Delivery Partner / Man
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold leading-relaxed mt-3">
                  Earn competitive payouts delivering packages in your city. Enjoy flexible work schedules, instant order assignment notifications, turn-by-turn map navigation, and rider bonuses.
                </p>
              </div>

              {/* Feature Items List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Flexible Shift Choice</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Turn-by-Turn GPS Map</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Per-Order Earnings + Tips</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Insurance & Protection</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-8 flex flex-wrap items-center gap-3">
              <a
                href="https://cart-now-deliveryagent.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 active:scale-98 shadow-md inline-flex items-center gap-2 cursor-pointer border-none"
              >
                <span>Become a Delivery Man</span>
                <ArrowRight size={14} className="stroke-[3]" />
              </a>
              <a
                href="https://cart-now-deliveryagent.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 border border-slate-300 dark:border-slate-700 inline-flex items-center gap-2"
              >
                <span>Delivery Portal</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 3 — OUR METRICS & NUMBERS
          ────────────────────────────────────────────────────────── */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {statNumbers.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.88, y: 25 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: false, margin: "-40px" }}
              transition={{ type: "spring", stiffness: 85, damping: 16, delay: index * 0.08 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl text-center shadow-2xs flex flex-col items-center justify-center gap-1 select-none transition-colors duration-300 transform-gpu"
            >
              <span className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 bg-clip-text text-transparent">{stat.value}</span>
              <span className="text-[10.5px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400 mt-1">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 4 — WHY CHOOSE CARTNOW (VALUES)
          ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-200/80 dark:border-slate-800/80">
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
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, margin: "-40px" }}
              transition={{ type: "spring", stiffness: 75, damping: 18, delay: index * 0.06 }}
              whileHover={{ y: -5, scale: 1.015 }}
              className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-2xs text-left relative overflow-hidden group transition-colors duration-300 transform-gpu"
            >
              <div className="h-11 w-11 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0 mb-4 transition-transform group-hover:scale-110 duration-300">
                {item.icon}
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 5 — HOW IT WORKS (LOGICAL SEQUENTIAL STEPPER TIMELINE)
          ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-slate-100/60 dark:bg-slate-900/20 border-y border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <FadeInWhenVisible>
            <div className="text-center mb-16">
              <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Process Flow</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mt-1 text-slate-900 dark:text-white">How It Works</h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold max-w-xl mx-auto mt-2">
                From catalog discovery to door delivery, experience seamless automated e-commerce.
              </p>
            </div>
          </FadeInWhenVisible>

          {/* Desktop Horizontal Stepper Timeline */}
          <div className="hidden lg:block relative select-none max-w-6xl mx-auto">
            {/* Background Base Line */}
            <div className="absolute top-[32px] left-[10%] right-[10%] h-[3px] bg-slate-200 dark:bg-slate-800 rounded-full z-0" />
            
            {/* Animated Forward-Only Fill Line (Step 1 -> Step 5) */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: false, margin: "-40px" }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              style={{ originX: 0 }}
              className="absolute top-[32px] left-[10%] right-[10%] h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-full z-0 transform-gpu"
            />

            {/* Logical Forward Energy Glow Pulse (Flows Left to Right) */}
            <motion.div
              initial={{ left: "10%", opacity: 0 }}
              whileInView={{ left: "90%", opacity: [0, 1, 1, 1, 0] }}
              viewport={{ once: false, margin: "-40px" }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="absolute top-[28px] w-3 h-3 rounded-full bg-indigo-500 dark:bg-indigo-400 shadow-[0_0_14px_#6366f1] z-10 pointer-events-none -translate-x-1/2"
            />

            <div className="grid grid-cols-5 gap-4 relative z-10">
              {howItWorksSteps.map((step, index) => {
                // Calculate logical sequential delay for each step in left-to-right order
                const stepDelay = 0.1 + index * 0.25;

                return (
                  <div key={index} className="flex flex-col items-center text-center space-y-3 group cursor-default">
                    
                    {/* Step Icon Circle with Sequential Pop & Glow */}
                    <div className="relative flex items-center justify-center">
                      {/* Active Step Subtle Ambient Ring */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.7 }}
                        whileInView={{ opacity: 0.4, scale: 1.2 }}
                        viewport={{ once: false, margin: "-40px" }}
                        transition={{ duration: 0.6, delay: stepDelay }}
                        className={`absolute inset-0 rounded-full ${step.bgColor} blur-xs`}
                      />

                      <motion.div
                        initial={{ opacity: 0, scale: 0, y: 20 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: false, margin: "-40px" }}
                        transition={{
                          type: "spring",
                          stiffness: 120,
                          damping: 14,
                          delay: stepDelay
                        }}
                        whileHover={{ scale: 1.12, y: -2 }}
                        className={`h-16 w-16 rounded-full ${step.bgColor} ${step.color} flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 transition-shadow duration-300 group-hover:shadow-indigo-500/20 transform-gpu relative z-10`}
                      >
                        {step.icon}
                      </motion.div>
                    </div>

                    {/* Step Info Text - Cascades After Circle Activation */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, margin: "-40px" }}
                      transition={{
                        type: "spring",
                        stiffness: 85,
                        damping: 16,
                        delay: stepDelay + 0.1
                      }}
                      className="transform-gpu space-y-1"
                    >
                      <span className="inline-block text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-md border border-indigo-500/20">
                        Step {index + 1}
                      </span>
                      <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                        {step.title}
                      </h3>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold leading-relaxed max-w-[170px] mx-auto">
                        {step.description}
                      </p>
                    </motion.div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Vertical Stepper Timeline (Forward Top-to-Bottom Flow) */}
          <div className="lg:hidden space-y-8 max-w-md mx-auto text-left relative pl-8 select-none">
            {/* Background Vertical Line */}
            <div className="absolute left-[23px] top-4 bottom-4 w-[2px] bg-slate-200 dark:bg-slate-800" />
            
            {/* Animated Forward Vertical Line Fill (Top -> Bottom) */}
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: false, margin: "-30px" }}
              transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ originY: 0 }}
              className="absolute left-[23px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-indigo-500 via-purple-500 to-emerald-500 z-0 transform-gpu"
            />

            {howItWorksSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -25 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, margin: "-30px" }}
                transition={{ type: "spring", stiffness: 90, damping: 16, delay: 0.1 + index * 0.15 }}
                className="relative flex gap-4 items-start transform-gpu"
              >
                <div className={`absolute -left-8 h-9 w-9 rounded-full ${step.bgColor} ${step.color} flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900 -translate-x-1 shrink-0 z-10`}>
                  {React.cloneElement(step.icon, { size: 16 })}
                </div>
                <div className="pl-4 space-y-1">
                  <span className="inline-block text-[9.5px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                    Step {index + 1}
                  </span>
                  <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 6 — OUR PLATFORM PROMISES & GUARANTEES
          ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-200/80 dark:border-slate-800/80">
        <FadeInWhenVisible>
          <div className="text-center mb-14">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Shopping Confidence</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight mt-1 text-slate-900 dark:text-white">Our Platform Promises</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold max-w-xl mx-auto mt-2">
              Built on transparency, speed, and uncompromised customer security across every order.
            </p>
          </div>
        </FadeInWhenVisible>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
          {platformPillars.map((pillar, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: smoothEase }}
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-7 rounded-2xl text-left flex flex-col justify-between shadow-md group relative overflow-hidden transition-colors duration-300 transform-gpu"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shrink-0">
                    {pillar.icon}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                    {pillar.badge}
                  </span>
                </div>
                <div>
                  <span className="text-[9.5px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mb-1">
                    {pillar.category}
                  </span>
                  <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">{pillar.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold mt-2 leading-relaxed">{pillar.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 7 — SECURITY INFRASTRUCTURE
          ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-emerald-500/5 border-y border-emerald-500/10">
        <div className="max-w-7xl mx-auto">
          <FadeInWhenVisible>
            <div className="text-center mb-16">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Fully Protected</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mt-1 text-slate-900 dark:text-white">Security Infrastructure</h2>
            </div>
          </FadeInWhenVisible>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {securityItems.map((sec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.4, delay: index * 0.05, ease: smoothEase }}
                whileHover={{ y: -4, scale: 1.015 }}
                className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl text-center flex flex-col items-center gap-3 shadow-2xs hover:border-emerald-500/30 transition-all duration-300"
              >
                <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                  {sec.icon}
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">{sec.title}</h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-normal font-semibold">{sec.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 8 — TESTIMONIALS
          ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center">
        <FadeInWhenVisible>
          <div className="text-center mb-14">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-500">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-1 text-slate-900 dark:text-white">What Our Users Say</h2>
          </div>
        </FadeInWhenVisible>

        <div className="relative min-h-[230px] flex items-center justify-center bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, ease: smoothEase }}
              className="space-y-4 flex flex-col items-center"
            >
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 italic font-semibold leading-relaxed max-w-2xl">
                "{testimonials[activeTestimonial].review}"
              </p>

              <div className="flex items-center gap-3 pt-2">
                <img
                  src={testimonials[activeTestimonial].avatar}
                  alt={testimonials[activeTestimonial].name}
                  className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                />
                <div className="text-left">
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">{testimonials[activeTestimonial].name}</h4>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{testimonials[activeTestimonial].role}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Nav Arrows */}
          <button
            onClick={handlePrevTestimonial}
            className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 rounded-full flex items-center justify-center border-none cursor-pointer text-slate-700 dark:text-slate-300 transition-colors duration-200"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleNextTestimonial}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 rounded-full flex items-center justify-center border-none cursor-pointer text-slate-700 dark:text-slate-300 transition-colors duration-200"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 9 — FREQUENTLY ASKED QUESTIONS
          ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 max-w-3xl mx-auto">
        <FadeInWhenVisible>
          <div className="text-center mb-14">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-500">Support Center</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-1 text-slate-900 dark:text-white">Frequently Asked Questions</h2>
          </div>
        </FadeInWhenVisible>

        <div className="space-y-3.5">
          {faqItems.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-4.5 sm:p-5 text-left border-none bg-transparent cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180 text-indigo-500" : ""}`}
                  />
                </button>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ height: { duration: 0.35, ease: smoothEase }, opacity: { duration: 0.25 } }}
                    >
                      <div className="px-5 pb-5 pt-1 text-xs leading-relaxed font-medium text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 10 — CONTACT FORM & HELPLINE
          ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <FadeInWhenVisible>
          <div className="text-center mb-14">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Get In Touch</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-1 text-slate-900 dark:text-white">Contact Our Team</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold max-w-xl mx-auto mt-2">
              Have questions, feedback, or need assistance? Connect directly with our team.
            </p>
          </div>
        </FadeInWhenVisible>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch select-none">
          {/* Info Card List (Slides in from Left) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            
            {/* Contact Card 1: Email Support */}
            <motion.a
              href="mailto:sachin9909.singh@gmail.com"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, margin: "-40px" }}
              transition={{ type: "spring", stiffness: 75, damping: 18, delay: 0 }}
              whileHover={{ y: -4, x: 4 }}
              className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-5 rounded-sm flex items-center gap-4 shadow-sm hover:border-indigo-500/40 hover:shadow-md transition-all duration-300 group text-left no-underline transform-gpu"
            >
              <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-sm flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300">
                <Mail size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block">EMAIL SUPPORT</span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 block truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  sachin9909.singh@gmail.com
                </span>
              </div>
              <ExternalLink size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0" />
            </motion.a>

            {/* Contact Card 2: Call Helpline */}
            <motion.a
              href="tel:+919905111415"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, margin: "-40px" }}
              transition={{ type: "spring", stiffness: 75, damping: 18, delay: 0.08 }}
              whileHover={{ y: -4, x: 4 }}
              className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-5 rounded-sm flex items-center gap-4 shadow-sm hover:border-emerald-500/40 hover:shadow-md transition-all duration-300 group text-left no-underline transform-gpu"
            >
              <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-sm flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300">
                <Phone size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block">CALL HELPLINE</span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 block truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  +91 99051 11415
                </span>
              </div>
              <ExternalLink size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0" />
            </motion.a>

            {/* Contact Card 3: HQ Location */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, margin: "-40px" }}
              transition={{ type: "spring", stiffness: 75, damping: 18, delay: 0.16 }}
              whileHover={{ y: -4, x: 4 }}
              className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-5 rounded-sm flex items-center gap-4 shadow-sm hover:border-amber-500/40 hover:shadow-md transition-all duration-300 group text-left transform-gpu"
            >
              <div className="h-12 w-12 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-sm flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300">
                <MapPin size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block">HQ LOCATION</span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 block truncate">
                  Vadodara, Gujarat, India
                </span>
              </div>
            </motion.div>

            {/* Contact Card 4: Support Hours */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, margin: "-40px" }}
              transition={{ type: "spring", stiffness: 75, damping: 18, delay: 0.24 }}
              whileHover={{ y: -4, x: 4 }}
              className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-5 rounded-sm flex items-center gap-4 shadow-sm hover:border-purple-500/40 hover:shadow-md transition-all duration-300 group text-left transform-gpu"
            >
              <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-sm flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300">
                <Clock size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest block">SUPPORT HOURS</span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 block truncate">
                  24/7 Mon - Sun Helpline
                </span>
              </div>
            </motion.div>

          </div>

          {/* Contact Quick Form Container (Slides in from Right) */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-40px" }}
            transition={{ type: "spring", stiffness: 75, damping: 18, delay: 0.1 }}
            className="lg:col-span-7 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-sm p-6 sm:p-8 shadow-xl flex flex-col justify-between relative overflow-hidden transform-gpu"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white text-left">Send A Direct Message</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-left">We typically respond in under 15 minutes.</p>
              </div>
              
              {/* Online Indicator */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider rounded-sm shrink-0">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Team Online</span>
              </div>
            </div>
            
            {contactSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: smoothEase }}
                className="py-12 px-6 bg-emerald-500/10 border border-emerald-500/20 rounded-sm text-emerald-600 dark:text-emerald-400 text-center flex flex-col items-center justify-center gap-3 my-auto"
              >
                <div className="h-12 w-12 bg-emerald-500/20 rounded-sm flex items-center justify-center text-emerald-500">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="text-base font-extrabold">Message Received!</h4>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 max-w-sm">
                  Thank you! Your inquiry has been dispatched to <span className="font-extrabold text-emerald-600 dark:text-emerald-400">sachin9909.singh@gmail.com</span>. We will get back to you shortly.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Name Input */}
                  <div className="relative">
                    <Users size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Your Full Name"
                      className="w-full h-11 pl-10 pr-4 rounded-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 dark:focus:border-indigo-400 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none transition-colors duration-200"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="Email Address"
                      className="w-full h-11 pl-10 pr-4 rounded-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 dark:focus:border-indigo-400 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none transition-colors duration-200"
                    />
                  </div>
                </div>

                {/* Subject Input */}
                <div className="relative">
                  <Ticket size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    placeholder="Subject Topic"
                    className="w-full h-11 pl-10 pr-4 rounded-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 dark:focus:border-indigo-400 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none transition-colors duration-200"
                  />
                </div>

                {/* Message Textarea */}
                <div className="relative">
                  <MessageSquare size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    placeholder="Write your message here..."
                    className="w-full pl-10 pr-4 pt-3 pb-3 rounded-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 dark:focus:border-indigo-400 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none resize-none transition-colors duration-200"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-none text-xs font-black uppercase tracking-widest cursor-pointer active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 border-none shadow-md"
                >
                  <Send size={14} className="stroke-[2.5]" />
                  <span>Send Direct Message</span>
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 11 — CALL TO ACTION BANNER
          ────────────────────────────────────────────────────────── */}
      <section className="py-16 px-6 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 25 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: false, margin: "-40px" }}
          transition={{ type: "spring", stiffness: 65, damping: 18, mass: 0.9 }}
          className="relative bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl py-14 px-6 sm:px-12 shadow-xl overflow-hidden select-none transform-gpu"
        >
          <div className="relative z-10 max-w-xl mx-auto space-y-5">
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Ready to start shopping?</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
              Explore thousands of curated products, apply discount coupons, and track live courier shipments today.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/product"
                className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 active:scale-95 shadow-md border-none"
              >
                Explore Products
              </Link>
              <Link
                to="/signup"
                className="px-8 py-3.5 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 active:scale-95 border border-slate-300 dark:border-slate-700 shadow-sm"
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
    description: "Orders processed with real-time courier matching logistics."
  },
  {
    icon: <ShieldCheck size={20} />,
    title: "Secure Payments",
    description: "Fully PCI-DSS compliant checkout layer protects sensitive transactions."
  },
  {
    icon: <CreditCard size={20} />,
    title: "Multiple Gateways",
    description: "Checkout cleanly using credit cards, Stripe, net banking, or Razorpay."
  },
  {
    icon: <Star size={20} />,
    title: "Product Reviews",
    description: "Verified customer reviews and rating breakdowns for confident shopping."
  },
  {
    icon: <MapPin size={20} />,
    title: "Live Courier Tracking",
    description: "Interactive real-time map updates track your order route visually."
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
    color: "text-indigo-600 dark:text-indigo-400",
    title: "Browse Products",
    description: "Discover items using smart tags, dynamic search filters, and AI guides."
  },
  {
    icon: <ShoppingBag size={22} className="stroke-[2.5]" />,
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    color: "text-purple-600 dark:text-purple-400",
    title: "Add To Cart",
    description: "Adjust sizing configurations, check stock counts, and pool items safely."
  },
  {
    icon: <CreditCard size={22} className="stroke-[2.5]" />,
    bgColor: "bg-violet-100 dark:bg-violet-900/30",
    color: "text-violet-600 dark:text-violet-400",
    title: "Secure Checkout",
    description: "Apply coupon codes, pay with verified gateways, and save invoice PDFs."
  },
  {
    icon: <MapPin size={22} className="stroke-[2.5]" />,
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    color: "text-amber-600 dark:text-amber-400",
    title: "Track Order",
    description: "Receive dispatch updates and watch live courier movement details."
  },
  {
    icon: <Check size={22} className="stroke-[2.5]" />,
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    color: "text-emerald-600 dark:text-emerald-400",
    title: "Delivered",
    description: "Receive product safely, review items, and trigger feedback reviews."
  }
];

const platformPillars = [
  {
    category: "Security Guarantee",
    icon: <Lock size={20} className="text-amber-400" />,
    badge: "100% Protected",
    title: "Encrypted Payments",
    description: "Every transaction is protected with PCI-DSS compliant SSL encryption, keeping your financial details secure."
  },
  {
    category: "Fast Logistics",
    icon: <Truck size={20} className="text-emerald-400" />,
    badge: "24-48 HR Dispatch",
    title: "Express Delivery Fleet",
    description: "Real-time dispatch system routes your packages to nearby delivery agents with live turn-by-turn tracking."
  },
  {
    category: "Verified Merchants",
    icon: <Store size={20} className="text-indigo-400" />,
    badge: "Authentic Only",
    title: "Verified Sellers",
    description: "All merchants pass strict verification before listing catalog items to guarantee 100% genuine products."
  },
  {
    category: "Customer Protection",
    icon: <RotateCcw size={20} className="text-rose-400" />,
    badge: "30-Day Policy",
    title: "Hassle-Free Returns",
    description: "Enjoy self-service returns with automated pickup dispatch and instant wallet/card refund execution."
  }
];

const statNumbers = [
  { value: "50+", label: "Verified Sellers" },
  { value: "10,000+", label: "Curated Products" },
  { value: "5,000+", label: "Happy Shoppers" },
  { value: "99.4%", label: "Satisfaction Rate" }
];

const securityItems = [
  { icon: <Lock size={18} />, title: "SSL Encryption", description: "All web traffic tunnels over high-grade SSL layer protocols." },
  { icon: <ShieldCheck size={18} />, title: "Secure Auth", description: "Bcrypt hash algorithms keep customer credentials unreadable." },
  { icon: <CreditCard size={18} />, title: "Protected Pay", description: "Checkout connects via verified PCI-DSS payment gateways." },
  { icon: <ShieldAlert size={18} />, title: "Data Privacy", description: "Full user control to manage cookies and account data." },
  { icon: <Users size={18} />, title: "Verified Sellers", description: "Merchants undergo verification before authorization." }
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
    review: "Moving my boutique shop onto CartNow increased my sales significantly. The seller interface makes adding dynamic catalog rules and viewing revenue simple."
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
    answer: "Yes, COD is supported alongside digital gateways (Stripe/Razorpay credit card and UPI transactions) based on your account verified address."
  },
  {
    question: "How do refunds work?",
    answer: "Once our courier partners verify the return items at pickup, refunds are processed instantly. Funds will reflect in your source wallet/card account within 2-3 business days."
  },
  {
    question: "How can sellers & delivery agents join?",
    answer: "Sellers can apply via the Seller Portal (cartnow-seller.vercel.app), and delivery partners can register via the Delivery Agent Portal (cart-now-deliveryagent.vercel.app)."
  }
];

const contactInfo = [
  { icon: <Mail size={18} />, label: "Email Support", value: "sachin9909.singh@gmail.com" },
  { icon: <Phone size={18} />, label: "Call Helpline", value: "+91 99051 11415" },
  { icon: <MapPin size={18} />, label: "HQ Location", value: "Vadodara, Gujarat, India" },
  { icon: <Clock size={18} />, label: "Support Hours", value: "24/7 Mon - Sun Helpline" }
];

export default About;
