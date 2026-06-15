import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import { DollarSign, ShieldAlert, Award, TrendingUp, Settings, ListCollapse, AlertOctagon } from "lucide-react";

const Finance = ({ token }) => {
  const [finance, setFinance] = useState({ commissionPercentage: 10, totalPlatformEarnings: 0 });
  const [orders, setOrders] = useState([]);
  const [commissionInput, setCommissionInput] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchFinanceData = async () => {
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
    }
    setLoading(false);
  };

  // derived values
  const totalTransactionsCount = orders.length;
  const totalTransactionsVolume = orders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
  const platformRevenue = (totalTransactionsVolume * (finance.commissionPercentage / 100));

  const failedPayments = orders.filter((o) => o.paymentStatus === "failed");
  const refundedPayments = orders.filter((o) => o.paymentStatus === "Refunded");

  return (
    <div className="flex flex-col md:h-[calc(100vh-120px)] h-auto space-y-6 animate-fadeIn text-slate-900 dark:text-slate-100 pb-4">
      <div className="flex items-center gap-3 shrink-0">
        <div className="h-10 w-10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/20 shadow-sm">
          <DollarSign size={20} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-0.5">Treasury</p>
          <h1 className="text-xl font-extrabold tracking-tight">Finance & Commission</h1>
        </div>
      </div>

      {/* Finance Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
        <div className="bg-slate-900 text-white dark:bg-blue-600 border border-slate-800 dark:border-blue-500/50 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 dark:text-blue-200 uppercase tracking-wider block">Estimated Platform Commission</span>
          <h3 className="text-2xl font-black">${platformRevenue.toFixed(2)}</h3>
          <span className="text-[9px] text-emerald-400 dark:text-emerald-300 font-bold block uppercase tracking-wider">Based on {finance.commissionPercentage}% Rate</span>
        </div>

        <div className="bg-white dark:bg-[#151b26] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Volume Audited</span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">${totalTransactionsVolume.toFixed(2)}</h3>
          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wider">{totalTransactionsCount} Settlements processed</span>
        </div>

        <div className="bg-white dark:bg-[#151b26] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Refunds Issued</span>
          <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400">{refundedPayments.length}</h3>
          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wider">Completed adjustments</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
        {/* Settings Panel */}
        <div className="bg-white/90 dark:bg-[#151b26]/90 backdrop-blur-xs border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-5 shrink-0 h-fit">
          <h2 className="text-sm font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <Settings size={14} className="text-slate-400" />
            <span>Platform Settings</span>
          </h2>

          <form onSubmit={handleUpdatePercentage} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Default Commission Percentage (%)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder={`Current: ${finance.commissionPercentage}%`}
                value={commissionInput}
                onChange={(e) => setCommissionInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1220] text-slate-800 dark:text-white text-xs font-semibold outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-slate-900 dark:bg-slate-800 text-white dark:text-white rounded-xl text-[11px] font-black uppercase tracking-wider transition shadow-sm hover:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Updating..." : "Save Settings"}
            </button>
          </form>
        </div>

        {/* Transactions ledger */}
        <div className="lg:col-span-2 bg-white/90 dark:bg-[#151b26]/90 backdrop-blur-xs border border-slate-200/80 dark:border-slate-800/80 rounded-2xl flex flex-col shadow-sm min-h-0">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
            <h2 className="text-sm font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
              <ListCollapse size={14} className="text-slate-400" />
              <span>Financial Transaction Logs</span>
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
            {orders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/20 p-8">
                <ListCollapse size={24} className="text-slate-300 dark:text-slate-600" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">No transaction records logged.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-white/95 dark:bg-[#151b26]/95 backdrop-blur z-10 shadow-sm border-b border-slate-200 dark:border-slate-800">
                    <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-2">Transaction ID</th>
                      <th className="py-3 px-2">Date</th>
                      <th className="py-3 px-2">Payment Method</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {orders.map((ord) => (
                      <tr key={ord._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition group">
                        <td className="py-3.5 px-2 font-bold text-slate-800 dark:text-white uppercase">#{ord._id.slice(-8)}</td>
                        <td className="py-3.5 px-2 text-slate-500 dark:text-slate-400 font-medium">{new Date(ord.createdAt).toLocaleDateString()}</td>
                        <td className="py-3.5 px-2 uppercase text-slate-600 dark:text-slate-300 font-bold text-[10px] tracking-wider">{ord.paymentMethod}</td>
                        <td className="py-3.5 px-2">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${
                            ord.paymentStatus === "success" || ord.paymentStatus === "Paid"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                              : ord.paymentStatus === "Refunded"
                                ? "bg-blue-50 text-blue-600 border-blue-200/50 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                                : "bg-amber-50 text-amber-600 border-amber-200/50 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                          }`}>
                            {ord.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-right font-black text-slate-900 dark:text-white">${parseFloat(ord.amount || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finance;
