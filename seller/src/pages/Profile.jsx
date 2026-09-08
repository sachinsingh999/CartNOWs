import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Store, 
  Phone, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Sparkles,
  Percent,
  Wallet,
  Eye,
  EyeOff,
  Copy,
  Check,
  Package,
  ShoppingBag,
  ExternalLink,
  ArrowRight,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  BadgeCheck
} from "lucide-react";
import { backendUrl } from "../config";

const Profile = ({ token, seller, setSeller, products = [], orders = [] }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "security" | "financials"

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: seller?.name || "",
    shopName: seller?.shopName || "",
    phone: seller?.phone || "",
    email: seller?.email || ""
  });

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    if (seller) {
      setProfileForm({
        name: seller.name || "",
        shopName: seller.shopName || "",
        phone: seller.phone || "",
        email: seller.email || ""
      });
    }
  }, [seller]);

  // Copy helper
  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === "id") {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
    toast.success("Copied to clipboard!");
  };

  // Profile update handler
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (profileForm.phone && profileForm.phone.replace(/\D/g, "").length !== 10) {
      toast.error("Contact number must be exactly 10 digits");
      return;
    }

    setProfileSaving(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/seller/profile/update`,
        {
          name: profileForm.name,
          shopName: profileForm.shopName,
          phone: profileForm.phone
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Store profile updated successfully!");
        setSeller(response.data.seller);
      } else {
        toast.error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setProfileSaving(false);
    }
  };

  // Password change handler
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }

    setPasswordSaving(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/seller/change-password`,
        {
          currentPassword: passwordForm.currentPassword,
          oldPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Password changed successfully!");
        setPasswordForm({ currentPassword: "", newPassword: "" , confirmPassword: "" });
      } else {
        toast.error(response.data.message || "Failed to change password");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setPasswordSaving(false);
    }
  };

  // Calculate password strength
  const getPasswordStrength = () => {
    const pw = passwordForm.newPassword;
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 6) score += 1;
    if (pw.length >= 10) score += 1;
    if (/[0-9]/.test(pw)) score += 1;
    if (/[^A-Za-z0-9]/.test(pw)) score += 1;
    return score;
  };

  const pwStrength = getPasswordStrength();
  const storeSlug = (profileForm.shopName || "store").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const storefrontUrl = `https://cartnow.in/store/${storeSlug}`;

  const isFormDirty = seller && (
    profileForm.name !== seller.name ||
    profileForm.shopName !== seller.shopName ||
    profileForm.phone !== seller.phone
  );

  return (
    <div className="space-y-4 animate-fadeIn text-slate-800 dark:text-slate-100 max-w-7xl mx-auto pb-8">
      
      {/* ── Consolidated Merchant Overview & Navigation Card ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 md:p-6 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-4">
        
        {/* Row 1: Merchant Identity Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Avatar & Identity Details */}
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="relative">
              <div className="h-14 w-14 sm:h-16 sm:w-16 md:h-18 md:w-18 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-black shadow-md shadow-orange-500/20 shrink-0">
                {profileForm.shopName ? profileForm.shopName[0].toUpperCase() : "S"}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 sm:p-1 rounded-full shadow-sm" title="Verified Store">
                <BadgeCheck size={13} strokeWidth={3} />
              </div>
            </div>

            <div className="space-y-0.5 sm:space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {profileForm.shopName || "My Store"}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Merchant
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-2 flex-wrap">
                <span>Owned by <strong className="text-slate-700 dark:text-slate-200">{profileForm.name || "Merchant"}</strong></span>
                <span>•</span>
                <span>Member since {seller?.createdAt ? new Date(seller.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Aug 2026"}</span>
              </p>

              {/* Merchant ID with Copy */}
              <div className="flex items-center gap-2 pt-0.5 text-xs">
                <span className="text-[11px] font-mono text-slate-400 font-semibold">
                  Seller ID: {seller?._id || "SELLER-LIVE"}
                </span>
                <button
                  onClick={() => handleCopy(seller?._id || "SELLER-LIVE", "id")}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition cursor-pointer"
                  title="Copy Seller ID"
                >
                  {copiedId ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  <span>{copiedId ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <button
              onClick={() => handleCopy(storefrontUrl, "url")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs active:scale-95"
            >
              {copiedUrl ? <Check size={13} className="text-emerald-500" /> : <ExternalLink size={13} />}
              <span>{copiedUrl ? "Link Copied" : "Share Storefront"}</span>
            </button>
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer"
            >
              <Package size={13} />
              <span>Manage Products</span>
            </button>
          </div>
        </div>

        {/* Row 2: Four Key Merchant Metrics Inside Subtle Surface */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Metric 1: Store Balance */}
          <div 
            onClick={() => navigate("/revenue")}
            className="bg-slate-50 dark:bg-slate-950/70 rounded-xl p-3.5 border border-slate-200/70 dark:border-slate-800/80 hover:border-emerald-500/40 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Store Balance</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Wallet size={15} />
              </div>
            </div>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
              ₹{(seller?.balance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60 text-[10px]">
              <span className="text-slate-400 font-medium">Settlement ready</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                Revenue <ArrowRight size={10} />
              </span>
            </div>
          </div>

          {/* Metric 2: Commission Rate */}
          <div className="bg-slate-50 dark:bg-slate-950/70 rounded-xl p-3.5 border border-slate-200/70 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Commission Rate</span>
              <div className="h-8 w-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
                <Percent size={15} />
              </div>
            </div>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
              {seller?.commissionRate || 10}%
            </p>
            <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60 text-[10px]">
              <span className="text-slate-400 font-medium">Platform service rate</span>
              <span className="text-orange-600 dark:text-orange-400 font-bold">Standard Tier</span>
            </div>
          </div>

          {/* Metric 3: Active Listings */}
          <div 
            onClick={() => navigate("/products")}
            className="bg-slate-50 dark:bg-slate-950/70 rounded-xl p-3.5 border border-slate-200/70 dark:border-slate-800/80 hover:border-blue-500/40 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Listings</span>
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Package size={15} />
              </div>
            </div>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
              {products.length} Items
            </p>
            <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60 text-[10px]">
              <span className="text-slate-400 font-medium">In public catalog</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                View Items <ArrowRight size={10} />
              </span>
            </div>
          </div>

          {/* Metric 4: Total Orders */}
          <div 
            onClick={() => navigate("/orders")}
            className="bg-slate-50 dark:bg-slate-950/70 rounded-xl p-3.5 border border-slate-200/70 dark:border-slate-800/80 hover:border-purple-500/40 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShoppingBag size={15} />
              </div>
            </div>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
              {orders.length} Orders
            </p>
            <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60 text-[10px]">
              <span className="text-slate-400 font-medium">Lifetime volume</span>
              <span className="text-purple-600 dark:text-purple-400 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                Order Desk <ArrowRight size={10} />
              </span>
            </div>
          </div>
        </div>

        {/* Row 3: Modern Navigation Segment Tabs */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: "profile", label: "Storefront Profile", icon: Store },
            { id: "security", label: "Security & Credentials", icon: Lock },
            { id: "financials", label: "Financials & Settlement", icon: Wallet }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-slate-900 dark:bg-orange-500 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 4. Main Tab Content ── */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column: Storefront Information & Health */}
          <div className="lg:col-span-1 space-y-4">
            {/* Storefront Identity Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-4 text-left">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Store size={16} className="text-orange-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Store Identity</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Store Status:</span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold">
                    <CheckCircle2 size={13} />
                    Verified Active
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Merchant Tier:</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">Gold Verified</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Settlement Cycle:</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">Weekly (T+7)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Customer Returns:</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">Automated RMA Active</span>
                </div>
              </div>

              {/* Public Storefront URL Card */}
              <div className="pt-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Public Storefront Link
                </label>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs">
                  <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 truncate max-w-[200px]">
                    {storefrontUrl}
                  </span>
                  <button
                    onClick={() => handleCopy(storefrontUrl, "url")}
                    className="p-1 text-orange-600 dark:text-orange-400 hover:text-orange-700 cursor-pointer shrink-0"
                    title="Copy Link"
                  >
                    {copiedUrl ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Merchant Guidelines */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-3 text-left">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-orange-500" />
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Storefront Guidelines
                </h4>
              </div>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 leading-relaxed font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span>Store Name updates propagate live across all existing listings immediately.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span>Keep your contact phone active for delivery pickup escalations and customer support.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span>Registered email is locked for account safety; contact platform admin to update.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Editable Store Parameters Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleProfileSubmit} className="bg-white dark:bg-slate-900 rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-5 text-left">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Storefront Parameters
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Update your merchant contact and customer-facing store details.
                  </p>
                </div>
                {isFormDirty && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    Unsaved changes
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Registered Email (Read-Only) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail size={13} className="text-slate-400" />
                    <span>Registered Email Address</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={profileForm.email}
                      disabled
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/70 dark:border-slate-800 text-slate-400 text-xs font-semibold outline-none cursor-not-allowed pr-24"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      <CheckCircle2 size={11} />
                      <span>Verified</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400">Email is linked to your merchant login ID.</p>
                </div>

                {/* Owner Legal Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <User size={13} className="text-orange-500" />
                    <span>Account Owner / Signatory</span>
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Full legal name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs font-semibold outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    required
                  />
                  <p className="text-[10px] text-slate-400">Used for invoicing and legal settlement agreements.</p>
                </div>

                {/* Public Shop Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Store size={13} className="text-orange-500" />
                    <span>Public Storefront Name</span>
                  </label>
                  <input
                    type="text"
                    value={profileForm.shopName}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, shopName: e.target.value }))}
                    placeholder="e.g. Acme Fashion Hub"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs font-semibold outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    required
                  />
                  <p className="text-[10px] text-slate-400">Displayed to buyers across product detail pages.</p>
                </div>

                {/* Contact Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone size={13} className="text-orange-500" />
                    <span>Contact Number (10 Digits)</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-bold text-slate-400 select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, "") }))}
                      placeholder="9876543210"
                      className="w-full pl-11 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs font-semibold outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">Primary phone for pickup logistics coordination.</p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  disabled={!isFormDirty || profileSaving}
                  onClick={() => {
                    if (seller) {
                      setProfileForm({
                        name: seller.name || "",
                        shopName: seller.shopName || "",
                        phone: seller.phone || "",
                        email: seller.email || ""
                      });
                    }
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 transition cursor-pointer"
                >
                  Reset Changes
                </button>

                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  {profileSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} strokeWidth={2.5} />
                      <span>Save Configuration</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Tab 2: Security & Credentials ── */}
      {activeTab === "security" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Security Status Card */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-4 text-left">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Shield size={16} className="text-orange-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Account Security</h3>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <ShieldCheck size={15} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Session Protected</span>
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400/90 leading-relaxed font-medium">
                  Your merchant authentication token is securely encrypted with industry-standard bcrypt hashing.
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center justify-between">
                  <span>JWT Token Status:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Active (Secure)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Password Encryption:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">BCrypt (Salt 10)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Two-Factor Auth:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Email OTP Linked</span>
                </div>
              </div>
            </div>

            {/* Password Best Practices */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-left text-xs">
              <h4 className="font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <KeyRound size={14} className="text-orange-500" />
                <span>Security Recommendations</span>
              </h4>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Use a minimum of 8 characters incorporating uppercase letters, numbers, and symbols. Avoid reusing passwords across personal email and financial accounts.
              </p>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handlePasswordSubmit} className="bg-white dark:bg-slate-900 rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-5 text-left">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Update Store Password
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ensure your account uses a secure password to prevent unauthorized storefront access.
                </p>
              </div>

              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs font-semibold outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs font-semibold outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Re-enter new password"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs font-semibold outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {passwordForm.newPassword && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Strength Meter:</span>
                    <span className={`font-bold ${
                      pwStrength <= 1 ? "text-rose-500" : pwStrength <= 3 ? "text-amber-500" : "text-emerald-500"
                    }`}>
                      {pwStrength <= 1 ? "Weak" : pwStrength <= 3 ? "Medium" : "Strong"}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`rounded-full transition-colors ${
                          pwStrength >= step
                            ? pwStrength <= 1 ? "bg-rose-500" : pwStrength <= 3 ? "bg-amber-500" : "bg-emerald-500"
                            : "bg-slate-200 dark:bg-slate-800"
                        }`}
                      />
                    ))}
                  </div>

                  {passwordForm.confirmPassword && (
                    <p className={`text-[11px] font-bold mt-2 flex items-center gap-1 ${
                      passwordForm.newPassword === passwordForm.confirmPassword ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
                    }`}>
                      {passwordForm.newPassword === passwordForm.confirmPassword ? (
                        <>
                          <Check size={12} />
                          <span>Passwords match perfectly</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={12} />
                          <span>Passwords do not match</span>
                        </>
                      )}
                    </p>
                  )}
                </div>
              )}

              {/* Action */}
              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={passwordSaving || (passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword)}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-md active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {passwordSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Updating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={14} />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Tab 3: Financials & Settlement ── */}
      {activeTab === "financials" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Earnings Overview Card */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-4 text-left">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Wallet size={16} className="text-emerald-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Earnings & Wallet</h3>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Settled Account Balance</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  ₹{(seller?.balance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Ready for direct disbursement to your registered bank account.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate("/revenue")}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Wallet size={14} />
                  <span>Request Settlement</span>
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-left text-xs">
              <h4 className="font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Finance Actions
              </h4>
              <div className="space-y-1.5 pt-1">
                <button
                  onClick={() => navigate("/invoices")}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 font-bold transition cursor-pointer"
                >
                  <span>Monthly Invoices & GST Bills</span>
                  <ArrowRight size={13} className="text-slate-400" />
                </button>
                <button
                  onClick={() => navigate("/revenue")}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 font-bold transition cursor-pointer"
                >
                  <span>Detailed Revenue Ledger</span>
                  <ArrowRight size={13} className="text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Commission & Settlement Terms Card */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-5 text-left">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Platform Commission & Payout Policy
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Transparent breakdown of how platform fees and customer payments are credited.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-bold text-xs">
                    <Percent size={14} />
                    <span>Commission Take-Rate</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    {seller?.commissionRate || 10}%
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    CartNOW takes a fixed {seller?.commissionRate || 10}% fee per successfully delivered order. No hidden listing or monthly subscription fees.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    <ShieldCheck size={14} />
                    <span>Net Merchant Payout</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    {100 - (seller?.commissionRate || 10)}%
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    You keep {100 - (seller?.commissionRate || 10)}% of gross order value minus completed customer refunds. Funds mature after delivery completion.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Settlement Schedule
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Disbursement Day</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">Every Monday</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Hold Period</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">7 Days Post-Delivery</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Payment Gateway</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">Automated IMPS / NEFT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
