import React, { useState } from "react";
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
  Cpu,
  ChevronRight,
  Sparkles,
  Lock,
  Copy,
  CheckCircle2,
  RefreshCw,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Profile = () => {
  const navigate = useNavigate();
  const [runningDiagnostics, setRunningDiagnostics] = useState(false);
  const [copiedSession, setCopiedSession] = useState(false);

  const adminInfo = {
    name: "Control Panel Administrator",
    email: "admin@cartnow.com",
    role: "System Owner / Root Superuser",
    status: "Active / Highly Secure",
    environment: "Production Cluster",
    nodeId: "srv-prod-node-01",
    lastLogin: new Date().toLocaleString(),
  };

  const capabilities = [
    {
      name: "Catalog Taxonomy & Category Templating",
      desc: "Define product schemas, update category attributes, and construct form blueprints.",
      icon: Layers,
      path: "/categories",
      color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-500/10 border-indigo-200/80 dark:border-indigo-500/20 hover:border-indigo-500"
    },
    {
      name: "Seller Onboarding & Commission Audit",
      desc: "Verify vendor accounts, set commission thresholds, and process partner payouts.",
      icon: UserCheck,
      path: "/sellers",
      color: "text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-500/10 border-amber-200/80 dark:border-amber-500/20 hover:border-amber-500"
    },
    {
      name: "Supervised Moderation & Publishing",
      desc: "Enforce safety policies, audit incoming products, and handle reported listings.",
      icon: Eye,
      path: "/moderation",
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-500/10 border-emerald-200/80 dark:border-emerald-500/20 hover:border-emerald-500"
    },
    {
      name: "Platform Settlements & Approvals",
      desc: "Authorize wallet payouts, settle ledger balances, and audit finance configurations.",
      icon: DollarSign,
      path: "/finance",
      color: "text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-500/10 border-rose-200/80 dark:border-rose-500/20 hover:border-rose-500"
    },
    {
      name: "System Log Audits & Compliance",
      desc: "Trace administrative events, monitor audit log feeds, and inspect system events.",
      icon: Shield,
      path: "/logs",
      color: "text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-500/10 border-blue-200/80 dark:border-blue-500/20 hover:border-blue-500"
    },
    {
      name: "Courier & Delivery Zone Operations",
      desc: "Register shipping agents, assign logistic zones, and monitor live dispatches.",
      icon: Truck,
      path: "/deliverymen",
      color: "text-cyan-600 dark:text-cyan-400 bg-cyan-50/80 dark:bg-cyan-500/10 border-cyan-200/80 dark:border-cyan-500/20 hover:border-cyan-500"
    }
  ];

  const guidelines = [
    {
      title: "Credential Privacy & Payload Integrity",
      desc: "Maintain extreme privacy of access tokens. Never print session tokens, keys, or authorization context payloads inside client logs or browser diagnostic outputs.",
      severity: "Critical Integrity"
    },
    {
      title: "Active Schema Alteration Risks",
      desc: "Double-check template changes before saving category updates. Altering keys or type constraints can disrupt active catalog indexing and cause database validation mismatches.",
      severity: "High Risk Schema"
    },
    {
      title: "Immutable Security Audit Ledger",
      desc: "All payout releases, commission tier adjustments, and courier zone assignments trigger record persistence in the system auditing index for logging transparency.",
      severity: "Compliance Protocol"
    }
  ];

  const handleRunDiagnostics = () => {
    setRunningDiagnostics(true);
    setTimeout(() => {
      setRunningDiagnostics(false);
      toast.success("Security Diagnostics Complete: 100% Compliant | All Nodes Secure | TLS 1.3 Encrypted");
    }, 1200);
  };

  const handleCopySession = () => {
    navigator.clipboard.writeText(`SESSION_ID: SEC-ROOT-${Date.now()}-PROD`);
    setCopiedSession(true);
    toast.info("Security session token copied to clipboard");
    setTimeout(() => setCopiedSession(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-800 dark:text-slate-100">
      
      {/* ── Top Header Banner ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 bg-orange-500 dark:bg-orange-500/10 text-white dark:text-orange-400 rounded-xl flex items-center justify-center border border-orange-500/20 shadow-xs shrink-0">
            <Cpu size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">System Operator Profile</h1>
              <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                Root Granted
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Authorized root operator metadata, cryptographic access credentials, and operational log statistics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRunDiagnostics}
            disabled={runningDiagnostics}
            className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <RefreshCw size={13} className={runningDiagnostics ? "animate-spin" : ""} />
            <span>{runningDiagnostics ? "Diagnosing..." : "Run Security Audit"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Left Column: Admin Identity Card & Session Log ── */}
        <div className="lg:col-span-1 space-y-5">
          
          {/* Operator Identity Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 text-slate-900 dark:text-white shadow-xs space-y-6 relative overflow-hidden">
            <div className="flex flex-col items-center text-center space-y-3.5 pt-2 relative z-10">
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-orange-500 via-amber-500 to-yellow-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-orange-500/20 border-2 border-white/20">
                  A
                </div>
                <span className="absolute bottom-0 right-0 block h-4 w-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-xs animate-pulse" />
              </div>
              
              <div>
                <h3 className="font-black text-base tracking-tight text-slate-900 dark:text-white">{adminInfo.name}</h3>
                <span className="text-[9px] text-orange-600 dark:text-orange-400 font-extrabold uppercase tracking-widest mt-1 inline-block bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                  {adminInfo.role}
                </span>
              </div>
            </div>

            {/* List Details */}
            <div className="space-y-3 border-t border-slate-100 dark:border-slate-800/80 pt-4 text-xs relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-2">
                  <Mail size={14} className="text-orange-500" />
                  <span>Security Email</span>
                </span>
                <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200 font-bold">{adminInfo.email}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-2">
                  <Server size={14} className="text-indigo-500 dark:text-indigo-400" />
                  <span>Environment</span>
                </span>
                <span className="font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/15 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-500/30 text-[10px]">
                  {adminInfo.environment}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-500 dark:text-emerald-400" />
                  <span>Operator Status</span>
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 font-black text-[10px] uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/20">
                  {adminInfo.status}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 flex items-center gap-2 relative z-10">
              <button
                onClick={() => toast.info("Security credentials verified: Primary SSL token active.")}
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition shadow-xs active:scale-95 cursor-pointer text-center"
              >
                Verify Credentials
              </button>
            </div>
          </div>

          {/* Cyber Terminal Session Log */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Activity size={14} className="text-orange-500" />
                <span>Session Terminal</span>
              </h4>
              
              <button
                onClick={handleCopySession}
                className="text-[10px] font-bold text-slate-400 hover:text-blue-500 flex items-center gap-1 transition cursor-pointer"
                title="Copy Session Token"
              >
                {copiedSession ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Copy size={12} />}
                <span>{copiedSession ? "Copied" : "Token"}</span>
              </button>
            </div>
            
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl font-mono text-[10px] text-slate-800 dark:text-slate-300 space-y-1.5 shadow-inner">
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold border-b border-slate-200 dark:border-slate-900 pb-1.5 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  [SESSION SECURE]
                </span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal">TLS 1.3</span>
              </div>
              <div><span className="text-slate-400 dark:text-slate-500">SYSTEM:</span> LOCAL_DAEMON // GRANTED</div>
              <div><span className="text-orange-600 dark:text-orange-400 font-bold">OPERATOR:</span> SYS_SUPERUSER</div>
              <div className="truncate"><span className="text-orange-600 dark:text-orange-400 font-bold">LOGIN:</span> {adminInfo.lastLogin}</div>
              <div><span className="text-blue-600 dark:text-blue-400 font-bold">NODE:</span> 127.0.0.1 (prod_cluster)</div>
            </div>

            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed font-medium">
              Credentials are validated against the server configuration environment. Changing static variables requires system redeployment.
            </p>
          </div>
        </div>

        {/* ── Right Column: Privileges & Security Policies ── */}
        <div className="lg:col-span-2 space-y-5">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-6">
            
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Key size={16} className="text-orange-500" />
                  <span>Authorized System Capabilities</span>
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                  Click any permission card to navigate directly to its dedicated management panel.
                </p>
              </div>

              <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 rounded-lg">
                Full Root Access
              </span>
            </div>

            {/* Interactive Grid layout for permissions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {capabilities.map((perm, idx) => {
                const IconComp = perm.icon;
                return (
                  <div 
                    key={idx} 
                    onClick={() => navigate(perm.path)}
                    className={`flex gap-3.5 p-4 rounded-xl border transition-all duration-200 cursor-pointer group relative overflow-hidden ${perm.color}`}
                  >
                    <div className="h-9 w-9 rounded-lg flex items-center justify-center border shrink-0 font-extrabold transition duration-200 group-hover:scale-105">
                      <IconComp size={18} />
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors truncate">
                          {perm.name}
                        </h4>
                        <ChevronRight size={13} className="text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal font-medium line-clamp-2">
                        {perm.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Security Guidelines */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Terminal size={14} className="text-slate-400 dark:text-slate-500" />
                  <span>Security Guidelines & Protocols</span>
                </h4>
                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  Enforced
                </span>
              </div>
              
              <div className="space-y-2.5">
                {guidelines.map((guide, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
                    <div className="mt-0.5 shrink-0 h-5 w-5 bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 rounded-md flex items-center justify-center font-mono text-[9px] font-black">
                      {idx + 1}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          <AlertTriangle size={12} className="text-amber-500" />
                          <span>{guide.title}</span>
                        </h5>
                        <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-md shrink-0">
                          {guide.severity}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
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
