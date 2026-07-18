import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { backendUrl } from "../config";
import { 
  Store, 
  Loader2, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Lock
} from "lucide-react";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

const inputClass =
  "w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 px-4 py-3.5 text-sm text-slate-900 dark:text-slate-100 outline-none transition duration-200 focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/10";

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken: setAuthToken, setRole: setAuthRole } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: "Too Weak", color: "bg-red-500" });

  // Calculate password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, text: "Too Weak", color: "bg-red-500" });
      return;
    }

    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    let text = "Weak";
    let color = "bg-red-500";
    if (score >= 4) {
      text = "Strong";
      color = "bg-emerald-500";
    } else if (score >= 2) {
      text = "Medium";
      color = "bg-orange-500";
    }

    setPasswordStrength({ score, text, color });
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!termsAccepted) {
      toast.warning("Please accept the Terms of Service & Privacy Policy");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordStrength.score < 2) {
      toast.error("Password is too weak. Please use a stronger password.");
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

        toast.success("Account created successfully!");
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong during account creation");
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

        toast.success("Successfully registered with Google!");
      } else {
        toast.error(response.data.message || "Google registration failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Google validation failed on server");
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

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#030712] px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300 flex items-center justify-center relative overflow-hidden font-sans">
      
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(37,99,235,0.03)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(37,99,235,0.08)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/[0.02] dark:bg-blue-500/[0.04] rounded-full blur-[130px] pointer-events-none z-0" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mx-auto grid max-w-[1240px] w-full overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl shadow-2xl lg:grid-cols-[1fr_1.1fr] z-10 min-h-[640px]"
      >
        {/* ================= LEFT SIDE: PREMIUM CARD CREDENTIAL FORM ================= */}
        <div className="flex items-center justify-center p-8 sm:p-12 text-left bg-white dark:bg-[#090d16]/30 lg:border-r lg:border-slate-200/10">
          <motion.div variants={containerVariants} className="w-full max-w-[390px] space-y-6">
            
            {/* Header info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">
                  C
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">CartNOW</span>
              </div>
              <h2 className="text-2xl font-black text-slate-950 dark:text-slate-100 tracking-tight">Create Account</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Join us for premium ordering and tracking experience</p>
            </div>

            {/* Google Signup Button */}
            <div className="relative min-h-[44px]">
              {googleLoading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 flex items-center justify-center z-20 rounded-xl border border-slate-200 dark:border-slate-800">
                  <Loader2 size={16} className="animate-spin text-blue-600" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-2">Connecting Google...</span>
                </div>
              )}
              <GoogleLogin
                onSuccess={handleGoogleSignupSuccess}
                onError={() => toast.error("Google registration failed")}
                theme={document.documentElement.classList.contains("dark") ? "filled_black" : "outline"}
                shape="rectangular"
                size="large"
                width="390"
                text="signup_with"
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Or signup with</span>
              <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

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

              {/* Password Field with strength indicator */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
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

                {/* Password strength visual indicator */}
                {password && (
                  <div className="space-y-1 pt-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-400">Strength:</span>
                      <span className={passwordStrength.text === "Strong" ? "text-emerald-500" : passwordStrength.text === "Medium" ? "text-orange-500" : "text-red-500"}>
                        {passwordStrength.text}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Verify password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`${inputClass} pr-10`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-blue-600 dark:hover:text-blue-500 transition-colors p-1 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Terms checkbox */}
              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                />
                <label htmlFor="terms" className="ml-2 block text-xs font-bold text-slate-550 dark:text-slate-400 select-none cursor-pointer leading-normal">
                  I accept the <a href="/terms" className="text-blue-600 dark:text-blue-500 hover:underline">Terms of Service</a> & <a href="/privacy" className="text-blue-600 dark:text-blue-500 hover:underline">Privacy Policy</a>
                </label>
              </div>

              {/* Submit btn */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loadingSubmit}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-950 dark:bg-blue-600 hover:bg-slate-900 dark:hover:bg-blue-700 py-3.5 text-xs font-black uppercase tracking-wider text-slate-100 dark:text-white transition duration-200 cursor-pointer shadow disabled:opacity-75"
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

            {/* Login redirect link */}
            <p className="text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
              Already have an account?
              <button
                onClick={() => navigate("/login", { state: location.state })}
                className="ml-1 font-bold text-blue-600 dark:text-blue-500 hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>

          </motion.div>
        </div>

        {/* ================= RIGHT SIDE: PREMIUM BRAND IMAGE/SHOWCASE ================= */}
        <div className="relative hidden lg:block overflow-hidden bg-slate-950">
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b"
            alt="Shopping Premium Mode"
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
          <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay" />
          
          <div className="absolute bottom-12 left-12 right-12 z-10 text-left space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">CartNOW Hub</span>
            <h1 className="text-3xl font-extrabold text-white leading-tight tracking-tight">
              One account. <br />
              Endless choices.
            </h1>
            <p className="text-slate-350 text-xs font-light max-w-sm leading-relaxed">
              Unlock access to real-time parcel dispatch status, persistent checkout tray, personal wishlists, and direct driver chats.
            </p>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default Signup;
