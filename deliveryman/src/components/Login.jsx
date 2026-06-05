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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl space-y-6 relative z-10">
        
        {/* Logo and Greeting */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative overflow-hidden h-16 w-16 rounded-2xl border border-slate-700 bg-slate-800/60 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]">
            <Logo
              variant="icon"
              className="h-full w-full p-2.5 text-white transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
              <span>CartNOW</span>
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Courier</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Sign in to manage assigned deliveries and tracking status.
            </p>
          </div>
        </div>
 
        {/* Form */}
        <form onSubmit={onSubmitHandler} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 pointer-events-none">
                <Mail size={15} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. courier@cartnow.com"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-800 bg-slate-950/40 text-sm text-white outline-none transition duration-200 placeholder:text-slate-600 focus:bg-slate-950/80 focus:border-orange-550 focus:ring-4 focus:ring-orange-550/10"
                required
              />
            </div>
          </div>
 
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 pointer-events-none">
                <Lock size={15} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3.5 rounded-xl border border-slate-800 bg-slate-950/40 text-sm text-white outline-none transition duration-200 placeholder:text-slate-600 focus:bg-slate-950/80 focus:border-orange-550 focus:ring-4 focus:ring-orange-550/10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
 
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-4 text-xs font-black uppercase tracking-wider transition duration-200 shadow-md hover:shadow-lg hover:shadow-orange-500/20 active:scale-[0.98] cursor-pointer mt-6 disabled:opacity-50"
          >
            {submitting ? "Signing in..." : "Access Driver Panel"}
          </button>
        </form>
 
        <div className="text-center pt-4 border-t border-slate-800/80">
          <Link to="/signup" className="text-xs font-bold text-slate-400 hover:text-white transition underline">
            Apply to be a courier partner? Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
