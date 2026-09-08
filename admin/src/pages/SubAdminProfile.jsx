import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Shield,
  ShieldCheck,
  ShieldAlert,
  User,
  Mail,
  Lock,
  Key,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Power,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Sparkles,
  Check,
  X,
  Loader2,
  RefreshCw,
  Award,
  Layers,
  CheckSquare
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AVAILABLE_MODULES = [
  { id: "orders", label: "Orders Management", desc: "Process orders, update delivery statuses, and manage fulfillment workflows" },
  { id: "products", label: "Catalog & Moderation", desc: "Manage product listings, approve merchant submissions, categories, and brands" },
  { id: "returns", label: "Returns & RMA", desc: "Review customer return requests, inspections, and authorize refund payouts" },
  { id: "deliverymen", label: "Delivery Fleet", desc: "Manage drivers, assign operational dispatch zones, and review customer ratings" },
  { id: "sellers", label: "Sellers & Vendors", desc: "Approve merchant accounts, adjust commission rates, and review payout schedules" },
  { id: "customers", label: "Customer Accounts", desc: "Inspect user profiles, shipping addresses, and control access suspensions" },
  { id: "support", label: "Support Tickets", desc: "Triage customer inquiries, reply to issues, and resolve dispute tickets" },
  { id: "promos", label: "Marketing & Promos", desc: "Generate coupon codes, manage flash sales, and configure hero banners" },
  { id: "finance", label: "Finance & Invoices", desc: "Inspect revenue metrics, platform fee splits, and regenerate tax invoices", sensitive: true },
  { id: "subadmins", label: "Staff & Sub-Admins", desc: "Provision sub-administrators and grant granular role-based permissions", sensitive: true },
];

const SubAdminProfile = ({ token: propToken }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token: ctxToken, isSuperAdmin, hasPermission } = useAuth();
  const token = propToken || ctxToken || localStorage.getItem("token");
  const canManageSubAdmins = isSuperAdmin || hasPermission?.("subadmins");

  const [subAdmin, setSubAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    password: "",
    permissions: [],
  });
  const [showEditPassword, setShowEditPassword] = useState(false);

  const fetchProfile = async () => {
    if (!token || !canManageSubAdmins) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await axios.get(`${backendUrl}/api/subadmins/${id}`, {
        headers: { token },
      });
      if (res.data?.success) {
        setSubAdmin(res.data.subAdmin);
      } else {
        const msg = res.data?.message || "Failed to load sub-admin profile";
        setErrorMsg(msg);
        toast.error(msg);
      }
    } catch (err) {
      console.error("fetchProfile error:", err);
      const msg = err.response?.data?.message || "Failed to load sub-admin details";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && canManageSubAdmins) {
      fetchProfile();
    }
  }, [id, token, canManageSubAdmins]);

  const copyToClipboard = (text, label = "Copied to clipboard") => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    toast.success(label);
  };

  const handleToggleStatus = async () => {
    if (!subAdmin) return;
    try {
      const res = await axios.patch(
        `${backendUrl}/api/subadmins/${subAdmin._id}/status`,
        {},
        { headers: { token } }
      );
      if (res.data?.success) {
        setSubAdmin((prev) => ({ ...prev, status: res.data.subAdmin.status }));
        toast.success(res.data.message);
      } else {
        toast.error(res.data?.message || "Action failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update account status");
    }
  };

  const handleDelete = async () => {
    if (!subAdmin) return;
    try {
      const res = await axios.delete(
        `${backendUrl}/api/subadmins/${subAdmin._id}`,
        { headers: { token } }
      );
      if (res.data?.success) {
        toast.success("Sub-admin account deleted successfully");
        navigate("/sub-admins");
      } else {
        toast.error(res.data?.message || "Delete failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete sub-admin");
    }
  };

  const openEditModal = () => {
    if (!subAdmin) return;
    setEditForm({
      name: subAdmin.name,
      email: subAdmin.email,
      password: "",
      permissions: subAdmin.permissions || [],
    });
    setShowEditPassword(false);
    setEditModalOpen(true);
  };

  const handleEmailPrefixChange = (val) => {
    const cleanPrefix = val.replace(/@cartnow\.com$/i, "").replace(/@.*$/, "").trim();
    setEditForm((prev) => ({
      ...prev,
      email: cleanPrefix ? `${cleanPrefix}@cartnow.com` : "",
    }));
  };

  const generatePassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setEditForm((prev) => ({ ...prev, password: pwd }));
    setShowEditPassword(true);
    toast.info("Generated new strong password");
  };

  const togglePermission = (permId) => {
    setEditForm((prev) => {
      const exists = prev.permissions.includes(permId);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((p) => p !== permId)
          : [...prev.permissions, permId],
      };
    });
  };

  const selectAllPermissions = () => {
    setEditForm((prev) => ({
      ...prev,
      permissions: AVAILABLE_MODULES.map((m) => m.id),
    }));
  };

  const clearAllPermissions = () => {
    setEditForm((prev) => ({ ...prev, permissions: [] }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      toast.warning("Staff name is required");
      return;
    }

    let finalEmail = editForm.email.trim();
    if (!finalEmail.toLowerCase().endsWith("@cartnow.com")) {
      finalEmail = `${finalEmail.replace(/@.*$/, "")}@cartnow.com`;
    }

    setSaving(true);
    try {
      const payload = {
        name: editForm.name.trim(),
        email: finalEmail.toLowerCase(),
        permissions: editForm.permissions,
      };
      if (editForm.password.trim()) {
        payload.password = editForm.password.trim();
      }

      const res = await axios.put(
        `${backendUrl}/api/subadmins/${subAdmin._id}`,
        payload,
        { headers: { token } }
      );
      if (res.data?.success) {
        toast.success("Profile details updated successfully");
        setSubAdmin(res.data.subAdmin);
        setEditModalOpen(false);
      } else {
        toast.error(res.data?.message || "Failed to update profile");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!canManageSubAdmins) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl animate-fadeIn max-w-lg mx-auto mt-10 shadow-2xs">
        <div className="h-14 w-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/60">
          <ShieldAlert size={28} />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Staff Profile Restricted</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Your staff account does not have permission to view or manage sub-administrator profile credentials.
          </p>
        </div>
        <Link
          to="/orders"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer inline-flex items-center gap-2"
        >
          Go to Orders Board
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-400 animate-fadeIn">
        <Loader2 size={32} className="animate-spin text-blue-500" />
        <span className="text-sm font-medium">Loading staff profile & permissions...</span>
      </div>
    );
  }

  if (errorMsg && !subAdmin) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-fadeIn">
        <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center">
          <AlertCircle size={24} />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Unable to Load Staff Profile</h3>
          <p className="text-xs text-slate-500 max-w-md">{errorMsg}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/sub-admins"
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-200 transition"
          >
            ← Back to Sub-Admins
          </Link>
          <button
            onClick={fetchProfile}
            type="button"
            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-500 transition cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!subAdmin) {
    return null;
  }

  const isActive = subAdmin.status === "active";
  const grantedCount = subAdmin.permissions?.length || 0;
  const totalCount = AVAILABLE_MODULES.length;
  const permissionPct = Math.round((grantedCount / totalCount) * 100);

  return (
    <div className="space-y-5 animate-fadeIn text-slate-800 dark:text-slate-100 pb-12 w-full">
      
      {/* ── Single Consolidated Executive Header Card ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4 relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />

        {/* Top Row: Navigation Breadcrumbs, Title & Action Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <Link
              to="/sub-admins"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
              title="Back to Sub-Admins"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
                <Link to="/sub-admins" className="hover:text-blue-600 transition">Staff &amp; Sub-Admins</Link>
                <span>/</span>
                <span className="text-slate-700 dark:text-slate-300 font-bold">{subAdmin.name}</span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-0.5">
                <span>Staff Profile &amp; Privileges</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                  RBAC Inspector
                </span>
              </h1>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={fetchProfile}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              <RefreshCw size={13} className={loading ? "animate-spin text-blue-500" : ""} />
              <span>Refresh</span>
            </button>

            {isSuperAdmin && (
              <>
                <button
                  onClick={openEditModal}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-xs font-bold transition active:scale-95 shadow-2xs cursor-pointer"
                >
                  <Edit3 size={13} />
                  <span>Edit Account</span>
                </button>

                <button
                  onClick={handleToggleStatus}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 shadow-2xs cursor-pointer border ${
                    isActive
                      ? "border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100"
                      : "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100"
                  }`}
                >
                  <Power size={13} />
                  <span>{isActive ? "Suspend Account" : "Activate Account"}</span>
                </button>

                {deleteConfirm ? (
                  <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 p-1 rounded-xl">
                    <button
                      onClick={handleDelete}
                      type="button"
                      className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-500 cursor-pointer"
                    >
                      Confirm Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      type="button"
                      className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    type="button"
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer shadow-2xs"
                    title="Delete Staff Member"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bottom Row: Staff Hero Profile & Quick Metrics */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10 pt-1">
          {/* Staff Info */}
          <div className="flex items-start sm:items-center gap-4 min-w-0">
            <div className="relative shrink-0">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl sm:text-2xl flex items-center justify-center shadow-md">
                {subAdmin.name.charAt(0).toUpperCase()}
              </div>
              <span
                className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 ${
                  isActive ? "bg-emerald-500" : "bg-amber-500"
                }`}
                title={isActive ? "Account Active" : "Account Suspended"}
              />
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                  {subAdmin.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Sub-Admin
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                    isActive
                      ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                      : "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800"
                  }`}
                >
                  {isActive ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  <span>{subAdmin.status}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5 font-mono">
                  <Mail size={13} className="text-slate-400" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{subAdmin.email}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(subAdmin.email, "Email copied")}
                    className="p-1 hover:text-blue-600 text-slate-400 transition cursor-pointer"
                    title="Copy Email"
                  >
                    <Copy size={11} />
                  </button>
                </div>

                <span>&bull;</span>

                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-slate-400" />
                  <span>Joined {new Date(subAdmin.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</span>
                </div>

                <span>&bull;</span>

                <div className="flex items-center gap-1.5">
                  <Clock size={13} className="text-slate-400" />
                  <span>
                    {subAdmin.lastLogin
                      ? `Last active ${new Date(subAdmin.lastLogin).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`
                      : "Never logged in"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 shrink-0">
            <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-center min-w-[100px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Access Scope</span>
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {grantedCount} / {totalCount}
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block">{permissionPct}% Granted</span>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-center min-w-[100px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Status</span>
              <span className={`text-xs sm:text-sm font-black uppercase mt-1 block ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                {subAdmin.status}
              </span>
              <span className="text-[10px] text-slate-400 block">{isActive ? "Full Session" : "Locked Out"}</span>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-center col-span-2 sm:col-span-1 min-w-[100px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Delegator</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block mt-1">
                {subAdmin.createdBy || "Superadmin"}
              </span>
              <span className="text-[10px] text-slate-400 block">Admin Delegator</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Profile Grid (12-Column Responsive Layout) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: Security & Credentials Card (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Security Credentials Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Key size={15} className="text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Security &amp; Credentials
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                Auditable
              </span>
            </div>

            {/* Work Email Card */}
            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Official Work Email</span>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate">{subAdmin.email}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(subAdmin.email, "Email copied")}
                  className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
                  title="Copy Email"
                >
                  <Copy size={13} />
                </button>
              </div>
            </div>

            {/* Password Inspector */}
            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Password</span>
                {subAdmin.plainPassword ? (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                    Visible to Admin
                  </span>
                ) : (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-500">
                    Hashed
                  </span>
                )}
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate">
                  {showPassword
                    ? (subAdmin.plainPassword || "(Encrypted)")
                    : (subAdmin.plainPassword ? "••••••••••••" : "(Encrypted)")}
                </span>
                {subAdmin.plainPassword ? (
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(subAdmin.plainPassword, "Password copied")}
                      className="p-1 rounded-md text-slate-400 hover:text-blue-600 transition cursor-pointer"
                      title="Copy password"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={openEditModal}
                    className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                  >
                    Set Password
                  </button>
                )}
              </div>

              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                Superadmin can reveal or reset staff passwords anytime to support team onboarding.
              </p>
            </div>

            {/* System Object ID */}
            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">System Object ID</span>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 truncate">{subAdmin._id}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(subAdmin._id, "System ID copied")}
                  className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
                  title="Copy ID"
                >
                  <Copy size={13} />
                </button>
              </div>
            </div>

            {/* Account Lifecycle Timeline */}
            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Account Lifecycle</span>
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400"><Calendar size={12} /> Provisioned:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(subAdmin.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400"><Clock size={12} /> Last Authentication:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {subAdmin.lastLogin ? new Date(subAdmin.lastLogin).toLocaleString() : "Never logged in"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400"><User size={12} /> Root Delegator:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {subAdmin.createdBy || "Superadmin"}
                  </span>
                </div>
              </div>
            </div>

            {/* Session Guard Notice */}
            <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 text-xs leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Shield size={13} className="text-blue-600 dark:text-blue-400" />
                <span>Zero-Trust Session Guard</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Permissions are sealed into JWT signatures upon login. If privileges change, the sub-admin's session updates on their next refresh.
              </p>
            </div>

          </div>

        </div>

        {/* Right Column: Module Access Rights & Permissions (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Module Access Matrix ({grantedCount}/{totalCount} Assigned)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Comprehensive overview of permitted administrative operations and restricted domains
                  </p>
                </div>
              </div>

              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={openEditModal}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 transition cursor-pointer shrink-0"
                >
                  <Edit3 size={12} />
                  <span>Adjust Permissions</span>
                </button>
              )}
            </div>

            {/* Permission Cards Grid (Spacious 2-column layout using full width) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_MODULES.map((mod) => {
                const isGranted = subAdmin.permissions?.includes(mod.id);
                return (
                  <div
                    key={mod.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                      isGranted
                        ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 shadow-2xs"
                        : "bg-slate-50/50 dark:bg-slate-950/40 border-slate-200/70 dark:border-slate-800/60 opacity-60"
                    }`}
                  >
                    <div
                      className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 font-bold ${
                        isGranted
                          ? "bg-emerald-600 text-white shadow-2xs"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                      }`}
                    >
                      {isGranted ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={2.5} />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <span className={`text-xs font-bold ${isGranted ? "text-slate-900 dark:text-white" : "text-slate-500 line-through"}`}>
                          {mod.label}
                        </span>
                        <div className="flex items-center gap-1">
                          {mod.sensitive && isGranted && (
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
                              High Privilege
                            </span>
                          )}
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                              isGranted
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                            }`}
                          >
                            {isGranted ? "Authorized" : "Restricted"}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                        {mod.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Scope Summary Banner */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <CheckSquare size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Operational Scope Status
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {grantedCount === totalCount
                      ? "Staff member has unrestricted access across all platform operations."
                      : `Staff member is constrained strictly to the ${grantedCount} authorized operational modules above.`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/sub-admins"
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  All Staff
                </Link>
                {isSuperAdmin && (
                  <button
                    type="button"
                    onClick={openEditModal}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition cursor-pointer"
                  >
                    Edit Access
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ── Edit Account Modal Dialog (Width-Optimized max-w-6xl Landscape) ── */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-6xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-950/40">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Edit3 size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Edit Staff Profile: {subAdmin.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Update account identity, reset access password, and modify assigned module privileges
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                type="button"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column: Account Credentials (5 cols on lg) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                    <User size={14} className="text-blue-600 dark:text-blue-400" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Account Credentials
                    </h4>
                  </div>

                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        required
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                      />
                    </div>
                  </div>

                  {/* Work Email */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Work Email *
                    </label>
                    <div className="flex items-center rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition overflow-hidden">
                      <div className="pl-3 pr-1 text-slate-400 shrink-0">
                        <Mail size={14} />
                      </div>
                      <input
                        type="text"
                        value={editForm.email ? editForm.email.replace(/@cartnow\.com$/i, "").replace(/@.*$/, "") : ""}
                        onChange={(e) => handleEmailPrefixChange(e.target.value)}
                        required
                        className="w-full py-2 px-1.5 bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                      />
                      <span className="px-3 py-2 bg-slate-100 dark:bg-slate-900/90 border-l border-slate-200 dark:border-slate-800 text-[11px] font-bold text-blue-600 dark:text-blue-400 select-none shrink-0 tracking-tight">
                        @cartnow.com
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      Company domain <span className="font-semibold">@cartnow.com</span> is automatically appended.
                    </p>
                  </div>

                  {/* Password Reset */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Reset Password
                      </label>
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        <Sparkles size={11} />
                        <span>Generate</span>
                      </button>
                    </div>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showEditPassword ? "text" : "password"}
                        value={editForm.password}
                        onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                        placeholder="Leave blank to keep current password"
                        className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showEditPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Role Notice */}
                  <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Shield size={13} className="text-blue-600 dark:text-blue-400" />
                      <span>Role-Based Access</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                      Sub-admins log in with these credentials and are granted access strictly to selected modules.
                    </p>
                  </div>
                </div>

                {/* Right Column: Permissions Checklist (7 cols on lg) */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={14} className="text-blue-600 dark:text-blue-400" />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Module Access Permissions ({editForm.permissions.length}/{AVAILABLE_MODULES.length})
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={selectAllPermissions}
                        className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                      <button
                        type="button"
                        onClick={clearAllPermissions}
                        className="text-slate-500 hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {AVAILABLE_MODULES.map((mod) => {
                      const isChecked = editForm.permissions.includes(mod.id);
                      return (
                        <div
                          key={mod.id}
                          onClick={() => togglePermission(mod.id)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-2.5 ${
                            isChecked
                              ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 shadow-2xs"
                              : "bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                          }`}
                        >
                          <div 
                            className={`h-4 w-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                              isChecked
                                ? "bg-blue-600 border-blue-600 text-white"
                                : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                            }`}
                          >
                            {isChecked && <Check size={11} strokeWidth={3} />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                {mod.label}
                              </span>
                              {mod.sensitive && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
                                  High Privilege
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 line-clamp-1">
                              {mod.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Profile Changes</span>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default SubAdminProfile;
