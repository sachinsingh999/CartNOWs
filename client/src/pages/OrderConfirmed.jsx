import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { 
  CheckCircle2, 
  ShoppingBag, 
  ArrowRight, 
  MapPin, 
  CreditCard, 
  HelpCircle,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Truck,
  Calendar,
  KeyRound,
  AlarmClock,
  Loader2,
  FileText,
  User,
  RotateCcw,
  MessageSquare,
  ChevronRight,
  Printer,
  Package,
  Clock,
  Phone,
  Mail,
  ExternalLink,
  Shield,
  Box,
  PackageCheck
} from "lucide-react";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import { authApi, orderApi, productApi } from "../services";
import confetti from "canvas-confetti";

const OrderConfirmed = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [deliveryVerificationKey, setDeliveryVerificationKey] = useState("");
  const [productImagesMap, setProductImagesMap] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const resData = await authApi.getProfile();
        if (resData.success && resData.user) {
          setDeliveryVerificationKey(resData.user.deliveryVerificationKey || "");
        }
      } catch (err) {
        console.log("FETCH PROFILE ERROR 👉", err);
      }
    };
    fetchProfile();
  }, []);

  // Celebratory confetti burst on order confirmation
  useEffect(() => {
    if (order && !loading) {
      try {
        confetti({
          particleCount: 65,
          spread: 75,
          origin: { y: 0.5 },
          colors: ["#22c55e", "#f97316", "#3b82f6", "#eab308", "#a855f7"]
        });
      } catch (e) {}
    }
  }, [order?._id, loading]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        try {
          const singleRes = await orderApi.getOrderById(orderId);
          if (singleRes && singleRes.success && singleRes.order) {
            setOrder(singleRes.order);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn("Direct getOrderById attempt:", e);
        }

        const resData = await orderApi.getUserOrders();
        if (resData && resData.success && resData.orders) {
          const foundOrder = resData.orders.find(
            (o) => String(o._id) === String(orderId) || String(o.orderNumber) === String(orderId)
          );
          if (foundOrder) {
            setOrder(foundOrder);
          } else {
            toast.error("Order details not found.");
          }
        }
      } catch (err) {
        console.log("FETCH ORDER DETAILS ERROR 👉", err);
        toast.error("Failed to load order receipt.");
      } finally {
        setLoading(false);
      }
    };

    if (!order && orderId) {
      fetchOrderDetails();
    }
  }, [orderId, order, navigate]);

  useEffect(() => {
    const hydrateImages = async () => {
      if (!order?.items || !order.items.length) return;
      const idsToFetch = [];
      order.items.forEach((it) => {
        const img = 
          (Array.isArray(it.images) && it.images[0]) ||
          (Array.isArray(it.image) && it.image[0]) ||
          (typeof it.image === "string" && it.image) ||
          (typeof it.productImage === "string" && it.productImage) ||
          (typeof it.images === "string" && it.images) ||
          "";
        if (!img && (it.productId || it._id)) {
          idsToFetch.push(it.productId || it._id);
        }
      });

      if (idsToFetch.length > 0) {
        try {
          const bulkRes = await productApi.getBulkProducts(idsToFetch);
          if (bulkRes.success && bulkRes.products) {
            const map = {};
            bulkRes.products.forEach((p) => {
              const pImg = (Array.isArray(p.images) && p.images[0]) ||
                (Array.isArray(p.image) && p.image[0]) ||
                p.image || p.images || "";
              if (pImg) map[p._id] = pImg;
            });
            setProductImagesMap((prev) => ({ ...prev, ...map }));
          }
        } catch (e) {
          console.warn("Failed to load bulk images for order confirmed:", e);
        }
      }
    };

    hydrateImages();
  }, [order]);

  const handleCopyId = () => {
    const idToCopy = order?.orderNumber || orderId;
    navigator.clipboard.writeText(idToCopy);
    setCopiedId(true);
    toast.success("Order ID copied to clipboard!");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyOtp = (code) => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopiedOtp(true);
      toast.success("Delivery verification PIN copied!");
      setTimeout(() => setCopiedOtp(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center transition-colors duration-200">
        <div className="relative flex items-center justify-center mb-4">
          <div className="h-14 w-14 rounded-full border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 animate-spin" />
          <ShoppingBag className="h-6 w-6 text-indigo-600 dark:text-indigo-400 absolute" />
        </div>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Retrieving order receipt...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-4 transition-colors duration-200">
        <HelpCircle size={40} className="text-amber-500 mb-3" />
        <h2 className="text-lg font-black text-slate-900 dark:text-white">Order Receipt Not Found</h2>
        <div className="flex gap-3 mt-5">
          <button
            onClick={() => navigate("/orders")}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm cursor-pointer"
          >
            View Orders
          </button>
          <button
            onClick={() => navigate("/product")}
            className="rounded-lg bg-slate-200 dark:bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // Address parsing
  const addr = order.shippingAddress || order.address || {};
  const recipientName = `${addr.firstName || addr.name || "Valued Customer"} ${addr.lastName || ""}`.trim();
  const recipientPhone = addr.phone || addr.mobile || addr.contactNumber || "";
  const recipientEmail = addr.email || order.userId?.email || "";
  const streetLine = addr.street || addr.addressLine1 || addr.address || "";
  const cityStateZip = [addr.city, addr.state, addr.zipcode || addr.pincode || addr.zip].filter(Boolean).join(", ");

  // Financial calculations
  const platformFee = 20;
  const shippingFee = order.amount > 519 ? 0 : 40;
  const discount = order.discount || 0;
  const subtotal = order.subtotal || Math.max(0, order.amount - shippingFee - platformFee + discount);

  // Delivery estimation
  const orderDate = new Date(order.createdAt || Date.now());
  const orderDateStr = orderDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const expectedDelivery = new Date(order.createdAt || Date.now());
  expectedDelivery.setDate(expectedDelivery.getDate() + 7);
  const expectedDeliveryStr = expectedDelivery.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Timeline Step Status Mapping (5 Steps: 0: PLACED, 1: PACKED, 2: SHIPPED, 3: OUT FOR DELIVERY, 4: DELIVERED)
  const normalizedStatus = (order.orderStatus || "Placed").toLowerCase();
  let currentStep = 0;
  if (normalizedStatus.includes("delivered") || normalizedStatus.includes("completed")) currentStep = 4;
  else if (normalizedStatus.includes("out for delivery")) currentStep = 3;
  else if (normalizedStatus.includes("shipped") || normalizedStatus.includes("transit")) currentStep = 2;
  else if (normalizedStatus.includes("processing") || normalizedStatus.includes("packed") || normalizedStatus.includes("packing")) currentStep = 1;
  else currentStep = 0;

  const steps = [
    { label: "PLACED", desc: "Order placed", icon: ShoppingBag },
    { label: "PACKED", desc: "Preparing your item", icon: Box },
    { label: "SHIPPED", desc: "On its way", icon: Truck },
    { label: "OUT FOR DELIVERY", desc: "Arriving today", icon: MapPin },
    { label: "DELIVERED", desc: "Order received", icon: PackageCheck }
  ];

  const getFormattedStepDate = (idx) => {
    const created = new Date(order.createdAt || Date.now());
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

  const deliveryOtp = order.verificationCode || order.deliveryOtp || deliveryVerificationKey || "";

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 px-0 sm:px-6 lg:px-8 xl:px-10 py-0 sm:py-6 text-left select-none transition-colors duration-200 text-slate-800 dark:text-slate-100 font-sans">
      
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .no-print, header, nav, footer, button { display: none !important; }
        }
      `}</style>

      {/* Main Container - Zero gaps between components */}
      <div className="max-w-7xl mx-auto space-y-0 divide-y-0">

        {/* 1. HERO BANNER - Centered Green Tick in Circle & Zero Gap */}
        <div className="bg-white dark:bg-slate-900 rounded-none sm:rounded-2xl p-6 sm:p-8 shadow-xs text-center flex flex-col items-center justify-center">
          
          {/* Green Tick in Middle in Circle */}
          <div className="relative flex items-center justify-center mb-4">
            <span className="absolute h-18 w-18 sm:h-20 sm:w-20 rounded-full bg-emerald-500/20 animate-ping opacity-60" />
            <div className="relative flex h-16 w-16 sm:h-18 sm:w-18 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
              <Check size={32} className="stroke-[3.5]" />
            </div>
          </div>

          {/* Heading & Subtitle */}
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Order Confirmed!
            </h1>
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Verified
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed max-w-lg">
            Thank you for your purchase! We've received your order and are dispatching your items.
            {recipientEmail && (
              <span className="block text-slate-400 dark:text-slate-500 text-xs mt-0.5">
                Receipt sent to <span className="font-semibold text-slate-700 dark:text-slate-300">{recipientEmail}</span>.
              </span>
            )}
          </p>

          {/* Centered Order Details Pills (Est Delivery, Order ID, Print) */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mt-4 no-print">
            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl px-3.5 py-2 flex items-center gap-2">
              <Calendar size={15} className="text-indigo-600 dark:text-indigo-400 shrink-0 stroke-[2.5]" />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Est. Delivery:</span>
              <span className="text-xs font-black text-slate-900 dark:text-white">{expectedDeliveryStr}</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl px-3.5 py-2 flex items-center gap-2">
              <FileText size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Order ID:</span>
              <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                #{String(order.orderNumber || order._id || orderId).slice(-8).toUpperCase()}
              </span>
              <button
                onClick={handleCopyId}
                className="ml-1 text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                title="Copy Order ID"
              >
                {copiedId ? <Check size={12} className="text-emerald-500 stroke-[3]" /> : <Copy size={12} />}
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="Print or Save Invoice"
            >
              <Printer size={14} className="stroke-[2.5]" />
              <span>Print Invoice</span>
            </button>
          </div>

        </div>

        {/* 2. REFINED ORDER TRACKING UI - Compact reference design */}
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

        {/* 3. MAIN 2-COLUMN SECTION - Zero Gap Between Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-start">
          
          {/* LEFT: Items List (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-4 sm:p-6 space-y-0">
            
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <Package size={17} className="text-indigo-600 dark:text-indigo-400 stroke-[2.5]" />
                <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Items Purchased ({order.items?.length || 0})
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-bold">{orderDateStr}</span>
            </div>

            {/* Items */}
            <div className="space-y-4 pt-2">
              {order.items?.map((item, idx) => {
                const resolvedImg = 
                  (Array.isArray(item.images) && item.images[0]) ||
                  (Array.isArray(item.image) && item.image[0]) ||
                  (typeof item.image === "string" && item.image) ||
                  (typeof item.productImage === "string" && item.productImage) ||
                  (typeof item.images === "string" && item.images) ||
                  productImagesMap[item.productId || item._id] ||
                  "";

                let finalSrc = "https://placehold.co/100x100?text=Product";
                if (resolvedImg) {
                  finalSrc = (resolvedImg.startsWith("http") || resolvedImg.startsWith("data:"))
                    ? resolvedImg
                    : `${backendUrl}/${resolvedImg.replace(/^\//, '')}`;
                }

                const lineTotal = (item.price || 0) * (item.qty || 1);

                return (
                  <div
                    key={`${item.productId || item.name}-${item.size}-${idx}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2"
                  >
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <Link
                        to={item.productId ? `/product/${item.productId}` : "#"}
                        className="h-18 w-18 rounded-xl bg-slate-50 dark:bg-slate-950 p-1 flex items-center justify-center shrink-0 overflow-hidden"
                      >
                        <img
                          src={finalSrc}
                          alt={item.name}
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/100x100?text=Product";
                          }}
                        />
                      </Link>

                      <div className="min-w-0 flex-1">
                        <Link 
                          to={item.productId ? `/product/${item.productId}` : "#"}
                          className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition leading-snug line-clamp-2"
                        >
                          {item.name}
                        </Link>

                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                          {item.size && (
                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px]">
                              Size: {item.size}
                            </span>
                          )}
                          <span>Qty: {item.qty || 1}</span>
                          <span>•</span>
                          <span>₹{(item.price || 0).toLocaleString("en-IN")}</span>
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

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-1 sm:pt-0 no-print">
                      <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                        ₹{lineTotal.toLocaleString("en-IN")}
                      </span>

                      <button
                        onClick={() =>
                          navigate(`/track/${order._id}`, {
                            state: {
                              item: {
                                ...item,
                                orderId: order._id,
                                status: order.orderStatus,
                                paymentMethod: order.paymentMethod,
                                price: item.price,
                              },
                            },
                          })
                        }
                        className="inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                      >
                        <Truck size={12} />
                        <span>Track</span>
                        <ChevronRight size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-2.5 no-print">
              <button
                onClick={() => navigate(`/track/${order._id}`)}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3 px-4 text-xs font-black text-white uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                <Truck size={15} />
                <span>Track Shipment</span>
              </button>

              <button
                onClick={() => navigate(`/order/${order._id || orderId}`)}
                className="rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 py-3 px-4 text-xs font-black text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <MessageSquare size={15} className="text-slate-400" />
                <span>Order Help</span>
              </button>

              <button
                onClick={() => navigate("/product")}
                className="rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 py-3 px-4 text-xs font-black text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <ShoppingBag size={15} className="text-slate-400" />
                <span>Shop More</span>
              </button>
            </div>

          </div>

          {/* RIGHT: Receipt & Address (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-4 sm:p-6 space-y-4">
            
            {/* Payment Receipt */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Receipt Summary
                  </h3>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Official
                </span>
              </div>

              <div className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span className="text-slate-900 dark:text-white font-black">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>Discount</span>
                    <span className="font-black">- ₹{discount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span>Delivery Charges</span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase bg-emerald-500/10 px-2 py-0.5 rounded">
                      FREE
                    </span>
                  ) : (
                    <span className="text-slate-900 dark:text-white font-bold">₹{shippingFee}</span>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span>Platform Fee</span>
                  <span className="text-slate-900 dark:text-white font-bold">₹{platformFee}</span>
                </div>

                {/* Total box */}
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
              </div>

              {/* Payment Details */}
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
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl space-y-1">
                <span className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1">
                  <MapPin size={11} className="text-indigo-600 dark:text-indigo-400" />
                  Delivery Address
                </span>
                <p className="font-bold text-xs text-slate-900 dark:text-white">{recipientName}</p>
                {streetLine && <p className="text-xs text-slate-600 dark:text-slate-300">{streetLine}</p>}
                {cityStateZip && <p className="text-xs text-slate-500 dark:text-slate-400">{cityStateZip}</p>}
                {recipientPhone && <p className="text-[11px] text-slate-400">Contact: {recipientPhone}</p>}
              </div>

              {/* Delivery Handover PIN Card - Inside Right Column under Delivery Address */}
              {deliveryOtp && (
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
                    {copiedOtp ? <Check size={12} className="text-emerald-500 stroke-[3]" /> : <Copy size={12} />}
                    <span>{copiedOtp ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              )}

              {/* Trust badges */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={13} className="text-emerald-500" />
                  100% Genuine Guarantee
                </span>
                <Link to="/help" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1">
                  <span>Help</span>
                  <ExternalLink size={10} />
                </Link>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default OrderConfirmed;
