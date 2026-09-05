import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { backendUrl } from "../config";
import Logo from "../components/Logo";
import { Store, Mail, Lock, User, Phone, CheckCircle, Eye, EyeOff, ArrowLeft, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

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
      <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 bg-slate-950 text-slate-100 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md bg-slate-900 rounded-3xl p-8 shadow-2xl text-center space-y-6"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-950/50 text-emerald-400 shadow-inner">
            <CheckCircle size={28} className="animate-bounce" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">Application Received</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed font-normal">
              Your application to become a CartNOW seller partner has been successfully received and is currently under review by our admin team.
            </p>
            <div className="mt-4 p-3 bg-slate-950 rounded-xl text-[11px] font-semibold text-orange-400">
              Check your email for approval notifications before signing in.
            </div>
          </div>
          <Link
            to="/login"
            className="block w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-md cursor-pointer"
          >
            Return to Sign In
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-950 text-slate-100 font-sans selection:bg-orange-500 selection:text-white relative">
      
      {/* Back to Home Button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate("/")}
        className="absolute top-5 left-5 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer shadow-md"
      >
        <ArrowLeft size={14} className="text-orange-500" />
        <span>Back to Home</span>
      </motion.button>

      {/* 2-PART CENTERED BOX CONTAINER */}
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-4xl grid lg:grid-cols-2 rounded-3xl bg-slate-900 shadow-2xl shadow-black/80 overflow-hidden my-auto"
      >
        
        {/* PART 1: LEFT BOX (Brand Showcase & Partner Perks) */}
        <div className="relative hidden lg:flex flex-col justify-between p-8 xl:p-10 bg-slate-950">
          
          {/* Header Logo */}
          <div className="flex items-center justify-between z-10">
            <Logo forceWhite className="h-10 w-auto" />
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold uppercase text-orange-400">
              <Store size={10} /> Partner Application
            </span>
          </div>

          {/* Center Showcase: Key Perks */}
          <div className="my-6 space-y-3.5 z-10">
            <motion.div 
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900 p-4 rounded-2xl"
            >
              <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">Instant Storefront</h4>
              <p className="text-xs text-slate-300 font-medium">Create your online shop and list products in under 5 minutes.</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900 p-4 rounded-2xl"
            >
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Automated Payouts</h4>
              <p className="text-xs text-slate-300 font-medium">Receive direct bank payouts with real-time settlement tracking.</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900 p-4 rounded-2xl"
            >
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Inventory Management</h4>
              <p className="text-xs text-slate-300 font-medium">Live stock sync, order dispatch updates, and sales analytics.</p>
            </motion.div>
          </div>

          {/* Bottom Callout */}
          <div className="z-10 text-left pt-4">
            <h3 className="text-base font-bold text-slate-100">Join 10,000+ Verified Merchants.</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
              Start selling today with CartNOW's high-speed delivery network.
            </p>
          </div>
        </div>

        {/* PART 2: RIGHT BOX (SignUp Form) */}
        <div className="p-6 sm:p-8 flex flex-col justify-center bg-slate-900 max-h-[85vh] lg:max-h-none overflow-y-auto">
          
          {/* Mobile Logo Branding */}
          <div className="lg:hidden flex justify-center mb-4">
            <Logo forceWhite className="h-10 w-auto" />
          </div>

          <div className="space-y-4 max-w-sm mx-auto w-full">
            {/* Header */}
            <div className="text-center lg:text-left space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">Apply as Partner</h2>
              <p className="text-xs text-slate-400">Register your business account below</p>
            </div>

            {/* Registration Form */}
            <form onSubmit={onSubmitHandler} className="space-y-3">
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Shop Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none">
                    <Store size={14} />
                  </span>
                  <input
                    type="text"
                    value={form.shopName}
                    onChange={(e) => updateField("shopName", e.target.value)}
                    placeholder="e.g. Supermart & Grocers"
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 text-xs text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-600 focus:ring-2 focus:ring-orange-500/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none">
                    <User size={14} />
                  </span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 text-xs text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-600 focus:ring-2 focus:ring-orange-500/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none">
                    <Mail size={14} />
                  </span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="e.g. john@example.com"
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 text-xs text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-600 focus:ring-2 focus:ring-orange-500/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none">
                    <Lock size={14} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full pl-10 pr-10 py-2 rounded-xl bg-slate-950 text-xs text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-600 focus:ring-2 focus:ring-orange-500/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-200 cursor-pointer transition-colors"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {/* Password Rules & Strength Indicator */}
                <div className="mt-2 p-2 rounded-xl bg-slate-950 space-y-1.5 text-left">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-400 uppercase tracking-wider text-[9px]">Password Rules</span>
                    {form.password && (
                      <span className={
                        form.password.length >= 8 && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password)
                          ? "text-emerald-400 font-extrabold"
                          : form.password.length >= 6
                          ? "text-amber-400 font-extrabold"
                          : "text-rose-400 font-extrabold"
                      }>
                        {form.password.length >= 8 && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password)
                          ? "Strong"
                          : form.password.length >= 6
                          ? "Medium"
                          : "Weak"}
                      </span>
                    )}
                  </div>

                  {/* Strength Bar */}
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                    <div className={`h-full transition-all duration-300 ${
                      form.password.length >= 1 ? (form.password.length >= 6 ? "bg-amber-400 w-1/3" : "bg-rose-500 w-1/3") : "bg-transparent w-0"
                    }`} />
                    <div className={`h-full transition-all duration-300 ${
                      form.password.length >= 6 && (/[A-Z]/.test(form.password) || /[0-9]/.test(form.password)) ? "bg-amber-400 w-1/3" : "bg-transparent w-0"
                    }`} />
                    <div className={`h-full transition-all duration-300 ${
                      form.password.length >= 8 && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password) && /[^A-Za-z0-9]/.test(form.password) ? "bg-emerald-400 w-1/3" : "bg-transparent w-0"
                    }`} />
                  </div>

                  {/* Checklist */}
                  <div className="grid grid-cols-2 gap-1 text-[9px]">
                    <div className={`flex items-center gap-1 ${form.password.length >= 6 ? "text-emerald-400 font-bold" : "text-slate-500"}`}>
                      <span>{form.password.length >= 6 ? "✓" : "•"}</span> Min 6 chars
                    </div>
                    <div className={`flex items-center gap-1 ${/[A-Z]/.test(form.password) ? "text-emerald-400 font-bold" : "text-slate-500"}`}>
                      <span>{/[A-Z]/.test(form.password) ? "✓" : "•"}</span> 1 Capital (A-Z)
                    </div>
                    <div className={`flex items-center gap-1 ${/[0-9]/.test(form.password) ? "text-emerald-400 font-bold" : "text-slate-500"}`}>
                      <span>{/[0-9]/.test(form.password) ? "✓" : "•"}</span> 1 Number (0-9)
                    </div>
                    <div className={`flex items-center gap-1 ${/[^A-Za-z0-9]/.test(form.password) ? "text-emerald-400 font-bold" : "text-slate-500"}`}>
                      <span>{/[^A-Za-z0-9]/.test(form.password) ? "✓" : "•"}</span> 1 Symbol (@#$)
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none">
                    <Phone size={14} />
                  </span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="e.g. +91 9988776655"
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 text-xs text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-600 focus:ring-2 focus:ring-orange-500/20"
                    required
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-md shadow-orange-600/20 cursor-pointer mt-1 disabled:opacity-50"
              >
                {submitting ? "Submitting application..." : "Submit Shop Application"}
              </motion.button>
            </form>

            {/* Footer */}
            <div className="space-y-2 pt-3 text-center">
              <p className="text-xs text-slate-400">
                Already registered?{" "}
                <Link to="/login" className="font-bold text-orange-500 hover:underline transition">
                  Sign In here
                </Link>
              </p>
              
              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 pt-1">
                <ShieldCheck size={12} className="text-emerald-500" />
                <span>SSL Encrypted 256-Bit Merchant Access</span>
              </div>
            </div>

          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default SignUp;
