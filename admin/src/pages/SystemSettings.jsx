import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import { Sliders, ShieldAlert, Cpu, Mail, Phone, Clock, FileImage, Shield, Check, Eye, Trash2, Activity } from "lucide-react";

const SystemSettings = ({ token }) => {
  const [activeTab, setActiveTab] = useState("maintenance");
  
  // Maintenance states
  const [enabled, setEnabled] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [estimatedReturn, setEstimatedReturn] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [whitelistIps, setWhitelistIps] = useState("");
  const [savingMaintenance, setSavingMaintenance] = useState(false);

  // Site configuration states
  const [commissionRate, setCommissionRate] = useState(10);
  const [financeLoading, setFinanceLoading] = useState(false);

  // Feature Flags states with localStorage persistence
  const [flags, setFlags] = useState(() => {
    try {
      const saved = localStorage.getItem("admin_feature_flags");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load feature flags", e);
    }
    return {
      aiAssistant: true,
      smsNotifications: false,
      sandboxBypass: true,
      bulkDiscounts: false
    };
  });

  // Load configuration details
  const fetchSettings = async () => {
    try {
      const [maintRes, finRes] = await Promise.all([
        axios.get(`${backendUrl}/api/admin/maintenance`, { headers: { token } }),
        axios.get(`${backendUrl}/api/admin/finance`, { headers: { token } })
      ]);

      if (maintRes.data.success && maintRes.data.settings) {
        const s = maintRes.data.settings;
        setEnabled(s.enabled || false);
        setTitle(s.title || "");
        setMessage(s.message || "");
        setEstimatedReturn(
          s.estimatedReturn
            ? new Date(s.estimatedReturn).toISOString().slice(0, 16)
            : ""
        );
        setBannerImage(s.bannerImage || "");
        setContactEmail(s.contactEmail || "");
        setContactPhone(s.contactPhone || "");
        setWhitelistIps(s.whitelistIps ? s.whitelistIps.join(", ") : "");
      }

      if (finRes.data.success && finRes.data.settings) {
        setCommissionRate(finRes.data.settings.commissionPercentage || 10);
      }
    } catch (error) {
      toast.error("Failed to load platform settings");
    }
  };

  useEffect(() => {
    if (token) {
      fetchSettings();
    }
  }, [token]);

  // Handle Maintenance Settings Save
  const handleSaveMaintenance = async (e) => {
    e.preventDefault();
    setSavingMaintenance(true);
    try {
      const ipsArray = whitelistIps
        ? whitelistIps.split(",").map(ip => ip.trim()).filter(Boolean)
        : [];

      const { data } = await axios.put(
        `${backendUrl}/api/admin/maintenance`,
        {
          enabled,
          title,
          message,
          estimatedReturn: estimatedReturn || null,
          bannerImage,
          contactEmail,
          contactPhone,
          whitelistIps: ipsArray
        },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message || "Maintenance settings saved successfully!");
        setEnabled(data.settings.enabled);
        
        // Notify other elements by dispatching event locally
        window.dispatchEvent(new Event("adminMaintenanceUpdated"));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save maintenance settings");
    } finally {
      setSavingMaintenance(false);
    }
  };

  // Handle Finance Commission Update
  const handleSaveCommission = async (e) => {
    e.preventDefault();
    setFinanceLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/finance/update`,
        { commissionPercentage: parseFloat(commissionRate) },
        { headers: { token } }
      );
      if (data.success) {
        toast.success("Platform commission settings updated!");
        setCommissionRate(data.settings.commissionPercentage);
      }
    } catch (error) {
      toast.error("Failed to update site configuration");
    } finally {
      setFinanceLoading(false);
    }
  };

  // Handle Feature Flags save with persistence
  const toggleFlag = (flagName) => {
    setFlags(prev => {
      const next = { ...prev, [flagName]: !prev[flagName] };
      localStorage.setItem("admin_feature_flags", JSON.stringify(next));
      toast.info(`Feature Flag: '${flagName}' toggled ${next[flagName] ? "ON" : "OFF"}`);
      return next;
    });
  };

  return (
    <div className="space-y-5 text-left animate-fadeIn text-slate-800 dark:text-slate-100">
      
      {/* Header Title Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-lg p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-slate-900 dark:bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-xs">
            <Sliders size={18} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Platform Control Center</p>
            <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-white">System Settings</h1>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2">
          {enabled ? (
            <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-md px-3 py-1 animate-pulse">
              <ShieldAlert size={12} className="text-rose-600 dark:text-rose-500" />
              <span className="text-[9px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-wider">Maintenance Mode Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-md px-3 py-1">
              <Activity size={12} className="text-emerald-600 dark:text-emerald-500" />
              <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Platform Live & Operational</span>
            </div>
          )}
        </div>
      </div>

      {/* Tab selectors with Sharp Borders */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-3">
        {[
          { id: "maintenance", label: "Maintenance Mode", icon: ShieldAlert },
          { id: "config", label: "Site Configuration", icon: Shield },
          { id: "flags", label: "Feature Flags", icon: Cpu }
        ].map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-2.5 text-xs font-black uppercase tracking-wider transition-all relative border-b-2 -mb-[2px] cursor-pointer ${ isSelected ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-white" }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Settings Body with Sharp Corners */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-lg p-5 shadow-xs">
        
        {/* ── MAINTENANCE MODE PANEL ── */}
        {activeTab === "maintenance" && (
          <form onSubmit={handleSaveMaintenance} className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80">
              <div className="space-y-0.5">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-rose-500" />
                  <span>Platform Storefront Access Block</span>
                </h3>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Instantly block public user storefronts and display maintenance banner across all customer portals.
                </p>
              </div>

              {/* Sharp Toggle switch */}
              <button
                type="button"
                onClick={() => setEnabled(!enabled)}
                className={`w-12 h-6 flex items-center rounded-md p-0.5 cursor-pointer transition-all duration-200 ${ enabled ? "bg-rose-600 justify-end" : "bg-slate-300 dark:bg-slate-700 justify-start" }`}
              >
                <span className="h-5 w-5 rounded-sm bg-white dark:bg-slate-900 shadow-xs transform transition duration-200" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Maintenance Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CartNOW Platform Upgrades in Progress"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-semibold outline-none transition focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Estimated Return Date & Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="datetime-local"
                    value={estimatedReturn}
                    onChange={(e) => setEstimatedReturn(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-semibold outline-none transition focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Maintenance Detail Message *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Brief public message explaining system upgrades..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-semibold outline-none transition resize-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Support Contact Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="email"
                    placeholder="support@cartnow.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-semibold outline-none transition focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Support Contact Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="+91 9988776655"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-semibold outline-none transition focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Maintenance Banner Image URL
                </label>
                <div className="relative">
                  <FileImage className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="https://example.com/banner.png"
                    value={bannerImage}
                    onChange={(e) => setBannerImage(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-semibold outline-none transition focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Developer Bypass IP Whitelist
                </label>
                <textarea
                  rows={1}
                  placeholder="e.g. 127.0.0.1, 192.168.1.10"
                  value={whitelistIps}
                  onChange={(e) => setWhitelistIps(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-semibold outline-none transition resize-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={savingMaintenance}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check size={13} />
                <span>{savingMaintenance ? "Saving Settings..." : "Save Maintenance Settings"}</span>
              </button>
            </div>
          </form>
        )}

        {/* ── SITE CONFIGURATION PANEL ── */}
        {activeTab === "config" && (
          <form onSubmit={handleSaveCommission} className="space-y-5">
            <div className="space-y-1 max-w-md">
              <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Default Platform Commission Fee (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-semibold outline-none transition focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-400 font-medium leading-normal mt-1">
                Standard percentage automatically retained by CartNOW platform on processed order disbursements.
              </p>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={financeLoading}
                className="px-5 py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check size={13} />
                <span>{financeLoading ? "Updating..." : "Save Platform Configuration"}</span>
              </button>
            </div>
          </form>
        )}

        {/* ── FEATURE FLAGS PANEL ── */}
        {activeTab === "flags" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Release Feature Toggles</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Toggle experimental flags across routing and checkout modules. Changes persist locally.
              </p>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { id: "aiAssistant", label: "AI Customer Support Assistant", desc: "Enables client-facing chatbot drawer on main storefront.", flag: flags.aiAssistant },
                { id: "smsNotifications", label: "SMS Dispatch Alerts", desc: "Sends carrier text updates to customers when order shifts state.", flag: flags.smsNotifications },
                { id: "sandboxBypass", label: "Stripe Sandbox Mock Bypass", desc: "Automatically bypasses real payment verification inside staging.", flag: flags.sandboxBypass },
                { id: "bulkDiscounts", label: "Smart Bulk Pricing Algorithms", desc: "Activates volume discounts for purchases of 5+ matching SKUs.", flag: flags.bulkDiscounts }
              ].map(item => (
                <div key={item.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 gap-4">
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">{item.label}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{item.desc}</p>
                  </div>
                  
                  {/* Sharp Toggle switch button */}
                  <button
                    type="button"
                    onClick={() => toggleFlag(item.id)}
                    className={`w-11 h-6 flex items-center rounded-md p-0.5 cursor-pointer transition-all duration-200 ${ item.flag ? "bg-blue-600 justify-end" : "bg-slate-300 dark:bg-slate-700 justify-start" }`}
                  >
                    <span className="h-5 w-5 rounded-sm bg-white dark:bg-slate-900 shadow-xs transform transition duration-200" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SystemSettings;
