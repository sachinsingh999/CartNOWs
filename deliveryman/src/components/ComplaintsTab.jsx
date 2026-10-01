import React from "react";
import { 
  PlusCircle, FileText, Send, ShieldCheck, MessageSquare, ArrowRight, LifeBuoy, Sparkles, AlertCircle
} from "lucide-react";

const ComplaintsTab = ({
  filteredComplaints,
  complaintForm,
  setComplaintForm,
  handleComplaintSubmit
}) => {
  const quickIssuePresets = [
    { category: "Customer Dispute", subject: "Customer unavailable / unreachable" },
    { category: "Payment Issue", subject: "Cash on delivery amount mismatch" },
    { category: "App Glitch", subject: "GPS route coordinates pin mismatch" },
    { category: "Other", subject: "Vehicle issue / Traffic delay" }
  ];

  return (
    <div className="space-y-3.5 text-slate-800 dark:text-slate-200">
      
      {/* Top Header Card */}
      <div className="glass-panel-elevated rounded-md p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border border-slate-200 dark:border-slate-800 border-t-2 border-t-rose-500">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-sm bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
              <LifeBuoy size={15} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Courier Incident & Support Center
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Log customer disputes, COD cash discrepancies, or route issues directly to shift dispatch.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card px-3 py-1.5 rounded-sm text-left border border-slate-200 dark:border-slate-800 shrink-0">
          <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Logged Tickets</span>
          <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
            {filteredComplaints.length} Records
          </span>
        </div>
      </div>

      {/* Main Grid: Form on Left, List on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        
        {/* Left 5 Cols: Form */}
        <div className="lg:col-span-5 glass-panel-elevated rounded-md p-4 shadow-sm space-y-3 border border-slate-200 dark:border-slate-800 border-t-2 border-t-blue-500">
          <div className="pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5 uppercase font-mono">
              <AlertCircle size={13} className="text-blue-500" />
              <span>Create Dispatch Ticket</span>
            </h3>
            <p className="text-[9px] text-slate-400 font-medium mt-0.5">Average dispatch response time ~10 mins</p>
          </div>

          {/* Quick Issue Templates */}
          <div className="space-y-1">
            <label className="text-[8px] font-mono font-bold uppercase text-slate-400 tracking-widest block">
              Quick Incident Presets
            </label>
            <div className="grid grid-cols-1 gap-1">
              {quickIssuePresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setComplaintForm({
                    category: preset.category,
                    subject: preset.subject,
                    description: complaintForm.description
                  })}
                  className="text-left text-[11px] font-medium p-2 rounded-sm glass-card text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer flex items-center justify-between group active:scale-98 border border-slate-200 dark:border-slate-800"
                >
                  <span className="truncate">{preset.subject}</span>
                  <ArrowRight size={10} className="shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition ml-2 text-blue-500" />
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleComplaintSubmit} className="space-y-2.5 pt-0.5">
            <div className="space-y-1">
              <label className="text-[8px] font-mono font-bold uppercase text-slate-400 tracking-widest block">
                Category
              </label>
              <select
                value={complaintForm.category}
                onChange={(e) => setComplaintForm((c) => ({ ...c, category: e.target.value }))}
                className="w-full border border-slate-200 dark:border-slate-800 rounded-sm px-2.5 py-1.5 text-xs font-medium outline-none bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white cursor-pointer focus:ring-1 focus:ring-blue-500"
              >
                <option value="Payment Issue">Payment / COD Dispute</option>
                <option value="Customer Dispute">Customer Communication Issue</option>
                <option value="App Glitch">GPS / App Glitch</option>
                <option value="Other">Vehicle Delay / Other Incident</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-mono font-bold uppercase text-slate-400 tracking-widest block">
                Subject
              </label>
              <input
                type="text"
                placeholder="Brief summary..."
                value={complaintForm.subject}
                onChange={(e) => setComplaintForm((c) => ({ ...c, subject: e.target.value }))}
                className="w-full border border-slate-200 dark:border-slate-800 rounded-sm px-2.5 py-1.5 text-xs font-medium outline-none bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 placeholder-slate-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-mono font-bold uppercase text-slate-400 tracking-widest block">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Detail what occurred..."
                value={complaintForm.description}
                onChange={(e) => setComplaintForm((c) => ({ ...c, description: e.target.value }))}
                className="w-full border border-slate-200 dark:border-slate-800 rounded-sm px-2.5 py-1.5 text-xs font-medium outline-none bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white resize-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-sm py-2 text-xs font-mono font-bold uppercase tracking-wider transition active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 shadow-xs border border-blue-400/30"
            >
              <Send size={11} />
              <span>Submit Ticket to Dispatch</span>
            </button>
          </form>
        </div>

        {/* Right 7 Cols: Ticket History */}
        <div className="lg:col-span-7 glass-panel-elevated rounded-md p-4 shadow-sm space-y-3 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase font-mono">Active & Past Tickets</h3>
            <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider">
              {filteredComplaints.length} Records
            </span>
          </div>

          {filteredComplaints.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
              <div className="h-9 w-9 rounded-sm bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                <ShieldCheck size={18} />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono uppercase">Clean Incident Record</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">You have no open disputes or filed tickets.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto no-scrollbar">
              {filteredComplaints.map((c) => (
                <div
                  key={c._id}
                  className="glass-card rounded-sm p-3 space-y-2 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">{c.subject}</h4>
                      <p className="text-[9px] font-mono text-slate-400 font-medium mt-0.5">
                        Category: <span className="text-slate-700 dark:text-slate-300 font-bold">{c.category}</span>
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-sm font-mono font-bold text-[8px] uppercase tracking-wider shrink-0 border ${
                        c.status === "Resolved"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed font-medium bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-sm border border-slate-100 dark:border-slate-800/60">
                    "{c.description}"
                  </p>

                  {c.adminReply && (
                    <div className="bg-blue-500/5 dark:bg-blue-950/30 border border-blue-500/20 p-2.5 rounded-sm text-xs flex items-start gap-2">
                      <MessageSquare size={12} className="shrink-0 text-blue-500 mt-0.5" />
                      <div>
                        <span className="font-mono font-bold text-[8px] uppercase tracking-widest text-blue-600 dark:text-blue-400 block">
                          Dispatch Response
                        </span>
                        <p className="text-slate-800 dark:text-slate-200 mt-0.5 font-medium leading-relaxed text-[11px]">{c.adminReply}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ComplaintsTab;
