import React, { useState, useEffect, useMemo } from "react";
import { DollarSign, ArrowUpRight, TrendingUp, ShieldCheck, CreditCard, RefreshCw, Search, CheckCircle2, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { backendUrl } from "../config";

const Revenue = ({ token, seller, orders = [] }) => {
  const [withdrawing, setWithdrawing] = useState(false);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Derive stats
  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.amount || 0), 0);
  }, [orders]);

  const commissionRate = seller?.commissionRate || 10;
  const netEarnings = totalRevenue * (1 - commissionRate / 100);
  const withdrawableBalance = seller?.balance || 0;

  const fetchPayouts = async () => {
    if (!token) return;
    setIsRefreshing(true);
    try {
      const res = await axios.get(`${backendUrl}/api/seller/payout/requests`, {
        headers: { token }
      });
      if (res.data.success) {
        setPayoutHistory(res.data.payouts || []);
      }
    } catch (err) {
      console.error("Failed to fetch payout requests:", err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, [token]);

  const handleWithdraw = async () => {
    if (withdrawableBalance <= 0) {
      toast.error("No funds available to withdraw");
      return;
    }
    setWithdrawing(true);
    try {
      const res = await axios.post(
        `${backendUrl}/api/seller/payout/request`,
        { amount: withdrawableBalance },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success("Withdrawal request initiated successfully!");
        fetchPayouts();
      } else {
        toast.error(res.data.message || "Failed to submit payout request");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setWithdrawing(false);
    }
  };

  // Filtered payout history
  const filteredPayouts = useMemo(() => {
    return payoutHistory.filter(p => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const idMatch = p._id?.toLowerCase().includes(q);
        const amountMatch = String(p.amount).includes(q);
        return idMatch || amountMatch;
      }
      return true;
    });
  }, [payoutHistory, statusFilter, searchQuery]);

  return (
    <div className="space-y-4 animate-fadeIn text-slate-800 dark:text-slate-100">
      
      {/* ── Single Consolidated Container: Header, Stats & Search Bar ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs space-y-3.5 shrink-0">
        
        {/* Top: Header Row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-emerald-600 dark:bg-emerald-500/10 text-white dark:text-emerald-400 rounded-lg flex items-center justify-center shadow-xs shrink-0">
              <DollarSign size={16} />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Revenue, Earnings & Disbursements</h1>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Access digital ledger, initiate direct payouts, and review commission calculations</p>
            </div>
          </div>

          <button
            onClick={fetchPayouts}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg text-xs font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RefreshCw size={12} className={isRefreshing ? "animate-spin text-emerald-500" : ""} />
            <span>Refresh Ledger</span>
          </button>
        </div>

        {/* Middle: Financial Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Card 1: Gross Sales */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between group relative overflow-hidden">
            <div className="space-y-1 relative z-10 text-left">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Gross Sales Volume
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">₹{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider text-indigo-500 flex items-center gap-1">
                <TrendingUp size={10} /> Inclusive of order shipping
              </span>
            </div>
            <div className="p-2 rounded-lg text-indigo-500 bg-indigo-500/10 transition-transform duration-200 group-hover:scale-105 relative z-10">
              <DollarSign size={16} />
            </div>
          </div>

          {/* Card 2: Net Earnings */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between group relative overflow-hidden">
            <div className="space-y-1 relative z-10 text-left">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Net Merchant Earnings
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">₹{netEarnings.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                After {commissionRate}% commission
              </span>
            </div>
            <div className="p-2 rounded-lg text-emerald-500 bg-emerald-500/10 transition-transform duration-200 group-hover:scale-105 relative z-10">
              <ShieldCheck size={16} />
            </div>
          </div>

          {/* Card 3: Withdrawable Balance & Action */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-950 to-slate-900 text-white flex items-center justify-between group relative overflow-hidden shadow-xs">
            <div className="space-y-1 relative z-10 text-left">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                Available to Withdraw
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black tracking-tight text-orange-400">₹{withdrawableBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <button
                onClick={handleWithdraw}
                disabled={withdrawing || withdrawableBalance <= 0}
                className="mt-1 flex items-center gap-1 px-2.5 py-1 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition active:scale-95 cursor-pointer"
              >
                <span>{withdrawing ? "Processing..." : "Withdraw Funds"}</span>
                <ArrowRight size={10} />
              </button>
            </div>
            <div className="p-2 rounded-lg text-orange-400 bg-orange-500/10 relative z-10">
              <CreditCard size={16} />
            </div>
          </div>

        </div>

      </div>

      {/* Ledger & Payout History Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        
        {/* Payout History Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs space-y-3 min-h-[350px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3">
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Disbursement History</h3>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Track direct deposit requests and processing states</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Filter Pills */}
              <div className="flex items-center gap-1">
                {[
                  { id: "all", label: "All" },
                  { id: "pending", label: "Pending" },
                  { id: "approved", label: "Approved" },
                  { id: "completed", label: "Completed" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider transition cursor-pointer ${
                      statusFilter === tab.id
                        ? "bg-slate-900 dark:bg-emerald-600 text-white"
                        : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative flex items-center">
                <Search size={11} className="absolute left-2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search ref..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-6 pr-2 py-1 text-[10px] bg-slate-50 dark:bg-slate-950 rounded-md text-slate-800 dark:text-white font-semibold outline-none w-28"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredPayouts.length === 0 ? (
              <div className="py-16 text-center text-xs font-semibold text-slate-400 bg-slate-50/50 dark:bg-slate-950/40 rounded-xl">
                No payout records match your filter criteria.
              </div>
            ) : (
              filteredPayouts.map((p, index) => (
                <div
                  key={p._id || index}
                  className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] font-black text-slate-500 bg-slate-100 dark:bg-slate-950 px-1.5 py-0.5 rounded">
                        #{String(p._id || index).slice(-6).toUpperCase()}
                      </span>
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">Direct Bank Transfer</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {p.createdAt ? new Date(p.createdAt).toLocaleString() : "Date pending"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 justify-between sm:justify-end">
                    <span className="font-black text-xs text-slate-900 dark:text-white">₹{(p.amount || 0).toFixed(2)}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                      p.status === "approved" || p.status === "completed" 
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                        : p.status === "rejected" 
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" 
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Commission Detail Info Panel (1 Col) */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="font-black text-xs text-white uppercase tracking-wider">Platform Fee Breakdown</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-1 leading-relaxed">
              CartNOW platform commission funds payment gateway integration, server infrastructure, and end-to-end merchant support.
            </p>
          </div>

          <div className="pt-3 space-y-2 text-xs font-semibold text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Commission Rate:</span>
              <span className="font-black text-white">{commissionRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Processing Fees:</span>
              <span className="font-black text-emerald-400">0% (Waived)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Payout Frequency:</span>
              <span className="font-black text-white">On-demand / Instant</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Revenue;
