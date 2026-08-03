import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { backendUrl } from "../config";
import { 
  Store, 
  Truck, 
  Loader2, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  ShoppingBag, 
  ShieldCheck, 
  ExternalLink,
  Warehouse,
  MapPin,
  Package,
  Layers,
  Sparkles,
  Mail,
  Lock,
  CheckCircle2,
  Cpu
} from "lucide-react";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken: setAuthToken, setRole: setAuthRole } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains("dark"));

  // Listen for dark mode toggle on root
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Load remembered email if available
  useEffect(() => {
    const savedEmail = localStorage.getItem("remembered_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);

    try {
      const response = await axios.post(
        `${backendUrl}/api/user/login`,
        { email, password }
      );

      if (response.data.success) {
        const receivedToken = response.data.token;
        setToken(receivedToken);
        localStorage.setItem("token", receivedToken);
        localStorage.setItem("role", "customer");
        setAuthToken(receivedToken);
        setAuthRole("customer");

        if (rememberMe) {
          localStorage.setItem("remembered_email", email);
        } else {
          localStorage.removeItem("remembered_email");
        }

        // Merge guest cart items
        const guestCart = JSON.parse(localStorage.getItem("cart") || "{}");
        for (const key in guestCart) {
          const [itemId, size] = key.split("_");
          const qty = guestCart[key];
          try {
            await axios.post(
              `${backendUrl}/api/cart/add`,
              { itemId, size, qty },
              { headers: { Authorization: `Bearer ${receivedToken}` } }
            );
          } catch (mergeErr) {
            console.error("Cart merge error:", mergeErr);
          }
        }
        localStorage.removeItem("cart");

        // Merge guest wishlist items
        const guestWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
        if (guestWishlist.length > 0) {
          try {
            const currentWishlistRes = await axios.post(
              `${backendUrl}/api/wishlist/get`,
              {},
              { headers: { Authorization: `Bearer ${receivedToken}` } }
            );
            if (currentWishlistRes.data.success) {
              const serverWishlistIds = currentWishlistRes.data.wishlist || [];
              const toMerge = guestWishlist.filter(id => !serverWishlistIds.includes(id));

              for (const productId of toMerge) {
                await axios.post(
                  `${backendUrl}/api/wishlist/toggle`,
                  { productId },
                  { headers: { Authorization: `Bearer ${receivedToken}` } }
                );
              }
            }
          } catch (mergeWishErr) {
            console.error("Wishlist merge error:", mergeWishErr);
          }
        }
        localStorage.removeItem("wishlist");

        toast.success("Logged in successfully 🚀");
      } else {
        toast.error(response.data.message || "Invalid login credentials");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed. Please verify credentials.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleGoogleLoginSuccess = async (googleResponse) => {
    setGoogleLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/user/google-login`, {
        idToken: googleResponse.credential,
      });

      if (response.data.success) {
        const receivedToken = response.data.token;
        setToken(receivedToken);
        localStorage.setItem("token", receivedToken);
        localStorage.setItem("role", "customer");
        setAuthToken(receivedToken);
        setAuthRole("customer");

        // Merge guest cart
        const guestCart = JSON.parse(localStorage.getItem("cart") || "{}");
        for (const key in guestCart) {
          const [itemId, size] = key.split("_");
          const qty = guestCart[key];
          try {
            await axios.post(
              `${backendUrl}/api/cart/add`,
              { itemId, size, qty },
              { headers: { Authorization: `Bearer ${receivedToken}` } }
            );
          } catch (mergeErr) {
            console.error("Cart merge error:", mergeErr);
          }
        }
        localStorage.removeItem("cart");

        // Merge guest wishlist
        const guestWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
        if (guestWishlist.length > 0) {
          try {
            const currentWishlistRes = await axios.post(
              `${backendUrl}/api/wishlist/get`,
              {},
              { headers: { Authorization: `Bearer ${receivedToken}` } }
            );
            if (currentWishlistRes.data.success) {
              const serverWishlistIds = currentWishlistRes.data.wishlist || [];
              const toMerge = guestWishlist.filter(id => !serverWishlistIds.includes(id));

              for (const productId of toMerge) {
                await axios.post(
                  `${backendUrl}/api/wishlist/toggle`,
                  { productId },
                  { headers: { Authorization: `Bearer ${receivedToken}` } }
                );
              }
            }
          } catch (mergeWishErr) {
            console.error("Wishlist merge error:", mergeWishErr);
          }
        }
        localStorage.removeItem("wishlist");

        toast.success("Successfully logged in with Google!");
      } else {
        toast.error(response.data.message || "Google Authentication failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Google verification failed on server");
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      const from = location.state?.from;
      if (from) {
        const path = typeof from === "string"
          ? from
          : `${from.pathname || "/"}${from.search || ""}${from.hash || ""}`;
        const targetState = typeof from === "object" ? from.state : undefined;
        navigate(path, { replace: true, state: targetState });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [token, navigate, location.state]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const illustrationVariants = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] overflow-hidden bg-slate-50 dark:bg-[#09090B] px-3 sm:px-6 py-1 sm:py-2 transition-colors duration-300 flex items-center justify-center relative font-sans">
      
      {/* Dynamic Ambient Background Rays */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#242A3B_1px,transparent_1px)] bg-[size:28px_28px] opacity-60 dark:opacity-40 pointer-events-none z-0" />
      <div className="absolute -top-24 left-1/4 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute -bottom-24 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none z-0" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mx-auto grid max-w-[1160px] w-full h-[calc(100vh-68px)] max-h-[640px] overflow-hidden rounded-lg border border-slate-200/90 dark:border-[#242A3B] bg-white dark:bg-[#151823] backdrop-blur-2xl shadow-xl dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] lg:grid-cols-[1.1fr_1fr] z-10"
      >
        {/* ================= LEFT SIDE: PREMIUM LOGISTICS & AI VISUALIZER ================= */}
        <motion.div
          variants={illustrationVariants}
          className="relative hidden lg:flex flex-col justify-between p-8 xl:p-9 overflow-hidden bg-slate-900 dark:bg-[#0F1117] border-r border-slate-800 dark:border-[#242A3B] select-none text-left h-full"
        >
          {/* Grid lines & ambient glow */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#242A3B15_1px,transparent_1px),linear-gradient(to_bottom,#242A3B15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[90px] pointer-events-none" />

          {/* Top Branding & Live Pill Badges */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-md flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/25 text-xs tracking-wider">
                C
              </div>
              <span className="text-xs font-extrabold text-white uppercase tracking-widest">CartNOW</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 dark:bg-[#1B2030] border border-white/10 dark:border-[#242A3B] text-[9.5px] font-bold text-blue-400">
              <Sparkles size={11} className="text-blue-400 fill-blue-400/20" />
              <span>AI Ecosystem v2.4</span>
            </div>
          </div>

          {/* Interactive Route Vector Visualization */}
          <div className="relative flex items-center justify-center py-2 z-10 w-full h-[280px]">
            <svg viewBox="0 0 450 220" className="w-full max-w-[420px] h-auto overflow-visible">
              <defs>
                <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="35%" stopColor="#8B5CF6" />
                  <stop offset="70%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>

              {/* Extended Edge-to-Edge Bezier Path */}
              <path
                d="M 15 175 Q 110 20, 210 135 C 290 200, 330 20, 435 45"
                fill="none"
                stroke="url(#routeGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="8 6"
                className="opacity-85"
              />

              {/* Node 1: Origin Smart Hub */}
              <g transform="translate(15, 175)">
                <circle cx="0" cy="0" r="16" className="fill-blue-500/10 stroke-blue-500 stroke-[2] animate-pulse" />
                <circle cx="0" cy="0" r="7" className="fill-blue-500 stroke-white stroke-[1.5]" />
              </g>

              {/* Node 2: AI Fulfillment */}
              <g transform="translate(145, 95)">
                <circle cx="0" cy="0" r="15" className="fill-purple-500/10 stroke-purple-500 stroke-[2] animate-pulse" style={{ animationDelay: "0.8s" }} />
                <circle cx="0" cy="0" r="6.5" className="fill-purple-500 stroke-white stroke-[1.5]" />
              </g>

              {/* Node 3: Regional Transit */}
              <g transform="translate(285, 125)">
                <circle cx="0" cy="0" r="15" className="fill-amber-500/10 stroke-amber-500 stroke-[2] animate-pulse" style={{ animationDelay: "1.6s" }} />
                <circle cx="0" cy="0" r="6.5" className="fill-amber-500 stroke-white stroke-[1.5]" />
              </g>

              {/* Node 4: Express Destination */}
              <g transform="translate(435, 45)">
                <circle cx="0" cy="0" r="18" className="fill-emerald-500/10 stroke-emerald-500 stroke-[2] animate-pulse" style={{ animationDelay: "2.4s" }} />
                <circle cx="0" cy="0" r="9" className="fill-emerald-500 stroke-white stroke-[1.5]" />
              </g>

              {/* Animated Delivery Van Running Along Path */}
              <motion.g
                animate={{
                  x: [15, 60, 110, 145, 180, 210, 250, 285, 330, 380, 435],
                  y: [175, 100, 40, 95, 125, 135, 170, 125, 55, 30, 45],
                  rotate: [-40, -42, 5, 25, 15, 25, -25, -45, -35, 10, 5]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <circle cx="0" cy="0" r="13" className="fill-blue-600 stroke-white stroke-[2] shadow-lg" />
                <g transform="translate(-7, -7)">
                  <Truck size={14} className="text-white shrink-0" />
                </g>
              </motion.g>
            </svg>

            {/* Live Floating Tracking HUD */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-2 left-2 bg-slate-900/90 dark:bg-[#1B2030]/90 border border-slate-800 dark:border-[#242A3B] backdrop-blur-xl p-3 rounded-lg shadow-xl w-56 text-left flex gap-3 z-20"
            >
              <div className="h-8.5 w-8.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md flex items-center justify-center shrink-0">
                <Truck size={17} className="animate-bounce" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Live Express</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <h4 className="text-[11px] font-black text-white mt-0.5 truncate">Dispatch #CN-9042</h4>
                <p className="text-[9px] text-slate-400 font-medium mt-0.5">Status: <strong className="text-emerald-400 font-bold">On Route</strong></p>
              </div>
            </motion.div>
          </div>

          {/* Heading and Platform Capabilities */}
          <div className="z-10 space-y-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
              Instant Access. <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Seamless Shopping.</span>
            </h1>
            
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {["⚡ Real-Time Tracking", "🤖 AI Try-On Suite", "🔒 256-Bit SSL Vault"].map((badge) => (
                <span key={badge} className="px-2.5 py-1 rounded-md bg-white/10 dark:bg-[#1B2030] border border-white/10 dark:border-[#242A3B] text-slate-200 dark:text-slate-300 text-[9.5px] font-bold">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ================= RIGHT SIDE: PREMIUM AUTHENTICATION CARD ================= */}
        <div className="flex items-center justify-center p-6 sm:p-8 xl:p-10 text-left bg-white dark:bg-[#151823] h-full overflow-hidden relative">
          <motion.div variants={containerVariants} className="w-full max-w-[380px] space-y-5">
            
            {/* Header Title */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-blue-600 rounded flex items-center justify-center text-white font-black text-xs">
                  C
                </div>
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">CartNOW Portal</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Welcome Back</h2>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Log in to manage orders, wishlists & fast checkout</p>
            </div>

            {/* Google OAuth Login Button */}
            <div className="relative min-h-[40px] w-full flex items-center justify-center">
              {googleLoading && (
                <div className="absolute inset-0 bg-white/90 dark:bg-[#151823]/90 flex items-center justify-center z-20 rounded-md border border-slate-200 dark:border-[#242A3B]">
                  <Loader2 size={15} className="animate-spin text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-2">Authenticating Google...</span>
                </div>
              )}
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={() => toast.error("Google Authentication failed")}
                theme={isDarkMode ? "filled_black" : "outline"}
                shape="rectangular"
                size="large"
                width="380"
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 py-0.5">
              <div className="flex-1 border-t border-slate-200 dark:border-[#242A3B]" />
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Or credentials</span>
              <div className="flex-1 border-t border-slate-200 dark:border-[#242A3B]" />
            </div>

            {/* Email + Password Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Email Input */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail size={15} className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border border-slate-200 dark:border-[#242A3B] bg-slate-50 dark:bg-[#1B2030] pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none transition duration-200 focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#151823] placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative flex items-center">
                  <Lock size={15} className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border border-slate-200 dark:border-[#242A3B] bg-slate-50 dark:bg-[#1B2030] pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white outline-none transition duration-200 focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#151823] placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-3.5 w-3.5 rounded-sm border-slate-300 dark:border-[#242A3B] bg-slate-100 dark:bg-[#1B2030] text-blue-600 dark:text-blue-500 focus:ring-0 accent-blue-600 dark:accent-blue-500 cursor-pointer"
                  />
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Remember Me</span>
                </label>

                <div className="flex items-center gap-1 text-[9.5px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck size={12} />
                  <span>SSL Encrypted</span>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loadingSubmit}
                className="w-full flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-3 text-xs font-black uppercase tracking-wider text-white transition duration-200 cursor-pointer shadow-lg shadow-blue-500/20 disabled:opacity-75 disabled:cursor-not-allowed border border-blue-400/20"
              >
                {loadingSubmit ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-white" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </motion.button>
            </form>

            {/* Signup Redirect Link */}
            <p className="text-center text-[11px] text-slate-600 dark:text-slate-400 font-medium pt-0.5">
              New to CartNOW?
              <button
                onClick={() => navigate("/signup", { state: location.state })}
                className="ml-1 font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline cursor-pointer"
              >
                Create an Account
              </button>
            </p>

          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
