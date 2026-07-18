import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
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
  ChevronRight
} from "lucide-react";
import { backendUrl } from "../config";
import { toast } from "react-toastify";

const OrderConfirmed = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [deliveryVerificationKey, setDeliveryVerificationKey] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(`${backendUrl}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setDeliveryVerificationKey(res.data.user.deliveryVerificationKey);
        }
      } catch (err) {
        console.log("FETCH PROFILE ERROR 👉", err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await axios.post(
          `${backendUrl}/api/order/userOrder`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          const foundOrder = res.data.orders.find(
            (o) => String(o._id) === String(orderId)
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

  const handleCopyId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    toast.success("Order ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    const code = order?.verificationCode;
    if (code) {
      navigator.clipboard.writeText(code);
      setCodeCopied(true);
      toast.success("Verification code copied!");
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-955 flex flex-col items-center justify-center transition-colors duration-200">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500 mb-4" />
        <p className="text-sm font-semibold text-slate-505 dark:text-slate-400">Generating order receipt...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-955 flex flex-col items-center justify-center px-4 transition-colors duration-200">
        <HelpCircle size={48} className="text-slate-405 dark:text-slate-500 animate-bounce" />
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-4">Order receipt not found.</p>
        <button
          onClick={() => navigate("/product")}
          className="mt-4 rounded-md bg-[#ff6a00] hover:bg-[#e65c00] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 dark:hover:bg-orange-500 cursor-pointer"
        >
          Browse Store
        </button>
      </div>
    );
  }

  // Calculate Subtotal & Shipping
  const platformFee = 20;
  const shippingFee = order.amount > 519 ? 0 : 40; // Align with place order logic!
  const discount = order.discount || 0;
  const subtotal = Math.max(0, order.amount - shippingFee - platformFee + discount);

  // Expected delivery: 7 days from order date
  const expectedDelivery = new Date(order.createdAt || Date.now());
  expectedDelivery.setDate(expectedDelivery.getDate() + 7);
  const expectedDeliveryStr = expectedDelivery.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const orderDateStr = order.createdAt 
    ? new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  const isDelivered = order.orderStatus === "Delivered";

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-955 px-4 sm:px-6 pt-5 pb-8 text-slate-755 dark:text-slate-300 transition-colors duration-200 flex flex-col justify-start">
      <div className="mx-auto max-w-5xl w-full space-y-4">
        
        {/* SUCCESS HERO BANNER (REPLICATING THE TOP PANEL OF THE MOCKUP IMAGE) */}
        <div className="relative overflow-hidden rounded-md bg-emerald-500/[0.015] dark:bg-emerald-500/[0.04] border border-emerald-500/10 p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-3xs">
          <div className="flex items-center gap-4 text-left">
            {/* Confetti-style success circle */}
            <div className="relative flex h-14 w-14 items-center justify-center shrink-0">
              <span className="absolute h-full w-full rounded-full bg-emerald-500/10 animate-ping opacity-75" />
              <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                <Check size={20} className="stroke-[3.5]" />
              </div>
              {/* Mini Confetti shapes */}
              <div className="absolute top-1 left-1 text-[8px] animate-bounce">🎉</div>
              <div className="absolute bottom-1 right-1 text-[8px] animate-pulse">✨</div>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Order Confirmed!</h1>
                <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-250/15 text-emerald-600 dark:text-emerald-450 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Confirmed
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-semibold leading-relaxed">
                Thank you for your purchase. A receipt email has been sent to{" "}
                <span className="font-extrabold text-slate-800 dark:text-slate-200">{order.address?.email || "sachin@gmail.com"}</span>
              </p>
            </div>
          </div>

          {/* EST Delivery and Order ID cards */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Est Delivery card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-2 flex items-center gap-2.5 w-36 shadow-3xs text-left">
              <div className="h-7 w-7 rounded-sm bg-blue-500/5 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                <Calendar size={13} className="stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block leading-none">Est. Delivery</span>
                <span className="text-[11px] font-black text-slate-900 dark:text-white block mt-1">{expectedDeliveryStr}</span>
              </div>
            </div>

            {/* Order ID card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-2 flex items-center gap-2.5 w-36 shadow-3xs text-left">
              <div className="h-7 w-7 rounded-sm bg-blue-500/5 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                <FileText size={13} className="stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block leading-none">Order ID</span>
                <span className="text-[11px] font-black text-slate-900 dark:text-white block mt-1 truncate">{orderId.substring(orderId.length - 8)}</span>
              </div>
              <button
                onClick={handleCopyId}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition shrink-0 cursor-pointer"
                title="Copy Order ID"
              >
                {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
              </button>
            </div>
          </div>
        </div>

        {/* DOUBLE COLUMN GRID LAYOUT */}
        <div className="grid gap-4 lg:grid-cols-[1fr_360px] items-stretch">
          
          {/* LEFT COLUMN: Items purchased container card & CTA actions */}
          <div className="space-y-4 flex flex-col justify-between">
            
            {/* PURCHASED ITEMS CONTAINER */}
            <div className="flex-1 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-3xs space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
                <h3 className="text-[10px] uppercase tracking-wider text-slate-805 dark:text-white font-black">
                  Items Purchased ({order.items?.length || 0})
                </h3>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1.5">
                  <Calendar size={11} className="text-slate-400" />
                  {orderDateStr}
                </span>
              </div>
              
              {/* Scrollable list constraint */}
              <div 
                className="space-y-4 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar" 
                data-lenis-prevent
              >
                {order.items?.map((item, idx) => (
                  <div
                    key={`${item.productId || item.name}-${item.size}-${idx}`}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-50 dark:border-slate-850/80 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex gap-3 text-left">
                      <div className="h-16 w-16 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 p-1.5 flex items-center justify-center shrink-0 shadow-2xs">
                        <img
                          src={item.image?.startsWith("http") ? item.image : `${backendUrl}/${item.image}`}
                          alt={item.name}
                          className="h-12 w-12 rounded-sm object-contain bg-white dark:bg-slate-900"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-xs text-slate-900 dark:text-white leading-snug truncate max-w-[200px] sm:max-w-xs">{item.name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold leading-none">
                          Qty: {item.qty} • Size: {item.size}
                        </p>
                        
                        {/* Warranty badge exactly as depicted in the mockup */}
                        <div className="mt-2.5">
                          <span className="inline-flex items-center gap-1 bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08] text-emerald-650 border border-emerald-500/10 text-[9px] font-bold px-2 py-0.5 rounded">
                            <ShieldCheck size={10} className="text-emerald-500" />
                            1 Year Warranty
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Price and Tracking button aligned side by side on right */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 self-stretch sm:self-auto shrink-0 border-t border-slate-50 sm:border-0 pt-2 sm:pt-0">
                      <span className="font-black text-sm text-slate-900 dark:text-white">₹{(item.price * item.qty).toLocaleString("en-IN")}</span>
                      
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
                        className="inline-flex items-center gap-1 border border-orange-500 hover:bg-orange-500/5 text-orange-500 px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-wider transition cursor-pointer active:scale-95 animate-none"
                      >
                        <span>Track Order</span>
                        <ChevronRight size={10} className="stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTION QUICK BUTTONS (AS DESIGNED IN THE MOCKUP) */}
            <div className="flex gap-4 mt-1 shrink-0">
              <button
                onClick={() => navigate(`/order/${orderId}`)}
                className="flex-1 rounded-md bg-[#ff6a00] hover:bg-[#e65c00] py-3.5 text-xs font-black text-white uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition cursor-pointer"
              >
                <MessageSquare size={13} className="stroke-[2.5]" />
                <span>View Details & Chat</span>
                <ArrowRight size={13} className="stroke-[2.5]" />
              </button>
              
              <button
                onClick={() => navigate("/product")}
                className="flex-1 rounded-md border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 py-3.5 text-xs font-black text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 shadow-3xs hover:bg-slate-50 dark:hover:bg-slate-850 active:scale-98 transition cursor-pointer"
              >
                <ShoppingBag size={13} className="stroke-[2.5]" />
                <span>Continue Shopping</span>
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: Consolidated receipt split panel */}
          <div className="space-y-4">
            
            {/* CONSOLIDATED BILLING & DETAILS CARD */}
            <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-3xs space-y-4 text-left">
              
              {/* Receipt Summary */}
              <div className="space-y-2.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <h3 className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-550 font-black border-b border-slate-100 dark:border-slate-850 pb-2 mb-2 flex items-center gap-1.5">
                  <FileText size={12} className="text-orange-500 stroke-[2.5]" />
                  Receipt Summary
                </h3>
                
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-900 dark:text-white font-extrabold">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount</span>
                    <span>- ₹{discount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Delivery</span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-650 font-black text-[9px] uppercase tracking-wider">FREE</span>
                  ) : (
                    <span className="text-slate-900 dark:text-white font-extrabold">₹{shippingFee}</span>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <span>Platform Fee</span>
                  <span className="text-slate-900 dark:text-white font-extrabold">₹{platformFee}</span>
                </div>
                
                <div className="border-t border-slate-100 dark:border-slate-850 my-2 pt-2.5 flex justify-between items-baseline">
                  <div>
                    <span className="text-[11px] font-black text-slate-905 dark:text-white">Total Paid</span>
                    <span className="text-[8px] text-slate-400 block font-semibold leading-none mt-0.5">(All Taxes Included)</span>
                  </div>
                  <span className="text-base font-black text-[#ff6a00] tracking-tight">₹{order.amount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Delivery Address & Payment Method Split view */}
              <div className="border-t border-slate-100 dark:border-slate-850 pt-3.5 space-y-3.5">
                <div className="grid grid-cols-2 gap-3 text-[10px]">
                  
                  {/* Shipping Address split view */}
                  <div className="space-y-1 text-[9px]">
                    <span className="font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1 mb-1.5">
                      <MapPin size={10} className="text-slate-400" />
                      Deliver to
                    </span>
                    <div className="text-slate-600 dark:text-slate-400 font-semibold leading-tight space-y-0.5 text-[9px]">
                      <p className="font-extrabold text-slate-900 dark:text-white truncate max-w-[130px]">{order.address?.firstName} {order.address?.lastName}</p>
                      <p className="truncate max-w-[130px]">{order.address?.street}</p>
                      <p className="truncate max-w-[130px]">{order.address?.city}, {order.address?.state}</p>
                      <button 
                        type="button" 
                        onClick={() => navigate(`/order/${orderId}`)}
                        className="text-blue-500 hover:text-blue-650 hover:underline font-extrabold mt-1 block flex items-center gap-0.5"
                      >
                        <span>View Address</span>
                        <ChevronRight size={8} />
                      </button>
                    </div>
                  </div>

                  {/* Payment split view */}
                  <div className="space-y-1 text-[9px]">
                    <span className="font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1 mb-1.5">
                      <CreditCard size={10} className="text-slate-400" />
                      Payment
                    </span>
                    <div className="text-slate-605 dark:text-slate-400 font-semibold leading-tight text-[9px]">
                      <p className="font-extrabold text-slate-900 dark:text-white capitalize">{order.paymentMethod === "cod" ? "Cash On Delivery" : order.paymentMethod}</p>
                      <span className={`inline-block mt-1 px-1.5 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-wide border ${ order.paymentStatus === "paid" ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-450" : "bg-orange-55 dark:bg-orange-950/30 border-orange-100 dark:border-orange-900/50 text-orange-600 dark:text-orange-450" }`}>
                        {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* GURANTEED PURCHASE TRUST CONTAINER */}
            <div className="rounded-md border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-3xs text-left">
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <ShieldCheck size={15} className="text-emerald-500 shrink-0 stroke-[2.5]" />
                <span className="text-[10px] font-black text-slate-905 dark:text-white uppercase tracking-wider">Guaranteed Purchase</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-[9px] font-semibold text-slate-505 dark:text-slate-400 mt-3 pt-1">
                {/* Insured Delivery */}
                <div className="flex items-start gap-2.5">
                  <div className="h-7 w-7 rounded bg-slate-50 dark:bg-slate-955 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-850">
                    <Truck size={13} className="text-slate-500 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="font-black text-slate-900 dark:text-white block">Insured Delivery</span>
                    <span className="text-slate-400 block mt-0.5 leading-tight font-semibold">Your order is safe and insured</span>
                  </div>
                </div>

                {/* 30-day Returns */}
                <div className="flex items-start gap-2.5">
                  <div className="h-7 w-7 rounded bg-slate-50 dark:bg-slate-955 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-850">
                    <RotateCcw size={13} className="text-slate-500 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="font-black text-slate-900 dark:text-white block">30-Day Returns</span>
                    <span className="text-slate-400 block mt-0.5 leading-tight font-semibold">Easy returns within 30 days</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM THANKS CARD WITH CUSTOM ILLUSTRATED BAG (MATCHING MOCKUP ACCENTS) */}
        <div className="relative overflow-hidden rounded-md bg-amber-500/[0.015] dark:bg-amber-500/[0.03] border border-amber-500/5 p-4 flex items-center justify-between shadow-3xs w-full text-left gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 text-amber-500">
              <span className="text-base">👑</span>
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">Thanks for shopping with us!</h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold leading-none mt-1">
                We appreciate your trust and look forward to serving you again.
              </p>
            </div>
          </div>

          {/* Cute custom shopping bag vector from mockup */}
          <div className="relative h-12 w-14 shrink-0 overflow-visible hidden sm:block">
            {/* Inline SVG rendering exactly the mockup's illustrated shopping bag */}
            <svg viewBox="0 0 100 100" className="h-full w-full">
              {/* Confetti details */}
              <circle cx="15" cy="20" r="3" fill="#f43f5e" className="animate-pulse" />
              <circle cx="85" cy="25" r="2.5" fill="#eab308" className="animate-ping" />
              <rect x="25" y="10" width="3" height="3" fill="#a855f7" transform="rotate(45)" />
              
              {/* Bag Body */}
              <path d="M30 40 L70 40 L75 90 L25 90 Z" fill="#fed7aa" />
              
              {/* Heart logo */}
              <path d="M50 70 C45 65 42 62 42 58 C42 55 45 52 48 52 C50 52 52 54 53 56 C54 54 56 52 58 52 C61 52 64 55 64 58 C64 62 61 65 56 70 Z" fill="#ef4444" />
              
              {/* Handles */}
              <path d="M40 40 C40 25 60 25 60 40" fill="none" stroke="#fdba74" strokeWidth="4" />
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderConfirmed;
