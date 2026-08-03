import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import { 
  Users, UserX, ShieldCheck, Mail, MapPin, ClipboardList, Info, RefreshCw, Search, CheckCircle2, AlertOctagon, User, Phone, Key
} from "lucide-react";

const Customers = ({ token }) => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchCustomers = async () => {
    setIsRefreshing(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/customers`, { headers: { token } });
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch {
      toast.error("Failed to load customers list");
    } finally {
      setIsRefreshing(false);
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
    } finally {
      setLoadingDetails(false);
    }
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

  // Filter customers reactively
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      // Status filter
      if (statusFilter === "active" && c.isBlocked) return false;
      if (statusFilter === "blocked" && !c.isBlocked) return false;

      // Search Query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const inName = c.name?.toLowerCase().includes(q);
        const inEmail = c.email?.toLowerCase().includes(q);
        const inKey = c.deliveryVerificationKey?.toLowerCase().includes(q);
        const inId = c._id?.toLowerCase().includes(q);
        return inName || inEmail || inKey || inId;
      }

      return true;
    });
  }, [customers, statusFilter, searchQuery]);

  // Derived statistics
  const totalCount = customers.length;
  const activeCount = customers.filter(c => !c.isBlocked).length;
  const blockedCount = customers.filter(c => c.isBlocked).length;

  return (
    <div className="space-y-4 animate-fadeIn text-slate-800 dark:text-slate-100">
      
      {/* ── Single Consolidated Container: Header, Stats & Search Bar ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs space-y-3.5 shrink-0">
        
        {/* Top: Header Row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-orange-500 dark:bg-orange-500/10 text-white dark:text-orange-400 rounded-lg flex items-center justify-center border border-orange-500/10 shadow-xs shrink-0">
              <Users size={16} />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Customer Moderation & Accounts</h1>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Manage registered platform accounts, access permissions, and purchase histories</p>
            </div>
          </div>

          <button
            onClick={fetchCustomers}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg text-xs font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RefreshCw size={12} className={isRefreshing ? "animate-spin text-orange-500" : ""} />
            <span>Refresh Directory</span>
          </button>
        </div>

        {/* Middle: Audience Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { key: "all", label: "Total Customers", val: totalCount, sub: "Registered platform users", icon: Users, color: "text-blue-500 bg-blue-500/10" },
            { key: "active", label: "Active Accounts", val: activeCount, sub: "Permitted storefront access", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10" },
            { key: "blocked", label: "Blocked Accounts", val: blockedCount, sub: "Access suspended", icon: UserX, color: "text-rose-500 bg-rose-500/10" }
          ].map(card => {
            const isSelected = statusFilter === card.key;
            const Icon = card.icon;
            return (
              <div
                key={card.key}
                onClick={() => setStatusFilter(card.key)}
                className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between group relative overflow-hidden ${ isSelected ? "bg-slate-950 border-slate-950 text-slate-100 dark:text-white dark:bg-orange-600 dark:border-orange-500 shadow-xs" : "bg-slate-50/70 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700/80" }`}
              >
                <div className="space-y-1 relative z-10 text-left">
                  <span className={`text-[8px] font-black uppercase tracking-widest ${ isSelected ? "text-slate-300 dark:text-orange-100" : "text-slate-400 dark:text-slate-500" }`}>
                    {card.label}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black tracking-tight">{card.val}</span>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-wider block ${ isSelected ? "text-slate-300 dark:text-orange-200" : "text-slate-400 dark:text-slate-500" }`}>
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
              { id: "all", label: "All Users" },
              { id: "active", label: "Active Only" },
              { id: "blocked", label: "Blocked Only" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  statusFilter === tab.id 
                    ? "bg-slate-900 dark:bg-orange-600 text-white shadow-xs" 
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
              placeholder="Search by customer name, email, verification code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-[11px] bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

      </div>

      {/* Main Customers Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Customer Directory */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col space-y-3 min-h-[450px]">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Users size={14} className="text-orange-500" />
              <span>Registered Customer Directory</span>
            </h2>
            <span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-950 px-2.5 py-1 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 uppercase tracking-widest select-none">
              {filteredCustomers.length} Users Listed
            </span>
          </div>

          {filteredCustomers.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40">
              <Users size={28} className="text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-500">No matching customer records found.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredCustomers.map((cust) => (
                <div
                  key={cust._id}
                  onClick={() => handleSelectCustomer(cust)}
                  className={`p-3.5 rounded-xl flex items-center justify-between gap-4 border transition-all duration-200 cursor-pointer ${ selectedCustomer?._id === cust._id ? "bg-slate-950 text-white dark:bg-orange-600 dark:border-orange-500 shadow-xs" : "bg-slate-50/60 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700" }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-black text-xs ${selectedCustomer?._id === cust._id ? "text-white" : "text-slate-900 dark:text-white"}`}>{cust.name}</span>
                      {cust.isBlocked && (
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border bg-rose-50 text-rose-600 border-rose-200/50 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/40">
                          Blocked
                        </span>
                      )}
                    </div>
                    <div className={`flex items-center gap-1.5 text-[11px] font-medium ${selectedCustomer?._id === cust._id ? "text-slate-300 dark:text-orange-100" : "text-slate-500 dark:text-slate-400"}`}>
                      <Mail size={12} />
                      <span>{cust.email}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleBlock(cust);
                    }}
                    className={`p-2 rounded-lg border transition shadow-xs cursor-pointer active:scale-95 ${ cust.isBlocked ? "border-emerald-200 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40 hover:bg-emerald-100" : "border-rose-200 text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40 hover:bg-rose-100" }`}
                    title={cust.isBlocked ? "Unblock Account" : "Suspend Access"}
                  >
                    {cust.isBlocked ? <ShieldCheck size={14} /> : <UserX size={14} />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Profile View Drawer */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col space-y-4">
          {loadingDetails ? (
            <div className="py-20 flex items-center justify-center text-slate-400 text-xs uppercase tracking-wider font-bold animate-pulse">Loading profile metadata...</div>
          ) : selectedCustomer ? (
            <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
              {/* Profile Card Header */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 space-y-1">
                <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Customer Profile Inspector</span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">{selectedCustomer.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{selectedCustomer.email}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                  <Key size={11} className="text-orange-500" />
                  <span>Verification Key: {selectedCustomer.deliveryVerificationKey || "None"}</span>
                </div>
              </div>

              {/* Delivery Addresses */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  <MapPin size={12} className="text-orange-500" />
                  <span>Saved Addresses</span>
                </div>
                {(!selectedCustomer.addresses || selectedCustomer.addresses.length === 0) ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center">No addresses recorded.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedCustomer.addresses.map((addr, idx) => (
                      <div key={idx} className="border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-600 dark:text-slate-300 space-y-1 bg-slate-50/50 dark:bg-slate-950/40">
                        <span className="font-bold text-slate-900 dark:text-white block">{addr.firstName} {addr.lastName}</span>
                        <p className="leading-relaxed">{addr.street}, {addr.city}, {addr.state}, {addr.country}</p>
                        <p className="text-slate-400 font-mono text-[10px]">{addr.phone}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Purchase History */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  <ClipboardList size={12} className="text-orange-500" />
                  <span>Purchase History ({orders.length})</span>
                </div>
                {orders.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center">No purchases recorded.</p>
                ) : (
                  <div className="space-y-2">
                    {orders.map((order) => (
                      <div key={order._id} className="border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 flex justify-between items-center text-xs bg-slate-50/50 dark:bg-slate-950/40">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">#{order._id.slice(-8).toUpperCase()}</span>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right space-y-0.5">
                          <span className="font-black text-slate-900 dark:text-white text-xs block">₹{parseFloat(order.amount || 0).toLocaleString()}</span>
                          <span className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider px-1.5 py-0.5 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/40 rounded-md inline-block">
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40">
              <Info className="text-slate-400 dark:text-slate-600" size={28} />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No Customer Selected</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center max-w-[200px]">Click any customer in the directory to inspect profile & orders.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Customers;
