import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { backendUrl } from "../config";
import { 
  Package, 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  Calendar, 
  Clock, 
  CheckCircle,
  Truck,
  Inbox,
  AlertTriangle,
  Settings,
  ShieldAlert,
  LogOut,
  Power,
  DollarSign,
  Wallet,
  FileText,
  KeyRound,
  X,
  ShieldCheck,
  RotateCcw
} from "lucide-react";

const Dashboard = ({ 
  token, 
  driver, 
  logout,
  orders,
  availableOrders,
  returnTasks,
  complaints,
  stats,
  loading,
  setLoading,
  fetchData
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Map route pathnames directly to tab strings
  let activeTab = "my-deliveries";
  if (location.pathname === "/returns") activeTab = "returns";
  else if (location.pathname === "/pool") activeTab = "available-pool";
  else if (location.pathname === "/complaints") activeTab = "complaints";
  else if (location.pathname === "/profile") activeTab = "profile";

  const [showResignModal, setShowResignModal] = useState(false);

  // Verification Code Modal state for deliveries
  const [verifyModal, setVerifyModal] = useState({ open: false, orderId: null, status: null });
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Verification Code Modal state for returns
  const [verifyReturnModal, setVerifyReturnModal] = useState({ open: false, requestId: null, status: null });

  // Complaint form state
  const [complaintForm, setComplaintForm] = useState({
    subject: "",
    category: "Payment Issue",
    description: ""
  });

  const updateStatusHandler = async (orderId, status, verificationCode = undefined) => {
    try {
      const payload = { orderId, status };
      if (verificationCode !== undefined) payload.verificationCode = verificationCode;

      const response = await axios.post(
        `${backendUrl}/api/deliveryman/update-status`,
        payload,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchData();
        return { success: true };
      } else {
        if (!response.data.requiresVerification) {
          toast.error(response.data.message);
        }
        return { success: false, requiresVerification: response.data.requiresVerification, message: response.data.message };
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      return { success: false };
    }
  };

  // Updates status of a return task
  const updateReturnStatusHandler = async (requestId, status, verificationCode = undefined) => {
    try {
      const payload = { requestId, status };
      if (verificationCode !== undefined) payload.verificationCode = verificationCode;

      const response = await axios.post(
        `${backendUrl}/api/deliveryman/update-return`,
        payload,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchData();
        return { success: true };
      } else {
        if (!response.data.requiresVerification) {
          toast.error(response.data.message);
        }
        return { success: false, requiresVerification: response.data.requiresVerification, message: response.data.message };
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      return { success: false };
    }
  };

  // Called when driver picks a status from the dropdown
  const handleStatusChange = async (orderId, newStatus) => {
    if (newStatus === "Delivered") {
      setVerifyModal({ open: true, orderId, status: newStatus });
      setVerifyCode("");
      setVerifyError("");
    } else {
      await updateStatusHandler(orderId, newStatus);
    }
  };

  // Called when driver updates status of a return task
  const handleReturnStatusChange = async (requestId, newStatus) => {
    if (newStatus === "Completed") {
      setVerifyReturnModal({ open: true, requestId, status: newStatus });
      setVerifyCode("");
      setVerifyError("");
    } else {
      await updateReturnStatusHandler(requestId, newStatus);
    }
  };

  // Called when driver submits the code in modal
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!verifyCode.trim()) {
      setVerifyError("Please enter the 6-character code from the customer.");
      return;
    }
    setVerifyLoading(true);
    const result = await updateStatusHandler(verifyModal.orderId, verifyModal.status, verifyCode.trim());
    setVerifyLoading(false);
    if (result?.success) {
      setVerifyModal({ open: false, orderId: null, status: null });
      setVerifyCode("");
      setVerifyError("");
    } else {
      setVerifyError(result?.message || "Invalid code. Ask the customer for their delivery code.");
    }
  };

  // Called when driver submits code for returning task verification
  const handleVerifyReturnSubmit = async (e) => {
    e.preventDefault();
    if (!verifyCode.trim()) {
      setVerifyError("Please enter the 6-character code from the customer.");
      return;
    }
    setVerifyLoading(true);
    const result = await updateReturnStatusHandler(verifyReturnModal.requestId, verifyReturnModal.status, verifyCode.trim());
    setVerifyLoading(false);
    if (result?.success) {
      setVerifyReturnModal({ open: false, requestId: null, status: null });
      setVerifyCode("");
      setVerifyError("");
    } else {
      setVerifyError(result?.message || "Invalid code. Ask the customer for their return verification code.");
    }
  };

  const claimOrderHandler = async (orderId) => {
    if (!stats.isOnline) {
      toast.warning("You must go Online (On Duty) to claim shipments.");
      return;
    }
    try {
      const response = await axios.post(
        `${backendUrl}/api/deliveryman/claim`,
        { orderId },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchData();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const toggleDutyStatusHandler = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/deliveryman/toggle-duty`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchData();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const resignHandler = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/deliveryman/deactivate`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Account deactivated. Logging out...");
        setShowResignModal(false);
        logout();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    if (!complaintForm.subject.trim() || !complaintForm.description.trim()) {
      toast.warning("Please fill out all fields.");
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/deliveryman/complaint`,
        complaintForm,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Complaint submitted successfully.");
        setComplaintForm({ subject: "", category: "Payment Issue", description: "" });
        fetchData();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // Segment order listings
  const activeDeliveries = orders.filter((o) => o.orderStatus !== "Delivered");
  const completedDeliveries = orders.filter((o) => o.orderStatus === "Delivered");
  const nextOrder = activeDeliveries[0]; // Priority next order
  const remainingDeliveries = activeDeliveries.slice(1);

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Delivered":
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border border-emerald-100";
      case "Out for Delivery":
      case "Out for Pickup":
      case "Shipped":
        return "bg-indigo-50 text-indigo-700 border border-indigo-100";
      case "Packed":
      case "Picked Up":
        return "bg-amber-50 text-amber-700 border border-amber-100";
      default:
        return "bg-blue-50 text-blue-700 border border-blue-100";
    }
  };

  const getReturnBadgeStyle = (status) => {
    switch (status) {
      case "Refunded":
        return "bg-emerald-50 text-emerald-700 border border-emerald-100";
      case "Received":
        return "bg-amber-50 text-amber-700 border border-amber-100";
      case "Approved":
        return "bg-indigo-50 text-indigo-750 border border-indigo-100";
      case "Rejected":
        return "bg-rose-50 text-rose-700 border border-rose-100";
      default:
        return "bg-orange-50 text-orange-700 border border-orange-200";
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Greeting & Duty Status Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-orange-500">
            Courier Hub
          </p>
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 bg-slate-950 text-white rounded-xl flex items-center justify-center shadow-md">
              <Truck size={20} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Agent Dashboard</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
            Welcome back, <span className="font-extrabold text-slate-800 dark:text-slate-200">{driver?.name}</span>. Duty status:{" "}
            <span className={`font-black ${stats.isOnline ? "text-emerald-500" : "text-slate-400"}`}>
              {stats.isOnline ? "ONLINE (On Duty)" : "OFFLINE (Off Duty)"}
            </span>.
          </p>
        </div>

        {/* Duty Status Switch Button */}
        <button
          onClick={toggleDutyStatusHandler}
          className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-sm active:scale-95 cursor-pointer ${
            stats.isOnline
              ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/10 hover:shadow-lg"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
          }`}
        >
          <Power size={14} className="stroke-[3px]" />
          {stats.isOnline ? "Go Offline" : "Go Online"}
        </button>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Total Earnings */}
        <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/50 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-5 flex items-center justify-between shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md relative overflow-hidden">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Earnings</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹{stats.totalEarnings}</p>
            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/30 mt-2 inline-block">
              ₹75 / order
            </span>
          </div>
          <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50 shadow-inner">
            <DollarSign size={22} />
          </div>
        </div>

        {/* COD Cash Collected */}
        <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/50 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-5 flex items-center justify-between shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">COD Collected</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹{stats.cashCollected}</p>
            <span className="text-[9px] text-amber-600 dark:text-amber-400 font-extrabold bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded border border-amber-100 dark:border-amber-900/30 mt-2 inline-block">
              Remit to admin
            </span>
          </div>
          <div className="h-12 w-12 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center border border-amber-100 dark:border-amber-900/50 shadow-inner">
            <Wallet size={22} />
          </div>
        </div>

        {/* Completed Deliveries */}
        <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/50 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-5 flex items-center justify-between shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Delivered</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.totalDelivered}</p>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-extrabold mt-2.5 inline-block">
              Completed jobs
            </span>
          </div>
          <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50 shadow-inner">
            <CheckCircle size={22} />
          </div>
        </div>

        {/* Active Deliveries */}
        <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/50 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-5 flex items-center justify-between shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Active Tasks</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.activeCount}</p>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-extrabold mt-2.5 inline-block">
              Pending jobs
            </span>
          </div>
          <div className="h-12 w-12 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center border border-blue-100 dark:border-blue-900/50 shadow-inner">
            <Package size={22} />
          </div>
        </div>
      </div>

      {/* Main Tab Render Container */}
      <div className="space-y-4">
        {/* Tab 1: Active & Completed Deliveries */}
        {activeTab === "my-deliveries" && (
          <div className="space-y-6">
            {/* NEXT ORDER / PRIORITY TASK CARD */}
            {nextOrder && (
              <div className="bg-gradient-to-br from-slate-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-slate-800">
                <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-5 pointer-events-none">
                  <Truck size={280} />
                </div>
                
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="space-y-1">
                    <span className="bg-amber-450 bg-amber-500 text-slate-950 font-black text-[9px] uppercase px-2.5 py-0.5 rounded-md tracking-wider">
                      Priority Next Task
                    </span>
                    <h3 className="text-lg font-black tracking-tight mt-1 flex items-center gap-1.5">
                      Order ID: <span className="font-mono text-slate-300">{nextOrder._id.slice(-6).toUpperCase()}</span>
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Change Status:</span>
                    <select
                      value={nextOrder.orderStatus}
                      onChange={(e) => handleStatusChange(nextOrder._id, e.target.value)}
                      className="bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-xs font-bold text-white outline-none focus:bg-white/20 transition cursor-pointer"
                    >
                      <option value="Order Placed" className="text-slate-900">Order Placed</option>
                      <option value="Packed" className="text-slate-900">Packed</option>
                      <option value="Shipped" className="text-slate-900">Shipped</option>
                      <option value="Out for Delivery" className="text-slate-900">Out for Delivery</option>
                      <option value="Delivered" className="text-slate-900">Delivered</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
                  {/* Address Section */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Customer / Destination</p>
                    <div className="space-y-1">
                      <p className="font-extrabold text-sm">{nextOrder.address.firstName} {nextOrder.address.lastName}</p>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {nextOrder.address.street}, {nextOrder.address.city}, {nextOrder.address.state} - {nextOrder.address.zipcode}
                      </p>
                    </div>
                    <a
                      href={`tel:${nextOrder.address.phone}`}
                      className="inline-flex items-center gap-1.5 text-xs font-black text-amber-400 hover:text-amber-300 transition mt-2"
                    >
                      <Phone size={12} />
                      {nextOrder.address.phone}
                    </a>
                  </div>

                  {/* Items list */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Items breakdown</p>
                    <div className="max-h-24 overflow-y-auto space-y-1.5 pr-2">
                      {nextOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs border-b border-white/5 pb-1">
                          <span className="font-semibold text-slate-200 truncate pr-4">{item.name}</span>
                          <span className="font-bold text-slate-400 shrink-0">Qty {item.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment & Action */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-slate-455 tracking-wider">Payment / Collection</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Payment Method:</span>
                        <span className="font-bold text-white uppercase">{nextOrder.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>COD Cash to Collect:</span>
                        <span className="font-extrabold text-amber-400 text-sm">
                          {nextOrder.paymentMethod.toLowerCase() === "cod" ? `₹${nextOrder.amount}` : "₹0 (Paid)"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* REST OF ASSIGNED DELIVERIES */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
              <h3 className="font-black text-sm text-slate-900">Remaining Assigned Deliveries</h3>
              
              {remainingDeliveries.length === 0 && (
                <p className="text-xs text-slate-500 py-2">No other shipments assigned. Complete your next priority task card above.</p>
              )}

              <div className="space-y-3">
                {remainingDeliveries.map((order) => (
                  <div key={order._id} className="border border-slate-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-200 transition">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                        <span className="font-bold text-xs text-slate-800">
                          {order.address.firstName} {order.address.lastName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate max-w-sm">
                        {order.address.street}, {order.address.city} · {order.items.map(i => `${i.name} (${i.qty})`).join(", ")}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-black text-slate-900">
                        {order.paymentMethod.toUpperCase() === "COD" ? `Collect ₹${order.amount}` : "Prepaid"}
                      </span>
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold bg-white text-slate-700 outline-none cursor-pointer"
                      >
                        <option value="Order Placed">Order Placed</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COMPLETED JOBS BOARD */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-sm text-slate-900">Delivery History</h3>
                <span className="text-xs text-slate-400 font-medium">Completed ({completedDeliveries.length})</span>
              </div>

              {completedDeliveries.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No history recorded yet.</p>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {completedDeliveries.map((order) => (
                    <div key={order._id} className="border border-slate-50 rounded-xl p-3 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-mono text-[9px] font-bold text-slate-400 bg-slate-100 px-1 py-0.5 rounded mr-1.5">
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                        <span className="font-bold text-slate-700">{order.address.firstName} {order.address.lastName}</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Delivered on: {new Date(order.updatedAt).toLocaleDateString()}</p>
                      </div>
                      <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        ₹{order.amount} ({order.paymentMethod.toUpperCase()})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Return Tasks */}
        {activeTab === "returns" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-black text-sm text-slate-900">Approved Return Tasks</h3>
              <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                {returnTasks.filter(t => t.status !== "Completed").length} Active
              </span>
            </div>

            {returnTasks.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-500 flex flex-col items-center justify-center gap-2">
                <RotateCcw size={32} className="text-slate-300 animate-spin-slow" />
                <div>
                  <p className="font-semibold text-slate-750">No return requests assigned to you</p>
                  <p className="text-xs text-slate-400 mt-0.5">Approved return actions (refund pickup, exchanges, etc.) will show up here.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {returnTasks.map((task) => (
                  <div key={task._id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow transition duration-150">
                    
                    {/* Return task header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-50 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-orange-50 text-orange-750 border border-orange-100 rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                            Return: {task.returnType}
                          </span>
                          {task.returnType === "Exchange" && task.exchangeSize && (
                            <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg px-2 py-0.5 text-[10px] font-bold">
                              Size Swap: {task.itemSize || "—"} → {task.exchangeSize}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5">
                          Task ID: <span className="font-mono text-slate-600">{task._id.slice(-6).toUpperCase()}</span>
                        </p>
                      </div>

                      {/* Return Task Status selection */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Status:</span>
                        {task.status === "Completed" ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl px-3 py-1.5 text-xs font-bold">
                            Completed
                          </span>
                        ) : (
                          <select
                            value={task.status}
                            onChange={(e) => handleReturnStatusChange(task._id, e.target.value)}
                            className={`border rounded-xl px-2.5 py-1.5 text-xs font-bold outline-none cursor-pointer ${getStatusBadgeStyle(task.status)}`}
                          >
                            <option value="Approved">Approved</option>
                            <option value="Out for Pickup">Out for Pickup</option>
                            <option value="Picked Up">Picked Up</option>
                            <option value="Completed">Completed</option>
                          </select>
                        )}
                      </div>
                    </div>

                    {/* Details row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* Product */}
                      <div className="space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                        <p className="font-black text-[9px] uppercase tracking-wider text-slate-400">Returned Product</p>
                        <p className="font-bold text-slate-800">{task.itemName}</p>
                        <p className="text-slate-500">Size: {task.itemSize || "—"} · Qty: {task.quantity}</p>
                        <p className="font-black text-slate-900 mt-1">Value: ₹{task.amount}</p>
                      </div>

                      {/* Customer Address */}
                      <div className="space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                        <p className="font-black text-[9px] uppercase tracking-wider text-slate-400">Customer Location</p>
                        {task.orderAddress ? (
                          <>
                            <p className="font-bold text-slate-850">{task.orderAddress.firstName} {task.orderAddress.lastName}</p>
                            <p className="text-slate-600 leading-relaxed mt-0.5">
                              {task.orderAddress.street}, {task.orderAddress.city}, {task.orderAddress.state}
                            </p>
                            <a
                              href={`tel:${task.orderAddress.phone}`}
                              className="inline-flex items-center gap-1 mt-1.5 font-bold text-amber-600 hover:text-amber-700 transition"
                            >
                              <Phone size={10} />
                              <span>{task.orderAddress.phone}</span>
                            </a>
                          </>
                        ) : (
                          <p className="text-slate-400">Address not found</p>
                        )}
                      </div>

                      {/* Instructions */}
                      <div className="space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                        <p className="font-black text-[9px] uppercase tracking-wider text-slate-400">Task Instructions</p>
                        <p className="text-slate-700 leading-relaxed">
                          <span className="font-bold">Reason:</span> {task.reason}
                        </p>
                        {task.adminNote && (
                          <div className="bg-orange-50 border border-orange-100 p-2 rounded text-[11px] text-orange-900 font-medium mt-1.5">
                            <span className="font-bold block text-[9px] uppercase text-orange-600">Admin Note:</span>
                            {task.adminNote}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Available claim pool */}
        {activeTab === "available-pool" && (
          <div className="space-y-4">
            <h3 className="font-black text-sm text-slate-900">Unassigned Orders Pool</h3>
            
            {availableOrders.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white py-12 text-center text-sm text-slate-500 shadow-sm flex flex-col items-center justify-center gap-2">
                <Inbox size={28} className="text-slate-300" />
                <p className="font-semibold text-slate-700">Available pool is empty</p>
                <p className="text-xs text-slate-400">All orders are currently claimed by courier agents.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableOrders.map((order) => (
                  <div key={order._id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-mono text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase">
                          {order.paymentMethod}
                        </span>
                      </div>
                      
                      <div className="text-xs space-y-1">
                        <p className="font-bold text-slate-800">Destination: {order.address.city}, {order.address.state}</p>
                        <p className="text-slate-550 text-slate-500 line-clamp-2">Items: {order.items.map(i => `${i.name} (x${i.qty})`).join(", ")}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                      <span className="font-black text-slate-900 text-sm">₹{order.amount}</span>
                      <button
                        onClick={() => claimOrderHandler(order._id)}
                        className="bg-slate-900 hover:bg-slate-850 text-white rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm cursor-pointer"
                      >
                        Claim Shipment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Complaints panel */}
        {activeTab === "complaints" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
            
            {/* List */}
            <div className="space-y-4 bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
              <h3 className="font-black text-sm text-slate-900">Your Complaints</h3>
              
              {complaints.length === 0 ? (
                <p className="text-xs text-slate-550 text-center py-6">No complaints submitted.</p>
              ) : (
                <div className="space-y-3">
                  {complaints.map((c) => (
                    <div key={c._id} className="border border-slate-100 rounded-xl p-4 space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-slate-800">{c.subject}</p>
                          <p className="text-[10px] text-slate-400">Category: {c.category}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-[6px] font-bold text-[9px] uppercase tracking-wider border ${
                          c.status === "Resolved"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg">{c.description}</p>
                      
                      {c.adminReply && (
                        <div className="bg-indigo-50/50 border border-indigo-100/50 p-3 rounded-lg text-indigo-900 font-semibold">
                          <p className="font-black text-[9px] uppercase text-indigo-650 tracking-wider">Admin Reply note:</p>
                          <p className="mt-0.5">{c.adminReply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleComplaintSubmit} className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
              <h3 className="font-black text-sm text-slate-900">Submit Complaint</h3>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Category</label>
                <select
                  value={complaintForm.category}
                  onChange={(e) => setComplaintForm(c => ({ ...c, category: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none bg-white focus:border-slate-800 transition"
                >
                  <option value="Payment Issue">Payment Issue</option>
                  <option value="App Glitch">App Glitch</option>
                  <option value="Customer Dispute">Customer Dispute</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Subject</label>
                <input
                  type="text"
                  placeholder="Summarize the issue..."
                  value={complaintForm.subject}
                  onChange={(e) => setComplaintForm(c => ({ ...c, subject: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-slate-800 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Description</label>
                <textarea
                  rows="4"
                  placeholder="Detail what happened..."
                  value={complaintForm.description}
                  onChange={(e) => setComplaintForm(c => ({ ...c, description: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-slate-800 transition resize-none font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-850 text-white rounded-xl py-2.5 text-xs font-bold transition shadow-sm active:scale-98 cursor-pointer"
              >
                Submit Form
              </button>
            </form>
          </div>
        )}

        {/* Tab 5: Account Profile Settings */}
        {activeTab === "profile" && (
          <div className="max-w-md bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="font-black text-sm text-slate-900">Courier Account Settings</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-50 text-xs">
                <span className="text-slate-450">Agent Name:</span>
                <span className="font-bold text-slate-800">{driver?.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50 text-xs">
                <span className="text-slate-455 text-slate-400">Email Address:</span>
                <span className="font-bold text-slate-800">{driver?.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50 text-xs">
                <span className="text-slate-450">Phone Number:</span>
                <span className="font-bold text-slate-800">{driver?.phone}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50 text-xs">
                <span className="text-slate-450">Account Status:</span>
                <span className="font-bold text-emerald-600 capitalize bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  {stats.status}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
              <button
                onClick={() => setShowResignModal(true)}
                className="w-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 py-3 rounded-2xl text-xs font-bold transition active:scale-98 cursor-pointer text-center"
              >
                Resign / Deactivate Account
              </button>
              <button
                onClick={logout}
                className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 py-3 rounded-2xl text-xs font-bold transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut size={14} />
                Logout from Hub
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ⚠️ RESIGN CONFIRMATION MODAL */}
      {showResignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 text-rose-600">
              <ShieldAlert size={24} />
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Confirm Account Deactivation</h3>
            </div>
            
            <p className="text-xs text-slate-550 leading-relaxed">
              Are you sure you want to deactivate your courier agent account? This action is permanent. Any active assignments must be complete before your resignation is finalized.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowResignModal(false)}
                className="flex-1 rounded-2xl border border-slate-200 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={resignHandler}
                className="flex-1 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white py-3 text-xs font-black transition cursor-pointer shadow-md"
              >
                Confirm Resign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ DELIVERY VERIFICATION CODE MODAL */}
      {verifyModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <KeyRound size={18} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Delivery Confirmation</p>
                    <h3 className="text-base font-black text-white leading-tight">Enter Customer Code</h3>
                  </div>
                </div>
                <button
                  onClick={() => setVerifyModal({ open: false, orderId: null, status: null })}
                  className="h-8 w-8 rounded-xl bg-white/10 hover:bg-white/20 transition flex items-center justify-center cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body */}
            <form onSubmit={handleVerifySubmit} className="p-6 space-y-5">
              <p className="text-sm text-slate-600 leading-relaxed">
                Ask the customer for their <span className="font-black text-slate-900">6-character Delivery Code</span>. This was sent to them at order confirmation.
              </p>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2 block">
                  Delivery Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={verifyCode}
                  onChange={(e) => {
                    setVerifyCode(e.target.value.toUpperCase());
                    setVerifyError("");
                  }}
                  placeholder="e.g. AB3X7Z"
                  autoFocus
                  className={`w-full rounded-2xl border-2 px-5 py-4 text-center text-2xl font-black tracking-[0.4em] text-slate-900 outline-none transition ${
                    verifyError
                      ? "border-rose-300 bg-rose-50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                      : "border-slate-200 bg-slate-50 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10"
                  }`}
                />
                {verifyError && (
                  <p className="mt-2 text-xs font-semibold text-rose-600 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    {verifyError}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setVerifyModal({ open: false, orderId: null, status: null })}
                  className="flex-1 rounded-2xl border border-slate-200 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyLoading}
                  className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white py-3 text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {verifyLoading ? (
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShieldCheck size={14} />
                  )}
                  {verifyLoading ? "Verifying..." : "Confirm Delivery"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ RETURN TASK COMPLETION VERIFICATION MODAL */}
      {verifyReturnModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <KeyRound size={18} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Return Confirmation</p>
                    <h3 className="text-base font-black text-white leading-tight">Enter Customer Code</h3>
                  </div>
                </div>
                <button
                  onClick={() => setVerifyReturnModal({ open: false, requestId: null, status: null })}
                  className="h-8 w-8 rounded-xl bg-white/10 hover:bg-white/20 transition flex items-center justify-center cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body */}
            <form onSubmit={handleVerifyReturnSubmit} className="p-6 space-y-5">
              <p className="text-sm text-slate-600 leading-relaxed">
                Ask the customer for their <span className="font-black text-slate-900">6-character Return Verification Code</span>. This is available in their Order History detail panel.
              </p>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2 block">
                  Return Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={verifyCode}
                  onChange={(e) => {
                    setVerifyCode(e.target.value.toUpperCase());
                    setVerifyError("");
                  }}
                  placeholder="e.g. EF5G8H"
                  autoFocus
                  className={`w-full rounded-2xl border-2 px-5 py-4 text-center text-2xl font-black tracking-[0.4em] text-slate-900 outline-none transition ${
                    verifyError
                      ? "border-rose-300 bg-rose-50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                      : "border-slate-200 bg-slate-50 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10"
                  }`}
                />
                {verifyError && (
                  <p className="mt-2 text-xs font-semibold text-rose-600 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    {verifyError}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setVerifyReturnModal({ open: false, requestId: null, status: null })}
                  className="flex-1 rounded-2xl border border-slate-200 py-3 text-xs font-bold text-slate-650 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyLoading}
                  className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white py-3 text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {verifyLoading ? (
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShieldCheck size={14} />
                  )}
                  {verifyLoading ? "Verifying..." : "Confirm Return Completion"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
