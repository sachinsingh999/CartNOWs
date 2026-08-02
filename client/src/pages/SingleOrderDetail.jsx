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
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
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
  const token = localStorage.getItem("token") || "";

  const [returnRequests, setReturnRequests] = useState([]);

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
      const [orderRes, reqRes] = await Promise.all([
        axios.get(`${backendUrl}/api/order/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${backendUrl}/api/rms/request/my-requests`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { success: false, requests: [] } }))
      ]);

      if (reqRes && reqRes.data && reqRes.data.success) {
        setReturnRequests(reqRes.data.requests || []);
      }

      if (orderRes.data.success) {
        setOrder(orderRes.data.order);
      } else if (!isSilent) {
        toast.error("Failed to load order details.");
        navigate("/orderdetail");
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
    const pollInterval = setInterval(() => {
      fetchOrderDetails(true);
    }, 4000);
    return () => clearInterval(pollInterval);
  }, [orderId]);

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
    { label: "Placed", desc: "Order placed successfully", icon: ShoppingBag },
    { label: "Confirmed", desc: "Packed & awaiting pickup", icon: FileText },
    { label: "Shipped", desc: "In transit to hub", icon: Truck },
    { label: "Out For Delivery", desc: "Delivery agent assigned", icon: MapPin },
    { label: "Delivered", desc: "Order completed", icon: ShieldCheck }
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
  const platformFee = 20;
  const shippingFee = order.amount > 519 ? 0 : 40; // Align with place order logic!
  const discount = order.discount || 0;
  const subtotal = Math.max(0, order.amount - shippingFee - platformFee + discount);
  const savedAmount = Math.max(0, Math.round(subtotal * 0.25)); // Estimate original savings

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

  const handleReturnItem = async (orderItemId) => {
    const reason = window.prompt("Please enter a reason for returning this item:", "Product not as expected");
    if (!reason) return;
    try {
      const res = await axios.post(
        `${backendUrl}/api/order/return-item`,
        { orderItemId, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(res.data.message || "Return request submitted");
        fetchOrderDetails();
      } else {
        toast.error(res.data.message || "Failed to submit return request");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error submitting return request");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-8 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Top Full-Width Navigation & Header Bar */}
        <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/orderdetail")}
              className="group inline-flex items-center gap-2 rounded-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 transition hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-950 dark:hover:text-slate-100 cursor-pointer"
            >
              <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-1" />
              <span>Back</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                  Order #{String(order.orderNumber || order._id).slice(-8).toUpperCase()}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-wider ${
                  (order.orderStatus || "").toLowerCase() === "return pending"
                    ? "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50"
                    : (order.orderStatus || "").toLowerCase() === "delivered"
                    ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50"
                    : (order.orderStatus || "").toLowerCase() === "cancelled"
                    ? "bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50"
                    : "bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50"
                }`}>
                  {order.orderStatus || "Placed"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Placed on {formattedDate} at {formattedTime} · Reference: <span className="font-mono">{order._id}</span>
                <button
                  onClick={handleCopyId}
                  className="ml-2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer inline-flex items-center"
                  title="Copy Order ID"
                >
                  {copiedId ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                </button>
              </p>
            </div>
          </div>

          {/* Quick Action Suite */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/track/${order._id}`)}
              className="px-3.5 py-2 rounded-sm bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Truck size={13} />
              <span>Track Order</span>
            </button>
            <button
              onClick={() => {
                const el = document.getElementById("chat-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-3.5 py-2 rounded-sm bg-emerald-50 dark:bg-emerald-950/40 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition cursor-pointer flex items-center gap-1.5"
            >
              <Headset size={13} />
              <span>Order Chat</span>
            </button>
          </div>
        </div>

        {/* 2-COLUMN FULL-WIDTH GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Stepper Progress & Product List (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* ORDER PROGRESS STEPPER CARD */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-md p-6 shadow-xs text-left">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
                Fulfillment Timeline
              </h2>

              <div className="py-2 px-1 relative">
                <div className="flex justify-between items-center w-full">
                  
                  {/* Progress Line */}
                  <div className="absolute top-4.5 left-6 right-6 h-[2px] bg-slate-100 dark:bg-slate-800 z-0" />
                  <div
                    className="absolute top-4.5 left-6 h-[2px] bg-[#4f46e5] dark:bg-indigo-500 z-0 transition-all duration-500"
                    style={{ width: `calc(${(currentStep / 4)} * (100% - 48px))` }}
                  />

                  {steps.map((step, index) => {
                    const isActive = index <= currentStep;
                    const StepIcon = step.icon;

                    let stepDate = "Pending";
                    let stepTime = "";

                    if (isActive) {
                      const baseTs = new Date(order.createdAt || order.date || Date.now()).getTime();
                      let stepTs = baseTs;

                      if (index === 0) stepTs = baseTs;
                      else if (index === 1) stepTs = order.confirmedAt ? new Date(order.confirmedAt).getTime() : baseTs + 2 * 60 * 60 * 1000;
                      else if (index === 2) stepTs = order.shippedAt ? new Date(order.shippedAt).getTime() : baseTs + 24 * 60 * 60 * 1000;
                      else if (index === 3) stepTs = order.outForDeliveryAt ? new Date(order.outForDeliveryAt).getTime() : (order.updatedAt ? new Date(order.updatedAt).getTime() : baseTs + 48 * 60 * 60 * 1000);
                      else if (index === 4) stepTs = order.deliveredAt ? new Date(order.deliveredAt).getTime() : (order.updatedAt ? new Date(order.updatedAt).getTime() : baseTs + 72 * 60 * 60 * 1000);

                      const dObj = new Date(stepTs);
                      stepDate = dObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                      stepTime = dObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
                    }
                    
                    return (
                      <div key={index} className="flex flex-col items-center z-10 relative w-16">
                        <div
                          className={`h-9 w-9 rounded-sm flex items-center justify-center border transition-all duration-300 ${
                            isActive
                              ? "bg-[#4f46e5] text-white border-[#4f46e5] shadow-xs"
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600"
                          }`}
                        >
                          <StepIcon size={14} className="stroke-[2.5]" />
                        </div>
                        
                        <span className={`text-[9px] font-black uppercase mt-2 tracking-tight ${isActive ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"}`}>
                          {step.label}
                        </span>
                        
                        <span className="text-[8px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5 leading-none whitespace-nowrap">
                          {stepDate}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order status notification strip */}
              {(() => {
                let statusText = "Your order has been placed successfully.";
                if (currentStep === 1) statusText = "Your order is confirmed and currently being packed.";
                else if (currentStep === 2) statusText = "Your order has been shipped and is in transit.";
                else if (currentStep === 3) statusText = "Your order is Out for Delivery today!";
                else if (currentStep >= 4) statusText = "Your order has been delivered successfully.";
                
                if ((order.orderStatus || "").toLowerCase() === "return pending") {
                  statusText = "Return request submitted. Awaiting merchant / admin review.";
                }

                return (
                  <div className="bg-indigo-500/[0.04] border border-indigo-500/10 rounded-sm p-3 text-xs text-slate-600 dark:text-slate-300 font-medium text-left flex items-center gap-2.5 mt-5">
                    <Clock size={14} className="text-[#4f46e5] shrink-0" />
                    <span>{statusText}</span>
                  </div>
                );
              })()}
            </div>

            {/* ORDERED ITEMS LIST CARD */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-md p-6 shadow-xs text-left space-y-5">
              <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <ShoppingBag size={15} className="text-[#4f46e5]" />
                <span>Purchased Products ({(order.orderItems || order.items || []).length})</span>
              </h2>

            <div className="space-y-4">
              {(order.orderItems && order.orderItems.length > 0 ? order.orderItems : order.items).map((item, idx) => {
                const img = item.productImage || item.image || item.images?.[0];
                const imageUrl = img?.startsWith("http") ? img : `${backendUrl}/${img}`;
                const itemTitle = item.productName || item.name;
                const itemQty = item.quantity || item.qty || 1;
                const unitPrice = item.unitPrice || item.price;
                const originalVal = item.originalPrice || Math.round(unitPrice * 1.25);
                const hasActiveReturnReq = returnRequests.some(
                  (r) =>
                    (String(r.orderId) === String(order._id) || String(r.orderId) === String(order.orderId)) &&
                    (String(r.orderItemId) === String(item._id || item.orderItemId || item.id) ||
                     String(r.productId) === String(item.productId || item._id || item.id) ||
                     (r.itemName && r.itemName === itemTitle)) &&
                    r.status !== "Cancelled"
                );

                const rawStatus = item.status || order.orderStatus || "Confirmed";
                const itemStatus = hasActiveReturnReq ? "Return Pending" : rawStatus;
                const isShippedOrBeyond = ["shipped", "out for delivery", "delivered"].includes(itemStatus.toLowerCase());
                const isDelivered = itemStatus.toLowerCase() === "delivered";
                const isCancelled = itemStatus.toLowerCase() === "cancelled";

                return (
                  <div
                    key={item._id || idx}
                    className="rounded-md border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-[#20202A] p-5 space-y-4 shadow-2xs"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                      
                      {/* Left Product Image & Title */}
                      <div className="flex gap-4 items-center">
                        <Link
                          to={`/product/${item.productId}`}
                          className="h-16 w-16 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shrink-0 flex items-center justify-center cursor-pointer hover:border-indigo-500 transition"
                        >
                          <img src={imageUrl} alt={itemTitle} className="h-full w-full object-contain rounded" />
                        </Link>

                        <div>
                          <Link
                            to={`/product/${item.productId}`}
                            className="text-sm font-black text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition line-clamp-1"
                          >
                            {itemTitle}
                          </Link>
                          
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded">
                              Qty: {itemQty}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded">
                              Variant: {item.variant?.size || item.size || "Standard"}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              Seller: {item.shopName || item.sellerName || "Platform Store"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status & Price */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          isDelivered ? "bg-emerald-600 text-white" : isCancelled ? "bg-rose-600 text-white" : "bg-indigo-600 text-white"
                        }`}>
                          {itemStatus}
                        </span>
                        <div className="mt-1 flex items-baseline gap-1.5">
                          <span className="text-sm font-black text-slate-900 dark:text-white">
                            ₹{(item.finalPrice || unitPrice * itemQty).toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] text-slate-400 line-through">₹{(originalVal * itemQty).toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tracking & Courier Info Strip */}
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold">
                          <Truck size={13} />
                          <span>Courier: {item.courierName || "Express Shipping"}</span>
                        </div>
                        {item.trackingId && (
                          <div className="font-mono text-[11px] bg-slate-200/50 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                            Track ID: {item.trackingId}
                          </div>
                        )}
                      </div>

                      {/* Item Action Buttons */}
                      <div className="flex items-center gap-2">
                        {!isShippedOrBeyond && !isCancelled && (
                          <button
                            onClick={() => openCancelModal(item._id || item.orderItemId)}
                            className="px-3 py-1.5 rounded bg-rose-50 dark:bg-rose-950/20 text-rose-600 border border-rose-200 dark:border-rose-900 text-[10px] font-black uppercase tracking-wider hover:bg-rose-100 transition cursor-pointer"
                          >
                            Cancel Item
                          </button>
                        )}

                        {isCancelled && (
                          <span className="px-3 py-1.5 rounded bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 text-[10px] font-black uppercase tracking-wider">
                            Cancelled
                          </span>
                        )}

                        {["return pending", "return requested"].includes((itemStatus || "").toLowerCase()) && (
                          <span className="px-3 py-1.5 rounded-sm bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 text-[10px] font-black uppercase tracking-wider">
                            Return Pending
                          </span>
                        )}

                        {isDelivered && !["return pending", "return requested", "returned", "return approved"].includes((itemStatus || "").toLowerCase()) && (
                          <button
                            onClick={() => handleReturnItem(item._id || item.orderItemId)}
                            className="px-3 py-1.5 rounded bg-amber-50 dark:bg-amber-950/20 text-amber-600 border border-amber-200 dark:border-amber-900 text-[10px] font-black uppercase tracking-wider hover:bg-amber-100 transition cursor-pointer"
                          >
                            Return Item
                          </button>
                        )}

                        <button
                          onClick={() => navigate(`/product/${item.productId}`)}
                          className="px-3 py-1.5 rounded bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 border border-indigo-200 dark:border-indigo-900 text-[10px] font-black uppercase tracking-wider hover:bg-indigo-100 transition cursor-pointer"
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
        </div>

        {/* Right Section: Delivery Address, Secure Chat, and Pricing Summaries (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Secure Chat Channel collapsible card */}
          <div id="chat-section">
            <OrderCommunication orderId={orderId} />
          </div>
          
          {/* DELIVERY ADDRESS DETAILS CARD */}
          <div className="bg-white dark:bg-[#18181F] border border-slate-200 dark:border-slate-800 rounded-md p-5 shadow-3xs text-left">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[10px] font-black text-slate-800 dark:text-[#FFFFFF] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={13} className="text-[#4f46e5]" />
                <span>Delivery Address</span>
              </h2>
              
              {currentStep < 2 ? (
                <button
                  type="button"
                  onClick={() => navigate(`/orderdetail`)}
                  className="border border-indigo-200 dark:border-slate-800 text-[#4f46e5] hover:bg-indigo-50/50 px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1 cursor-pointer transition shadow-3xs leading-none"
                >
                  <Edit2 size={9} />
                  <span>Edit</span>
                </button>
              ) : (
                <span className="text-[9px] font-bold text-slate-400 dark:text-[#8E8EA0] bg-slate-100 dark:bg-[#20202A] px-2 py-0.5 rounded">
                  Address Locked
                </span>
              )}
            </div>

            <div className="flex gap-3 text-xs text-slate-600 dark:text-[#CFCFD8] font-semibold leading-relaxed">
              <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-[#4f46e5] flex items-center justify-center shrink-0 border border-indigo-100/50">
                <MapPin size={13} className="text-[#4f46e5]" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-905 dark:text-[#FFFFFF] text-xs">{order.address.firstName} {order.address.lastName}</span>
                  <span className="bg-indigo-500/10 text-[#4f46e5] px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wide leading-none">Home</span>
                </div>
                <p className="text-[11px] leading-tight text-slate-500 dark:text-[#CFCFD8]">{order.address.street}, {order.address.city}</p>
                <p className="text-[11px] leading-none text-slate-550 dark:text-[#CFCFD8] mt-1">{order.address.state}, {order.address.country} - {order.address.pincode || "390001"}</p>
                <p className="pt-2 text-[10px] text-slate-500 dark:text-[#8E8EA0] flex items-center gap-1 leading-none font-bold">
                  <span>📞 {order.address.phone}</span>
                </p>
              </div>
            </div>

            {/* Split calendar details under delivery info */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4 grid grid-cols-2 gap-3 text-xs font-semibold text-slate-500 dark:text-[#8E8EA0]">
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-[#8E8EA0] flex items-center gap-1">
                  <Calendar size={11} className="text-slate-400 dark:text-[#8E8EA0]" />
                  Order Placed
                </span>
                <p className="text-slate-900 dark:text-[#FFFFFF] font-black">{formattedDate}</p>
                <p className="text-[9px] text-slate-400 dark:text-[#8E8EA0] leading-none mt-0.5">at {formattedTime}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-[#8E8EA0] flex items-center gap-1">
                  <CreditCard size={11} className="text-slate-405 dark:text-[#8E8EA0]" />
                  Payment Option
                </span>
                <p className="text-slate-900 dark:text-[#FFFFFF] font-black uppercase">{order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod}</p>
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-wide bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 text-emerald-600">
                  COD
                </span>
              </div>
            </div>
          </div>

          {/* BILL SUMMARY CONTAINER CARD */}
          <div className="bg-white dark:bg-[#18181F] border border-slate-200 dark:border-slate-800 rounded-md p-5 shadow-3xs text-left space-y-3.5">
            <h2 className="text-[10px] font-black text-slate-800 dark:text-[#FFFFFF] uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
              <FileText size={13} className="text-[#4f46e5]" />
              <span>Bill Summary</span>
            </h2>

            <div className="space-y-2 text-xs font-semibold text-slate-500 dark:text-[#8E8EA0]">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="text-slate-800 dark:text-[#CFCFD8] font-bold">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Charges</span>
                <span className="text-slate-800 dark:text-[#CFCFD8] font-bold">₹{shippingFee}</span>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 my-2 pt-2.5 flex justify-between items-baseline">
                <span className="text-[11px] font-black text-slate-800 dark:text-[#FFFFFF]">Total Bill</span>
                <span className="text-lg font-black text-slate-900 dark:text-[#FFFFFF]">₹{order.amount.toLocaleString("en-IN")}</span>
              </div>
              
              {/* You saved green highlight alert tag */}
              <div className="mt-4 bg-emerald-500/[0.04] text-emerald-600 border border-emerald-500/10 rounded p-2.5 text-[10px] font-bold flex items-center gap-1.5">
                <Tag size={11} className="text-emerald-500" />
                <span>You saved ₹{savedAmount.toLocaleString("en-IN")} on this order!</span>
              </div>
            </div>
          </div>

          {/* BOTTOM GUARANTEES TRUST DECK */}
          <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18181F] p-4 shadow-3xs text-left">
            <div className="grid grid-cols-2 gap-4 text-[9px] font-semibold text-slate-500 dark:text-[#8E8EA0]">
              {/* Insured Delivery */}
              <div className="flex items-start gap-2.5">
                <div className="h-7 w-7 rounded bg-slate-50 dark:bg-[#20202A] flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800 text-blue-500">
                  <ShieldCheck size={13} className="stroke-[2.5]" />
                </div>
                <div>
                  <span className="font-black text-slate-900 dark:text-[#FFFFFF] block">Secure Payments</span>
                  <span className="text-slate-400 dark:text-[#8E8EA0] block mt-0.5 leading-tight font-semibold">100% secure payments</span>
                </div>
              </div>

              {/* 30-day Returns */}
              <div className="flex items-start gap-2.5">
                <div className="h-7 w-7 rounded bg-slate-50 dark:bg-[#20202A] flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800 text-blue-500">
                  <Truck size={13} className="stroke-[2.5]" />
                </div>
                <div>
                  <span className="font-black text-slate-900 dark:text-[#FFFFFF] block">Fast Delivery</span>
                  <span className="text-slate-400 dark:text-[#8E8EA0] block mt-0.5 leading-tight font-semibold">Quick and reliable shipping</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 mt-2 border-t border-slate-50 dark:border-slate-800/50 pt-2.5 col-span-2 grid grid-cols-2">
                <div className="flex items-start gap-2.5">
                  <div className="h-7 w-7 rounded bg-slate-50 dark:bg-[#20202A] flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800 text-blue-500">
                    <Headset size={13} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="font-black text-slate-900 dark:text-[#FFFFFF] block">24/7 Support</span>
                    <span className="text-slate-400 dark:text-[#8E8EA0] block mt-0.5 leading-tight font-semibold">We're here to help you</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="h-7 w-7 rounded bg-slate-50 dark:bg-[#20202A] flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800 text-blue-500">
                    <RotateCcw size={13} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="font-black text-slate-900 dark:text-[#FFFFFF] block">Easy Returns</span>
                    <span className="text-slate-400 dark:text-[#8E8EA0] block mt-0.5 leading-tight font-semibold">Hassle-free return policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* CANCEL ITEM MODAL */}
      {cancelModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 text-left shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
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
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
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
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition font-bold focus:ring-2 focus:ring-rose-500 cursor-pointer"
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
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-sm text-slate-900 dark:text-slate-100 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCancelModal({ open: false, orderItemId: null })}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 cursor-pointer transition"
                >
                  Keep Item
                </button>
                <button
                  type="submit"
                  disabled={submittingCancel}
                  className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider shadow-md shadow-rose-600/20 disabled:opacity-60 cursor-pointer transition active:scale-95"
                >
                  {submittingCancel ? "Cancelling..." : "Confirm Cancellation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default SingleOrderDetail;
