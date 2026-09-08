import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { backendUrl } from "../config";
import Logo from "../components/Logo";
import { useTheme } from "../context/ThemeContext";
import { 
  Store, Mail, Lock, User, Phone, CheckCircle, Eye, EyeOff, 
  ArrowLeft, ArrowRight, ShieldCheck, Sparkles, Loader2,
  Sun, Moon, Zap, BadgePercent, TrendingUp, Truck, Check
} from "lucide-react";
import { motion } from "framer-motion";

const SignUp = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    shopName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await axios.post(`${backendUrl}/api/seller/register`, form);

      if (response.data.success) {
        toast.success(response.data.message || "Registration application submitted successfully!");
        setSubmitted(true);
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Seller registration error:", error);
      toast.error(error.response?.data?.message || error.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Success State View
  if (submitted) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-between bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 antialiased relative transition-colors duration-200 select-none">
        {/* Top Header */}
        <header className="relative z-20 w-full h-16 px-4 sm:px-8 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-2xs">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-auto" />
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-800 hidden sm:block" />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50">
              <Store size={12} />
              <span>Partner Application</span>
            </span>
          </div>
          <button
            onClick={toggleTheme}
            type="button"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shadow-xs"
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </header>

        {/* Center Success Card */}
        <div className="w-full flex-1 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-6"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-inner">
              <CheckCircle size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Application Received!</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-normal">
                Your application to become an official CartNOW merchant partner has been received and is currently under review by our operations team.
              </p>
              <div className="mt-4 p-3.5 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 rounded-2xl text-xs font-semibold text-orange-700 dark:text-orange-300">
                You will receive an email confirmation once your shop is verified and activated.
              </div>
            </div>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-md shadow-orange-600/20 cursor-pointer"
            >
              <span>Return to Sign In</span>
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 w-full py-4 px-6 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200/80 dark:border-slate-800/80">
          CartNOW Technologies Inc. &bull; Merchant Central
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 antialiased relative transition-colors duration-200 select-none overflow-x-hidden">
      
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
            backgroundSize: "28px 28px"
          }}
        />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-500/10 dark:bg-orange-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-amber-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-rose-500/5 dark:bg-orange-600/10 rounded-full blur-3xl" />
      </div>

      {/* TOP NAVIGATION BAR */}
      <header className="relative z-20 w-full h-16 px-4 sm:px-8 flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c121e]/80 backdrop-blur-xl shadow-2xs">
        <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => navigate("/")}>
          <Logo className="h-7 sm:h-8 w-auto" />
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span>Merchant</span>
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Live Network Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Applications Open</span>
          </div>

          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center border border-slate-200/90 dark:border-white/10 bg-slate-100/80 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 hover:border-orange-500/40 transition-all cursor-pointer shadow-2xs"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Back to Home Button */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Home</span>
          </button>

          {/* Sign In Navigation Link */}
          <Link
            to="/login"
            className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-xs transition cursor-pointer"
          >
            <span>Sign In</span>
          </Link>
        </div>
      </header>

      {/* CENTER SIGNUP CONTAINER */}
      <main className="relative z-10 w-full flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 my-auto">
        <motion.div 
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl grid lg:grid-cols-12 rounded-3xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl shadow-slate-900/10 dark:shadow-black/70 overflow-hidden"
        >
          
          {/* ============================================================ */}
          {/* PART 1: LEFT PANEL - PARTNER PERKS & SHOWCASE                */}
          {/* ============================================================ */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 xl:p-10 bg-slate-950 text-white relative overflow-hidden border-r border-slate-800/70">
            
            {/* Ambient Interior Glows */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-orange-600/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-amber-600/15 rounded-full blur-2xl pointer-events-none" />

            {/* Top Brand Block */}
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <Logo forceWhite className="h-9 w-auto" />
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-950/80 border border-orange-800/60 text-orange-400 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles size={11} />
                  <span>Onboarding Portal</span>
                </span>
              </div>

              <div className="mt-8">
                <h2 className="text-2xl xl:text-3xl font-black tracking-tight text-white leading-tight">
                  Launch Your Digital Store in Minutes.
                </h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Join India's fastest-growing merchant network with zero setup costs, automated delivery dispatch, and next-day settlements.
                </p>
              </div>
            </div>

            {/* Merchant Advantages List */}
            <div className="my-6 space-y-3 relative z-10">
              <motion.div 
                whileHover={{ y: -2 }}
                className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-6 w-6 rounded-lg bg-orange-500/15 text-orange-400 flex items-center justify-center">
                    <Zap size={13} />
                  </div>
                  <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider">Instant Storefront</h4>
                </div>
                <p className="text-xs text-slate-300 font-medium pl-8">Create your shop profile and publish catalogs in under 5 minutes with AI matrix tools.</p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -2 }}
                className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-6 w-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                    <BadgePercent size={13} />
                  </div>
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Automated Next-Day Payouts</h4>
                </div>
                <p className="text-xs text-slate-300 font-medium pl-8">Direct bank payouts every Tuesday and Friday with real-time settlement reporting.</p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -2 }}
                className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-6 w-6 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                    <Truck size={13} />
                  </div>
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Integrated Delivery Fleet</h4>
                </div>
                <p className="text-xs text-slate-300 font-medium pl-8">Doorstep order pick-up from your warehouse with live GPS tracking for customers.</p>
              </motion.div>
            </div>

            {/* Bottom Callout */}
            <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-4">
              <span className="font-semibold text-slate-300">CartNOW Marketplace</span>
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                <ShieldCheck size={13} />
                <span>10,000+ Verified Merchants</span>
              </div>
            </div>

          </div>

          {/* ============================================================ */}
          {/* PART 2: RIGHT PANEL - SIGN UP APPLICATION FORM               */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-white dark:bg-slate-900/95">
            
            {/* Mobile Header Branding */}
            <div className="lg:hidden flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
              <Logo className="h-8 w-auto" />
              <Link
                to="/login"
                className="text-xs font-bold text-orange-600 dark:text-orange-400"
              >
                Sign In
              </Link>
            </div>

            <div className="max-w-md mx-auto w-full space-y-4">
              
              {/* Header */}
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[11px] font-bold mb-1.5">
                  <Store size={12} />
                  <span>Partner Registration</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Apply for Seller Account
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Fill in your store details to begin onboarding on CartNOW marketplace.
                </p>
              </div>

              {/* Registration Form */}
              <form onSubmit={onSubmitHandler} className="space-y-3">
                
                {/* Shop Name */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Registered Shop / Brand Name <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
                      <Store size={15} />
                    </span>
                    <input
                      type="text"
                      value={form.shopName}
                      onChange={(e) => updateField("shopName", e.target.value)}
                      placeholder="e.g. Supermart & Grocers"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Full Name & Phone Number (2 cols on sm) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Merchant Contact Name <span className="text-orange-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
                        <User size={15} />
                      </span>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Mobile Number <span className="text-orange-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
                        <Phone size={15} />
                      </span>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 font-medium"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Business Email Address <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
                      <Mail size={15} />
                    </span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="e.g. merchant@cartnow.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Create Password <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
                      <Lock size={15} />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      placeholder="Min 6 chars with letter and number"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Compact Password Strength Bar & Requirements */}
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 space-y-1 mt-1 text-left">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-400 uppercase tracking-wider text-[9px]">Password Strength</span>
                      {form.password && (
                        <span className={
                          form.password.length >= 8 && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password)
                            ? "text-emerald-500 dark:text-emerald-400 font-extrabold"
                            : form.password.length >= 6
                            ? "text-amber-500 dark:text-amber-400 font-extrabold"
                            : "text-rose-500 dark:text-rose-400 font-extrabold"
                        }>
                          {form.password.length >= 8 && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password)
                            ? "Strong"
                            : form.password.length >= 6
                            ? "Medium"
                            : "Weak"}
                        </span>
                      )}
                    </div>

                    <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                      <div className={`h-full transition-all duration-300 ${
                        form.password.length >= 1 ? (form.password.length >= 6 ? "bg-amber-500 w-1/3" : "bg-rose-500 w-1/3") : "bg-transparent w-0"
                      }`} />
                      <div className={`h-full transition-all duration-300 ${
                        form.password.length >= 6 && (/[A-Z]/.test(form.password) || /[0-9]/.test(form.password)) ? "bg-amber-500 w-1/3" : "bg-transparent w-0"
                      }`} />
                      <div className={`h-full transition-all duration-300 ${
                        form.password.length >= 8 && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password) ? "bg-emerald-500 w-1/3" : "bg-transparent w-0"
                      }`} />
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[9px]">
                      <div className={`flex items-center gap-1 ${form.password.length >= 6 ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-400"}`}>
                        <span>{form.password.length >= 6 ? "✓" : "•"}</span> Min 6 chars
                      </div>
                      <div className={`flex items-center gap-1 ${/[A-Z]/.test(form.password) ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-400"}`}>
                        <span>{/[A-Z]/.test(form.password) ? "✓" : "•"}</span> 1 Capital (A-Z)
                      </div>
                      <div className={`flex items-center gap-1 ${/[0-9]/.test(form.password) ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-400"}`}>
                        <span>{/[0-9]/.test(form.password) ? "✓" : "•"}</span> 1 Number (0-9)
                      </div>
                      <div className={`flex items-center gap-1 ${/[^A-Za-z0-9]/.test(form.password) ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-400"}`}>
                        <span>{/[^A-Za-z0-9]/.test(form.password) ? "✓" : "•"}</span> 1 Symbol (@#$)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-orange-600 hover:bg-orange-500 active:bg-orange-700 shadow-lg shadow-orange-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-white" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Shop Application</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Already Registered Link & Trust Bar */}
              <div className="space-y-2 pt-2 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Already have an approved merchant account?{" "}
                  <Link 
                    to="/login" 
                    className="font-extrabold text-orange-600 dark:text-orange-400 hover:text-orange-500 hover:underline transition"
                  >
                    Sign In here
                  </Link>
                </p>

                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 pt-1">
                  <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
                  <span>256-Bit SSL Encrypted &bull; PCI-DSS Compliant Gateway</span>
                </div>
              </div>

            </div>

          </div>

        </motion.div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 w-full py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span>&copy; {new Date().getFullYear()} CartNOW Technologies Inc.</span>
          <span>&bull;</span>
          <span>Merchant Central</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <Link to="/" className="hover:text-slate-800 dark:hover:text-white transition">Platform Guidelines</Link>
          <Link to="/login" className="hover:text-slate-800 dark:hover:text-white transition">Seller Sign In</Link>
          <span className="text-orange-600 dark:text-orange-400 font-semibold">
            Merchant Onboarding
          </span>
        </div>
      </footer>

    </div>
  );
};

export default SignUp;
