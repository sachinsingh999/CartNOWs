import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import { 
  Store, ShieldAlert, Award, CreditCard, CheckCircle, AlertOctagon, Edit3, RefreshCw, Search, CheckCircle2, UserX, Clock, DollarSign
} from "lucide-react";

const Sellers = ({ token }) => {
  const [sellers, setSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [commissionInput, setCommissionInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchSellers = async () => {
    setIsRefreshing(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/sellers`, { headers: { token } });
      if (data.success) {
        setSellers(data.sellers);
      }
    } catch {
      toast.error("Failed to fetch sellers");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/admin/seller/status`, { id, status }, { headers: { token } });
      if (data.success) {
        toast.success(data.message);
        fetchSellers();
        if (selectedSeller?._id === id) {
          setSelectedSeller({ ...selectedSeller, status });
        }
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleCommissionUpdate = async (e) => {
    e.preventDefault();
    if (!selectedSeller) return;
    const rate = parseFloat(commissionInput);
    if (isNaN(rate) || rate < 0 || rate > 100) return toast.error("Enter a valid commission percentage (0-100)");

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/seller/commission`,
        { id: selectedSeller._id, commissionRate: rate },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        fetchSellers();
        setSelectedSeller({ ...selectedSeller, commissionRate: rate });
        setCommissionInput("");
      }
    } catch {
      toast.error("Failed to update commission rate");
    }
  };

  const handlePayoutStatus = async (requestId, status) => {
    if (!selectedSeller) return;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/seller/payout`,
        { sellerId: selectedSeller._id, requestId, status },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        fetchSellers();
        const updated = data.seller;
        setSelectedSeller(updated);
      }
    } catch {
      toast.error("Failed to process payout");
    }
  };

  // Filter sellers reactively
  const filteredSellers = useMemo(() => {
    return sellers.filter(s => {
      // Status filter
      if (statusFilter !== "all" && s.status !== statusFilter) return false;

      // Search Query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const inShop = s.shopName?.toLowerCase().includes(q);
        const inName = s.name?.toLowerCase().includes(q);
        const inEmail = s.email?.toLowerCase().includes(q);
        const inPhone = s.phone?.toLowerCase().includes(q);
        return inShop || inName || inEmail || inPhone;
      }

      return true;
    });
  }, [sellers, statusFilter, searchQuery]);

  // Derived statistics
  const totalCount = sellers.length;
  const activeCount = sellers.filter(s => s.status === "active").length;
  const pendingCount = sellers.filter(s => s.status === "pending").length;
  const suspendedCount = sellers.filter(s => s.status === "suspended").length;

  return (
    <div className="space-y-4 animate-fadeIn text-slate-800 dark:text-slate-100">
      
      {/* ── Single Consolidated Container: Header, Stats & Search Bar ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs space-y-3.5 shrink-0">
        
        {/* Top: Header Row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-purple-600 dark:bg-purple-500/10 text-white dark:text-purple-400 rounded-lg flex items-center justify-center border border-purple-500/10 shadow-xs shrink-0">
              <Store size={16} />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Seller & Merchant Control</h1>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Manage merchant onboarding, commission rates, and payout settlements</p>
            </div>
          </div>

          <button
            onClick={fetchSellers}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg text-xs font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RefreshCw size={12} className={isRefreshing ? "animate-spin text-purple-500" : ""} />
            <span>Refresh Directory</span>
          </button>
        </div>

        {/* Middle: Merchant Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { key: "all", label: "Total Merchants", val: totalCount, sub: "Registered shops", icon: Store, color: "text-blue-500 bg-blue-500/10" },
            { key: "active", label: "Active Merchants", val: activeCount, sub: "Verified & selling", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10" },
            { key: "pending", label: "Pending Approval", val: pendingCount, sub: "Requires review", icon: Clock, color: "text-amber-500 bg-amber-500/10" },
            { key: "suspended", label: "Suspended Shops", val: suspendedCount, sub: "Access restricted", icon: UserX, color: "text-rose-500 bg-rose-500/10" }
          ].map(card => {
            const isSelected = statusFilter === card.key;
            const Icon = card.icon;
            return (
              <div
                key={card.key}
                onClick={() => setStatusFilter(card.key)}
                className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between group relative overflow-hidden ${ isSelected ? "bg-slate-950 border-slate-950 text-slate-100 dark:text-white dark:bg-purple-600 dark:border-purple-500 shadow-xs" : "bg-slate-50/70 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700/80" }`}
              >
                <div className="space-y-1 relative z-10 text-left">
                  <span className={`text-[8px] font-black uppercase tracking-widest ${ isSelected ? "text-slate-300 dark:text-purple-100" : "text-slate-400 dark:text-slate-500" }`}>
                    {card.label}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black tracking-tight">{card.val}</span>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-wider block ${ isSelected ? "text-slate-300 dark:text-purple-200" : "text-slate-400 dark:text-slate-500" }`}>
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
              { id: "all", label: "All Merchants" },
              { id: "active", label: "Active" },
              { id: "pending", label: "Pending" },
              { id: "suspended", label: "Suspended" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  statusFilter === tab.id 
                    ? "bg-slate-900 dark:bg-purple-600 text-white shadow-xs" 
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
              placeholder="Search by shop name, owner, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-[11px] bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

      </div>

      {/* Main Merchants Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Merchant Directory */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col space-y-3 min-h-[450px]">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Store size={14} className="text-purple-500" />
              <span>Merchant Directory</span>
            </h2>
            <span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-950 px-2.5 py-1 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 uppercase tracking-widest select-none">
              {filteredSellers.length} Shops Listed
            </span>
          </div>

          {filteredSellers.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40">
              <Store size={28} className="text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-500">No matching merchant accounts found.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredSellers.map((seller) => (
                <div 
                  key={seller._id} 
                  onClick={() => { setSelectedSeller(seller); setCommissionInput(""); }}
                  className={`p-3.5 rounded-xl flex items-center justify-between gap-4 border transition-all duration-200 cursor-pointer ${ selectedSeller?._id === seller._id ? "bg-slate-950 text-white dark:bg-purple-600 dark:border-purple-500 shadow-xs" : "bg-slate-50/60 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700" }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-black text-xs ${selectedSeller?._id === seller._id ? "text-white" : "text-slate-900 dark:text-white"}`}>{seller.shopName}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${ seller.status === "active" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : seller.status === "pending" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" }`}>
                        {seller.status}
                      </span>
                    </div>
                    <p className={`text-[11px] font-medium ${selectedSeller?._id === seller._id ? "text-slate-300 dark:text-purple-100" : "text-slate-500 dark:text-slate-400"}`}>{seller.name} · {seller.email}</p>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-black block ${selectedSeller?._id === seller._id ? "text-white" : "text-slate-900 dark:text-white"}`}>₹{parseFloat(seller.revenue || 0).toLocaleString()}</span>
                    <p className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${selectedSeller?._id === seller._id ? "text-slate-300 dark:text-purple-200" : "text-slate-400 dark:text-slate-500"}`}>Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Panel for Selected Seller */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col space-y-4">
          {selectedSeller ? (
            <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 space-y-1">
                <span className="text-[9px] font-black text-purple-500 uppercase tracking-widest">Merchant Console</span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">{selectedSeller.shopName}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Contact: {selectedSeller.phone || selectedSeller.email}</p>
              </div>

              {/* Status Moderation */}
              <div className="space-y-2 shrink-0">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldAlert size={12} className="text-purple-500" /> Account Controls
                </span>
                <div className="flex flex-col gap-2">
                  {selectedSeller.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(selectedSeller._id, "active")}
                        className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] uppercase tracking-wider font-black transition shadow-xs cursor-pointer active:scale-95"
                      >
                        Approve Shop
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedSeller._id, "suspended")}
                        className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] uppercase tracking-wider font-black transition shadow-xs cursor-pointer active:scale-95"
                      >
                        Decline Shop
                      </button>
                    </div>
                  )}
                  {selectedSeller.status === "active" && (
                    <button
                      onClick={() => handleStatusChange(selectedSeller._id, "suspended")}
                      className="w-full py-2 rounded-lg border border-rose-200 text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40 hover:bg-rose-100 text-[10px] uppercase tracking-wider font-black transition shadow-xs cursor-pointer active:scale-95"
                    >
                      Suspend Merchant Account
                    </button>
                  )}
                  {selectedSeller.status === "suspended" && (
                    <button
                      onClick={() => handleStatusChange(selectedSeller._id, "active")}
                      className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] uppercase tracking-wider font-black transition shadow-xs cursor-pointer active:scale-95"
                    >
                      Re-activate Account
                    </button>
                  )}
                </div>
              </div>

              {/* Commission Configurations */}
              <form onSubmit={handleCommissionUpdate} className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex justify-between items-baseline">
                  <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Award size={12} className="text-purple-500" /> Commission Rate
                  </label>
                  <span className="text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-900/40">{selectedSeller.commissionRate || 10}%</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="New rate %"
                    value={commissionInput}
                    onChange={(e) => setCommissionInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-semibold outline-none transition focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-slate-900 dark:bg-purple-600 text-white rounded-lg text-[10px] uppercase tracking-wider font-black hover:bg-slate-800 transition cursor-pointer shadow-xs active:scale-95"
                  >
                    Update
                  </button>
                </div>
              </form>

              {/* Payout Settlements Requests */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-3">
                <div className="flex justify-between items-baseline">
                  <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <CreditCard size={12} className="text-purple-500" /> Payout Balance
                  </label>
                  <span className="text-sm font-black text-slate-900 dark:text-white">₹{parseFloat(selectedSeller.balance || 0).toLocaleString()}</span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Settlements Ledger</h4>
                  {(!selectedSeller.payoutRequests || selectedSeller.payoutRequests.length === 0) ? (
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center">No payout requests submitted.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedSeller.payoutRequests.map((req) => (
                        <div key={req._id} className="border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 space-y-2 bg-slate-50/50 dark:bg-slate-950/40">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-black text-slate-900 dark:text-white text-xs">₹{req.amount.toLocaleString()}</span>
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${ req.status === "approved" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : req.status === "pending" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" }`}>
                              {req.status}
                            </span>
                          </div>
                          {req.status === "pending" && (
                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => handlePayoutStatus(req._id, "approved")}
                                className="flex-1 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] uppercase tracking-wider font-black transition shadow-xs cursor-pointer active:scale-95"
                              >
                                Approve Payout
                              </button>
                              <button
                                onClick={() => handlePayoutStatus(req._id, "rejected")}
                                className="flex-1 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[9px] uppercase tracking-wider font-black transition shadow-xs cursor-pointer active:scale-95"
                              >
                                Decline
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40">
              <Store className="text-slate-400 dark:text-slate-600" size={28} />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No Merchant Selected</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center max-w-[200px]">Click any merchant in the directory to inspect details & approve payouts.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sellers;
