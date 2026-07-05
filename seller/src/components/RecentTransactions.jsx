import React from "react";
import { ArrowRight } from "lucide-react";

const RecentTransactions = ({
  orders,
  navigate
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight">Recent Transactions</h3>
        <button
          onClick={() => navigate("/orders")}
          className="text-[10px] font-black uppercase text-brand hover:text-orange-600 transition flex items-center gap-1 cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight size={12} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs min-w-[500px]">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">
              <th className="py-3 px-3">Order Ref</th>
              <th className="py-3 px-3">Recipient</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Total Payout</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-xs text-slate-400 font-semibold">
                  No customer transactions logged.
                </td>
              </tr>
            ) : (
              orders.slice(0, 5).map((order) => (
                <tr key={order._id} className="border-b border-slate-50 text-slate-700 hover:bg-slate-50/40 transition duration-150">
                  <td className="py-3 px-3 font-mono text-[10px] text-slate-400 font-bold">#{order._id.slice(-8).toUpperCase()}</td>
                  <td className="py-3 px-3 font-black text-slate-900 dark:text-slate-100">{order.address?.firstName} {order.address?.lastName}</td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${ order.orderStatus === "Delivered" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : order.orderStatus === "Cancelled" ? "bg-red-500/10 border-red-500/20 text-red-600" : "bg-amber-500/10 border-amber-500/20 text-amber-600" }`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-black text-slate-900 dark:text-slate-100">₹{order.amount?.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTransactions;
