import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../config";
import { 
  Users, UserPlus, Mail, Phone, Lock, Eye, EyeOff, Shield, Check, X, Ban, Activity, RefreshCw, Search, CheckCircle2, Clock, AlertTriangle
} from "lucide-react";

const inputClass = "w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-800 dark:text-white outline-none transition font-semibold placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500";
const labelClass = "mb-1 block text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400";

const Deliverymen = ({ token }) => {
  const [drivers, setDrivers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [remarksInput, setRemarksInput] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const fetchDrivers = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${backendUrl}/api/deliveryman/list`, {
        headers: { token },
      });
      if (response.data.success) {
        setDrivers(response.data.drivers);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load deliverymen list");
    }
  };

  const fetchComplaints = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${backendUrl}/api/deliveryman/complaints-list`, {
        headers: { token },
      });
      if (response.data.success) {
        setComplaints(response.data.complaints);
      }
    } catch (error) {
      console.log("Error fetching complaints:", error);
    }
  };

  const fetchAllData = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchDrivers(), fetchComplaints()]);
    setIsRefreshing(false);
  };

  const updateStatusHandler = async (id, status) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/deliveryman/status`,
        { id, status },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        fetchDrivers();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const resolveComplaintHandler = async (complaintId, status) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/deliveryman/complaint-reply`,
        { 
          complaintId, 
          status, 
          adminRemarks: remarksInput[complaintId] || "Resolved by administrator." 
        },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        fetchComplaints();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [token]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${backendUrl}/api/deliveryman/register`,
        form,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setForm({ name: "", email: "", password: "", phone: "" });
        fetchDrivers();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Filter drivers reactively
  const filteredDrivers = useMemo(() => {
    return drivers.filter(d => {
      // Status filter
      if (statusFilter !== "all" && d.status !== statusFilter) return false;

      // Search Query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const inName = d.name?.toLowerCase().includes(q);
        const inEmail = d.email?.toLowerCase().includes(q);
        const inPhone = d.phone?.toLowerCase().includes(q);
        return inName || inEmail || inPhone;
      }

      return true;
    });
  }, [drivers, statusFilter, searchQuery]);

  // Derived statistics
  const totalCount = drivers.length;
  const activeCount = drivers.filter(d => d.status === "active").length;
  const pendingCount = drivers.filter(d => d.status === "pending").length;
  const pendingComplaintsCount = complaints.filter(c => c.status !== "Resolved").length;

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "suspended":
      case "rejected":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      default:
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn text-slate-800 dark:text-slate-100">
      
      {/* ── Single Consolidated Container: Header, Stats & Search Bar ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs space-y-3.5 shrink-0">
        
        {/* Top: Header Row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-indigo-600 dark:bg-indigo-500/10 text-white dark:text-indigo-400 rounded-lg flex items-center justify-center border border-indigo-500/10 shadow-xs shrink-0">
              <Users size={16} />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Delivery Logistics & Agent Roster</h1>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Manage delivery personnel, register field agents, and resolve courier support tickets</p>
            </div>
          </div>

          <button
            onClick={fetchAllData}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg text-xs font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RefreshCw size={12} className={isRefreshing ? "animate-spin text-indigo-500" : ""} />
            <span>Refresh Roster</span>
          </button>
        </div>

        {/* Middle: Logistics Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { key: "all", label: "Total Drivers", val: totalCount, sub: "Registered personnel", icon: Users, color: "text-blue-500 bg-blue-500/10" },
            { key: "active", label: "Active Roster", val: activeCount, sub: "Available for dispatch", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10" },
            { key: "pending", label: "Pending Verification", val: pendingCount, sub: "Requires approval", icon: Clock, color: "text-amber-500 bg-amber-500/10" },
            { key: "complaints", label: "Pending Complaints", val: pendingComplaintsCount, sub: "Support tickets", icon: AlertTriangle, color: "text-rose-500 bg-rose-500/10" }
          ].map(card => {
            const isSelected = statusFilter === card.key;
            const Icon = card.icon;
            return (
              <div
                key={card.key}
                onClick={() => { if (card.key !== "complaints") setStatusFilter(card.key); }}
                className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between group relative overflow-hidden ${ isSelected ? "bg-slate-950 border-slate-950 text-slate-100 dark:text-white dark:bg-indigo-600 dark:border-indigo-500 shadow-xs" : "bg-slate-50/70 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700/80" }`}
              >
                <div className="space-y-1 relative z-10 text-left">
                  <span className={`text-[8px] font-black uppercase tracking-widest ${ isSelected ? "text-slate-300 dark:text-indigo-100" : "text-slate-400 dark:text-slate-500" }`}>
                    {card.label}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black tracking-tight">{card.val}</span>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-wider block ${ isSelected ? "text-slate-300 dark:text-indigo-200" : "text-slate-400 dark:text-slate-500" }`}>
                    {card.sub}
                  </span>
                </div>
                <div className={`p-2 rounded-lg border ${card.color} border-slate-200/50 dark:border-slate-800 transition-transform duration-200 group-hover:scale-105 relative z-10`}>
                  <Icon size={14} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom: Filter Pills & Search Input */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-0.5">
          {/* Status Pills */}
          <div className="flex flex-wrap items-center gap-1">
            {[
              { id: "all", label: "All Drivers" },
              { id: "active", label: "Active" },
              { id: "pending", label: "Pending" },
              { id: "suspended", label: "Suspended" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  statusFilter === tab.id 
                    ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-xs" 
                    : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input Box */}
          <div className="relative flex items-center w-full sm:w-80 shrink-0">
            <Search size={13} className="absolute left-3 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search driver name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-[11px] bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

      </div>

      {/* Main Logistics Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        
        {/* Left Column: Form and Complaints stacked vertically */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          {/* Add Delivery Agent */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-3.5 shrink-0">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <UserPlus size={15} className="text-indigo-500" />
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Register Delivery Agent</h3>
            </div>

            <form onSubmit={onSubmitHandler} className="space-y-3">
              <div>
                <label className={labelClass}>Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g. John Doe"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="e.g. john@cartnow.com"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    placeholder="Minimum 6 characters"
                    className={inputClass}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className={labelClass}>Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="e.g. +91 9988776655"
                  className={inputClass}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-xs font-black uppercase tracking-wider transition shadow-xs active:scale-95 cursor-pointer"
              >
                <UserPlus size={13} />
                Register Agent
              </button>
            </form>
          </div>

          {/* Courier Complaints Desk */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col space-y-3 min-h-[300px]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Ban size={14} className="text-rose-500" />
                <span>Agent Complaints Desk</span>
              </h3>
              <span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-950 px-2.5 py-1 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 uppercase tracking-widest select-none">
                {pendingComplaintsCount} Pending
              </span>
            </div>

            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
              {complaints.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500 font-semibold border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40">
                  No agent complaints filed yet.
                </div>
              ) : (
                complaints.map((c) => (
                  <div key={c._id} className="border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 space-y-2 bg-slate-50/50 dark:bg-slate-950/40">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{c.deliverymanName}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${ c.status === "Resolved" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : c.status === "In Progress" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" }`}>
                        {c.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono">
                        <span>{c.category}</span>
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="font-bold text-slate-900 dark:text-white text-xs">{c.subject}</p>
                      <p className="italic bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-lg text-slate-600 dark:text-slate-300 text-[11px]">"{c.description}"</p>
                    </div>

                    {c.status !== "Resolved" ? (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                        <input
                          type="text"
                          placeholder="Add resolution remarks..."
                          value={remarksInput[c._id] || ""}
                          onChange={(e) => setRemarksInput(prev => ({ ...prev, [c._id]: e.target.value }))}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-800 dark:text-white outline-none transition focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          onClick={() => resolveComplaintHandler(c._id, "Resolved")}
                          className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition shadow-xs cursor-pointer active:scale-95"
                        >
                          Resolve & Save
                        </button>
                      </div>
                    ) : (
                      c.adminRemarks && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                          <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Resolution Remarks</span>
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 font-semibold">{c.adminRemarks}</p>
                        </div>
                      )
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Drivers List */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col space-y-3 min-h-[450px]">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Shield size={14} className="text-indigo-500" />
              <span>Active Agent Roster</span>
            </h2>
            <span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-950 px-2.5 py-1 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 uppercase tracking-widest select-none">
              {filteredDrivers.length} Agents Listed
            </span>
          </div>

          {filteredDrivers.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40">
              <Users size={28} className="text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-500">No matching delivery agents found.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredDrivers.map((driver) => (
                <div 
                  key={driver._id} 
                  className="p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 transition-all duration-200"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-black text-xs text-slate-900 dark:text-white">{driver.name}</p>
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${getStatusBadgeStyle(driver.status)}`}>
                        {driver.status}
                      </span>
                      {driver.status === "active" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black border bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 uppercase tracking-wider">
                          <Activity size={10} /> {driver.activeDeliveries || 0} active
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium flex-wrap">
                      <span className="flex items-center gap-1">
                        <Mail size={12} className="text-slate-400" />
                        {driver.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone size={12} className="text-slate-400" />
                        {driver.phone}
                      </span>
                    </div>
                  </div>

                  {/* Admin Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    {driver.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatusHandler(driver._id, "active")}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-wider transition shadow-xs cursor-pointer active:scale-95 flex items-center gap-1"
                        >
                          <Check size={11} /> Approve
                        </button>
                        <button
                          onClick={() => updateStatusHandler(driver._id, "rejected")}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-black uppercase tracking-wider transition shadow-xs cursor-pointer active:scale-95 flex items-center gap-1"
                        >
                          <X size={11} /> Reject
                        </button>
                      </>
                    )}

                    {driver.status === "active" && (
                      <button
                        onClick={() => updateStatusHandler(driver._id, "suspended")}
                        className="px-2.5 py-1 rounded-lg border border-amber-200 text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40 hover:bg-amber-100 text-[9px] font-black uppercase tracking-wider transition shadow-xs cursor-pointer active:scale-95 flex items-center gap-1"
                      >
                        <Ban size={11} /> Suspend
                      </button>
                    )}

                    {(driver.status === "suspended" || driver.status === "rejected") && (
                      <button
                        onClick={() => updateStatusHandler(driver._id, "active")}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-black uppercase tracking-wider transition shadow-xs cursor-pointer active:scale-95 flex items-center gap-1"
                      >
                        <Activity size={11} /> Activate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Deliverymen;
