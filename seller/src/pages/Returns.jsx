import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../config";
import { 
  RotateCcw, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  CornerDownLeft, 
  MessageSquare,
  FileText,
  Calendar,
  KeyRound,
  ShieldAlert
} from "lucide-react";

const Returns = ({ token }) => {
  const [requests, setRequests] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [notes, setNotes] = useState({});
  const [types, setTypes] = useState({});
  const [exchangeSizes, setExchangeSizes] = useState({});
  const [assignedDrivers, setAssignedDrivers] = useState({});

  // Date filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [datePreset, setDatePreset] = useState("all");

  const fetchReturns = useCallback(async () => {
    if (!token) return;

    try {
      const response = await axios.get(
        `${backendUrl}/api/seller/returns`,
        { headers: { token } }
      );

      if (response.data.success) {
        setRequests(response.data.returns);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  }, [token]);

  const fetchDrivers = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${backendUrl}/api/seller/deliverymen`, { headers: { token } });
      if (res.data.success) {
        setDrivers(res.data.drivers);
      }
    } catch (e) {
      console.log(e);
    }
  }, [token]);

  useEffect(() => {
    fetchReturns();
    fetchDrivers();
  }, [fetchReturns, fetchDrivers]);

  const handleProcessRefund = async (requestId) => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/rms/refund/process`,
        { rmaId: requestId },
        { headers: { token, seller_token: token } }
      );
      if (res.data.success) {
        toast.success(`Refund processed & completed successfully! ₹${res.data.refund?.amount || ''} credited to user.`);
        fetchReturns();
      } else {
        toast.error(res.data.message || "Failed to process refund");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error processing refund");
    }
  };

  const handleStatusUpdate = async (requestId, status) => {
    try {
      const request = requests.find((r) => r._id === requestId);
      const originalDriverId = request?.orderId?.deliverymanId || request?.deliverymanId || "";
      const deliverymanId = assignedDrivers[requestId] || originalDriverId || "";

      const payload = {
        requestId,
        status,
        sellerNotes: notes[requestId] ?? request?.adminNote ?? "",
        deliverymanId,
      };

      const response = await axios.post(
        `${backendUrl}/api/rms/request/review`,
        payload,
        { headers: { token, seller_token: token } }
      );

      if (response.data.success) {
        toast.success(`Return request ${status.toLowerCase()} successfully.`);
        fetchReturns();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handlePresetChange = (preset) => {
    setDatePreset(preset);
    const now = new Date();
    if (preset === "all") {
      setStartDate("");
      setEndDate("");
    } else if (preset === "today") {
      const todayStr = now.toISOString().split("T")[0];
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === "week") {
      const lastWeek = new Date();
      lastWeek.setDate(now.getDate() - 7);
      setStartDate(lastWeek.toISOString().split("T")[0]);
      setEndDate(now.toISOString().split("T")[0]);
    } else if (preset === "month") {
      const lastMonth = new Date();
      lastMonth.setMonth(now.getMonth() - 1);
      setStartDate(lastMonth.toISOString().split("T")[0]);
      setEndDate(now.toISOString().split("T")[0]);
    }
  };

  const filteredRequests = requests
    .filter((req) => {
      if (!req.createdAt) return true;
      const reqDate = new Date(req.createdAt);
      
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (reqDate < start) return false;
      }
      
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (reqDate > end) return false;
      }
      
      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const totalReturns = filteredRequests.length;
  const pendingRequests = filteredRequests.filter((r) => r.status === "Requested").length;
  const completedRequests = filteredRequests.filter((r) => r.status === "Completed").length;

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400";
      case "Out for Pickup":
        return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400";
      case "Picked Up":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400";
      case "Rejected":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400";
      default:
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400";
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn text-slate-800 dark:text-slate-100">
      
      {/* ── Single Consolidated Container: Header, Date Filters & Stats ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs space-y-3.5 shrink-0">
        
        {/* Header Row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-orange-500/10 text-orange-500 rounded-lg flex items-center justify-center shadow-xs shrink-0">
              <RotateCcw size={16} />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Product Return & RMA Management</h1>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Process return authorizations, approve exchange sizes, and assign pickup logistics agents</p>
            </div>
          </div>

          <button
            onClick={fetchReturns}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs"
          >
            <RotateCcw size={12} className="text-orange-500" />
            <span>Refresh RMA Desk</span>
          </button>
        </div>

        {/* Date Filter Bar & Presets */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl">
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
              <Calendar size={12} /> Period:
            </span>
            {[
              { id: "all", label: "All Time" },
              { id: "today", label: "Today" },
              { id: "week", label: "Last 7 Days" },
              { id: "month", label: "This Month" },
              { id: "custom", label: "Custom Range" }
            ].map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  if (preset.id === "custom") {
                    setDatePreset("custom");
                  } else {
                    handlePresetChange(preset.id);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition cursor-pointer ${
                  datePreset === preset.id
                    ? "bg-slate-900 dark:bg-orange-500 text-white shadow-xs"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-2xs"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {datePreset === "custom" && (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg bg-white dark:bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-slate-800 dark:text-white outline-none shadow-2xs"
              />
              <span className="text-[10px] text-slate-400 font-bold">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg bg-white dark:bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-slate-800 dark:text-white outline-none shadow-2xs"
              />
              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => handlePresetChange("all")}
                  className="px-2 py-1 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
            <div className="space-y-0.5 text-left">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Total Returns</span>
              <p className="text-lg font-black text-slate-900 dark:text-white">{totalReturns}</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <CornerDownLeft size={16} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
            <div className="space-y-0.5 text-left">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Pending Requests</span>
              <p className="text-lg font-black text-slate-900 dark:text-white">{pendingRequests}</p>
            </div>
            <div className={`p-2 rounded-lg ${pendingRequests > 0 ? "bg-amber-500/10 text-amber-500 animate-pulse" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`}>
              <Clock size={16} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
            <div className="space-y-0.5 text-left">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Completed Jobs</span>
              <p className="text-lg font-black text-emerald-500">{completedRequests}</p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle size={16} />
            </div>
          </div>
        </div>

      </div>

      {/* Returns List */}
      {filteredRequests.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900 py-16 text-center text-xs font-semibold text-slate-400 flex flex-col items-center justify-center gap-2 shadow-xs">
          <RotateCcw size={24} className="text-slate-300 dark:text-slate-700" />
          <p>No return orders recorded for the selected period.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredRequests.map((request) => {
            const userSelectedAction = request.returnType || "Refund";
            const originalDriverId = request.orderId?.deliverymanId || request.deliverymanId || "";
            const currentDriver = assignedDrivers[request._id] ?? originalDriverId ?? "";
            const originalDriverObj = drivers.find(d => String(d._id) === String(originalDriverId));
            const isPendingDecision = ["Requested", "Pending Approval", "Under Review", "Pending"].includes(request.status);
            
            return (
              <div
                key={request._id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs hover:shadow-md transition duration-200"
              >
                <div className="grid gap-6 xl:grid-cols-[120px_1fr_320px]">
                  {/* Image Section */}
                  <div className="h-28 w-28 mx-auto xl:mx-0 overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-3 shadow-inner">
                    {request.itemImage ? (
                      <img
                        src={request.itemImage?.startsWith('http') ? request.itemImage : `${backendUrl}/${request.itemImage}`}
                        alt={request.itemName}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-400">
                        <AlertCircle size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Details Section */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">{request.itemName}</h3>
                          <p className="text-xs font-medium text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                            <span>Order ID: <span className="font-mono text-slate-700 dark:text-slate-300">{request.orderId?._id || request.orderId}</span></span>
                            {request.createdAt && (
                              <>
                                <span>•</span>
                                <span>Requested on: <strong className="text-slate-700 dark:text-slate-300">{new Date(request.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} at {new Date(request.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}</strong></span>
                              </>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                            User Selection: {userSelectedAction}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold self-start ${getStatusBadgeStyle(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="rounded-lg bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          Qty {request.quantity}
                        </span>
                        {request.itemSize && (
                          <span className="rounded-lg bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            Size {request.itemSize}
                          </span>
                        )}
                        {request.returnType === "Exchange" && (request.exchangeSize || request.exchangeDetails?.requestedSize) && (
                          <span className="rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            Exch Size {request.exchangeSize || request.exchangeDetails?.requestedSize}
                          </span>
                        )}
                        <span className="rounded-lg bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold text-slate-100 dark:text-white uppercase tracking-wider">
                          ₹{request.amount}
                        </span>
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-50/70 dark:bg-slate-950/50 p-4 text-xs space-y-3">
                      <div>
                        <p className="font-bold text-slate-505 uppercase tracking-wider text-[9px] flex items-center gap-1">
                          <FileText size={11} />
                          Reason for Return
                        </p>
                        <p className="mt-1 text-slate-800 dark:text-slate-100 font-medium">{request.reason || request.returnReason}</p>
                      </div>

                      {request.feedback && (
                        <div className="pt-2">
                          <p className="font-bold text-slate-505 uppercase tracking-wider text-[9px] flex items-center gap-1">
                            <MessageSquare size={11} />
                            Customer Comment
                          </p>
                          <p className="mt-1 text-slate-800 dark:text-slate-100 font-medium">{request.feedback}</p>
                        </div>
                      )}
                    </div>

                    {/* Admin Obstacles warning / alerts */}
                    {request.adminNote && (
                      <div className="rounded-xl bg-rose-50/50 dark:bg-rose-950/20 p-4 text-xs space-y-1">
                        <p className="font-extrabold text-rose-600 uppercase tracking-wider text-[9px] flex items-center gap-1">
                          <ShieldAlert size={12} />
                          Admin Obstacle Report / Warning Note
                        </p>
                        <p className="text-slate-800 dark:text-slate-100 font-bold leading-relaxed">{request.adminNote}</p>
                      </div>
                    )}

                    {request.verificationCode && request.status !== "Completed" && (
                      <div className="flex items-center gap-2 rounded-xl bg-amber-50/50 dark:bg-amber-955/20 p-2.5 text-xs w-fit">
                        <KeyRound size={14} className="text-amber-605 shrink-0" />
                        <div>
                          <p className="text-[9px] font-black uppercase text-amber-500 tracking-wider">Customer Return Code</p>
                          <p className="font-mono font-black text-sm tracking-widest text-amber-707 dark:text-amber-400 mt-0.5">{request.verificationCode}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Settings Action Column */}
                  <div className="space-y-3.5 pt-4 xl:pt-0 xl:pl-6 flex flex-col justify-between text-xs">
                    
                    {/* SET REQUEST STATUS: Approve or Reject ONLY */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Set Request Status (Seller Choice)</label>
                      {isPendingDecision ? (
                        <select
                          value={request.status === "Approved" || request.status === "Rejected" ? request.status : "Requested"}
                          onChange={(event) => {
                            if (event.target.value === "Approved" || event.target.value === "Rejected") {
                              handleStatusUpdate(request._id, event.target.value);
                            }
                          }}
                          className="w-full rounded-xl px-3 py-2.5 text-xs font-extrabold bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 outline-none cursor-pointer shadow-2xs"
                        >
                          <option value="Requested" disabled>Pending Decision...</option>
                          <option value="Approved">Approve Return Request</option>
                          <option value="Rejected">Reject Return Request</option>
                        </select>
                      ) : (
                        <div className={`w-full rounded-xl px-3 py-2 text-xs font-extrabold ${getStatusBadgeStyle(request.status)}`}>
                          Status: {request.status}
                        </div>
                      )}
                    </div>

                    {/* RETURN ACTION: Read-Only User Selection */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Return Action (Customer Choice)</label>
                      <div className="w-full rounded-xl px-3 py-2 text-xs font-extrabold bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 flex items-center justify-between">
                        <span>{userSelectedAction}</span>
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400">
                          Customer Chosen
                        </span>
                      </div>
                      {request.returnType === "Exchange" && (request.exchangeSize || request.exchangeDetails?.requestedSize) && (
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">Exchange Size: {request.exchangeSize || request.exchangeDetails?.requestedSize}</p>
                      )}
                    </div>

                    {/* ASSIGN AGENT: Same Delivery Executive */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pickup Agent (Same Delivery Agent)</label>
                      <select
                        value={currentDriver}
                        onChange={(e) => setAssignedDrivers(prev => ({ ...prev, [request._id]: e.target.value }))}
                        className="w-full rounded-xl px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none shadow-2xs"
                      >
                        <option value="">Select Agent...</option>
                        {drivers.map(d => {
                          const isOriginal = String(d._id) === String(originalDriverId);
                          return (
                            <option key={d._id} value={d._id}>
                              {d.name} {isOriginal ? "★ (Original Delivery Agent)" : ""} ({d.activeDeliveries || 0} active)
                            </option>
                          );
                        })}
                      </select>
                      {originalDriverObj && (
                        <p className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400">
                          ✓ Auto-selected original delivery executive: {originalDriverObj.name}
                        </p>
                      )}
                    </div>

                    {/* Direct Action Buttons */}
                    {isPendingDecision && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => handleStatusUpdate(request._id, "Approved")}
                          className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 text-xs font-bold transition shadow-sm cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(request._id, "Rejected")}
                          className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 text-xs font-bold transition shadow-sm cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {/* Process Refund / Complete Return Button for Seller */}
                    {request.status !== "Requested" && request.status !== "Rejected" && (
                      <div className="pt-2">
                        <button
                          onClick={() => handleProcessRefund(request._id)}
                          className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2.5 text-xs font-black uppercase tracking-wider transition shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                        >
                          <CheckCircle size={15} />
                          <span>Process Refund (₹{request.amount}) & Complete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Returns;
