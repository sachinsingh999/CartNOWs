import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
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

  // Real-time SVG Path Animation using getPointAtLength with Package Packing & Delivery Phases
  const pathRef = useRef(null);
  const [vanState, setVanState] = useState({
    x: 15,
    y: 175,
    angle: -45,
    phase: "loading", // "loading" | "transit" | "delivered"
    progressRatio: 0
  });

  useEffect(() => {
    let animationFrameId;
    let distance = 0;
    let isPaused = false;
    let pauseTimer = null;
    const speed = 0.85; // Pixels per frame along SVG path

    const animate = () => {
      if (pathRef.current && !isPaused) {
        try {
          const totalLength = pathRef.current.getTotalLength();

          if (distance === 0) {
            // Pause 1 second at initial start for packing animation
            isPaused = true;
            setVanState({ x: 15, y: 175, angle: -45, phase: "loading", progressRatio: 0 });
            pauseTimer = setTimeout(() => {
              isPaused = false;
              distance += speed;
            }, 1000);
          } else {
            distance += speed;
            if (distance >= totalLength) {
              distance = 0; // Loop back to start & trigger 1sec pause
            }

            const ratio = distance / totalLength;
            let phase = ratio > 0.88 ? "delivered" : "transit";

            const p1 = pathRef.current.getPointAtLength(distance);
            const p2 = pathRef.current.getPointAtLength(Math.min(distance + 2, totalLength));

            const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
            setVanState({ x: p1.x, y: p1.y, angle, phase, progressRatio: ratio });
          }
        } catch (err) {
          // Fallback if SVG not rendered
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (pauseTimer) clearTimeout(pauseTimer);
    };
  }, []);

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
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Extended Edge-to-Edge Bezier Route Path */}
              <path
                ref={pathRef}
                d="M 15 175 Q 110 20, 210 135 C 290 200, 330 20, 435 45"
                fill="none"
                stroke="url(#routeGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="8 6"
                className="opacity-85"
              />

              {/* Dynamic Animated Active Speed Trail behind the Van */}
              {pathRef.current && (
                <path
                  d="M 15 175 Q 110 20, 210 135 C 290 200, 330 20, 435 45"
                  fill="none"
                  stroke="url(#routeGrad)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${vanState.progressRatio * (pathRef.current?.getTotalLength() || 500)} 1000`}
                  className="opacity-90 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                />
              )}

              {/* Node 1: Origin Warehouse Hub */}
              <g transform="translate(15, 175)">
                <circle cx="0" cy="0" r="16" className="fill-blue-500/10 stroke-blue-500 stroke-[2] animate-pulse" />
                <circle cx="0" cy="0" r="6.5" className="fill-blue-500 stroke-white stroke-[1.5]" />
              </g>

              {/* Clean Framer Motion Parcel Drop into Van at Origin */}
              {vanState.phase === "loading" && (
                <g transform="translate(15, 175)">
                  <motion.g
                    initial={{ y: -45, scale: 0.4, opacity: 0 }}
                    animate={{ y: -24, scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 220, damping: 18 }}
                  >
                    <rect x="-6" y="0" width="12" height="10" rx="1.5" fill="#F59E0B" stroke="#B45309" strokeWidth="0.8" filter="url(#glow)" />
                    <line x1="0" y1="0" x2="0" y2="10" stroke="#78350F" strokeWidth="0.8" />
                    <line x1="-6" y1="5" x2="6" y2="5" stroke="#78350F" strokeWidth="0.6" />
                  </motion.g>
                </g>
              )}

              {/* Node 4: Express Customer Destination */}
              <g transform="translate(435, 45)">
                <circle cx="0" cy="0" r="18" className={`transition-all duration-500 ${vanState.phase === "delivered" ? "fill-emerald-500/30 stroke-emerald-400 stroke-[2.5] animate-ping" : "fill-emerald-500/10 stroke-emerald-500 stroke-[2]"}`} />
                <circle cx="0" cy="0" r="7.5" className="fill-emerald-500 stroke-white stroke-[2]" />

                {/* Smooth Parcel Unbox Drop onto Destination Node */}
                {vanState.phase === "delivered" && (
                  <motion.g
                    initial={{ y: -24, scale: 0.4, opacity: 0 }}
                    animate={{ y: 12, scale: 1, opacity: 1 }}
                    transition={{ duration: 0.45, type: "spring", stiffness: 250, damping: 20 }}
                  >
                    <rect x="-6" y="-5" width="12" height="10" rx="1.5" fill="#F59E0B" stroke="#B45309" strokeWidth="0.8" />
                    <line x1="0" y1="-5" x2="0" y2="5" stroke="#78350F" strokeWidth="0.8" />
                  </motion.g>
                )}
              </g>

              {/* Native SVG getPointAtLength Delivery Van with Tires Directly ON Path */}
              <g
                transform={`translate(${vanState.x}, ${vanState.y}) rotate(${vanState.angle})`}
              >
                {/* Headlight Beam Forward Projection */}
                <path d="M 12 -15 L 34 -23 L 34 -7 L 12 -11 Z" fill="rgba(96, 165, 250, 0.45)" className="animate-pulse" />

                {/* Van Icon Shifted so Tires Rest Directly ON the Path Line */}
                <g transform="translate(-17, -27)">
                  <Truck size={34} className="text-blue-400 dark:text-blue-300 drop-shadow-[0_0_16px_rgba(59,130,246,1)] stroke-[2.5]" />

                  {/* Packed Cargo Box inside Van */}
                  <g transform="translate(4, 9)">
                    <rect x="0" y="0" width="7" height="6" rx="1" fill="#F59E0B" stroke="#B45309" strokeWidth="0.6" />
                    <line x1="3.5" y1="0" x2="3.5" y2="6" stroke="#92400E" strokeWidth="0.6" />
                  </g>
                </g>
              </g>
            </svg>

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
