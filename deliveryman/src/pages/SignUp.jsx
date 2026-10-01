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
      <div className="h-screen w-screen flex items-center justify-center p-4 bg-[#07090e] text-slate-100 font-sans">
        <div className="w-full max-w-md bg-[#0b0f19] border border-white/15 rounded-md p-6 shadow-2xl text-center space-y-4 border-t-2 border-t-emerald-500">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle size={20} />
          </div>
          <div>
            <h2 className="text-base font-black text-white uppercase font-mono tracking-tight">Application Submitted</h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Thank you for applying to be a CartNOW delivery partner. Your application is under review by our onboarding team.
            </p>
            <div className="mt-3 p-2.5 bg-slate-900 rounded-sm border border-white/10 text-[11px] font-mono font-medium text-blue-400">
              Please check your registered email for status updates before signing in.
            </div>
          </div>
          <Link
            to="/login"
            className="block w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer border border-blue-400/30"
          >
            Return to Sign In
          </Link>
        </div>
      </div>
    );
  }

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
          <span>Back</span>
        </button>

        {/* Hero Message at bottom */}
        <div className="relative z-20 mt-auto text-left max-w-lg text-white">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[9px] font-mono font-bold uppercase tracking-wider mb-3">
            <Truck size={10} />
            <span>Apply as Partner</span>
          </div>
          <h2 className="text-2xl font-black uppercase font-mono tracking-tight leading-tight">
            Join the Courier Fleet Network.
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-400 font-normal">
            Submit your profile details below. Onboarding verifications are processed within 24 hours, after which you can access the live delivery pool.
          </p>

          <div className="mt-5 pt-4 border-t border-white/10 text-xs font-mono text-slate-400">
            Active Fleet: <span className="text-emerald-400 font-bold">5,000+ Verified Couriers</span>
          </div>
        </div>
      </div>

      {/* Right Panel: SignUp Form */}
      <div className="flex flex-col justify-center items-center px-6 py-6 md:px-12 relative h-full overflow-y-auto bg-[#0b0f19]">
        {/* Mobile Home Nav Link */}
        <button
          onClick={() => navigate("/")}
          className="lg:hidden absolute top-4 left-4 flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft size={13} />
          <span>Back</span>
        </button>

        <div className="w-full max-w-sm space-y-4 my-auto">
          {/* Logo / Heading */}
          <div className="flex flex-col items-center text-center space-y-1">
            <Logo variant="icon" className="h-10 w-10 mx-auto" />
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-mono font-bold uppercase tracking-wider mt-1">
                Courier Registration
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Fill in the dispatch partner application form.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={onSubmitHandler} className="space-y-2.5 text-left">
            <div>
              <label className="mb-1 block text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                  <User size={13} />
                </span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full pl-9 pr-3 py-2 rounded-sm border border-slate-700 bg-slate-950 text-xs text-white outline-none focus:border-blue-500 font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                  <Mail size={13} />
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="e.g. john@example.com"
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
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="Minimum 6 characters"
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

            <div>
              <label className="mb-1 block text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Phone Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                  <Phone size={13} />
                </span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="e.g. +91 9988776655"
                  className="w-full pl-9 pr-3 py-2 rounded-sm border border-slate-700 bg-slate-950 text-xs text-white outline-none focus:border-blue-500 font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-1.5 rounded-sm bg-blue-600 hover:bg-blue-500 text-white py-2.5 text-xs font-mono font-bold uppercase tracking-wider transition active:scale-98 cursor-pointer mt-3 disabled:opacity-50 border border-blue-400/30"
            >
              {submitting ? "Submitting application..." : "Submit Registration"}
            </button>
          </form>

          {/* Footer Link */}
          <div className="space-y-2.5 pt-3 border-t border-white/10 text-center font-mono text-xs">
            <p className="text-slate-400 text-[11px]">
              Already registered?{" "}
              <Link to="/login" className="font-bold text-blue-400 hover:underline">
                Sign In here
              </Link>
            </p>
            
            <div className="flex items-center justify-center gap-1 text-[9px] text-slate-500 pt-1">
              <ShieldCheck size={11} className="text-emerald-500" />
              <span>256-Bit SSL Encrypted Verification</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
