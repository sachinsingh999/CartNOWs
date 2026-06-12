import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import { 
  Shield, RefreshCw, Search, ShieldAlert, Users, Calendar, Activity, ArrowUpRight, Filter, Eye, ChevronRight, X
} from "lucide-react";

// Helper for color-coding action labels
const getActionBadgeColor = (action) => {
  const a = action.toLowerCase();
  if (a.includes("delete") || a.includes("suspend") || a.includes("cancel") || a.includes("reject") || a.includes("deactivate")) {
    return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
  }
  if (a.includes("approve") || a.includes("activate") || a.includes("verify") || a.includes("create") || a.includes("add")) {
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  }
  if (a.includes("reassign") || a.includes("update") || a.includes("change") || a.includes("edit")) {
    return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
  }
  return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
};

const AuditLogs = ({ token }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [operatorFilter, setOperatorFilter] = useState("all");
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

  // 1. Calculate dynamic statistics
  const statistics = useMemo(() => {
    if (!logs.length) return { total: 0, operators: 0, critical: 0, lastActive: "N/A" };

    const total = logs.length;
    
    // Unique operators
    const uniqueOperators = new Set(logs.map(l => l.adminEmail)).size;

    // Critical events (suspensions, updates, deletions)
    const critical = logs.filter(l => {
      const act = l.action.toLowerCase();
      return act.includes("delete") || act.includes("suspend") || act.includes("reassign") || act.includes("reject") || act.includes("cancel");
    }).length;

    // Last active time
    const lastActive = logs[0] ? new Date(logs[0].createdAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : "N/A";

    return { total, operators: uniqueOperators, critical, lastActive };
  }, [logs]);

  // Unique filter lists
  const filterOptions = useMemo(() => {
    const operators = new Set(logs.map(l => l.adminEmail).filter(Boolean));
    const actions = new Set(logs.map(l => l.action).filter(Boolean));
    return {
      operators: Array.from(operators),
      actions: Array.from(actions)
    };
  }, [logs]);

  // 2. Filter logs reactively
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Operator filter
      if (operatorFilter !== "all" && log.adminEmail !== operatorFilter) return false;
      
      // Action filter
      if (actionFilter !== "all" && log.action !== actionFilter) return false;

      // Text search
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const inEmail = log.adminEmail?.toLowerCase().includes(query);
        const inAction = log.action?.toLowerCase().includes(query);
        const inTarget = log.target?.toLowerCase().includes(query);
        const inDetails = log.details?.toLowerCase().includes(query);
        return inEmail || inAction || inTarget || inDetails;
      }

      return true;
    });
  }, [logs, searchQuery, operatorFilter, actionFilter]);

  return (
    <div className="space-y-5.5 animate-fadeIn">
      
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-slate-200/60 dark:border-white/[0.06] pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-600 dark:bg-blue-500/10 text-white dark:text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/10 shadow-lg shadow-blue-500/10">
            <Shield size={20} />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-800 dark:text-white tracking-tight">Security & Audit Logs</h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Real-time trails of administrative & security events</p>
          </div>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#172033] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-slate-655 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg text-xs font-bold transition active:scale-98 disabled:opacity-50 cursor-pointer shadow-xs"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          <span>Refresh Console</span>
        </button>
      </div>

      {/* Statistics Analytics Layer */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Operations", value: statistics.total, subtitle: "Recorded events", icon: Activity, color: "text-blue-500 bg-blue-500/5" },
          { label: "Unique Operators", value: statistics.operators, subtitle: "Registered Admins", icon: Users, color: "text-indigo-500 bg-indigo-500/5" },
          { label: "Critical Actions", value: statistics.critical, subtitle: "SLA / State changes", icon: ShieldAlert, color: "text-rose-500 bg-rose-500/5" },
          { label: "Last Active Time", value: statistics.lastActive, subtitle: "Recent operations", icon: Calendar, color: "text-emerald-500 bg-emerald-500/5" }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-[#172033] border border-slate-150 dark:border-white/[0.06] p-4 rounded-xl flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1.5 tracking-tight">{stat.value}</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">{stat.subtitle}</p>
            </div>
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center border border-slate-200/50 dark:border-white/[0.06] ${stat.color}`}>
              <stat.icon size={15} />
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Controller Panel */}
      <div className="bg-white dark:bg-[#172033] border border-slate-150 dark:border-white/[0.06] p-4 rounded-xl shadow-xs space-y-3.5">
        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
          <Filter size={12} />
          <span className="font-bold text-[9px] uppercase tracking-widest leading-none">Console Search Filters</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Text Search Box */}
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3.5 text-slate-450 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search operators, targets, action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-white/[0.06] rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500/50 transition font-semibold"
            />
          </div>

          {/* Operator Dropdown */}
          <select
            value={operatorFilter}
            onChange={(e) => setOperatorFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-white/[0.06] rounded-lg text-slate-700 dark:text-slate-250 outline-none cursor-pointer focus:border-blue-500/50 font-semibold"
          >
            <option value="all">Filter by Operator: All</option>
            {filterOptions.operators.map(op => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>

          {/* Action Dropdown */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-white/[0.06] rounded-lg text-slate-700 dark:text-slate-250 outline-none cursor-pointer focus:border-blue-500/50 font-semibold"
          >
            <option value="all">Filter by Action: All</option>
            {filterOptions.actions.map(act => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table Feed */}
      <div className="bg-white dark:bg-[#172033] border border-slate-150 dark:border-white/[0.06] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-800 dark:text-white tracking-tight uppercase">Operational Security Audit Log</h2>
          <span className="text-[9px] font-bold bg-slate-100 dark:bg-[#111827] px-2 py-0.5 border border-slate-200 dark:border-white/[0.06] rounded-md text-slate-500 dark:text-slate-400 uppercase tracking-widest select-none">
            {filteredLogs.length} Events Listed
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">No operations matches found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto min-w-0">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/[0.04] text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none">
                  <th className="py-3 pr-4">Timestamp</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Ref</th>
                  <th className="py-3 px-4">Context Details</th>
                  <th className="py-3 pl-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50 dark:divide-white/[0.03] text-slate-655 dark:text-slate-300 font-semibold">
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition">
                    <td className="py-3.5 pr-4 text-slate-400 dark:text-slate-500 whitespace-nowrap font-mono text-[10px]">
                      {new Date(log.createdAt).toLocaleString(undefined, {
                        month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit"
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white truncate max-w-[150px]" title={log.adminEmail}>
                      {log.adminEmail}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 border rounded-md text-[9px] font-extrabold uppercase tracking-wide leading-none ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono font-bold select-all">
                      {log.target || "N/A"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 truncate max-w-[200px]" title={log.details}>
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
          <div className="relative w-full max-w-md bg-white dark:bg-[#151b26] border border-slate-205 dark:border-white/[0.08] rounded-2xl shadow-2xl p-5 space-y-4 animate-scaleUp">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Shield className="text-blue-500" size={16} />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">Security Event Detail</h3>
              </div>
              <button onClick={() => setShowDetailModal(null)} className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer">
                <X size={14} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs font-semibold">
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-500">Operator:</span>
                <span className="text-slate-800 dark:text-white font-bold">{showDetailModal.adminEmail}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 dark:text-slate-500">Action Label:</span>
                <span className={`px-2 py-0.5 border rounded-md text-[9px] font-extrabold uppercase tracking-wide leading-none ${getActionBadgeColor(showDetailModal.action)}`}>
                  {showDetailModal.action}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-500">Target Object:</span>
                <span className="text-slate-850 dark:text-slate-300 font-mono select-all font-bold">{showDetailModal.target || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-500">Executed At:</span>
                <span className="text-slate-600 dark:text-slate-400 font-bold">{new Date(showDetailModal.createdAt).toLocaleString()}</span>
              </div>
              
              <div className="border-t border-slate-100 dark:border-white/[0.04] pt-3 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Metadata Payload Details</span>
                <p className="bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-white/[0.04] rounded-xl p-3.5 text-slate-700 dark:text-slate-300 leading-relaxed break-words font-medium select-all shadow-xs">
                  {showDetailModal.details || "No metadata payload recorded"}
                </p>
              </div>
            </div>

            <button 
              onClick={() => setShowDetailModal(null)}
              className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl py-2 text-xs font-bold transition cursor-pointer active:scale-98"
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
