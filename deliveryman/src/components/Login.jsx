import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { backendUrl } from "../config";
import Logo from "./Logo";
import { Truck, Mail, Lock, Eye, EyeOff } from "lucide-react";

const Login = ({ setToken, setDriver }) => {
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
        toast.success(response.data.message);
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F9FAFB] dark:bg-[#030712] relative overflow-hidden transition-colors duration-200">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white dark:bg-[#0F1321]/60 backdrop-blur-2xl border border-slate-200 dark:border-slate-800/60 rounded-3xl p-8 shadow-sm dark:shadow-[0_0_50px_rgba(99,102,241,0.08)] space-y-6 relative z-10 transition-colors">
        
        {/* Logo and Greeting */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative overflow-hidden h-16 w-16 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <Logo
              variant="icon"
              className="h-full w-full p-2.5 text-slate-800 dark:text-white transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-1.5">
              <span>CartNOW</span>
              <span className="bg-gradient-to-r from-[#3B82F6] to-[#6366F1] bg-clip-text text-transparent">Courier</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Sign in to manage assigned deliveries and tracking status.
            </p>
          </div>
        </div>
 
        {/* Form */}
        <form onSubmit={onSubmitHandler} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500 pointer-events-none">
                <Mail size={15} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. courier@cartnow.com"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-205 border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 text-sm text-slate-850 dark:text-white outline-none transition duration-205 placeholder:text-slate-400 dark:placeholder:text-slate-650 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-950/80 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                required
              />
            </div>
          </div>
 
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-550 text-slate-500 dark:text-slate-400">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500 pointer-events-none">
                <Lock size={15} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3.5 rounded-xl border border-slate-205 border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 text-sm text-slate-850 dark:text-white outline-none transition duration-205 placeholder:text-slate-400 dark:placeholder:text-slate-650 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-950/80 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
 
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#6366F1] hover:from-[#6366F1] hover:to-[#3B82F6] text-white py-4 text-xs font-black uppercase tracking-wider transition duration-300 shadow-md hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] cursor-pointer mt-6 disabled:opacity-50"
          >
            {submitting ? "Signing in..." : "Access Driver Panel"}
          </button>
        </form>
 
        <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-800/80">
          <Link to="/signup" className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition underline">
            Apply to be a courier partner? Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
