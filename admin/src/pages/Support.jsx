import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../config";
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  User, 
  Mail, 
  Calendar, 
  AlertCircle,
  CornerDownRight,
  Inbox
} from "lucide-react";

const Support = ({ token }) => {
  const [requests, setRequests] = useState([]);
  const [replies, setReplies] = useState({});

  // Date filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [datePreset, setDatePreset] = useState("all"); // all, today, week, month, custom

  const fetchRequests = useCallback(async () => {
    if (!token) return;

    try {
      const response = await axios.post(
        `${backendUrl}/api/service/help/admin/list`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        setRequests(response.data.helpRequests);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  }, [token]);

  useEffect(() => {
    const loadRequests = async () => {
      await fetchRequests();
    };

    loadRequests();
  }, [fetchRequests]);

  const handleUpdate = async (requestId, status) => {
    try {
      const request = requests.find((r) => r._id === requestId);
      const response = await axios.post(
        `${backendUrl}/api/service/help/admin/status`,
        {
          requestId,
          status,
          adminReply: replies[requestId] ?? request?.adminReply ?? "",
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Support request updated.");
        fetchRequests();
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

  // Filter & Sort Support Requests
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
  const totalTickets = filteredRequests.length;
  const openTickets = filteredRequests.filter((r) => r.status === "Open").length;
  const resolvedTickets = filteredRequests.filter((r) => r.status === "Resolved").length;

  // Helper for status badge style
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Resolved":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "In Progress":
        return "bg-amber-50 text-amber-700 border-amber-100";
      default:
        return "bg-rose-50 text-rose-700 border-rose-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-450">
            Customer Care Desk
          </p>
          <div className="flex items-center gap-2.5 mt-1">
            <MessageSquare size={22} className="text-slate-900" />
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Help Requests</h2>
          </div>
        </div>
        <p className="text-xs text-slate-500 font-medium">
          Resolve customer inquiries and technical support tickets
        </p>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider mr-2 flex items-center gap-1.5">
            <Calendar size={14} className="text-slate-450" /> Filter Date:
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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${
                datePreset === preset.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 border border-slate-100 hover:text-slate-900"
              }`}
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
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-bold text-slate-800 outline-none transition focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-950/5"
            />
            <span className="text-xs text-slate-400 font-bold">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-bold text-slate-800 outline-none transition focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-950/5"
            />
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => handlePresetChange("all")}
                className="px-2 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-900 transition cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Tickets */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-700">
            <Inbox size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Tickets</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{totalTickets}</p>
          </div>
        </div>

        {/* Open Tickets */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${openTickets > 0 ? "bg-rose-50 text-rose-600 animate-pulse" : "bg-slate-50 text-slate-700"}`}>
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Open Tickets</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{openTickets}</p>
          </div>
        </div>

        {/* Resolved Tickets */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Resolved</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{resolvedTickets}</p>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      {filteredRequests.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-500 shadow-sm flex flex-col items-center justify-center gap-2">
          <MessageSquare size={32} className="text-slate-300" />
          <div>
            <p className="font-semibold text-slate-700">No support tickets found</p>
            <p className="text-xs text-slate-400 mt-0.5">Try altering the date filters or custom calendar selection.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredRequests.map((request) => (
            <article
              key={request._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition duration-200"
            >
              <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
                {/* Inquiry Details Column */}
                <div className="space-y-4">
                  <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                        {request.category}
                      </span>
                      <h3 className="mt-2.5 text-base font-extrabold text-slate-900 tracking-tight">
                        {request.subject}
                      </h3>
                      
                      {/* Customer Contact Card */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <User size={13} className="text-slate-400" />
                          {request.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail size={13} className="text-slate-450" />
                          <a href={`mailto:${request.email}`} className="hover:text-slate-900 transition underline decoration-slate-200 decoration-1">
                            {request.email}
                          </a>
                        </span>
                      </div>
                    </div>
                    
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border self-start ${getStatusBadgeStyle(request.status)}`}>
                      {request.status}
                    </span>
                  </div>

                  {/* Customer Message Bubble */}
                  <div className="relative rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-xs">
                    <p className="font-bold text-slate-450 uppercase tracking-wider text-[9px] mb-1.5 block">Customer Message</p>
                    <p className="text-slate-800 font-medium leading-relaxed whitespace-pre-line">{request.message}</p>
                  </div>

                  {/* Submission date info */}
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                    <Calendar size={12} />
                    <span>Submitted on:</span>
                    <span>
                      {new Date(request.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short"
                      })}
                    </span>
                  </div>
                </div>

                {/* Response / Action Column */}
                <div className="space-y-3 pt-4 xl:pt-0 xl:border-l xl:border-slate-100 xl:pl-6 flex flex-col justify-between">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ticket Status</label>
                    <select
                      value={request.status}
                      onChange={(event) => handleUpdate(request._id, event.target.value)}
                      className={`w-full border rounded-xl px-3 py-2.5 text-xs font-bold bg-white text-slate-800 outline-none transition focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 ${getStatusBadgeStyle(request.status)}`}
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 flex-1 mt-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Staff Reply</label>
                    <textarea
                      rows="6"
                      value={replies[request._id] ?? request.adminReply ?? ""}
                      onChange={(event) =>
                        setReplies((current) => ({
                          ...current,
                          [request._id]: event.target.value,
                        }))
                      }
                      placeholder="Type a response to update the customer..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/20 px-3.5 py-2.5 text-xs outline-none transition focus:bg-white focus:ring-4 focus:ring-slate-950/5 focus:border-slate-900 placeholder:text-slate-400 resize-none"
                    />
                  </div>

                  <button
                    onClick={() => handleUpdate(request._id, request.status)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 text-xs font-bold transition shadow-sm active:scale-98 cursor-pointer mt-1"
                  >
                    <CornerDownRight size={13} />
                    Save Reply
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Support;
