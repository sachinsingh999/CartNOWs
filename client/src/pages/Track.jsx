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
  XCircle
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

  const [copied, setCopied] = useState(false);

  if (loading && !item) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200 max-w-6xl mx-auto px-4 py-12">
        <OrderListSkeleton />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        <HelpCircle size={48} className="text-slate-400 dark:text-slate-500 animate-bounce" />
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-4">Order tracking data not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 rounded-xl bg-slate-900 dark:bg-orange-600 px-5 py-2.5 text-xs font-bold text-slate-100 dark:text-white transition hover:bg-slate-800 dark:hover:bg-orange-500 cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    toast.success("Order ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getEstimatedDate = () => {
    // Generate a mock delivery date 3 days after today's date for display
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    return deliveryDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const imageUrl = item.image?.startsWith("http") ? item.image : `${backendUrl}/${item.image}`;  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-8 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Top Full-Width Navigation & Header Bar */}
        <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="group inline-flex items-center gap-2 rounded-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 transition hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-950 dark:hover:text-slate-100 cursor-pointer"
            >
              <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-1" />
              <span>Back</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                  Track Order #{String(item.orderNumber || id).slice(-8).toUpperCase()}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-wider ${
                  isCancelled ? "bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50" : "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50"
                }`}>
                  {displayStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Placed on {new Date(item.date || Date.now()).toLocaleDateString(undefined, { dateStyle: "long" })} · Order ID: <span className="font-mono">{id}</span>
              </p>
            </div>
          </div>

          {/* Quick Header Actions Suite */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/order/${id}`)}
              className="px-3.5 py-2 rounded-sm bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer flex items-center gap-1.5"
            >
              <Package size={13} />
              <span>Order Details</span>
            </button>
            <button
              onClick={() => navigate(`/order/${id}#chat`)}
              className="px-3.5 py-2 rounded-sm bg-indigo-50 dark:bg-indigo-950/40 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition cursor-pointer flex items-center gap-1.5"
            >
              <HelpCircle size={13} />
              <span>Support Chat</span>
            </button>
          </div>
        </div>

        {/* 2-COLUMN FULL-WIDTH LAYOUT */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          
          {/* LEFT SIDE: Shipment Timeline (7 Cols) */}
          <div className="lg:col-span-7 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-50 tracking-tight">
                Shipment Transit Progress
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Real-time status updates from our logistics network
              </p>
            </div>

            {/* Vertical timeline steps */}
            <div className="relative space-y-8 pt-2">
              
              {/* Timeline Connector Line */}
              <div className="absolute left-[20px] -translate-x-1/2 top-5 bottom-5 w-0.5 bg-slate-100 dark:bg-slate-800 z-0">
                <div 
                  className={`w-full transition-all duration-700 ease-out ${ isCancelled ? "bg-rose-500" : "bg-gradient-to-b from-orange-500 to-amber-500" }`} 
                  style={{
                    height: `${(currentStep / (steps.length - 1)) * 100}%`,
                  }}
                />
              </div>

              {steps.map((step, idx) => {
                const StepIcon = step.icon;
                const isCompleted = idx < currentStep;
                const isActive = idx === currentStep;

                let nodeStyleClass = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600";
                if (isCompleted) {
                  nodeStyleClass = "bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100 text-white dark:text-slate-900";
                } else if (isActive) {
                  if (isCancelled && idx === 1) {
                    nodeStyleClass = "bg-rose-500 border-rose-500 text-white scale-105 shadow-xs shadow-rose-500/30";
                  } else {
                    nodeStyleClass = "bg-white dark:bg-slate-900 border-orange-500 text-orange-600 dark:text-orange-400 scale-105";
                  }
                }

                return (
                  <div key={idx} className="relative flex gap-5 items-start z-10">
                    
                    {/* Node circle */}
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                      {isActive && (
                        <span className={`absolute h-10 w-10 rounded-full animate-ping pointer-events-none ${ isCancelled && idx === 1 ? "bg-rose-400/20" : "bg-orange-400/20" }`} />
                      )}
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-sm border-2 transition-all duration-300 shadow-xs ${nodeStyleClass}`}
                      >
                        <StepIcon size={18} className={isActive ? "animate-pulse" : ""} />
                      </div>
                    </div>

                    {/* Step details */}
                    <div className="min-w-0 flex-1 pt-1.5">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm font-bold ${ isCompleted || isActive ? (isCancelled && idx === 1 ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-slate-50") : "text-slate-400 dark:text-slate-500" }`}>
                          {step.title}
                        </h3>
                        {isActive && (
                          <span className={`rounded-sm px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${ isCancelled && idx === 1 ? "bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400" : "bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/50 text-orange-600 dark:text-orange-400" }`}>
                            {isCancelled && idx === 1 ? "Cancelled" : "Active Stage"}
                          </span>
                        )}
                      </div>
                      <p className={`mt-1 text-xs leading-relaxed ${ isActive ? "text-slate-600 dark:text-slate-300 font-medium" : "text-slate-400 dark:text-slate-500" }`}>
                        {step.description}
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT SIDE: Information & Logistics Intelligence (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Dynamic Status Banner Card */}
            <div className={`rounded-md border p-5 shadow-xs ${ isCancelled ? "border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/10" : "border-orange-200 dark:border-orange-900/50 bg-orange-50/30 dark:bg-orange-950/10" }`}>
              <div className="flex items-center gap-3.5">
                <div className={`flex h-11 w-11 items-center justify-center rounded-sm shadow-xs ${ isCancelled ? "bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400" : "bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400" }`}>
                  {isCancelled ? (
                    <XCircle size={20} />
                  ) : (
                    <Calendar size={20} />
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    {isCancelled ? "Order Status" : "Current Status"}
                  </p>
                  <p className={`text-base font-black mt-0.5 ${ isCancelled ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-slate-50" }`}>
                    {isCancelled ? "Cancelled" : displayStatus}
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Verification OTP Card */}
            {item?.verificationCode && displayStatus !== "Delivered" && !isCancelled && (
              <div className="rounded-md border border-amber-200 dark:border-amber-900 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    <KeyRound size={18} className="animate-pulse" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                      Delivery Verification OTP
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                      Share this code with the delivery associate to confirm receipt.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-amber-500/20 rounded-sm px-4 py-2.5">
                  <span className="font-mono font-black text-lg tracking-widest text-amber-700 dark:text-amber-300">
                    {item.verificationCode}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(item.verificationCode);
                      toast.success("Verification code copied!");
                    }}
                    className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-sm bg-amber-500 hover:bg-amber-600 active:scale-95 text-white transition cursor-pointer shadow-xs"
                  >
                    <Copy size={11} />
                    <span>Copy</span>
                  </button>
                </div>
              </div>
            )}

            {/* Product Item Details Card */}
            <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Purchased Item</h3>
              <div className="flex gap-4 items-center">
                <img
                  src={imageUrl}
                  alt={item.name}
                  className="h-16 w-16 object-contain rounded-sm bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-1.5 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 truncate">{item.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">
                    Qty: {item.qty} · Size: <span className="font-bold">{item.size}</span>
                  </p>
                  <p className="font-black text-sm text-slate-900 dark:text-slate-100 mt-1">
                    ₹{(item.price * item.qty).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>

            {/* Logistics & Address Summary Card */}
            <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Delivery Logistics
              </h3>
              
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <p className="text-slate-400 dark:text-slate-400 font-semibold">
                    Logistics Partner
                  </p>
                  <p className="font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                    {item.courierName || "CartNOW Express"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 dark:text-slate-400 font-semibold">
                    Shipping Method
                  </p>
                  <p className="font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                    Priority Shipping
                  </p>
                </div>

                <div className="col-span-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <p className="text-slate-400 dark:text-slate-400 font-semibold">Delivery Address</p>
                  <p className="font-bold text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                    {item.address?.street || item.address?.address || "123, Shopping Avenue"}, {item.address?.city || "New Delhi"}, {item.address?.zipcode || item.address?.pincode || "110001"}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Track;
