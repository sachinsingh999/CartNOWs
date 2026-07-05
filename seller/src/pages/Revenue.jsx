import React, { useState, useEffect } from "react";
import { DollarSign, ArrowUpRight, TrendingUp, ShieldCheck, CreditCard, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { backendUrl } from "../config";

const Revenue = ({ token, seller, orders = [] }) => {
  const [withdrawing, setWithdrawing] = useState(false);
  const [payoutHistory, setPayoutHistory] = useState([]);

  // Derive stats
  const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const commissionRate = seller?.commissionRate || 10;
  const netEarnings = totalRevenue * (1 - commissionRate / 100);
  const withdrawableBalance = seller?.balance || 0;

  const fetchPayouts = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${backendUrl}/api/seller/payout/requests`, {
        headers: { token }
      });
      if (res.data.success) {
        setPayoutHistory(res.data.payouts || []);
      }
    } catch (err) {
      console.error("Failed to fetch payout requests:", err.message);
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Revenue & Payouts</h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          Access your digital ledger, initiate direct bank deposits, and track platform commission fees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Gross */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Gross Sales Volume</p>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">₹{totalRevenue.toFixed(2)}</p>
            </div>
            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[10px] text-indigo-600 font-bold border-t border-slate-50 pt-3">
            <TrendingUp size={12} />
            <span>Inclusive of consumer shipment rates</span>
          </div>
        </div>

        {/* Net Earnings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Net Merchant Earnings</p>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">₹{netEarnings.toFixed(2)}</p>
            </div>
            <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="mt-4 text-[10px] text-slate-400 font-semibold border-t border-slate-50 pt-3">
            After CartNOW's standard {commissionRate}% commission
          </div>
        </div>

        {/* Withdrawable Balance */}
        <div className="bg-gradient-to-br from-slate-950 to-slate-900 text-slate-100 dark:text-white rounded-2xl p-5 shadow-md border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Available to Withdraw</p>
              <p className="text-2xl font-black text-orange-400 mt-1">₹{withdrawableBalance.toFixed(2)}</p>
            </div>
            <div className="h-10 w-10 bg-white/10 text-slate-100 dark:text-white rounded-xl flex items-center justify-center border border-white/10">
              <CreditCard size={18} />
            </div>
          </div>
          <button
            onClick={handleWithdraw}
            disabled={withdrawing || withdrawableBalance <= 0}
            className="w-full bg-brand hover:bg-brand-hover disabled:bg-slate-800 disabled:text-slate-500 text-slate-100 dark:text-white rounded-xl py-2 text-xs font-black uppercase tracking-wider transition active:scale-98 shadow-sm cursor-pointer mt-4"
          >
            {withdrawing ? "Initiating Deposit..." : "Withdraw Funds"}
          </button>
        </div>
      </div>

      {/* Ledger & Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Payout History */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-black text-sm text-slate-900 dark:text-slate-100">Payout History</h3>
          <div className="space-y-3">
            {payoutHistory.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center italic">No payout requests submitted yet.</p>
            ) : (
              payoutHistory.map((p, index) => (
                <div
                  key={p._id || index}
                  className="border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-200 transition text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        #{String(p._id || index).slice(-6).toUpperCase()}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">Direct Bank Transfer</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {p.createdAt ? new Date(p.createdAt).toLocaleString() : "Date pending"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-black text-slate-900 dark:text-slate-100">₹{(p.amount || 0).toFixed(2)}</span>
                    <span className={`border rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${ p.status === "approved" || p.status === "completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : p.status === "rejected" ? "bg-red-50 text-red-600 border-red-100" : "bg-amber-50 text-amber-600 border-amber-100" }`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Commission Detail Info Panel */}
        <div className="bg-slate-900 text-slate-100 dark:text-white rounded-3xl p-6 shadow-sm border border-slate-800 space-y-4">
          <h3 className="font-black text-sm text-slate-100 dark:text-white">Fee Breakdown</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            CartNOW uses a segmented commission model to fund payment processors, customer service, and server architecture operations.
          </p>
          <div className="border-t border-slate-800 pt-4 space-y-2.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span>Your Rate:</span>
              <span className="font-bold text-slate-100 dark:text-white">{commissionRate}%</span>
            </div>
            <div className="flex justify-between">
              <span>Processing Fees:</span>
              <span className="font-bold text-slate-100 dark:text-white">0% (Waived)</span>
            </div>
            <div className="flex justify-between">
              <span>Payout Schedule:</span>
              <span className="font-bold text-slate-100 dark:text-white">Bi-weekly</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Revenue;
