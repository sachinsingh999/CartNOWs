import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { backendUrl } from "../config";
import Logo from "./Logo";
import { Store, Mail, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, TrendingUp, ArrowUpRight, Truck, Activity } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";


const Login = ({ setToken, setSeller }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const shouldReduceMotion = useReducedMotion();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await axios.post(`${backendUrl}/api/seller/login`, {
        email,
        password,
      });

      if (response.data.success) {
        toast.success(response.data.message || "Logged in successfully");
        setSeller(response.data.seller);
        setToken(response.data.token);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Animation Variants
  const formContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15
      }
    }
  };

  const formElement = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const leftContentStagger = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2
      }
    }
  };

  const leftElement = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
    }
  };


  return (
    <div className="min-h-[100dvh] w-full grid lg:grid-cols-[1.1fr_1fr] bg-slate-950 text-slate-100 font-sans selection:bg-orange-500 selection:text-white lg:h-screen lg:overflow-hidden relative">
      
      {/* Background radial lines and subtle grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.2)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />
      
      {/* Decorative Blob */}
      <div className="absolute top-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-gradient-to-br from-orange-500/5 to-indigo-500/5 blur-[140px] pointer-events-none z-0" />
      
      {/* Left Panel: Visual/Marketing split with floating UI elements */}
      <div className="relative hidden lg:flex flex-col justify-between p-8 overflow-hidden h-full bg-slate-950/40 border-r border-slate-900/60 z-10">
        
        {/* Subtle grid background overlay specifically for visual panel */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />

        {/* Floating background gradient lights */}
        <div className="absolute top-[20%] left-[-10%] h-[400px] w-[400px] rounded-full bg-orange-600/10 blur-[130px] z-0 pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-10%] h-[350px] w-[350px] rounded-full bg-indigo-600/10 blur-[120px] z-0 pointer-events-none" />

        {/* Back Link */}
        <motion.button
          initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onClick={() => navigate("/")}
          className="relative z-30 self-start flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-800/80 bg-slate-950/80 backdrop-blur-md text-xs font-bold text-slate-300 hover:text-white hover:border-slate-700 hover:shadow-lg hover:shadow-orange-500/5 transition cursor-pointer"
        >
          <ArrowLeft size={14} className="text-orange-500" />
          <span>Back to Home</span>
        </motion.button>

        {/* Center UI Showcase */}
        <div className="relative z-20 flex-1 flex flex-col justify-center items-center max-w-lg mx-auto w-full space-y-6">
          
          {/* Card 1: Revenue Curve Card */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: shouldReduceMotion ? 0 : [-6, 6],
              scale: 1
            }}
            transition={{
              opacity: { duration: 0.6, delay: 0.2 },
              scale: { duration: 0.6, delay: 0.2 },
              y: {
                repeat: Infinity,
                repeatType: "reverse",
                duration: 4.5,
                ease: "easeInOut"
              }
            }}
            className="w-full bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-5 rounded-2xl shadow-2xl relative overflow-hidden group hover:border-orange-500/30 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-full blur-xl pointer-events-none" />
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
                  <TrendingUp size={14} />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Revenue Stream</span>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-black flex items-center gap-0.5">
                <ArrowUpRight size={10} />
                <span>+18.4%</span>
              </span>
            </div>
            
            <div className="space-y-1 text-left">
              <div className="text-2xl font-black text-slate-100">$48,250.00</div>
              <div className="text-[10px] text-slate-500 font-medium">Weekly payout forecast</div>
            </div>

            {/* SVG mini chart graph */}
            <div className="mt-4 h-16 w-full relative">
              <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gradient-line" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(249, 115, 22, 0.4)" />
                    <stop offset="100%" stopColor="rgba(249, 115, 22, 0)" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,25 Q15,20 30,12 T60,18 T90,2 T100,5"
                  fill="none"
                  stroke="url(#gradient-line-stroke)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="stroke-orange-500"
                />
                <path
                  d="M0,25 Q15,20 30,12 T60,18 T90,2 T100,5 L100,30 L0,30 Z"
                  fill="url(#gradient-line)"
                />
                <svg id="gradient-line-stroke">
                  <linearGradient id="gradient-line-stroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#eab308" />
                  </linearGradient>
                </svg>
              </svg>
            </div>
          </motion.div>

          {/* Row of Card 2 and Card 3 */}
          <div className="grid grid-cols-2 gap-4 w-full">
            
            {/* Card 2: Shipments status */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                y: shouldReduceMotion ? 0 : [6, -6],
                scale: 1
              }}
              transition={{
                opacity: { duration: 0.6, delay: 0.35 },
                scale: { duration: 0.6, delay: 0.35 },
                y: {
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 5,
                  ease: "easeInOut"
                }
              }}
              className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-4 rounded-2xl shadow-xl text-left flex flex-col justify-between group hover:border-orange-500/20 transition-colors duration-300"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="h-7 w-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Truck size={14} />
                </div>
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Couriers Status</div>
                <div className="text-sm font-black text-slate-100 mt-1">12 Shipments</div>
                <div className="text-[9px] text-slate-400 mt-0.5">En route to consumer</div>
              </div>
              <div className="mt-3 w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "75%" }}
                  transition={{ duration: 1.5, delay: 0.6 }}
                  className="bg-orange-500 h-full rounded-full" 
                />
              </div>
            </motion.div>

            {/* Card 3: Inventory alert */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                y: shouldReduceMotion ? 0 : [-4, 4],
                scale: 1
              }}
              transition={{
                opacity: { duration: 0.6, delay: 0.45 },
                scale: { duration: 0.6, delay: 0.45 },
                y: {
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 4,
                  ease: "easeInOut"
                }
              }}
              className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-4 rounded-2xl shadow-xl text-left flex flex-col justify-between group hover:border-orange-500/20 transition-colors duration-300"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Activity size={14} />
                </div>
                <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md">Critical</span>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Live Inventory</div>
                <div className="text-sm font-black text-slate-100 mt-1">2 Low items</div>
                <div className="text-[9px] text-slate-400 mt-0.5">Restock recommended</div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Hero message at bottom */}
        <motion.div 
          variants={leftContentStagger}
          initial="hidden"
          animate="visible"
          className="relative z-20 mt-auto text-left max-w-xl"
        >
          <motion.div 
            variants={leftElement}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-orange-500/35 bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-wider mb-4"
          >
            <Store size={10} />
            <span>Secure Merchant Access</span>
          </motion.div>
          <motion.h2 
            variants={leftElement}
            className="text-3xl font-black text-slate-100 dark:text-white leading-tight"
          >
            Take command of your online store and grow.
          </motion.h2>
          <motion.p 
            variants={leftElement}
            className="mt-3 text-xs leading-relaxed text-slate-400 font-light"
          >
            Upload your inventory catalog, monitor incoming consumer orders, and track your weekly payout statements in real-time.
          </motion.p>

          <motion.div 
            variants={leftElement}
            className="mt-6 pt-5 border-t border-slate-800/80 flex items-center gap-6"
          >
            <div className="flex -space-x-2">
              {[
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
                "https://images.unsplash.com/photo-1527983359383-4758693f760c?w=100"
              ].map((src, i) => (
                <img key={i} src={src} alt="Seller avatar" className="h-7 w-7 rounded-full border border-slate-950 object-cover" />
              ))}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              Trusted by <span className="text-slate-100 dark:text-white font-extrabold">10k+ active sellers</span> worldwide.
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex flex-col justify-center items-center px-6 py-6 md:px-12 relative h-full overflow-y-auto z-10">
        {/* Mobile top navigation link */}
        <button
          onClick={() => navigate("/")}
          className="lg:hidden absolute top-5 left-5 flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>

        <motion.div 
          variants={formContainer}
          initial="hidden"
          animate="visible"
          className="w-full max-w-sm space-y-6"
        >
          {/* Logo / Heading */}
          <motion.div variants={formElement} className="flex flex-col items-center text-center space-y-2">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 3 }}
              className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 p-[1px] shadow-md shadow-orange-500/15 cursor-default"
            >
              <div className="h-full w-full bg-slate-950 rounded-xl flex items-center justify-center">
                <Logo variant="icon" className="h-6 w-6 text-orange-500" />
              </div>
            </motion.div>
            <div>
              <h1 className="text-xl font-black text-slate-100 dark:text-white tracking-tight flex items-center justify-center gap-1.5">
                <span>CartNOW</span>
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Seller</span>
              </h1>
              <p className="text-[11px] text-slate-400">
                Enter your merchant credentials to access the hub.
              </p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form variants={formElement} onSubmit={onSubmitHandler} className="space-y-3.5">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none">
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. seller@cartnow.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/30 text-xs text-slate-100 dark:text-white outline-none transition-all duration-200 placeholder:text-slate-600 focus:bg-slate-950/80 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none">
                  <Lock size={14} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-800 bg-slate-900/30 text-xs text-slate-100 dark:text-white outline-none transition-all duration-200 placeholder:text-slate-600 focus:bg-slate-950/80 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: shouldReduceMotion ? 1 : 1.01 }}
              whileTap={{ scale: shouldReduceMotion ? 1 : 0.99 }}
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-slate-100 dark:text-white py-3 text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-orange-500/20 active:scale-[0.98] cursor-pointer mt-4 disabled:opacity-50"
            >
              {submitting ? "Signing in..." : "Access Seller Dashboard"}
            </motion.button>
          </motion.form>

          {/* Footer Navigation Switchers */}
          <motion.div variants={formElement} className="space-y-3 pt-5 border-t border-slate-900">
            <p className="text-center text-xs text-slate-400">
              Don't have a seller account?{" "}
              <Link to="/signup" className="font-bold text-orange-500 hover:underline transition">
                Apply for Shop
              </Link>
            </p>
            
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 pt-3 border-t border-slate-950">
              <ShieldCheck size={12} className="text-emerald-500" />
              <span>Standard SSL Secure 256-Bit Protection</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );

};

export default Login;
