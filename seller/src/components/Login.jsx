import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { backendUrl } from "../config";
import Logo from "./Logo";
import { 
  Store, Mail, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, 
  TrendingUp, ArrowUpRight, Truck, Activity, Sparkles
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const Login = ({ setToken, setSeller }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-950 text-slate-100 font-sans selection:bg-orange-500 selection:text-white relative">
      
      {/* Back to Home Button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate("/")}
        className="absolute top-5 left-5 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer shadow-md"
      >
        <ArrowLeft size={14} className="text-orange-500" />
        <span>Back to Home</span>
      </motion.button>

      {/* 2-PART CENTERED BOX CONTAINER */}
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-4xl grid lg:grid-cols-2 rounded-3xl bg-slate-900 shadow-2xl shadow-black/80 overflow-hidden my-auto"
      >
        
        {/* PART 1: LEFT BOX (Brand Showcase & Highlights) */}
        <div className="relative hidden lg:flex flex-col justify-between p-8 xl:p-10 bg-slate-950">
          
          {/* Header Logo */}
          <div className="flex items-center justify-between z-10">
            <Logo forceWhite className="h-10 w-auto" />
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold uppercase text-orange-400">
              <Sparkles size={10} /> Merchant Portal
            </span>
          </div>

          {/* Center Visual Cards Showcase */}
          <div className="my-8 space-y-4 z-10">
            {/* Revenue Stream Metric */}
            <motion.div 
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900 p-4 rounded-2xl shadow-lg relative"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
                    <TrendingUp size={13} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revenue Forecast</span>
                </div>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                  <ArrowUpRight size={10} /> +18.4%
                </span>
              </div>
              <div className="text-xl font-black text-slate-100">$48,250.00</div>
              <p className="text-[9.5px] text-slate-400 font-medium">Weekly payout projection</p>
            </motion.div>

            {/* Quick Metrics Split */}
            <div className="grid grid-cols-2 gap-3">
              <motion.div 
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="bg-slate-900 p-3.5 rounded-2xl shadow-xs"
              >
                <div className="flex items-center gap-2 mb-1.5 text-indigo-400">
                  <Truck size={13} />
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase">Dispatch</span>
                </div>
                <div className="text-sm font-black text-slate-100">12 Shipments</div>
                <p className="text-[9px] text-slate-400 mt-0.5">En route to customers</p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="bg-slate-900 p-3.5 rounded-2xl shadow-xs"
              >
                <div className="flex items-center gap-2 mb-1.5 text-amber-400">
                  <Activity size={13} />
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase">Inventory</span>
                </div>
                <div className="text-sm font-black text-slate-100">Live Sync</div>
                <p className="text-[9px] text-slate-400 mt-0.5">Auto-replenish ready</p>
              </motion.div>
            </div>
          </div>

          {/* Bottom Callout */}
          <div className="z-10 text-left pt-4">
            <h3 className="text-base font-bold text-slate-100">Grow your merchant business.</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
              Manage inventory, monitor real-time orders, and track payout statements in one dashboard.
            </p>
          </div>
        </div>

        {/* PART 2: RIGHT BOX (Login Form) */}
        <div className="p-8 sm:p-10 flex flex-col justify-center bg-slate-900">
          
          {/* Mobile Logo Branding */}
          <div className="lg:hidden flex justify-center mb-6">
            <Logo forceWhite className="h-10 w-auto" />
          </div>

          <div className="space-y-6 max-w-sm mx-auto w-full">
            {/* Header */}
            <div className="text-center lg:text-left space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">Merchant Sign In</h2>
              <p className="text-xs text-slate-400">Enter your credentials to access your seller account</p>
            </div>

            {/* Login Form */}
            <form onSubmit={onSubmitHandler} className="space-y-4">
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
                    placeholder="seller@cartnow.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 text-xs text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-600 focus:ring-2 focus:ring-orange-500/20 shadow-2xs"
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
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 text-xs text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-600 focus:ring-2 focus:ring-orange-500/20 shadow-2xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-200 cursor-pointer transition-colors"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white py-3 text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-md shadow-orange-600/20 cursor-pointer mt-2 disabled:opacity-50"
              >
                {submitting ? "Signing in..." : "Access Seller Dashboard"}
              </motion.button>
            </form>

            {/* Footer */}
            <div className="space-y-3 pt-4 text-center">
              <p className="text-xs text-slate-400">
                Don't have a seller account?{" "}
                <Link to="/signup" className="font-bold text-orange-500 hover:underline transition">
                  Apply for Shop
                </Link>
              </p>
              
              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 pt-2">
                <ShieldCheck size={12} className="text-emerald-500" />
                <span>SSL Encrypted 256-Bit Merchant Access</span>
              </div>
            </div>

          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default Login;
