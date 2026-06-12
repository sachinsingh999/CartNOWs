import React from "react";
import { Link } from "react-router-dom";
import { Activity } from "lucide-react";

const AdminActivityFeed = ({ logs }) => {
  const getActionColor = (action = "") => {
    const act = action.toLowerCase();
    if (act.includes("delete") || act.includes("remove") || act.includes("cancel") || act.includes("reject")) {
      return {
        bg: "bg-rose-500/10 dark:bg-rose-500/20",
        text: "text-rose-600 dark:text-rose-400",
        border: "border-rose-200 dark:border-rose-500/30",
        dot: "bg-rose-500"
      };
    }
    if (act.includes("add") || act.includes("create") || act.includes("approve") || act.includes("success")) {
      return {
        bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-200 dark:border-emerald-500/30",
        dot: "bg-emerald-500"
      };
    }
    if (act.includes("assign") || act.includes("update") || act.includes("edit") || act.includes("dispatch")) {
      return {
        bg: "bg-blue-500/10 dark:bg-blue-500/20",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-200 dark:border-blue-500/30",
        dot: "bg-blue-500"
      };
    }
    return {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-600 dark:text-slate-400",
      border: "border-slate-200 dark:border-white/[0.08]",
      dot: "bg-slate-400"
    };
  };

  return (
    <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-white/[0.08] rounded-xl p-5 shadow-sm flex flex-col h-full min-h-[380px] lg:min-h-0">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3.5 mb-4 shrink-0">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-1.5">
          <Activity size={14} className="text-blue-500 animate-pulse" />
          <span>System Audits Feed</span>
        </h3>
        <Link to="/logs" className="text-[9px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-widest cursor-pointer transition">
          View Logs
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar relative">
        {logs.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic py-8 text-center">No recent activity logs.</p>
        ) : (
          <div className="relative pl-4 border-l border-slate-100 dark:border-white/[0.06] space-y-5 py-1">
            {logs.slice(0, 10).map((log) => {
              const styles = getActionColor(log.action);
              return (
                <div key={log._id} className="relative group transition-all duration-200">
                  {/* Timeline dot */}
                  <span className={`absolute -left-[21px] top-1.5 h-2 w-2 rounded-full ring-4 ring-white dark:ring-[#172033] ${styles.dot}`} />
                  
                  {/* Log Content Card */}
                  <div className="text-[11px] font-semibold space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${styles.bg} ${styles.text} border ${styles.border}`}>
                        {log.action}
                      </span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold shrink-0 mt-0.5">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-755 dark:text-slate-200 font-bold mt-1 text-[11px]">
                      {log.target}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                      {log.details}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminActivityFeed;
