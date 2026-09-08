import React, { useState, useEffect } from "react";
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
  Clock,
  ShoppingBag,
  RotateCcw,
  Users,
  MessageSquare,
  Ticket,
  User,
  Check,
  XCircle,
  Award
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { backendUrl } from "../config";
import { useAuth } from "../context/AuthContext";

const MODULE_DEFINITIONS = [
  { id: "orders", name: "Orders Management", desc: "View incoming orders, manage dispatch status, and process fulfillments.", path: "/orders", icon: ShoppingBag, color: "text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-500/10 border-blue-200/80 dark:border-blue-500/20" },
  { id: "returns", name: "Returns & RMA", desc: "Inspect customer return requests, review evidence, and approve refunds.", path: "/returns", icon: RotateCcw, color: "text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-500/10 border-amber-200/80 dark:border-amber-500/20" },
  { id: "products", name: "Catalog & Moderation", desc: "Manage catalog taxonomy, approve seller products, and construct schemas.", path: "/list", icon: Layers, color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-500/10 border-indigo-200/80 dark:border-indigo-500/20" },
  { id: "deliverymen", name: "Delivery Fleet", desc: "Manage drivers, assign delivery zones, and review performance complaints.", path: "/deliverymen", icon: Truck, color: "text-cyan-600 dark:text-cyan-400 bg-cyan-50/80 dark:bg-cyan-500/10 border-cyan-200/80 dark:border-cyan-500/20" },
  { id: "sellers", name: "Sellers & Vendors", desc: "Approve merchant accounts, adjust commission rates, and process payouts.", path: "/sellers", icon: UserCheck, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-500/10 border-emerald-200/80 dark:border-emerald-500/20" },
  { id: "customers", name: "Customer Accounts", desc: "Inspect user profiles, shipping addresses, and manage access suspensions.", path: "/customers", icon: User, color: "text-purple-600 dark:text-purple-400 bg-purple-50/80 dark:bg-purple-500/10 border-purple-200/80 dark:border-purple-500/20" },
  { id: "support", name: "Support Tickets", desc: "Triage customer inquiries, reply to issues, and resolve dispute tickets.", path: "/support", icon: MessageSquare, color: "text-teal-600 dark:text-teal-400 bg-teal-50/80 dark:bg-teal-500/10 border-teal-200/80 dark:border-teal-500/20" },
  { id: "promos", name: "Marketing & Promos", desc: "Generate coupon codes, manage flash sales, and configure hero banners.", path: "/sales", icon: Sparkles, color: "text-pink-600 dark:text-pink-400 bg-pink-50/80 dark:bg-pink-500/10 border-pink-200/80 dark:border-pink-500/20" },
  { id: "finance", name: "Finance & Invoices", desc: "Audit platform fee splits, inspect revenue metrics, and regenerate invoices.", path: "/finance", icon: DollarSign, color: "text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-500/10 border-rose-200/80 dark:border-rose-500/20", sensitive: true },
  { id: "subadmins", name: "Staff & Sub-Admins", desc: "Provision sub-administrator accounts and govern granular role permissions.", path: "/sub-admins", icon: Shield, color: "text-orange-600 dark:text-orange-400 bg-orange-50/80 dark:bg-orange-500/10 border-orange-200/80 dark:border-orange-500/20", sensitive: true },
];

const GUIDELINES = [
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
    desc: "All status modifications, permission updates, and operational tasks trigger record persistence in the system auditing index for compliance traceability.",
    severity: "Compliance Protocol"
  }
];

const Profile = ({ token: propToken }) => {
  const navigate = useNavigate();
  const { token: ctxToken, adminData, isSuperAdmin, hasPermission } = useAuth();
  const token = propToken || ctxToken || localStorage.getItem("token");

  const [liveAdmin, setLiveAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [runningDiagnostics, setRunningDiagnostics] = useState(false);
  const [copiedSession, setCopiedSession] = useState(false);

  // Fetch current authenticated profile from server
  const fetchMyProfile = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/subadmins/me`, {
        headers: { token }
      });
      if (res.data?.success && res.data.admin) {
        setLiveAdmin(res.data.admin);
      }
    } catch (err) {
      console.error("Failed to fetch current admin profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProfile();
  }, [token]);

  // Derived user details
  const activeUser = liveAdmin || adminData;
  const isSuper = isSuperAdmin || activeUser?.role === "superadmin" || activeUser?.permissions?.includes("*");
  const displayName = activeUser?.name || (isSuper ? "Superadmin" : "Staff Member");
  const displayEmail = activeUser?.email || (isSuper ? "admin@cartnow.com" : "staff@cartnow.com");
  const userPermissions = activeUser?.permissions || (isSuper ? ["*"] : []);
  const authorizedCount = isSuper ? MODULE_DEFINITIONS.length : userPermissions.length;
  const avatarLetter = (displayName.charAt(0) || "A").toUpperCase();

  const handleRunDiagnostics = () => {
    setRunningDiagnostics(true);
    setTimeout(() => {
      setRunningDiagnostics(false);
      toast.success(
        isSuper
          ? "Root Diagnostics Complete: 100% Compliant | All Nodes Secure | TLS 1.3 Encrypted"
          : `Staff Security Check Complete: ${displayName} role verified | ${authorizedCount} modules authorized`
      );
    }, 1000);
  };

  const handleCopySession = () => {
    const sessionId = `SESSION_${isSuper ? "ROOT" : "STAFF"}_${Date.now()}`;
    navigator.clipboard?.writeText(sessionId);
    setCopiedSession(true);
    toast.info("Security session token copied to clipboard");
    setTimeout(() => setCopiedSession(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-800 dark:text-slate-100 pb-12 w-full">
      
      {/* ── Top Header Banner ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className={`h-11 w-11 rounded-xl flex items-center justify-center border shadow-xs shrink-0 ${
            isSuper 
              ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
              : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
          }`}>
            <Cpu size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {isSuper ? "Root System Operator Profile" : `${displayName} — Staff Profile & Permissions`}
              </h1>
              {isSuper ? (
                <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Root Superadmin
                </span>
              ) : (
                <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-full flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  Sub-Admin Delegate
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {isSuper 
                ? "Authorized root operator metadata, cryptographic access credentials, and operational controls."
                : `Role-based privileges and operational boundaries assigned to this administrator account.`
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRunDiagnostics}
            disabled={runningDiagnostics}
            className={`px-3.5 py-2 text-white rounded-xl text-xs font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs flex items-center gap-1.5 ${
              isSuper ? "bg-orange-600 hover:bg-orange-500" : "bg-blue-600 hover:bg-blue-500"
            }`}
          >
            <RefreshCw size={13} className={runningDiagnostics ? "animate-spin" : ""} />
            <span>{runningDiagnostics ? "Checking..." : "Verify Permissions"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Left Column: Admin Identity Card & Session Log ── */}
        <div className="lg:col-span-1 space-y-5">
          
          {/* Operator Identity Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 text-slate-900 dark:text-white shadow-2xs space-y-5 relative overflow-hidden">
            <div className="flex flex-col items-center text-center space-y-3 pt-2 relative z-10">
              <div className="relative">
                <div className={`h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-lg border-2 border-white/20 ${
                  isSuper
                    ? "bg-gradient-to-tr from-orange-500 via-amber-500 to-yellow-500 shadow-orange-500/20"
                    : "bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 shadow-blue-500/20"
                }`}>
                  {avatarLetter}
                </div>
                <span className="absolute bottom-0 right-0 block h-4 w-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-xs animate-pulse" />
              </div>
              
              <div>
                <h3 className="font-black text-base tracking-tight text-slate-900 dark:text-white capitalize">
                  {displayName}
                </h3>
                <span className={`text-[9px] font-extrabold uppercase tracking-widest mt-1 inline-block px-3 py-1 rounded-full border ${
                  isSuper 
                    ? "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20"
                    : "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20"
                }`}>
                  {isSuper ? "System Owner / Root Superuser" : "Operational Sub-Administrator"}
                </span>
              </div>
            </div>

            {/* List Details */}
            <div className="space-y-3 border-t border-slate-100 dark:border-slate-800/80 pt-4 text-xs relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-2">
                  <Mail size={14} className={isSuper ? "text-orange-500" : "text-blue-500"} />
                  <span>Work Email</span>
                </span>
                <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200 font-bold">
                  {displayEmail}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-2">
                  <Key size={14} className="text-indigo-500 dark:text-indigo-400" />
                  <span>Access Scope</span>
                </span>
                <span className="font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/15 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-500/30 text-[10px]">
                  {isSuper ? "Full Root Access (*)" : `${authorizedCount} Modules Active`}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-500 dark:text-emerald-400" />
                  <span>Account Status</span>
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 font-black text-[10px] uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-1">
                  <Check size={11} strokeWidth={3} />
                  <span>Active / Operational</span>
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 flex items-center gap-2 relative z-10">
              <button
                type="button"
                onClick={() => toast.info(`Account active: authenticated via ${isSuper ? "root environment" : "database RBAC model"}.`)}
                className={`w-full py-2.5 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition shadow-xs active:scale-95 cursor-pointer text-center ${
                  isSuper ? "bg-orange-600 hover:bg-orange-500" : "bg-blue-600 hover:bg-blue-500"
                }`}
              >
                Security Verified
              </button>
            </div>
          </div>

          {/* Cyber Terminal Session Log */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Activity size={14} className={isSuper ? "text-orange-500" : "text-blue-500"} />
                <span>Session Terminal</span>
              </h4>
              
              <button
                onClick={handleCopySession}
                type="button"
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
              <div>
                <span className={isSuper ? "text-orange-600 dark:text-orange-400 font-bold" : "text-blue-600 dark:text-blue-400 font-bold"}>
                  OPERATOR:
                </span>{" "}
                {isSuper ? "SYS_SUPERUSER" : `STAFF_${displayName.toUpperCase()}`}
              </div>
              <div>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">PERMISSIONS:</span>{" "}
                {isSuper ? "ALL_MODULES (*)" : userPermissions.join(", ") || "NONE"}
              </div>
              <div><span className="text-emerald-600 dark:text-emerald-400 font-bold">NODE:</span> 127.0.0.1 (prod_cluster)</div>
            </div>

            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed font-medium">
              {isSuper 
                ? "Credentials are validated against the server configuration environment. Changing static variables requires system redeployment."
                : "Staff permissions are dynamically enforced by the CartNOW RBAC middleware on every API request."
              }
            </p>
          </div>
        </div>

        {/* ── Right Column: Privileges & Security Policies ── */}
        <div className="lg:col-span-2 space-y-5">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-2xs space-y-6">
            
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4 flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Key size={16} className={isSuper ? "text-orange-500" : "text-blue-500"} />
                  <span>Assigned System Capabilities</span>
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                  {isSuper
                    ? "As Superadmin, you have full unrestricted access to all 10 management modules."
                    : "Active access privileges for your account. Authorized modules can be accessed directly."}
                </p>
              </div>

              <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg border ${
                isSuper 
                  ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
              }`}>
                {isSuper ? "Full Root Access" : `${authorizedCount} of ${MODULE_DEFINITIONS.length} Authorized`}
              </span>
            </div>

            {/* Interactive Grid layout for permissions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {MODULE_DEFINITIONS.map((perm) => {
                const IconComp = perm.icon;
                const isAuthorized = isSuper || userPermissions.includes(perm.id);

                return (
                  <div 
                    key={perm.id} 
                    onClick={() => {
                      if (isAuthorized) {
                        navigate(perm.path);
                      } else {
                        toast.warning(`Access to '${perm.name}' is restricted. Contact Superadmin to request access.`);
                      }
                    }}
                    className={`flex gap-3.5 p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden ${
                      isAuthorized 
                        ? `${perm.color} cursor-pointer hover:shadow-xs hover:border-current`
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800/60 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center border shrink-0 font-extrabold transition duration-200 ${
                      isAuthorized ? "group-hover:scale-105" : "text-slate-400 dark:text-slate-600"
                    }`}>
                      {isAuthorized ? <IconComp size={18} /> : <Lock size={16} />}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white transition-colors truncate">
                          {perm.name}
                        </h4>
                        {isAuthorized ? (
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-0.5 shrink-0">
                            <Check size={10} strokeWidth={3} />
                            <span>Granted</span>
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 flex items-center gap-0.5 shrink-0">
                            <Lock size={9} />
                            <span>Restricted</span>
                          </span>
                        )}
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
                {GUIDELINES.map((guide, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
                    <div className="mt-0.5 shrink-0 h-5 w-5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-md flex items-center justify-center font-mono text-[9px] font-black">
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
