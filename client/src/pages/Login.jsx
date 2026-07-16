import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { backendUrl } from "../config";
import { Store, Truck, Loader2, ArrowRight, Eye, EyeOff, ShoppingBag, ShoppingCart, CreditCard, Package, Tag, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const inputClass =
  "w-full rounded-xl border border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/10";

const Login = () => {
  const navigate = useNavigate();
  const { setToken: setAuthToken, setRole: setAuthRole } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

        toast.success(response.data.message || "Login successful");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Try again.");
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  // Entrance variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.97, y: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1], // easeOutExpo
        staggerChildren: 0.08,
        delayChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 120, damping: 18 }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] px-6 py-12 transition-colors duration-300 flex items-center justify-center relative overflow-hidden">

      {/* Tech Dotted Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(99,102,241,0.06)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(99,102,241,0.12)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none z-0" />

      {/* Central Ambient Aura Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-500/[0.04] dark:bg-indigo-500/[0.09] rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Decorative Floating Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -60, 40, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-600/15"
        />
        <motion.div
          animate={{
            x: [0, -30, 50, 0],
            y: [0, 50, -30, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-rose-500/10 blur-3xl dark:bg-pink-600/10"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mx-auto grid max-w-6xl w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 backdrop-blur-md shadow-sm lg:grid-cols-[1fr_440px] z-10"
      >
        {/* Left Side: Premium E-commerce Animated Showcase (Emerges / slides out on load) */}
        <motion.div
          initial={{ opacity: 0, x: -100, scale: 0.98, filter: "blur(12px)" }}
          animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          className="relative hidden min-h-[620px] lg:block overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border-r border-slate-200/10 dark:border-slate-800/10"
        >

          {/* Cyberpunk Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />

          {/* Central Radial Light Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Floating E-commerce Icon Showcase */}

          {/* 1. Floating credit card */}
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 35 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.45 }}
            className="absolute top-[22%] left-[15%] z-20"
          >
            <motion.div
              animate={{
                y: [0, -12, 0],
                rotate: [5, 12, 5],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="flex items-center justify-center p-3 bg-white/5 dark:bg-slate-900/60 backdrop-blur-md border border-white/10 dark:border-slate-800 rounded-2xl shadow-xl w-14 h-10 text-indigo-400"
            >
              <CreditCard size={18} />
            </motion.div>
          </motion.div>

          {/* 2. Floating shipping box */}
          <motion.div
            initial={{ opacity: 0, scale: 0, y: -35 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.55 }}
            className="absolute top-[18%] right-[15%] z-20"
          >
            <motion.div
              animate={{
                y: [0, 12, 0],
                rotate: [-10, -5, -10],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="flex items-center justify-center p-3 bg-white/5 dark:bg-slate-900/60 backdrop-blur-md border border-white/10 dark:border-slate-800 rounded-2xl shadow-xl text-amber-500"
            >
              <Package size={20} />
            </motion.div>
          </motion.div>

          {/* 3. Floating discount tag */}
          <motion.div
            initial={{ opacity: 0, scale: 0, x: -35 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.65 }}
            className="absolute top-[45%] left-[12%] z-20"
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [-5, 5, -5],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="flex items-center justify-center p-3 bg-white/5 dark:bg-slate-900/60 backdrop-blur-md border border-white/10 dark:border-slate-800 rounded-2xl shadow-xl text-emerald-400"
            >
              <Tag size={18} />
            </motion.div>
          </motion.div>

          {/* 4. Floating checkout cart */}
          <motion.div
            initial={{ opacity: 0, scale: 0, x: 35 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.75 }}
            className="absolute top-[40%] right-[12%] z-20"
          >
            <motion.div
              animate={{
                y: [0, 10, 0],
                rotate: [0, 8, 0],
              }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="flex items-center justify-center p-3 bg-white/5 dark:bg-slate-900/60 backdrop-blur-md border border-white/10 dark:border-slate-800 rounded-2xl shadow-xl text-rose-500"
            >
              <ShoppingCart size={20} className="animate-pulse" />
            </motion.div>
          </motion.div>

          {/* Main Central Shopping Bag Icon with animated particles/waves radiating */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-10 select-none pointer-events-none">
            <motion.div
              initial={{ scale: 0.4, opacity: 0, rotate: -12 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 70, damping: 14, delay: 0.35 }}
              className="mb-8"
            >
              <motion.div
                animate={{
                  scale: [1, 1.04, 1],
                  y: [0, -6, 0]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative w-36 h-36 bg-white/5 dark:bg-slate-900/50 backdrop-blur-xl border border-white/10 dark:border-slate-800/80 rounded-[32px] flex items-center justify-center shadow-2xl group"
              >
                {/* Outer pulsing ring */}
                <div className="absolute inset-[-10px] rounded-[38px] border border-indigo-500/20 animate-ping opacity-25" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-[-20px] rounded-[44px] border border-violet-500/10 animate-ping opacity-15" style={{ animationDuration: '4s' }} />

                <ShoppingBag size={64} className="text-slate-100 dark:text-white dark:text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />

                {/* Small sparkles around the central icon */}
                <Sparkles size={18} className="absolute top-5 right-5 text-orange-400 animate-pulse" />
              </motion.div>
            </motion.div>

            {/* Premium Branding Texts */}
            <div className="text-center space-y-3 z-10">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400"
              >
                CartNOW Platform
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-3xl font-extrabold text-slate-100 dark:text-white tracking-tight leading-none"
              >
                Elevate Your Shopping Flow
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ duration: 0.7, delay: 0.9 }}
                className="max-w-xs text-xs font-light text-slate-400 leading-relaxed mx-auto"
              >
                Securely authenticate to access your personal dashboard, synced cart, and order tracking portals.
              </motion.p>
            </div>
          </div>

        </motion.div>

        {/* Right Side: Animated Input form panel */}
        <div className="flex items-center p-6 sm:p-10 text-left bg-white dark:bg-transparent">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full"
          >
            <motion.p
              variants={itemVariants}
              className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400"
            >
              Welcome back
            </motion.p>

            <motion.h2
              variants={itemVariants}
              className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-slate-100 tracking-tight flex items-center gap-2"
            >
              <span>Login to CartNOW</span>
              <motion.div
                animate={{ rotate: [0, -12, 12, -12, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3.5 }}
                className="inline-block shrink-0"
              >
                <ShoppingBag className="text-orange-500" size={24} />
              </motion.div>
            </motion.h2>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <motion.div variants={itemVariants}>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} pr-10`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  type="submit"
                  disabled={loadingSubmit}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-950 dark:bg-indigo-600 hover:bg-slate-900 dark:hover:bg-indigo-700 py-3.5 text-xs font-black uppercase tracking-wider text-slate-100 dark:text-white transition cursor-pointer shadow disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {loadingSubmit ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-slate-100 dark:text-white" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Login</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>

            <motion.p
              variants={itemVariants}
              className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400"
            >
              Don&apos;t have an account?
              <button
                onClick={() => navigate("/signup")}
                className="ml-1 font-bold text-slate-950 dark:text-slate-100 hover:underline cursor-pointer"
              >
                Sign up
              </button>
            </motion.p>

            {/* Portal links section */}
            <motion.div
              variants={itemVariants}
              className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800"
            >
              <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
                Access Other Portals
              </p>
              <div className="grid grid-cols-2 gap-4">
                <motion.a
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="https://cartnow-seller.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xs font-bold text-slate-600 dark:text-slate-400 hover:border-orange-500 dark:hover:border-orange-500 hover:bg-orange-50/35 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-300 shadow-sm"
                >
                  <Store size={15} className="text-orange-500" />
                  <span>Seller Portal</span>
                </motion.a>

                <motion.a
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="https://cart-now-deliveryagent.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xs font-bold text-slate-600 dark:text-slate-400 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/35 dark:hover:bg-blue-950/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 shadow-sm"
                >
                  <Truck size={15} className="text-blue-500" />
                  <span>Delivery Agent</span>
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
