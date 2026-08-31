import React, { useState } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import { 
  Megaphone, 
  Send, 
  Info, 
  Users, 
  Store, 
  UserCheck, 
  Truck,
  Sparkles,
  Zap,
  CheckCircle2
} from "lucide-react";

const NotificationsAdmin = ({ token }) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState("all");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return toast.error("Title and message body are required");

    setSubmitting(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/announce`,
        { title, message, targetRole },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message || "Announcement broadcast successfully!");
        setTitle("");
        setMessage("");
      } else {
        toast.error(data.message || "Broadcast failed");
      }
    } catch {
      toast.error("Failed to broadcast announcement");
    } finally {
      setSubmitting(false);
    }
  };

  const applyTemplate = (tplTitle, tplMsg, role = "all") => {
    setTitle(tplTitle);
    setMessage(tplMsg);
    setTargetRole(role);
    toast.info(`Applied template: "${tplTitle}"`);
  };

  const audienceOptions = [
    { id: "all", label: "All Users", icon: Users, desc: "Customers, Sellers & Agents" },
    { id: "customers", label: "Customers", icon: UserCheck, desc: "Registered Shoppers" },
    { id: "sellers", label: "Sellers", icon: Store, desc: "Merchant Storeowners" },
    { id: "deliverymen", label: "Delivery Agents", icon: Truck, desc: "Couriers & Drivers" }
  ];

  return (
    <div className="space-y-6 animate-fadeIn text-slate-800 dark:text-slate-100">
      
      {/* ── Top Header Banner ── */}
      <div className="bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-purple-900/10 dark:from-blue-500/10 dark:via-indigo-500/10 dark:to-purple-500/10 border border-blue-500/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <Megaphone size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Platform Broadcast Center</h1>
              <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-full">
                Live Channels
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Dispatch push notifications, system maintenance alerts, and operational updates instantly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>WebSocket Engine Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Left 2 Columns: Main Composition Form ── */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-5">
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Compose System Announcement</h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Configure target audience and announcement payload</p>
            </div>

            {/* Quick Templates Trigger */}
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Fast Presets</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Audience Selector Grid */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
                Select Broadcast Audience *
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {audienceOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = targetRole === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTargetRole(opt.id)}
                      className={`p-3 rounded-xl border text-left transition duration-200 cursor-pointer flex flex-col justify-between gap-2.5 relative overflow-hidden group ${
                        isSelected
                          ? "bg-blue-600 dark:bg-blue-600 text-white border-blue-600 dark:border-blue-500 shadow-md shadow-blue-500/20"
                          : "bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-1.5 rounded-lg ${isSelected ? "bg-white/20 text-white" : "bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>
                          <Icon size={16} />
                        </div>
                        {isSelected && <CheckCircle2 size={14} className="text-white" />}
                      </div>

                      <div>
                        <span className={`text-xs font-black block tracking-tight ${isSelected ? "text-white" : "text-slate-900 dark:text-white"}`}>
                          {opt.label}
                        </span>
                        <span className={`text-[9px] font-semibold block mt-0.5 ${isSelected ? "text-blue-100" : "text-slate-400 dark:text-slate-500"}`}>
                          {opt.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notification Title Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Notification Headline *
                </label>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                  {title.length} / 80
                </span>
              </div>

              <input
                type="text"
                placeholder="e.g. Scheduled System Maintenance Notice"
                value={title}
                maxLength={80}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold placeholder-slate-400 dark:placeholder-slate-500 outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Announcement Body Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Announcement Body *
                </label>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                  {message.length} / 500
                </span>
              </div>

              <textarea
                placeholder="Details of the operational change, server downtime window, or promotional announcement..."
                value={message}
                maxLength={500}
                rows={5}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold placeholder-slate-400 dark:placeholder-slate-500 outline-none transition resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Submit Broadcast Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition duration-200 shadow-md shadow-blue-500/20 active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Dispatching System Alert...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Dispatch System Announcement</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* ── Right 1 Column: Templates & Guidelines ── */}
        <div className="space-y-5">
          
          {/* Quick Preset Templates Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-amber-500" />
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Quick Announcement Presets
              </h3>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => applyTemplate(
                  "⚡ Scheduled Platform Maintenance",
                  "We will be undergoing scheduled database optimization tonight at 2:00 AM UTC. Services may experience minor delay for 15 minutes.",
                  "all"
                )}
                className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/40 transition cursor-pointer group"
              >
                <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-blue-500">
                  ⚡ Scheduled Maintenance
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate mt-0.5">
                  Downtime & database optimization alert for all users.
                </span>
              </button>

              <button
                type="button"
                onClick={() => applyTemplate(
                  "🎉 Mega Savings Festival Live!",
                  "Explore newly cataloged merchandise with instant checkout discounts and express delivery options across all categories.",
                  "customers"
                )}
                className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/40 transition cursor-pointer group"
              >
                <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-blue-500">
                  🎉 Promotional Festival
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate mt-0.5">
                  Customer campaign announcement for sale events.
                </span>
              </button>

              <button
                type="button"
                onClick={() => applyTemplate(
                  "📦 Express Courier Incentive Update",
                  "Delivery partners completing over 15 orders today qualify for high-tier peak hour bonuses. Keep active!",
                  "deliverymen"
                )}
                className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/40 transition cursor-pointer group"
              >
                <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-blue-500">
                  📦 Courier Incentive Notice
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate mt-0.5">
                  Targeted delivery partner bonus update.
                </span>
              </button>
            </div>
          </div>

          {/* Broadcast Guidelines Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-blue-500" />
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Broadcast Protocols
              </h3>
            </div>

            <ul className="space-y-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span>Notifications are written instantly to user notification centers and broadcast via WebSockets.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span>Keep titles clear and concise to maximize mobile pop-up visibility.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span>Use targeted audience selection to prevent irrelevant notification spam to merchant partners.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};

export default NotificationsAdmin;
