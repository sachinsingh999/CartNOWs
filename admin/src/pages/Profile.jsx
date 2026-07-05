import React from "react";
import { 
  ShieldCheck, 
  Mail, 
  FileText, 
  Key, 
  Terminal, 
  Activity, 
  Server 
} from "lucide-react";

const Profile = () => {
  const adminInfo = {
    name: "Control Panel Administrator",
    email: "admin@cartnow.com",
    role: "System Owner / Root Superuser",
    status: "Active / Highly Secure",
    environment: "Production Cluster",
    lastLogin: new Date().toLocaleString(),
    permissions: [
      "Catalog Taxonomy & Category Templating",
      "Seller Verification & Commission Rules Management",
      "Supervised Product Moderation & Publishing",
      "Financial Balance Settlements & Payout Approvals",
      "System Audit Logging & Compliance Monitoring",
      "Courier Management & Zone Assignments"
    ]
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">System Operator Profile</h2>
        <p className="text-xs text-slate-500 mt-1">Authorized superuser metadata, access token security details, and system environment stats.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Admin Metadata Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#0F172A] border border-slate-900 rounded-3xl p-6 text-slate-100 dark:text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-20%] w-40 h-40 rounded-full bg-orange-500/10 blur-2xl pointer-events-none"></div>
            
            <div className="flex flex-col items-center text-center space-y-4 pt-4">
              <div className="h-16 w-16 rounded-2xl bg-orange-500 flex items-center justify-center text-slate-100 dark:text-white text-2xl font-black shadow-lg shadow-orange-600/20">
                A
              </div>
              <div>
                <h3 className="font-extrabold text-base tracking-tight">{adminInfo.name}</h3>
                <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider mt-1 inline-block bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                  {adminInfo.role}
                </span>
              </div>
            </div>

            <div className="mt-8 space-y-4 text-xs border-t border-slate-800 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Security Email</span>
                <span className="font-mono text-[11px] text-slate-200">{adminInfo.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Environment</span>
                <span className="font-bold text-slate-200 flex items-center gap-1">
                  <Server size={11} className="text-indigo-400" />
                  {adminInfo.environment}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Operator Status</span>
                <span className="text-emerald-400 font-black flex items-center gap-1">
                  <ShieldCheck size={11} />
                  {adminInfo.status}
                </span>
              </div>
            </div>
          </div>

          {/* Quick System Info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <Activity size={14} className="text-orange-500" />
              <span>Session Log</span>
            </h4>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 font-mono text-[10px] text-slate-500 leading-relaxed">
                <div className="font-bold text-slate-700 uppercase mb-1">Operator Session Start</div>
                {adminInfo.lastLogin}
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                Credentials are validated against the server configuration environment. Changing static variables requires system redeployment.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Privileges & Security Policies */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                <Key size={16} className="text-orange-500" />
                <span>Authorized System Capabilities</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">As the Root Administrator, you have full write and modification privileges across the catalog and financial databases.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {adminInfo.permissions.map((perm, idx) => (
                <div key={idx} className="flex gap-3 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl hover:border-slate-200/80 transition">
                  <div className="h-6 w-6 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20 shrink-0 font-extrabold text-[10px]">
                    {idx + 1}
                  </div>
                  <span className="text-xs font-bold text-slate-700 leading-snug">{perm}</span>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal size={14} className="text-slate-500" />
                <span>Security Guidelines</span>
              </h4>
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 rounded-2xl p-4.5 text-xs text-slate-500 leading-relaxed space-y-2">
                <p>
                  1. Keep authentication tokens private. Never log session payloads to external outputs.
                </p>
                <p>
                  2. Double-check all Category Templates before saving. Altering active field names may cause schema mismatches for products listed in those categories.
                </p>
                <p>
                  3. Payout approvals and commission alterations are logged into the system auditing journal for transparency.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
