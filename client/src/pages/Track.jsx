import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { backendUrl } from "../config";
import axios from "axios";
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  Copy, 
  HelpCircle, 
  KeyRound, 
  MapPin, 
  Package, 
  RotateCcw, 
  ShieldCheck, 
  Truck, 
  Warehouse, 
  XCircle,
  Check
} from "lucide-react";
import { toast } from "react-toastify";
import { OrderListSkeleton } from "../components/SkeletonLoader";

const defaultSteps = [
  {
    title: "Order Placed",
    description: "Your order has been registered and is awaiting warehouse processing.",
    icon: CheckCircle2,
  },
  {
    title: "Packed",
    description: "Items have been inspected, packed securely, and are ready for carrier pickup.",
    icon: Warehouse,
  },
  {
    title: "Shipped",
    description: "Your package is in transit with our logistics partner towards your destination.",
    icon: Truck,
  },
  {
    title: "Out for Delivery",
    description: "A delivery associate is en route to deliver the package to your address today.",
    icon: MapPin,
  },
  {
    title: "Delivered",
    description: "Package was successfully handed over and signed for at the destination.",
    icon: Package,
  },
];

const Track = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [orderItem, setOrderItem] = useState(location.state?.item || null);
  const [loading, setLoading] = useState(!orderItem);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await axios.post(
          `${backendUrl}/api/order/userOrder`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          const order = response.data.orders.find(o => String(o._id) === String(id));
          if (order) {
            const targetItem = location.state?.item 
              ? order.items.find(it => String(it.productId || it._id) === String(location.state.item.productId || location.state.item._id)) 
              : order.items[0];

            if (targetItem) {
              setOrderItem({
                ...targetItem,
                orderId: order._id,
                status: order.orderStatus || targetItem.status,
                payment: String(order.paymentStatus).toLowerCase() === "paid",
                paymentMethod: order.paymentMethod,
                date: order.createdAt,
                amount: order.amount,
                address: order.address,
                verificationCode: order.verificationCode,
              });
            }
          }
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
    const interval = setInterval(fetchOrderDetails, 4000);
    return () => clearInterval(interval);
  }, [id, location.state?.item]);

  const item = orderItem || location.state?.item;

  const rawStatus = (item?.status || "Delivered").toLowerCase();
  const displayStatus = ["return pending", "return requested", "returned", "return approved", "picked up"].includes(rawStatus)
    ? "Delivered"
    : (item?.status || "Delivered");

  const isCancelled = displayStatus.toLowerCase() === "cancelled";

  const steps = isCancelled 
    ? [
        {
          title: "Order Placed",
          description: "Your order was successfully registered.",
          icon: CheckCircle2,
        },
        {
          title: "Order Cancelled",
          description: "This order has been cancelled. If any payment was made, your refund will be initiated.",
          icon: XCircle,
        }
      ]
    : defaultSteps;

  const statusMap = {
    "order placed": 0,
    placed: 0,
    confirmed: 1,
    processing: 1,
    packed: 1,
    shipped: 2,
    "partially shipped": 2,
    "out for delivery": 3,
    delivered: 4,
    completed: 4,
  };
  
  const currentStep = isCancelled ? 1 : (statusMap[displayStatus.toLowerCase()] ?? 4);

  if (loading && !item) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200 max-w-6xl mx-auto px-4 py-8">
        <OrderListSkeleton />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        <HelpCircle size={40} className="text-slate-400 mb-3" />
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Order tracking data not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700 cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  const imageUrl = item.image?.startsWith("http") ? item.image : `${backendUrl}/${item.image}`;

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 px-0 sm:px-6 lg:px-8 py-0 sm:py-6 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Zero gap container */}
      <div className="mx-auto max-w-7xl space-y-0 divide-y-0">
        
        {/* Top Header Bar - Borderless & Zero Gap */}
        <div className="bg-white dark:bg-slate-900 rounded-none sm:rounded-2xl p-4 sm:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>Back</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                  Track Order #{String(item.orderNumber || id).slice(-8).toUpperCase()}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  isCancelled ? "bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400" : "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400"
                }`}>
                  {displayStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                Placed on {new Date(item.date || Date.now()).toLocaleDateString("en-IN", { dateStyle: "long" })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/order/${id}`)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer flex items-center gap-1.5"
            >
              <Package size={13} />
              <span>Details</span>
            </button>
            <button
              onClick={() => navigate(`/order/${id}#chat`)}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition cursor-pointer flex items-center gap-1.5"
            >
              <HelpCircle size={13} />
              <span>Support</span>
            </button>
          </div>
        </div>

        {/* 2-Column Layout - Zero Gap */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-start">
          
          {/* LEFT: Shipment Timeline (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-4 sm:p-6 sm:p-8 space-y-5">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-slate-50 tracking-tight">
                Shipment Transit Progress
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                Real-time milestone tracking from our courier network
              </p>
            </div>

            {/* Vertical timeline steps */}
            <div className="relative space-y-6 pt-2">
              
              {/* Connector line */}
              <div className="absolute left-[18px] -translate-x-1/2 top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800 z-0">
                <div 
                  className={`w-full transition-all duration-700 ease-out ${ isCancelled ? "bg-rose-500" : "bg-gradient-to-b from-emerald-500 to-indigo-600" }`} 
                  style={{
                    height: `${(currentStep / (steps.length - 1)) * 100}%`,
                  }}
                />
              </div>

              {steps.map((step, idx) => {
                const StepIcon = step.icon;
                const isCompleted = idx < currentStep;
                const isActive = idx === currentStep;

                let nodeStyleClass = "bg-slate-100 dark:bg-slate-800 text-slate-400";
                if (isCompleted) {
                  nodeStyleClass = "bg-emerald-600 text-white";
                } else if (isActive) {
                  nodeStyleClass = isCancelled && idx === 1 ? "bg-rose-500 text-white" : "bg-indigo-600 text-white";
                }

                return (
                  <div key={idx} className="relative flex gap-4 items-start z-10">
                    
                    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
                      {isActive && (
                        <span className={`absolute h-9 w-9 rounded-full animate-ping pointer-events-none ${ isCancelled && idx === 1 ? "bg-rose-400/20" : "bg-indigo-400/20" }`} />
                      )}
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all shadow-xs ${nodeStyleClass}`}>
                        <StepIcon size={16} className={isActive ? "animate-pulse" : ""} />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 pt-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-xs sm:text-sm font-bold ${ isCompleted || isActive ? (isCancelled && idx === 1 ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-slate-50") : "text-slate-400 dark:text-slate-500" }`}>
                          {step.title}
                        </h3>
                        {isActive && (
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${ isCancelled && idx === 1 ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400" : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" }`}>
                            {isCancelled && idx === 1 ? "Cancelled" : "Current"}
                          </span>
                        )}
                      </div>
                      <p className={`mt-0.5 text-xs leading-relaxed ${ isActive ? "text-slate-600 dark:text-slate-300 font-medium" : "text-slate-400 dark:text-slate-500" }`}>
                        {step.description}
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Logistics & Info (5 Cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-4 sm:p-6 space-y-4">
            
            {/* Status Card */}
            <div className={`p-4 rounded-xl ${ isCancelled ? "bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300" : "bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300" }`}>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-2xs">
                  {isCancelled ? <XCircle size={18} className="text-rose-500" /> : <Calendar size={18} className="text-emerald-500" />}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block leading-tight">Status</span>
                  <span className="text-sm font-black block mt-0.5">{isCancelled ? "Order Cancelled" : displayStatus}</span>
                </div>
              </div>
            </div>

            {/* OTP if available */}
            {item?.verificationCode && displayStatus !== "Delivered" && !isCancelled && (
              <div className="bg-amber-500/10 dark:bg-amber-500/15 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <KeyRound size={16} />
                  <span className="text-xs font-black uppercase tracking-wider">Handover Verification OTP</span>
                </div>
                <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2.5 rounded-lg shadow-2xs">
                  <span className="font-mono font-black text-base tracking-widest text-slate-900 dark:text-white">
                    {item.verificationCode}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(item.verificationCode);
                      toast.success("Verification code copied!");
                    }}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            {/* Purchased Item Info */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 block">Item Summary</span>
              <div className="flex gap-3 items-center">
                <img
                  src={imageUrl}
                  alt={item.name}
                  className="h-14 w-14 object-contain rounded-lg bg-white dark:bg-slate-900 p-1 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">{item.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Qty: {item.qty} · Size: {item.size}
                  </p>
                  <p className="font-black text-xs text-slate-900 dark:text-slate-100 mt-0.5">
                    ₹{(item.price * item.qty).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl space-y-1 text-xs">
              <span className="text-[10px] font-black uppercase text-slate-400 block">Shipping Destination</span>
              <p className="font-bold text-slate-900 dark:text-white">
                {item.address?.street || item.address?.address || "Delivery Address"}, {item.address?.city || ""}, {item.address?.zipcode || item.address?.pincode || ""}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Carrier: {item.courierName || "CartNOW Express Priority"}</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Track;
