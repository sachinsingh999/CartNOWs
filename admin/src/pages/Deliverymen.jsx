import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../config";
import { Users, UserPlus, Mail, Phone, Lock, Eye, EyeOff, Shield, Check, X, Ban, Activity } from "lucide-react";

const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:bg-white focus:border-slate-950 focus:ring-4 focus:ring-slate-950/5";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500";

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
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "suspended":
      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-100";
      default:
        return "bg-blue-50 text-blue-700 border-blue-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-450">
          Staff Directory
        </p>
        <div className="flex items-center gap-2.5 mt-1">
          <Users size={22} className="text-slate-900" />
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Delivery Agents</h2>
        </div>
        <p className="text-xs text-slate-500 font-medium">
          Create, approve, and manage driver accounts for order fulfillment
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Column: Register Form */}
        <div className="lg:col-span-2">
          <form onSubmit={onSubmitHandler} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <UserPlus size={18} className="text-slate-800" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Add Delivery Agent</h3>
            </div>

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
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-900 cursor-pointer"
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
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white py-3 text-xs font-bold transition shadow-sm active:scale-98 cursor-pointer pt-3"
            >
              <UserPlus size={14} />
              Register Agent
            </button>
          </form>
        </div>

        {/* Right Column: Drivers List */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4 min-h-[400px]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-slate-800" />
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Active Roster</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100 uppercase tracking-wider">
                {drivers.length} Drivers
              </span>
            </div>

            {drivers.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center gap-2 text-center text-slate-550">
                <Users size={32} className="text-slate-300" />
                <div>
                  <p className="font-bold text-slate-700">No delivery agents registered</p>
                  <p className="text-xs text-slate-400 mt-0.5">Drivers registered or self-signed up will appear here.</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-3">
                {drivers.map((driver) => (
                  <div 
                    key={driver._id} 
                    className="border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50/20 hover:bg-slate-50/50 transition duration-150"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <p className="font-extrabold text-sm text-slate-900 tracking-tight">{driver.name}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getStatusBadgeStyle(driver.status)}`}>
                          {driver.status}
                        </span>
                        {driver.status === "active" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border bg-indigo-50 text-indigo-700 border-indigo-100 uppercase tracking-wider">
                            <Activity size={10} /> {driver.activeDeliveries || 0} active
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-0.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1 truncate">
                          <Mail size={12} className="text-slate-450" />
                          {driver.email}
                        </span>
                        <span className="flex items-center gap-1 shrink-0">
                          <Phone size={12} className="text-slate-450" />
                          {driver.phone}
                        </span>
                      </div>
                    </div>

                    {/* Admin Action Buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center border-t sm:border-t-0 pt-2.5 sm:pt-0 shrink-0">
                      {driver.status === "pending" && (
                        <>
                          <button
                            onClick={() => updateStatusHandler(driver._id, "active")}
                            className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-100 text-[10px] font-bold transition duration-150 cursor-pointer"
                          >
                            <Check size={11} /> Approve
                          </button>
                          <button
                            onClick={() => updateStatusHandler(driver._id, "rejected")}
                            className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-100 text-[10px] font-bold transition duration-150 cursor-pointer"
                          >
                            <X size={11} /> Reject
                          </button>
                        </>
                      )}

                      {driver.status === "active" && (
                        <button
                          onClick={() => updateStatusHandler(driver._id, "suspended")}
                          className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white border border-amber-100 text-[10px] font-bold transition duration-150 cursor-pointer"
                        >
                          <Ban size={11} /> Suspend
                        </button>
                      )}

                      {(driver.status === "suspended" || driver.status === "rejected") && (
                        <button
                          onClick={() => updateStatusHandler(driver._id, "active")}
                          className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-bold transition duration-150 cursor-pointer"
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

      {/* Courier Complaints Desk */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Ban size={18} className="text-slate-800" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            Agent Complaints Desk
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
              {complaints.filter(c => c.status !== "Resolved").length} Pending
            </span>
          </h3>
        </div>

        {complaints.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No agent complaints filed yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {complaints.map((c) => (
              <div key={c._id} className="border border-slate-200/80 rounded-xl p-4 space-y-3 bg-slate-50/10 hover:bg-slate-50/30 transition duration-150">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900">{c.deliverymanName}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${
                    c.status === "Resolved"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : c.status === "In Progress"
                      ? "bg-amber-50 text-amber-700 border-amber-100"
                      : "bg-blue-50 text-blue-700 border-blue-100"
                  }`}>
                    {c.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-655 text-slate-600">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>{c.category}</span>
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="font-bold text-slate-800">{c.subject}</p>
                  <p className="italic bg-white border border-slate-100 p-2.5 rounded-lg text-slate-600">"{c.description}"</p>
                </div>

                {c.status !== "Resolved" ? (
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <input
                      type="text"
                      placeholder="Add resolution remarks..."
                      value={remarksInput[c._id] || ""}
                      onChange={(e) => setRemarksInput(prev => ({ ...prev, [c._id]: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-3 py-2 text-xs text-slate-950 outline-none transition focus:bg-white focus:border-slate-950"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => resolveComplaintHandler(c._id, "Resolved")}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                      >
                        Resolve & Save
                      </button>
                    </div>
                  </div>
                ) : (
                  c.adminRemarks && (
                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Resolution Remarks</span>
                      <p className="text-xs text-slate-705 bg-slate-50 p-2.5 rounded-lg border border-slate-150 font-semibold">{c.adminRemarks}</p>
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Deliverymen;
