import React, { useCallback, useEffect, useState, useMemo } from "react";
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
  Inbox,
  RefreshCw,
  Search,
  Filter,
  Send,
  Zap
} from "lucide-react";

const Support = ({ token }) => {
  const [requests, setRequests] = useState([]);
  const [replies, setReplies] = useState({});
  const [loading, setLoading] = useState(false);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [datePreset, setDatePreset] = useState("all"); // all, today, week, month, custom

  const fetchRequests = useCallback(async () => {
    if (!token) return;
    setLoading(true);

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
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRequests();
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
        toast.success("Support ticket updated successfully.");
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

  // Categories list for dropdown
  const categories = useMemo(() => {
    const cats = new Set(requests.map(r => r.category).filter(Boolean));
    return Array.from(cats);
  }, [requests]);

  // Filter & Sort Support Requests
  const filteredRequests = useMemo(() => {
    return requests
      .filter((req) => {
        // Status filter
        if (statusFilter !== "all" && req.status !== statusFilter) return false;

        // Category filter
        if (categoryFilter !== "all" && req.category !== categoryFilter) return false;

        // Date filter
        if (req.createdAt) {
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
        }

        // Search Query
        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase();
          const inSubject = req.subject?.toLowerCase().includes(q);
          const inName = req.name?.toLowerCase().includes(q);
          const inEmail = req.email?.toLowerCase().includes(q);
          const inCategory = req.category?.toLowerCase().includes(q);
          const inMessage = req.message?.toLowerCase().includes(q);
          return inSubject || inName || inEmail || inCategory || inMessage;
        }

        return true;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [requests, statusFilter, categoryFilter, startDate, endDate, searchQuery]);

  // Stats calculation based on filtered list
  const totalTickets = filteredRequests.length;
  const openTickets = filteredRequests.filter((r) => r.status === "Open").length;
  const inProgressTickets = filteredRequests.filter((r) => r.status === "In Progress").length;
  const resolvedTickets = filteredRequests.filter((r) => r.status === "Resolved").length;

  // Helper for status badge style
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Resolved":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "In Progress":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      default:
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    }
  };

  // Quick reply template appender
  const applyTemplate = (requestId, templateText) => {
    setReplies(prev => ({
      ...prev,
      [requestId]: templateText
    }));
  };

  return (
    <div className="space-y-4 animate-fadeIn text-slate-800 dark:text-slate-100">
      
      {/* ── Single Consolidated Container: Header, KPI Stats, Filters & Search ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs space-y-3.5 shrink-0">
        
        {/* Top: Header Row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-blue-600 dark:bg-blue-500/10 text-slate-100 dark:text-white dark:text-blue-400 rounded-lg flex items-center justify-center border border-blue-500/10 shadow-xs shrink-0">
              <MessageSquare size={16} />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Customer Care Command Center</h1>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Manage, track, and resolve user technical & service tickets</p>
            </div>
          </div>

          <button
            onClick={fetchRequests}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg text-xs font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RefreshCw size={12} className={loading ? "animate-spin text-blue-500" : ""} />
            <span>Refresh Desk</span>
          </button>
        </div>

        {/* Middle: KPI Stats Mini Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { key: "all", label: "Total Tickets", val: totalTickets, sub: "Registered inquiries", icon: Inbox, color: "text-blue-500 bg-blue-500/10" },
            { key: "Open", label: "Open Tickets", val: openTickets, sub: "Requires attention", icon: AlertCircle, color: "text-rose-500 bg-rose-500/10" },
            { key: "In Progress", label: "In Progress", val: inProgressTickets, sub: "Being addressed", icon: Clock, color: "text-amber-500 bg-amber-500/10" },
            { key: "Resolved", label: "Resolved", val: resolvedTickets, sub: "Completed tickets", icon: CheckCircle, color: "text-emerald-500 bg-emerald-500/10" }
          ].map(card => {
            const isSelected = statusFilter === card.key;
            const Icon = card.icon;
            return (
              <div
                key={card.key}
                onClick={() => setStatusFilter(card.key)}
                className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between group relative overflow-hidden ${ isSelected ? "bg-slate-950 border-slate-950 text-slate-100 dark:text-white dark:bg-blue-600 dark:border-blue-500 shadow-xs" : "bg-slate-50/70 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700/80" }`}
              >
                <div className="space-y-1 relative z-10 text-left">
                  <span className={`text-[8px] font-black uppercase tracking-widest ${ isSelected ? "text-slate-300 dark:text-blue-100" : "text-slate-400 dark:text-slate-500" }`}>
                    {card.label}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black tracking-tight">{card.val}</span>
                    <span className={`text-[9px] font-black uppercase tracking-wider ${ isSelected ? "text-slate-300 dark:text-blue-200" : "text-slate-400 dark:text-slate-500" }`}>
                      {card.sub}
                    </span>
                  </div>
                </div>
                <div className={`p-2 rounded-lg border ${card.color} border-slate-200/50 dark:border-slate-800 transition-transform duration-200 group-hover:scale-105 relative z-10`}>
                  <Icon size={14} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom: Date Presets, Dropdowns & Search Bar */}
        <div className="space-y-2.5 pt-0.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            
            {/* Timeline Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 mr-1">
                <Calendar size={12} />
                <span className="text-[8px] font-black uppercase tracking-widest leading-none">Timeline</span>
              </div>

              <div className="flex flex-wrap items-center gap-0.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 rounded-lg p-0.5">
                {[
                  { id: "all", label: "All Time" },
                  { id: "today", label: "Today" },
                  { id: "week", label: "7 Days" },
                  { id: "month", label: "30 Days" },
                  { id: "custom", label: "Custom" },
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => p.id === "custom" ? setDatePreset("custom") : handlePresetChange(p.id)}
                    className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${ datePreset === p.id ? "bg-slate-950 text-slate-100 dark:text-white dark:bg-blue-600 dark:text-white shadow-xs" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white" }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {datePreset === "custom" && (
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 animate-fadeIn">
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={e => setStartDate(e.target.value)}
                    className="bg-transparent text-[8px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 outline-none cursor-pointer" 
                  />
                  <span className="text-slate-400 font-black text-[8px]">→</span>
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={e => setEndDate(e.target.value)}
                    className="bg-transparent text-[8px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 outline-none cursor-pointer" 
                  />
                  {(startDate || endDate) && (
                    <button 
                      onClick={() => handlePresetChange("all")} 
                      className="text-[8px] text-rose-500 hover:text-rose-600 font-black uppercase tracking-wider cursor-pointer ml-0.5"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Category Dropdown */}
            {categories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1 text-[11px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 outline-none cursor-pointer font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
              >
                <option value="all">Filter by Category: All</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}
          </div>

          {/* Search Input Box */}
          <div className="relative flex items-center">
            <Search size={13} className="absolute left-3 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search by ticket subject, customer name, email address, category, or message body..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-[11px] bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Tickets List Section */}
      {filteredRequests.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 py-16 text-center text-xs text-slate-500 shadow-xs flex flex-col items-center justify-center gap-2">
          <MessageSquare size={32} className="text-slate-300 dark:text-slate-700" />
          <div>
            <p className="font-bold text-slate-700 dark:text-slate-300">No customer support tickets found</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Try adjusting your timeline, status tab, or search criteria.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <article
              key={request._id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-xs hover:shadow-sm transition duration-200 space-y-4"
            >
              <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
                
                {/* Inquiry Details Column */}
                <div className="space-y-3.5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider border border-slate-200/60 dark:border-slate-700">
                        {request.category || "General Inquiry"}
                      </span>
                      <h3 className="mt-2 text-base font-black text-slate-900 dark:text-slate-100 tracking-tight">
                        {request.subject}
                      </h3>
                      
                      {/* Customer Contact Badge Row */}
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                          <User size={13} className="text-slate-400" />
                          {request.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail size={13} className="text-slate-400" />
                          <a href={`mailto:${request.email}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition font-semibold underline decoration-slate-200 dark:decoration-slate-700">
                            {request.email}
                          </a>
                        </span>
                      </div>
                    </div>
                    
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border self-start ${getStatusBadgeStyle(request.status)}`}>
                      {request.status}
                    </span>
                  </div>

                  {/* Customer Message Bubble */}
                  <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 text-xs">
                    <p className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[8px] mb-1">Customer Message</p>
                    <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed whitespace-pre-line">{request.message}</p>
                  </div>

                  {/* Submission date info */}
                  <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
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
                <div className="space-y-3 pt-4 xl:pt-0 xl:border-l xl:border-slate-100 dark:xl:border-slate-800 xl:pl-5 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Update Ticket Status</label>
                    <select
                      value={request.status}
                      onChange={(event) => handleUpdate(request._id, event.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 text-xs font-black bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none transition cursor-pointer ${getStatusBadgeStyle(request.status)} focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  {/* Quick Reply Templates */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      <Zap size={10} className="text-amber-500" />
                      <span>Quick Reply Presets</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {[
                        "We are investigating this issue with our logistics partner.",
                        "Your refund has been initiated to your original payment method.",
                        "Your ticket has been marked as resolved. Thank you for contacting CartNOW!"
                      ].map((tpl, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => applyTemplate(request._id, tpl)}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[8px] font-bold text-slate-600 dark:text-slate-300 transition cursor-pointer text-left truncate max-w-full"
                          title={tpl}
                        >
                          Preset {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 flex-1">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Staff Reply Payload</label>
                    <textarea
                      rows="4"
                      value={replies[request._id] ?? request.adminReply ?? ""}
                      onChange={(event) =>
                        setReplies((current) => ({
                          ...current,
                          [request._id]: event.target.value,
                        }))
                      }
                      placeholder="Type official response to dispatch to customer email..."
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs outline-none transition focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 resize-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={() => handleUpdate(request._id, request.status)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-4 py-2 text-xs font-black uppercase tracking-wider transition shadow-xs active:scale-95 cursor-pointer mt-1"
                  >
                    <Send size={12} />
                    <span>Send & Save Reply</span>
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
