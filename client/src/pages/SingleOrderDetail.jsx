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
  Minus,
  KeyRound,
  Download,
  Box,
  PackageCheck,
  Phone
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

  const handleCopyOtp = (code) => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      toast.success("Verification PIN copied!");
      setTimeout(() => setCopiedCode(false), 2000);
    }
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
    { label: "PLACED", desc: "Order placed", icon: ShoppingBag },
    { label: "PACKED", desc: "Preparing your item", icon: Box },
    { label: "SHIPPED", desc: "On its way", icon: Truck },
    { label: "OUT FOR DELIVERY", desc: "Arriving today", icon: MapPin },
    { label: "DELIVERED", desc: "Order received", icon: PackageCheck }
  ];

  const getFormattedStepDate = (idx) => {
    if (!order || !order.createdAt) return "";
    const created = new Date(order.createdAt);
    
    // Day offsets matching realistic timeline:
    // Placed: Day 0, Packed: Day 0, Shipped: Day 1, Out for Delivery: Day 2, Delivered: Day 2
    const dayOffsets = [0, 0, 1, 2, 2];
    const targetDate = new Date(created.getTime() + (dayOffsets[idx] || 0) * 24 * 60 * 60 * 1000);
    
    const isPassed = idx < currentStep;
    const isCurrent = idx === currentStep;

    if (isPassed || isCurrent) {
      return targetDate.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short"
      });
    } else {
      const estStr = targetDate.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short"
      });
      return `Est. ${estStr}`;
    }
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  const formattedTime = new Date(order.createdAt).toLocaleTimeString("en-IN", {
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

  // Address parsing
  const addr = order.shippingAddress || order.address || {};
  const recipientName = `${addr.firstName || addr.name || "Customer"} ${addr.lastName || ""}`.trim();
  const recipientPhone = addr.phone || addr.mobile || "";
  const streetLine = addr.street || addr.addressLine1 || addr.address || "";
  const cityStateZip = [addr.city, addr.state, addr.zipcode || addr.pincode || addr.zip].filter(Boolean).join(", ");
  const deliveryOtp = order.verificationCode || order.deliveryOtp || "";

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 px-0 sm:px-6 lg:px-8 xl:px-10 py-0 sm:py-6 text-slate-800 dark:text-slate-100 transition-colors duration-200 text-left font-sans">
      <div className="max-w-7xl mx-auto space-y-0 divide-y-0">
        
        {/* 1. MASTER HEADER BAR - Borderless & Zero Gap */}
        <div className="bg-white dark:bg-slate-900 rounded-none sm:rounded-2xl p-4 sm:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => navigate("/orderdetail")}
              className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition cursor-pointer shrink-0"
              title="Back to Orders"
            >
              <ArrowLeft size={16} />
            </button>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Order #{String(order.orderNumber || order._id).slice(-8).toUpperCase()}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  matchedReq
                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                    : (order.orderStatus || "").toLowerCase() === "delivered"
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : (order.orderStatus || "").toLowerCase() === "cancelled"
                    ? "bg-rose-500/10 text-rose-700 dark:text-rose-400"
                    : "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"
                }`}>
                  {matchedReq ? `${matchedReq.returnType || "RETURN"} ${matchedReq.status || "PENDING"}` : (order.orderStatus || "Placed")}
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5 flex items-center gap-2 flex-wrap">
                <span>Placed on {formattedDate} at {formattedTime}</span>
                <span>•</span>
                <span className="font-mono text-slate-600 dark:text-slate-400">ID: #{String(order._id).slice(-8).toUpperCase()}</span>
                <button
                  onClick={handleCopyId}
                  className="text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                  title="Copy Full ID"
                >
                  {copiedId ? <Check size={12} className="text-emerald-500 stroke-[3]" /> : <Copy size={12} />}
                </button>
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setChatSidebarState("open")}
              title="Open Support Chat"
              className="h-9 px-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-2xs"
            >
              <MessageSquare size={14} />
              <span>Chat Support</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </button>

            <button
              onClick={() => {
                toast.info("Downloading Invoice PDF... 📄");
                window.open(`${backendUrl}/api/invoice/download/${order._id}?token=${token}`, "_blank");
              }}
              className="h-9 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer flex items-center gap-1.5"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Invoice</span>
            </button>

            <button
              onClick={() => navigate(`/track/${order._id}`)}
              className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Truck size={14} />
              <span>Track Live</span>
            </button>
          </div>

        </div>

        {/* 2. REFINED TIMELINE PROGRESS RAIL - Seamless & Zero Gap */}
        {matchedReq ? (
          <div className={`p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 ${
            matchedReq.status === "Completed"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "bg-orange-500/10 text-orange-700 dark:text-orange-300"
          }`}>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <RotateCcw size={16} />
                <span className="text-xs font-black uppercase tracking-wider">
                  {matchedReq.returnType || "RETURN"} {matchedReq.status === "Completed" ? "COMPLETED & REFUNDED ✓" : `REQUEST (${matchedReq.status || "Approved"})`}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Reason: {matchedReq.reason || matchedReq.returnReason || "Customer Return Request"}
              </p>
            </div>

            {matchedRMA && (
              <button
                onClick={() => navigate(`/rma/${matchedRMA._id}`)}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>View Return Dashboard</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-none sm:rounded-2xl px-4 py-3 sm:px-6 sm:py-4 shadow-xs">
            <div className="w-full">
              
              {/* Compact Stepper matching reference design */}
              <div className="overflow-x-auto pb-1 -mb-1 scrollbar-none">
                <div className="min-w-[500px] sm:min-w-0 relative py-1 sm:py-1.5">
                  
                  {/* Continuous Connecting Line passing through the centers of all 5 circles */}
                  <div className="absolute top-4 sm:top-[18px] left-[10%] right-[10%] h-[2px] bg-slate-200 dark:bg-slate-700 -translate-y-1/2 z-0 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${Math.min(100, Math.max(0, (currentStep / (steps.length - 1)) * 100))}%` }}
                    />
                  </div>

                  {/* 5 Milestone Columns */}
                  <div className="grid grid-cols-5 gap-1 relative z-10">
                    {steps.map((stg, idx) => {
                      const isPassed = idx < currentStep;
                      const isCurrent = idx === currentStep;
                      const StepIcon = stg.icon;

                      return (
                        <div key={stg.label} className="flex flex-col items-center text-center">
                          {/* Circle Node Icon - Compact */}
                          <div
                            className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                              isPassed
                                ? "bg-emerald-500 text-white shadow-xs"
                                : isCurrent
                                ? "bg-indigo-600 text-white shadow-md ring-4 ring-indigo-100 dark:ring-indigo-950/70"
                                : "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500"
                            }`}
                          >
                            {isPassed ? (
                              <Check size={14} className="stroke-[3]" />
                            ) : (
                              <StepIcon size={14} className={isCurrent ? "stroke-[2.5]" : "stroke-[2] text-slate-500 dark:text-slate-400"} />
                            )}
                          </div>

                          {/* Title & Description */}
                          <div className="mt-1.5 text-center w-full px-0.5">
                            <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-900 dark:text-white truncate">
                              {stg.label}
                            </p>
                            <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate hidden sm:block">
                              {stg.desc}
                            </p>
                          </div>

                          {/* Date Pill with Calendar Icon */}
                          <div className="mt-1.5 flex justify-center w-full">
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-semibold border transition-colors ${
                              isPassed
                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/40"
                                : isCurrent
                                ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-800/40"
                                : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200/50 dark:border-slate-700/60"
                            }`}>
                              <Calendar size={10} className={isPassed ? "text-emerald-600 dark:text-emerald-400" : isCurrent ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"} />
                              <span>{getFormattedStepDate(idx)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 3. BALANCED 2-COLUMN SECTION (Zero Gap) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-start">
          
          {/* LEFT: Purchased Items (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-4 sm:p-6 space-y-3">
            
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Package size={17} className="text-indigo-600 dark:text-indigo-400 stroke-[2.5]" />
                <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Items Purchased ({(order.orderItems || order.items || []).length})
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-bold">{formattedDate}</span>
            </div>

            {/* Product Cards */}
            <div className="space-y-4 pt-1">
              {(order.orderItems && order.orderItems.length > 0 ? order.orderItems : order.items).map((item, idx) => {
                const img = item.productImage || item.image || item.images?.[0];
                const imageUrl = img?.startsWith("http") ? img : `${backendUrl}/${img}`;
                const itemTitle = item.productName || item.name;
                const itemQty = item.quantity || item.qty || 1;
                const unitPrice = item.unitPrice || item.price;
                const itemStatus = item.status || order.orderStatus || "Confirmed";
                const isDelivered = itemStatus.toLowerCase() === "delivered";
                const isCancelled = itemStatus.toLowerCase() === "cancelled";

                return (
                  <div
                    key={item._id || idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2"
                  >
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <Link
                        to={`/product/${item.productId}`}
                        className="h-18 w-18 rounded-xl bg-slate-50 dark:bg-slate-950 p-1 flex items-center justify-center shrink-0 overflow-hidden"
                      >
                        <img
                          src={imageUrl}
                          alt={itemTitle}
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/100x100?text=Product";
                          }}
                        />
                      </Link>

                      <div className="min-w-0 flex-1">
                        <Link 
                          to={`/product/${item.productId}`}
                          className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition leading-snug line-clamp-2"
                        >
                          {itemTitle}
                        </Link>

                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px]">
                            Qty: {itemQty}
                          </span>
                          {item.variant?.size || item.size ? (
                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px]">
                              Size: {item.variant?.size || item.size}
                            </span>
                          ) : null}
                          <span>•</span>
                          <span>₹{(unitPrice || 0).toLocaleString("en-IN")}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                            <ShieldCheck size={12} />
                            1 Year Warranty
                          </span>
                          <span className="text-slate-400 text-[10px]">• 7-Day Easy Return</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-1 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider block sm:inline-block mb-1 ${
                          isDelivered ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : isCancelled ? "bg-rose-500/10 text-rose-700 dark:text-rose-400" : "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"
                        }`}>
                          {itemStatus}
                        </span>
                        <p className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                          ₹{(item.finalPrice || unitPrice * itemQty).toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {!isCancelled && currentStep < 2 && (
                          <button
                            onClick={() => openCancelModal(item._id)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[10px] font-bold rounded-lg transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/product/${item.productId}`)}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-[10px] font-bold rounded-lg transition cursor-pointer"
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

          {/* RIGHT: Address, Payment & Bill Summary (5 Cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-4 sm:p-6 space-y-4">
            
            {/* Bill Summary */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Bill Summary
                  </h3>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>

              <div className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span className="text-slate-900 dark:text-white font-black">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>

                {tax > 0 && (
                  <div className="flex justify-between items-center">
                    <span>Taxes & GST (5%)</span>
                    <span className="font-bold text-slate-900 dark:text-white">₹{tax.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span>Shipping Fee</span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase bg-emerald-500/10 px-2 py-0.5 rounded">
                      FREE
                    </span>
                  ) : (
                    <span className="text-slate-900 dark:text-white font-bold">₹{shippingFee}</span>
                  )}
                </div>

                {/* Total Box */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl flex justify-between items-baseline mt-2">
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block">
                      Total Paid
                    </span>
                    <span className="text-[9px] text-slate-400 block font-medium">
                      (All taxes included)
                    </span>
                  </div>
                  <span className="text-lg sm:text-xl font-black text-indigo-600 dark:text-indigo-400">
                    ₹{order.amount.toLocaleString("en-IN")}
                  </span>
                </div>

                {savedAmount > 0 && (
                  <div className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-2 rounded-lg text-[11px] font-bold flex items-center gap-1.5">
                    <Tag size={13} />
                    <span>You saved ₹{savedAmount.toLocaleString("en-IN")} on this order!</span>
                  </div>
                )}
              </div>

              {/* Payment Mode */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard size={15} className="text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-400 block">Payment Mode</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">
                      {order.paymentMethod === "cod" ? "Cash On Delivery" : order.paymentMethod}
                    </span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  order.paymentStatus === "paid" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                }`}>
                  {order.paymentStatus === "paid" ? "Paid" : "Pay On Delivery"}
                </span>
              </div>

              {/* Delivery Address */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl space-y-1 text-xs">
                <span className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1">
                  <MapPin size={11} className="text-indigo-600 dark:text-indigo-400" />
                  Delivery Destination
                </span>
                <p className="font-bold text-xs text-slate-900 dark:text-white">{recipientName}</p>
                {streetLine && <p className="text-xs text-slate-600 dark:text-slate-300">{streetLine}</p>}
                {cityStateZip && <p className="text-xs text-slate-500 dark:text-slate-400">{cityStateZip}</p>}
                {recipientPhone && <p className="text-[11px] text-slate-400 mt-1">Contact: {recipientPhone}</p>}
              </div>

              {/* Delivery Handover PIN Card - Inside Right Column under Delivery Destination */}
              {deliveryOtp && (order.orderStatus || "").toLowerCase() !== "delivered" && (
                <div className="bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 dark:border-amber-500/30 p-3.5 rounded-xl flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <ShieldCheck size={16} className="stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 block">
                        Handover PIN
                      </span>
                      <span className="font-mono text-sm tracking-widest text-amber-600 dark:text-amber-400 font-black">
                        {deliveryOtp}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopyOtp(deliveryOtp)}
                    className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs shrink-0"
                    title="Copy PIN"
                  >
                    {copiedCode ? <Check size={12} className="text-emerald-500 stroke-[3]" /> : <Copy size={12} />}
                    <span>{copiedCode ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              )}

              {/* Trust Guarantees */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={13} className="text-emerald-500" />
                  100% Genuine Guaranteed
                </span>
                <span className="flex items-center gap-1">
                  <RotateCcw size={13} className="text-slate-400" />
                  30-Day Easy Returns
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. BOTTOM HELP & DEDICATED AGENT BAR */}
        <div className="bg-white dark:bg-slate-900 rounded-none sm:rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            Have an issue with this shipment?
          </span>
          <button
            onClick={() => setChatSidebarState("open")}
            className="inline-flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl font-bold cursor-pointer transition shadow-2xs"
          >
            <MessageSquare size={15} />
            <span>Contact Dedicated Agent</span>
          </button>
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
                <button
                  onClick={() => setChatSidebarState("minimized")}
                  title="Minimize Chat"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <Minus size={18} />
                </button>
                <button
                  onClick={() => setChatSidebarState("closed")}
                  title="Close Chat"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
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

      {/* ── FLOATING MINIMIZED CHAT BADGE ── */}
      {chatSidebarState === "minimized" && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <button
            onClick={() => setChatSidebarState("open")}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-black text-xs uppercase tracking-wider shadow-2xl flex items-center gap-2.5 cursor-pointer transition transform hover:scale-105"
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
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 text-left shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
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
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submitCancelItem} className="mt-5 space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
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
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none font-bold cursor-pointer"
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
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCancelModal({ open: false, orderItemId: null })}
                  className="rounded-xl px-5 py-2 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 cursor-pointer transition"
                >
                  Keep Item
                </button>
                <button
                  type="submit"
                  disabled={submittingCancel}
                  className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 text-xs font-extrabold uppercase tracking-wider shadow-md disabled:opacity-60 cursor-pointer transition"
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
