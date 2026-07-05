import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { backendUrl } from "../config";
import Logo from "./Logo";
import { Truck, Store, Mail, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck } from "lucide-react";

const Login = ({ setToken, setDriver }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await axios.post(`${backendUrl}/api/deliveryman/login`, {
        email,
        password,
      });

      if (response.data.success) {
        toast.success(response.data.message || "Logged in successfully");
        setDriver(response.data.driver);
        setToken(response.data.token);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-screen grid lg:grid-cols-[1.1fr_1fr] bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200 overflow-hidden">
      
      {/* Left Panel: Visual/Logistics split */}
      <div className="relative hidden lg:flex flex-col justify-between p-8 overflow-hidden h-full">
        {/* Background Image with overlay */}
        <img
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d"
          alt="Logistics warehouse"
          className="absolute inset-0 h-full w-full object-cover select-none scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/40 z-10" />
        
        {/* Floating gradient glow */}
        <div className="absolute top-[-20%] left-[-20%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[130px] z-0 pointer-events-none" />

        {/* Back Link */}
        <button
          onClick={() => navigate("/")}
          className="relative z-20 self-start flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-700/80 bg-slate-900/60 backdrop-blur-md text-xs font-bold text-slate-300 hover:text-white hover:border-slate-500 transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>

        {/* Hero Message at bottom */}
        <div className="relative z-20 mt-auto text-left max-w-xl text-slate-100 dark:text-white">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-500/35 bg-blue-500/15 text-blue-400 text-[10px] font-black uppercase tracking-wider mb-4">
            <Truck size={10} />
            <span>Secure Courier Channel</span>
          </div>
          <h2 className="text-3xl font-black leading-tight">
            Claim deliveries, track earnings, drive your flow.
          </h2>
          <p className="mt-3 text-xs leading-relaxed text-slate-300 text-slate-300 font-light">
            Access the dispatch panel to review assigned shipments, manage weekly payout updates, and resolve customer complaints instantly.
          </p>

          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center gap-6">
            <div className="flex -space-x-2">
              {[
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"
              ].map((src, i) => (
                <img key={i} src={src} alt="Driver avatar" className="h-7 w-7 rounded-full border border-slate-950 object-cover" />
              ))}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              Join <span className="text-slate-100 dark:text-white font-extrabold">5,000+ active couriers</span> driving today.
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex flex-col justify-center items-center px-6 py-6 md:px-12 relative h-full overflow-y-auto">
        {/* Mobile Home Nav Link */}
        <button
          onClick={() => navigate("/")}
          className="lg:hidden absolute top-5 left-5 flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>

        <div className="w-full max-w-sm space-y-6">
          {/* Logo / Heading */}
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center shadow-sm">
              <Logo variant="icon" className="h-6 w-6 text-slate-800 dark:text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-1.5">
                <span>CartNOW</span>
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500 bg-clip-text text-transparent">Courier</span>
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Enter your credentials to access the delivery console.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={onSubmitHandler} className="space-y-3.5">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. courier@cartnow.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 text-xs text-slate-800 dark:text-white outline-none transition duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-950/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
                  <Lock size={14} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:bg-slate-950/40 text-xs text-slate-800 dark:text-white outline-none transition duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-950/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-slate-100 dark:text-white py-3 text-xs font-black uppercase tracking-wider transition duration-300 shadow-md hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] cursor-pointer mt-4 disabled:opacity-50"
            >
              {submitting ? "Signing in..." : "Access Driver Panel"}
            </button>
          </form>

          {/* Sign Up / Switch Portal Link */}
          <div className="space-y-3 pt-5 border-t border-slate-200 dark:border-slate-900">
            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              Apply to be a courier partner?{" "}
              <Link to="/signup" className="font-bold text-blue-600 dark:text-indigo-400 hover:underline transition">
                Sign Up here
              </Link>
            </p>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-900">
              <p className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                Access Other Portals
              </p>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="https://cartnow-seller.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-[10px] font-bold text-slate-700 text-slate-600 dark:text-slate-400 hover:border-orange-500 dark:hover:border-orange-500 hover:bg-orange-50/35 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 shadow-sm"
                >
                  <Store size={13} className="text-orange-500" />
                  <span>Seller Portal</span>
                </a>
                <a
                  href="https://cartnow-client.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-[10px] font-bold text-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/35 dark:hover:bg-blue-950/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 shadow-sm"
                >
                  <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>Storefront</span>
                </a>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 pt-3 border-t border-slate-200 dark:border-slate-800">
              <ShieldCheck size={12} className="text-emerald-600 dark:text-emerald-500" />
              <span>Standard SSL Secure 256-Bit Protection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
