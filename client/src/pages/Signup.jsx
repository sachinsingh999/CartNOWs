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
  User,
  Mail,
  Lock,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken: setAuthToken, setRole: setAuthRole } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [token, setToken] = useState("");

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains("dark"));

  // Listen for dark mode toggle on root
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Password strength checker helper
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return { score: 0, text: "", color: "" };
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score, text: "Weak", color: "bg-red-500" };
    if (score <= 4) return { score, text: "Medium", color: "bg-orange-500" };
    return { score, text: "Strong", color: "bg-emerald-500" };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (!termsAccepted) {
      toast.error("Please accept the Terms of Service & Privacy Policy");
      return;
    }

    setLoadingSubmit(true);

    try {
      const response = await axios.post(
        `${backendUrl}/api/user/register`,
        { name, email, password }
      );

      if (response.data.success) {
        const receivedToken = response.data.token;
        setToken(receivedToken);
        localStorage.setItem("token", receivedToken);
        localStorage.setItem("role", "customer");
        setAuthToken(receivedToken);
        setAuthRole("customer");

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

        toast.success("Account created successfully 🚀");
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Account creation failed. Please try again.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleGoogleSignupSuccess = async (googleResponse) => {
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

        toast.success("Signed up successfully with Google!");
      } else {
        toast.error(response.data.message || "Google registration failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Google registration failed on server");
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

  return (
    <div className="h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] overflow-hidden bg-slate-50 dark:bg-[#09090B] px-3 sm:px-6 py-1 sm:py-2 transition-colors duration-300 flex items-center justify-center relative font-sans">
      
      {/* Ambient background rays */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#242A3B_1px,transparent_1px)] bg-[size:28px_28px] opacity-60 dark:opacity-40 pointer-events-none z-0" />
      <div className="absolute -top-24 right-1/4 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute -bottom-24 left-1/4 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[140px] pointer-events-none z-0" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mx-auto grid max-w-[1160px] w-full h-[calc(100vh-68px)] max-h-[640px] overflow-hidden rounded-lg border border-slate-200/90 dark:border-[#242A3B] bg-white dark:bg-[#151823] backdrop-blur-2xl shadow-xl dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] lg:grid-cols-[1fr_1.1fr] z-10"
      >
        {/* ================= LEFT SIDE: PREMIUM CARD CREDENTIAL FORM ================= */}
        <div className="flex items-center justify-center p-5 sm:p-6 text-left bg-white dark:bg-[#151823] lg:border-r lg:border-slate-200/90 dark:lg:border-[#242A3B] h-full overflow-hidden">
          <motion.div variants={containerVariants} className="w-full max-w-[360px] space-y-3">
            
            {/* Header info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-blue-600 rounded flex items-center justify-center text-white font-black text-xs">
                  C
                </div>
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">CartNOW Portal</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create Account</h2>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Join us for premium ordering & tracking experience</p>
            </div>

            {/* Google Signup Button */}
            <div className="relative min-h-[38px] w-full flex items-center justify-center">
              {googleLoading && (
                <div className="absolute inset-0 bg-white/90 dark:bg-[#151823]/90 flex items-center justify-center z-20 rounded-md border border-slate-200 dark:border-[#242A3B]">
                  <Loader2 size={15} className="animate-spin text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-2">Connecting Google...</span>
                </div>
              )}
              <GoogleLogin
                onSuccess={handleGoogleSignupSuccess}
                onError={() => toast.error("Google registration failed")}
                theme={isDarkMode ? "filled_black" : "outline"}
                shape="rectangular"
                size="large"
                width="360"
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 py-0.5">
              <div className="flex-1 border-t border-slate-200 dark:border-[#242A3B]" />
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Or register with</span>
              <div className="flex-1 border-t border-slate-200 dark:border-[#242A3B]" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-2">
              {/* Name */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <User size={14} className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-md border border-slate-200 dark:border-[#242A3B] bg-slate-50 dark:bg-[#1B2030] pl-10 pr-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none transition duration-200 focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#151823] placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail size={14} className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border border-slate-200 dark:border-[#242A3B] bg-slate-50 dark:bg-[#1B2030] pl-10 pr-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none transition duration-200 focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#151823] placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock size={14} className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border border-slate-200 dark:border-[#242A3B] bg-slate-50 dark:bg-[#1B2030] pl-10 pr-10 py-2 text-xs text-slate-900 dark:text-white outline-none transition duration-200 focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#151823] placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {password && (
                  <div className="space-y-0.5 pt-0.5">
                    <div className="flex justify-between items-center text-[9px] font-bold">
                      <span className="text-slate-500">Strength:</span>
                      <span className={passwordStrength.text === "Strong" ? "text-emerald-500 dark:text-emerald-400" : passwordStrength.text === "Medium" ? "text-orange-500 dark:text-orange-400" : "text-red-500 dark:text-red-400"}>
                        {passwordStrength.text}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-slate-200 dark:bg-[#1B2030] rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${passwordStrength.color} transition-all duration-300`} 
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <Lock size={14} className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Verify password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-md border border-slate-200 dark:border-[#242A3B] bg-slate-50 dark:bg-[#1B2030] pl-10 pr-10 py-2 text-xs text-slate-900 dark:text-white outline-none transition duration-200 focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#151823] placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors p-1 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start pt-0.5">
                <input
                  id="terms"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 rounded-sm border-slate-300 dark:border-[#242A3B] bg-slate-100 dark:bg-[#1B2030] text-blue-600 dark:text-blue-500 focus:ring-0 accent-blue-600 dark:accent-blue-500 cursor-pointer"
                />
                <label htmlFor="terms" className="ml-2 block text-[10px] font-bold text-slate-600 dark:text-slate-400 select-none cursor-pointer leading-normal">
                  I accept the <a href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">Terms</a> & <a href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</a>
                </label>
              </div>

              {/* Submit Btn */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loadingSubmit}
                className="w-full flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-2.5 text-xs font-black uppercase tracking-wider text-white transition duration-200 cursor-pointer shadow-lg shadow-blue-500/20 disabled:opacity-75"
              >
                {loadingSubmit ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-white" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </motion.button>
            </form>

            {/* Login Redirect Link */}
            <p className="text-center text-[11px] text-slate-600 dark:text-slate-400 font-medium pt-0.5">
              Already have an account?
              <button
                onClick={() => navigate("/login", { state: location.state })}
                className="ml-1 font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>

          </motion.div>
        </div>

        {/* ================= RIGHT SIDE: PREMIUM BRAND IMAGE/SHOWCASE ================= */}
        <div className="relative hidden lg:block overflow-hidden bg-slate-900 dark:bg-[#0F1117] h-full">
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b"
            alt="Shopping Premium Mode"
            className="absolute inset-0 h-full w-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent dark:from-[#0F1117] dark:via-[#0F1117]/40" />
          <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay" />
          
          <div className="absolute bottom-8 left-8 right-8 z-10 text-left space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">CartNOW Hub</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight">
              One account. <br />
              Endless choices.
            </h1>
            <p className="text-slate-350 dark:text-slate-400 text-xs font-light max-w-sm leading-relaxed">
              Unlock access to real-time parcel dispatch status, persistent checkout tray, personal wishlists, and direct driver chats.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
