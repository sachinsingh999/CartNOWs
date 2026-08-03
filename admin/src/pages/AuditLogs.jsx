import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import { 
  Shield, RefreshCw, Search, ShieldAlert, Users, Calendar, Activity, ArrowUpRight, Filter, Eye, ChevronRight, X, User, Store, Truck, ShieldCheck
} from "lucide-react";

// Helper for color-coding role labels
const getRoleBadgeStyle = (role) => {
  const r = (role || "").toLowerCase();
  if (r.includes("customer") || r.includes("user")) {
    return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
  }
  if (r.includes("seller") || r.includes("merchant")) {
    return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
  }
  if (r.includes("delivery") || r.includes("driver") || r.includes("courier")) {
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  }
  return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
};

// Helper for color-coding action labels
const getActionBadgeColor = (action) => {
  const a = (action || "").toLowerCase();
  if (a.includes("delete") || a.includes("suspend") || a.includes("cancel") || a.includes("reject") || a.includes("deactivate")) {
    return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
  }
  if (a.includes("approve") || a.includes("activate") || a.includes("verify") || a.includes("create") || a.includes("add") || a.includes("placed")) {
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  }
  if (a.includes("reassign") || a.includes("update") || a.includes("change") || a.includes("edit") || a.includes("shipment")) {
    return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
  }
  return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
};

const AuditLogs = ({ token }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [showDetailModal, setShowDetailModal] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/logs`, { headers: { token } });
      if (data.success) {
        setLogs(data.logs);
      }
    } catch {
      toast.error("Failed to load audit logs");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // 1. Calculate dynamic statistics across roles
  const statistics = useMemo(() => {
    if (!logs.length) return { total: 0, customers: 0, sellers: 0, deliverymen: 0, admins: 0 };

    const total = logs.length;
    const customers = logs.filter(l => (l.role || "").toLowerCase().includes("customer") || (l.role || "").toLowerCase().includes("user")).length;
    const sellers = logs.filter(l => (l.role || "").toLowerCase().includes("seller")).length;
    const deliverymen = logs.filter(l => (l.role || "").toLowerCase().includes("delivery")).length;
    const admins = logs.filter(l => (l.role || "").toLowerCase().includes("admin")).length;

    return { total, customers, sellers, deliverymen, admins };
  }, [logs]);

  // Unique filter lists
  const filterOptions = useMemo(() => {
    const actions = new Set(logs.map(l => l.action).filter(Boolean));
    return {
      actions: Array.from(actions)
    };
  }, [logs]);

  // 2. Filter logs reactively by role & search query
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Role filter
      if (roleFilter !== "all") {
        const r = (log.role || "").toLowerCase();
        if (roleFilter === "customer" && !r.includes("customer") && !r.includes("user")) return false;
        if (roleFilter === "seller" && !r.includes("seller")) return false;
        if (roleFilter === "deliveryman" && !r.includes("delivery") && !r.includes("driver")) return false;
        if (roleFilter === "admin" && !r.includes("admin")) return false;
      }
      
      // Action filter
      if (actionFilter !== "all" && log.action !== actionFilter) return false;

      // Text search
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const inActor = log.actor?.toLowerCase().includes(query);
        const inRole = log.role?.toLowerCase().includes(query);
        const inAction = log.action?.toLowerCase().includes(query);
        const inTarget = log.target?.toLowerCase().includes(query);
        const inDetails = log.details?.toLowerCase().includes(query);
        return inActor || inRole || inAction || inTarget || inDetails;
      }

      return true;
    });
  }, [logs, searchQuery, roleFilter, actionFilter]);

  return (
    <div className="space-y-5.5 animate-fadeIn text-slate-800 dark:text-slate-100">
      
      {/* ── Single Consolidated Container: Header, Stats, Role Tabs & Search ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs space-y-3.5 shrink-0">
        
        {/* Top: Header Row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-blue-600 dark:bg-blue-500/10 text-slate-100 dark:text-white dark:text-blue-400 rounded-lg flex items-center justify-center border border-blue-500/10 shadow-xs shrink-0">
              <Shield size={16} />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-800 dark:text-white tracking-tight">System & User Audit Trail</h1>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Live activity logs across Customers, Sellers, Deliverymen, and Admins</p>
            </div>
          </div>

          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg text-xs font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RefreshCw size={12} className={loading ? "animate-spin text-blue-500" : ""} />
            <span>Refresh Feed</span>
          </button>
        </div>

        {/* Middle: Statistics Analytics Layer */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total Operations", value: statistics.total, subtitle: "Recorded system events", icon: Activity, color: "text-blue-500 bg-blue-500/10" },
            { label: "Customer Activities", value: statistics.customers, subtitle: "Orders & Account events", icon: User, color: "text-indigo-500 bg-indigo-500/10" },
            { label: "Seller Actions", value: statistics.sellers, subtitle: "Catalog & Product updates", icon: Store, color: "text-purple-500 bg-purple-500/10" },
            { label: "Delivery Runs", value: statistics.deliverymen, subtitle: "Shipment status & claims", icon: Truck, color: "text-emerald-500 bg-emerald-500/10" }
          ].map((stat, idx) => (
            <div key={idx} className="bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800 p-3 rounded-xl flex items-center justify-between shadow-xs">
              <div>
                <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1 tracking-tight">{stat.value}</h3>
                <p className="text-[9px] text-slate-400 mt-0.5 font-semibold">{stat.subtitle}</p>
              </div>
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center border border-slate-200/50 dark:border-slate-800 ${stat.color}`}>
                <stat.icon size={15} />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom: Role Tabs & Search Controller Bar */}
        <div className="space-y-2.5 pt-0.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Role Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1">
              {[
                { id: "all", label: "All Roles", icon: Activity },
                { id: "customer", label: "Customers", icon: User },
                { id: "seller", label: "Sellers", icon: Store },
                { id: "deliveryman", label: "Deliverymen", icon: Truck },
                { id: "admin", label: "Admins", icon: ShieldCheck }
              ].map(tab => {
                const Icon = tab.icon;
                const isSelected = roleFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setRoleFilter(tab.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      isSelected 
                        ? "bg-slate-900 dark:bg-blue-600 text-white shadow-xs" 
                        : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Icon size={11} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Action Dropdown */}
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-2.5 py-1 text-[11px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 outline-none cursor-pointer font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
            >
              <option value="all">Filter by Action: All</option>
              {filterOptions.actions.map(act => (
                <option key={act} value={act}>{act}</option>
              ))}
            </select>
          </div>

          {/* Text Search Box */}
          <div className="relative flex items-center">
            <Search size={13} className="absolute left-3 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search by actor email/name, action label, target reference, or context details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-[11px] bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Main Table Feed */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.06] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-800 dark:text-white tracking-tight uppercase flex items-center gap-2">
            <Activity size={14} className="text-blue-500" />
            <span>Operational Audit & Activity Stream</span>
          </h2>
          <span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-950 px-2.5 py-1 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 uppercase tracking-widest select-none">
            {filteredLogs.length} Events Logged
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">No matching audit logs found for selected filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto min-w-0">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/[0.04] text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none">
                  <th className="py-3 pr-4">Timestamp</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Ref</th>
                  <th className="py-3 px-4">Context Details</th>
                  <th className="py-3 pl-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50 dark:divide-white/[0.03] text-slate-700 dark:text-slate-300 font-semibold">
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition">
                    <td className="py-3.5 pr-4 text-slate-400 dark:text-slate-500 whitespace-nowrap font-mono text-[10px]">
                      {new Date(log.createdAt).toLocaleString(undefined, {
                        month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit"
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 border rounded-md text-[9px] font-extrabold uppercase tracking-wide leading-none ${getRoleBadgeStyle(log.role)}`}>
                        {log.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white truncate max-w-[170px]" title={log.actor}>
                      {log.actor}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 border rounded-md text-[9px] font-extrabold uppercase tracking-wide leading-none ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono font-bold select-all">
                      {log.target || "N/A"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 truncate max-w-[220px]" title={log.details}>
                      {log.details || "No metadata recorded"}
                    </td>
                    <td className="py-3.5 pl-4 text-right">
                      <button 
                        onClick={() => setShowDetailModal(log)}
                        className="p-1 hover:text-blue-500 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.04] rounded transition cursor-pointer inline-flex items-center gap-0.5 font-bold uppercase text-[9px]"
                      >
                        <span>Inspect</span>
                        <ChevronRight size={10} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Inspector Modal ── */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs" onClick={() => setShowDetailModal(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4 animate-scaleUp">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="text-blue-500" size={16} />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">Audit Event Inspector</h3>
              </div>
              <button onClick={() => setShowDetailModal(null)} className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer">
                <X size={14} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs font-semibold">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 dark:text-slate-500">Actor Role:</span>
                <span className={`px-2 py-0.5 border rounded-md text-[9px] font-extrabold uppercase tracking-wide leading-none ${getRoleBadgeStyle(showDetailModal.role)}`}>
                  {showDetailModal.role}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-500">Actor Identifier:</span>
                <span className="text-slate-800 dark:text-white font-bold">{showDetailModal.actor}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 dark:text-slate-500">Action Label:</span>
                <span className={`px-2 py-0.5 border rounded-md text-[9px] font-extrabold uppercase tracking-wide leading-none ${getActionBadgeColor(showDetailModal.action)}`}>
                  {showDetailModal.action}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-500">Target Reference:</span>
                <span className="text-slate-800 dark:text-slate-300 font-mono select-all font-bold">{showDetailModal.target || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-500">Executed At:</span>
                <span className="text-slate-600 dark:text-slate-400 font-bold">{new Date(showDetailModal.createdAt).toLocaleString()}</span>
              </div>
              
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Metadata Payload Details</span>
                <p className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-3.5 text-slate-700 dark:text-slate-300 leading-relaxed break-words font-medium select-all shadow-xs">
                  {showDetailModal.details || "No metadata payload recorded"}
                </p>
              </div>
            </div>

            <button 
              onClick={() => setShowDetailModal(null)}
              className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl py-2.5 text-xs font-bold transition cursor-pointer active:scale-98"
            >
              Close Inspector
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default AuditLogs;
