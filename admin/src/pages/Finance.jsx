import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import { 
  DollarSign, ShieldAlert, Award, TrendingUp, Settings, ListCollapse, AlertOctagon, RefreshCw, Search, Calendar, Filter, CheckCircle2, RotateCcw
} from "lucide-react";

const Finance = ({ token }) => {
  const [finance, setFinance] = useState({ commissionPercentage: 10, totalPlatformEarnings: 0 });
  const [orders, setOrders] = useState([]);
  const [commissionInput, setCommissionInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchFinanceData = async () => {
    setIsRefreshing(true);
    try {
      const [finRes, orderRes] = await Promise.all([
        axios.get(`${backendUrl}/api/admin/finance`, { headers: { token } }),
        axios.get(`${backendUrl}/api/admin/orders`, { headers: { token } })
      ]);
      if (finRes.data.success) {
        setFinance(finRes.data.settings);
      }
      if (orderRes.data.success) {
        setOrders(orderRes.data.orders);
      }
    } catch {
      toast.error("Failed to load financial records");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const handleUpdatePercentage = async (e) => {
    e.preventDefault();
    const rate = parseFloat(commissionInput);
    if (isNaN(rate) || rate < 0 || rate > 100) return toast.error("Enter a valid percentage rate");
    
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/finance/update`,
        { commissionPercentage: rate },
        { headers: { token } }
      );
      if (data.success) {
        toast.success("Platform commission updated successfully!");
        setFinance(data.settings);
        setCommissionInput("");
      }
    } catch {
      toast.error("Failed to update platform settings");
    } finally {
      setLoading(false);
    }
  };

  // Filter transactions reactively
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // Status filter
      if (statusFilter !== "all") {
        const s = (o.paymentStatus || "").toLowerCase();
        if (statusFilter === "paid" && s !== "paid" && s !== "success") return false;
        if (statusFilter === "pending" && s !== "pending" && s !== "unpaid") return false;
        if (statusFilter === "refunded" && s !== "refunded") return false;
      }

      // Search Query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const inId = o._id?.toLowerCase().includes(q);
        const inMethod = o.paymentMethod?.toLowerCase().includes(q);
        const inStatus = o.paymentStatus?.toLowerCase().includes(q);
        const inAmount = String(o.amount).includes(q);
        return inId || inMethod || inStatus || inAmount;
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  // Derived financial analytics
  const totalTransactionsCount = orders.length;
  const totalTransactionsVolume = orders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
  const platformRevenue = (totalTransactionsVolume * ((finance.commissionPercentage || 10) / 100));
  const refundedPayments = orders.filter((o) => (o.paymentStatus || "").toLowerCase() === "refunded");
  const paidCount = orders.filter((o) => (o.paymentStatus || "").toLowerCase() === "paid" || (o.paymentStatus || "").toLowerCase() === "success").length;

  return (
    <div className="space-y-4 animate-fadeIn text-slate-800 dark:text-slate-100">
      
      {/* ── Single Consolidated Container: Header, Treasury Stats & Filter Bar ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs space-y-3.5 shrink-0">
        
        {/* Top: Header Row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-emerald-600 dark:bg-emerald-500/10 text-white dark:text-emerald-400 rounded-lg flex items-center justify-center border border-emerald-500/10 shadow-xs shrink-0">
              <DollarSign size={16} />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Treasury & Finance Hub</h1>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Platform commission, settlement audits, and financial ledgers</p>
            </div>
          </div>

          <button
            onClick={fetchFinanceData}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg text-xs font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RefreshCw size={12} className={isRefreshing ? "animate-spin text-emerald-500" : ""} />
            <span>Refresh Ledger</span>
          </button>
        </div>

        {/* Middle: Financial Analytics KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { key: "revenue", label: "Est. Platform Revenue", val: `₹${platformRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, sub: `${finance.commissionPercentage}% Commission`, icon: TrendingUp, color: "text-emerald-500 bg-emerald-500/10" },
            { key: "volume", label: "Audited Transaction Vol.", val: `₹${totalTransactionsVolume.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, sub: `${totalTransactionsCount} Orders Logged`, icon: Award, color: "text-blue-500 bg-blue-500/10" },
            { key: "paid", label: "Settled Payments", val: paidCount, sub: "Successfully paid", icon: CheckCircle2, color: "text-indigo-500 bg-indigo-500/10" },
            { key: "refunds", label: "Refunds Issued", val: refundedPayments.length, sub: "Returned transactions", icon: RotateCcw, color: "text-rose-500 bg-rose-500/10" }
          ].map(card => {
            const Icon = card.icon;
            return (
              <div
                key={card.key}
                className="p-3 rounded-xl border bg-slate-50/70 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800 flex items-center justify-between group relative overflow-hidden"
              >
                <div className="space-y-1 relative z-10 text-left">
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {card.label}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{card.val}</span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
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
          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-1">
            {[
              { id: "all", label: "All Settlements" },
              { id: "paid", label: "Paid" },
              { id: "pending", label: "Pending" },
              { id: "refunded", label: "Refunded" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  statusFilter === tab.id 
                    ? "bg-slate-900 dark:bg-emerald-600 text-white shadow-xs" 
                    : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative flex items-center w-full sm:w-80 shrink-0">
            <Search size={13} className="absolute left-3 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search ID, method, status, amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-[11px] bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

      </div>

      {/* Main Ledger Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Settings Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-4 shrink-0 h-fit">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Settings size={15} className="text-emerald-500" />
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Commission Settings</h2>
          </div>

          <form onSubmit={handleUpdatePercentage} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Platform Commission Fee (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder={`Current: ${finance.commissionPercentage}%`}
                value={commissionInput}
                onChange={(e) => setCommissionInput(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-semibold outline-none transition focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-slate-400 font-medium leading-normal mt-1">
                Standard percentage automatically deducted from total sales on merchant payouts.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase tracking-wider transition shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Updating..." : "Save Commission Rate"}
            </button>
          </form>
        </div>

        {/* Transactions Ledger Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-xs font-black text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-2">
              <ListCollapse size={14} className="text-emerald-500" />
              <span>Financial Settlement Ledger</span>
            </h2>
            <span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-950 px-2.5 py-1 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 uppercase tracking-widest select-none">
              {filteredOrders.length} Records Listed
            </span>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40">
              <ListCollapse size={24} className="text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-500">No matching financial records found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto min-w-0">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none">
                    <th className="py-3 pr-4">Order Ref ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 pl-4 text-right">Order Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold">
                  {filteredOrders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-3.5 pr-4 font-mono font-bold text-slate-900 dark:text-white uppercase select-all">
                        #{ord._id.slice(-8)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                        {new Date(ord.createdAt).toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" })}
                      </td>
                      <td className="py-3.5 px-4 uppercase text-slate-600 dark:text-slate-300 font-black text-[10px] tracking-wider">
                        {ord.paymentMethod}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${
                          ord.paymentStatus === "success" || ord.paymentStatus === "Paid" || ord.paymentStatus === "paid" 
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                            : ord.paymentStatus === "Refunded" || ord.paymentStatus === "refunded"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" 
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        }`}>
                          {ord.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 pl-4 text-right font-black text-slate-900 dark:text-white">
                        ₹{parseFloat(ord.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Finance;
