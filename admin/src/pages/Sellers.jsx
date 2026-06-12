import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import { Store, ShieldAlert, Award, CreditCard, CheckCircle, AlertOctagon, Edit3 } from "lucide-react";

const Sellers = ({ token }) => {
  const [sellers, setSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [commissionInput, setCommissionInput] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchSellers = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/sellers`, { headers: { token } });
      if (data.success) {
        setSellers(data.sellers);
      }
    } catch {
      toast.error("Failed to fetch sellers");
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
        // refresh selected seller view
        const updated = data.seller;
        setSelectedSeller(updated);
      }
    } catch {
      toast.error("Failed to process payout");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] space-y-6 animate-fadeIn text-slate-900 dark:text-slate-100">
      <div className="flex items-center gap-3 shrink-0">
        <div className="h-10 w-10 bg-orange-500/10 text-orange-500 dark:text-orange-400 rounded-xl flex items-center justify-center border border-orange-500/20 shadow-sm">
          <Store size={20} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 mb-0.5">Partnerships</p>
          <h1 className="text-xl font-extrabold tracking-tight">Seller Management</h1>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
        {/* Sellers Directory */}
        <div className="lg:col-span-2 bg-white/90 dark:bg-[#151b26]/90 backdrop-blur-xs border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex flex-col min-h-0">
          <h2 className="text-sm font-black text-slate-800 dark:text-white tracking-tight shrink-0 mb-4">Active & Pending Merchants</h2>
          
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2">
            {sellers.map((seller) => (
              <div 
                key={seller._id} 
                onClick={() => { setSelectedSeller(seller); setCommissionInput(""); }}
                className={`p-4 rounded-xl flex items-center justify-between gap-4 border transition duration-200 cursor-pointer ${
                  selectedSeller?._id === seller._id 
                    ? "bg-slate-900 dark:bg-blue-600/20 border-slate-900 dark:border-blue-600/50 shadow-md scale-[1.01]" 
                    : "bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm ${selectedSeller?._id === seller._id ? "text-white dark:text-blue-100" : "text-slate-800 dark:text-white"}`}>{seller.shopName}</span>
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${
                      seller.status === "active" 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" 
                        : seller.status === "pending"
                          ? "bg-amber-50 text-amber-600 border-amber-200/50 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                          : "bg-rose-50 text-rose-600 border-rose-200/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                    }`}>
                      {seller.status}
                    </span>
                  </div>
                  <p className={`text-xs ${selectedSeller?._id === seller._id ? "text-slate-300 dark:text-blue-200" : "text-slate-500 dark:text-slate-400"}`}>{seller.name} · {seller.email}</p>
                </div>

                <div className="text-right">
                  <span className={`text-sm font-black ${selectedSeller?._id === seller._id ? "text-white dark:text-blue-100" : "text-slate-900 dark:text-white"}`}>${parseFloat(seller.revenue || 0).toFixed(2)}</span>
                  <p className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${selectedSeller?._id === seller._id ? "text-slate-400 dark:text-blue-300" : "text-slate-400 dark:text-slate-500"}`}>Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Panel for Selected Seller */}
        <div className="bg-white/90 dark:bg-[#151b26]/90 backdrop-blur-xs border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex flex-col min-h-0">
          {selectedSeller ? (
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Merchant Console</span>
                <h3 className="text-lg font-black text-slate-800 dark:text-white mt-1">{selectedSeller.shopName}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Contact: {selectedSeller.phone}</p>
              </div>

              {/* Status Moderation */}
              <div className="space-y-3 shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert size={12} /> Moderation Controls
                </span>
                <div className="flex flex-col gap-2.5">
                  {selectedSeller.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(selectedSeller._id, "active")}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] uppercase tracking-wider font-bold transition shadow-xs cursor-pointer active:scale-95"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedSeller._id, "suspended")}
                        className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[11px] uppercase tracking-wider font-bold transition shadow-xs cursor-pointer active:scale-95"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {selectedSeller.status === "active" && (
                    <button
                      onClick={() => handleStatusChange(selectedSeller._id, "suspended")}
                      className="w-full py-2.5 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] uppercase tracking-wider font-bold transition shadow-xs cursor-pointer active:scale-95"
                    >
                      Suspend Merchant Account
                    </button>
                  )}
                  {selectedSeller.status === "suspended" && (
                    <button
                      onClick={() => handleStatusChange(selectedSeller._id, "active")}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] uppercase tracking-wider font-bold transition shadow-xs cursor-pointer active:scale-95"
                    >
                      Re-activate Account
                    </button>
                  )}
                </div>
              </div>

              {/* Commission Configurations */}
              <form onSubmit={handleCommissionUpdate} className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-5 shrink-0">
                <div className="flex justify-between items-baseline">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Award size={12} /> Commission Rate
                  </label>
                  <span className="text-sm font-extrabold text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-100 dark:border-orange-500/20">{selectedSeller.commissionRate}%</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="New rate"
                    value={commissionInput}
                    onChange={(e) => setCommissionInput(e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1220] text-slate-800 dark:text-white text-xs font-semibold outline-none focus:border-orange-500 dark:focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-slate-900 dark:bg-slate-800 text-white dark:text-white rounded-xl text-[11px] uppercase tracking-wider font-bold hover:bg-slate-800 dark:hover:bg-slate-700 transition cursor-pointer shadow-xs active:scale-95"
                  >
                    Update
                  </button>
                </div>
              </form>

              {/* Payout Settlements Requests */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-4 shrink-0 pb-4">
                <div className="flex justify-between items-baseline">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <CreditCard size={12} /> Payout Balance
                  </label>
                  <span className="text-base font-black text-slate-800 dark:text-white">${parseFloat(selectedSeller.balance || 0).toFixed(2)}</span>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Settlements Ledger</h4>
                  {(!selectedSeller.payoutRequests || selectedSeller.payoutRequests.length === 0) ? (
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic bg-slate-50 dark:bg-slate-900/30 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center">No payout requests submitted.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {selectedSeller.payoutRequests.map((req) => (
                        <div key={req._id} className="border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 space-y-3 hover:border-slate-300 dark:hover:border-slate-600 transition bg-white dark:bg-slate-800/30 shadow-xs">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-extrabold text-slate-800 dark:text-white text-sm">${req.amount.toFixed(2)}</span>
                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${
                              req.status === "approved" 
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" 
                                : req.status === "pending"
                                  ? "bg-amber-50 text-amber-600 border-amber-200/50 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                                  : "bg-rose-50 text-rose-600 border-rose-200/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                            }`}>
                              {req.status}
                            </span>
                          </div>
                          {req.status === "pending" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handlePayoutStatus(req._id, "approved")}
                                className="flex-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] uppercase tracking-wider font-bold transition shadow-xs cursor-pointer active:scale-95"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handlePayoutStatus(req._id, "rejected")}
                                className="flex-1 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-[10px] uppercase tracking-wider font-bold transition shadow-xs cursor-pointer active:scale-95"
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
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 space-y-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/20">
              <div className="h-14 w-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center shadow-inner">
                <Store className="text-slate-400 dark:text-slate-500" size={24} />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No Merchant Selected</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-[200px] leading-relaxed uppercase tracking-wider font-semibold">Select a merchant from the directory to manage their account</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sellers;
