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

  const handleStatusUpdate = async (requestId, status) => {
    try {
      const request = requests.find((r) => r._id === requestId);
      
      const payload = {
        requestId,
        status,
        sellerNotes: notes[requestId] ?? request?.adminNote ?? "",
      };

      const response = await axios.post(
        `${backendUrl}/api/rms/request/review`,
        payload,
        { headers: { token, seller_token: token } }
      );

      if (response.data.success) {
        toast.success(`Return request ${status.toLowerCase()} and Return Order (RMA) created.`);
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
        return "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50";
      case "Out for Pickup":
        return "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/50";
      case "Picked Up":
        return "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-450 dark:border-amber-900/50";
      case "Rejected":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-455 dark:border-rose-900/50";
      default:
        return "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50";
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn text-slate-800 dark:text-slate-100">
      
      {/* ── Single Consolidated Container: Header, Date Filters & Stats ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs space-y-3.5 shrink-0">
        
        {/* Header Row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-orange-500/10 text-orange-500 rounded-lg flex items-center justify-center border border-orange-500/20 shadow-xs shrink-0">
              <RotateCcw size={16} />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Product Return & RMA Management</h1>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Process return authorizations, approve exchange sizes, and assign pickup logistics agents</p>
            </div>
          </div>

          <button
            onClick={fetchReturns}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs"
          >
            <RotateCcw size={12} className="text-orange-500" />
            <span>Refresh RMA Desk</span>
          </button>
        </div>

        {/* Date Filter Bar & Presets */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3 bg-slate-50/70 dark:bg-slate-950/40 rounded-xl border border-slate-200/60 dark:border-slate-800">
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
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
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
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-slate-800 dark:text-white outline-none"
              />
              <span className="text-[10px] text-slate-400 font-bold">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-slate-800 dark:text-white outline-none"
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
          <div className="p-3 rounded-xl border bg-slate-50/70 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5 text-left">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Total Returns</span>
              <p className="text-lg font-black text-slate-900 dark:text-white">{totalReturns}</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <CornerDownLeft size={16} />
            </div>
          </div>

          <div className="p-3 rounded-xl border bg-slate-50/70 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5 text-left">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Pending Requests</span>
              <p className="text-lg font-black text-slate-900 dark:text-white">{pendingRequests}</p>
            </div>
            <div className={`p-2 rounded-lg ${pendingRequests > 0 ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`}>
              <Clock size={16} />
            </div>
          </div>

          <div className="p-3 rounded-xl border bg-slate-50/70 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5 text-left">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Completed Jobs</span>
              <p className="text-lg font-black text-emerald-500">{completedRequests}</p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <CheckCircle size={16} />
            </div>
          </div>
        </div>

      </div>

      {/* Returns List */}
      {filteredRequests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-16 text-center text-xs font-semibold text-slate-400 flex flex-col items-center justify-center gap-2">
          <RotateCcw size={24} className="text-slate-300 dark:text-slate-700" />
          <p>No return orders recorded for the selected period.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredRequests.map((request) => {
            const currentType = types[request._id] ?? request.returnType ?? "Refund";
            const currentDriver = assignedDrivers[request._id] ?? request.deliverymanId ?? "";
            
            return (
              <div
                key={request._id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition duration-200"
              >
                <div className="grid gap-6 xl:grid-cols-[120px_1fr_300px]">
                  {/* Image Section */}
                  <div className="h-28 w-28 mx-auto xl:mx-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-3 shadow-inner">
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
                          <p className="text-xs font-medium text-slate-400 mt-1">
                            Order ID: <span className="font-mono text-slate-700 dark:text-slate-300">{request.orderId}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-900/50 rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                            Type: {request.returnType || "Refund"}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border self-start ${getStatusBadgeStyle(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="rounded-lg bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-transparent dark:border-slate-850 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          Qty {request.quantity}
                        </span>
                        {request.itemSize && (
                          <span className="rounded-lg bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-transparent dark:border-slate-850 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            Size {request.itemSize}
                          </span>
                        )}
                        {request.returnType === "Exchange" && request.exchangeSize && (
                          <span className="rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            Exch Size {request.exchangeSize}
                          </span>
                        )}
                        <span className="rounded-lg bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold text-slate-100 dark:text-white uppercase tracking-wider">
                          ₹{request.amount}
                        </span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/30 p-4 text-xs space-y-3">
                      <div>
                        <p className="font-bold text-slate-505 uppercase tracking-wider text-[9px] flex items-center gap-1">
                          <FileText size={11} />
                          Reason for Return
                        </p>
                        <p className="mt-1 text-slate-800 dark:text-slate-100 font-medium">{request.reason}</p>
                      </div>

                      {request.feedback && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-850">
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
                      <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/30 dark:bg-rose-950/10 p-4 text-xs space-y-1">
                        <p className="font-extrabold text-rose-600 uppercase tracking-wider text-[9px] flex items-center gap-1">
                          <ShieldAlert size={12} />
                          Admin Obstacle Report / Warning Note
                        </p>
                        <p className="text-slate-800 dark:text-slate-100 font-bold leading-relaxed">{request.adminNote}</p>
                      </div>
                    )}

                    {request.verificationCode && request.status !== "Completed" && (
                      <div className="flex items-center gap-2 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-955/10 p-2.5 text-xs w-fit">
                        <KeyRound size={14} className="text-amber-605 shrink-0" />
                        <div>
                          <p className="text-[9px] font-black uppercase text-amber-500 tracking-wider">Customer Return Code</p>
                          <p className="font-mono font-black text-sm tracking-widest text-amber-707 dark:text-amber-400 mt-0.5">{request.verificationCode}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Settings Action Column */}
                  <div className="space-y-3 pt-4 xl:pt-0 xl:border-l xl:border-slate-100 dark:xl:border-slate-800 xl:pl-6 flex flex-col justify-between text-xs">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Set Request Status</label>
                      <select
                        value={request.status}
                        onChange={(event) => handleStatusUpdate(request._id, event.target.value)}
                        className={`w-full border rounded-xl px-3 py-2.5 text-xs font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-105 outline-none transition ${getStatusBadgeStyle(request.status)} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900`}
                      >
                        <option value="Requested">Requested</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Out for Pickup">Out for Pickup</option>
                        <option value="Picked Up">Picked Up</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Return Action</label>
                      <select
                        value={currentType}
                        onChange={(e) => setTypes(prev => ({ ...prev, [request._id]: e.target.value }))}
                        className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                      >
                        <option value="Refund">Refund</option>
                        <option value="Replacement">Replacement</option>
                        <option value="Exchange">Exchange</option>
                      </select>
                    </div>

                    {currentType === "Exchange" && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Exchange Size</label>
                        <input
                          type="text"
                          value={exchangeSizes[request._id] ?? request.exchangeSize ?? ""}
                          onChange={(e) => setExchangeSizes(prev => ({ ...prev, [request._id]: e.target.value }))}
                          placeholder="e.g. XL, M, L"
                          className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none"
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assign Agent</label>
                      <select
                        value={currentDriver}
                        onChange={(e) => setAssignedDrivers(prev => ({ ...prev, [request._id]: e.target.value }))}
                        className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none"
                      >
                        <option value="">Unassigned</option>
                        {drivers.map(d => (
                          <option key={d._id} value={d._id}>
                            {d.name} ({d.activeDeliveries || 0} active)
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => handleStatusUpdate(request._id, request.status)}
                      className="w-full rounded-xl bg-orange-600 hover:bg-orange-700 text-slate-100 dark:text-white px-4 py-2.5 text-xs font-bold transition shadow-sm"
                    >
                      Save Return Settings
                    </button>
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
