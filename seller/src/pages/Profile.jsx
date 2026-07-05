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
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Merchant Account</h2>
        <p className="text-xs text-slate-400 mt-1">Configure your public store details, contact settings, and security controls.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Glowing Store Card & Account Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-slate-900 rounded-3xl p-6 text-slate-100 dark:text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-20%] w-40 h-40 rounded-full bg-orange-500/10 blur-2xl pointer-events-none"></div>
            
            <div className="flex flex-col items-center text-center space-y-4 pt-4">
              <div className="h-16 w-16 rounded-2xl bg-orange-500 flex items-center justify-center text-slate-100 dark:text-white text-2xl font-black shadow-lg shadow-orange-600/20">
                {profileForm.shopName ? profileForm.shopName[0].toUpperCase() : "S"}
              </div>
              <div>
                <h3 className="font-extrabold text-base tracking-tight">{profileForm.shopName}</h3>
                <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider mt-1.5 inline-block bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                  Merchant Tier
                </span>
              </div>
            </div>

            <div className="mt-8 space-y-4 text-xs border-t border-slate-800 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Account Owner</span>
                <span className="font-bold text-slate-200">{profileForm.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Verification</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck size={12} />
                  Verified Merchant
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Commission Tier</span>
                <span className="font-bold text-orange-400 flex items-center gap-1">
                  <Percent size={12} />
                  {seller?.commissionRate || 10}% commission
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Current Balance</span>
                <span className="font-extrabold text-slate-100 flex items-center gap-1">
                  <Wallet size={12} className="text-slate-400" />
                  ${seller?.balance !== undefined ? seller.balance.toFixed(2) : "0.00"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Info Tip */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/60 rounded-3xl p-6 space-y-3">
            <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-orange-500" />
              <span>Merchant Guidelines</span>
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Updates to your Shop Name will reflect instantly across all customer product listings. Keep your email and phone configurations active to receive order notifications.
            </p>
          </div>
        </div>

        {/* Right Columns: Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Shop Details form */}
          <form onSubmit={handleProfileSubmit} className="bg-white dark:bg-slate-900 border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                <Store size={16} className="text-orange-500" />
                <span>Shop Parameters</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Manage store details, contact phone, and account credentials.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Mail size={12} />
                  <span>Email (Read-only)</span>
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400 text-sm outline-none cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <User size={12} />
                  <span>Owner Name</span>
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Store size={12} />
                  <span>Shop Name</span>
                </label>
                <input
                  type="text"
                  value={profileForm.shopName}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, shopName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Phone size={12} />
                  <span>Contact Number</span>
                </label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-50">
              <button
                type="submit"
                disabled={profileSaving}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-slate-100 dark:text-white font-bold text-xs uppercase tracking-wider transition active:scale-95 shadow-sm cursor-pointer"
              >
                {profileSaving ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </form>

          {/* Change Password form */}
          <form onSubmit={handlePasswordSubmit} className="bg-white dark:bg-slate-900 border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                <Lock size={16} className="text-slate-800 dark:text-slate-100" />
                <span>Security Settings</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Regularly update your password to protect your store transactions.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-50">
              <button
                type="submit"
                disabled={passwordSaving}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-slate-100 dark:text-white font-bold text-xs uppercase tracking-wider transition active:scale-95 shadow-sm cursor-pointer"
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
