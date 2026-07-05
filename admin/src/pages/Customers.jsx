import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import { Users, UserX, ShieldCheck, Mail, MapPin, ClipboardList, Info } from "lucide-react";

const Customers = ({ token }) => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchCustomers = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/customers`, { headers: { token } });
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch {
      toast.error("Failed to load customers list");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSelectCustomer = async (cust) => {
    setLoadingDetails(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/customer/${cust._id}`, { headers: { token } });
      if (data.success) {
        setSelectedCustomer(data.user);
        setOrders(data.orders);
      }
    } catch {
      toast.error("Failed to load customer profile details");
    }
    setLoadingDetails(false);
  };

  const handleToggleBlock = async (cust) => {
    const isBlocked = !cust.isBlocked;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/customer/status`,
        { id: cust._id, isBlocked },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        fetchCustomers();
        if (selectedCustomer?._id === cust._id) {
          setSelectedCustomer({ ...selectedCustomer, isBlocked });
        }
      }
    } catch {
      toast.error("Failed to change user access status");
    }
  };

  return (
    <div className="flex flex-col md:h-[calc(100vh-120px)] h-auto space-y-6 animate-fadeIn text-slate-900 dark:text-slate-100 pb-4">
      <div className="flex items-center gap-3 shrink-0">
        <div className="h-10 w-10 bg-orange-500/10 text-orange-500 dark:text-orange-400 rounded-xl flex items-center justify-center border border-orange-500/20 shadow-sm">
          <Users size={20} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 mb-0.5">Audience</p>
          <h1 className="text-xl font-extrabold tracking-tight">Customer Moderation</h1>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
        {/* Customer Directory */}
        <div className="lg:col-span-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex flex-col min-h-0">
          <h2 className="text-sm font-black text-slate-800 dark:text-white tracking-tight shrink-0 mb-4">Registered Customers</h2>
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2">
            {customers.map((cust) => (
              <div
                key={cust._id}
                onClick={() => handleSelectCustomer(cust)}
                className={`p-4 rounded-xl flex items-center justify-between gap-4 border transition duration-200 cursor-pointer ${ selectedCustomer?._id === cust._id ? "bg-slate-900 dark:bg-blue-600/20 border-slate-900 dark:border-blue-600/50 shadow-md scale-[1.01]" : "bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs" }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm ${selectedCustomer?._id === cust._id ? "text-white dark:text-blue-100" : "text-slate-800 dark:text-white"}`}>{cust.name}</span>
                    {cust.isBlocked && (
                      <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border bg-rose-50 text-rose-600 border-rose-200/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
                        Blocked
                      </span>
                    )}
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs ${selectedCustomer?._id === cust._id ? "text-slate-300 dark:text-blue-200" : "text-slate-500 dark:text-slate-400"}`}>
                    <Mail size={12} />
                    <span>{cust.email}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleBlock(cust);
                  }}
                  className={`p-2.5 rounded-xl border transition shadow-xs cursor-pointer active:scale-95 ${ cust.isBlocked ? "border-emerald-200/80 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20" : "border-rose-200/80 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20" }`}
                  title={cust.isBlocked ? "Unblock" : "Block User"}
                >
                  {cust.isBlocked ? <ShieldCheck size={15} /> : <UserX size={15} />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Profile View */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex flex-col min-h-0">
          {loadingDetails ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-[11px] uppercase tracking-wider font-bold animate-pulse">Loading profile metadata...</div>
          ) : selectedCustomer ? (
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-6">
              {/* Profile Card Header */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer Profile</span>
                <h3 className="text-lg font-black text-slate-800 dark:text-white mt-1">{selectedCustomer.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{selectedCustomer.email}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2.5 bg-slate-50 dark:bg-slate-900/40 inline-block px-2 py-1 rounded-lg border border-slate-200/50 dark:border-slate-700">
                  Verification Code: <span className="text-slate-600 dark:text-slate-300 ml-1">{selectedCustomer.deliveryVerificationKey || "None"}</span>
                </p>
              </div>

              {/* Delivery Addresses */}
              <div className="space-y-3 shrink-0">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <MapPin size={12} />
                  <span>Saved Addresses</span>
                </div>
                {(!selectedCustomer.addresses || selectedCustomer.addresses.length === 0) ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic bg-slate-50 dark:bg-slate-900/30 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center">No addresses saved.</p>
                ) : (
                  <div className="space-y-2.5">
                    {selectedCustomer.addresses.map((addr, idx) => (
                      <div key={idx} className="border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-600 transition">
                        <span className="font-bold text-slate-800 dark:text-white">{addr.firstName} {addr.lastName}</span>
                        <p>{addr.street}, {addr.city}, {addr.state}, {addr.country}</p>
                        <p className="text-slate-400 font-medium">{addr.phone}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Orders History */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3 shrink-0 pb-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <ClipboardList size={12} />
                  <span>Purchase History ({orders.length})</span>
                </div>
                {orders.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic bg-slate-50 dark:bg-slate-900/30 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center">No purchases recorded.</p>
                ) : (
                  <div className="space-y-2.5">
                    {orders.map((order) => (
                      <div key={order._id} className="border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 flex justify-between items-center text-xs bg-white dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-600 transition shadow-xs">
                        <div className="space-y-1.5">
                          <span className="font-extrabold text-slate-800 dark:text-white text-sm">#{order._id.slice(-8).toUpperCase()}</span>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-slate-800 dark:text-white text-sm">${order.amount}</span>
                          <span className="block text-[9px] font-bold text-orange-500 dark:text-orange-400 uppercase mt-1 px-1.5 py-0.5 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-md inline-block">{order.orderStatus}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 space-y-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/20">
              <div className="h-14 w-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center shadow-inner">
                <Info className="text-slate-400 dark:text-slate-500" size={24} />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No Customer Selected</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-[200px] leading-relaxed uppercase tracking-wider font-semibold">Select a customer from the directory to view their profile</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Customers;
