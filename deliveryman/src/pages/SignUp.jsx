import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { backendUrl } from "../config";
import Logo from "../components/Logo";
import { Truck, Mail, Lock, User, Phone, CheckCircle, Eye, EyeOff, ArrowLeft, ShieldCheck } from "lucide-react";

const SignUp = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await axios.post(`${backendUrl}/api/deliveryman/register`, form);

      if (response.data.success) {
        toast.success(response.data.message || "Registration application submitted");
        setSubmitted(true);
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

  if (submitted) {
    return (
      <div className="h-screen w-screen flex items-center justify-center p-4 bg-[#F9FAFB] dark:bg-[#070A13] text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
        <div className="w-full max-w-md bg-white dark:bg-[#0F1321]/60 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-fadeIn">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 shadow-inner">
            <CheckCircle size={28} className="animate-bounce" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Application Submitted</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-light">
              Thank you for applying to be a CartNOW delivery partner. Your application is currently under review by our onboarding team.
            </p>
            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-150/50 dark:border-slate-800 text-[11px] font-semibold text-blue-650 dark:text-indigo-400">
              Please check your email for approval status updates before attempting to sign in.
            </div>
          </div>
          <Link
            to="/login"
            className="block w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md cursor-pointer"
          >
            Return to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen grid lg:grid-cols-[1.1fr_1fr] bg-[#F9FAFB] dark:bg-[#070A13] text-slate-805 dark:text-slate-100 font-sans transition-colors duration-200 selection:bg-blue-600 selection:text-white overflow-hidden">
      
      {/* Left Panel: Visual/Logistics split */}
      <div className="relative hidden lg:flex flex-col justify-between p-8 overflow-hidden h-full">
        {/* Background Image with overlay */}
        <img
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d"
          alt="Logistics warehouse"
          className="absolute inset-0 h-full w-full object-cover select-none scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070A13] via-[#070A13]/75 to-[#070A13]/40 z-10" />
        
        {/* Floating gradient glow */}
        <div className="absolute top-[-20%] left-[-20%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[130px] z-0 pointer-events-none" />

        {/* Back Link */}
        <button
          onClick={() => navigate("/")}
          className="relative z-20 self-start flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-700/80 bg-[#0F1321]/60 backdrop-blur-md text-xs font-bold text-slate-350 hover:text-white hover:border-slate-500 transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>

        {/* Hero Message at bottom */}
        <div className="relative z-20 mt-auto text-left max-w-xl text-white">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-500/35 bg-blue-500/15 text-blue-400 text-[10px] font-black uppercase tracking-wider mb-4">
            <Truck size={10} />
            <span>Apply as Partner</span>
          </div>
          <h2 className="text-3xl font-black leading-tight">
            Register to join the courier network.
          </h2>
          <p className="mt-3 text-xs leading-relaxed text-slate-300 font-light">
            Submit your profile details below. Vetting checks are typically completed within 24 hours, after which you can begin claiming packages.
          </p>

          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center gap-6">
            <div className="flex -space-x-2">
              {[
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"
              ].map((src, i) => (
                <img key={i} src={src} alt="Driver avatar" className="h-7 w-7 rounded-full border border-[#070A13] object-cover" />
              ))}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              Join <span className="text-white font-extrabold">5,000+ active couriers</span> driving today.
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: SignUp Form */}
      <div className="flex flex-col justify-center items-center px-6 py-6 md:px-12 relative h-full overflow-y-auto">
        {/* Mobile Home Nav Link */}
        <button
          onClick={() => navigate("/")}
          className="lg:hidden absolute top-5 left-5 flex items-center gap-1.5 text-xs font-bold text-slate-505 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>

        <div className="w-full max-w-sm space-y-5 my-auto">
          {/* Logo / Heading */}
          <div className="flex flex-col items-center text-center space-y-1.5">
            <div className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A13] flex items-center justify-center shadow-sm">
              <Logo variant="icon" className="h-5.5 w-5.5 text-slate-850 dark:text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-1.5">
                <span>CartNOW</span>
                <span className="bg-gradient-to-r from-blue-600 to-indigo-650 dark:from-indigo-400 dark:to-indigo-500 bg-clip-text text-transparent">Courier</span>
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                Fill in the dispatch registration form below.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={onSubmitHandler} className="space-y-2.5">
            <div>
              <label className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-455">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
                  <User size={14} />
                </span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 text-xs text-slate-850 dark:text-white outline-none transition duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-950/80 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-slate-555 dark:text-slate-455">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="e.g. john@example.com"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 text-xs text-slate-850 dark:text-white outline-none transition duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-950/80 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-slate-555 dark:text-slate-455">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
                  <Lock size={14} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 text-xs text-slate-850 dark:text-white outline-none transition duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-950/80 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-700 dark:text-slate-555 dark:hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-slate-555 dark:text-slate-455">Phone Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
                  <Phone size={14} />
                </span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="e.g. +91 9988776655"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-955 dark:bg-slate-950/40 text-xs text-slate-850 dark:text-white outline-none transition duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-950/80 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-3 text-xs font-black uppercase tracking-wider transition duration-300 shadow-md hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] cursor-pointer mt-3 disabled:opacity-50"
            >
              {submitting ? "Submitting application..." : "Submit Registration"}
            </button>
          </form>

          {/* Footer Link */}
          <div className="space-y-3 pt-5 border-t border-slate-200 dark:border-slate-900">
            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              Already registered?{" "}
              <Link to="/login" className="font-bold text-blue-600 dark:text-indigo-400 hover:underline transition">
                Sign In here
              </Link>
            </p>
            
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-455 dark:text-slate-500 pt-3 border-t border-slate-200 dark:border-slate-800">
              <ShieldCheck size={12} className="text-emerald-650 dark:text-emerald-500" />
              <span>Standard SSL Secure 256-Bit Protection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
