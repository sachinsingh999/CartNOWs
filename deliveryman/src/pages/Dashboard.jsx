import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { backendUrl } from "../config";
import { 
  ShieldAlert,
  KeyRound,
  X,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";

import MyDeliveriesTab from "../components/MyDeliveriesTab";
import ReturnsTab from "../components/ReturnsTab";
import AvailablePoolTab from "../components/AvailablePoolTab";
import ComplaintsTab from "../components/ComplaintsTab";
import ProfileSettingsTab from "../components/ProfileSettingsTab";

const formatAddress = (address) => {
  if (!address) return "";
  const street = address.street || "";
  const city = address.city || "";
  const state = address.state || "";
  const zip = address.zipcode || address.zipCode || address.pincode || "";
  const country = address.country || "";

  return [street, city, state, zip, country]
    .filter(Boolean)
    .map(item => String(item).trim())
    .filter(Boolean)
    .reduce((acc, current) => {
      if (acc.toLowerCase().includes(current.toLowerCase())) {
        return acc;
      }
      return acc ? `${acc}, ${current}` : current;
    }, "");
};

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
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const [deliveryLat, setDeliveryLat] = useState(driver?.deliveryLat || 22.3072);
  const [deliveryLng, setDeliveryLng] = useState(driver?.deliveryLng || 73.1812);
  const [deliveryRadius, setDeliveryRadius] = useState(driver?.deliveryRadius || 10);
  const [mapSaving, setMapSaving] = useState(false);

  // Unified logistics data table states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [tablePage, setTablePage] = useState(1);
  const tableRowsPerPage = 6;

  // Sync state if driver prop changes
  useEffect(() => {
    if (driver) {
      if (driver.deliveryLat) setDeliveryLat(driver.deliveryLat);
      if (driver.deliveryLng) setDeliveryLng(driver.deliveryLng);
      if (driver.deliveryRadius) setDeliveryRadius(driver.deliveryRadius);
    }
  }, [driver]);

  const handleSaveMapArea = async () => {
    setMapSaving(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/deliveryman/update-coordinates`,
        {
          lat: deliveryLat,
          lng: deliveryLng,
          radius: deliveryRadius
        },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        if (response.data.driver) {
          localStorage.setItem("deliveryman_info", JSON.stringify(response.data.driver));
        }
        fetchData();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setMapSaving(false);
    }
  };

  // Verification Code Modal state for deliveries
  const [verifyModal, setVerifyModal] = useState({ open: false, orderId: null, status: null });
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

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
      const payload = { rmaId: requestId, status, verificationCode };

      const response = await axios.post(
        `${backendUrl}/api/rms/rma/verify-pickup`,
        payload,
        { headers: { token, deliveryman_token: token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchData();
        return { success: true };
      } else {
        toast.error(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
      return { success: false };
    }
  };

  // Called when driver picks a status or clicks complete delivery
  const handleStatusChange = async (orderId, newStatus, verificationCode = undefined) => {
    if (newStatus === "Delivered") {
      if (verificationCode) {
        setVerifyLoading(true);
        const result = await updateStatusHandler(orderId, newStatus, verificationCode);
        setVerifyLoading(false);
        if (result?.success) {
          setVerifyModal({ open: false, orderId: null, status: null });
          setVerifyCode("");
          setVerifyError("");
        } else {
          setVerifyError(result?.message || "Invalid code. Ask customer for their 6-character code.");
        }
      } else {
        setVerifyModal({ open: true, orderId, status: newStatus });
        setVerifyCode("");
        setVerifyError("");
      }
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

  // Resend OTP handler for delivery confirmation
  const handleResendOtp = async () => {
    if (resendTimer > 0 || resendLoading) return;
    setResendLoading(true);
    setVerifyError("");
    try {
      const result = await updateStatusHandler(verifyModal.orderId, "Delivered");
      if (result && result.requiresVerification) {
        toast.success("Verification code resent successfully!");
        setResendTimer(30); // 30-second cooldown
      } else {
        setVerifyError(result.message || "Failed to resend verification code.");
      }
    } catch (err) {
      console.error(err);
      setVerifyError("Error resending verification code.");
    } finally {
      setResendLoading(false);
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

  const handleAcceptAssignment = async (orderId) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/deliveryman/accept-delivery`,
        { orderId },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message || "Assignment accepted successfully");
        fetchData();
      } else {
        toast.error(response.data.message || "Failed to accept assignment");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectAssignment = async (orderId) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/deliveryman/reject-delivery`,
        { orderId },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message || "Assignment rejected successfully");
        fetchData();
      } else {
        toast.error(response.data.message || "Failed to reject assignment");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
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
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // Segment order listings
  const filterByDate = (list) => {
    if (!list) return [];
    return list.filter((item) => {
      if (!item.createdAt) return true;
      const date = new Date(item.createdAt);
      
      if (filterStartDate) {
        const start = new Date(filterStartDate);
        start.setHours(0, 0, 0, 0);
        const itemTime = new Date(date);
        itemTime.setHours(0, 0, 0, 0);
        if (itemTime < start) return false;
      }
      
      if (filterEndDate) {
        const end = new Date(filterEndDate);
        end.setHours(23, 59, 59, 999);
        const itemTime = new Date(date);
        itemTime.setHours(0, 0, 0, 0);
        if (itemTime > end) return false;
      }
      
      return true;
    });
  };

  const filteredAvailableOrders = filterByDate(availableOrders);
  const filteredReturnTasks = filterByDate(returnTasks);
  const filteredComplaints = filterByDate(complaints);

  const pendingAcceptance = orders.filter((o) => o.assignmentStatus === "Assigned");
  const activeOngoing = orders.filter((o) => o.assignmentStatus !== "Assigned" && o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled");
  const nextOrder = activeOngoing[0]; // Priority next order

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Delivered":
      case "Completed":
        return "bg-emerald-50 text-emerald-700 dark:text-emerald-700 border border-emerald-100";
      case "Out for Delivery":
      case "Out for Pickup":
      case "Shipped":
        return "bg-indigo-50 text-indigo-700 dark:text-indigo-700 border border-indigo-100";
      case "Packed":
      case "Picked Up":
        return "bg-indigo-50 text-indigo-700 dark:text-indigo-700 border border-indigo-200";
      default:
        return "bg-indigo-50 text-indigo-700 dark:text-indigo-700 border border-indigo-200";
    }
  };

  const completedToday = orders.filter(o => o.orderStatus === "Delivered" && new Date(o.updatedAt).toDateString() === new Date().toDateString());
  const completedTodayCount = completedToday.length;
  const todayEarningsVal = completedToday.reduce((sum, o) => sum + (o.amount || 0), 0);

  // Filter orders for the modern unified data table
  const tableFilteredOrders = orders.filter(o => {
    // Search query matches customer name or order ID
    const nameMatch = `${o.address?.firstName || ""} ${o.address?.lastName || ""}`.toLowerCase().includes(searchQuery.toLowerCase());
    const idMatch = o._id.toLowerCase().includes(searchQuery.toLowerCase());
    const searchMatch = nameMatch || idMatch;

    // Status Filter selection mapping
    let statusMatch = true;
    if (statusFilter === "Pending") {
      statusMatch = o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled";
    } else if (statusFilter === "Delivered") {
      statusMatch = o.orderStatus === "Delivered";
    } else if (statusFilter === "Cancelled") {
      statusMatch = o.orderStatus === "Cancelled";
    }

    // Date range constraints
    let dateMatch = true;
    if (filterStartDate || filterEndDate) {
      const date = new Date(o.createdAt);
      if (filterStartDate) {
        const start = new Date(filterStartDate);
        start.setHours(0, 0, 0, 0);
        const itemTime = new Date(date);
        itemTime.setHours(0, 0, 0, 0);
        if (itemTime < start) dateMatch = false;
      }
      if (filterEndDate) {
        const end = new Date(filterEndDate);
        end.setHours(23, 59, 59, 999);
        const itemTime = new Date(date);
        itemTime.setHours(0, 0, 0, 0);
        if (itemTime > end) dateMatch = false;
      }
    }

    return searchMatch && statusMatch && dateMatch;
  });

  // Calculate table pagination
  const totalTablePages = Math.ceil(tableFilteredOrders.length / tableRowsPerPage) || 1;
  const paginatedTableOrders = tableFilteredOrders.slice((tablePage - 1) * tableRowsPerPage, tablePage * tableRowsPerPage);

  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-200">
      
      {/* Dynamic Tab Rendering */}
      {activeTab === "my-deliveries" && (
        <MyDeliveriesTab
          token={token}
          driver={driver}
          stats={stats}
          orders={orders}
          nextOrder={nextOrder}
          pendingAcceptance={pendingAcceptance}
          handleAcceptAssignment={handleAcceptAssignment}
          handleRejectAssignment={handleRejectAssignment}
          toggleDutyStatusHandler={toggleDutyStatusHandler}
          logout={logout}
          filterStartDate={filterStartDate}
          setFilterStartDate={setFilterStartDate}
          filterEndDate={filterEndDate}
          setFilterEndDate={setFilterEndDate}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          tablePage={tablePage}
          setTablePage={setTablePage}
          tableRowsPerPage={tableRowsPerPage}
          handleStatusChange={handleStatusChange}
          setVerifyModal={setVerifyModal}
          formatAddress={formatAddress}
          getStatusBadgeStyle={getStatusBadgeStyle}
          completedTodayCount={completedTodayCount}
          todayEarningsVal={todayEarningsVal}
          tableFilteredOrders={tableFilteredOrders}
          paginatedTableOrders={paginatedTableOrders}
          totalTablePages={totalTablePages}
        />
      )}

      {activeTab === "returns" && (
        <ReturnsTab
          filteredReturnTasks={filteredReturnTasks}
          handleReturnStatusChange={handleReturnStatusChange}
          formatAddress={formatAddress}
        />
      )}

      {activeTab === "available-pool" && (
        <AvailablePoolTab
          filteredAvailableOrders={filteredAvailableOrders}
          claimOrderHandler={claimOrderHandler}
          driver={driver}
        />
      )}

      {activeTab === "complaints" && (
        <ComplaintsTab
          filteredComplaints={filteredComplaints}
          complaintForm={complaintForm}
          setComplaintForm={setComplaintForm}
          handleComplaintSubmit={handleComplaintSubmit}
        />
      )}

      {activeTab === "profile" && (
        <ProfileSettingsTab
          driver={driver}
          stats={stats}
          setShowResignModal={setShowResignModal}
          deliveryLat={deliveryLat}
          setDeliveryLat={setDeliveryLat}
          deliveryLng={deliveryLng}
          setDeliveryLng={setDeliveryLng}
          deliveryRadius={deliveryRadius}
          setDeliveryRadius={setDeliveryRadius}
          handleSaveMapArea={handleSaveMapArea}
          mapSaving={mapSaving}
          token={token}
        />
      )}

      {/* ⚠️ RESIGN CONFIRMATION MODAL */}
      {showResignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-950/70 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 text-rose-600">
              <ShieldAlert size={24} />
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">Confirm Account Deactivation</h3>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed text-slate-600">
              Are you sure you want to deactivate your courier agent account? This action is permanent. Any active assignments must be complete before your resignation is finalized.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowResignModal(false)}
                className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={resignHandler}
                className="flex-1 rounded-2xl bg-rose-600 hover:bg-rose-700 text-slate-100 dark:text-white py-3 text-xs font-black transition cursor-pointer shadow-md"
              >
                Confirm Resign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ DELIVERY VERIFICATION CODE MODAL */}
      {verifyModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-950 dark:bg-slate-950/70 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 text-slate-100 dark:text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                    <KeyRound size={18} className="text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Delivery Confirmation</p>
                    <h3 className="text-base font-black text-slate-100 dark:text-white leading-tight">Enter Customer Code</h3>
                  </div>
                </div>
                <button
                  onClick={() => setVerifyModal({ open: false, orderId: null, status: null })}
                  className="h-8 w-8 rounded-xl bg-white/10 hover:bg-white/20 transition flex items-center justify-center cursor-pointer text-slate-100 dark:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body */}
            <form onSubmit={handleVerifySubmit} className="p-6 space-y-5">
              <p className="text-sm text-slate-600 leading-relaxed">
                Ask the customer for their <span className="font-black text-slate-900 dark:text-slate-100">6-character Delivery Code</span>. This was sent to them at order confirmation.
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
                  className={`w-full rounded-2xl border-2 px-5 py-4 text-center text-2xl font-black tracking-[0.4em] text-slate-900 dark:text-slate-100 outline-none transition ${verifyError ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-slate-50 dark:bg-slate-950"} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900`}
                />
                <div className="flex justify-between items-center mt-2.5">
                  <div className="flex-1 min-w-0 pr-2">
                    {verifyError && (
                      <p className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                        <AlertTriangle size={12} className="shrink-0" />
                        <span className="truncate text-left block">{verifyError}</span>
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={resendLoading || resendTimer > 0}
                    onClick={handleResendOtp}
                    className="text-xs font-black text-indigo-600 hover:text-indigo-700 disabled:text-slate-400 transition cursor-pointer select-none shrink-0"
                  >
                    {resendLoading ? "Resending..." : resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setVerifyModal({ open: false, orderId: null, status: null })}
                  className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyLoading}
                  className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-slate-100 dark:text-white py-3 text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {verifyLoading ? (
                    <span className="h-4 w-4 border-2 border-white/10 dark:border-slate-800 border-t-transparent rounded-full animate-spin" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-950/70 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 text-slate-100 dark:text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                    <KeyRound size={18} className="text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Return Confirmation</p>
                    <h3 className="text-base font-black text-slate-100 dark:text-white leading-tight">Enter Customer Code</h3>
                  </div>
                </div>
                <button
                  onClick={() => setVerifyReturnModal({ open: false, requestId: null, status: null })}
                  className="h-8 w-8 rounded-xl bg-white/10 hover:bg-white/20 transition flex items-center justify-center cursor-pointer text-slate-100 dark:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body */}
            <form onSubmit={handleVerifyReturnSubmit} className="p-6 space-y-5">
              <p className="text-sm text-slate-600 leading-relaxed">
                Ask the customer for their <span className="font-black text-slate-900 dark:text-slate-100">6-character Return Verification Code</span>. This is available in their Order History detail panel.
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
                  className={`w-full rounded-2xl border-2 px-5 py-4 text-center text-2xl font-black tracking-[0.4em] text-slate-900 dark:text-slate-100 outline-none transition ${verifyError ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-slate-50 dark:bg-slate-950"} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900`}
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
                  className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyLoading}
                  className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-slate-100 dark:text-white py-3 text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {verifyLoading ? (
                    <span className="h-4 w-4 border-2 border-white/10 dark:border-slate-800 border-t-transparent rounded-full animate-spin" />
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
