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
  AlarmClock
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center transition-colors duration-200">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-900 dark:border-slate-100 border-t-transparent" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-4">Generating order receipt...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-4 transition-colors duration-200">
        <HelpCircle size={48} className="text-slate-400 dark:text-slate-500 animate-bounce" />
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-4">Order receipt not found.</p>
        <button
          onClick={() => navigate("/product")}
          className="mt-4 rounded-xl bg-slate-900 dark:bg-orange-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 dark:hover:bg-orange-500 cursor-pointer"
        >
          Browse Store
        </button>
      </div>
    );
  }

  // Calculate Subtotal & Shipping
  const shippingFee = 10;
  const subtotal = order.amount - shippingFee;

  // Expected delivery: 7 days from order date
  const expectedDelivery = new Date(order.createdAt || Date.now());
  expectedDelivery.setDate(expectedDelivery.getDate() + 7);
  const expectedDeliveryStr = expectedDelivery.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const isDelivered = order.orderStatus === "Delivered";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* SUCCESS HERO BANNER CARD */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 dark:bg-slate-900/40 p-8 text-center text-white shadow-xl sm:p-10 border border-transparent dark:border-slate-800/80">
          {/* Subtle abstract lights */}
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute left-10 bottom-0 h-40 w-40 rounded-full bg-teal-500/5 blur-3xl pointer-events-none" />
          
          <div className="relative flex flex-col items-center space-y-5">
            {/* Pulsing circular checkmark */}
            <div className="relative flex h-20 w-20 items-center justify-center">
              <span className="absolute h-full w-full rounded-full bg-emerald-500/20 animate-ping opacity-75" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md">
                <CheckCircle2 size={32} />
              </div>
            </div>
            
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                <Sparkles size={10} />
                <span>Purchase Confirmed</span>
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Thank you for your order!</h1>
              <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                Your order is registered and has been dispatched to our logistics pipeline. A copy of your receipt has been sent to your email.
              </p>
            </div>

            {/* Reference ID copy pill */}
            <div className="flex items-center gap-2 rounded-full border border-slate-800 dark:border-slate-700 bg-slate-900/60 dark:bg-slate-950/60 px-4 py-2 text-xs font-semibold text-slate-300">
              <span>Order ID:</span>
              <span className="font-mono text-slate-105 font-bold">{orderId}</span>
              <button
                onClick={handleCopyId}
                className="text-slate-400 hover:text-slate-200 transition ml-1 cursor-pointer"
                title="Copy Order ID"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* DOUBLE COLUMN LAYOUT */}
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] items-start">
          
          {/* LEFT COLUMN: Items purchased */}
          <div className="space-y-6">
                      {/* PURCHASED ITEMS */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-sm dark:shadow-slate-950/20 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 font-black">
                  Items Purchased ({order.items?.length || 0})
                </h3>
                <span className="text-xs text-slate-400 dark:text-slate-400 font-bold">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Today"}
                </span>
              </div>
              
              <div className="space-y-4">
                {order.items?.map((item, idx) => (
                  <div
                    key={`${item.productId || item.name}-${item.size}-${idx}`}
                    className="group flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0 last:pb-0 transition-all"
                  >
                    <div className="flex gap-4">
                      <img
                        src={item.image?.startsWith("http") ? item.image : `${backendUrl}/${item.image}`}
                        alt={item.name}
                        className="h-16 w-16 rounded-xl object-contain bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-2 transition duration-300 group-hover:scale-105"
                      />
                      <div className="min-w-0">
                        <p className="font-extrabold text-sm text-slate-900 dark:text-slate-100 truncate max-w-xs sm:max-w-md">{item.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                          Qty: {item.qty} · Size: <span className="font-bold">{item.size}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-sm text-slate-900 dark:text-slate-100">₹{item.price * item.qty}</span>
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
                        className="group/btn inline-flex items-center gap-1 rounded-xl bg-slate-950 dark:bg-orange-600 hover:bg-slate-800 dark:hover:bg-orange-500 text-white px-4 py-2.5 text-xs font-bold transition shadow-sm cursor-pointer"
                      >
                        <span>Track</span>
                        <ArrowRight size={12} className="transition-transform group-hover/btn:translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTAS QUICK ACTIONS */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate("/orderdetail")}
                className="flex-1 rounded-2xl bg-slate-950 dark:bg-orange-605 py-4 text-sm font-bold text-white transition hover:bg-slate-800 dark:hover:bg-orange-500 active:scale-98 shadow cursor-pointer"
              >
                Go to Order History
              </button>
              
              <button
                onClick={() => navigate("/product")}
                className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 transition hover:border-slate-350 dark:hover:border-slate-700 active:scale-98 shadow-sm cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: Invoice Receipt breakdown */}
          <div className="space-y-6">
            
            {/* PRICING BREAKDOWN */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-sm dark:shadow-slate-950/20 space-y-4">
              <h3 className="text-xs uppercase tracking-wider text-slate-405 dark:text-slate-500 font-black border-b border-slate-100 dark:border-slate-800 pb-3">
                Receipt Summary
              </h3>
              <div className="space-y-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-900 dark:text-slate-100 font-bold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="text-slate-900 dark:text-slate-100 font-bold">₹{shippingFee}</span>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 my-4" />
                <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-slate-100">
                  <span>Total paid</span>
                  <span className="text-lg font-black text-slate-950 dark:text-slate-50">₹{order.amount}</span>
                </div>
              </div>
            </div>

            {/* SHIPPING & PAYMENT INFO */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-sm dark:shadow-slate-950/20 space-y-6">
              
              {/* Shipping Address */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                  <MapPin size={16} />
                  <h4 className="text-[10px] font-black uppercase tracking-wider">Shipping Address</h4>
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1 leading-relaxed font-semibold">
                  <p className="text-slate-900 dark:text-slate-100 font-black">
                    {order.address?.firstName} {order.address?.lastName}
                  </p>
                  <p>{order.address?.street}</p>
                  <p>
                    {order.address?.city}, {order.address?.state} - {order.address?.phone}
                  </p>
                  <p className="text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[9px]">{order.address?.country}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-805 pt-5 space-y-3.5">
                {/* Payment Method */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                    <CreditCard size={16} />
                    <h4 className="text-[10px] font-black uppercase tracking-wider">Payment Method</h4>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-200 capitalize">{order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${
                      order.paymentStatus === "paid" 
                        ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400" 
                        : "bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50 text-amber-700 dark:text-amber-400"
                    }`}>
                      {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* DELIVERY VERIFICATION CODE CARD */}
            {order.verificationCode && (
              <div className="rounded-3xl border-2 border-amber-200 dark:border-amber-800/50 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <KeyRound size={18} className="text-amber-600 dark:text-amber-400" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">User Secret Key for Delivery</h4>
                </div>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed font-semibold">
                  Share this unique secret key with your delivery agent when your order arrives. It is required to verify and complete your delivery.
                </p>
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-800/50 px-5 py-3.5 shadow-inner">
                  <span className="font-mono text-2xl font-black tracking-[0.3em] text-amber-700 dark:text-amber-300 select-all">
                    {order.verificationCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    title="Copy secret key"
                    className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition font-bold text-xs cursor-pointer"
                  >
                    {codeCopied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                    {codeCopied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="text-[10px] text-amber-600 dark:text-amber-500 font-semibold flex items-center gap-1">
                  <ShieldCheck size={11} />
                  Do not share this secret key until your package is in hand.
                </p>
              </div>
            )}

            {/* EXPECTED DELIVERY DATE */}
            {!isDelivered && (
              <div className="rounded-3xl border border-indigo-200 dark:border-indigo-800/50 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 p-5 shadow-sm space-y-2">
                <div className="flex items-center gap-2">
                  <AlarmClock size={17} className="text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-800 dark:text-indigo-300">Expected Delivery</h4>
                </div>
                <p className="text-base font-black text-indigo-700 dark:text-indigo-200 leading-tight">
                  {expectedDeliveryStr}
                </p>
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                  Guaranteed within 7 days of order placement.
                </p>
              </div>
            )}

            {/* TRUST CERTIFICATIONS */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-sm dark:shadow-slate-950/20 space-y-4">
              <div className="flex items-center gap-3 text-slate-705 dark:text-slate-300">
                <ShieldCheck size={18} className="text-slate-900 dark:text-slate-100" />
                <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">Guaranteed Purchase</span>
              </div>
              <div className="grid gap-3 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-slate-400 dark:text-slate-500" />
                  <span>Free Insured Shipping Applied</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400 dark:text-slate-500" />
                  <span>30-Day Easy Returns Available</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default OrderConfirmed;
