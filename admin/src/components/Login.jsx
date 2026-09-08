import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  Sun, 
  Moon, 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  Layers 
} from "lucide-react";
import Logo from "./Logo";
import { useTheme } from "../context/ThemeContext";

const Login = ({ setToken }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState(() => {
    return localStorage.getItem("cartnow_remembered_admin_email") || "";
  });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("cartnow_remember_admin") === "true";
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (rememberMe && email) {
      localStorage.setItem("cartnow_remembered_admin_email", email);
      localStorage.setItem("cartnow_remember_admin", "true");
    } else if (!rememberMe) {
      localStorage.removeItem("cartnow_remembered_admin_email");
      localStorage.setItem("cartnow_remember_admin", "false");
    }
  }, [rememberMe, email]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warn("Please enter both email and password");
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(`${backendUrl}/api/user/admin`, {
        email: email.trim(),
        password,
      });

      if (response.data.success) {
        const adminName = response.data.admin?.name || "Administrator";
        toast.success(`Welcome back, ${adminName}`);
        setToken(response.data.token);

        // Smart route navigation: If subadmin was on an unauthorized URL, direct them to their authorized view
        const perms = response.data.admin?.permissions || [];
        const isSuper = response.data.admin?.role === "superadmin" || perms.includes("*");
        if (!isSuper && !perms.includes("subadmins")) {
          navigate(perms.includes("orders") ? "/orders" : "/", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } else {
        toast.error(response.data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Admin login error:", error);
      const errorMsg = error.response?.data?.message || error.message || "Authentication failed";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 antialiased relative transition-colors duration-200 select-none">
      
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-20 w-full h-16 px-4 sm:px-6 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/75 dark:bg-slate-900/75 backdrop-blur-md shadow-2xs">
        <div className="flex items-center gap-3">
          <Logo className="h-8 w-auto" />
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
            Admin Portal
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">System Operational</span>
            <span className="sm:hidden">Online</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            type="button"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shadow-xs"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* Center Auth Card Section */}
      <main className="relative z-10 w-full flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl grid lg:grid-cols-12 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl shadow-slate-900/10 dark:shadow-black/60 overflow-hidden">
          
          {/* PART 1: LEFT PANEL (Brand & Operational Focus) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 xl:p-10 bg-slate-950 text-white relative overflow-hidden border-r border-slate-800/70">
            
            {/* Subtle Ambient Radial Glow inside Left Panel */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-600/15 rounded-full blur-2xl pointer-events-none" />

            {/* Top Brand Block */}
            <div className="relative z-10">
              <Logo forceWhite className="h-9 w-auto" />
              <div className="mt-8">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-blue-800/60 text-blue-400 text-[11px] font-semibold tracking-wide">
                  <Sparkles size={11} />
                  <span>Admin Console</span>
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-white mt-3 leading-snug">
                  Operations &amp; Commerce Management
                </h2>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3.5 my-8 relative z-10">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <div className="h-8 w-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                  <Activity size={16} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">Real-Time Dispatch</div>
                  <div className="text-[11px] text-slate-400">Live order routing &amp; tracking</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
                  <Layers size={16} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">Catalog &amp; Vendors</div>
                  <div className="text-[11px] text-slate-400">Inventory &amp; seller approvals</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">Role-Based Security</div>
                  <div className="text-[11px] text-slate-400">Encrypted sessions &amp; audit trails</div>
                </div>
              </div>
            </div>

            {/* Bottom Status */}
            <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-4">
              <span>CartNOW Enterprise</span>
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>System Online</span>
              </div>
            </div>

          </div>

          {/* PART 2: RIGHT PANEL (Authentication Form) */}
          <div className="lg:col-span-7 p-7 sm:p-10 flex flex-col justify-center">
            
            {/* Header */}
            <div className="mb-6">
              <div className="lg:hidden mb-4">
                <Logo className="h-8 w-auto" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Sign In
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Enter your credentials to access the administrative dashboard.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={onSubmitHandler} className="space-y-4">
              
              {/* Email Field */}
              <div className="space-y-1.5">
                <label 
                  htmlFor="admin-email" 
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Mail size={16} />
                  </div>
                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@cartnow.com"
                    autoComplete="email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label 
                  htmlFor="admin-password" 
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Lock size={16} />
                  </div>
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 transition-all shadow-2xs"
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

              {/* Options Row */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded-md border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Remember me
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-3 py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-white" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Quick Credential Quick-Fill Helpers */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-1.5 flex items-center justify-between">
                  <span>Quick Fill Credentials:</span>
                  <span className="text-[10px] text-blue-500 font-normal">Click to auto-fill</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("admin@cartnow.com");
                      setPassword("ADMIN@123");
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-[11px] font-medium bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 hover:border-blue-300 transition text-left cursor-pointer border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200">👑 Superadmin</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">admin@cartnow.com</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("jay@cartnow.com");
                      setPassword("Jay@1234");
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-[11px] font-medium bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 hover:border-blue-300 transition text-left cursor-pointer border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200">🛡️ Jay (Sub-Admin)</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">jay@cartnow.com</span>
                  </button>
                </div>
              </div>

            </form>

          </div>

        </div>
      </main>

      {/* Clean Footer */}
      <footer className="relative z-10 w-full py-3.5 px-6 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200/80 dark:border-slate-800/80">
        CartNOW Enterprise &bull; Admin Access
      </footer>

    </div>
  );
};

export default Login;
