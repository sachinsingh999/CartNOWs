import React from "react";
import { 
  ShieldCheck, 
  Mail, 
  Key, 
  Terminal, 
  Activity, 
  Server,
  Layers,
  UserCheck,
  Eye,
  DollarSign,
  Shield,
  Truck,
  AlertTriangle,
  Cpu
} from "lucide-react";

const Profile = () => {
  const adminInfo = {
    name: "Control Panel Administrator",
    email: "admin@cartnow.com",
    role: "System Owner / Root Superuser",
    status: "Active / Highly Secure",
    environment: "Production Cluster",
    lastLogin: new Date().toLocaleString(),
  };

  const capabilities = [
    {
      name: "Catalog Taxonomy & Category Templating",
      desc: "Define product schemas, update structures, and attribute fields.",
      icon: Layers,
      color: "text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 hover:border-indigo-500/40"
    },
    {
      name: "Seller Onboarding & Commission Audit",
      desc: "Verify vendor accounts, set commission thresholds, and approve partners.",
      icon: UserCheck,
      color: "text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 hover:border-amber-500/40"
    },
    {
      name: "Supervised Moderation & Publishing",
      desc: "Enforce safety policies, audit incoming products, and flag violations.",
      icon: Eye,
      color: "text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 hover:border-emerald-500/40"
    },
    {
      name: "Platform Settlements & Approvals",
      desc: "Authorize wallet payouts, settle ledger balances, and check accounts.",
      icon: DollarSign,
      color: "text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 hover:border-rose-500/40"
    },
    {
      name: "System Log Audits & Compliance",
      desc: "Trace administrative events, monitor status logs, and supervise nodes.",
      icon: Shield,
      color: "text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 hover:border-blue-500/40"
    },
    {
      name: "Courier & Delivery Zone Operations",
      desc: "Register shipping agents, define logistic coordinates, and audit speeds.",
      icon: Truck,
      color: "text-cyan-500 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 border-cyan-100 dark:border-cyan-500/20 hover:border-cyan-500/40"
    }
  ];

  const guidelines = [
    {
      title: "Credential Privacy & Payload Integrity",
      desc: "Maintain extreme privacy of access tokens. Never print session tokens, keys, or authorization context payloads inside client logs or browser diagnostic outputs."
    },
    {
      title: "Active Schema Alteration Risks",
      desc: "Double-check template changes before saving category updates. Altering keys or type constraints can disrupt active catalog indexing and cause database validation mismatches."
    },
    {
      title: "Immutable Security Audit Ledger",
      desc: "All payout releases, commission tier adjustments, and courier zone assignments trigger record persistence in the system auditing index for logging transparency."
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800 dark:text-slate-100">
      
      {/* Header Panel */}
      <div className="border-b border-slate-200 dark:border-slate-800/80 pb-5">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Cpu className="text-orange-500 animate-pulse" size={24} />
          <span>System Operator Profile</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
          Authorized root operator metadata, cryptographic access control credentials, and diagnostic log statistics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Admin Metadata Panel */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Operator Identity Card */}
          <div className="bg-slate-900 dark:bg-slate-900/90 border border-slate-850 dark:border-slate-800/80 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-20%] w-40 h-40 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
            
            <div className="flex flex-col items-center text-center space-y-4 pt-4 z-10 relative">
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-orange-550/20 border-2 border-white/10">
                  A
                </div>
                <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse" />
              </div>
              
              <div>
                <h3 className="font-black text-base tracking-tight text-white">{adminInfo.name}</h3>
                <span className="text-[10px] text-orange-400 font-extrabold uppercase tracking-wider mt-1.5 inline-block bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                  {adminInfo.role}
                </span>
              </div>
            </div>

            {/* List Details with Icons */}
            <div className="mt-8 space-y-4.5 border-t border-slate-800 pt-6">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold flex items-center gap-2">
                  <Mail size={14} className="text-orange-500" />
                  <span>Security Email</span>
                </span>
                <span className="font-mono text-[11px] text-slate-200">{adminInfo.email}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold flex items-center gap-2">
                  <Server size={14} className="text-indigo-400" />
                  <span>Environment</span>
                </span>
                <span className="font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/15">
                  {adminInfo.environment}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>Operator Status</span>
                </span>
                <span className="text-emerald-400 font-black flex items-center gap-1">
                  {adminInfo.status}
                </span>
              </div>
            </div>
          </div>

          {/* Cyber Terminal Session Log */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Activity size={14} className="text-orange-500" />
              <span>Session Log</span>
            </h4>
            
            <div className="space-y-3">
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl font-mono text-[10px] text-slate-350 space-y-2 shadow-inner">
                <div className="flex items-center gap-2 text-emerald-500 font-bold mb-1.5 border-b border-slate-900 pb-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>[SESSION SECURE]</span>
                </div>
                <div><span className="text-slate-500">SYSTEM:</span> LOCAL_DAEMON // GRANTED</div>
                <div><span className="text-orange-400">OPERATOR:</span> SYS_SUPERUSER</div>
                <div className="truncate"><span className="text-orange-400">LOGIN:</span> {adminInfo.lastLogin}</div>
                <div><span className="text-orange-400">NODE:</span> 127.0.0.1 (prod_app)</div>
              </div>
              
              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
                Credentials are validated against the server configuration environment. Changing static variables requires system redeployment.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Privileges & Security Policies */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
            
            {/* Header info */}
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                <Key size={16} className="text-orange-500" />
                <span>Authorized System Capabilities</span>
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
                As the Root Administrator, you have full write and modification privileges across the catalog and financial databases.
              </p>
            </div>

            {/* Grid layout for permissions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {capabilities.map((perm, idx) => {
                const IconComp = perm.icon;
                return (
                  <div 
                    key={idx} 
                    className="flex gap-4.5 p-4.5 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/50 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700/80 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/[0.02] transition-all duration-300 group cursor-default"
                  >
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center border shrink-0 font-extrabold transition-all duration-300 group-hover:scale-105 ${perm.color}`}>
                      <IconComp size={18} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors leading-snug">
                        {perm.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal font-medium">
                        {perm.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Security Guidelines */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Terminal size={14} className="text-slate-400 dark:text-slate-500" />
                <span>Security Guidelines</span>
              </h4>
              
              <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850/80 rounded-2xl p-5 text-xs text-slate-500 dark:text-slate-400 space-y-4">
                {guidelines.map((guide, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <div className="mt-0.5 shrink-0 h-5 w-5 bg-orange-500/10 dark:bg-orange-500/10 border border-orange-500/20 text-orange-500 dark:text-orange-400 rounded-lg flex items-center justify-center font-mono text-[9px] font-black">
                      {idx + 1}
                    </div>
                    <div className="space-y-0.5">
                      <h5 className="font-bold text-[11px] text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <AlertTriangle size={11} className="text-amber-500" />
                        <span>{guide.title}</span>
                      </h5>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
                        {guide.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
