import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

const inputClass =
  "w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 px-4 py-3.5 text-sm text-slate-900 dark:text-slate-100 outline-none transition duration-200 focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/10";

const Login = () => {
  const navigate = useNavigate();
  const { setToken: setAuthToken, setRole: setAuthRole } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Load remember me email if exists
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

        // Merge guest cart items into database cart
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

        // Merge guest wishlist items into database wishlist
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

        toast.success("Logged in successfully");
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
      navigate("/");
    }
  }, [token, navigate]);

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const illustrationVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#030712] px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300 flex items-center justify-center relative overflow-hidden font-sans">
      
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(37,99,235,0.03)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(37,99,235,0.08)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/[0.02] dark:bg-blue-500/[0.04] rounded-full blur-[130px] pointer-events-none z-0" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mx-auto grid max-w-[1240px] w-full overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl shadow-2xl lg:grid-cols-[1.1fr_1fr] z-10 min-h-[640px]"
      >
        {/* ================= LEFT SIDE: PREMIUM LOGISTICS ECOSYSTEM ILLUSTRATION ================= */}
        <motion.div
          variants={illustrationVariants}
          className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-r border-slate-200/10 select-none text-left"
        >
          {/* Subtle grid mask */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808007_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

          {/* Top Branding Header */}
          <div className="flex items-center gap-2.5 z-10">
            <div className="h-9 w-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black shadow-md shadow-blue-500/20">
              C
            </div>
            <span className="text-sm font-black text-white uppercase tracking-widest">CartNOW Logistics</span>
          </div>

          {/* Interactive Logistics Dashboard Visualization */}
          <div className="relative flex items-center justify-center py-6 z-10 w-full h-[320px]">
            {/* Visual Route Path Map */}
            <svg viewBox="0 0 420 220" className="w-full max-w-[400px] h-auto overflow-visible">
              <defs>
                <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="50%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>

              {/* Dotted path curve */}
              <path
                d="M 40 160 Q 140 30, 240 130 T 380 60"
                fill="none"
                stroke="url(#routeGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="8 6"
                className="opacity-75"
              />

              {/* Node 1: Smart Warehouse Hub */}
              <g transform="translate(40, 160)" className="cursor-pointer">
                <circle cx="0" cy="0" r="16" className="fill-blue-500/10 stroke-blue-500 stroke-[2] animate-pulse" />
                <circle cx="0" cy="0" r="8" className="fill-blue-600 stroke-white stroke-[1.5]" />
              </g>

              {/* Node 2: Transit Center */}
              <g transform="translate(200, 93)" className="cursor-pointer">
                <circle cx="0" cy="0" r="16" className="fill-orange-500/10 stroke-orange-500 stroke-[2] animate-pulse" style={{ animationDelay: "1s" }} />
                <circle cx="0" cy="0" r="8" className="fill-orange-500 stroke-white stroke-[1.5]" />
              </g>

              {/* Node 3: Customer Destination */}
              <g transform="translate(380, 60)" className="cursor-pointer">
                <circle cx="0" cy="0" r="20" className="fill-emerald-500/10 stroke-emerald-500 stroke-[2] animate-pulse" style={{ animationDelay: "2s" }} />
                <circle cx="0" cy="0" r="10" className="fill-emerald-500 stroke-white stroke-[1.5]" />
              </g>
            </svg>

            {/* Simulated Live Delivery Tracker HUD Card */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-4 left-6 bg-slate-900/90 border border-slate-800 backdrop-blur-md p-4 rounded-xl shadow-xl w-60 text-left flex gap-3.5 z-20"
            >
              <div className="h-10 w-10 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-lg flex items-center justify-center shrink-0">
                <Truck size={20} className="animate-bounce" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Active Route</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <h4 className="text-xs font-black text-white mt-0.5 truncate">Package CN-89422</h4>
                <p className="text-[10px] text-slate-400 font-light mt-0.5 leading-relaxed">Status: <strong className="text-orange-500 font-bold">Out for Delivery</strong></p>
              </div>
            </motion.div>
          </div>

          {/* Heading and subtext */}
          <div className="z-10 space-y-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
              Delivered Faster. <br />
              <span className="text-blue-500">Tracked Smarter.</span>
            </h1>
            <p className="text-slate-400 text-sm font-light leading-relaxed max-w-sm">
              Sign in to manage orders, track deliveries, and enjoy a seamless shopping experience.
            </p>
          </div>
        </motion.div>

        {/* ================= RIGHT SIDE: PREMIUM AUTHENTICATION CARD ================= */}
        <div className="flex items-center justify-center p-8 sm:p-12 text-left bg-white dark:bg-[#090d16]/30">
          <motion.div variants={containerVariants} className="w-full max-w-[390px] space-y-6">
            
            {/* Logo, Welcome, and Intro */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">
                  C
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">CartNOW</span>
              </div>
              <h2 className="text-2xl font-black text-slate-950 dark:text-slate-100 tracking-tight">Welcome Back</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Please enter your credentials or use Google</p>
            </div>

            {/* Google Login Component */}
            <div className="relative min-h-[44px]">
              {googleLoading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 flex items-center justify-center z-20 rounded-xl border border-slate-200 dark:border-slate-800">
                  <Loader2 size={16} className="animate-spin text-blue-600" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-2">Connecting Google...</span>
                </div>
              )}
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={() => toast.error("Google Authentication failed")}
                theme={document.documentElement.classList.contains("dark") ? "filled_black" : "outline"}
                shape="rectangular"
                size="large"
                width="390"
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Or login with</span>
              <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
            </div>

            {/* Email + Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-500 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} pr-10`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-blue-600 dark:hover:text-blue-500 transition-colors p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me checkbox */}
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-xs font-bold text-slate-600 dark:text-slate-400 select-none cursor-pointer">
                  Remember Me
                </label>
              </div>

              {/* Submit button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loadingSubmit}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-950 dark:bg-blue-600 hover:bg-slate-900 dark:hover:bg-blue-700 py-3.5 text-xs font-black uppercase tracking-wider text-slate-100 dark:text-white transition duration-200 cursor-pointer shadow disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {loadingSubmit ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </motion.button>
            </form>

            {/* Signup redirect link */}
            <p className="text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
              Don&apos;t have an account?
              <button
                onClick={() => navigate("/signup")}
                className="ml-1 font-bold text-blue-600 dark:text-blue-500 hover:underline cursor-pointer"
              >
                Create Account
              </button>
            </p>

          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
