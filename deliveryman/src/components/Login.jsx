import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { backendUrl } from "../config";
import Logo from "./Logo";
import { Truck, Store, Mail, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, Zap, Sparkles } from "lucide-react";

const Login = ({ setToken, setDriver }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmitHandler = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    setSubmitting(true);
    try {
      const response = await axios.post(`${backendUrl}/api/deliveryman/login`, {
        email: email.trim(),
        password,
      });

      if (response.data.success) {
        toast.success(response.data.message || "Logged in successfully!");
        setDriver(response.data.driver);
        setToken(response.data.token);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    toast.info(`Filled credentials for ${demoEmail}`);
  };

  return (
    <div className="h-screen w-screen grid lg:grid-cols-[1.1fr_1fr] bg-[#07090e] text-slate-100 font-sans selection:bg-blue-600 selection:text-white overflow-hidden">
      
      {/* Left Panel: Visual/Logistics split */}
      <div className="relative hidden lg:flex flex-col justify-between p-8 overflow-hidden h-full border-r border-white/10">
        {/* Background Image with overlay */}
        <img
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d"
          alt="Logistics warehouse"
          className="absolute inset-0 h-full w-full object-cover select-none scale-105 opacity-25"
        />
        <div className="absolute inset-0 bg-[#07090e]/90 z-10" />

        {/* Back Link */}
        <button
          onClick={() => navigate("/")}
          className="relative z-20 self-start flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-white/15 bg-slate-900/80 text-xs font-mono font-bold text-slate-300 hover:text-white hover:border-white/30 transition cursor-pointer"
        >
          <ArrowLeft size={13} />
          <span>Back to Landing</span>
        </button>

        {/* Hero Message at bottom */}
        <div className="relative z-20 mt-auto text-left max-w-lg text-white">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[9px] font-mono font-bold uppercase tracking-wider mb-3">
            <Truck size={10} />
            <span>Authenticated Courier Channel</span>
          </div>
          <h2 className="text-2xl font-black uppercase font-mono tracking-tight leading-tight text-white">
            Claim deliveries. Track earnings. Drive your flow.
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-400 font-normal">
            Access your personal courier console to claim packages from the live pool, navigate GPS routes, manage OTP verifications, and monitor earnings.
          </p>

          <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-4 text-xs font-mono text-slate-400">
            <div>
              Active Network: <span className="text-emerald-400 font-bold">5,000+ Couriers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex flex-col justify-center items-center px-6 py-6 md:px-12 relative h-full overflow-y-auto bg-[#0b0f19]">
        {/* Mobile Home Nav Link */}
        <button
          onClick={() => navigate("/")}
          className="lg:hidden absolute top-4 left-4 flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft size={13} />
          <span>Back</span>
        </button>

        <div className="w-full max-w-sm space-y-4">
          {/* Logo / Heading */}
          <div className="flex flex-col items-center text-center space-y-1">
            <Logo variant="icon" className="h-10 w-10 mx-auto" />
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-mono font-bold uppercase tracking-wider mt-1">
                Courier Portal v4.2
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Enter your registered courier partner credentials.
              </p>
            </div>
          </div>

          {/* Quick Demo Autofill Chips */}
          <div className="p-2.5 bg-slate-900 border border-white/10 rounded-sm space-y-1.5 text-left">
            <div className="flex items-center justify-between text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1 text-blue-400">
                <Sparkles size={10} />
                Quick Demo Access:
              </span>
              <span>1-click fill</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleFillDemo("driver@cartnow.com", "12345678")}
                className="px-2 py-0.5 rounded-sm text-[9px] font-mono font-bold bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 border border-white/10 transition cursor-pointer"
              >
                driver@cartnow.com
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo("harshit@gmail.com", "12345678")}
                className="px-2 py-0.5 rounded-sm text-[9px] font-mono font-bold bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 border border-white/10 transition cursor-pointer"
              >
                harshit@gmail.com
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={onSubmitHandler} className="space-y-3 text-left">
            <div>
              <label className="mb-1 block text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                  <Mail size={13} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. driver@cartnow.com"
                  className="w-full pl-9 pr-3 py-2 rounded-sm border border-slate-700 bg-slate-950 text-xs text-white outline-none focus:border-blue-500 font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                  <Lock size={13} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 rounded-sm border border-slate-700 bg-slate-950 text-xs text-white outline-none focus:border-blue-500 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-1.5 rounded-sm bg-blue-600 hover:bg-blue-500 text-white py-2.5 text-xs font-mono font-bold uppercase tracking-wider transition active:scale-98 cursor-pointer mt-2 disabled:opacity-50 border border-blue-400/30"
            >
              {submitting ? (
                <div className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Zap size={13} />
              )}
              <span>{submitting ? "Authenticating..." : "Access Dispatch Console"}</span>
            </button>
          </form>

          {/* Sign Up / Switch Portal Link */}
          <div className="space-y-2.5 pt-3 border-t border-white/10 text-center font-mono text-xs">
            <p className="text-slate-400 text-[11px]">
              New courier partner?{" "}
              <Link to="/signup" className="font-bold text-blue-400 hover:underline">
                Register here
              </Link>
            </p>

            <div className="pt-2.5 border-t border-white/10">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Other CartNOW Hubs
              </p>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="http://localhost:5176"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-sm border border-white/10 bg-slate-900 text-[9px] font-bold text-slate-400 hover:text-white hover:border-white/20 transition"
                >
                  <Store size={11} className="text-blue-400" />
                  <span>Seller Desk</span>
                </a>
                <a
                  href="http://localhost:5173"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-sm border border-white/10 bg-slate-900 text-[9px] font-bold text-slate-400 hover:text-white hover:border-white/20 transition"
                >
                  <Truck size={11} className="text-blue-400" />
                  <span>Storefront</span>
                </a>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-1 text-[9px] text-slate-500 pt-1">
              <ShieldCheck size={11} className="text-emerald-500" />
              <span>256-Bit SSL Encrypted Access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
