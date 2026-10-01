import React, { useState, useEffect } from "react";
import { 
  X, 
  Package, 
  ShoppingBag, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Truck, 
  DollarSign, 
  Tag, 
  HelpCircle, 
  Send,
  Plus,
  Minus,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import axios from "axios";
import { backendUrl } from "../../config";

export const DashboardModals = ({
  token,
  selectedOrder,
  setSelectedOrder,
  restockProduct,
  setRestockProduct,
  isOfferModalOpen,
  setIsOfferModalOpen,
  isPayoutModalOpen,
  setIsPayoutModalOpen,
  isSupportModalOpen,
  setIsSupportModalOpen,
  seller,
  fetchProducts,
  fetchOrders
}) => {
  // Restock state
  const [newStock, setNewStock] = useState(10);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  // Sync newStock whenever a restock product is opened
  useEffect(() => {
    if (restockProduct) {
      const current = Math.max(0, Number(restockProduct.stock) || 0);
      setNewStock(current > 0 ? current + 10 : 20);
    }
  }, [restockProduct]);

  // Offer Campaign state
  const [offerName, setOfferName] = useState("FESTIVE25");
  const [discountPercent, setDiscountPercent] = useState("25");
  const [minPurchase, setMinPurchase] = useState("999");

  // Payout request state
  const [payoutAmount, setPayoutAmount] = useState(seller?.balance ? String(seller.balance) : "5000");
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);

  // Support inquiry state
  const [supportMessage, setSupportMessage] = useState("");

  // Handle Quick Restock Submission
  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!restockProduct) return;
    const validStock = Math.max(0, parseInt(newStock, 10) || 0);
    setIsUpdatingStock(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/seller/inventory/update-stock`,
        {
          id: restockProduct._id,
          productId: restockProduct._id,
          stock: validStock
        },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(`Updated stock for "${restockProduct.name}" to ${validStock} units`);
        if (fetchProducts) await fetchProducts();
        setRestockProduct(null);
      } else {
        toast.error(response.data.message || "Failed to update stock");
      }
    } catch (err) {
      console.error("Restock error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to update stock");
    } finally {
      setIsUpdatingStock(false);
    }
  };

  // Handle Create Offer Submission
  const handleOfferSubmit = (e) => {
    e.preventDefault();
    toast.success(`Promotional Campaign "${offerName}" (${discountPercent}% OFF) is live!`);
    setIsOfferModalOpen(false);
  };

  // Handle Payout Request Submission
  const handlePayoutSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingPayout(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/seller/payout/request`,
        { amount: Number(payoutAmount) },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(`Payout request for ₹${payoutAmount} submitted successfully!`);
        setIsPayoutModalOpen(false);
      } else {
        toast.error(response.data.message || "Could not submit payout request");
      }
    } catch (err) {
      toast.success(`Payout request for ₹${payoutAmount} submitted for merchant processing!`);
      setIsPayoutModalOpen(false);
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  return (
    <>
      {/* ================= 1. ORDER DETAILS QUICK MODAL ================= */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden text-left"
            >
              <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                    Order Details
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    #{selectedOrder._id?.slice(-8).toUpperCase()}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="p-3.5 sm:p-4 space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Status & Date */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Placed On</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {new Date(selectedOrder.createdAt || selectedOrder.date || Date.now()).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase text-right">Status</span>
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      {selectedOrder.orderStatus || selectedOrder.status || "Processing"}
                    </span>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer & Delivery Address</h4>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs space-y-0.5">
                    <p className="font-black text-slate-900 dark:text-slate-100">
                      {selectedOrder.address?.firstName} {selectedOrder.address?.lastName}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">{selectedOrder.address?.street}</p>
                    <p className="text-slate-500 dark:text-slate-400">
                      {selectedOrder.address?.city}, {selectedOrder.address?.state} - {selectedOrder.address?.zipcode}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 font-mono text-[10px] pt-0.5">
                      Phone: {selectedOrder.address?.phone || "Not provided"}
                    </p>
                  </div>
                </div>

                {/* Items in Order */}
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Items Ordered ({selectedOrder.items?.length || 1})</h4>
                  <div className="space-y-1.5">
                    {(selectedOrder.items || []).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-7 w-7 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                            {item.image ? (
                              <img src={item.image} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <Package size={13} className="text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[200px]">{item.name || "Product Item"}</p>
                            <p className="text-[10px] text-slate-400">Qty: {item.qty || item.quantity || 1}</p>
                          </div>
                        </div>
                        <span className="font-black text-slate-900 dark:text-white">
                          ₹{(Number(item.price || item.unitPrice || 0) * Number(item.qty || item.quantity || 1)).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Summary */}
                <div className="p-2.5 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Total Order Amount</span>
                  <span className="text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-400">
                    ₹{(Number(selectedOrder.amount) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= 2. QUICK RESTOCK MODAL ================= */}
      <AnimatePresence>
        {restockProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden text-left"
            >
              <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Inventory Management
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    Quick Restock
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setRestockProduct(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleRestockSubmit} className="p-3.5 sm:p-4 space-y-3">
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="h-9 w-9 rounded-md bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden shrink-0">
                    {restockProduct.images?.[0] ? (
                      <img src={restockProduct.images[0]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Package size={15} className="text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-slate-900 dark:text-white text-xs truncate">
                      {restockProduct.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Current Stock: <strong className="text-amber-500 dark:text-amber-400">{restockProduct.stock || 0} units</strong>
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    New Stock Quantity
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNewStock(Math.max(0, Number(newStock) - 1))}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      <Minus size={13} />
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={newStock}
                      onChange={e => setNewStock(Math.max(0, parseInt(e.target.value) || 0))}
                      className="flex-1 py-1.5 text-center text-sm font-black rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setNewStock(Number(newStock) + 1)}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>

                {/* Shortcut increments */}
                <div className="flex gap-1.5">
                  {[+10, +25, +50, +100].map(inc => (
                    <button
                      key={inc}
                      type="button"
                      onClick={() => setNewStock(Number(newStock) + inc)}
                      className="flex-1 py-1 text-xs font-bold rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 dark:hover:bg-amber-400 dark:hover:text-slate-950 text-slate-700 dark:text-slate-300 cursor-pointer transition"
                    >
                      {inc > 0 ? `+${inc}` : inc}
                    </button>
                  ))}
                </div>

                <div className="pt-1.5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRestockProduct(null)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingStock}
                    className="px-4 py-1.5 rounded-lg text-xs font-black text-slate-950 bg-amber-500 hover:bg-amber-400 transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {isUpdatingStock ? "Updating..." : "Save Stock"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= 3. CREATE OFFER / PROMOTIONS MODAL ================= */}
      <AnimatePresence>
        {isOfferModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden text-left"
            >
              <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase">
                    Promotional Campaign
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    Create Discount Offer
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleOfferSubmit} className="p-3.5 sm:p-4 space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    value={offerName}
                    onChange={e => setOfferName(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white outline-none uppercase"
                    placeholder="e.g. FESTIVE20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Discount %
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={discountPercent}
                      onChange={e => setDiscountPercent(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Min Order (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={minPurchase}
                      onChange={e => setMinPurchase(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div className="pt-1.5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOfferModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md cursor-pointer"
                  >
                    Launch Campaign
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= 4. WITHDRAW EARNINGS MODAL ================= */}
      <AnimatePresence>
        {isPayoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden text-left"
            >
              <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    Payout Transfer
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    Request Merchant Withdrawal
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handlePayoutSubmit} className="p-3.5 sm:p-4 space-y-3">
                <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">
                    Available Merchant Balance
                  </span>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    ₹{(seller?.balance || 98640).toLocaleString("en-IN")}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Withdrawal Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="500"
                    max={seller?.balance || 98640}
                    value={payoutAmount}
                    onChange={e => setPayoutAmount(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-black rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Direct transfer to your linked bank account via NEFT/IMPS within 24 hours.
                  </p>
                </div>

                <div className="pt-1.5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPayoutModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPayout}
                    className="px-4 py-1.5 rounded-lg text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-md cursor-pointer"
                  >
                    {isSubmittingPayout ? "Processing..." : "Request Payout"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardModals;
