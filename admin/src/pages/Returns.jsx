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
  User,
  Calendar,
  KeyRound
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
  const [datePreset, setDatePreset] = useState("all"); // all, today, week, month, custom

  const fetchReturns = useCallback(async () => {
    if (!token) return;

    try {
      const response = await axios.post(
        `${backendUrl}/api/service/returns/admin/list`,
        {},
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
      const res = await axios.get(`${backendUrl}/api/deliveryman/list`, { headers: { token } });
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
        adminNote: notes[requestId] ?? request?.adminNote ?? "",
        sellerNotes: notes[requestId] ?? request?.adminNote ?? "",
      };

      const response = await axios.post(
        `${backendUrl}/api/rms/request/review`,
        payload,
        { headers: { token, admin_token: token } }
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

  // Date preset change handler
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

  // Filter & Sort Return Requests
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

  // Stats calculation based on filtered list
  const totalReturns = filteredRequests.length;
  const pendingRequests = filteredRequests.filter((r) => r.status === "Requested").length;
  const completedRequests = filteredRequests.filter((r) => r.status === "Completed").length;

  // Helper for status badge style
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "Out for Pickup":
        return "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
      case "Picked Up":
        return "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "Rejected":
        return "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      default:
        return "bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
            Customer Care Desk
          </p>
          <div className="flex items-center gap-2.5 mt-1">
            <RotateCcw size={22} className="text-slate-900 dark:text-slate-100" />
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Return Requests</h2>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Handle product returns, refund pickups, and replacement/exchange agent assignments
        </p>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1.5">
            <Calendar size={14} className="text-slate-400" /> Filter Date:
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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${ datePreset === preset.id ? "bg-slate-900 text-slate-100 dark:bg-blue-600 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white" }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Custom Date Range Picker */}
        {datePreset === "custom" && (
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none transition focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            />
            <span className="text-xs text-slate-400 font-bold">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none transition focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            />
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => handlePresetChange("all")}
                className="px-2 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Returns */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
            <CornerDownLeft size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">Total Returns</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">{totalReturns}</p>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${pendingRequests > 0 ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 animate-pulse" : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"}`}>
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">Requested</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">{pendingRequests}</p>
          </div>
        </div>

        {/* Completed Requests */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">Completed Jobs</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">{completedRequests}</p>
          </div>
        </div>
      </div>

      {/* Return Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-16 text-center text-sm text-slate-500 dark:text-slate-400 shadow-sm flex flex-col items-center justify-center gap-2">
          <RotateCcw size={32} className="text-slate-300 dark:text-slate-600" />
          <div>
            <p className="font-semibold text-slate-700 dark:text-slate-300">No return requests found</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Try altering the date filters or custom calendar selection.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredRequests.map((request) => {
            const currentType = types[request._id] ?? request.returnType ?? "Refund";
            const currentDriver = assignedDrivers[request._id] ?? request.deliverymanId ?? "";
            
            return (
              <div
                key={request._id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition duration-200"
              >
                <div className="grid gap-6 xl:grid-cols-[120px_1fr_300px]">
                  {/* Image Section */}
                  <div className="h-28 w-28 mx-auto xl:mx-0 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-3 shadow-inner">
                    {request.itemImage ? (
                      <img
                        src={request.itemImage?.startsWith('http') ? request.itemImage : `${backendUrl}/${request.itemImage}`}
                        alt={request.itemName}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500">
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
                          <p className="text-xs font-medium text-slate-400 dark:text-slate-400 mt-1">
                            Order Reference: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{request.orderId}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                            Type: {request.returnType || "Refund"}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border self-start ${getStatusBadgeStyle(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                      </div>

                      {/* Metadata tags */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider border border-slate-200/50 dark:border-slate-700/50">
                          Qty {request.quantity}
                        </span>
                        {request.itemSize && (
                          <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider border border-slate-200/50 dark:border-slate-700/50">
                            Size {request.itemSize}
                          </span>
                        )}
                        {request.returnType === "Exchange" && request.exchangeSize && (
                          <span className="rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            Exch Size {request.exchangeSize}
                          </span>
                        )}
                        <span className="rounded-lg bg-slate-900 dark:bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold text-slate-100 dark:text-white uppercase tracking-wider">
                          ₹{request.amount}
                        </span>
                      </div>
                    </div>

                    {/* Customer Reason / Feedback Box */}
                    <div className="rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 p-4 text-xs space-y-3">
                      <div>
                        <p className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[9px] flex items-center gap-1">
                          <FileText size={11} />
                          Reason for return
                        </p>
                        <p className="mt-1 text-slate-800 dark:text-slate-100 font-medium leading-relaxed">{request.reason}</p>
                      </div>

                      {request.feedback && (
                        <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700/50">
                          <p className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[9px] flex items-center gap-1">
                            <MessageSquare size={11} />
                            Customer comment
                          </p>
                          <p className="mt-1 text-slate-800 dark:text-slate-100 font-medium leading-relaxed">{request.feedback}</p>
                        </div>
                      )}
                    </div>

                    {/* Verification Code Display */}
                    {request.verificationCode && request.status !== "Completed" && (
                      <div className="flex items-center gap-2 rounded-xl border border-amber-200 dark:border-amber-800/80 bg-amber-50/80 dark:bg-amber-950/50 p-2.5 text-xs w-fit">
                        <KeyRound size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
                        <div>
                          <p className="text-[9px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">Customer Return Code</p>
                          <p className="font-mono font-black text-sm tracking-widest text-amber-700 dark:text-amber-300 mt-0.5">{request.verificationCode}</p>
                        </div>
                      </div>
                    )}

                    {/* Submission date info */}
                    {request.createdAt && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider pl-1 pt-1">
                        <Calendar size={12} className="text-slate-400" />
                        <span>Requested on:</span>
                        <span>
                          {new Date(request.createdAt).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short"
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Status Update / Notes Action column */}
                  <div className="space-y-3 pt-4 xl:pt-0 xl:border-l xl:border-slate-100 dark:xl:border-slate-800 xl:pl-6 flex flex-col justify-between text-xs">
                    
                    {/* Status dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Request Status (Managed by Seller)</label>
                      <select
                        disabled
                        value={request.status}
                        onChange={(event) => handleStatusUpdate(request._id, event.target.value)}
                        className={`w-full border rounded-xl px-3 py-2.5 text-xs font-bold outline-none opacity-90 cursor-not-allowed ${getStatusBadgeStyle(request.status)}`}
                      >
                        <option value="Requested">Requested</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Out for Pickup">Out for Pickup</option>
                        <option value="Picked Up">Picked Up</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    {/* Return Action Selection */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Return Action</label>
                      <select
                        disabled
                        value={currentType}
                        onChange={(e) => setTypes(prev => ({ ...prev, [request._id]: e.target.value }))}
                        className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none cursor-not-allowed opacity-90"
                      >
                        <option value="Refund">Refund</option>
                        <option value="Replacement">Replacement</option>
                        <option value="Exchange">Exchange</option>
                      </select>
                    </div>

                    {/* Swap Size if Exchange */}
                    {currentType === "Exchange" && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Exchange Size</label>
                        <input
                          disabled
                          type="text"
                          value={exchangeSizes[request._id] ?? request.exchangeSize ?? ""}
                          onChange={(e) => setExchangeSizes(prev => ({ ...prev, [request._id]: e.target.value }))}
                          placeholder="e.g. XL, M, L"
                          className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none cursor-not-allowed opacity-90"
                        />
                      </div>
                    )}

                    {/* Pickup Agent Assignment */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Assign Agent</label>
                      <select
                        disabled
                        value={currentDriver}
                        onChange={(e) => setAssignedDrivers(prev => ({ ...prev, [request._id]: e.target.value }))}
                        className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none cursor-not-allowed opacity-90"
                      >
                        <option value="">Unassigned</option>
                        {drivers.map(d => (
                          <option key={d._id} value={d._id}>
                            {d.name} ({d.activeDeliveries || 0} active)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Obstacle Report / Note to Seller</label>
                      <textarea
                        rows="3"
                        value={notes[request._id] ?? request.adminNote ?? ""}
                        onChange={(event) =>
                          setNotes((current) => ({
                            ...current,
                            [request._id]: event.target.value,
                          }))
                        }
                        placeholder="Report any obstacles or notes to the seller..."
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none transition focus:bg-white dark:focus:bg-slate-800 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none font-medium focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                      />
                    </div>

                    <button
                      onClick={() => handleStatusUpdate(request._id, request.status)}
                      className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-slate-100 dark:text-white px-4 py-2.5 text-xs font-bold transition shadow-sm active:scale-98 cursor-pointer mt-1"
                    >
                      Report Obstacle to Seller
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
