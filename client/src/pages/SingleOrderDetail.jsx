import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  Truck,
  Package,
  Tag,
  Copy,
  Check,
  ShoppingBag,
  Clock,
  ShieldCheck,
  MapPin,
  FileText,
  Edit2,
  Calendar,
  RotateCcw,
  Headset,
  XCircle,
  X,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  MessageSquare,
  Minus
} from "lucide-react";
import OrderCommunication from "../components/OrderCommunication";
import { ProductGridSkeleton } from "../components/SkeletonLoader";

const SingleOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [cancelModal, setCancelModal] = useState({ open: false, orderItemId: null });
  const [cancelReason, setCancelReason] = useState("Ordered by mistake");
  const [cancelNotes, setCancelNotes] = useState("");
  const [submittingCancel, setSubmittingCancel] = useState(false);
  const [returnRequests, setReturnRequests] = useState([]);
  const [rmaList, setRmaList] = useState([]);
  const [chatSidebarState, setChatSidebarState] = useState("closed"); // "closed" | "open" | "minimized"
  const token = localStorage.getItem("token") || "";

  const fetchOrderDetails = async (isSilent = false) => {
    if (!token) {
      if (!isSilent) {
        toast.error("Please login to view order details.");
        navigate("/login");
      }
      return;
    }
    try {
      if (!isSilent) setLoading(true);
      const [orderRes, rmsRmaRes, rmsReqRes] = await Promise.all([
        axios.get(`${backendUrl}/api/order/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${backendUrl}/api/rms/rma/list`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { success: false } })),
        axios.get(`${backendUrl}/api/rms/request/my-requests`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { success: false } }))
      ]);

      if (orderRes.data.success) {
        setOrder(orderRes.data.order);
      } else if (!isSilent) {
        toast.error("Failed to load order details.");
        navigate("/orderdetail");
      }

      if (rmsRmaRes?.data?.success) {
        setRmaList(rmsRmaRes.data.rmas || []);
      }
      if (rmsReqRes?.data?.success) {
        setReturnRequests(rmsReqRes.data.requests || []);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      if (!isSilent) {
        toast.error(error.response?.data?.message || "Error loading order.");
        navigate("/orderdetail");
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails(false);
    if (location.hash === "#chat") {
      setChatSidebarState("open");
    }
    const pollInterval = setInterval(() => {
      fetchOrderDetails(true);
    }, 4000);
    return () => clearInterval(pollInterval);
  }, [orderId, location.hash]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(orderId);
    setCopiedId(true);
    toast.success("Order ID copied!");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const getStatusStep = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "placed" || s === "order placed") return 0;
    if (s === "confirmed" || s === "packed" || s === "processing" || s === "partially cancelled") return 1;
    if (s === "shipped" || s === "partially shipped") return 2;
    if (s === "out for delivery") return 3;
    if (s === "delivered" || s === "completed" || s === "partially delivered") return 4;
    return 0;
  };

  const isOrderMatch = (reqOrderId, orderIdToMatch) => {
    if (!reqOrderId || !orderIdToMatch) return false;
    const reqStr = String(reqOrderId._id || reqOrderId).toLowerCase();
    const ordIdStr = String(orderIdToMatch).toLowerCase();
    const ordNumStr = String(order?.orderNumber || "").toLowerCase().replace("#", "");
    return reqStr === ordIdStr || reqStr === ordNumStr || (ordNumStr.length > 0 && reqStr.includes(ordNumStr));
  };

  const matchedReq = returnRequests.find((r) => isOrderMatch(r.orderId, orderId));
  const matchedRMA = rmaList.find((rma) => isOrderMatch(rma.orderId, orderId));

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-left">
        <ProductGridSkeleton count={1} />
      </div>
    );
  }

  if (!order) return null;

  const currentStep = getStatusStep(order.orderStatus);
  const steps = [
    { label: "Placed", desc: "Order Placed", icon: ShoppingBag },
    { label: "Confirmed", desc: "Packed", icon: FileText },
    { label: "Shipped", desc: "In Transit", icon: Truck },
    { label: "Out For Delivery", desc: "Out for Delivery", icon: MapPin },
    { label: "Delivered", desc: "Delivered", icon: ShieldCheck }
  ];

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  const formattedTime = new Date(order.createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  // Billing math
  const shippingFee = order.shippingFee ?? (order.amount > 519 ? 0 : 40);
  const subtotal = order.subtotal || (order.items || []).reduce((sum, item) => sum + (item.unitPrice || item.price || 0) * (item.quantity || item.qty || 1), 0);
  const tax = order.tax || Math.round(subtotal * 0.05);
  const totalOriginalPrice = (order.items || []).reduce((sum, item) => sum + (item.originalPrice || Math.round((item.unitPrice || item.price || 0) * 1.25)) * (item.quantity || item.qty || 1), 0);
  const savedAmount = Math.max(0, totalOriginalPrice - subtotal);

  const openCancelModal = (orderItemId) => {
    setCancelModal({ open: true, orderItemId });
    setCancelReason("Ordered by mistake");
    setCancelNotes("");
  };

  const submitCancelItem = async (e) => {
    e.preventDefault();
    if (!cancelModal.orderItemId) return;
    try {
      setSubmittingCancel(true);
      const res = await axios.post(
        `${backendUrl}/api/order/cancel-item`,
        { orderItemId: cancelModal.orderItemId, reason: `${cancelReason}${cancelNotes ? ` - ${cancelNotes}` : ""}` },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(res.data.message || "Item cancelled successfully");
        setCancelModal({ open: false, orderItemId: null });
        fetchOrderDetails();
      } else {
        toast.error(res.data.message || "Failed to cancel item");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error cancelling item");
    } finally {
      setSubmittingCancel(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D14] px-4 sm:px-6 lg:px-8 py-6 text-slate-800 dark:text-slate-100 transition-colors duration-200 text-left">
      <div className="mx-auto max-w-[1350px]">
        
        {/* ── UNIFIED MASTER SINGLE CONTAINER CARD ── */}
        <div className="bg-white dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-sm p-5 sm:p-6 shadow-xs space-y-6">
          
          {/* 1. MASTER HEADER BAR */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/orderdetail")}
                className="h-8 w-8 rounded-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition cursor-pointer shrink-0 border border-slate-200/60 dark:border-slate-700/60"
                title="Back to Orders"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Order #{String(order.orderNumber || order._id).slice(-8).toUpperCase()}
                  </h1>
                  <span className={`px-2.5 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-wider ${
                    matchedReq
                      ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30"
                      : (order.orderStatus || "").toLowerCase() === "delivered"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : (order.orderStatus || "").toLowerCase() === "cancelled"
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                      : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30"
                  }`}>
                    {matchedReq ? `${matchedReq.returnType || "RETURN"} ${matchedReq.status || "PENDING"}` : (order.orderStatus || "Placed")}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                  Placed on {formattedDate} at {formattedTime} · ID: <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{order._id}</span>
                  <button
                    onClick={handleCopyId}
                    className="ml-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer inline-flex items-center"
                    title="Copy Order ID"
                  >
                    {copiedId ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                  </button>
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChatSidebarState("open")}
                title="Open Order Chat Support"
                className="h-8 w-8 rounded-sm bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center transition cursor-pointer relative shadow-2xs"
              >
                <MessageSquare size={16} />
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-emerald-500 rounded-full animate-ping" />
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-emerald-500 rounded-full" />
              </button>
              <button
                onClick={() => {
                  toast.info("Downloading Invoice PDF... 📄");
                  window.open(`${backendUrl}/api/invoice/download/${order._id}?token=${token}`, "_blank");
                }}
                className="px-3 py-1.5 rounded-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer flex items-center gap-1.5 border border-slate-200/80 dark:border-slate-700"
              >
                <FileText size={13} />
                <span>Invoice PDF</span>
              </button>
              <button
                onClick={() => navigate(`/track/${order._id}`)}
                className="px-3 py-1.5 rounded-sm bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Truck size={13} />
                <span>Track Package</span>
              </button>
            </div>
          </div>

          {/* 2. COMPACT TIMELINE / RETURN BANNER STRIP */}
          {matchedReq ? (
            <div className={`p-4 rounded-sm border flex flex-wrap items-center justify-between gap-4 ${
              matchedReq.status === "Completed"
                ? "bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/30"
                : "bg-orange-500/10 dark:bg-orange-950/20 border-orange-500/20"
            }`}>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <RotateCcw size={15} className={matchedReq.status === "Completed" ? "text-emerald-600 dark:text-emerald-400" : "text-orange-600 dark:text-orange-400"} />
                  <span className={`text-xs font-black uppercase tracking-wider ${matchedReq.status === "Completed" ? "text-emerald-600 dark:text-emerald-400" : "text-orange-700 dark:text-orange-400"}`}>
                    {matchedReq.returnType || "RETURN"} {matchedReq.status === "Completed" ? "COMPLETED & CREDITED ✓" : `REQUEST (${matchedReq.status || "Approved"})`}
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Claim Reason: {matchedReq.reason || matchedReq.returnReason || "Customer Return Request"}
                </p>
              </div>

              {matchedRMA && (
                <button
                  onClick={() => navigate(`/rma/${matchedRMA._id}`)}
                  className={`px-3.5 py-1.5 rounded-sm font-extrabold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    matchedReq.status === "Completed" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-orange-600 hover:bg-orange-700 text-white"
                  }`}
                >
                  <Truck size={13} />
                  <span>Open Return Dashboard</span>
                  <ChevronRight size={13} />
                </button>
              )}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-sm border border-slate-200/80 dark:border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Fulfillment Stage
                </span>
                <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400">
                  {steps[currentStep]?.label || "Processing"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 relative">
                {steps.map((stg, idx) => {
                  const isActive = idx <= currentStep;
                  const StepIcon = stg.icon;

                  return (
                    <div key={stg.label} className="flex items-center gap-2.5">
                      <div className={`h-7 w-7 rounded-sm flex items-center justify-center text-xs font-black shrink-0 transition ${
                        isActive
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                      }`}>
                        <StepIcon size={13} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-black uppercase tracking-tight truncate ${
                          isActive ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"
                        }`}>
                          {stg.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. BALANCED 2-COLUMN GRID (LEFT: PRODUCTS | RIGHT: SUMMARY & ADDRESS) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1">
            
            {/* LEFT COLUMN: PURCHASED PRODUCTS (7 COLS) */}
            <div className="lg:col-span-7 space-y-4 pr-0 lg:pr-4 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 pb-6 lg:pb-0">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <ShoppingBag size={15} className="text-indigo-600 dark:text-indigo-400" />
                  <span>Purchased Items ({(order.orderItems || order.items || []).length})</span>
                </h2>
              </div>

              <div className="space-y-3">
                {(order.orderItems && order.orderItems.length > 0 ? order.orderItems : order.items).map((item, idx) => {
                  const img = item.productImage || item.image || item.images?.[0];
                  const imageUrl = img?.startsWith("http") ? img : `${backendUrl}/${img}`;
                  const itemTitle = item.productName || item.name;
                  const itemQty = item.quantity || item.qty || 1;
                  const unitPrice = item.unitPrice || item.price;
                  const originalVal = item.originalPrice || Math.round(unitPrice * 1.25);
                  const rawStatus = item.status || order.orderStatus || "Confirmed";
                  const itemStatus = rawStatus;
                  const isShippedOrBeyond = ["shipped", "out for delivery", "delivered"].includes(itemStatus.toLowerCase());
                  const isDelivered = itemStatus.toLowerCase() === "delivered";
                  const isCancelled = itemStatus.toLowerCase() === "cancelled";

                  return (
                    <div
                      key={item._id || idx}
                      className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-sm border border-slate-200/80 dark:border-slate-800/80 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Link
                            to={`/product/${item.productId}`}
                            className="h-12 w-12 rounded-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shrink-0 flex items-center justify-center hover:border-indigo-500 transition"
                          >
                            <img src={imageUrl} alt={itemTitle} className="h-full w-full object-contain rounded-sm" />
                          </Link>

                          <div className="min-w-0">
                            <Link
                              to={`/product/${item.productId}`}
                              className="text-xs font-black text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition truncate block"
                            >
                              {itemTitle}
                            </Link>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                              <span>Qty: {itemQty}</span>
                              <span>·</span>
                              <span>Variant: {item.variant?.size || item.size || "Standard"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-wider inline-block ${
                            isDelivered ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : isCancelled ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                          }`}>
                            {itemStatus}
                          </span>
                          <p className="text-xs font-black text-slate-900 dark:text-white mt-1">
                            ₹{(item.finalPrice || unitPrice * itemQty).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400 font-semibold text-[10px]">
                          Courier: {item.courierName || "Express Shipping"}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/product/${item.productId}`)}
                            className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900 text-[10px] font-extrabold uppercase rounded-sm hover:bg-indigo-100 transition"
                          >
                            Buy Again
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: UNIFIED ADDRESS, PAYMENT & BILL SUMMARY (5 COLS) */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Section A: Delivery Address */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    <MapPin size={14} />
                    <span>Delivery Address</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {currentStep < 2 ? "Editable" : "Locked"}
                  </span>
                </div>
                <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300 font-medium">
                  <p className="font-black text-slate-900 dark:text-white">{order.address.firstName} {order.address.lastName}</p>
                  <p>{order.address.street}, {order.address.city}</p>
                  <p>{order.address.state}, {order.address.country} - {order.address.pincode || "390001"}</p>
                  <p className="text-slate-500 font-bold pt-0.5">📞 {order.address.phone}</p>
                </div>
              </div>

              {/* Section B: Bill Summary */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    <FileText size={14} />
                    <span>Bill Summary</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                    {order.paymentMethod === "cod" ? "COD" : "ONLINE"}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900 dark:text-white">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  {tax > 0 && (
                    <div className="flex justify-between">
                      <span>Taxes & GST (5%)</span>
                      <span className="font-bold text-slate-900 dark:text-white">₹{tax.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping Fee</span>
                    <span className="font-bold text-slate-900 dark:text-white">₹{shippingFee}</span>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex justify-between items-baseline font-black">
                    <span className="text-xs text-slate-900 dark:text-white">Total Amount</span>
                    <span className="text-base text-emerald-600 dark:text-emerald-400 font-mono">₹{order.amount.toLocaleString("en-IN")}</span>
                  </div>

                  {savedAmount > 0 && (
                    <div className="mt-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2 rounded-sm text-[10px] font-bold flex items-center gap-1">
                      <Tag size={11} />
                      <span>You saved ₹{savedAmount.toLocaleString("en-IN")} on this order!</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ── RIGHT SLIDE-OVER SIDEBAR POPUP FOR CHAT ── */}
      {chatSidebarState === "open" && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs transition-opacity">
          <div className="w-full sm:w-[480px] h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Order Support & Merchant Chat
                </h3>
              </div>
              
              <div className="flex items-center gap-1">
                {/* Minimize Button */}
                <button
                  onClick={() => setChatSidebarState("minimized")}
                  title="Minimize Chat"
                  className="p-1.5 rounded-sm text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <Minus size={18} />
                </button>
                {/* Close Button */}
                <button
                  onClick={() => setChatSidebarState("closed")}
                  title="Close Chat"
                  className="p-1.5 rounded-sm text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <OrderCommunication orderId={orderId} fullHeight={true} />
            </div>
          </div>
        </div>
      )}

      {/* ── FLOATING MINIMIZED CHAT BADGE AT BOTTOM RIGHT ── */}
      {chatSidebarState === "minimized" && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <button
            onClick={() => setChatSidebarState("open")}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-black text-xs uppercase tracking-wider shadow-2xl border border-indigo-400/50 flex items-center gap-2.5 cursor-pointer transition transform hover:scale-105"
          >
            <MessageSquare size={16} />
            <span>Order Chat</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          </button>
        </div>
      )}

      {/* CANCEL ITEM MODAL */}
      {cancelModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-sm bg-white dark:bg-slate-900 p-6 text-left shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-sm bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <XCircle size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Cancel Item</h3>
                  <p className="text-[11px] font-bold text-slate-400">Item ID: {cancelModal.orderItemId}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCancelModal({ open: false, orderItemId: null })}
                className="rounded-sm p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submitCancelItem} className="mt-5 space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-sm text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>Are you sure you want to cancel this item? If any payment was made, your refund will be processed automatically.</span>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Reason for Cancellation
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full rounded-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none font-bold cursor-pointer"
                >
                  <option className="bg-white dark:bg-slate-900">Ordered by mistake</option>
                  <option className="bg-white dark:bg-slate-900">Found cheaper price elsewhere</option>
                  <option className="bg-white dark:bg-slate-900">Delivery taking too long</option>
                  <option className="bg-white dark:bg-slate-900">Need to change shipping address / variant</option>
                  <option className="bg-white dark:bg-slate-900">Changed my mind / Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows="3"
                  value={cancelNotes}
                  onChange={(e) => setCancelNotes(e.target.value)}
                  placeholder="Provide additional details if necessary..."
                  className="w-full rounded-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCancelModal({ open: false, orderItemId: null })}
                  className="rounded-sm border border-slate-200 dark:border-slate-800 px-5 py-2 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 cursor-pointer transition"
                >
                  Keep Item
                </button>
                <button
                  type="submit"
                  disabled={submittingCancel}
                  className="rounded-sm bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 text-xs font-extrabold uppercase tracking-wider shadow-md disabled:opacity-60 cursor-pointer transition"
                >
                  {submittingCancel ? "Cancelling..." : "Confirm Cancellation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleOrderDetail;
