import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { backendUrl } from "../config";
import Logo from "./Logo";
import { useTheme } from "../context/ThemeContext";
import { 
  Store, Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight, ShieldCheck, 
  TrendingUp, ArrowUpRight, Truck, Activity, Sparkles, Loader2,
  CheckCircle2, Sun, Moon, HelpCircle, X, ExternalLink, Copy, Check,
  Shield, Zap, BadgePercent
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Login = ({ setToken, setSeller }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Form states with Remember Me support
  const [email, setEmail] = useState(() => {
    return localStorage.getItem("cartnow_remembered_seller_email") || "";
  });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("cartnow_remember_seller") === "true";
  });
  const [submitting, setSubmitting] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    if (rememberMe && email) {
      localStorage.setItem("cartnow_remembered_seller_email", email);
      localStorage.setItem("cartnow_remember_seller", "true");
    } else if (!rememberMe) {
      localStorage.removeItem("cartnow_remembered_seller_email");
      localStorage.setItem("cartnow_remember_seller", "false");
    }
  }, [rememberMe, email]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.warn("Please enter both email and password.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(`${backendUrl}/api/seller/login`, {
        email: email.trim(),
        password,
      });

      if (response.data.success) {
        toast.success(response.data.message || "Welcome back to Merchant Central!");
        setSeller(response.data.seller);
        setToken(response.data.token);
      } else {
        toast.error(response.data.message || "Authentication failed");
      }
    } catch (error) {
      console.error("Seller login error:", error);
      toast.error(error.response?.data?.message || error.message || "Unable to log in");
    } finally {
      setSubmitting(false);
    }
  };

  const copySupportEmail = () => {
    navigator.clipboard.writeText("seller-support@cartnow.com");
    setCopiedEmail(true);
    toast.success("Support email copied to clipboard!");
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 antialiased relative transition-colors duration-200 select-none overflow-x-hidden">
      
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
            backgroundSize: "28px 28px"
          }}
        />
        {/* Radial ambient glows */}
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
            <span>Merchant Network Active</span>
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

          {/* Back to Home CTA */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Home</span>
          </button>

          {/* Apply for Shop */}
          <Link
            to="/signup"
            className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-xs transition cursor-pointer"
          >
            <span>Apply</span>
          </Link>
        </div>
      </header>

      {/* CENTER AUTHENTICATION CARD SECTION */}
      <main className="relative z-10 w-full flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 my-auto">
        <motion.div 
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl grid lg:grid-cols-12 rounded-3xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl shadow-slate-900/10 dark:shadow-black/70 overflow-hidden"
        >
          
          {/* ============================================================ */}
          {/* PART 1: LEFT PANEL - BRAND SHOWCASE & MERCHANT HIGHLIGHTS    */}
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
                  <span>Enterprise Edition</span>
                </span>
              </div>

              <div className="mt-8">
                <h2 className="text-2xl xl:text-3xl font-black tracking-tight text-white leading-tight">
                  Scale Your Storefront Across India.
                </h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Real-time inventory sync, automated customer dispatches, and next-day payout settlements in one unified merchant command center.
                </p>
              </div>
            </div>

            {/* Visual Live Analytics & Showcase Cards */}
            <div className="my-7 space-y-3 relative z-10">
              
              {/* Revenue Projection Card */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-lg relative overflow-hidden">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center font-bold">
                      <TrendingUp size={14} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Weekly GMV Forecast</span>
                      <span className="text-[10px] text-slate-500">Live algorithm projection</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <ArrowUpRight size={11} /> +24.8%
                  </span>
                </div>
                
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-white tracking-tight">₹1,48,250.00</span>
                  <span className="text-[11px] font-semibold text-slate-400">/ 7 Days</span>
                </div>

                {/* Simulated Growth Bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                  <div className="bg-gradient-to-r from-orange-500 to-amber-400 h-full w-[78%] rounded-full animate-pulse" />
                </div>
              </div>

              {/* 2-Column Live Metric Badges */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-indigo-400 mb-1">
                    <Truck size={13} />
                    <span className="text-[10px] font-bold uppercase text-slate-400">Fulfillment</span>
                  </div>
                  <div className="text-sm font-black text-white">48 Shipments</div>
                  <p className="text-[9.5px] text-slate-400 font-medium">99.8% On-Time SLA</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-amber-400 mb-1">
                    <Activity size={13} />
                    <span className="text-[10px] font-bold uppercase text-slate-400">Catalog Sync</span>
                  </div>
                  <div className="text-sm font-black text-white">Multi-Channel</div>
                  <p className="text-[9.5px] text-slate-400 font-medium">Auto-replenish active</p>
                </div>
              </div>

              {/* Feature Benefit Ticker */}
              <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/60 space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2 text-slate-300">
                  <Zap size={12} className="text-orange-400 shrink-0" />
                  <span>Instant Payouts directly to your linked bank account</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <BadgePercent size={12} className="text-emerald-400 shrink-0" />
                  <span>0% Listing Fee on your first 100 marketplace items</span>
                </div>
              </div>

            </div>

            {/* Bottom Merchant Trust Footer */}
            <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-4">
              <span className="font-semibold text-slate-300">CartNOW Marketplace</span>
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                <ShieldCheck size={13} />
                <span>Verified Merchant Vault</span>
              </div>
            </div>

          </div>

          {/* ============================================================ */}
          {/* PART 2: RIGHT PANEL - SELLER AUTHENTICATION FORM              */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 p-7 sm:p-10 lg:p-12 flex flex-col justify-center bg-white dark:bg-slate-900/95">
            
            {/* Mobile Header Branding */}
            <div className="lg:hidden flex items-center justify-between pb-6 mb-4 border-b border-slate-200 dark:border-slate-800">
              <Logo className="h-8 w-auto" />
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <ArrowLeft size={13} />
                <span>Home</span>
              </button>
            </div>

            <div className="max-w-md mx-auto w-full space-y-6">
              
              {/* Form Title & Subtitle */}
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[11px] font-bold mb-2">
                  <Store size={12} />
                  <span>Merchant Sign In</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Welcome back, Merchant
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Enter your credentials to securely access your seller command center.
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={onSubmitHandler} className="space-y-4">
                
                {/* Email Address Field */}
                <div className="space-y-1.5">
                  <label 
                    htmlFor="seller-email" 
                    className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                  >
                    Registered Business Email
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
                      <Mail size={16} />
                    </span>
                    <input
                      id="seller-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seller@cartnow.com"
                      autoComplete="email"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-2xs font-medium"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label 
                      htmlFor="seller-password" 
                      className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                    >
                      Account Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-500 transition cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
                      <Lock size={16} />
                    </span>
                    <input
                      id="seller-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      required
                      className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-2xs font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded-md border-slate-300 dark:border-slate-700 text-orange-600 focus:ring-orange-500 cursor-pointer accent-orange-600"
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      Keep me logged in on this browser
                    </span>
                  </label>
                </div>

                {/* Primary Submit Button */}
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
                      <span>Authenticating Merchant...</span>
                    </>
                  ) : (
                    <>
                      <span>Access Seller Dashboard</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Registration Link & Security Guarantee */}
              <div className="space-y-3 pt-2 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Don't have an approved merchant account yet?{" "}
                  <Link 
                    to="/signup" 
                    className="font-extrabold text-orange-600 dark:text-orange-400 hover:text-orange-500 hover:underline transition inline-flex items-center gap-1"
                  >
                    <span>Apply for Shop</span>
                    <ArrowUpRight size={12} />
                  </Link>
                </p>

                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 pt-1">
                  <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
                  <span>256-Bit SSL Encrypted &bull; PCI-DSS Compliant &bull; Verified Merchant Gateway</span>
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
          <button 
            type="button" 
            onClick={() => setShowForgotModal(true)} 
            className="hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
          >
            Seller Support
          </button>
          <Link to="/signup" className="text-orange-600 dark:text-orange-400 font-semibold hover:underline">
            Become a Seller
          </Link>
        </div>
      </footer>

      {/* ============================================================ */}
      {/* FORGOT PASSWORD / MERCHANT HELP MODAL                         */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5 text-left"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                    <HelpCircle size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Password & Account Recovery
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      CartNOW Merchant Security Assistance
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  To protect customer payment channels and store credentials, merchant password changes require verified administrative assistance.
                </p>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>Contact Merchant Helpdesk:</span>
                    <button
                      type="button"
                      onClick={copySupportEmail}
                      className="text-[10px] text-orange-600 dark:text-orange-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedEmail ? <Check size={11} /> : <Copy size={11} />}
                      <span>{copiedEmail ? "Copied" : "Copy Email"}</span>
                    </button>
                  </div>
                  <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 select-all">
                    seller-support@cartnow.com
                  </div>
                  <p className="text-[10.5px] text-slate-400">
                    Include your registered Shop Name and business phone number. Average response time: <strong>&lt; 15 minutes</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    copySupportEmail();
                    setShowForgotModal(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 transition cursor-pointer shadow-sm"
                >
                  Copy &amp; Contact Support
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Login;
