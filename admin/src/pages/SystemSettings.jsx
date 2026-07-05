import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import { Sliders, ShieldAlert, Cpu, Mail, Phone, Clock, FileImage, Shield, Check, Eye, Trash2, Database, RefreshCw } from "lucide-react";

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

  // Mock Feature Flags states
  const [flags, setFlags] = useState({
    aiAssistant: true,
    smsNotifications: false,
    sandboxBypass: true,
    bulkDiscounts: false
  });

  // Cloudinary stats and clean states
  const [cloudinaryStats, setCloudinaryStats] = useState(null);
  const [cloudinaryLoading, setCloudinaryLoading] = useState(false);
  const [fetchStatsLoading, setFetchStatsLoading] = useState(false);

  const fetchCloudinaryStats = async () => {
    setFetchStatsLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/system/cloudinary-stats`, { headers: { token } });
      if (data.success) {
        setCloudinaryStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load Cloudinary stats:", err);
    } finally {
      setFetchStatsLoading(false);
    }
  };

  const handleManualCleanup = async () => {
    setCloudinaryLoading(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/system/trigger-cleanup`, {}, { headers: { token } });
      if (data.success) {
        toast.success(data.message || "Manual cleanup finished successfully!");
        fetchCloudinaryStats();
      } else {
        toast.error(data.message || "Failed to trigger cleanup");
      }
    } catch (err) {
      toast.error("Failed to trigger manual cleanup");
      console.error(err);
    } finally {
      setCloudinaryLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

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
      fetchCloudinaryStats();
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

  // Handle local mock Feature Flags save
  const toggleFlag = (flagName) => {
    setFlags(prev => {
      const next = { ...prev, [flagName]: !prev[flagName] };
      toast.info(`Feature Flag: '${flagName}' toggled ${next[flagName] ? "ON" : "OFF"}`);
      return next;
    });
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header Title */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="h-10 w-10 bg-slate-900/10 dark:bg-blue-600/10 text-slate-800 dark:text-blue-400 rounded-xl flex items-center justify-center border border-slate-200 dark:border-blue-500/20 shadow-sm">
          <Sliders size={20} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">Control Panel</p>
          <h1 className="text-xl font-extrabold tracking-tight">System Settings</h1>
        </div>
      </div>

      {/* Tab selectors */}
      <div className="flex border-b border-slate-200 dark:border-white/[0.08] gap-4">
        {[
          { id: "maintenance", label: "Maintenance Mode", icon: ShieldAlert },
          { id: "config", label: "Site Configuration", icon: Shield },
          { id: "flags", label: "Feature Flags", icon: Cpu },
          { id: "cloudinary", label: "Cloudinary Cleanup", icon: FileImage }
        ].map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3.5 text-xs font-black uppercase tracking-wider transition-all relative border-b-2 -mb-[2px] cursor-pointer ${ isSelected ? "border-blue-500 text-blue-500" : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-white" }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Settings Body */}
      <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200/60 dark:border-slate-800/80 rounded-[28px] p-6 sm:p-8 shadow-sm">
        
        {/* ── MAINTENANCE MODE PANEL ── */}
        {activeTab === "maintenance" && (
          <form onSubmit={handleSaveMaintenance} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50/30 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert size={15} className="text-red-500" />
                  <span>Platform Access Block</span>
                </h3>
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                  Instantly block access to storefront, checkout, and client-side customer profiles.
                </p>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => setEnabled(!enabled)}
                className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${ enabled ? "bg-red-500 justify-end" : "bg-slate-300 dark:bg-slate-700 justify-start" }`}
              >
                <span className="h-6 w-6 rounded-full bg-white dark:bg-slate-900 shadow-md transform transition duration-300" />
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Maintenance Page Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CartNOW is Under Maintenance"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-semibold outline-none transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Estimated Return Time (Optional)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="datetime-local"
                    value={estimatedReturn}
                    onChange={(e) => setEstimatedReturn(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-semibold outline-none transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Maintenance Detail Message *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Brief explanation for visitors..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-semibold outline-none transition resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Support Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="support@cartnow.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-semibold outline-none transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Support Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="+91 9988776655"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-semibold outline-none transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Maintenance Banner Image URL
                </label>
                <div className="relative">
                  <FileImage className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="https://example.com/banner.png"
                    value={bannerImage}
                    onChange={(e) => setBannerImage(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-semibold outline-none transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Developer Bypass IP Whitelist (Comma-separated)
                </label>
                <textarea
                  rows={1}
                  placeholder="e.g. 127.0.0.1, 192.168.1.10"
                  value={whitelistIps}
                  onChange={(e) => setWhitelistIps(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-semibold outline-none transition resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <button
                type="submit"
                disabled={savingMaintenance}
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-slate-100 dark:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Check size={14} />
                <span>{savingMaintenance ? "Saving Settings..." : "Save Settings"}</span>
              </button>
            </div>
          </form>
        )}

        {/* ── SITE CONFIGURATION PANEL ── */}
        {activeTab === "config" && (
          <form onSubmit={handleSaveCommission} className="space-y-6">
            <div className="space-y-1.5 max-w-md">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Default Platform Commission Fee (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-semibold outline-none transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              />
              <p className="text-[10px] text-slate-400 font-medium leading-normal mt-1">
                This sets the standard transaction slice deducted automatically from seller invoices.
              </p>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <button
                type="submit"
                disabled={financeLoading}
                className="px-6 py-3.5 bg-slate-900 dark:bg-slate-800 text-slate-100 dark:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Check size={14} />
                <span>{financeLoading ? "Updating..." : "Save Configuration"}</span>
              </button>
            </div>
          </form>
        )}

        {/* ── FEATURE FLAGS PANEL ── */}
        {activeTab === "flags" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Release Feature Toggles</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                Instantly toggle experimental workflows or beta features across user routing systems.
              </p>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { id: "aiAssistant", label: "AI Customer Support Assistant", desc: "Enables client-facing chatbot drawer on the main storefront.", flag: flags.aiAssistant },
                { id: "smsNotifications", label: "SMS Dispatch Alerts", desc: "Sends carrier text updates to customers when order shifts state.", flag: flags.smsNotifications },
                { id: "sandboxBypass", label: "Stripe Sandbox Mock Bypass", desc: "Automatically bypasses real payment verification inside staging.", flag: flags.sandboxBypass },
                { id: "bulkDiscounts", label: "Smart Bulk Pricing Algorithms", desc: "Activates volume discounts for purchases of 5+ matching SKUs.", flag: flags.bulkDiscounts }
              ].map(item => (
                <div key={item.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0 gap-4">
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">{item.label}</p>
                    <p className="text-[10.5px] text-slate-400 dark:text-slate-500 font-medium leading-normal">{item.desc}</p>
                  </div>
                  
                  {/* Toggle switch button */}
                  <button
                    type="button"
                    onClick={() => toggleFlag(item.id)}
                    className={`w-12 h-7.5 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${ item.flag ? "bg-blue-600 justify-end" : "bg-slate-300 dark:bg-slate-700 justify-start" }`}
                  >
                    <span className="h-5.5 w-5.5 rounded-full bg-white dark:bg-slate-900 shadow-sm transform transition duration-300" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CLOUDINARY STORAGE CLEANUP PANEL ── */}
        {activeTab === "cloudinary" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Database size={15} className="text-blue-500" />
                  <span>Cloudinary Storage & Expired Assets Cleanup</span>
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                  Analyze storage usage, verify expiration constraints, and trigger automated daily cleanups.
                </p>
              </div>
              <button
                type="button"
                onClick={handleManualCleanup}
                disabled={cloudinaryLoading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-slate-100 dark:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {cloudinaryLoading ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/10 dark:border-slate-800 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <RefreshCw size={12} />
                )}
                <span>Run Cleanup Now</span>
              </button>
            </div>

            {fetchStatsLoading && !cloudinaryStats ? (
              <div className="flex flex-col items-center justify-center p-12 text-slate-400 text-xs font-semibold gap-2">
                <span className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span>Aggregating storage metrics...</span>
              </div>
            ) : !cloudinaryStats ? (
              <div className="p-6 text-center text-xs text-slate-400 font-semibold bg-slate-50 dark:bg-slate-900 rounded-xl">
                Failed to load storage dashboard. Make sure your Cloudinary environment keys are properly configured.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Storage gauge */}
                <div className="p-5 bg-slate-50/30 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Cloudinary Cloud Storage Usage</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white">
                      {cloudinaryStats.storagePercentage}% Used
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full transition-all duration-500"
                      style={{ width: `${Math.min(cloudinaryStats.storagePercentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                    <span>Used: {formatBytes(cloudinaryStats.storageUsed)}</span>
                    <span>Total Limit: {formatBytes(cloudinaryStats.storageLimit)}</span>
                  </div>
                </div>

                {/* Storage statistics grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Campaigns</p>
                    <p className="text-lg font-black text-slate-800 dark:text-white">{cloudinaryStats.activeCampaignsCount}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Expired Assets Pending</p>
                    <p className="text-lg font-black text-rose-500">{cloudinaryStats.expiredPendingCount}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Deleted Assets Today</p>
                    <p className="text-lg font-black text-green-500">{cloudinaryStats.deletedTodayCount}</p>
                  </div>
                </div>

                {/* Logs table */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Cloudinary Cleanup Activity Logs</h4>
                  
                  <div className="border border-slate-200 dark:border-white/[0.06] rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/30">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left text-xs text-slate-600 dark:text-slate-300">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-slate-400 font-bold">
                            <th className="p-3">Deleted Date</th>
                            <th className="p-3">Public ID</th>
                            <th className="p-3">Folder</th>
                            <th className="p-3">Reason</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {cloudinaryStats.logs.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="p-4 text-center text-slate-400 font-semibold">
                                No cleanups have been executed or logged yet.
                              </td>
                            </tr>
                          ) : (
                            cloudinaryStats.logs.map(log => (
                              <tr key={log._id} className="hover:bg-slate-100/30 dark:hover:bg-slate-800/20">
                                <td className="p-3 font-medium whitespace-nowrap">
                                  {new Date(log.deletedAt).toLocaleString()}
                                </td>
                                <td className="p-3 font-mono text-[10px] text-blue-500 truncate max-w-[200px]" title={log.publicId}>
                                  {log.publicId}
                                </td>
                                <td className="p-3 font-semibold text-[10.5px]">
                                  {log.folder}
                                </td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase tracking-wider ${ log.reason === "Deal Expired" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/25 dark:text-amber-400" : log.reason === "Banner Expired" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/25 dark:text-blue-400" : log.reason === "Ad Campaign Ended" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/25 dark:text-purple-400" : "bg-rose-100 text-rose-700 dark:bg-rose-900/25 dark:text-rose-400" }`}>
                                    {log.reason}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default SystemSettings;
