import React, { useState } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import { Megaphone, Send, Info, Users, Store, UserCheck } from "lucide-react";

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
        toast.success(data.message);
        setTitle("");
        setMessage("");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to broadcast announcement");
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-orange-500 text-slate-100 dark:text-white rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
          <Megaphone size={20} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Platform Announcements</h1>
          <p className="text-xs text-slate-400">Broadcast alerts and send system notifications to specific groups or all users</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composition Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight">Compose System Announcement</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Broadcast Audience</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setTargetRole("all")}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${ targetRole === "all" ? "bg-slate-950 text-slate-100 dark:text-white border-slate-950 shadow-sm" : "bg-white text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-slate-50" }`}
                >
                  <Users size={16} />
                  <span>All Users</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetRole("customers")}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${ targetRole === "customers" ? "bg-slate-950 text-slate-100 dark:text-white border-slate-950 shadow-sm" : "bg-white text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-slate-50" }`}
                >
                  <UserCheck size={16} />
                  <span>Customers</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetRole("sellers")}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${ targetRole === "sellers" ? "bg-slate-950 text-slate-100 dark:text-white border-slate-950 shadow-sm" : "bg-white text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-slate-50" }`}
                >
                  <Store size={16} />
                  <span>Sellers</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetRole("deliverymen")}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${ targetRole === "deliverymen" ? "bg-slate-950 text-slate-100 dark:text-white border-slate-950 shadow-sm" : "bg-white text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-slate-50" }`}
                >
                  <Megaphone size={16} />
                  <span>Delivery Agents</span>
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Notification Title *</label>
              <input
                type="text"
                placeholder="e.g. Schedule Server Maintenance"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-xs outline-none transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Announcement Body *</label>
              <textarea
                placeholder="Details of the announcement, changes or promo codes to share..."
                value={message}
                rows={5}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-xs outline-none transition resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-100 dark:text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <Send size={14} />
              <span>{submitting ? "Sending Announcement..." : "Broadcast Alert"}</span>
            </button>
          </form>
        </div>

        {/* Tip panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
            <Info size={16} />
            <span>Best Practices</span>
          </h3>
          <ul className="text-xs text-slate-500 space-y-2.5 list-disc pl-4 leading-relaxed">
            <li>Notifications are pushed instantly to the recipient's notification center.</li>
            <li>Maintain clear, concise headlines for critical announcements.</li>
            <li>For promotion campaigns, use the <strong>Coupons & Promotions</strong> panels instead.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotificationsAdmin;
