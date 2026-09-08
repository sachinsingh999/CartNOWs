import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  Key, 
  Search, 
  Lock, 
  Mail, 
  User, 
  Sparkles, 
  X, 
  Loader2, 
  Check, 
  Crown, 
  Power,
  Filter,
  Shield,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Calendar,
  Clock,
  UserCheck,
  XCircle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AVAILABLE_MODULES = [
  { id: "orders", label: "Orders Management", desc: "Process orders, update status, and manage item deliveries" },
  { id: "products", label: "Catalog & Moderation", desc: "Manage listings, approve products, and organize categories" },
  { id: "returns", label: "Returns & RMA", desc: "Audit return requests, inspections, and authorize refunds" },
  { id: "deliverymen", label: "Delivery Fleet", desc: "Manage drivers, assign delivery zones, and review complaints" },
  { id: "sellers", label: "Sellers & Vendors", desc: "Approve merchants, configure commissions, and process payouts" },
  { id: "customers", label: "Customer Accounts", desc: "Access user profiles, addresses, and account statuses" },
  { id: "support", label: "Support & Inquiries", desc: "Respond to customer help tickets and general inquiries" },
  { id: "promos", label: "Marketing & Promos", desc: "Configure promo coupons, sales campaigns, and banners" },
  { id: "finance", label: "Finance & Invoices", desc: "Review revenue analytics and regenerate VAT invoices" },
  { id: "subadmins", label: "Staff & Sub-Admins", desc: "Create and govern sub-administrator accounts", sensitive: true },
];

const SubAdmins = ({ token }) => {
  const { isSuperAdmin, hasPermission } = useAuth();

  const [subAdmins, setSubAdmins] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, suspended: 0, superAdminEmail: "" });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    permissions: ["orders", "products"],
  });
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});
  const [showModalPassword, setShowModalPassword] = useState(true);

  const toggleShowPassword = (id) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text, msg = "Copied to clipboard") => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    toast.success(msg);
  };

  const canManageSubAdmins = isSuperAdmin || hasPermission("subadmins");

  // Fetch sub-admins
  const fetchSubAdmins = async () => {
    if (!token || !canManageSubAdmins) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(
        `${backendUrl}/api/subadmins?search=${encodeURIComponent(searchQuery)}&status=${statusFilter}`,
        { headers: { token } }
      );
      if (res.data?.success) {
        setSubAdmins(res.data.subAdmins || []);
        if (res.data.stats) setStats(res.data.stats);
      } else {
        toast.error(res.data?.message || "Failed to load sub-admins");
      }
    } catch (err) {
      console.error("fetchSubAdmins error:", err);
      toast.error(err.response?.data?.message || "Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canManageSubAdmins) {
      fetchSubAdmins();
    }
  }, [statusFilter, canManageSubAdmins]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSubAdmins();
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      permissions: ["orders", "products"],
    });
    setModalOpen(true);
  };

  const openEditModal = (subAdmin) => {
    setEditingId(subAdmin._id);
    setFormData({
      name: subAdmin.name,
      email: subAdmin.email,
      password: subAdmin.plainPassword || "",
      permissions: subAdmin.permissions || [],
    });
    setModalOpen(true);
  };

  const generatePassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: pwd }));
    toast.info("Generated secure random password");
  };

  const togglePermission = (permId) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(permId);
      const next = exists
        ? prev.permissions.filter((p) => p !== permId)
        : [...prev.permissions, permId];
      return { ...prev, permissions: next };
    });
  };

  const selectAllPermissions = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: AVAILABLE_MODULES.map((m) => m.id),
    }));
  };

  const clearAllPermissions = () => {
    setFormData((prev) => ({ ...prev, permissions: [] }));
  };

  const handleEmailPrefixChange = (val) => {
    // Strip spaces and any domain user might type/paste
    const cleanPrefix = val.replace(/\s+/g, "").replace(/@.*$/, "").toLowerCase();
    setFormData((prev) => ({
      ...prev,
      email: cleanPrefix ? `${cleanPrefix}@cartnow.com` : "",
    }));
  };

  const handleSaveSubAdmin = async (e) => {
    e.preventDefault();
    const emailPrefix = formData.email ? formData.email.replace(/@cartnow\.com$/i, "").replace(/@.*$/, "").trim().toLowerCase() : "";
    
    if (!formData.name.trim() || !emailPrefix) {
      toast.warn("Please provide name and work email username");
      return;
    }
    if (!editingId && !formData.password) {
      toast.warn("Password is required for new sub-admins");
      return;
    }

    const payload = {
      ...formData,
      email: `${emailPrefix}@cartnow.com`,
    };

    try {
      setSaving(true);
      if (editingId) {
        // Update existing
        const res = await axios.put(
          `${backendUrl}/api/subadmins/${editingId}`,
          payload,
          { headers: { token } }
        );
        if (res.data?.success) {
          toast.success("Sub-Admin updated successfully");
          setModalOpen(false);
          fetchSubAdmins();
        } else {
          toast.error(res.data?.message || "Failed to update sub-admin");
        }
      } else {
        // Create new
        const res = await axios.post(
          `${backendUrl}/api/subadmins`,
          payload,
          { headers: { token } }
        );
        if (res.data?.success) {
          toast.success("Sub-Admin created successfully");
          setModalOpen(false);
          fetchSubAdmins();
        } else {
          toast.error(res.data?.message || "Failed to create sub-admin");
        }
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.response?.data?.message || "Failed to save sub-admin");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (subAdmin) => {
    try {
      const res = await axios.patch(
        `${backendUrl}/api/subadmins/${subAdmin._id}/status`,
        {},
        { headers: { token } }
      );
      if (res.data?.success) {
        toast.success(res.data.message || "Status updated");
        fetchSubAdmins();
      } else {
        toast.error(res.data?.message || "Failed to toggle status");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating status");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`${backendUrl}/api/subadmins/${id}`, {
        headers: { token },
      });
      if (res.data?.success) {
        toast.success("Sub-Admin account deleted");
        setDeleteConfirmId(null);
        fetchSubAdmins();
      } else {
        toast.error(res.data?.message || "Failed to delete sub-admin");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting account");
    }
  };

  if (!canManageSubAdmins) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl animate-fadeIn max-w-lg mx-auto mt-10 shadow-2xs">
        <div className="h-14 w-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/60">
          <ShieldAlert size={28} />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Staff Management Restricted</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Your staff account does not have permission to view or manage administrative team members. Please contact the Superadmin if you need elevated role permissions.
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

  return (
    <div className="space-y-4 animate-fadeIn text-slate-800 dark:text-slate-100">
      
      {/* ── Single Consolidated Container: Header, KPI Stats, & Filter Controls ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs space-y-3.5 shrink-0">
        
        {/* Top: Header Row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-blue-600 dark:bg-blue-600/20 text-white dark:text-blue-400 rounded-lg flex items-center justify-center border border-blue-600/10 shadow-xs shrink-0">
              <ShieldCheck size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                  Sub-Admins &amp; Staff
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                  RBAC
                </span>
              </div>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                Delegate store operations and assign modular permissions to staff members
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchSubAdmins}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg text-xs font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <RefreshCw size={12} className={loading ? "animate-spin text-blue-500" : ""} />
              <span>Refresh</span>
            </button>

            {isSuperAdmin && (
              <button
                onClick={openCreateModal}
                type="button"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg text-xs font-bold transition active:scale-95 shadow-xs cursor-pointer"
              >
                <UserPlus size={14} />
                <span>Create Sub-Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* Middle: Audience Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { key: "all", label: "Total Staff", val: stats.total, sub: "Registered Staff", icon: Users, color: "text-blue-500 bg-blue-500/10" },
            { key: "active", label: "Active Status", val: stats.active, sub: "Full system access", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10" },
            { key: "suspended", label: "Suspended", val: stats.suspended, sub: "Access locked", icon: AlertCircle, color: "text-amber-500 bg-amber-500/10" },
            { key: "superadmin", label: "Root Superadmin", val: stats.superAdminEmail || "Superadmin Active", sub: "Permanent * Access", icon: Crown, color: "text-indigo-500 bg-indigo-500/10", isEmail: true }
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.key}
                onClick={() => {
                  if (card.key !== "superadmin") setStatusFilter(card.key);
                }}
                className={`p-3.5 rounded-xl border bg-slate-50/70 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800 flex items-center justify-between group relative overflow-hidden transition-all duration-200 ${
                  card.key !== "superadmin" ? "cursor-pointer hover:border-slate-300 dark:hover:border-slate-700" : ""
                }`}
              >
                <div className="space-y-1 relative z-10 text-left min-w-0 pr-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block truncate">
                    {card.label}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`font-black tracking-tight block truncate ${card.isEmail ? "text-xs text-blue-600 dark:text-blue-400 font-semibold" : "text-xl text-slate-900 dark:text-white"}`} title={card.isEmail ? card.val : undefined}>
                      {card.val}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block truncate">
                    {card.sub}
                  </span>
                </div>
                <div className={`p-2.5 rounded-xl border ${card.color} border-slate-200/50 dark:border-slate-800 transition-transform duration-200 group-hover:scale-105 relative z-10 shrink-0`}>
                  <Icon size={16} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom: Filter Pills & Search Input */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/60">
          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1">
              <Filter size={12} />
              Filter:
            </span>
            {[
              { id: "all", label: "All Staff" },
              { id: "active", label: "Active Only" },
              { id: "suspended", label: "Suspended" }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </form>
        </div>

      </div>

      {/* Sub-Admins List */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 size={24} className="animate-spin text-blue-500" />
            <span className="text-xs">Loading sub-admin records...</span>
          </div>
        ) : subAdmins.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Users size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Sub-Admins Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? `No accounts matched "${searchQuery}". Try clearing your search query.`
                : "No sub-administrators have been created yet. Click 'Create Sub-Admin' to delegate operations."}
            </p>
            {isSuperAdmin && !searchQuery && (
              <button
                onClick={openCreateModal}
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 cursor-pointer transition"
              >
                <UserPlus size={14} />
                <span>Add First Sub-Admin</span>
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {/* Desktop Table Header */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-2.5 bg-slate-50/70 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <div className="col-span-3">Staff Identity</div>
            <div className="col-span-3">Security &amp; Credentials</div>
            <div className="col-span-4">Module Permissions</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {subAdmins.map((subAdmin) => {
            const isActive = subAdmin.status === "active";
            return (
              <div 
                key={subAdmin._id}
                className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                
                {/* Col 1: Staff Identity (col-span-3) */}
                <div className="lg:col-span-3 flex items-center gap-3 min-w-0">
                  <Link to={`/sub-admins/${subAdmin._id}`} className="relative shrink-0 group">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                      {subAdmin.name.charAt(0).toUpperCase()}
                    </div>
                    <span 
                      className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 ${
                        isActive ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                      title={isActive ? "Account Active" : "Account Suspended"}
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Link 
                        to={`/sub-admins/${subAdmin._id}`}
                        className="text-sm font-bold text-slate-900 dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400 transition"
                      >
                        {subAdmin.name}
                      </Link>
                      <span 
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                          isActive
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60"
                            : "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60"
                        }`}
                      >
                        {subAdmin.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate mt-0.5" title={subAdmin.email}>
                      {subAdmin.email}
                    </p>
                  </div>
                </div>

                {/* Col 2: Security & Credentials (col-span-3) */}
                <div className="lg:col-span-3 space-y-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 select-none max-w-full">
                    <Key size={11} className="text-slate-400 shrink-0" />
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">Pass:</span>
                    <span className="text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
                      {showPasswords[subAdmin._id]
                        ? (subAdmin.plainPassword || "(Encrypted)")
                        : (subAdmin.plainPassword ? "••••••••" : "(Encrypted)")}
                    </span>
                    {subAdmin.plainPassword ? (
                      <div className="flex items-center gap-1 ml-auto border-l border-slate-200 dark:border-slate-700 pl-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleShowPassword(subAdmin._id)}
                          className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                          title={showPasswords[subAdmin._id] ? "Hide password" : "Show password"}
                        >
                          {showPasswords[subAdmin._id] ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(subAdmin.plainPassword, "Password copied to clipboard")}
                          className="p-0.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                          title="Copy password"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openEditModal(subAdmin)}
                        className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer ml-auto shrink-0"
                        title="Click Edit to set visible password"
                      >
                        Set
                      </button>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                    <span>By {subAdmin.createdBy || "Superadmin"}</span>
                    {subAdmin.lastLogin ? (
                      <span> &bull; active {new Date(subAdmin.lastLogin).toLocaleDateString()}</span>
                    ) : (
                      <span> &bull; never logged in</span>
                    )}
                  </div>
                </div>

                {/* Col 3: Module Permissions (col-span-4) */}
                <div className="lg:col-span-4 min-w-0">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 lg:hidden">
                    <span>Permissions ({subAdmin.permissions?.length || 0})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {subAdmin.permissions && subAdmin.permissions.length > 0 ? (
                      subAdmin.permissions.map((p) => {
                        const modInfo = AVAILABLE_MODULES.find((m) => m.id === p);
                        return (
                          <span
                            key={p}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${
                              p === "subadmins"
                                ? "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/80 dark:border-purple-800/60"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                            }`}
                          >
                            {modInfo?.label || p}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-xs text-slate-400 italic">No permissions assigned</span>
                    )}
                  </div>
                </div>

                {/* Col 4: Quick Actions Toolbar (col-span-2) */}
                {isSuperAdmin && (
                  <div className="lg:col-span-2 flex items-center lg:justify-end gap-1.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                    
                    {/* View Details Profile Page Link */}
                    <Link
                      to={`/sub-admins/${subAdmin._id}`}
                      className="px-2.5 py-1.5 rounded-xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition cursor-pointer flex items-center gap-1 text-xs font-semibold shadow-2xs"
                      title="View Full Staff Profile & Privileges"
                    >
                      <Eye size={13} />
                      <span>View</span>
                    </Link>

                    {/* Edit Permissions Button */}
                    <button
                      onClick={() => openEditModal(subAdmin)}
                      type="button"
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-1 text-xs font-semibold shadow-2xs"
                      title="Edit Permissions & Password"
                    >
                      <Edit3 size={13} />
                      <span>Edit</span>
                    </button>

                    {/* Toggle Status Button */}
                    <button
                      onClick={() => handleToggleStatus(subAdmin)}
                      type="button"
                      className={`p-2 rounded-xl border text-xs font-semibold transition cursor-pointer shadow-2xs ${
                        isActive
                          ? "border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                          : "border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                      }`}
                      title={isActive ? "Suspend Account" : "Activate Account"}
                    >
                      <Power size={13} />
                    </button>

                    {/* Delete Button */}
                    {deleteConfirmId === subAdmin._id ? (
                      <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 p-1 rounded-xl">
                        <button
                          onClick={() => handleDelete(subAdmin._id)}
                          type="button"
                          className="px-2 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-500 cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          type="button"
                          className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(subAdmin._id)}
                        type="button"
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                        title="Delete Sub-Admin"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}

                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>

    {/* Create / Edit Modal Dialog - Width-Optimized max-w-6xl Landscape Layout */}
    {modalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/80 backdrop-blur-xs overflow-y-auto">
        <div className="relative w-full max-w-6xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
          
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                {editingId ? <Edit3 size={16} /> : <UserPlus size={16} />}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingId ? "Edit Sub-Admin" : "Create New Sub-Admin"}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingId ? "Update account credentials and module access" : "Configure identity and assigned operational permissions"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setModalOpen(false)}
              type="button"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Form Content - Wide Horizontal Layout */}
          <form onSubmit={handleSaveSubAdmin} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            
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
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Sarah Jenkins"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                {/* Work Email with fixed @cartnow.com suffix */}
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
                      value={formData.email ? formData.email.replace(/@cartnow\.com$/i, "").replace(/@.*$/, "") : ""}
                      onChange={(e) => handleEmailPrefixChange(e.target.value)}
                      placeholder="staff"
                      required
                      className="w-full py-2 px-1.5 bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                    />
                    <span className="px-3 py-2 bg-slate-100 dark:bg-slate-900/90 border-l border-slate-200 dark:border-slate-800 text-[11px] font-bold text-blue-600 dark:text-blue-400 select-none shrink-0 tracking-tight">
                      @cartnow.com
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    Company domain <span className="font-semibold text-slate-500 dark:text-slate-400">@cartnow.com</span> is automatically attached.
                  </p>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      {editingId ? "Reset Password" : "Password *"}
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
                      type={showModalPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={editingId ? "Leave empty to keep current" : "Min 8 characters"}
                      required={!editingId}
                      className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowModalPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title={showModalPassword ? "Hide password" : "Show password"}
                    >
                      {showModalPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Role / Security Notice */}
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

              {/* Right Column: Module Access Permissions (7 cols on lg) */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-blue-600 dark:text-blue-400" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Module Access Permissions ({formData.permissions.length}/{AVAILABLE_MODULES.length})
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

                {/* Permissions Grid: 2 columns of 5 cards */}
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {AVAILABLE_MODULES.map((mod) => {
                    const isChecked = formData.permissions.includes(mod.id);
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

            {/* Modal Action Buttons */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
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
                  <span>{editingId ? "Save Changes" : "Create Account"}</span>
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

export default SubAdmins;
