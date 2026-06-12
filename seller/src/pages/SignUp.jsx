import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { backendUrl } from "../config";
import Logo from "../components/Logo";
import { Store, Mail, Lock, User, Phone, CheckCircle, Eye, EyeOff, ArrowLeft, ShieldCheck } from "lucide-react";

const SignUp = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    shopName: "",
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
      const response = await axios.post(`${backendUrl}/api/seller/register`, form);

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
      <div className="h-screen w-screen flex items-center justify-center p-4 bg-[#090D1A] text-slate-100 font-sans">
        <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-955 bg-emerald-950/50 text-emerald-400 border border-emerald-800/80 shadow-inner">
            <CheckCircle size={28} className="animate-bounce" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Application Received</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed font-light font-normal">
              Your application to become a CartNOW seller partner has been successfully received and is currently under review by our admin team.
            </p>
            <div className="mt-4 p-3 bg-slate-950/50 rounded-xl border border-slate-800/80 text-[11px] font-semibold text-orange-400">
              Check your email for approval notifications before signing in.
            </div>
          </div>
          <Link
            to="/login"
            className="block w-full py-3.5 bg-orange-600 hover:bg-orange-705 hover:bg-orange-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md cursor-pointer"
          >
            Return to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen grid lg:grid-cols-[1.1fr_1fr] bg-[#090D1A] text-slate-100 font-sans selection:bg-orange-500 selection:text-white overflow-hidden">
      
      {/* Left Panel: Visual/Marketing split */}
      <div className="relative hidden lg:flex flex-col justify-between p-8 overflow-hidden h-full">
        {/* Background Image with overlay */}
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8"
          alt="Retail store shelves"
          className="absolute inset-0 h-full w-full object-cover select-none scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090D1A] via-[#090D1A]/70 to-[#090D1A]/50 z-10" />
        
        {/* Floating background gradient light */}
        <div className="absolute top-[-20%] left-[-20%] h-[500px] w-[500px] rounded-full bg-orange-500/20 blur-[130px] z-0 pointer-events-none" />

        {/* Back Link */}
        <button
          onClick={() => navigate("/")}
          className="relative z-20 self-start flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-700/80 bg-slate-900/60 backdrop-blur-md text-xs font-bold text-slate-350 hover:text-white hover:border-slate-500 transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>

        {/* Hero message at bottom */}
        <div className="relative z-20 mt-auto text-left max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-orange-500/35 bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-wider mb-4">
            <Store size={10} />
            <span>Apply as Partner</span>
          </div>
          <h2 className="text-3xl font-black text-white leading-tight">
            Launch your digital store storefront today.
          </h2>
          <p className="mt-3 text-xs leading-relaxed text-slate-355 text-slate-400 font-light">
            Fill in the shop registration details. Once verified, you will immediately unlock advanced dashboard logs, multi-variant listings, and automatic layout controls.
          </p>

          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center gap-6">
            <div className="flex -space-x-2">
              {[
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
                "https://images.unsplash.com/photo-1527983359383-4758693f760c?w=100"
              ].map((src, i) => (
                <img key={i} src={src} alt="Seller avatar" className="h-7 w-7 rounded-full border border-[#090D1A] object-cover" />
              ))}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              Join <span className="text-white font-extrabold">10,000+ business owners</span> worldwide.
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: SignUp Form */}
      <div className="flex flex-col justify-center items-center px-6 py-6 md:px-12 relative h-full overflow-y-auto">
        {/* Mobile top navigation link */}
        <button
          onClick={() => navigate("/")}
          className="lg:hidden absolute top-5 left-5 flex items-center gap-1.5 text-xs font-bold text-slate-450 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>

        <div className="w-full max-w-sm space-y-5 my-auto">
          {/* Logo / Heading */}
          <div className="flex flex-col items-center text-center space-y-1.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 p-[1px] shadow-md shadow-orange-500/15">
              <div className="h-full w-full bg-[#090D1A] rounded-xl flex items-center justify-center">
                <Logo variant="icon" className="h-5.5 w-5.5 text-orange-500" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
                <span>CartNOW</span>
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Seller</span>
              </h1>
              <p className="text-[10px] text-slate-450 text-slate-400">
                Register your business account below.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={onSubmitHandler} className="space-y-2.5">
            <div>
              <label className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-slate-400">Shop Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none">
                  <Store size={14} />
                </span>
                <input
                  type="text"
                  value={form.shopName}
                  onChange={(e) => updateField("shopName", e.target.value)}
                  placeholder="e.g. Supermart & Grocers"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-800 bg-slate-900/30 text-xs text-white outline-none transition duration-200 placeholder:text-slate-600 focus:bg-slate-950/80 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none">
                  <User size={14} />
                </span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-800 bg-slate-900/30 text-xs text-white outline-none transition duration-200 placeholder:text-slate-600 focus:bg-slate-950/80 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none">
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="e.g. john@example.com"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-800 bg-slate-900/30 text-xs text-white outline-none transition duration-200 placeholder:text-slate-600 focus:bg-slate-950/80 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-slate-400">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none">
                  <Lock size={14} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-800 bg-slate-900/30 text-xs text-white outline-none transition duration-200 placeholder:text-slate-600 focus:bg-slate-950/80 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-slate-400">Phone Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none">
                  <Phone size={14} />
                </span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="e.g. +91 9988776655"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-800 bg-slate-900/30 text-xs text-white outline-none transition duration-200 placeholder:text-slate-600 focus:bg-slate-950/80 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white py-3 text-xs font-black uppercase tracking-wider transition duration-300 shadow-md hover:shadow-lg hover:shadow-orange-500/20 active:scale-[0.98] cursor-pointer mt-3 disabled:opacity-50"
            >
              {submitting ? "Submitting application..." : "Submit Shop Application"}
            </button>
          </form>

          {/* Footer Link */}
          <div className="space-y-3 pt-5 border-t border-slate-900">
            <p className="text-center text-xs text-slate-400">
              Already registered?{" "}
              <Link to="/login" className="font-bold text-orange-500 hover:underline transition">
                Sign In here
              </Link>
            </p>
            
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 pt-3 border-t border-slate-950">
              <ShieldCheck size={12} className="text-emerald-500" />
              <span>Standard SSL Secure 256-Bit Protection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
