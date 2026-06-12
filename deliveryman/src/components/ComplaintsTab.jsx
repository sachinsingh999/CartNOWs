import React from "react";
import { AlertTriangle, PlusCircle, CheckCircle, FileText } from "lucide-react";

const ComplaintsTab = ({
  filteredComplaints,
  complaintForm,
  setComplaintForm,
  handleComplaintSubmit
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
      
      {/* List */}
      <div className="space-y-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5.5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 flex items-center justify-center">
              <FileText size={13} />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Your Logged Disputes</h3>
          </div>
          <span className="bg-slate-50 dark:bg-slate-900 text-slate-505 dark:text-slate-400 text-[8px] font-black px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 uppercase tracking-wider">
            {filteredComplaints.length} Total Logs
          </span>
        </div>
        
        {filteredComplaints.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
            <p className="text-xs text-slate-500 font-medium">No complaints submitted yet.</p>
            <p className="text-[10px] text-slate-400">All formal disputes filed through your panel will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredComplaints.map((c) => (
              <div key={c._id} className="border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl p-4.5 space-y-3 text-xs hover:border-slate-300 dark:hover:border-slate-700 transition duration-150">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <p className="font-black text-slate-900 dark:text-white text-xs">{c.subject}</p>
                    <p className="text-[9px] text-slate-405 dark:text-slate-500 mt-1 font-bold">Category: {c.category}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md font-black text-[8px] uppercase tracking-wider border shrink-0 ${
                    c.status === "Resolved"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-450 border-amber-500/20"
                  }`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-slate-650 dark:text-slate-450 leading-relaxed font-semibold bg-slate-100/50 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-200/50 dark:border-slate-800/60">{c.description}</p>
                
                {c.adminReply && (
                  <div className="bg-blue-500/5 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/40 p-3.5 rounded-xl text-blue-700 dark:text-blue-300 flex items-start gap-2.5">
                    <CheckCircle size={14} className="shrink-0 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-black text-[9px] uppercase tracking-widest leading-none mb-1">Admin Reply Note</p>
                      <p className="mt-0.5 font-semibold leading-relaxed">{c.adminReply}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleComplaintSubmit} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4.5 hover:shadow-md transition-all duration-300">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
          <AlertTriangle size={15} className="text-blue-500" />
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Log Dispatch Issue</h3>
        </div>
        
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Category</label>
          <select
            value={complaintForm.category}
            onChange={(e) => setComplaintForm(c => ({ ...c, category: e.target.value }))}
            className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none bg-slate-50 dark:bg-slate-900 focus:border-blue-600 transition text-slate-900 dark:text-white cursor-pointer"
          >
            <option value="Payment Issue">Payment Issue</option>
            <option value="App Glitch">App Glitch</option>
            <option value="Customer Dispute">Customer Dispute</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase text-slate-505 dark:text-slate-400 tracking-wider">Subject</label>
          <input
            type="text"
            placeholder="Summarize the issue..."
            value={complaintForm.subject}
            onChange={(e) => setComplaintForm(c => ({ ...c, subject: e.target.value }))}
            className="w-full border border-slate-202 border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none bg-slate-50 dark:bg-slate-900 focus:border-blue-600 transition text-slate-900 dark:text-white"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase text-slate-505 dark:text-slate-400 tracking-wider">Description</label>
          <textarea
            rows="4"
            placeholder="Detail what happened..."
            value={complaintForm.description}
            onChange={(e) => setComplaintForm(c => ({ ...c, description: e.target.value }))}
            className="w-full border border-slate-202 border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs outline-none bg-slate-50 dark:bg-slate-900 focus:border-blue-600 transition resize-none font-semibold text-slate-900 dark:text-white leading-relaxed"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-650 hover:bg-blue-700 text-white rounded-xl py-3 text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-md shadow-blue-500/10 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <PlusCircle size={12} />
          <span>Submit Dispute File</span>
        </button>
      </form>
    </div>
  );
};

export default ComplaintsTab;
