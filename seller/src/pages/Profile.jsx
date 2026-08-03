import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  User, 
  Store, 
  Phone, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Sparkles,
  Percent,
  Wallet
} from "lucide-react";
import { backendUrl } from "../config";

const Profile = ({ token, seller, setSeller }) => {
  const [profileForm, setProfileForm] = useState({
    name: seller?.name || "",
    shopName: seller?.shopName || "",
    phone: seller?.phone || "",
    email: seller?.email || ""
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: ""
  });

  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

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

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const response = await axios.post(`${backendUrl}/api/seller/profile/update`, {
        name: profileForm.name,
        shopName: profileForm.shopName,
        phone: profileForm.phone
      }, {
        headers: { token }
      });
      if (response.data.success) {
        toast.success("Profile updated successfully!");
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

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSaving(true);
    try {
      const response = await axios.post(`${backendUrl}/api/seller/change-password`, passwordForm, {
        headers: { token }
      });
      if (response.data.success) {
        toast.success("Password changed successfully!");
        setPasswordForm({ currentPassword: "", newPassword: "" });
      } else {
        toast.error(response.data.message || "Failed to change password");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn text-slate-800 dark:text-slate-100">
      
      {/* ── Single Consolidated Container: Header Row & Overview ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs space-y-3.5 shrink-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-orange-500/10 text-orange-500 rounded-lg flex items-center justify-center border border-orange-500/20 shadow-xs shrink-0">
              <Store size={16} />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Merchant Account & Store Settings</h1>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Configure public storefront identity, contact parameters, and security credentials</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck size={12} />
              Verified Storefront
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        
        {/* Left Column: Merchant Card & Info Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 rounded-2xl p-5 text-white shadow-xs relative overflow-hidden text-left space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-orange-500 text-white flex items-center justify-center text-xl font-black shadow-xs shrink-0">
                {profileForm.shopName ? profileForm.shopName[0].toUpperCase() : "S"}
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-sm text-white tracking-tight truncate">{profileForm.shopName || "My Merchant Store"}</h3>
                <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest block mt-0.5">
                  Verified Merchant Tier
                </span>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Account Owner:</span>
                <span className="font-extrabold text-white">{profileForm.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Commission Rate:</span>
                <span className="font-extrabold text-orange-400 flex items-center gap-1">
                  <Percent size={11} />
                  {seller?.commissionRate || 10}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Current Balance:</span>
                <span className="font-black text-white flex items-center gap-1">
                  <Wallet size={11} className="text-emerald-400" />
                  ₹{seller?.balance !== undefined ? seller.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Info Tip */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs space-y-2 text-left">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={13} className="text-orange-500" />
              <span>Merchant Guidelines</span>
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Updates to your Shop Name will reflect instantly across all customer product listings. Keep your email and phone configurations active to receive order notifications.
            </p>
          </div>
        </div>

        {/* Right Columns: Forms */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Shop Details form */}
          <form onSubmit={handleProfileSubmit} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs space-y-4 text-left">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Store size={14} className="text-orange-500" />
                <span>Shop Parameters</span>
              </h3>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Manage store parameters, phone contact, and owner details</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <Mail size={11} />
                  <span>Email (Read-only)</span>
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  disabled
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400 text-xs font-semibold outline-none cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <User size={11} />
                  <span>Owner Name</span>
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-semibold outline-none transition focus:ring-1 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <Store size={11} />
                  <span>Shop Name</span>
                </label>
                <input
                  type="text"
                  value={profileForm.shopName}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, shopName: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-semibold outline-none transition focus:ring-1 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <Phone size={11} />
                  <span>Contact Number</span>
                </label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-semibold outline-none transition focus:ring-1 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={profileSaving}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-black text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer shadow-xs"
              >
                {profileSaving ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </form>

          {/* Change Password form */}
          <form onSubmit={handlePasswordSubmit} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs space-y-4 text-left">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Lock size={14} className="text-slate-800 dark:text-white" />
                <span>Security Settings</span>
              </h3>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Regularly update your password to protect store access credentials</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-semibold outline-none transition focus:ring-1 focus:ring-slate-700"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-semibold outline-none transition focus:ring-1 focus:ring-slate-700"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={passwordSaving}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white font-black text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer shadow-xs"
              >
                {passwordSaving ? "Updating..." : "Update Security Code"}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Profile;
