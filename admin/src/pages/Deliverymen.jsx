import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../config";
import { Users, UserPlus, Mail, Phone, Lock, Eye, EyeOff, Shield, Check, X, Ban, Activity } from "lucide-react";

const inputClass = "w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/30 dark:bg-slate-900/50 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition duration-200 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-950 dark:focus:border-indigo-500 focus:ring-4 focus:ring-slate-950/5 dark:focus:ring-indigo-500/10";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400";

const Deliverymen = ({ token }) => {
  const [drivers, setDrivers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [remarksInput, setRemarksInput] = useState({});
  const [showPassword, setShowPassword] = useState(false);
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
    fetchDrivers();
    fetchComplaints();
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

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
      case "suspended":
      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
      default:
        return "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
    }
  };

  return (
    <div className="flex flex-col md:h-[calc(100vh-120px)] h-auto space-y-6 animate-fadeIn text-slate-900 dark:text-slate-100 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="h-10 w-10 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/20 shadow-sm">
          <Users size={20} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-0.5">
            Staff Directory
          </p>
          <h1 className="text-xl font-extrabold tracking-tight">Delivery Agents</h1>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-5 gap-6 pb-6">
        {/* Left Column: Form and Complaints stacked vertically */}
        <div className="lg:col-span-2 flex flex-col gap-6 min-h-0">
          {/* Add Delivery Agent */}
          <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4 shrink-0">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800/60 pb-3">
              <UserPlus size={18} className="text-slate-800 dark:text-slate-200" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Add Delivery Agent</h3>
            </div>

            <form onSubmit={onSubmitHandler} className="space-y-4">
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
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-slate-100 dark:text-white py-3 text-xs font-bold transition shadow-sm active:scale-98 cursor-pointer pt-3"
              >
                <UserPlus size={14} />
                Register Agent
              </button>
            </form>
          </div>

          {/* Courier Complaints Desk */}
          <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex flex-col min-h-0 flex-1">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800/60 pb-3 shrink-0">
              <Ban size={18} className="text-slate-800 dark:text-slate-200" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                Agent Complaints Desk
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                  {complaints.filter(c => c.status !== "Resolved").length} Pending
                </span>
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 mt-4">
              {complaints.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500 font-semibold">
                  No agent complaints filed yet.
                </div>
              ) : (
                complaints.map((c) => (
                  <div key={c._id} className="border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 space-y-3 bg-slate-50/10 dark:bg-slate-900/5 hover:bg-slate-50/30 dark:hover:bg-slate-900/20 transition duration-150">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">{c.deliverymanName}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${ c.status === "Resolved" ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" : c.status === "In Progress" ? "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" : "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20" }`}>
                        {c.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                        <span>{c.category}</span>
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{c.subject}</p>
                      <p className="italic bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60 p-2.5 rounded-lg text-slate-600 dark:text-slate-300">"{c.description}"</p>
                    </div>

                    {c.status !== "Resolved" ? (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60 space-y-2">
                        <input
                          type="text"
                          placeholder="Add resolution remarks..."
                          value={remarksInput[c._id] || ""}
                          onChange={(e) => setRemarksInput(prev => ({ ...prev, [c._id]: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none transition focus:bg-white dark:focus:bg-slate-900 dark: focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => resolveComplaintHandler(c._id, "Resolved")}
                            className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-slate-100 dark:text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                          >
                            Resolve & Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      c.adminRemarks && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60 space-y-1">
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider">Resolution Remarks</span>
                          <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/60 font-semibold">{c.adminRemarks}</p>
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
        <div className="lg:col-span-3 bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex flex-col min-h-0">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 pb-3 shrink-0">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-slate-800 dark:text-slate-200" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Active Roster</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800 uppercase tracking-wider">
              {drivers.length} Drivers
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 mt-4">
            {drivers.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center gap-2 text-center text-slate-500 dark:text-slate-400">
                <Users size={32} className="text-slate-300 dark:text-slate-700" />
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-300">No delivery agents registered</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Drivers registered or self-signed up will appear here.</p>
                </div>
              </div>
            ) : (
              drivers.map((driver) => (
                <div 
                  key={driver._id} 
                  className="border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50/20 dark:bg-slate-900/10 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition duration-150"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <p className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">{driver.name}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getStatusBadgeStyle(driver.status)}`}>
                        {driver.status}
                      </span>
                      {driver.status === "active" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 uppercase tracking-wider">
                          <Activity size={10} /> {driver.activeDeliveries || 0} active
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 truncate">
                        <Mail size={12} className="text-slate-400 dark:text-slate-500" />
                        {driver.email}
                      </span>
                      <span className="flex items-center gap-1 shrink-0">
                        <Phone size={12} className="text-slate-400 dark:text-slate-500" />
                        {driver.phone}
                      </span>
                    </div>
                  </div>

                  {/* Admin Action Buttons */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center border-t sm:border-t-0 border-slate-200/60 dark:border-slate-800 pt-2.5 sm:pt-0 shrink-0">
                    {driver.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatusHandler(driver._id, "active")}
                          className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 dark:hover:bg-emerald-600 dark:hover:text-white text-[10px] font-bold transition duration-150 cursor-pointer"
                        >
                          <Check size={11} /> Approve
                        </button>
                        <button
                          onClick={() => updateStatusHandler(driver._id, "rejected")}
                          className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 dark:hover:bg-rose-600 dark:hover:text-white text-[10px] font-bold transition duration-150 cursor-pointer"
                        >
                          <X size={11} /> Reject
                        </button>
                      </>
                    )}

                    {driver.status === "active" && (
                      <button
                        onClick={() => updateStatusHandler(driver._id, "suspended")}
                        className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white border border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 dark:hover:bg-amber-600 dark:hover:text-white text-[10px] font-bold transition duration-150 cursor-pointer"
                      >
                        <Ban size={11} /> Suspend
                      </button>
                    )}

                    {(driver.status === "suspended" || driver.status === "rejected") && (
                      <button
                        onClick={() => updateStatusHandler(driver._id, "active")}
                        className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 text-slate-100 dark:text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-[10px] font-bold transition duration-150 cursor-pointer"
                      >
                        <Activity size={11} /> Activate
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deliverymen;
