import React, { useState, useEffect } from "react";
import { Bell, ShieldCheck, Tag, AlertCircle, Trash2, CheckCheck, Landmark } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { backendUrl } from "../config";

const Notifications = ({ token, products = [], orders = [] }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const generateLogs = async () => {
      setLoading(true);
      const generatedList = [];

      // 1. Low stock products
      products.forEach((p) => {
        if ((p.stock ?? 15) < 10) {
          generatedList.push({
            id: `stock-${p._id}`,
            type: "warning",
            title: "Low Stock Alert",
            msg: `Product "${p.name}" is running low on stock. Only ${p.stock} units left. Please update inventory.`,
            date: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : "Just now",
            isRead: false
          });
        }
      });

      // 2. Incoming and pending orders
      orders.forEach((o) => {
        const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "Recently";
        if (o.orderStatus === "Order Placed") {
          generatedList.push({
            id: `order-new-${o._id}`,
            type: "order",
            title: "New Customer Order",
            msg: `Order #${o._id.slice(-6).toUpperCase()} of ₹${o.amount} has been placed by customer. Action required to Accept or Pack.`,
            date: dateStr,
            isRead: false
          });
        } else if (o.orderStatus === "Out for Delivery") {
          generatedList.push({
            id: `order-transit-${o._id}`,
            type: "transit",
            title: "Order Out for Delivery",
            msg: `Order #${o._id.slice(-6).toUpperCase()} is in transit with courier agent.`,
            date: dateStr,
            isRead: false
          });
        }
      });

      // 3. Payout requests
      if (token) {
        try {
          const res = await axios.get(`${backendUrl}/api/seller/payout/requests`, {
            headers: { token }
          });
          if (res.data.success && res.data.payouts) {
            res.data.payouts.forEach((p, index) => {
              generatedList.push({
                id: `payout-${p._id || index}`,
                type: "payout",
                title: "Payout Request Update",
                msg: `Your request for a withdrawal of ₹${p.amount} is currently ${p.status.toUpperCase()}.`,
                date: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "Recently",
                isRead: false
              });
            });
          }
        } catch (err) {
          console.error("Could not fetch payouts for logs", err);
        }
      }

      setLogs(generatedList);
      setLoading(false);
    };

    generateLogs();
  }, [products, orders, token]);

  const handleMarkAllRead = () => {
    setLogs((prev) => prev.map((l) => ({ ...l, isRead: true })));
    toast.success("All notifications marked as read");
  };

  const handleDeleteLog = (id) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
    toast.success("Notification cleared");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">System Logs</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Track background updates, order placements, stock alarms, and billing logs.
          </p>
        </div>
        {logs.some((l) => !l.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-sm"
          >
            <CheckCheck size={14} />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-semibold">
            Syncing logs feed...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 font-semibold">
            No system notifications active in your feed.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => {
              const getIcon = () => {
                switch (log.type) {
                  case "warning":
                    return <AlertCircle className="text-red-500" size={16} />;
                  case "order":
                    return <Tag className="text-[#FF5100]" size={16} />;
                  case "payout":
                    return <Landmark className="text-emerald-500" size={16} />;
                  default:
                    return <ShieldCheck className="text-indigo-500" size={16} />;
                }
              };

              return (
                <div
                  key={log.id}
                  className={`py-4 flex gap-4 items-start justify-between group ${
                    !log.isRead ? "bg-orange-500/[0.01]" : ""
                  }`}
                >
                  <div className="flex gap-3 items-start">
                    <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                      {getIcon()}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                        {log.title}
                        {!log.isRead && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#FF5100]" />
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 max-w-xl leading-relaxed">{log.msg}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{log.date}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 transition cursor-pointer"
                    title="Clear notification"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
